import { useState } from "react";
import { useListBooks, useCreateBorrow, getListBooksQueryKey } from "@/lib/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Search, Filter, BookOpen } from "lucide-react";
import { Link } from "wouter";

const CATEGORIES = ["All", "Technology", "Science Fiction", "Fiction", "Self-Development", "History", "Finance"];

function BookCard({ book, onBorrow, borrowing }: { book: any; onBorrow: (id: number) => void; borrowing: boolean }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
      <div className="h-36 flex items-center justify-center relative" style={{ backgroundColor: book.coverColor + "20", borderBottom: `3px solid ${book.coverColor}` }}>
        <div className="w-16 h-20 rounded shadow-md flex items-center justify-center" style={{ backgroundColor: book.coverColor }}>
          <BookOpen className="w-6 h-6 text-white opacity-80" />
        </div>
        {!book.available && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-destructive/90 text-white text-xs font-medium">
            Unavailable
          </div>
        )}
        {book.available && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-green-500/90 text-white text-xs font-medium">
            {book.availableCopies} left
          </div>
        )}
      </div>
      <div className="p-4">
        <Link href={`/books/${book.id}`}>
          <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 hover:text-primary transition-colors cursor-pointer">{book.title}</h3>
        </Link>
        <p className="text-xs text-muted-foreground mt-1">{book.author}</p>
        <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{book.category}</span>
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{book.shortDescription}</p>
        <div className="flex gap-2 mt-3">
          <Link href={`/books/${book.id}`} className="flex-1 text-center py-1.5 px-3 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors">
            Details
          </Link>
          <button
            onClick={() => onBorrow(book.id)}
            disabled={!book.available || borrowing}
            className="flex-1 py-1.5 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {borrowing ? "Borrowing..." : "Borrow"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Books() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [available, setAvailable] = useState<boolean | undefined>(undefined);
  const [borrowingId, setBorrowingId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const queryClient = useQueryClient();

  const params = {
    search: search || undefined,
    category: category !== "All" ? category : undefined,
    available,
  };
  const { data: books, isLoading } = useListBooks(params);
  const borrowMutation = useCreateBorrow();

  const handleBorrow = (bookId: number) => {
    setBorrowingId(bookId);
    borrowMutation.mutate(
      { data: { bookId } },
      {
        onSuccess: () => {
          setSuccessMsg("Book borrowed! Return it within 14 days.");
          queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
          setTimeout(() => setSuccessMsg(""), 3000);
        },
        onError: () => setSuccessMsg("Could not borrow — book may not be available."),
        onSettled: () => setBorrowingId(null),
      }
    );
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground font-serif">Book Catalog</h1>
              <p className="text-muted-foreground text-sm mt-1">{books?.length ?? 0} books in the collection</p>
            </div>
          </div>

          {successMsg && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary font-medium">
              {successMsg}
            </div>
          )}

          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by title or author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select
              value={available === undefined ? "all" : available ? "available" : "unavailable"}
              onChange={(e) => setAvailable(e.target.value === "all" ? undefined : e.target.value === "available")}
              className="px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All availability</option>
              <option value="available">Available only</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl h-72 animate-pulse" />
              ))}
            </div>
          ) : books && (books as any[]).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {(books as any[]).map((book) => (
                <BookCard key={book.id} book={book} onBorrow={handleBorrow} borrowing={borrowingId === book.id} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No books found matching your filters</p>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
