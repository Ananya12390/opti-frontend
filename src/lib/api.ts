const BASE = "https://opti-backend-1-g4i1.onrender.com";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("vg_token");
}

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: any = {
    ...(options.body instanceof URLSearchParams
      ? { "Content-Type": "application/x-www-form-urlencoded" }
      : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // ✅ FIXED LOGIN (STORE TOKEN)
  login: async (username: string, password: string) => {
    const body = new URLSearchParams({ username, password });

    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!res.ok) {
      throw new Error("Invalid credentials");
    }

    const data = await res.json();

    // ⭐ IMPORTANT: store token
    if (typeof window !== "undefined") {
      localStorage.setItem("vg_token", data.access_token);
      localStorage.setItem("vg_user", JSON.stringify(data.user));
    }

    return data;
  },

  me: () => req("/auth/me"),

  users: {
    list: () => req("/users"),
    create: (data: object) =>
      req("/users", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: number) =>
      req(`/users/${id}`, { method: "DELETE" }),
  },

  assets: {
    list: () => req("/assets"),
    get: (id: number) => req(`/assets/${id}`),
    create: (data: object) =>
      req("/assets", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: object) =>
      req(`/assets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) =>
      req(`/assets/${id}`, { method: "DELETE" }),
  },

  stats: () => req("/stats"),
  roles: () => req("/roles"),
};
