import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  BookOpen,
  LayoutDashboard,
  BookMarked,
  Sparkles,
  BookCopy,
  List,
  Users,
  LogOut,
  Library,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/books", label: "Browse Books", icon: BookOpen },
  { href: "/my-borrows", label: "My Borrows", icon: BookMarked },
  { href: "/recommendations", label: "AI Picks", icon: Sparkles },
];

const adminItems = [
  { href: "/admin/books", label: "Manage Books", icon: BookCopy },
  { href: "/admin/borrows", label: "All Borrows", icon: List },
  { href: "/admin/users", label: "Users", icon: Users },
];

export function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen sticky top-0">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Library className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-semibold text-sm text-sidebar-foreground leading-tight">LibraryMS</p>
          <p className="text-xs text-sidebar-foreground/50 leading-tight">Smart Library</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive(href)
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                Admin
              </p>
            </div>
            {adminItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive(href)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-primary">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/50 truncate capitalize">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="p-1 rounded text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
