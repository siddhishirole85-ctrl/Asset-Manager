import {
  useGetMyBorrows,
  useReturnBook,
  getGetMyBorrowsQueryKey,
  getGetBooksQueryKey,
  getGetDashboardStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookMarked, RotateCcw, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function StatusBadge({ status, dueDate }: { status: string; dueDate?: string | null }) {
  const isOverdue = status === "issued" && dueDate && new Date(dueDate) < new Date();
  if (status === "returned") {
    return <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white border-0 text-xs">Returned</Badge>;
  }
  if (isOverdue) {
    return <Badge className="bg-destructive hover:bg-destructive text-white border-0 text-xs">Overdue</Badge>;
  }
  return <Badge className="bg-amber-500 hover:bg-amber-500 text-white border-0 text-xs">Issued</Badge>;
}

export default function MyBorrows() {
  const { data: borrows, isLoading } = useGetMyBorrows({
    query: { queryKey: getGetMyBorrowsQueryKey() },
  });
  const returnMutation = useReturnBook();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleReturn = (borrowId: number, title: string) => {
    returnMutation.mutate(
      { id: borrowId },
      {
        onSuccess: () => {
          toast({ title: "Book returned", description: `"${title}" has been returned.` });
          queryClient.invalidateQueries({ queryKey: getGetMyBorrowsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetBooksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        },
        onError: () => toast({ title: "Return failed", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Borrows</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Your borrowing history and active loans
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border p-4">
              <div className="flex justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : borrows && borrows.length > 0 ? (
        <div className="space-y-3">
          {borrows.map((borrow) => {
            const isOverdue =
              borrow.status === "issued" && borrow.dueDate && new Date(borrow.dueDate) < new Date();
            return (
              <div
                key={borrow.id}
                data-testid={`card-borrow-${borrow.id}`}
                className={`rounded-lg border bg-card p-4 flex items-start justify-between gap-4 transition-colors
                  ${isOverdue ? "border-destructive/40 bg-destructive/5" : "border-border"}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-foreground">
                      {borrow.book?.title ?? `Book #${borrow.bookId}`}
                    </span>
                    <StatusBadge status={borrow.status} dueDate={borrow.dueDate} />
                  </div>
                  <p className="text-sm text-muted-foreground">{borrow.book?.author}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-xs text-muted-foreground">
                    <span>Borrowed: {new Date(borrow.borrowDate).toLocaleDateString()}</span>
                    {borrow.dueDate && (
                      <span className={isOverdue ? "text-destructive font-medium" : ""}>
                        {isOverdue && <AlertTriangle className="w-3 h-3 inline mr-0.5" />}
                        Due: {new Date(borrow.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {borrow.returnDate && (
                      <span>Returned: {new Date(borrow.returnDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {borrow.status === "issued" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={returnMutation.isPending}
                    onClick={() => handleReturn(borrow.id, borrow.book?.title ?? "this book")}
                    data-testid={`button-return-${borrow.id}`}
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Return
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookMarked className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="font-medium text-muted-foreground">No borrows yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Visit the books catalog to borrow your first book.
          </p>
        </div>
      )}
    </div>
  );
}
