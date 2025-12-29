import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jobService, Job } from '../services/api';
import { websocketService } from '../services/websocket';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function JobList() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [purging, setPurging] = useState(false);

  const fetchJobs = async () => {
    try {
      const statusParam = statusFilter === 'ALL' ? undefined : statusFilter;
      const response = await jobService.getJobs(page, 10, statusParam);
      setJobs(response.jobs);
      setTotalPages(response.pages);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch jobs');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    websocketService.connect();

    const handleJobUpdate = (data: any) => {
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === data.jobId
            ? { ...job, ...data, id: data.jobId }
            : job
        )
      );
    };

    websocketService.on('job:update', handleJobUpdate);

    return () => {
      websocketService.off('job:update', handleJobUpdate);
    };
  }, [page, statusFilter]);

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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  const handlePurge = async () => {
    if (!window.confirm('Are you absolutely sure? This will delete all jobs from history.')) return;
    try {
      setPurging(true);
      await jobService.purgeJobs();
      setJobs([]);
      setPage(1);
      setPurging(false);
    } catch (err: any) {
      setError('Failed to purge jobs');
      setPurging(false);
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <Card className="border-border/40 bg-card/90 dark:bg-card/50 backdrop-blur-md shadow-2xl shadow-primary/10 dark:shadow-primary/5 mx-auto max-w-full">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 sm:pb-8">
        <div className="space-y-1.5 w-full sm:w-auto">
          <CardTitle className="text-2xl sm:text-3xl font-black tracking-tighter">Jobs</CardTitle>
          <CardDescription className="text-sm sm:text-base font-medium">
            Manage and monitor your distributed tasks
            {loading && <span className="text-primary animate-pulse ml-2 font-bold inline-block">• Synchronizing...</span>}
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-muted/50 border border-border/40 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none hover:bg-muted transition-colors cursor-pointer appearance-none min-w-[120px]"
          >
            <option value="ALL">ALL STATUS</option>
            <option value="PENDING">PENDING</option>
            <option value="RUNNING">RUNNING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="FAILED">FAILED</option>
          </select>

          <Button
            variant="destructive"
            size="sm"
            onClick={handlePurge}
            disabled={purging || jobs.length === 0}
            className="font-bold rounded-xl opacity-60 hover:opacity-100 transition-opacity"
          >
            {purging ? 'PURGING...' : 'PURGE ALL'}
          </Button>

          <Link to="/submit" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95">
              + Submit New Job
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:px-6">
        {jobs.length === 0 ? (
          <div className="text-center py-16 sm:py-32 px-4 animate-in fade-in zoom-in duration-500">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/5 border border-primary/10 mb-8 relative">
              <span className="text-5xl animate-bounce">🚀</span>
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse scale-125 opacity-20" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black mb-4 tracking-tight uppercase">No Jobs Dispatched</h3>
            <p className="text-base text-muted-foreground mb-10 max-w-[500px] mx-auto font-medium leading-relaxed">
              Your distributed execution engine is idle and awaiting instructions.
              {statusFilter !== 'ALL' ? ` No jobs currently match the "${statusFilter}" status filter.` : ' Submit your first payload to ignite the worker pool.'}
            </p>
            <Link to="/submit">
              <Button size="lg" className="h-14 px-10 rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 hover:scale-105 transition-all">
                LAUNCH NEW TASK
              </Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/40 bg-background overflow-hidden shadow-inner shadow-muted/5">
            <div className="overflow-x-auto custom-scrollbar">
              <Table className="min-w-[800px] lg:min-w-full">
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-b border-border/30">
                    <TableHead className="py-5 pl-6 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">Status</TableHead>
                    <TableHead className="py-5 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">Job Identity</TableHead>
                    <TableHead className="py-5 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">Timeline</TableHead>
                    <TableHead className="py-5 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">Runtime</TableHead>
                    <TableHead className="py-5 pr-6 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">Execution Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow
                      key={job.id}
                      onClick={() => navigate(`/job/${job.id}`)}
                      className="group cursor-pointer hover:bg-muted/20 transition-all duration-200 border-b border-border/20 last:border-0"
                    >
                      <TableCell className="py-5 pl-6">
                        <Badge variant={getStatusVariant(job.status) as any} className="px-3 py-1 font-bold tracking-tight rounded-lg shadow-sm whitespace-nowrap">
                          <span className="mr-1.5">{getStatusIcon(job.status)}</span>
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-bold text-foreground tracking-tighter">
                            {job.id?.slice(0, 12)}...
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-0.5 opacity-50">
                            UUID TAG
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 text-sm font-medium whitespace-nowrap">
                        {formatTime(job.createdAt)}
                      </TableCell>
                      <TableCell className="py-5">
                        {job.executionTime ? (
                          <span className="font-mono text-xs bg-primary/5 text-primary px-2 py-0.5 rounded-md border border-primary/10 font-bold">
                            {job.executionTime}ms
                          </span>
                        ) : (
                          <span className="text-muted-foreground/30 font-black">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-5 pr-6">
                        <div className="max-w-[240px] truncate text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors italic opacity-70 group-hover:opacity-100">
                          {job.status === 'COMPLETED' && job.result !== undefined
                            ? JSON.stringify(job.result).slice(0, 80)
                            : job.status === 'FAILED'
                              ? job.error?.slice(0, 80)
                              : <span className="animate-pulse">Processing stream...</span>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 border-t border-border/20 pt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Showing page <span className="text-foreground">{page}</span> of <span className="text-foreground">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                variant="outline"
                size="sm"
                className="rounded-xl px-5 border-border/40"
              >
                ← Prev
              </Button>
              <Button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                variant="outline"
                size="sm"
                className="rounded-xl px-5 border-border/40"
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
