"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/types";
import { api } from "@/lib/api";

interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  hasPrivilege: (p: string) => boolean;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("vg_token");
    if (t) {
      setToken(t);
      api.me().then(setUser).catch(() => { localStorage.removeItem("vg_token"); }).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const data = await api.login(username, password);
    localStorage.setItem("vg_token", data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("vg_token");
    setToken(null);
    setUser(null);
  };

  const hasPrivilege = (p: string) => !!user?.role.permissions.includes(p);

  return <Ctx.Provider value={{ user, token, login, logout, isLoading, hasPrivilege }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
