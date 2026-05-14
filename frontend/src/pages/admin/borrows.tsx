import { useState } from "react";
import { useListBorrows, useReturnBorrow, getListBorrowsQueryKey } from "@/lib/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  if (status === "overdue") return <span className="text-xs px-2.5 py-1 rounded-full bg-destructive/10 text-destructive font-semibold">Overdue</span>;
  if (status === "returned") return <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 font-semibold">Returned</span>;
  return <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">Active</span>;
}

export default function AdminBorrows() {
  const [filter, setFilter] = useState<"all" | "active" | "returned" | "overdue">("all");
  const [returningId, setReturningId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const params = filter === "all" ? undefined : { status: filter as any };
  const { data: borrows, isLoading } = useListBorrows(params);
  const returnMutation = useReturnBorrow();

  const handleReturn = (id: number) => {
    setReturningId(id);
    returnMutation.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListBorrowsQueryKey() }),
      onSettled: () => setReturningId(null),
    });
  };

  const tabs = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "overdue", label: "Overdue" },
    { key: "returned", label: "Returned" },
  ];

  return (
    <ProtectedRoute adminOnly>
      <Layout>
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground font-serif">All Borrows</h1>
            <p className="text-muted-foreground text-sm mt-1">System-wide borrowing activity</p>
          </div>

          <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === tab.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-card border border-border rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">User</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Book</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Issued</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Due</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(borrows as any[])?.map((borrow) => (
                    <tr key={borrow.id} className={`hover:bg-muted/30 transition-colors ${borrow.status === "overdue" ? "bg-destructive/5" : ""}`}>
                      <td className="px-5 py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{borrow.user?.name}</p>
                          <p className="text-xs text-muted-foreground">{borrow.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm text-foreground">{borrow.book?.title}</p>
                        <p className="text-xs text-muted-foreground">{borrow.book?.author}</p>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell text-sm text-muted-foreground">
                        {new Date(borrow.issueDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 hidden lg:table-cell">
                        <span className={`text-sm ${borrow.status === "overdue" ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                          {new Date(borrow.returnDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={borrow.status} />
                      </td>
                      <td className="px-5 py-3">
                        {(borrow.status === "active" || borrow.status === "overdue") && (
                          <button
                            onClick={() => handleReturn(borrow.id)}
                            disabled={returningId === borrow.id}
                            className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-40 whitespace-nowrap"
                          >
                            {returningId === borrow.id ? "..." : "Mark Returned"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!borrows || (borrows as any[]).length === 0) && (
                <div className="text-center py-12 text-muted-foreground text-sm">No borrows found</div>
              )}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
