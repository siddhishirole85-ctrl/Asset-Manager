import { useState } from "react";
import {
  useGetBooks,
  useGetCategories,
  useBorrowBook,
  useDeleteBook,
  getGetBooksQueryKey,
  getGetMyBorrowsQueryKey,
  getGetDashboardStatsQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Search, Plus, Edit, Trash2, BookMarked } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Books() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const activeCategory = category === "all" ? undefined : category;
  const { data: books, isLoading } = useGetBooks(
    { search: search || undefined, category: activeCategory },
    { query: { queryKey: getGetBooksQueryKey({ search: search || undefined, category: activeCategory }) } }
  );
  const { data: categories } = useGetCategories();
  const borrowMutation = useBorrowBook();
  const deleteMutation = useDeleteBook();

  const handleBorrow = (bookId: number, title: string) => {
    borrowMutation.mutate(
      { data: { bookId } },
      {
        onSuccess: () => {
          toast({ title: "Book borrowed", description: `"${title}" has been added to your borrows.` });
          queryClient.invalidateQueries({ queryKey: getGetBooksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMyBorrowsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        },
        onError: (err: unknown) => {
          const e = err as { data?: { error?: string }; message?: string };
          toast({
            title: "Failed to borrow",
            description: e?.data?.error ?? e?.message ?? "Could not borrow book",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Book deleted" });
          queryClient.invalidateQueries({ queryKey: getGetBooksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
          setDeleteId(null);
        },
        onError: () => {
          toast({ title: "Delete failed", variant: "destructive" });
          setDeleteId(null);
        },
      }
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Books</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {books ? `${books.length} books in the catalog` : "Loading catalog..."}
          </p>
        </div>
        {isAdmin && (
          <Link href="/books/new" data-testid="button-add-book" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            Add Book
          </Link>
        )}
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-44" data-testid="select-category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(search || category) && (
          <Button variant="ghost" onClick={() => { setSearch(""); setCategory("all"); }}>
            Clear
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border p-5 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-9 w-full mt-2" />
            </div>
          ))}
        </div>
      ) : books && books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => (
            <div
              key={book.id}
              data-testid={`card-book-${book.id}`}
              className="rounded-lg border border-border bg-card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground leading-tight line-clamp-2" data-testid={`text-title-${book.id}`}>
                    {book.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{book.author}</p>
                </div>
                <Badge
                  variant={book.availableCopies > 0 ? "default" : "secondary"}
                  className={`flex-shrink-0 text-xs ${book.availableCopies > 0 ? "bg-emerald-500 hover:bg-emerald-500" : ""}`}
                >
                  {book.availableCopies > 0 ? `${book.availableCopies} avail.` : "Unavailable"}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{book.category}</Badge>
                <span className="text-xs text-muted-foreground">{book.totalCopies} total cop{book.totalCopies === 1 ? "y" : "ies"}</span>
              </div>

              {book.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{book.description}</p>
              )}

              <div className="flex gap-2 mt-auto pt-1">
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={book.availableCopies === 0 || borrowMutation.isPending}
                  onClick={() => handleBorrow(book.id, book.title)}
                  data-testid={`button-borrow-${book.id}`}
                >
                  <BookMarked className="w-3.5 h-3.5 mr-1.5" />
                  Borrow
                </Button>
                {isAdmin && (
                  <>
                    <Link href={`/books/${book.id}/edit`} className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors" data-testid={`button-edit-${book.id}`}>
                      <Edit className="w-3.5 h-3.5" />
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => setDeleteId(book.id)}
                      data-testid={`button-delete-${book.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="font-medium text-muted-foreground">No books found</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {search || category ? "Try different search terms" : "No books have been added yet"}
          </p>
        </div>
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this book?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The book will be permanently removed from the catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteId !== null && handleDelete(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
