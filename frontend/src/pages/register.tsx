import { useState } from "react";
import { useLocation } from "wouter";
import { useRegister } from "@/lib/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Library } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const mutation = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    mutation.mutate(
      { data: { name, email, password } },
      {
        onSuccess: (data: any) => {
          login(data.token);
          setLocation("/");
        },
        onError: (err: any) => {
          setError(err?.data?.error || "Registration failed. Email may already be in use.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Library className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold font-serif">LibraryMS</span>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-1">Create an account</h2>
        <p className="text-muted-foreground text-sm mb-8">Join the library and start discovering books</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
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
              minLength={6}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
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
            {mutation.isPending ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
