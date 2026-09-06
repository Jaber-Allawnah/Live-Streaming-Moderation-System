import { MessageSquare, ShieldAlert, Percent, Activity, RefreshCw } from 'lucide-react';
import { useComments } from '@/contexts/CommentsContext';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { BlockedCommentsList } from '@/components/dashboard/BlockedCommentsList';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { stats, isLoading, refreshComments } = useComments();
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor live stream comments in real-time
          </p>
        </div>
        <Button
          variant="outline"
          onClick={refreshComments}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Comments"
          value={stats.totalComments.toLocaleString()}
          subtitle="All time"
          icon={MessageSquare}
          variant="primary"
          trend={{
            value: stats.totalLast5,
            isPositive: stats.totalLast5 > 0
          }}
        />
        <StatsCard
          title="Blocked Comments"
          value={stats.blockedComments.toLocaleString()}
          subtitle="Moderated content"
          icon={ShieldAlert}
          variant="destructive"
          trend={{
            value: stats.blockedLast5,
            isPositive: stats.blockedLast5 > 0
          }}
        />
        <StatsCard
          title="Block Rate"
          value={`${stats.blockedPercentage}%`}
          subtitle="Of all comments"
          icon={Percent}
          variant="default"
        />
        <StatsCard
          title="Live Status"
          value="Active"
          subtitle="Stream monitoring"
          icon={Activity}
          variant="success"
        />
      </div>

      {/* Latest Blocked Comments */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Latest Blocked Comments</h2>
          <p className="text-sm text-muted-foreground">
            Recently moderated content
          </p>
        </div>
        <div className="p-6">
          <BlockedCommentsList comments={stats.latestBlocked} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
