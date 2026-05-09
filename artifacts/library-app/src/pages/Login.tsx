import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Library, AlertCircle } from "lucide-react";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const loginMutation = useLogin();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: FormData) => {
    setError(null);
    loginMutation.mutate(
      { data },
      {
        onSuccess: (res) => {
          login(res.token, res.user as Parameters<typeof login>[1]);
          setLocation("/dashboard");
        },
        onError: (err: unknown) => {
          const e = err as { data?: { error?: string }; message?: string };
          setError(e?.data?.error ?? e?.message ?? "Login failed");
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
          <blockquote className="text-2xl font-light leading-relaxed text-sidebar-foreground/80 mb-4">
            "A library is not a luxury but one of the necessities of life."
          </blockquote>
          <p className="text-sidebar-foreground/50 text-sm">— Henry Ward Beecher</p>
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
          <h1 className="text-2xl font-bold mb-1 text-foreground">Welcome back</h1>
          <p className="text-muted-foreground text-sm mb-8">Sign in to your account to continue</p>

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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="you@example.com"
                        data-testid="input-email"
                      />
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
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        data-testid="input-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={loginMutation.isPending}
                data-testid="button-submit"
              >
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-primary font-medium hover:underline"
              data-testid="link-register"
            >
              Create account
            </Link>
          </p>

          <div className="mt-8 p-3 bg-muted/60 rounded-md text-xs text-muted-foreground">
            <p className="font-medium mb-1">Demo credentials</p>
            <p>Admin: admin@library.com / admin123</p>
            <p>User: user@library.com / user1234</p>
          </div>
        </div>
      </div>
    </div>
  );
}
