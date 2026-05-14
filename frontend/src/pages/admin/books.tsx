import { useState } from "react";
import { useListBooks, useCreateBook, useUpdateBook, useDeleteBook, getListBooksQueryKey } from "@/lib/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Plus, Pencil, Trash2, BookOpen, X, Check } from "lucide-react";

const EMPTY_FORM = { title: "", author: "", category: "Technology", shortDescription: "", fullDescription: "", coverColor: "#2563eb", totalCopies: 1 };

function BookModal({ book, onClose, onSave }: { book?: any; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState(book ? {
    title: book.title,
    author: book.author,
    category: book.category,
    shortDescription: book.shortDescription,
    fullDescription: book.fullDescription,
    coverColor: book.coverColor,
    totalCopies: book.totalCopies,
  } : EMPTY_FORM);

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-lg border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">{book ? "Edit Book" : "Add New Book"}</h2>
          <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {(["title", "author"] as const).map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-foreground mb-1.5 capitalize">{key}</label>
              <input
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {["Technology", "Science Fiction", "Fiction", "Self-Development", "History", "Finance"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Short Description</label>
            <input value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Full Description</label>
            <textarea value={form.fullDescription} onChange={(e) => set("fullDescription", e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-1.5">Total Copies</label>
              <input type="number" min={1} value={form.totalCopies} onChange={(e) => set("totalCopies", parseInt(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Cover Color</label>
              <input type="color" value={form.coverColor} onChange={(e) => set("coverColor", e.target.value)} className="w-12 h-9 rounded-lg border border-border cursor-pointer" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button>
          <button onClick={() => onSave(form)} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            {book ? "Save Changes" : "Add Book"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminBooks() {
  const [showModal, setShowModal] = useState(false);
  const [editBook, setEditBook] = useState<any>(null);
  const queryClient = useQueryClient();
  const { data: books, isLoading } = useListBooks();
  const createMutation = useCreateBook();
  const updateMutation = useUpdateBook();
  const deleteMutation = useDeleteBook();

  const handleSave = (form: any) => {
    if (editBook) {
      updateMutation.mutate({ id: editBook.id, data: form }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() }); setShowModal(false); setEditBook(null); }
      });
    } else {
      createMutation.mutate({ data: form }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() }); setShowModal(false); }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this book?")) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() })
    });
  };

  return (
    <ProtectedRoute adminOnly>
      <Layout>
        {showModal && (
          <BookModal book={editBook} onClose={() => { setShowModal(false); setEditBook(null); }} onSave={handleSave} />
        )}
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground font-serif">Manage Books</h1>
              <p className="text-muted-foreground text-sm mt-1">{(books as any[])?.length ?? 0} books total</p>
            </div>
            <button
              onClick={() => { setEditBook(null); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Book
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-card border border-border rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Book</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Category</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Copies</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(books as any[])?.map((book) => (
                    <tr key={book.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-9 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: book.coverColor }}>
                            <BookOpen className="w-3 h-3 text-white opacity-80" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{book.title}</p>
                            <p className="text-xs text-muted-foreground">{book.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{book.category}</span>
                      </td>
                      <td className="px-5 py-3 hidden lg:table-cell text-sm text-muted-foreground">
                        {book.availableCopies}/{book.totalCopies}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${book.available ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"}`}>
                          {book.available ? "Available" : "Out"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setEditBook(book); setShowModal(true); }} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(book.id)} className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
