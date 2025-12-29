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
  const [total, setTotal] = useState(0);

  const fetchJobs = async () => {
    try {
      const response = await jobService.getJobs(page, 10);
      setJobs(response.jobs);
      setTotalPages(response.pages);
      setTotal(response.total);
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
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-2xl">Jobs</CardTitle>
          <CardDescription>
            {total} total job{total !== 1 ? 's' : ''}
            {loading && <span className="text-yellow-500 ml-2">(updating...)</span>}
          </CardDescription>
        </div>
        <Link to="/submit">
          <Button>+ Submit New Job</Button>
        </Link>
      </CardHeader>

      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">No jobs yet</p>
            <Link to="/submit">
              <Button>Submit Your First Job</Button>
            </Link>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Execution Time</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow
                    key={job.id}
                    onClick={() => navigate(`/job/${job.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <Badge variant={getStatusVariant(job.status) as any}>
                        {getStatusIcon(job.status)} {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {job.id?.slice(0, 8) || 'N/A'}...
                    </TableCell>
                    <TableCell>{formatTime(job.createdAt)}</TableCell>
                    <TableCell>
                      {job.executionTime ? `${job.executionTime}ms` : '-'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground text-sm">
                      {job.status === 'COMPLETED' && job.result !== undefined
                        ? JSON.stringify(job.result).slice(0, 50)
                        : job.status === 'FAILED'
                          ? job.error?.slice(0, 50)
                          : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <Button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  variant="outline"
                >
                  ← Previous
                </Button>
                <span className="text-sm text-muted-foreground font-medium">
                  Page {page} of {totalPages}
                </span>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  variant="outline"
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
