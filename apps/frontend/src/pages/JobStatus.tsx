import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import LogViewer from '../components/LogViewer';
import { jobService, Job } from '../services/api';
import { websocketService } from '../services/websocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function JobStatus() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        const jobData = await jobService.getJob(id);
        setJob(jobData);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch job');
        setLoading(false);
      }
    };

    fetchJob();
    websocketService.connect();

    const handleJobUpdate = (data: any) => {
      if (data.jobId === id) {
        setJob(prevJob => prevJob ? { ...prevJob, ...data, id: data.jobId } : null);
      }
    };

    websocketService.on('job:update', handleJobUpdate);

    return () => {
      websocketService.off('job:update', handleJobUpdate);
    };
  }, [id]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'FAILED': return 'destructive';
      case 'RUNNING': return 'warning';
      case 'PENDING': return 'pending';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return '⏳';
      case 'RUNNING': return '▶️';
      case 'COMPLETED': return '✅';
      case 'FAILED': return '❌';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
            {error || 'Job not found'}
          </div>
          <div className="mt-4 flex gap-2">
            <Link to="/">
              <Button variant="outline">← All Jobs</Button>
            </Link>
            <Link to="/submit">
              <Button>Submit New Job</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 max-w-full mx-auto">
      {/* Header & Quick Stats */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between w-full">
        <div className="space-y-3 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase transition-all">Job Status</h1>
            <Badge variant={getStatusVariant(job.status) as any} className="px-4 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/10 w-fit">
              <span className="mr-2 text-base sm:text-lg">{getStatusIcon(job.status) as any}</span>
              {job.status}
            </Badge>
          </div>
          <p className="text-[10px] sm:text-sm font-mono text-muted-foreground/60 font-bold bg-muted/30 px-3 py-1 rounded-lg inline-block border border-border/20 truncate max-w-full">
            UUID: {job.id}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Link to="/" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full sm:w-auto font-bold rounded-xl border-border/40 hover:bg-muted/50 text-xs sm:text-sm">
              ← QUEUE
            </Button>
          </Link>
          <Link to="/submit" className="flex-1 sm:flex-none">
            <Button className="w-full sm:w-auto font-bold rounded-xl shadow-lg shadow-primary/20 text-xs sm:text-sm">
              SUBMIT NEW
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column - Code & Logs (8 cols) */}
        <div className="lg:col-span-8 space-y-6 lg:space-y-8 order-2 lg:order-1">
          {/* Result / Error Notification */}
          {job.status === 'COMPLETED' && job.result !== undefined && (
            <Card className="border-green-500/20 bg-green-500/5 backdrop-blur-sm shadow-xl shadow-green-500/5 animate-in zoom-in-95 duration-300">
              <CardHeader className="pb-3 border-b border-green-500/10">
                <CardTitle className="text-sm sm:text-lg font-black text-green-500 tracking-widest uppercase">
                  ✅ EXECUTION SUCCESSFUL
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <pre className="bg-background/40 p-4 sm:p-6 rounded-2xl overflow-x-auto text-xs sm:text-sm font-mono border border-green-500/10 shadow-inner custom-scrollbar">
                  <code className="text-green-600 dark:text-green-400 font-bold">{JSON.stringify(job.result, null, 2)}</code>
                </pre>
              </CardContent>
            </Card>
          )}

          {job.status === 'FAILED' && job.error && (
            <Card className="border-destructive/20 bg-destructive/5 backdrop-blur-sm shadow-xl shadow-destructive/5 animate-in shake duration-500">
              <CardHeader className="pb-3 border-b border-destructive/10">
                <CardTitle className="text-sm sm:text-lg font-black text-destructive tracking-widest uppercase text-destructive">
                  ❌ EXECUTION FAILED
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <pre className="bg-background/40 p-4 sm:p-6 rounded-2xl overflow-x-auto text-xs sm:text-sm font-mono border border-destructive/10 text-destructive shadow-inner font-bold custom-scrollbar">
                  <code>{job.error}</code>
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Source Code */}
          <Card className="border-border/40 bg-card/90 dark:bg-card/50 backdrop-blur-md">
            <CardHeader className="pb-4 border-b border-border/10">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Source Payload</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <pre className="p-4 sm:p-6 overflow-x-auto text-xs sm:text-sm font-mono bg-muted/30 dark:bg-muted/20 custom-scrollbar">
                <code className="grid gap-1">
                  {job.code.split('\n').map((line, i) => (
                    <div key={i} className="flex gap-3 sm:gap-4 group">
                      <span className="w-6 sm:w-8 shrink-0 text-muted-foreground/30 text-right select-none group-hover:text-primary transition-colors text-[10px] sm:text-xs">{i + 1}</span>
                      <span className="text-foreground/90 whitespace-pre">{line}</span>
                    </div>
                  ))}
                </code>
              </pre>
            </CardContent>
          </Card>

          {/* Logs */}
          <Card className="border-border/40 bg-black shadow-2xl overflow-hidden border-2 border-primary/10">
            <CardHeader className="bg-primary/5 py-4 border-b border-primary/10">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Runtime Telemetry</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <LogViewer logs={job.logs || ''} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Metadata & Arguments (4 cols) */}
        <div className="lg:col-span-4 space-y-6 lg:space-y-8 lg:sticky lg:top-24 order-1 lg:order-2">
          <Card className="border-border/40 bg-card/90 dark:bg-card/50 backdrop-blur-md overflow-hidden shadow-2xl shadow-primary/10 dark:shadow-none">
            <CardHeader className="pb-4 border-b border-border/10 bg-muted/20">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Execution Metadata</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <dl className="space-y-6">
                <div className="flex justify-between items-center group">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 group-hover:text-primary/50 transition-colors">Queue Position</dt>
                  <dd className="text-[10px] sm:text-xs font-bold bg-muted/50 px-2 py-0.5 rounded border border-border/20">PRIORITY-1</dd>
                </div>
                <div className="space-y-1 group">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 group-hover:text-primary/50 transition-colors">Timestamp</dt>
                  <dd className="text-xs sm:text-sm font-bold">{new Date(job.createdAt).toLocaleString()}</dd>
                </div>
                {job.executionTime && (
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-center animate-in zoom-in duration-300">
                    <dt className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">Total Duration</dt>
                    <dd className="text-xl sm:text-2xl font-black tracking-tighter text-primary italic">{job.executionTime}ms</dd>
                  </div>
                )}
                {job.startedAt && (
                  <div className="space-y-1 group">
                    <dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 group-hover:text-primary/50 transition-colors">Dispatched At</dt>
                    <dd className="text-[10px] sm:text-xs font-medium text-muted-foreground">{new Date(job.startedAt).toLocaleTimeString()}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/90 dark:bg-card/50 backdrop-blur-md shadow-2xl shadow-primary/10 dark:shadow-none">
            <CardHeader className="pb-4 border-b border-border/10">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Function Arguments</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <pre className="bg-muted/30 dark:bg-muted/30 p-4 rounded-xl text-[10px] sm:text-xs font-mono border border-border/20 overflow-x-auto custom-scrollbar">
                <code>{JSON.stringify(job.args, null, 2)}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
