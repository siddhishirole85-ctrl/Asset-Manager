// @refresh reset
import { createContext, useContext, useEffect, useState } from "react";
import { useGetMe, getGetMeQueryKey, setAuthTokenGetter } from "@/lib/api-client-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
}

interface AuthContextType {
  user: User | null | undefined;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("library_token"));

  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("library_token"));
  }, []);

  const { data: user, isLoading } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: !!token,
      retry: false,
    },
  });

  const login = (newToken: string, _user?: User) => {
    localStorage.setItem("library_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("library_token");
    setToken(null);
  };

  const typedUser = user as User | null | undefined;
  const isAuthenticated = !!token && !!typedUser;
  const isAdmin = typedUser?.role === "admin";

  return (
    <AuthContext.Provider value={{ user: typedUser, isLoading, login, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
