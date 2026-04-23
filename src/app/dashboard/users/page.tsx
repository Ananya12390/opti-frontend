"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { User, Role } from "@/types";
import {
  Users,
  Plus,
  Trash2,
  Loader2,
  Shield,
} from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  Admin:
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  Manager:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Employee:
    "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
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
    role_id: roles[0]?.id || 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({
        ...f,
        [k]: k === "role_id" ? Number(e.target.value) : e.target.value,
      }));

  const inputCls =
    "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.users.create(form);
      onSave();
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Add New User</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {error && (
            <div className="text-red-500 text-sm bg-red-500/10 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {[
            ["name", "Full Name", "e.g. Jane Smith"],
            ["email", "Email", "jane@company.com"],
            ["username", "Username", "janesmith"],
            ["password", "Password", "Min 6 characters"],
          ].map(([k, l, p]) => (
            <div key={k}>
              <label className="text-xs text-muted-foreground mb-1 block">
                {l}
              </label>
              <input
                type={k === "password" ? "password" : "text"}
                value={(form as any)[k]}
                onChange={set(k)}
                placeholder={p}
                className={inputCls}
                required
              />
            </div>
          ))}

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Role
            </label>
            <select
              value={form.role_id}
              onChange={set("role_id")}
              className={inputCls}
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-lg bg-primary text-white text-sm flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Add User
            </button>
          </div>
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

    const load = async () => {
      try {
        const [u, r] = await Promise.all([
          api.users.list() as Promise<User[]>,
          api.roles() as Promise<Role[]>,
        ]);

        setUsers(u);
        setRoles(r);
      } catch (err) {
        console.error("Failed to load users/roles", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [hasPrivilege, router]);

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this user?")) return;

    await api.users.delete(id);
    setUsers((u) => u.filter((x) => x.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-sm text-muted-foreground">
            {users.length} users
          </p>
        </div>

        {hasPrivilege("manage:users") && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl"
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
            className="flex items-center justify-between p-4 border rounded-xl bg-card"
          >
            <div>
              <p className="font-medium">{u.name}</p>
              <p className="text-xs text-muted-foreground">{u.email}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs">@{u.username}</span>

              <span
                className={`text-xs px-2 py-1 rounded border ${
                  ROLE_COLORS[u.role.name] || ""
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
                <button
                  onClick={() => handleDelete(u.id)}
                  className="text-red-500 hover:bg-red-500/10 p-1 rounded"
                >
                  <Trash2 className="w-4 h-4" />
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
          onSave={() => {
            setShowModal(false);
            api.users.list().then((data) => setUsers(data as User[]));
          }}
        />
      )}
    </div>
  );
}
