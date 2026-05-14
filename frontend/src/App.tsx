import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DevDebugPanel } from "@/components/DevDebugPanel";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Books from "@/pages/books";
import BookDetail from "@/pages/book-detail";
import MyBorrows from "@/pages/my-borrows";
import Recommendations from "@/pages/recommendations";
import AdminBooks from "@/pages/admin/books";
import AdminBorrows from "@/pages/admin/borrows";
import AdminUsers from "@/pages/admin/users";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/" component={Dashboard} />
      <Route path="/books" component={Books} />
      <Route path="/books/:id" component={BookDetail} />
      <Route path="/my-borrows" component={MyBorrows} />
      <Route path="/recommendations" component={Recommendations} />
      <Route path="/admin/books" component={AdminBooks} />
      <Route path="/admin/borrows" component={AdminBorrows} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
          <DevDebugPanel />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
