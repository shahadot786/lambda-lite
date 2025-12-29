import { useState, useEffect } from 'react';
import { jobService } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AnalyticsData {
  overview: {
    totalJobs: number;
    successRate: number;
    avgExecutionTime: number;
  };
  statusDistribution: {
    total: number;
    completed: number;
    failed: number;
    pending: number;
    running: number;
  };
  queuePressure: {
    waiting: number;
    active: number;
  };
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      const response = await jobService.getAnalytics();
      setData(response.stats);
    } catch (err: any) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-destructive/5 border border-destructive/10 rounded-3xl">
        <p className="text-destructive font-bold">{error}</p>
        <Button onClick={fetchAnalytics} variant="outline" className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tighter uppercase">/ Analytics</h1>
        <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Real-time system performance telemetry</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard
          title="Total Workload"
          value={data?.overview.totalJobs.toLocaleString() || '0'}
          description="Total jobs processed"
          icon="📦"
        />
        <KpiCard
          title="Success Rate"
          value={`${data?.overview.successRate.toFixed(1)}%`}
          description="Successful executions"
          icon="✅"
          trend={data?.overview.successRate && data.overview.successRate > 95 ? 'positive' : 'neutral'}
        />
        <KpiCard
          title="Avg Latency"
          value={`${Math.round(data?.overview.avgExecutionTime || 0)}ms`}
          description="Time in sandbox"
          icon="⚡"
        />
        <KpiCard
          title="Queue Pressure"
          value={(data?.queuePressure.waiting || 0).toString()}
          description="Jobs awaiting worker"
          icon="🚦"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-8 border-border/40 bg-card/90 dark:bg-card/50 backdrop-blur-md shadow-2xl shadow-primary/10">
          <CardHeader>
            <CardTitle className="text-xl font-black tracking-tight">Status Distribution</CardTitle>
            <CardDescription className="text-xs uppercase tracking-widest font-bold opacity-60">Breakdown of job outcomes</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-8">
              <StatusProgress label="Completed" count={data?.statusDistribution.completed} total={data?.statusDistribution.total} color="bg-primary" />
              <StatusProgress label="Failed" count={data?.statusDistribution.failed} total={data?.statusDistribution.total} color="bg-destructive" />
              <StatusProgress label="Running" count={data?.statusDistribution.running} total={data?.statusDistribution.total} color="bg-amber-500" />
              <StatusProgress label="Pending" count={data?.statusDistribution.pending} total={data?.statusDistribution.total} color="bg-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-border/40 bg-card/90 dark:bg-card/50 backdrop-blur-md shadow-2xl shadow-primary/10 overflow-hidden">
          <CardHeader className="bg-muted/20">
            <CardTitle className="text-xl font-black tracking-tight">Live Workers</CardTitle>
            <CardDescription className="text-xs uppercase tracking-widest font-bold opacity-60">Real-time resource usage</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="relative">
                <div className="h-32 w-32 rounded-full border-8 border-primary/10 flex items-center justify-center">
                  <span className="text-3xl font-black text-primary italic">{data?.queuePressure.active}</span>
                </div>
                <div className="absolute top-0 right-0 h-4 w-4 bg-green-500 rounded-full animate-ping" />
                <div className="absolute top-0 right-0 h-4 w-4 bg-green-500 rounded-full" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black uppercase tracking-widest">Active Threads</p>
                <p className="text-[10px] text-muted-foreground font-medium">Currently executing payloads</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ title, value, description, icon, trend }: { title: string, value: string, description: string, icon: string, trend?: 'positive' | 'neutral' }) {
  return (
    <Card
      className="border-border/40 bg-card/90 dark:bg-card/50 backdrop-blur-md shadow-xl lg:shadow-2xl shadow-primary/10 transition-all hover:shadow-primary/20 hover:scale-[1.01]"
      title={description}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className="text-2xl">{icon}</span>
          {trend === 'positive' && <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[8px] font-black uppercase">Healthy</Badge>}
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{title}</p>
          <p className="text-3xl sm:text-4xl font-black tracking-tighter italic text-primary">{value}</p>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight opacity-60">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusProgress({ label, count = 0, total = 0, color }: { label: string, count?: number, total?: number, color: string }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-xs font-black uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-bold opacity-60">{count} jobs ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="h-3 w-full bg-muted/30 rounded-full overflow-hidden border border-border/10">
        <div
          className={`h-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
