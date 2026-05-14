import { useGetRecommendations } from "@/lib/api-client-react";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Sparkles, BookOpen } from "lucide-react";
import { Link } from "wouter";

export default function Recommendations() {
  const { data, isLoading, refetch } = useGetRecommendations();
  const recs = (data as any)?.recommended ?? [];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-8 max-w-3xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-primary" />
                <h1 className="text-2xl font-bold text-foreground font-serif">AI Picks for You</h1>
              </div>
              <p className="text-muted-foreground text-sm">Personalized book recommendations based on your reading history</p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-12 h-16 bg-muted rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : recs.length > 0 ? (
            <div className="space-y-4">
              {recs.map((rec: any, i: number) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
                  <div className="flex gap-4">
                    <div className="w-12 h-16 rounded shadow-sm flex items-center justify-center flex-shrink-0 bg-primary/20">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{rec.title}</h3>
                          <p className="text-sm text-muted-foreground">{rec.author}</p>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground flex-shrink-0">{rec.category}</span>
                      </div>
                      <div className="mt-3 flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground italic">{rec.reason}</p>
                      </div>
                      {rec.bookId && (
                        <Link href={`/books/${rec.bookId}`} className="inline-block mt-3 text-xs font-medium text-primary hover:underline">
                          View in catalog
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Borrow some books first to get personalized recommendations</p>
              <Link href="/books" className="text-sm text-primary hover:underline mt-2 inline-block">Browse the catalog</Link>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
