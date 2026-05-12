# ⚡ LuckPerms Visual Tree

> A modern, no-code, family-tree style permission studio for Minecraft servers running [LuckPerms](https://luckperms.net). Visually manage groups, users, inheritance, and plugin permissions — without ever touching YAML or typing `/lp` commands.

![status](https://img.shields.io/badge/status-production_ready-22e08c)
![stack](https://img.shields.io/badge/stack-React_19_·_TanStack_Start_·_Tailwind_v4-22d3ee)

---

## Table of Contents

1. [Features](#features)
2. [Screenshots & Workflow](#screenshots--workflow)
3. [Quick start](#quick-start)
4. [Configuration (`config.json`)](#configuration-configjson)
5. [Importing & Exporting](#importing--exporting)
6. [Plugin Registry](#plugin-registry)
7. [Keyboard Shortcuts](#keyboard-shortcuts)
8. [Deployment](#deployment)
9. [Tech Stack](#tech-stack)
10. [Roadmap](#roadmap)

---

## Features

### 🌳 Family-Tree Visualization
- Real React-Flow canvas with hierarchical, weight-driven layout
- Drag handles between nodes to **create inheritance** in one motion
- Group → Group connections create parent-child links
- Group → User connections add members instantly
- Animated dashed edges show direction of inheritance
- Mini-map, fit-to-view, and grid background
- Quick action buttons on the dashboard let you create new groups or users instantly

### 🧠 Conflict Debugger (one-click fix)
- Detects circular inheritance, deny-vs-allow conflicts, duplicate nodes, wildcard shadowing
- Each issue offers a contextual **"⚡ Auto-fix"** button
- "Auto-fix all" sweeps the entire workspace
- Live error/warning counts in the status bar

### 🪄 No-Code Permission Picker
- Searchable popover across all registered plugins
- Permission **autocomplete** (toggleable in Settings) when typing custom nodes
- Visual indicators for wildcards, denies, and temporary nodes

### 🔌 Built-In Plugin Registry
EssentialsX · WorldEdit · WorldGuard · LuckPerms · LiteBans · CoreProtect · mcMMO · DiscordSRV · TAB · Towny · Vault · PlaceholderAPI · Multiverse · ProtocolLib · GriefPrevention · Citizens · ChestShop · SuperVanish · Skript · ViaVersion — and you can register your own via `config.json` or the in-app Settings.

### 📥 Import / Export with Live Preview
- **Visual Tree JSON** — full project save/restore
- **LuckPerms JSON** — drop-in compatible with `/lp import`
- **YAML** — human-readable config (parses LP-style and `plugin.yml`)
- **/lp commands** — paste straight into your server console
- Auto-detects format on paste, **live previews** parsed groups & users, supports **merge** or **replace** modes
- Templates (Survival, SMP, Network, Minigames…) — merge into any project, never wipes existing groups

### 🎨 Modern, Premium UI
- Graphite + neon green palette with subtle glints, soft glows, animated gradient background
- Resizable, toggleable sidebars and bottom dock (`⌘B`, `⌘/`)
- Custom modal/prompt system — no native browser `alert()` or `prompt()`
- Sonner toasts with action buttons replace dangerous confirms
- Onboarding tour for first-time users + replayable from Settings

### 🧪 Permission Simulator
Pick a user + permission node + world, get an instant verdict — with the exact reason chain (which group, which weight, which wildcard matched).

### ⚙️ Customizable Branding
Edit `public/config.json` or use the in-app **Settings → Branding** panel to change the app name, accent color, tagline, and add custom plugins.

### ⚡ Performance
- Memoized validation & layout computation
- Virtualized-ready permission lists
- Persisted state via `localStorage` (instant cold start)
- Responsive from 49″ ultrawide down to mobile

---

## Quick start

Requirements: [Bun](https://bun.sh) ≥ 1.1 (or Node ≥ 20).

```bash
bun install
bun run dev
```

The dev server starts on `http://localhost:8080`. Open the app, hit the onboarding tour, and start editing.

---

## Configuration (`config.json`)

`public/config.json` is loaded at runtime — edit it once and every visitor of your deployment sees the new branding without rebuilding.

```jsonc
{
  "brand": {
    "name": "Acme Network Permissions",
    "tagline": "internal staff tool",
    "accent": "#22e08c",
    "logo": "⚡"
  },
  "ui": {
    "showOnboarding": true,
    "compactMode": true,
    "defaultPanelOpen": true,
    "permissionAutocomplete": true,
    "backgroundAnim": true
  },
  "extraPlugins": [
    {
      "plugin": "MyCustomPlugin",
      "version": "1.0",
      "color": "#ff6b35",
      "icon": "Zap",
      "categories": [
        {
          "name": "Admin",
          "permissions": [
            { "node": "myplugin.use", "description": "Use the plugin", "default": "true" },
            { "node": "myplugin.admin", "description": "Admin commands", "default": "op" },
            { "node": "myplugin.*", "description": "All myplugin perms", "wildcard": true }
          ]
        }
      ]
    }
  ]
}
```

User-level overrides (per browser) are stored in `localStorage` under `lpvt-config` and merged on top of the file.

---

## Importing & Exporting

| Format            | Round-trip | Use case                              |
| ----------------- | ---------- | ------------------------------------- |
| Visual Tree JSON  | ✅          | Backups, version control              |
| LuckPerms JSON    | ✅          | Drop into `/lp import`                |
| YAML              | ⚠️ partial | Manual editing, plugin.yml ingestion |
| /lp commands      | ⚠️ one-way | Paste in console / setup scripts      |

**Tip:** use **merge mode** when applying templates — existing groups keep their permissions, new groups are added with re-mapped IDs and de-duplicated permission nodes.

---

## Plugin Registry

The registry includes **20+ plugins and 200+ permissions** out of the box. To add one of your own:

1. Open **Settings → Custom plugins → Add custom plugin**, OR
2. Edit `public/config.json` → `extraPlugins`

New permissions immediately appear in the picker, simulator, and importer.

---

## Keyboard Shortcuts

| Shortcut          | Action                  |
| ----------------- | ----------------------- |
| `⌘K` / `Ctrl K`   | Search                  |
| `⌘Z` / `Ctrl Z`   | Undo                    |
| `⇧⌘Z` / `Ctrl ⇧Z` | Redo                    |
| `⌘B` / `Ctrl B`   | Toggle left explorer    |
| `⌘/` / `Ctrl /`   | Toggle right inspector  |
| `Esc`             | Close any modal         |

---

## Deployment

This app is a static-friendly TanStack Start project — it works on any modern host.

### Vercel
```bash
npm install
npm install -g vercel
vercel login
vercel --prod
```
If Vercel does not auto-detect the build, use the `vercel-build` script:
```bash
npx vercel --prod --build-command "npm run vercel-build" --output dist
```

This repo also includes `vercel.json` with a SPA fallback:
- `@vercel/static-build` for the Vite output
- `routes` with `handle: filesystem` so static assets are served first
- index fallback for client-side routing

### Netlify
This repository includes a `netlify.toml` file that configures the deploy output and SPA fallback. Use Netlify if you want a non-Vercel static host.

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = true
```

Deploy from the command line:
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Fallback hosting (if Vercel fails)
Use any static host by building locally and deploying `dist/`.

#### Cloudflare Pages
```bash
npm run build
wrangler pages deploy dist
```

#### Manual deploy
Build locally and upload the `dist/` folder to any static host or file server.
```bash
npm run build
```

### Docker (any VPS)
```dockerfile
FROM oven/bun:1 as builder
WORKDIR /app
COPY . .
RUN bun install && bun run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```
```bash
docker build -t lpvt .
docker run -p 80:80 lpvt
```

### GitHub Pages
```bash
bun run build
# push the contents of dist/ to a `gh-pages` branch
```

The whole app is client-side: no backend, no database, no API keys. State persists in the browser via `localStorage`.

---

## Tech Stack

- **React 19** + **TanStack Start** (file-based routing, SSR-ready)
- **Vite 7** for bundling
- **Tailwind CSS v4** with native CSS-first theming (`oklch` palette)
- **Zustand** + persist middleware for state
- **React Flow** for the canvas
- **Framer Motion** for animations
- **Radix UI** + **shadcn/ui** primitives
- **Sonner** for toasts
- **Lucide** icons
- **react-resizable-panels** for the IDE-style layout

---

## Roadmap

- [ ] Real-time multi-user editing (CRDT)
- [ ] LuckPerms web-editor link import (paste an `https://luckperms.net/editor/...` URL)
- [ ] PostgreSQL/MySQL direct sync (read-only first)
- [ ] Permission heat-map (which groups grant the most)
- [ ] Audit log / change diff between versions
- [ ] Track-promotion UI (drag to next rank)
- [ ] iOS-style draggable floating modals (in progress)

---

## License

MIT — do whatever, just don't claim you wrote it.

> Built for server admins who got tired of hand-editing `groups.yml`.
