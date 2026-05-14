import { useListBorrows, useReturnBorrow, getListBorrowsQueryKey, getGetDashboardStatsQueryKey } from "@/lib/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BookOpen, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";

function StatusBadge({ status }: { status: string }) {
  if (status === "overdue") return <span className="text-xs px-2.5 py-1 rounded-full bg-destructive/10 text-destructive font-semibold">Overdue</span>;
  if (status === "returned") return <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 font-semibold">Returned</span>;
  return <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">Active</span>;
}

export default function MyBorrows() {
  const [filter, setFilter] = useState<"all" | "active" | "returned" | "overdue">("all");
  const [returningId, setReturningId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const params = filter === "all" ? undefined : { status: filter as "active" | "returned" | "overdue" };
  const { data: borrows, isLoading } = useListBorrows(params);
  const returnMutation = useReturnBorrow();

  const handleReturn = (id: number) => {
    setReturningId(id);
    returnMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBorrowsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        },
        onSettled: () => setReturningId(null),
      }
    );
  };

  const tabs = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "overdue", label: "Overdue" },
    { key: "returned", label: "Returned" },
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-8 max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground font-serif">My Borrows</h1>
            <p className="text-muted-foreground text-sm mt-1">Track your borrowed books and return dates</p>
          </div>

          <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl h-24 animate-pulse" />
              ))}
            </div>
          ) : borrows && (borrows as any[]).length > 0 ? (
            <div className="space-y-3">
              {(borrows as any[]).map((borrow) => {
                const isOverdue = borrow.status === "overdue";
                const isActive = borrow.status === "active";
                return (
                  <div key={borrow.id} className={`bg-card border rounded-xl p-4 ${isOverdue ? "border-destructive/30" : "border-border"}`}>
                    <div className="flex items-start gap-4">
                      <div
                        className="w-10 h-12 rounded flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: borrow.book?.coverColor + "30", borderLeft: `3px solid ${borrow.book?.coverColor}` }}
                      >
                        <BookOpen className="w-4 h-4" style={{ color: borrow.book?.coverColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-foreground text-sm">{borrow.book?.title}</p>
                            <p className="text-xs text-muted-foreground">{borrow.book?.author}</p>
                          </div>
                          <StatusBadge status={borrow.status} />
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            Borrowed: {new Date(borrow.issueDate).toLocaleDateString()}
                          </div>
                          <div className={`flex items-center gap-1.5 text-xs ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                            {isOverdue ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            {borrow.status === "returned" ? `Returned: ${new Date(borrow.actualReturnDate).toLocaleDateString()}` : `Due: ${new Date(borrow.returnDate).toLocaleDateString()}`}
                          </div>
                        </div>
                        {borrow.status !== "returned" && (borrow as { returnLocation?: string }).returnLocation ? (
                          <p className="text-[10px] text-muted-foreground mt-1.5">
                            Return location: {(borrow as { returnLocation?: string }).returnLocation}
                          </p>
                        ) : null}
                      </div>
                      {(isActive || isOverdue) && (
                        <button
                          onClick={() => handleReturn(borrow.id)}
                          disabled={returningId === borrow.id}
                          className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-40 flex-shrink-0"
                        >
                          {returningId === borrow.id ? "Returning..." : "Return"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No borrows found</p>
              <a href="/books" className="text-sm text-primary hover:underline mt-2 inline-block">Browse the catalog</a>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
