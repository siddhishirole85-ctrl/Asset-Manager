import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Books from "@/pages/Books";
import BookForm from "@/pages/BookForm";
import MyBorrows from "@/pages/MyBorrows";
import AdminBorrows from "@/pages/AdminBorrows";
import AdminUsers from "@/pages/AdminUsers";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function AuthRedirect() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Redirect to="/dashboard" /> : <Redirect to="/login" />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthRedirect} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/books/new">
        <ProtectedRoute adminOnly>
          <BookForm />
        </ProtectedRoute>
      </Route>

      <Route path="/books/:id/edit">
        {(params) => (
          <ProtectedRoute adminOnly>
            <BookForm id={parseInt(params.id, 10)} />
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/books">
        <ProtectedRoute>
          <Books />
        </ProtectedRoute>
      </Route>

      <Route path="/my-borrows">
        <ProtectedRoute>
          <MyBorrows />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/borrows">
        <ProtectedRoute adminOnly>
          <AdminBorrows />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/users">
        <ProtectedRoute adminOnly>
          <AdminUsers />
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
