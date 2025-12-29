import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';
import { jobService } from '../services/api';

const EXAMPLE_CODE = `// Define a main function that will be called with your arguments
function main(a, b) {
  console.log('Adding', a, 'and', b);
  return a + b;
}`;

export default function JobSubmit() {
  const navigate = useNavigate();
  const [code, setCode] = useState(EXAMPLE_CODE);
  const [args, setArgs] = useState('[2, 3]');
  const [timeout, setTimeout] = useState('30000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Parse arguments
      let parsedArgs: any[] = [];
      if (args.trim()) {
        parsedArgs = JSON.parse(args);
        if (!Array.isArray(parsedArgs)) {
          throw new Error('Arguments must be an array');
        }
      }

      await jobService.submitJob({
        code,
        args: parsedArgs,
        timeout: parseInt(timeout),
      });

      // Navigate to job list
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to submit job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-submit">
      <div className="header">
        <div>
          <h1>Submit Job</h1>
          <p className="subtitle">
            Write JavaScript code and execute it in a secure sandbox environment
          </p>
        </div>
        <Link to="/" className="btn-secondary">
          ← Back to Jobs
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Code</label>
          <CodeEditor value={code} onChange={setCode} height="400px" />
          <small>Define a <code>main</code> function to receive arguments</small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Arguments (JSON array)</label>
            <input
              type="text"
              value={args}
              onChange={(e) => setArgs(e.target.value)}
              placeholder="[1, 2, 3]"
            />
          </div>

          <div className="form-group">
            <label>Timeout (ms)</label>
            <input
              type="number"
              value={timeout}
              onChange={(e) => setTimeout(e.target.value)}
              min="1000"
              max="300000"
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Submitting...' : 'Execute Code'}
        </button>
      </form>
    </div>
  );
}
