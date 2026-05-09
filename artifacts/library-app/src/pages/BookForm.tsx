import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import {
  useCreateBook,
  useUpdateBook,
  useGetBook,
  getGetBooksQueryKey,
  getGetCategoriesQueryKey,
  getGetBookQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ChevronLeft, BookPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  isbn: z.string().optional(),
  totalCopies: z.coerce.number().int().min(1, "At least 1 copy required"),
});

type FormData = z.infer<typeof schema>;

export default function BookForm({ id }: { id?: number }) {
  const isEditing = id !== undefined;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: existingBook, isLoading: loadingBook } = useGetBook(id!, {
    query: { enabled: isEditing, queryKey: getGetBookQueryKey(id!) },
  });

  const createMutation = useCreateBook();
  const updateMutation = useUpdateBook();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      author: "",
      category: "",
      description: "",
      isbn: "",
      totalCopies: 1,
    },
  });

  useEffect(() => {
    if (existingBook) {
      form.reset({
        title: existingBook.title,
        author: existingBook.author,
        category: existingBook.category,
        description: existingBook.description ?? "",
        isbn: existingBook.isbn ?? "",
        totalCopies: existingBook.totalCopies,
      });
    }
  }, [existingBook, form]);

  const onSubmit = (data: FormData) => {
    if (isEditing) {
      updateMutation.mutate(
        { id: id!, data },
        {
          onSuccess: () => {
            toast({ title: "Book updated" });
            queryClient.invalidateQueries({ queryKey: getGetBooksQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetCategoriesQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetBookQueryKey(id!) });
            setLocation("/books");
          },
          onError: () => toast({ title: "Update failed", variant: "destructive" }),
        }
      );
    } else {
      createMutation.mutate(
        { data },
        {
          onSuccess: () => {
            toast({ title: "Book added", description: `"${data.title}" added to catalog.` });
            queryClient.invalidateQueries({ queryKey: getGetBooksQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetCategoriesQueryKey() });
            setLocation("/books");
          },
          onError: () => toast({ title: "Create failed", variant: "destructive" }),
        }
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEditing && loadingBook) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <button
        onClick={() => setLocation("/books")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to books
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-primary/10 rounded-lg">
          <BookPlus className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isEditing ? "Edit Book" : "Add New Book"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? "Update book details" : "Add a book to the catalog"}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Book title" data-testid="input-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Author name" data-testid="input-author" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Fiction, Science" data-testid="input-category" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isbn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ISBN (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="978-..." data-testid="input-isbn" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalCopies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Copies</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min={1} data-testid="input-total-copies" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Brief description of the book"
                        rows={3}
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setLocation("/books")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} data-testid="button-submit">
                {isPending ? "Saving..." : isEditing ? "Save Changes" : "Add Book"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
