"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { User, Role } from "@/types";
import { Users, Plus, Trash2, Loader2, X, Shield } from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  Manager: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Employee: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
};

function AddUserModal({ onClose, onSave, roles }: { onClose: () => void; onSave: () => void; roles: Role[] }) {
  const [form, setForm] = useState({ name: "", email: "", username: "", password: "", role_id: roles[0]?.id || 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: k === "role_id" ? Number(e.target.value) : e.target.value }));
  const inputCls = "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try { await api.users.create(form); onSave(); }
    catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Add New User</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {error && <div className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-lg">{error}</div>}
          {[["name","Full Name","e.g. Jane Smith"],["email","Email","jane@company.com"],["username","Username","janesmith"],["password","Password","Min 6 characters"]].map(([k,l,p]) => (
            <div key={k}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{l}</label>
              <input type={k === "password" ? "password" : "text"} value={(form as any)[k]} onChange={set(k)} placeholder={p} className={inputCls} required />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
            <select value={form.role_id} onChange={set("role_id")} className={inputCls}>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { hasPrivilege } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!hasPrivilege("view:all_users")) { router.replace("/dashboard"); return; }
    Promise.all([api.users.list(), api.roles()]).then(([u, r]) => { setUsers(u); setRoles(r); }).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this user?")) return;
    await api.users.delete(id);
    setUsers(u => u.filter(x => x.id !== id));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Members</h1>
          <p className="text-muted-foreground text-sm mt-1">{users.length} users across all roles</p>
        </div>
        {hasPrivilege("manage:users") && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all">
            <Plus className="w-4 h-4" /> Add User
          </button>
        )}
      </div>

      <div className="grid gap-3 animate-fade-in animation-delay-100">
        {users.map(u => (
          <div key={u.id} className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
              {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm">{u.name}</p>
              <p className="text-xs text-muted-foreground">{u.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <code className="text-xs text-muted-foreground hidden sm:block">@{u.username}</code>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${ROLE_COLORS[u.role.name] || "bg-gray-500/10"}`}>
                <Shield className="w-2.5 h-2.5" />{u.role.name}
              </span>
              <div className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-green-500" : "bg-red-500"}`} />
              {hasPrivilege("manage:users") && (
                <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Role legend */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-5 animate-fade-in animation-delay-200">
        <h3 className="text-sm font-semibold text-foreground mb-4">Role Permissions Matrix</h3>
        <div className="grid gap-3">
          {roles.map(r => (
            <div key={r.id} className="flex items-start gap-3">
              <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border mt-0.5 ${ROLE_COLORS[r.name] || ""}`}>{r.name}</span>
              <div className="flex flex-wrap gap-1">
                {r.permissions.map(p => (
                  <code key={p} className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground">{p}</code>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && <AddUserModal onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); api.users.list().then(setUsers); }} roles={roles} />}
    </div>
  );
}
