"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Asset } from "@/types";
import { Laptop, Package, Calendar, FileText, Loader2 } from "lucide-react";

const STATUS_CLASS: Record<string, string> = {
  available: "status-available",
  assigned: "status-assigned",
  maintenance: "status-maintenance",
  retired: "status-retired",
};

const CONDITION_CLASS: Record<string, string> = {
  new: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  good: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  fair: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  poor: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

export default function MyGearPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const data = await api.assets.list();

        const filtered = (data as Asset[]).filter(
          (x) => x.assigned_to === user?.id
        );

        setAssets(filtered);
      } catch (err) {
        console.error("Failed to load assets:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, [user]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">My Gear</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {assets.length === 0
            ? "No assets assigned to you yet"
            : `${assets.length} item${assets.length === 1 ? "" : "s"} assigned to you`}
        </p>
      </div>

      {assets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-16 text-center animate-fade-in">
          <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No gear assigned yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Contact your manager to get assets assigned
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 animate-fade-in animation-delay-100">
          {assets.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl border border-border bg-card p-5 hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Laptop className="w-6 h-6" />
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                      STATUS_CLASS[a.status]
                    }`}
                  >
                    {a.status}
                  </span>

                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                      CONDITION_CLASS[a.condition]
                    }`}
                  >
                    {a.condition}
                  </span>
                </div>
              </div>

              <h3 className="font-semibold text-foreground mb-1">
                {a.name}
              </h3>

              <p className="text-xs text-muted-foreground font-mono mb-3">
                {a.serial_number}
              </p>

              <div className="space-y-1.5 pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Package className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{a.category}</span>
                </div>

                {a.purchase_date && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                      Purchased{" "}
                      {new Date(a.purchase_date).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}

                {a.notes && (
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{a.notes}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
