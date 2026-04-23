"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Eye, EyeOff, Loader2, Lock, User } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      router.replace("/dashboard");
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = (u: string, p: string) => { setUsername(u); setPassword(p); };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 vault-sidebar flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(252 87% 57%) 0%, transparent 60%), radial-gradient(circle at 80% 20%, hsl(217 91% 60%) 0%, transparent 50%)" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-semibold text-white">VaultGuard</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Protect Every<br />
            <span style={{ color: "hsl(252 87% 67%)" }}>Asset.</span>
          </h1>
          <p className="text-white/50 text-lg leading-relaxed">
            Role-based access control for IT teams. Know who has what, and who can do what.
          </p>
        </div>
        {/* Feature pills */}
        <div className="relative z-10 space-y-3">
          {["🔐 Role-Based Access Control", "📦 Real-time Inventory", "👥 Team Management", "📊 Analytics & Reports"].map(f => (
            <div key={f} className="flex items-center gap-3 text-white/70 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 items-center justify-center mb-4">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-1">Sign in to your VaultGuard account</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</> : "Sign in →"}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Admin", u: "admin", p: "admin123", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
                { label: "Manager", u: "manager", p: "manager123", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
                { label: "Employee (Ben)", u: "ben", p: "ben123", color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
                { label: "Employee (Priya)", u: "priya", p: "priya123", color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
              ].map(d => (
                <button key={d.u} onClick={() => demoLogin(d.u, d.p)}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98] ${d.color}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
