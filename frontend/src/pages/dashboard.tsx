import { useGetDashboardStats, useGetRecentActivity } from "@/lib/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BookOpen, BookMarked, AlertTriangle, Users, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "wouter";

function StatCard({ label, value, icon: Icon, accent, sub }: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  accent?: string;
  sub?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className={`text-3xl font-bold ${accent || "text-foreground"}`}>{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent ? "bg-destructive/10" : "bg-primary/10"}`}>
          <Icon className={`w-5 h-5 ${accent || "text-primary"}`} />
        </div>
      </div>
    </div>
  );
}

function ActivityDot({ type }: { type: string }) {
  if (type === "return") return <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-1.5" />;
  if (type === "overdue") return <div className="w-2 h-2 rounded-full bg-destructive flex-shrink-0 mt-1.5" />;
  return <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />;
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-8 max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground font-serif">
              Good day, {user?.name?.split(" ")[0]}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Here's what's happening in the library</p>
          </div>

          {statsLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse h-24" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {isAdmin ? (
                <>
                  <StatCard label="Total Books" value={stats?.totalBooks ?? 0} icon={BookOpen} />
                  <StatCard label="Available" value={stats?.availableBooks ?? 0} icon={TrendingUp} sub="ready to borrow" />
                  <StatCard label="Borrowed" value={stats?.borrowedBooks ?? 0} icon={BookMarked} />
                  <StatCard label="Overdue" value={stats?.overdueCount ?? 0} icon={AlertTriangle} accent="text-destructive" sub="need attention" />
                </>
              ) : (
                <>
                  <StatCard label="Books Available" value={stats?.availableBooks ?? 0} icon={BookOpen} />
                  <StatCard label="My Active Borrows" value={stats?.myActiveBorrows ?? 0} icon={BookMarked} />
                  <StatCard label="Overdue" value={stats?.myOverdueBorrows ?? 0} icon={AlertTriangle} accent={stats?.myOverdueBorrows ? "text-destructive" : undefined} />
                  <StatCard label="Total Members" value={stats?.totalUsers ?? 0} icon={Users} />
                </>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h2 className="font-semibold text-foreground">Recent Activity</h2>
                </div>
                <div className="divide-y divide-border">
                  {activityLoading ? (
                    [...Array(5)].map((_, i) => (
                      <div key={i} className="px-5 py-3 flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-muted flex-shrink-0 mt-1.5" />
                        <div className="flex-1 h-4 bg-muted rounded animate-pulse" />
                      </div>
                    ))
                  ) : activity && activity.length > 0 ? (
                    (activity as any[]).slice(0, 8).map((item) => (
                      <div key={item.id} className="px-5 py-3 flex items-start gap-3">
                        <ActivityDot type={item.type} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{item.description}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        {item.type === "overdue" && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium flex-shrink-0">Overdue</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-5 py-8 text-center text-muted-foreground text-sm">
                      No recent activity
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <Link href="/books" className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-sm font-medium text-primary">
                    Browse Books
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/my-borrows" className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm text-foreground border border-border">
                    My Borrows
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                  <Link href="/recommendations" className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm text-foreground border border-border">
                    AI Recommendations
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
