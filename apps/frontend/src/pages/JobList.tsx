import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jobService, Job } from '../services/api';

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

    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, [page]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '⏳';
      case 'RUNNING':
        return '▶️';
      case 'COMPLETED':
        return '✅';
      case 'FAILED':
        return '❌';
      default:
        return '❓';
    }
  };

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
    return <div className="loading">Loading jobs...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="job-list">
      <div className="header">
        <div>
          <h1>Jobs</h1>
          <p className="subtitle">
            {total} total job{total !== 1 ? 's' : ''}
            {loading && <span className="loading-indicator"> (updating...)</span>}
          </p>
        </div>
        <Link to="/submit" className="btn-primary">
          + Submit New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <p>No jobs yet</p>
          <Link to="/submit" className="btn-primary">
            Submit Your First Job
          </Link>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Job ID</th>
                  <th>Created</th>
                  <th>Execution Time</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    onClick={() => navigate(`/job/${job.id}`)}
                    className="job-row"
                  >
                    <td>
                      <span className={`status-badge ${getStatusClass(job.status)}`}>
                        {getStatusIcon(job.status)} {job.status}
                      </span>
                    </td>
                    <td className="job-id">{job.id?.slice(0, 8) || 'N/A'}...</td>
                    <td>{formatTime(job.createdAt)}</td>
                    <td>
                      {job.executionTime ? `${job.executionTime}ms` : '-'}
                    </td>
                    <td className="result-preview">
                      {job.status === 'COMPLETED' && job.result !== undefined
                        ? JSON.stringify(job.result).slice(0, 50)
                        : job.status === 'FAILED'
                          ? job.error?.slice(0, 50)
                          : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn-secondary"
              >
                ← Previous
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="btn-secondary"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
