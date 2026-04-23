"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Asset, Stats } from "@/types";
import {
  Package,
  Users,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Clock,
  Laptop,
  Phone,
  Monitor,
  Cpu,
} from "lucide-react";

/* ---------------- Stat Card ---------------- */

function StatCard({
  icon,
  label,
  value,
  sub,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  colorClass: string;
}) {
  return (
    <div className={`rounded-2xl border p-5 animate-fade-in ${colorClass}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          {icon}
        </div>
        <TrendingUp className="w-4 h-4 opacity-30" />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm font-medium text-foreground/80 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

/* ---------------- Icons ---------------- */

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Laptop: <Laptop className="w-4 h-4" />,
  Phone: <Phone className="w-4 h-4" />,
  Monitor: <Monitor className="w-4 h-4" />,
  Peripheral: <Cpu className="w-4 h-4" />,
};

const STATUS_CLASS: Record<string, string> = {
  available: "status-available",
  assigned: "status-assigned",
  maintenance: "status-maintenance",
  retired: "status-retired",
};

/* ---------------- Page ---------------- */

export default function DashboardPage() {
  const { user, hasPrivilege } = useAuth();

  const [stats, setStats] = useState<Stats | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);

  const isAdmin = hasPrivilege("view:all_assets");

  useEffect(() => {
    const loadData = async () => {
      try {
        // FIX 1: cast API response safely
        const assetData = (await api.assets.list()) as Asset[];
        setAssets(assetData);
      } catch (err) {
        console.error("Assets load failed", err);
      }

      try {
        if (isAdmin) {
          // FIX 2: cast stats safely
          const statData = (await api.stats()) as Stats;
          setStats(statData);
        }
      } catch (err) {
        console.error("Stats load failed", err);
      }
    };

    loadData();
  }, [isAdmin]);

  const myAssets = assets.filter((a) => a.assigned_to === user?.id);
  const recentAssets = assets.slice(0, 5);

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 18
      ? "Good afternoon"
      : "Good evening";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">👋</span>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting}, {user?.name ? user.name.split(" ")[0] : "User"}
          </h1>
        </div>

        <p className="text-muted-foreground">
          {isAdmin
            ? "Here's your asset management overview for today."
            : "Here's your personal gear overview."}
        </p>
      </div>

      {/* Admin stats */}
      {isAdmin && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Package className="w-5 h-5 text-violet-400" />}
            label="Total Assets"
            value={stats.total_assets}
            sub="Across all categories"
            colorClass="stat-violet"
          />

          <StatCard
            icon={<Users className="w-5 h-5 text-blue-400" />}
            label="Team Members"
            value={stats.total_users}
            sub="Active accounts"
            colorClass="stat-blue"
          />

          <StatCard
            icon={<CheckCircle className="w-5 h-5 text-green-400" />}
            label="Assigned"
            value={stats.assigned_assets}
            sub={`${Math.round(
              (stats.assigned_assets / stats.total_assets) * 100 || 0
            )}% utilization`}
            colorClass="stat-green"
          />

          <StatCard
            icon={<AlertCircle className="w-5 h-5 text-amber-400" />}
            label="Available"
            value={stats.unassigned_assets}
            sub="Ready to assign"
            colorClass="stat-amber"
          />
        </div>
      )}

      {/* Employee stats */}
      {!isAdmin && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard
            icon={<Package className="w-5 h-5 text-violet-400" />}
            label="My Assets"
            value={myAssets.length}
            sub="Assigned to you"
            colorClass="stat-violet"
          />

          <StatCard
            icon={<CheckCircle className="w-5 h-5 text-green-400" />}
            label="Active"
            value={myAssets.filter((a) => a.status === "assigned").length}
            sub="In good standing"
            colorClass="stat-green"
          />
        </div>
      )}

      {/* Assets list */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-sm text-foreground">
                {isAdmin ? "Recent Assets" : "My Gear"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAdmin
                  ? "Latest inventory entries"
                  : "Equipment assigned to you"}
              </p>
            </div>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="divide-y divide-border">
            {(isAdmin ? recentAssets : myAssets).map((a) => (
              <div
                key={a.id}
                className="px-5 py-3.5 flex items-center gap-4 hover:bg-muted/30"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {CATEGORY_ICONS[a.category] || (
                    <Package className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {a.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {a.serial_number}
                  </p>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded border ${
                    STATUS_CLASS[a.status]
                  }`}
                >
                  {a.status}
                </span>
              </div>
            ))}

            {(isAdmin ? recentAssets : myAssets).length === 0 && (
              <div className="px-5 py-8 text-center text-muted-foreground">
                No assets found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
