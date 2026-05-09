import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Library, AlertCircle } from "lucide-react";
import { useState } from "react";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const registerMutation = useRegister();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = (data: FormData) => {
    setError(null);
    registerMutation.mutate(
      { data },
      {
        onSuccess: (res) => {
          login(res.token, res.user as Parameters<typeof login>[1]);
          setLocation("/dashboard");
        },
        onError: (err: unknown) => {
          const e = err as { data?: { error?: string }; message?: string };
          setError(e?.data?.error ?? e?.message ?? "Registration failed");
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-sidebar p-10 text-sidebar-foreground">
        <div className="flex items-center gap-3">
          <Library className="w-8 h-8 text-sidebar-primary" />
          <span className="text-xl font-bold tracking-tight">LibraryMS</span>
        </div>
        <div>
          <h2 className="text-3xl font-light leading-snug text-sidebar-foreground/90 mb-3">
            Join the library community
          </h2>
          <p className="text-sidebar-foreground/60 text-sm leading-relaxed">
            Browse thousands of books, borrow and return with ease, and track your reading history — all in one place.
          </p>
        </div>
        <p className="text-sidebar-foreground/40 text-xs">
          Library Management System &copy; {new Date().getFullYear()}
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Library className="w-7 h-7 text-primary" />
            <span className="text-lg font-bold">LibraryMS</span>
          </div>
          <h1 className="text-2xl font-bold mb-1 text-foreground">Create an account</h1>
          <p className="text-muted-foreground text-sm mb-8">Sign up to start borrowing books today</p>

          {error && (
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-md px-3 py-2.5 mb-5 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Jane Smith" data-testid="input-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="you@example.com" data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="Min 6 characters" data-testid="input-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={registerMutation.isPending}
                data-testid="button-submit"
              >
                {registerMutation.isPending ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
              data-testid="link-login"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
