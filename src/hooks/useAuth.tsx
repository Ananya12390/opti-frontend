"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
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
    const initAuth = async () => {
      const t = localStorage.getItem("vg_token");

      if (!t) {
        setIsLoading(false);
        return;
      }

      setToken(t);

      try {
        // ✅ FIX: explicitly handle unknown API response
        const me = await api.me();

        setUser(me as User);
      } catch (err) {
        console.error("Auth error:", err);

        localStorage.removeItem("vg_token");
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
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

  const hasPrivilege = (p: string) =>
    !!user?.role?.permissions?.includes(p);

  return (
    <Ctx.Provider
      value={{ user, token, login, logout, isLoading, hasPrivilege }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
