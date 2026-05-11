import type { Group, User, PermissionNode } from "./store";

const uid = () => Math.random().toString(36).slice(2, 10);

// ---------- EXPORT ----------
export function exportJSON(groups: Group[], users: User[]): string {
  return JSON.stringify({ format: "luckperms-visual-tree", version: 1, groups, users }, null, 2);
}

export function exportLuckPermsJSON(groups: Group[], users: User[]): string {
  // LuckPerms-compatible flat export
  const out = {
    groups: groups.map(g => ({
      name: g.name,
      weight: g.weight,
      displayName: g.displayName,
      prefix: g.prefix,
      suffix: g.suffix,
      parents: g.parents.map(pid => groups.find(x => x.id === pid)?.name).filter(Boolean),
      permissions: g.permissions.map(serializeNode),
    })),
    users: users.map(u => ({
      uniqueId: u.uuid,
      username: u.username,
      parentGroups: u.groups.map(gid => groups.find(x => x.id === gid)?.name).filter(Boolean),
      permissions: u.permissions.map(serializeNode),
    })),
  };
  return JSON.stringify(out, null, 2);
}

export function exportCommands(groups: Group[], users: User[]): string {
  const lines: string[] = ["# LuckPerms commands export", `# Generated ${new Date().toISOString()}`, ""];
  for (const g of groups) {
    lines.push(`# === group: ${g.name} ===`);
    lines.push(`/lp creategroup ${g.name}`);
    if (g.weight) lines.push(`/lp group ${g.name} setweight ${g.weight}`);
    if (g.displayName) lines.push(`/lp group ${g.name} meta setdisplayname "${g.displayName}"`);
    if (g.prefix) lines.push(`/lp group ${g.name} meta addprefix 100 "${g.prefix}"`);
    if (g.suffix) lines.push(`/lp group ${g.name} meta addsuffix 100 "${g.suffix}"`);
    for (const pid of g.parents) {
      const p = groups.find(x => x.id === pid);
      if (p) lines.push(`/lp group ${g.name} parent add ${p.name}`);
    }
    for (const perm of g.permissions) lines.push(permToCommand(`/lp group ${g.name}`, perm));
    lines.push("");
  }
  for (const u of users) {
    lines.push(`# === user: ${u.username} ===`);
    for (const gid of u.groups) {
      const g = groups.find(x => x.id === gid);
      if (g) lines.push(`/lp user ${u.username} parent add ${g.name}`);
    }
    for (const perm of u.permissions) lines.push(permToCommand(`/lp user ${u.username}`, perm));
    lines.push("");
  }
  return lines.join("\n");
}

export function exportYAML(groups: Group[], users: User[]): string {
  const lines: string[] = ["# LuckPerms-style YAML export", "groups:"];
  for (const g of groups) {
    lines.push(`  ${g.name}:`);
    lines.push(`    weight: ${g.weight}`);
    if (g.prefix) lines.push(`    prefix: "${g.prefix}"`);
    if (g.suffix) lines.push(`    suffix: "${g.suffix}"`);
    if (g.parents.length) {
      lines.push(`    parents:`);
      for (const pid of g.parents) {
        const p = groups.find(x => x.id === pid);
        if (p) lines.push(`      - ${p.name}`);
      }
    }
    if (g.permissions.length) {
      lines.push(`    permissions:`);
      for (const perm of g.permissions) lines.push(`      - "${perm.node}"${perm.value === false ? " # deny" : ""}`);
    }
  }
  lines.push("users:");
  for (const u of users) {
    lines.push(`  ${u.username}:`);
    lines.push(`    uuid: ${u.uuid}`);
    if (u.groups.length) {
      lines.push(`    groups:`);
      for (const gid of u.groups) {
        const g = groups.find(x => x.id === gid);
        if (g) lines.push(`      - ${g.name}`);
      }
    }
    if (u.permissions.length) {
      lines.push(`    permissions:`);
      for (const perm of u.permissions) lines.push(`      - "${perm.node}"`);
    }
  }
  return lines.join("\n");
}

function serializeNode(p: PermissionNode) {
  const o: any = { permission: p.node, value: p.value };
  if (p.expiry) o.expiry = p.expiry;
  if (p.contexts && Object.keys(p.contexts).length) o.context = p.contexts;
  if (p.server) o.server = p.server;
  if (p.world) o.world = p.world;
  return o;
}

function permToCommand(prefix: string, p: PermissionNode): string {
  const parts = [prefix, "permission", p.value ? "set" : "unset", p.node];
  if (p.value) parts.push(String(p.value));
  if (p.server) parts.push(`server=${p.server}`);
  if (p.world) parts.push(`world=${p.world}`);
  if (p.temporary && p.expiry) parts.splice(2, 1, "settemp"), parts.push(`${Math.max(1, Math.round((p.expiry - Date.now())/1000))}s`);
  return parts.join(" ");
}

// ---------- IMPORT ----------
export type ImportResult = { groups: Group[]; users: User[]; format: string; warnings: string[] };

export function detectAndImport(text: string): ImportResult {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) return importJSON(trimmed);
  if (trimmed.startsWith("/lp ") || trimmed.includes("\n/lp ")) return importCommands(trimmed);
  return importYAML(trimmed);
}

export function importJSON(text: string): ImportResult {
  const data = JSON.parse(text);
  const warnings: string[] = [];
  // Our own format
  if (data.format === "luckperms-visual-tree" && data.groups) {
    return { groups: data.groups, users: data.users || [], format: "Visual Tree JSON", warnings };
  }
  // LuckPerms-style
  const nameToId = new Map<string, string>();
  const groups: Group[] = (data.groups || []).map((g: any) => {
    const id = "g_" + uid();
    nameToId.set(g.name, id);
    return {
      id, name: g.name, weight: g.weight || 0, displayName: g.displayName, prefix: g.prefix, suffix: g.suffix,
      color: g.color, parents: [], permissions: (g.permissions || []).map((p: any) => normalize(p)),
    } as Group;
  });
  for (const g of groups) {
    const raw = (data.groups || []).find((x: any) => x.name === g.name);
    g.parents = (raw?.parents || []).map((n: string) => nameToId.get(n)).filter(Boolean) as string[];
  }
  const users: User[] = (data.users || []).map((u: any) => ({
    id: "u_" + uid(), username: u.username || u.name, uuid: u.uniqueId || u.uuid || crypto.randomUUID(),
    groups: (u.parentGroups || u.groups || []).map((n: string) => nameToId.get(n)).filter(Boolean) as string[],
    permissions: (u.permissions || []).map((p: any) => normalize(p)),
  }));
  return { groups, users, format: "LuckPerms JSON", warnings };
}

function normalize(p: any): PermissionNode {
  if (typeof p === "string") return { id: uid(), node: p, value: !p.startsWith("-") };
  return {
    id: uid(),
    node: p.permission || p.node,
    value: p.value !== false,
    expiry: p.expiry, contexts: p.context, server: p.server, world: p.world,
    plugin: p.plugin,
  };
}

export function importYAML(text: string): ImportResult {
  // Minimal YAML-ish parser sufficient for plugin.yml + LP-style
  const warnings: string[] = [];
  const lines = text.split(/\r?\n/);
  const groups: Group[] = [];
  const users: User[] = [];
  let mode: "groups" | "users" | "permissions" | null = null;
  let curGroup: Group | null = null;
  let curUser: User | null = null;
  let inPermsList = false;
  let inParentsList = false;
  let inGroupsList = false;
  const nameToId = new Map<string, string>();

  const indent = (s: string) => s.length - s.trimStart().length;

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const ind = indent(line);
    const trimmed = line.trim();

    if (ind === 0) {
      mode = trimmed.startsWith("groups") ? "groups" : trimmed.startsWith("users") ? "users" : trimmed.startsWith("permissions") ? "permissions" : null;
      curGroup = null; curUser = null; inPermsList = inParentsList = inGroupsList = false;
      continue;
    }

    // plugin.yml permissions section: each child is "node:" + properties
    if (mode === "permissions" && ind === 2 && trimmed.endsWith(":")) {
      const node = trimmed.slice(0, -1).trim();
      if (!groups[0]) groups.push({ id: "g_imported", name: "imported", weight: 0, parents: [], permissions: [] });
      groups[0].permissions.push({ id: uid(), node, value: true });
      continue;
    }

    if (mode === "groups" && ind === 2 && trimmed.endsWith(":")) {
      const name = trimmed.slice(0, -1).trim();
      const id = "g_" + uid();
      nameToId.set(name, id);
      curGroup = { id, name, weight: 0, parents: [], permissions: [] };
      groups.push(curGroup);
      inPermsList = inParentsList = false;
      continue;
    }
    if (mode === "users" && ind === 2 && trimmed.endsWith(":")) {
      const name = trimmed.slice(0, -1).trim();
      curUser = { id: "u_" + uid(), username: name, uuid: crypto.randomUUID(), groups: [], permissions: [] };
      users.push(curUser);
      inPermsList = inGroupsList = false;
      continue;
    }
    if (curGroup && ind === 4) {
      if (trimmed.startsWith("weight:")) curGroup.weight = Number(trimmed.split(":")[1]) || 0;
      else if (trimmed.startsWith("prefix:")) curGroup.prefix = trimmed.split(":").slice(1).join(":").trim().replace(/^["']|["']$/g, "");
      else if (trimmed.startsWith("suffix:")) curGroup.suffix = trimmed.split(":").slice(1).join(":").trim().replace(/^["']|["']$/g, "");
      else if (trimmed.startsWith("parents:")) { inParentsList = true; inPermsList = false; }
      else if (trimmed.startsWith("permissions:")) { inPermsList = true; inParentsList = false; }
      continue;
    }
    if (curUser && ind === 4) {
      if (trimmed.startsWith("uuid:")) curUser.uuid = trimmed.split(":").slice(1).join(":").trim();
      else if (trimmed.startsWith("groups:")) { inGroupsList = true; inPermsList = false; }
      else if (trimmed.startsWith("permissions:")) { inPermsList = true; inGroupsList = false; }
      continue;
    }
    if (ind >= 6 && trimmed.startsWith("- ")) {
      const v = trimmed.slice(2).replace(/^["']|["']$/g, "").replace(/\s*#.*$/, "");
      if (curGroup && inPermsList) curGroup.permissions.push({ id: uid(), node: v, value: !v.startsWith("-") });
      else if (curGroup && inParentsList) {
        // parents will be resolved at end
        (curGroup as any)._parentNames = (curGroup as any)._parentNames || [];
        (curGroup as any)._parentNames.push(v);
      } else if (curUser && inPermsList) curUser.permissions.push({ id: uid(), node: v, value: !v.startsWith("-") });
      else if (curUser && inGroupsList) (curUser as any)._groupNames = ((curUser as any)._groupNames || []).concat(v);
    }
  }
  for (const g of groups) {
    const ps = (g as any)._parentNames as string[] | undefined;
    if (ps) g.parents = ps.map(n => nameToId.get(n)).filter(Boolean) as string[];
    delete (g as any)._parentNames;
  }
  for (const u of users) {
    const gs = (u as any)._groupNames as string[] | undefined;
    if (gs) u.groups = gs.map(n => nameToId.get(n)).filter(Boolean) as string[];
    delete (u as any)._groupNames;
  }
  if (!groups.length && !users.length) warnings.push("No groups or users parsed — check the format");
  return { groups, users, format: "YAML / plugin.yml", warnings };
}

export function importCommands(text: string): ImportResult {
  const warnings: string[] = [];
  const groups = new Map<string, Group>();
  const users = new Map<string, User>();
  const getG = (n: string) => { if (!groups.has(n)) groups.set(n, { id: "g_" + uid(), name: n, weight: 0, parents: [], permissions: [] }); return groups.get(n)!; };
  const getU = (n: string) => { if (!users.has(n)) users.set(n, { id: "u_" + uid(), username: n, uuid: crypto.randomUUID(), groups: [], permissions: [] }); return users.get(n)!; };

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line.startsWith("/lp")) continue;
    const t = line.split(/\s+/).slice(1);
    // creategroup X
    if (t[0] === "creategroup" && t[1]) { getG(t[1]); continue; }
    if (t[0] === "group" && t[1]) {
      const g = getG(t[1]);
      if (t[2] === "setweight") g.weight = Number(t[3]) || 0;
      else if (t[2] === "parent" && t[3] === "add" && t[4]) g.parents.push(getG(t[4]).id);
      else if (t[2] === "permission" && t[3] === "set" && t[4]) g.permissions.push({ id: uid(), node: t[4], value: t[5] !== "false" });
      else if (t[2] === "meta" && t[3] === "addprefix" && t[5]) g.prefix = t.slice(5).join(" ").replace(/^["']|["']$/g, "");
    } else if (t[0] === "user" && t[1]) {
      const u = getU(t[1]);
      if (t[2] === "parent" && t[3] === "add" && t[4]) u.groups.push(getG(t[4]).id);
      else if (t[2] === "permission" && t[3] === "set" && t[4]) u.permissions.push({ id: uid(), node: t[4], value: t[5] !== "false" });
    }
  }
  return { groups: Array.from(groups.values()), users: Array.from(users.values()), format: "LuckPerms commands", warnings };
}
