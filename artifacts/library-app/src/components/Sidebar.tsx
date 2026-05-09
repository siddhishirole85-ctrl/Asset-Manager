import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  BookOpen,
  BookMarked,
  Users,
  LogOut,
  Library,
  Sun,
  Moon,
  ClipboardList,
  PlusCircle,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Browse Books", href: "/books", icon: BookOpen },
  { label: "My Borrows", href: "/my-borrows", icon: BookMarked },
  { label: "Add Book", href: "/books/new", icon: PlusCircle, adminOnly: true },
  { label: "All Borrows", href: "/admin/borrows", icon: ClipboardList, adminOnly: true },
  { label: "Users", href: "/admin/users", icon: Users, adminOnly: true },
];

function NavLink({ item, active, onClick }: { item: NavItem; active: boolean; onClick?: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer
        ${active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

export function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-sidebar-border">
        <Library className="w-6 h-6 text-sidebar-primary flex-shrink-0" />
        <span className="font-bold text-base tracking-tight">LibraryMS</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {isAdmin && (
          <p className="text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-3 pb-2 pt-1">
            General
          </p>
        )}
        {visibleItems
          .filter((i) => !i.adminOnly)
          .map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href))}
              onClick={() => setMobileOpen(false)}
            />
          ))}

        {isAdmin && (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-3 pb-2 pt-4">
              Admin
            </p>
            {visibleItems
              .filter((i) => i.adminOnly)
              .map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={location === item.href}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
          </>
        )}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-4 space-y-2">
        <button
          onClick={toggleTheme}
          data-testid="button-toggle-theme"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors w-full"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>

        <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-sidebar-accent/40">
          <div className="w-7 h-7 rounded-full bg-sidebar-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate text-sidebar-foreground">{user?.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isAdmin && (
                <Badge className="text-[10px] px-1 py-0 bg-sidebar-primary text-white border-0 h-4">
                  Admin
                </Badge>
              )}
              <p className="text-[10px] text-sidebar-foreground/50 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            data-testid="button-logout"
            className="text-sidebar-foreground/40 hover:text-destructive transition-colors flex-shrink-0"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        data-testid="button-mobile-menu"
        className="md:hidden fixed top-4 left-4 z-50 bg-sidebar text-sidebar-foreground p-2 rounded-md shadow-md"
      >
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 flex-shrink-0">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 text-sidebar-foreground/60 hover:text-sidebar-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      <aside className="hidden md:flex w-60 flex-shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>
    </>
  );
}
