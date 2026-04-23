"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { User, Role } from "@/types";
import { Plus, Trash2, Loader2, Shield } from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  Manager: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Employee: "bg-green-500/10 text-green-600 border-green-500/20",
};

/* ---------------- Add User Modal ---------------- */

function AddUserModal({
  onClose,
  onSave,
  roles,
}: {
  onClose: () => void;
  onSave: () => void;
  roles: Role[];
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role_id: roles[0]?.id ?? 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({
        ...prev,
        [key]: key === "role_id" ? Number(e.target.value) : e.target.value,
      }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.users.create(form);
      onSave();
    } catch (err: any) {
      setError(err?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card border rounded-2xl w-full max-w-md">
        <div className="flex justify-between px-6 py-4 border-b">
          <h2 className="font-semibold">Add User</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {error && (
            <div className="text-red-500 text-sm bg-red-500/10 p-2 rounded">
              {error}
            </div>
          )}

          {["name", "email", "username", "password"].map((k) => (
            <input
              key={k}
              type={k === "password" ? "password" : "text"}
              placeholder={k}
              value={(form as any)[k]}
              onChange={handleChange(k)}
              className="w-full p-2 border rounded"
              required
            />
          ))}

          <select
            value={form.role_id}
            onChange={handleChange("role_id")}
            className="w-full p-2 border rounded"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <button
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-lg"
          >
            {loading ? "Adding..." : "Add User"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Main Page ---------------- */

export default function UsersPage() {
  const { hasPrivilege } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!hasPrivilege("view:all_users")) {
      router.replace("/dashboard");
      return;
    }

    const loadData = async () => {
      try {
        // ✅ FIX: force correct typing here
        const usersData = (await api.users.list()) as User[];
        const rolesData = (await api.roles()) as Role[];

        setUsers(usersData);
        setRoles(rolesData);
      } catch (err) {
        console.error("Failed to load users/roles", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [hasPrivilege, router]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete user?")) return;

    await api.users.delete(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Team Members</h1>

        {hasPrivilege("manage:users") && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        )}
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {users.map((u) => (
          <div
            key={u.id}
            className="flex justify-between p-4 border rounded-xl bg-card"
          >
            <div>
              <p className="font-medium">{u.name}</p>
              <p className="text-xs text-muted-foreground">{u.email}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs">@{u.username}</span>

              <span
                className={`text-xs px-2 py-1 border rounded ${
                  ROLE_COLORS[u.role.name] ?? ""
                }`}
              >
                <Shield className="w-3 h-3 inline mr-1" />
                {u.role.name}
              </span>

              <div
                className={`w-2 h-2 rounded-full ${
                  u.is_active ? "bg-green-500" : "bg-red-500"
                }`}
              />

              {hasPrivilege("manage:users") && (
                <button onClick={() => handleDelete(u.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <AddUserModal
          roles={roles}
          onClose={() => setShowModal(false)}
          onSave={async () => {
            setShowModal(false);
            const refreshed = (await api.users.list()) as User[];
            setUsers(refreshed);
          }}
        />
      )}
    </div>
  );
}
