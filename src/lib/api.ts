const BASE = "http://localhost:8000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("vg_token");
}

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  login: (username: string, password: string) => {
    const body = new URLSearchParams({ username, password });
    return fetch(`${BASE}/auth/login`, {
      method: "POST",
      body,
    }).then(async (r) => {
      if (!r.ok) throw new Error("Invalid credentials");
      return r.json();
    });
  },
  me: () => req<import("@/types").User>("/auth/me"),
  users: {
    list: () => req<import("@/types").User[]>("/users"),
    create: (data: object) => req("/users", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: number) => req(`/users/${id}`, { method: "DELETE" }),
  },
  assets: {
    list: () => req<import("@/types").Asset[]>("/assets"),
    get: (id: number) => req<import("@/types").Asset>(`/assets/${id}`),
    create: (data: object) => req("/assets", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: object) => req(`/assets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => req(`/assets/${id}`, { method: "DELETE" }),
  },
  stats: () => req<import("@/types").Stats>("/stats"),
  roles: () => req<import("@/types").Role[]>("/roles"),
};
