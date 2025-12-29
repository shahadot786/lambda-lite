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

  // Removed getLevelColor as it was replaced by inline Badge logic or is no longer needed

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
      {/* Left Side - Code Editor (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        <Card className="border-border/40 bg-card/90 dark:bg-card/50 backdrop-blur-md shadow-2xl shadow-primary/10 dark:shadow-primary/5 overflow-hidden">
          <CardHeader className="border-b border-border/10 bg-muted/20 pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-2xl sm:text-3xl font-black tracking-tighter flex items-center gap-2">
                  <span className="text-primary italic">/</span> SUBMIT PAYLOAD
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm font-medium">
                  Secure JavaScript execution in an isolated sandbox environment
                </CardDescription>
              </div>
              <Link to="/" className="w-full sm:w-auto">
                <Button variant="ghost" size="sm" className="w-full sm:w-auto font-bold hover:bg-background/50 group whitespace-nowrap">
                  <span className="mr-2 opacity-50 group-hover:opacity-100 transition-opacity">←</span> VIEW QUEUE
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent className="pt-6 sm:pt-8 px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 sm:px-5 py-3 sm:py-4 rounded-2xl text-sm font-bold animate-in zoom-in-95 duration-200">
                  <span className="mr-2">⚠️</span> {error}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Source Code</label>
                  <Badge variant="outline" className="font-mono text-[9px] sm:text-[10px] tracking-tight bg-background/50 whitespace-nowrap">JavaScript (Node.js)</Badge>
                </div>
                <div className="rounded-2xl border border-border/40 overflow-hidden shadow-inner ring-1 ring-black/5 bg-muted/5">
                  <CodeEditor
                    value={code}
                    onChange={setCode}
                    language="javascript"
                    height={window.innerWidth < 640 ? "300px" : "450px"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Runtime Arguments
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={args}
                      onChange={(e) => setArgs(e.target.value)}
                      className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-muted/30 border border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-2xl text-sm font-mono transition-all outline-none shadow-inner"
                      placeholder='[1, 2, "hello"]'
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground uppercase opacity-0 group-focus-within:opacity-30 transition-opacity pointer-events-none hidden xs:block">
                      JSON Array
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60 ml-2">
                    Pass arguments to main()
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Timeout Threshold
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      value={timeout}
                      onChange={(e) => setTimeout(e.target.value)}
                      className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-muted/30 border border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-2xl text-sm font-mono transition-all outline-none shadow-inner"
                      min="1000"
                      max="60000"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground uppercase pointer-events-none opacity-40 group-focus-within:opacity-20 transition-opacity hidden xs:block">
                      ms
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60 ml-2">
                    Hard stop for execution
                  </p>
                </div>
              </div>

              <Button type="submit" disabled={loading} size="lg" className="w-full h-14 sm:h-16 text-base sm:text-lg font-black tracking-tighter rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] transition-transform active:scale-95">
                {loading ? (
                  <span className="flex items-center gap-3">
                    <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    DEPLOING PAYLOAD...
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    🚀 DEPLOY ASYNC TASK
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Examples (4 cols) */}
      <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
        <Card className="border-border/40 bg-card/90 dark:bg-card/50 backdrop-blur-md shadow-2xl shadow-primary/10 dark:shadow-primary/5 overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-xl font-black tracking-tighter">LIBRARY</CardTitle>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as any)}
                className="px-2 sm:px-3 py-1.5 bg-muted/50 border border-border/40 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="all">ALL</option>
                <option value="beginner">BEG</option>
                <option value="intermediate">MID</option>
                <option value="advanced">ADV</option>
                <option value="expert">EXP</option>
              </select>
            </div>
            <CardDescription className="text-[10px] sm:text-xs font-medium uppercase tracking-wider opacity-60">
              Tested templates for rapid prototyping
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 max-h-[400px] lg:max-h-[calc(100vh-320px)] overflow-y-auto pr-2 custom-scrollbar">
              {filteredExamples.map((example) => (
                <button
                  key={example.id}
                  onClick={() => loadExample(example)}
                  className="text-left p-3 sm:p-4 rounded-2xl border border-border/10 bg-background/40 hover:border-primary/40 hover:bg-primary/5 hover:translate-x-1 transition-all group relative overflow-hidden active:scale-95"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2 gap-2">
                    <Badge variant="outline" className={`text-[8px] sm:text-[10px] tracking-tight uppercase px-1.5 py-0 border-primary/20 bg-primary/5 text-primary font-bold`}>
                      {example.level}
                    </Badge>
                    <span className="text-[8px] sm:text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] truncate">
                      {example.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm mb-1 group-hover:text-primary transition-colors tracking-tight line-clamp-1">
                    {example.title}
                  </h4>
                  <p className="text-[9px] sm:text-[10px] leading-relaxed text-muted-foreground/80 line-clamp-2 font-medium">
                    {example.description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="p-4 sm:p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-3">
          <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Pro Tip</h5>
          <p className="text-[10px] sm:text-xs text-muted-foreground/90 leading-relaxed font-medium">
            Use <span className="font-mono text-primary font-bold">console.log()</span> to stream realtime telemetry back to the dashboard during execution.
          </p>
        </div>
      </div>
    </div>
  );
}
