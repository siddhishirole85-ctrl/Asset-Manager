import {
  useGetAllBorrows,
  useReturnBook,
  getGetAllBorrowsQueryKey,
  getGetBooksQueryKey,
  getGetDashboardStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, RotateCcw, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";

function StatusBadge({ status, dueDate }: { status: string; dueDate?: string | null }) {
  const isOverdue = status === "issued" && dueDate && new Date(dueDate) < new Date();
  if (status === "returned") return <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white border-0 text-xs">Returned</Badge>;
  if (isOverdue) return <Badge className="bg-destructive hover:bg-destructive text-white border-0 text-xs">Overdue</Badge>;
  return <Badge className="bg-amber-500 hover:bg-amber-500 text-white border-0 text-xs">Issued</Badge>;
}

export default function AdminBorrows() {
  const { data: borrows, isLoading } = useGetAllBorrows({
    query: { queryKey: getGetAllBorrowsQueryKey() },
  });
  const returnMutation = useReturnBook();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const filtered = borrows?.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.book?.title?.toLowerCase().includes(q) ||
      b.user?.name?.toLowerCase().includes(q) ||
      b.user?.email?.toLowerCase().includes(q)
    );
  });

  const handleReturn = (borrowId: number) => {
    returnMutation.mutate(
      { id: borrowId },
      {
        onSuccess: () => {
          toast({ title: "Book returned" });
          queryClient.invalidateQueries({ queryKey: getGetAllBorrowsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetBooksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        },
        onError: () => toast({ title: "Return failed", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Borrows</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {borrows ? `${borrows.length} total borrow records` : "Loading..."}
          </p>
        </div>
        <Input
          placeholder="Search by book or user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
          data-testid="input-search"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border p-4 flex justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Book</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Borrower</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Borrow Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Due Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((borrow, idx) => {
                const isOverdue = borrow.status === "issued" && borrow.dueDate && new Date(borrow.dueDate) < new Date();
                return (
                  <tr
                    key={borrow.id}
                    data-testid={`row-borrow-${borrow.id}`}
                    className={`border-b border-border last:border-0 transition-colors
                      ${idx % 2 === 0 ? "bg-card" : "bg-muted/20"}
                      ${isOverdue ? "bg-destructive/5" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{borrow.book?.title ?? `Book #${borrow.bookId}`}</span>
                      <span className="block sm:hidden text-xs text-muted-foreground mt-0.5">{borrow.user?.name}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-foreground">{borrow.user?.name}</span>
                      <span className="block text-xs text-muted-foreground">{borrow.user?.email}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {new Date(borrow.borrowDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {borrow.dueDate ? (
                        <span className={`flex items-center gap-1 ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                          {isOverdue && <AlertTriangle className="w-3 h-3" />}
                          {new Date(borrow.dueDate).toLocaleDateString()}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={borrow.status} dueDate={borrow.dueDate} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {borrow.status === "issued" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={returnMutation.isPending}
                          onClick={() => handleReturn(borrow.id)}
                          data-testid={`button-return-${borrow.id}`}
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1" />
                          Return
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ClipboardList className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="font-medium text-muted-foreground">{search ? "No matches found" : "No borrow records"}</p>
        </div>
      )}
    </div>
  );
}
