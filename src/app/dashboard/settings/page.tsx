"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Settings, Shield, Bell, Palette, Database } from "lucide-react";

export default function SettingsPage() {
  const { hasPrivilege, user } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!hasPrivilege("manage:settings")) router.replace("/dashboard"); }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">System configuration — Admin access only</p>
      </div>

      <div className="grid gap-4 animate-fade-in animation-delay-100">
        {[
          { icon: <Shield className="w-5 h-5 text-primary" />, title: "Security & RBAC", desc: "Manage roles, permissions and access control policies", badge: "Active" },
          { icon: <Bell className="w-5 h-5 text-blue-400" />, title: "Notifications", desc: "Configure email alerts for asset assignments and changes", badge: "Configure" },
          { icon: <Palette className="w-5 h-5 text-pink-400" />, title: "Appearance", desc: "Customize branding, colors and dashboard themes", badge: "Custom" },
          { icon: <Database className="w-5 h-5 text-green-400" />, title: "Data & Backup", desc: "Export asset inventory, manage backups and retention", badge: "Export" },
        ].map(s => (
          <div key={s.title} className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/30 cursor-pointer transition-all group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">{s.icon}</div>
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">{s.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            </div>
            <span className="text-xs px-3 py-1.5 rounded-lg bg-secondary border border-border text-muted-foreground">{s.badge}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 animate-fade-in animation-delay-200">
        <div className="flex items-start gap-3">
          <Settings className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">This page is protected by RBAC</p>
            <p className="text-xs text-muted-foreground mt-1">
              You can view this because you hold the <code className="bg-muted px-1 py-0.5 rounded text-xs">manage:settings</code> privilege.
              Employees and Managers cannot access this page — the link won&apos;t even appear in their sidebar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
