import { PLUGIN_REGISTRY, ALL_PERMISSIONS, type PluginRegistry } from "./data/plugins";

export type AppConfig = {
  brand: { name: string; tagline: string; accent: string; logo: string };
  ui: { showOnboarding: boolean; compactMode: boolean; defaultPanelOpen: boolean };
  extraPlugins: PluginRegistry[];
};

const DEFAULT: AppConfig = {
  brand: { name: "LuckPerms Visual Tree", tagline: "studio · 1.0", accent: "#22e08c", logo: "⚡" },
  ui: { showOnboarding: true, compactMode: true, defaultPanelOpen: true },
  extraPlugins: [],
};

let _config: AppConfig = DEFAULT;
let _loaded = false;
let _listeners: (() => void)[] = [];

export function getConfig(): AppConfig { return _config; }

export function onConfigChange(fn: () => void) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(x => x !== fn); };
}

function applyExtras(extras: PluginRegistry[]) {
  for (const p of extras) {
    if (PLUGIN_REGISTRY.find(x => x.plugin === p.plugin)) continue;
    PLUGIN_REGISTRY.push(p);
    for (const c of p.categories) for (const perm of c.permissions) {
      ALL_PERMISSIONS.push({ ...perm, plugin: p.plugin } as any);
    }
  }
}

export async function loadConfig() {
  if (_loaded) return _config;
  _loaded = true;
  // user override stored in localStorage
  const localRaw = typeof window !== "undefined" ? localStorage.getItem("lpvt-config") : null;
  try {
    const res = await fetch("/config.json");
    if (res.ok) {
      const remote = await res.json();
      _config = { ...DEFAULT, ...remote, brand: { ...DEFAULT.brand, ...(remote.brand||{}) }, ui: { ...DEFAULT.ui, ...(remote.ui||{}) } };
    }
  } catch {}
  if (localRaw) {
    try {
      const local = JSON.parse(localRaw);
      _config = { ..._config, ...local, brand: { ..._config.brand, ...(local.brand||{}) }, ui: { ..._config.ui, ...(local.ui||{}) } };
    } catch {}
  }
  applyExtras(_config.extraPlugins || []);
  applyAccent(_config.brand.accent);
  _listeners.forEach(fn => fn());
  return _config;
}

export function updateConfig(patch: Partial<AppConfig>) {
  _config = {
    ..._config, ...patch,
    brand: { ..._config.brand, ...(patch.brand||{}) },
    ui: { ..._config.ui, ...(patch.ui||{}) },
  };
  if (patch.brand?.accent) applyAccent(patch.brand.accent);
  if (patch.extraPlugins) applyExtras(patch.extraPlugins);
  if (typeof window !== "undefined") localStorage.setItem("lpvt-config", JSON.stringify(_config));
  _listeners.forEach(fn => fn());
}

// hex -> oklch (rough). We just inject as CSS var override.
function applyAccent(hex: string) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--brand-accent", hex);
  // override the green tokens to follow brand
  root.style.setProperty("--primary", hex);
  root.style.setProperty("--ring", hex);
  root.style.setProperty("--success", hex);
  root.style.setProperty("--accent-green", hex);
}