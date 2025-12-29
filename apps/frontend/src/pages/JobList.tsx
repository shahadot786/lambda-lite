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

  const fetchJobs = async () => {
    try {
      const response = await jobService.getJobs(page, 10);
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
  }, [page]);

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
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/5">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8">
        <div className="space-y-1.5">
          <CardTitle className="text-3xl font-black tracking-tighter">Jobs</CardTitle>
          <CardDescription className="text-base font-medium">
            Manage and monitor your distributed tasks
            {loading && <span className="text-primary animate-pulse ml-2 font-bold inline-block">• Synchronizing...</span>}
          </CardDescription>
        </div>
        <Link to="/submit">
          <Button size="lg" className="font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95">
            + Submit New Job
          </Button>
        </Link>
      </CardHeader>

      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-border/40 rounded-3xl bg-muted/10">
            <div className="mb-6 text-4xl">🚀</div>
            <h3 className="text-xl font-bold mb-2">Ready to fly?</h3>
            <p className="text-muted-foreground mb-8 max-w-[400px] mx-auto">
              Your task execution queue is waiting for its first payload. Submit a job to see the engine in action.
            </p>
            <Link to="/submit">
              <Button size="lg" variant="outline" className="border-primary/20 hover:bg-primary/10">
                Launch First Job
              </Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/40 bg-background overflow-hidden shadow-inner shadow-muted/5">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-b border-border/30">
                  <TableHead className="py-5 pl-6 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                  <TableHead className="py-5 font-bold uppercase tracking-wider text-[10px]">Job Identity</TableHead>
                  <TableHead className="py-5 font-bold uppercase tracking-wider text-[10px]">Timeline</TableHead>
                  <TableHead className="py-5 font-bold uppercase tracking-wider text-[10px]">Runtime</TableHead>
                  <TableHead className="py-5 pr-6 font-bold uppercase tracking-wider text-[10px]">Execution Result</TableHead>
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
                      <Badge variant={getStatusVariant(job.status) as any} className="px-3 py-1 font-bold tracking-tight rounded-lg shadow-sm">
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
                    <TableCell className="py-5 text-sm font-medium">
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
                      <div className="max-w-[240px] truncate text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors italic opacity-70 group-hover:opacity-100 italic">
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
