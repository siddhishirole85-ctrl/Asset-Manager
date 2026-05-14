import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@/lib/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Library } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const mutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    mutation.mutate(
      { data: { email, password } },
      {
        onSuccess: (data: any) => {
          login(data.token);
          setLocation("/");
        },
        onError: () => {
          setError("Invalid email or password");
        },
      }
    );
  };

  const fillDemo = (type: "admin" | "user") => {
    if (type === "admin") {
      setEmail("admin@library.com");
      setPassword("admin123");
    } else {
      setEmail("user@library.com");
      setPassword("user1234");
    }
  };

  return (
    <div className="min-h-screen bg-sidebar flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6">
            <Library className="w-9 h-9 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-sidebar-foreground mb-4 font-serif">LibraryMS</h1>
          <p className="text-sidebar-foreground/60 text-lg leading-relaxed">
            Your smart library companion — discover books, track borrowings, and get AI-powered reading recommendations.
          </p>
        </div>

        <div className="mt-12 w-full max-w-sm space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40 text-center mb-4">Demo Credentials</p>
          <button
            type="button"
            onClick={() => fillDemo("admin")}
            className="w-full text-left px-4 py-3 rounded-lg bg-sidebar-accent/60 border border-sidebar-border hover:bg-sidebar-accent transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-sidebar-foreground">Admin Account</p>
                <p className="text-xs text-sidebar-foreground/50">admin@library.com</p>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary font-medium">Admin</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => fillDemo("user")}
            className="w-full text-left px-4 py-3 rounded-lg bg-sidebar-accent/60 border border-sidebar-border hover:bg-sidebar-accent transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-sidebar-foreground">User Account</p>
                <p className="text-xs text-sidebar-foreground/50">user@library.com</p>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-sidebar-accent text-sidebar-foreground font-medium">User</span>
            </div>
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Library className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-serif">LibraryMS</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
          <p className="text-muted-foreground text-sm mb-8">Sign in to access your library</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm transition-shadow"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            No account?{" "}
            <a href="/register" className="text-primary hover:underline font-medium">
              Register
            </a>
          </p>

          <div className="lg:hidden mt-8 space-y-2">
            <p className="text-xs text-muted-foreground text-center mb-3">Quick fill demo credentials:</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => fillDemo("admin")} className="flex-1 py-2 px-3 rounded border border-border text-xs text-muted-foreground hover:bg-muted transition-colors">
                Admin
              </button>
              <button type="button" onClick={() => fillDemo("user")} className="flex-1 py-2 px-3 rounded border border-border text-xs text-muted-foreground hover:bg-muted transition-colors">
                User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
