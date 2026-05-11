import type { Group, User } from "../store/store";
const u = () => Math.random().toString(36).slice(2, 10);
const p = (node: string, value = true, plugin?: string) => ({ id: u(), node, value, plugin });

export type Template = { id: string; name: string; description: string; groups: Group[]; users: User[] };

export const TEMPLATES: Template[] = [
  {
    id: "survival",
    name: "Survival Server",
    description: "Default → VIP → MVP → Mod → Admin · EssentialsX heavy",
    groups: [
      { id: "g_default", name: "default", weight: 0, color: "#94a3b8", parents: [], permissions: [
        p("essentials.home", true, "EssentialsX"), p("essentials.warp", true, "EssentialsX"),
        p("essentials.balance", true, "EssentialsX"), p("essentials.msg", true, "EssentialsX"),
      ]},
      { id: "g_vip", name: "vip", weight: 10, color: "#f59e0b", prefix: "&6[VIP] ", parents: ["g_default"], permissions: [
        p("essentials.fly", true, "EssentialsX"), p("essentials.nick", true, "EssentialsX"),
        p("essentials.sethome", true, "EssentialsX"),
      ]},
      { id: "g_mvp", name: "mvp", weight: 20, color: "#a855f7", prefix: "&5[MVP] ", parents: ["g_vip"], permissions: [
        p("essentials.warp.*", true, "EssentialsX"), p("essentials.god", true, "EssentialsX"),
      ]},
      { id: "g_mod", name: "moderator", weight: 50, color: "#22c55e", prefix: "&2[MOD] ", parents: ["g_vip"], permissions: [
        p("litebans.kick", true, "LiteBans"), p("litebans.mute", true, "LiteBans"),
        p("coreprotect.inspect", true, "CoreProtect"),
      ]},
      { id: "g_admin", name: "admin", weight: 100, color: "#ef4444", prefix: "&c[ADMIN] ", parents: ["g_mod"], permissions: [
        p("litebans.ban", true, "LiteBans"), p("worldedit.*", true, "WorldEdit"),
      ]},
    ],
    users: [],
  },
  {
    id: "smp",
    name: "SMP Staff Ranks",
    description: "Trial → Helper → Mod → SrMod → Admin · helper-focused",
    groups: [
      { id: "g_member", name: "member", weight: 0, color: "#94a3b8", parents: [], permissions: [
        p("essentials.help", true, "EssentialsX"), p("essentials.list", true, "EssentialsX"),
      ]},
      { id: "g_trial", name: "trial-helper", weight: 30, color: "#06b6d4", prefix: "&b[TRIAL] ", parents: ["g_member"], permissions: [
        p("essentials.kick", true, "EssentialsX"), p("essentials.warn", true, "EssentialsX"),
      ]},
      { id: "g_helper", name: "helper", weight: 40, color: "#3b82f6", prefix: "&9[HELPER] ", parents: ["g_trial"], permissions: [
        p("litebans.warn", true, "LiteBans"), p("essentials.mute", true, "EssentialsX"),
      ]},
      { id: "g_mod2", name: "moderator", weight: 60, color: "#22c55e", prefix: "&2[MOD] ", parents: ["g_helper"], permissions: [
        p("litebans.mute", true, "LiteBans"), p("litebans.kick", true, "LiteBans"),
      ]},
      { id: "g_srmod", name: "sr-moderator", weight: 80, color: "#10b981", prefix: "&a[SR-MOD] ", parents: ["g_mod2"], permissions: [
        p("litebans.tempban", true, "LiteBans"), p("coreprotect.lookup", true, "CoreProtect"),
      ]},
      { id: "g_admin2", name: "admin", weight: 100, color: "#ef4444", prefix: "&c[ADMIN] ", parents: ["g_srmod"], permissions: [
        p("litebans.ban", true, "LiteBans"), p("worldedit.*", true, "WorldEdit"),
      ]},
    ],
    users: [],
  },
  {
    id: "minigames",
    name: "Minigame Network",
    description: "Lobby + per-server contexts · network proxy ready",
    groups: [
      { id: "g_player", name: "player", weight: 0, color: "#94a3b8", parents: [], permissions: [
        p("hub.command", true), p("essentials.spawn", true, "EssentialsX"),
      ]},
      { id: "g_pro", name: "pro", weight: 25, color: "#06b6d4", prefix: "&b[PRO] ", parents: ["g_player"], permissions: [
        p("minigames.cosmetics", true), p("minigames.queue.priority", true),
      ]},
      { id: "g_legend", name: "legend", weight: 50, color: "#a855f7", prefix: "&5[LEGEND] ", parents: ["g_pro"], permissions: [
        p("minigames.cosmetics.*", true), p("essentials.fly", true, "EssentialsX"),
      ]},
      { id: "g_staff", name: "staff", weight: 100, color: "#ef4444", prefix: "&c[STAFF] ", parents: ["g_legend"], permissions: [
        p("minigames.staff.*", true), p("litebans.ban", true, "LiteBans"),
      ]},
    ],
    users: [],
  },
  {
    id: "skyblock",
    name: "Skyblock Starter",
    description: "Island ranks with claim and economy basics for a skyblock server",
    groups: [
      { id: "g_default", name: "default", weight: 0, color: "#94a3b8", parents: [], permissions: [
        p("essentials.home", true, "EssentialsX"), p("essentials.warp", true, "EssentialsX"), p("essentials.balance", true, "EssentialsX"),
        p("griefprevention.claims", true, "GriefPrevention"), p("essentials.msg", true, "EssentialsX"),
      ]},
      { id: "g_member", name: "island-member", weight: 15, color: "#22c55e", prefix: "&2[ISLAND] ", parents: ["g_default"], permissions: [
        p("essentials.warp.island", true, "EssentialsX"), p("essentials.hat", true, "EssentialsX"), p("essentials.nick", true, "EssentialsX"),
      ]},
      { id: "g_builder", name: "island-builder", weight: 35, color: "#06b6d4", prefix: "&b[BUILDER] ", parents: ["g_member"], permissions: [
        p("worldedit.region.set", true, "WorldEdit"), p("griefprevention.adminclaims", true, "GriefPrevention"), p("vault.admin", true, "Vault"),
      ]},
      { id: "g_manager", name: "island-manager", weight: 60, color: "#a855f7", prefix: "&5[MANAGER] ", parents: ["g_builder"], permissions: [
        p("worldguard.region.flag", true, "WorldGuard"), p("essentials.fly", true, "EssentialsX"), p("luckperms.group.weight", true, "LuckPerms"),
      ]},
      { id: "g_admin", name: "admin", weight: 100, color: "#ef4444", prefix: "&c[ADMIN] ", parents: ["g_manager"], permissions: [
        p("worldedit.*", true, "WorldEdit"), p("worldguard.region.bypass.*", true, "WorldGuard"), p("litebans.ban", true, "LiteBans"),
      ]},
    ],
    users: [],
  },
  {
    id: "prison",
    name: "Prison Progression",
    description: "Create prison ranks with guard and warden staff roles",
    groups: [
      { id: "g_peon", name: "peon", weight: 0, color: "#94a3b8", parents: [], permissions: [
        p("essentials.help", true, "EssentialsX"), p("essentials.list", true, "EssentialsX"),
      ]},
      { id: "g_guard", name: "guard", weight: 40, color: "#f59e0b", prefix: "&6[GUARD] ", parents: ["g_peon"], permissions: [
        p("litebans.kick", true, "LiteBans"), p("litebans.mute", true, "LiteBans"), p("coreprotect.lookup", true, "CoreProtect"),
      ]},
      { id: "g_warden", name: "warden", weight: 70, color: "#22c55e", prefix: "&2[WARDEN] ", parents: ["g_guard"], permissions: [
        p("litebans.tempban", true, "LiteBans"), p("coreprotect.rollback", true, "CoreProtect"), p("worldguard.region.flag", true, "WorldGuard"),
      ]},
      { id: "g_admin", name: "admin", weight: 100, color: "#ef4444", prefix: "&c[ADMIN] ", parents: ["g_warden"], permissions: [
        p("worldedit.*", true, "WorldEdit"), p("essentials.ban", true, "EssentialsX"), p("luckperms.editor", true, "LuckPerms"),
      ]},
    ],
    users: [],
  },
  {
    id: "creative",
    name: "Creative Build Team",
    description: "Builder ranks with creative edit permissions and staff support",
    groups: [
      { id: "g_visitor", name: "visitor", weight: 0, color: "#94a3b8", parents: [], permissions: [
        p("essentials.help", true, "EssentialsX"), p("essentials.spawn", true, "EssentialsX"),
      ]},
      { id: "g_builder", name: "builder", weight: 30, color: "#06b6d4", prefix: "&b[BUILDER] ", parents: ["g_visitor"], permissions: [
        p("worldedit.region.set", true, "WorldEdit"), p("essentials.fly", true, "EssentialsX"),
      ]},
      { id: "g_architect", name: "architect", weight: 55, color: "#a855f7", prefix: "&5[ARCH] ", parents: ["g_builder"], permissions: [
        p("worldedit.brush.sphere", true, "WorldEdit"), p("worldedit.region.copy", true, "WorldEdit"),
      ]},
      { id: "g_staff", name: "creative-staff", weight: 85, color: "#22c55e", prefix: "&2[STAFF] ", parents: ["g_architect"], permissions: [
        p("essentials.god", true, "EssentialsX"), p("worldguard.region.wand", true, "WorldGuard"), p("coreprotect.inspect", true, "CoreProtect"),
      ]},
    ],
    users: [],
  },
];
