"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Shield, LayoutDashboard, Package, Users, BarChart3,
  Settings, Laptop, LogOut, ChevronRight, Moon, Sun, Zap
} from "lucide-react";
import { useTheme } from "next-themes";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  privilege?: string;
  badge?: string;
}

const NAV_GROUPS = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    ] as NavItem[],
  },
  {
    label: "Assets",
    items: [
      { href: "/dashboard/inventory", label: "Inventory", icon: <Package className="w-4 h-4" />, privilege: "view:all_assets" },
      { href: "/dashboard/my-gear", label: "My Gear", icon: <Laptop className="w-4 h-4" />, privilege: "view:my_gear" },
    ] as NavItem[],
  },
  {
    label: "People",
    items: [
      { href: "/dashboard/users", label: "All Users", icon: <Users className="w-4 h-4" />, privilege: "view:all_users" },
    ] as NavItem[],
  },
  {
    label: "Insights",
    items: [
      { href: "/dashboard/reports", label: "Reports", icon: <BarChart3 className="w-4 h-4" />, privilege: "view:reports" },
    ] as NavItem[],
  },
  {
    label: "System",
    items: [
      { href: "/dashboard/settings", label: "Settings", icon: <Settings className="w-4 h-4" />, privilege: "manage:settings" },
    ] as NavItem[],
  },
];

const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Manager: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Employee: "bg-green-500/20 text-green-300 border-green-500/30",
};

export function Sidebar() {
  const { user, hasPrivilege, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => { logout(); router.replace("/login"); };

  const canSee = (item: NavItem) => {
    if (!item.privilege) return true;
    return hasPrivilege(item.privilege);
  };

  const roleColor = user ? (ROLE_COLORS[user.role.name] || "bg-gray-500/20 text-gray-300") : "";

  return (
    <aside className="vault-sidebar w-64 min-h-screen flex flex-col border-r border-white/5">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="text-white font-semibold text-sm">VaultGuard</span>
            <div className="flex items-center gap-1 mt-0.5">
              <Zap className="w-2.5 h-2.5 text-primary/60" />
              <span className="text-[10px] text-white/30 font-mono">v1.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* User pill */}
      {user && (
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
            <div className="w-8 h-8 rounded-lg bg-primary/30 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
              {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-medium truncate">{user.name}</p>
              <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded border mt-0.5 ${roleColor}`}>
                {user.role.name}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {NAV_GROUPS.map(group => {
          const visible = group.items.filter(canSee);
          if (visible.length === 0) return null;
          return (
            <div key={group.label}>
              <p className="vault-nav-group-label px-2 mb-2">{group.label}</p>
              <div className="space-y-0.5">
                {visible.map(item => {
                  const active = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href}
                      className={`vault-nav-item flex items-center gap-3 px-3 py-2 text-sm ${active ? "active" : ""}`}>
                      <span className="opacity-80">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="vault-nav-item w-full flex items-center gap-3 px-3 py-2 text-sm">
          {theme === "dark" ? <Sun className="w-4 h-4 opacity-80" /> : <Moon className="w-4 h-4 opacity-80" />}
          <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
