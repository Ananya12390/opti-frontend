# VaultGuard Frontend — Next.js 14 + Shadcn UI + RBAC

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Demo Credentials

| Username | Password    | Role     | Access |
|----------|-------------|----------|--------|
| admin    | admin123    | Admin    | Full — all sidebar items visible |
| manager  | manager123  | Manager  | Inventory + Reports, no Users/Settings |
| ben      | ben123      | Employee | My Gear only |
| priya    | priya123    | Employee | My Gear only |

## RBAC Architecture

The `useAuth` hook exposes `hasPrivilege(permission)`.

**Sidebar** filters nav items based on user privileges — restricted links are completely absent from the DOM for unauthorized users.

**Pages** double-check privileges on mount and redirect to `/dashboard` if the user lacks access.

### Frontend RBAC flow

```
Login → JWT stored → useAuth hydrated
  → Sidebar reads user.role.permissions
  → Nav items filtered: if no privilege → item hidden
  → Page mounts → checks privilege → redirect if lacking
```

## Design System

- **Colors**: Deep Indigo sidebar + Electric Violet primary accent
- **Light mode**: Clean white surfaces, soft gray backgrounds
- **Dark mode**: Near-black backgrounds, elevated card surfaces
- **Animations**: Subtle fade-in with staggered delays
- **Typography**: Inter with font-feature-settings for crisp rendering

## Stack

- Next.js 14 App Router
- Tailwind CSS with custom design tokens
- next-themes for dark/light mode
- Lucide React icons
- Radix UI primitives
