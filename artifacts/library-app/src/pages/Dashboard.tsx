import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Users, BookMarked, AlertTriangle, Library, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: number | undefined;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}) {
  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-md ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        {value === undefined ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <p className="text-3xl font-bold text-foreground" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, "-")}`}>
            {value.toLocaleString()}
          </p>
        )}
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const { data: stats, isLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() },
  });

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isAdmin ? "Library administration overview" : "Your library activity at a glance"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total Books"
          value={isLoading ? undefined : stats?.totalBooks}
          icon={BookOpen}
          color="bg-primary"
          subtitle="In collection"
        />
        <StatCard
          title="Available Books"
          value={isLoading ? undefined : stats?.availableBooks}
          icon={CheckCircle}
          color="bg-emerald-500"
          subtitle="Ready to borrow"
        />
        <StatCard
          title="Active Borrows"
          value={isLoading ? undefined : stats?.activeBorrows}
          icon={BookMarked}
          color="bg-amber-500"
          subtitle="Currently issued"
        />
        {isAdmin && (
          <>
            <StatCard
              title="Total Users"
              value={isLoading ? undefined : stats?.totalUsers}
              icon={Users}
              color="bg-violet-500"
              subtitle="Registered members"
            />
            <StatCard
              title="Total Borrows"
              value={isLoading ? undefined : stats?.totalBorrows}
              icon={Library}
              color="bg-blue-500"
              subtitle="All time"
            />
            <StatCard
              title="Overdue Books"
              value={isLoading ? undefined : stats?.overdueBooks}
              icon={AlertTriangle}
              color="bg-destructive"
              subtitle="Past due date"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/60 hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Browse Books</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Explore our catalog and borrow books instantly.
              </p>
              <Link href="/books" className="inline-flex items-center px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors" data-testid="link-browse-books">Browse catalog</Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <BookMarked className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">My Borrows</h3>
              <p className="text-sm text-muted-foreground mb-3">
                View your borrow history and return books.
              </p>
              <Link href="/my-borrows" className="inline-flex items-center px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors" data-testid="link-my-borrows">View borrows</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
