import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { setAuthTokenGetter } from "@/lib/api-client-react";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("library_token"));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("library_user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("library_token"));
  }, []);

  const login = (newToken: string, newUser: AuthUser) => {
    localStorage.setItem("library_token", newToken);
    localStorage.setItem("library_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("library_token");
    localStorage.removeItem("library_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAdmin: user?.role === "admin",
      isAuthenticated: !!token && !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
