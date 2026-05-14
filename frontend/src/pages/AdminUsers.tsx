import { useListUsers } from "@/lib/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function AdminUsers() {
  const { data: users, isLoading } = useListUsers();
  const [search, setSearch] = useState("");

  const filtered = users?.filter((u) => {
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {users ? `${users.length} registered members` : "Loading..."}
          </p>
        </div>
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
          data-testid="input-search"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, idx) => (
                <tr
                  key={user.id}
                  data-testid={`row-user-${user.id}`}
                  className={`border-b border-border last:border-0 ${idx % 2 === 0 ? "bg-card" : "bg-muted/20"}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                        {user.name[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium text-foreground">{user.name}</span>
                    </div>
                    <span className="sm:hidden block text-xs text-muted-foreground mt-0.5 pl-11">{user.email}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge
                      className={user.role === "admin"
                        ? "bg-primary text-primary-foreground border-0 text-xs"
                        : "text-xs"}
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="font-medium text-muted-foreground">{search ? "No users found" : "No users registered"}</p>
        </div>
      )}
    </div>
  );
}
