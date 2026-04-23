"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Asset, User } from "@/types";
import {
  Package,
  Plus,
  Search,
  Trash2,
  Edit,
  Loader2,
} from "lucide-react";

const STATUS_CLASS: Record<string, string> = {
  available: "status-available",
  assigned: "status-assigned",
  maintenance: "status-maintenance",
  retired: "status-retired",
};

/* ---------------- SAFE HELPERS ---------------- */
const toAssetArray = (data: unknown): Asset[] =>
  Array.isArray(data) ? (data as Asset[]) : [];

const toUserArray = (data: unknown): User[] =>
  Array.isArray(data) ? (data as User[]) : [];

/* ---------------- MODAL ---------------- */
function AssetModal({
  onClose,
  onSave,
  asset,
  users,
}: {
  onClose: () => void;
  onSave: () => void;
  asset?: Asset | null;
  users: User[];
}) {
  const [form, setForm] = useState({
    name: asset?.name || "",
    category: asset?.category || "Laptop",
    serial_number: asset?.serial_number || "",
    status: asset?.status || "available",
    condition: asset?.condition || "good",
    assigned_to: asset?.assigned_to ? String(asset.assigned_to) : "",
    purchase_date: asset?.purchase_date || "",
    notes: asset?.notes || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...form,
        assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
      };

      if (asset) await api.assets.update(asset.id, payload);
      else await api.assets.create(payload);

      onSave();
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg p-6 rounded-xl">
        <div className="flex justify-between mb-4">
          <h2 className="font-bold">
            {asset ? "Edit Asset" : "Add Asset"}
          </h2>
          <button onClick={onClose}>X</button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full border p-2"
            value={form.name}
            onChange={handleChange("name")}
            placeholder="Asset Name"
            required
          />

          <input
            className="w-full border p-2"
            value={form.serial_number}
            onChange={handleChange("serial_number")}
            placeholder="Serial Number"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded"
          >
            {loading ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              "Save"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function InventoryPage() {
  const { hasPrivilege } = useAuth();
  const router = useRouter();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; asset?: Asset | null }>({
    open: false,
  });

  useEffect(() => {
    if (!hasPrivilege("view:all_assets")) {
      router.replace("/dashboard");
      return;
    }

    const load = async () => {
      try {
        const [a, u] = await Promise.all([
          api.assets.list(),
          api.users.list(),
        ]);

        setAssets(toAssetArray(a));
        setUsers(toUserArray(u));
      } catch (err) {
        console.error("Inventory error:", err);
        setAssets([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [hasPrivilege, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between mb-6">
        <h1 className="text-xl font-bold">Inventory</h1>

        <button
          onClick={() => setModal({ open: true, asset: null })}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded"
        >
          <Plus className="w-4 h-4" />
          Add Asset
        </button>
      </div>

      <p>Total Assets: {assets.length}</p>

      {modal.open && (
        <AssetModal
          onClose={() => setModal({ open: false })}
          onSave={() => setModal({ open: false })}
          asset={modal.asset}
          users={users}
        />
      )}
    </div>
  );
}