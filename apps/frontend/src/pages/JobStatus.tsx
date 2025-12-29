import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import LogViewer from '../components/LogViewer';
import { jobService, Job } from '../services/api';
import { websocketService } from '../services/websocket';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle>Job Details</CardTitle>
                <Badge variant={getStatusVariant(job.status) as any} className="text-sm">
                  {getStatusIcon(job.status)} {job.status}
                </Badge>
              </div>
              <CardDescription className="font-mono text-xs">
                ID: {job.id}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Link to="/">
                <Button variant="outline">← All Jobs</Button>
              </Link>
              <Link to="/submit">
                <Button>Submit New Job</Button>
              </Link>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-medium text-muted-foreground">Created</dt>
              <dd className="mt-1">{new Date(job.createdAt).toLocaleString()}</dd>
            </div>
            {job.startedAt && (
              <div>
                <dt className="font-medium text-muted-foreground">Started</dt>
                <dd className="mt-1">{new Date(job.startedAt).toLocaleString()}</dd>
              </div>
            )}
            {job.completedAt && (
              <div>
                <dt className="font-medium text-muted-foreground">Completed</dt>
                <dd className="mt-1">{new Date(job.completedAt).toLocaleString()}</dd>
              </div>
            )}
            {job.executionTime && (
              <div>
                <dt className="font-medium text-muted-foreground">Execution Time</dt>
                <dd className="mt-1 font-mono">{job.executionTime}ms</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Code</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
            <code>{job.code}</code>
          </pre>
        </CardContent>
      </Card>

      {/* Arguments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Arguments</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
            <code>{JSON.stringify(job.args, null, 2)}</code>
          </pre>
        </CardContent>
      </Card>

      {/* Result */}
      {job.status === 'COMPLETED' && job.result !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-600 dark:text-green-400">
              ✅ Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 rounded-lg overflow-x-auto text-sm font-mono">
              <code>{JSON.stringify(job.result, null, 2)}</code>
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {job.status === 'FAILED' && job.error && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-destructive">
              ❌ Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-destructive/10 border border-destructive p-4 rounded-lg overflow-x-auto text-sm font-mono text-destructive">
              <code>{job.error}</code>
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Logs */}
      {job.logs && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <LogViewer logs={job.logs} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
