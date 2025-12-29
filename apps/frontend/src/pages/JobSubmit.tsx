import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';
import { jobService } from '../services/api';
import { codeExamples, CodeExample } from '../data/codeExamples';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  const [selectedLevel, setSelectedLevel] = useState<CodeExample['level'] | 'all'>('all');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
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

      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to submit job');
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (example: CodeExample) => {
    setCode(example.code);
    setArgs(JSON.stringify(example.args));
  };

  const filteredExamples = selectedLevel === 'all'
    ? codeExamples
    : codeExamples.filter(ex => ex.level === selectedLevel);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-orange-500';
      case 'expert': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Side - Code Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Submit Job</CardTitle>
              <CardDescription>
                Write JavaScript code and execute it in a secure sandbox
              </CardDescription>
            </div>
            <Link to="/">
              <Button variant="outline">← Back to Jobs</Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Code</label>
              <CodeEditor
                value={code}
                onChange={setCode}
                language="javascript"
                height="300px"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Arguments (JSON array)
                </label>
                <input
                  type="text"
                  value={args}
                  onChange={(e) => setArgs(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                  placeholder='[1, 2, "hello"]'
                />
                <p className="text-xs text-muted-foreground">
                  JSON array of arguments to pass to main()
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Timeout (ms)
                </label>
                <input
                  type="number"
                  value={timeout}
                  onChange={(e) => setTimeout(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                  min="1000"
                  max="60000"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum execution time
                </p>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Submitting...' : 'Submit Job'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Right Side - Examples */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>📚 Code Examples</CardTitle>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as any)}
              className="px-3 py-2 bg-background border border-input rounded-md text-sm font-medium"
            >
              <option value="all">All Levels</option>
              <option value="beginner">🟢 Beginner</option>
              <option value="intermediate">🟡 Intermediate</option>
              <option value="advanced">🟠 Advanced</option>
              <option value="expert">🔴 Expert</option>
            </select>
          </div>
          <CardDescription>
            Click any example to load it into the editor
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-3 max-h-[600px] overflow-y-auto pr-2">
            {filteredExamples.map((example) => (
              <button
                key={example.id}
                onClick={() => loadExample(example)}
                className="text-left p-4 rounded-lg border border-border hover:border-primary hover:bg-accent transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge className={`${getLevelColor(example.level)} text-white text-xs`}>
                    {example.level}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    📁 {example.category}
                  </span>
                </div>
                <h4 className="font-semibold text-sm mb-1 group-hover:text-primary">
                  {example.title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {example.description}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
