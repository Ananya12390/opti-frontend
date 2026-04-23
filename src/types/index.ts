export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  is_active: boolean;
  avatar_url: string | null;
  role: Role;
  created_at: string;
}

export interface Asset {
  id: number;
  name: string;
  category: string;
  serial_number: string;
  status: "available" | "assigned" | "maintenance" | "retired";
  condition: "new" | "good" | "fair" | "poor";
  assigned_to: number | null;
  assignee: User | null;
  purchase_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface Stats {
  total_assets: number;
  total_users: number;
  assigned_assets: number;
  unassigned_assets: number;
  by_category: Record<string, number>;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
