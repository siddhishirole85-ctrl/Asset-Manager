import { useListUsers } from "@/lib/api-client-react";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Users } from "lucide-react";

export default function AdminUsers() {
  const { data: users, isLoading } = useListUsers();

  return (
    <ProtectedRoute adminOnly>
      <Layout>
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground font-serif">Users</h1>
            <p className="text-muted-foreground text-sm mt-1">{(users as any[])?.length ?? 0} registered members</p>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-card border border-border rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">User</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(users as any[])?.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-primary">{user.name?.charAt(0)?.toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${user.role === "admin" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!users || (users as any[]).length === 0) && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No users found
                </div>
              )}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
