import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PermissionNode = {
  id: string;
  node: string;
  value: boolean;
  temporary?: boolean;
  expiry?: number;
  contexts?: Record<string, string>;
  server?: string;
  world?: string;
  plugin?: string;
  description?: string;
};

export type Group = {
  id: string;
  name: string;
  displayName?: string;
  weight: number;
  prefix?: string;
  suffix?: string;
  color?: string;
  parents: string[]; // group ids
  permissions: PermissionNode[];
};

export type User = {
  id: string;
  username: string;
  uuid: string;
  groups: string[];
  permissions: PermissionNode[];
};

export type Selection =
  | { type: "group"; id: string }
  | { type: "user"; id: string }
  | { type: "permission"; ownerType: "group" | "user"; ownerId: string; permId: string }
  | null;

type State = {
  groups: Group[];
  users: User[];
  selection: Selection;
  history: { groups: Group[]; users: User[] }[];
  future: { groups: Group[]; users: User[] }[];
  setSelection: (s: Selection) => void;
  addGroup: (name: string) => void;
  deleteGroup: (id: string) => void;
  cloneGroup: (id: string) => void;
  updateGroup: (id: string, patch: Partial<Group>) => void;
  addUser: (username: string) => void;
  deleteUser: (id: string) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  addPermission: (ownerType: "group" | "user", ownerId: string, node: string, plugin?: string) => void;
  updatePermission: (ownerType: "group" | "user", ownerId: string, permId: string, patch: Partial<PermissionNode>) => void;
  deletePermission: (ownerType: "group" | "user", ownerId: string, permId: string) => void;
  toggleParent: (groupId: string, parentId: string) => void;
  undo: () => void;
  redo: () => void;
  loadDemoData: () => void;
  reset: () => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

const demoGroups = (): Group[] => [
  { id: "g_default", name: "default", weight: 0, color: "#94a3b8", parents: [], permissions: [
    { id: uid(), node: "essentials.home", value: true, plugin: "EssentialsX" },
    { id: uid(), node: "essentials.warp", value: true, plugin: "EssentialsX" },
    { id: uid(), node: "essentials.balance", value: true, plugin: "EssentialsX" },
  ]},
  { id: "g_vip", name: "vip", weight: 10, prefix: "&6[VIP] ", color: "#f59e0b", parents: ["g_default"], permissions: [
    { id: uid(), node: "essentials.fly", value: true, plugin: "EssentialsX" },
    { id: uid(), node: "essentials.nick", value: true, plugin: "EssentialsX" },
    { id: uid(), node: "essentials.warp.*", value: true, plugin: "EssentialsX" },
  ]},
  { id: "g_mod", name: "moderator", weight: 50, prefix: "&2[MOD] ", color: "#22c55e", parents: ["g_vip"], permissions: [
    { id: uid(), node: "litebans.kick", value: true, plugin: "LiteBans" },
    { id: uid(), node: "litebans.mute", value: true, plugin: "LiteBans" },
    { id: uid(), node: "litebans.warn", value: true, plugin: "LiteBans" },
    { id: uid(), node: "essentials.mute", value: true, plugin: "EssentialsX" },
    { id: uid(), node: "coreprotect.inspect", value: true, plugin: "CoreProtect" },
  ]},
  { id: "g_admin", name: "admin", weight: 100, prefix: "&c[ADMIN] ", color: "#ef4444", parents: ["g_mod"], permissions: [
    { id: uid(), node: "litebans.ban", value: true, plugin: "LiteBans" },
    { id: uid(), node: "litebans.unban", value: true, plugin: "LiteBans" },
    { id: uid(), node: "worldedit.*", value: true, plugin: "WorldEdit" },
    { id: uid(), node: "worldguard.region.*", value: true, plugin: "WorldGuard" },
    { id: uid(), node: "-minecraft.command.stop", value: false },
  ]},
  { id: "g_owner", name: "owner", weight: 1000, prefix: "&4[OWNER] ", color: "#7c3aed", parents: ["g_admin"], permissions: [
    { id: uid(), node: "*", value: true, description: "All permissions" },
  ]},
];

const demoUsers = (): User[] => [
  { id: "u1", username: "Notch", uuid: "069a79f4-44e9-4726-a5be-fca90e38aaf5", groups: ["g_owner"], permissions: [] },
  { id: "u2", username: "Steve", uuid: "8667ba71-b85a-4004-af54-457a9734eed7", groups: ["g_admin"], permissions: [
    { id: uid(), node: "essentials.god", value: true, plugin: "EssentialsX", contexts: { world: "survival" } },
  ]},
  { id: "u3", username: "Alex", uuid: "ec561538-f3fd-461d-aff5-086b22154bce", groups: ["g_mod"], permissions: [
    { id: uid(), node: "essentials.fly", value: true, plugin: "EssentialsX", temporary: true, expiry: Date.now() + 86400000 * 3 },
  ]},
  { id: "u4", username: "Herobrine", uuid: "f84c6a79-0a4e-45e0-879b-cd49ebd4c4e2", groups: ["g_vip"], permissions: [] },
];

const snap = (s: State) => ({ groups: structuredClone(s.groups), users: structuredClone(s.users) });

const pushHistory = (set: any, get: any) => {
  const s = get();
  set({ history: [...s.history.slice(-50), snap(s)], future: [] });
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      groups: demoGroups(),
      users: demoUsers(),
      selection: { type: "group", id: "g_vip" },
      history: [],
      future: [],
      setSelection: (s) => set({ selection: s }),
      addGroup: (name) => {
        pushHistory(set, get);
        set({ groups: [...get().groups, { id: "g_" + uid(), name, weight: 0, parents: [], permissions: [] }] });
      },
      deleteGroup: (id) => {
        pushHistory(set, get);
        set({
          groups: get().groups.filter(g => g.id !== id).map(g => ({ ...g, parents: g.parents.filter(p => p !== id) })),
          users: get().users.map(u => ({ ...u, groups: u.groups.filter(gid => gid !== id) })),
          selection: null,
        });
      },
      cloneGroup: (id) => {
        pushHistory(set, get);
        const g = get().groups.find(x => x.id === id); if (!g) return;
        set({ groups: [...get().groups, { ...structuredClone(g), id: "g_" + uid(), name: g.name + "_copy" }] });
      },
      updateGroup: (id, patch) => {
        pushHistory(set, get);
        set({ groups: get().groups.map(g => g.id === id ? { ...g, ...patch } : g) });
      },
      addUser: (username) => {
        pushHistory(set, get);
        set({ users: [...get().users, { id: "u_" + uid(), username, uuid: crypto.randomUUID(), groups: ["g_default"], permissions: [] }] });
      },
      deleteUser: (id) => { pushHistory(set, get); set({ users: get().users.filter(u => u.id !== id), selection: null }); },
      updateUser: (id, patch) => { pushHistory(set, get); set({ users: get().users.map(u => u.id === id ? { ...u, ...patch } : u) }); },
      addPermission: (ownerType, ownerId, node, plugin) => {
        pushHistory(set, get);
        const perm: PermissionNode = { id: uid(), node, value: !node.startsWith("-"), plugin };
        if (ownerType === "group") set({ groups: get().groups.map(g => g.id === ownerId ? { ...g, permissions: [...g.permissions, perm] } : g) });
        else set({ users: get().users.map(u => u.id === ownerId ? { ...u, permissions: [...u.permissions, perm] } : u) });
      },
      updatePermission: (ownerType, ownerId, permId, patch) => {
        pushHistory(set, get);
        if (ownerType === "group") set({ groups: get().groups.map(g => g.id === ownerId ? { ...g, permissions: g.permissions.map(p => p.id === permId ? { ...p, ...patch } : p) } : g) });
        else set({ users: get().users.map(u => u.id === ownerId ? { ...u, permissions: u.permissions.map(p => p.id === permId ? { ...p, ...patch } : p) } : u) });
      },
      deletePermission: (ownerType, ownerId, permId) => {
        pushHistory(set, get);
        if (ownerType === "group") set({ groups: get().groups.map(g => g.id === ownerId ? { ...g, permissions: g.permissions.filter(p => p.id !== permId) } : g) });
        else set({ users: get().users.map(u => u.id === ownerId ? { ...u, permissions: u.permissions.filter(p => p.id !== permId) } : u) });
      },
      toggleParent: (groupId, parentId) => {
        if (groupId === parentId) return;
        pushHistory(set, get);
        set({ groups: get().groups.map(g => g.id === groupId ? { ...g, parents: g.parents.includes(parentId) ? g.parents.filter(p => p !== parentId) : [...g.parents, parentId] } : g) });
      },
      undo: () => {
        const s = get(); const last = s.history[s.history.length - 1]; if (!last) return;
        set({ groups: last.groups, users: last.users, history: s.history.slice(0, -1), future: [...s.future, snap(s)] });
      },
      redo: () => {
        const s = get(); const next = s.future[s.future.length - 1]; if (!next) return;
        set({ groups: next.groups, users: next.users, future: s.future.slice(0, -1), history: [...s.history, snap(s)] });
      },
      loadDemoData: () => set({ groups: demoGroups(), users: demoUsers(), selection: { type: "group", id: "g_vip" }, history: [], future: [] }),
      reset: () => set({ groups: [], users: [], selection: null, history: [], future: [] }),
    }),
    { name: "luckperms-visual-tree", partialize: (s) => ({ groups: s.groups, users: s.users }) }
  )
);

// Effective permission resolution
export function resolveEffectivePermissions(
  groups: Group[],
  ownerType: "group" | "user",
  ownerId: string,
  ctx: { world?: string; server?: string } = {}
) {
  const map = new Map<string, { value: boolean; from: string; reason: string; weight: number }>();
  const visit = (gid: string, weight: number, chain: string[]) => {
    const g = groups.find(x => x.id === gid); if (!g) return;
    if (chain.includes(gid)) return; // cycle guard
    const newChain = [...chain, gid];
    // visit parents first (lower priority)
    for (const p of g.parents) visit(p, g.weight - 1, newChain);
    for (const perm of g.permissions) {
      if (perm.contexts?.world && ctx.world && perm.contexts.world !== ctx.world) continue;
      const cur = map.get(perm.node);
      if (!cur || g.weight >= cur.weight) {
        map.set(perm.node, { value: perm.value, from: g.name, reason: `from group "${g.name}" (weight ${g.weight})`, weight: g.weight });
      }
    }
  };
  if (ownerType === "group") visit(ownerId, 0, []);
  return map;
}
