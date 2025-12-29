import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import LogViewer from '../components/LogViewer';
import { jobService, Job } from '../services/api';

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

        // Poll for updates if job is pending or running
        if (jobData.status === 'PENDING' || jobData.status === 'RUNNING') {
          setTimeout(fetchJob, 2000);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch job');
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading job...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!job) {
    return <div className="error-message">Job not found</div>;
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'RUNNING':
        return 'status-running';
      case 'COMPLETED':
        return 'status-completed';
      case 'FAILED':
        return 'status-failed';
      default:
        return '';
    }
  };

  return (
    <div className="job-status">
      <div className="header">
        <h1>Job Status</h1>
        <Link to="/" className="btn-secondary">
          Submit New Job
        </Link>
      </div>

      <div className="job-info">
        <div className="info-row">
          <span className="label">Job ID:</span>
          <span className="value">{job.id}</span>
        </div>
        <div className="info-row">
          <span className="label">Status:</span>
          <span className={`status-badge ${getStatusClass(job.status)}`}>
            {job.status}
          </span>
        </div>
        <div className="info-row">
          <span className="label">Created:</span>
          <span className="value">{new Date(job.createdAt).toLocaleString()}</span>
        </div>
        {job.executionTime && (
          <div className="info-row">
            <span className="label">Execution Time:</span>
            <span className="value">{job.executionTime}ms</span>
          </div>
        )}
      </div>

      {job.result !== undefined && (
        <div className="result-section">
          <h3>Result</h3>
          <pre className="result">{JSON.stringify(job.result, null, 2)}</pre>
        </div>
      )}

      {(job.logs || job.error) && (
        <LogViewer logs={job.logs || ''} error={job.error} />
      )}

      <div className="code-section">
        <h3>Code</h3>
        <pre className="code">{job.code}</pre>
      </div>

      {job.args.length > 0 && (
        <div className="args-section">
          <h3>Arguments</h3>
          <pre className="args">{JSON.stringify(job.args, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
