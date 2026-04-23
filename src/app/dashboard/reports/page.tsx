"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Stats } from "@/types";
import {
  Package,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

export default function ReportsPage() {
  const { hasPrivilege } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      if (!hasPrivilege("view:reports")) {
        router.replace("/dashboard");
        return;
      }

      try {
        // ✅ FIX: remove unsafe unknown type
        const data = await api.stats();
        setStats(data as Stats);
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };

    loadStats();
  }, [hasPrivilege, router]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const utilizationPct = Math.round(
    (stats.assigned_assets / stats.total_assets) * 100 || 0
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Asset management overview and utilization metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fade-in">
        {[
          {
            icon: <Package className="w-5 h-5 text-violet-400" />,
            label: "Total Assets",
            value: stats.total_assets,
            cls: "stat-violet",
          },
          {
            icon: <Users className="w-5 h-5 text-blue-400" />,
            label: "Team Members",
            value: stats.total_users,
            cls: "stat-blue",
          },
          {
            icon: <CheckCircle className="w-5 h-5 text-green-400" />,
            label: "Assigned",
            value: stats.assigned_assets,
            cls: "stat-green",
          },
          {
            icon: <XCircle className="w-5 h-5 text-amber-400" />,
            label: "Unassigned",
            value: stats.unassigned_assets,
            cls: "stat-amber",
          },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border p-5 ${s.cls}`}>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Utilization */}
        <div className="rounded-2xl border border-border bg-card p-6 animate-fade-in">
          <h2 className="font-semibold text-foreground mb-1">
            Asset Utilization
          </h2>
          <p className="text-xs text-muted-foreground mb-6">
            How many assets are currently deployed
          </p>

          <div className="text-center mb-4">
            <span className="text-5xl font-bold text-primary">
              {utilizationPct}%
            </span>
            <p className="text-sm text-muted-foreground mt-1">
              utilization rate
            </p>
          </div>

          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${utilizationPct}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{stats.assigned_assets} assigned</span>
            <span>{stats.unassigned_assets} available</span>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="rounded-2xl border border-border bg-card p-6 animate-fade-in">
          <h2 className="font-semibold text-foreground mb-1">
            By Category
          </h2>
          <p className="text-xs text-muted-foreground mb-6">
            Asset distribution across categories
          </p>

          <div className="space-y-4">
            {Object.entries(stats.by_category)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, count]) => {
                const pct = Math.round(
                  (count / stats.total_assets) * 100 || 0
                );

                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-foreground font-medium">
                        {cat}
                      </span>
                      <span className="text-muted-foreground">
                        {count} ({pct}%)
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
