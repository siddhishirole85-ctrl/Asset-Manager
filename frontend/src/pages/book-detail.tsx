import { useRoute } from "wouter";
import { useGetBook, useGetBookReason, useCreateBorrow, getListBooksQueryKey, getGetBookQueryKey, getGetBookReasonQueryKey } from "@/lib/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BookOpen, ArrowLeft, Sparkles, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function BookDetail() {
  const [, params] = useRoute("/books/:id");
  const id = parseInt(params?.id ?? "0", 10);
  const [borrowed, setBorrowed] = useState(false);
  const queryClient = useQueryClient();

  const { data: book, isLoading } = useGetBook(id, { query: { queryKey: getGetBookQueryKey(id), enabled: !!id } });
  const { data: reason, isLoading: reasonLoading } = useGetBookReason(id, { query: { queryKey: getGetBookReasonQueryKey(id), enabled: !!id } });
  const borrowMutation = useCreateBorrow();

  const handleBorrow = () => {
    borrowMutation.mutate(
      { data: { bookId: id } },
      {
        onSuccess: () => {
          setBorrowed(true);
          queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-8 max-w-3xl mx-auto animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-64 bg-muted rounded-xl" />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const b = book as any;
  if (!b) return null;

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-8 max-w-3xl mx-auto">
          <Link href="/books" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to catalog
          </Link>

          <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
            <div className="flex gap-6 p-6">
              <div
                className="w-28 h-36 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md"
                style={{ backgroundColor: b.coverColor }}
              >
                <BookOpen className="w-10 h-10 text-white opacity-80" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground mb-2 inline-block">{b.category}</span>
                <h1 className="text-2xl font-bold text-foreground font-serif leading-tight">{b.title}</h1>
                <p className="text-muted-foreground mt-1">{b.author}</p>

                <div className="flex items-center gap-4 mt-3">
                  <span className={`text-sm font-medium ${b.available ? "text-green-600" : "text-destructive"}`}>
                    {b.available ? `${b.availableCopies} of ${b.totalCopies} available` : "Currently unavailable"}
                  </span>
                </div>

                <div className="flex gap-3 mt-4">
                  {borrowed ? (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-600 text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Borrowed! Return within 14 days.
                    </div>
                  ) : (
                    <button
                      onClick={handleBorrow}
                      disabled={!b.available || borrowMutation.isPending}
                      className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {borrowMutation.isPending ? "Borrowing..." : "Borrow this Book"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 border-t border-border pt-4">
              <h2 className="font-semibold text-foreground mb-2">About this Book</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.fullDescription || b.shortDescription}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Why Should You Read This?</h2>
            </div>
            {reasonLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            ) : reason ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{(reason as any).why}</p>
                {(reason as any).benefits?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Key Benefits</p>
                    <ul className="space-y-1">
                      {(reason as any).benefits.map((b: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(reason as any).skills?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Skills & Values Gained</p>
                    <div className="flex flex-wrap gap-2">
                      {(reason as any).skills.map((s: string, i: number) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">AI insights unavailable for this book.</p>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
