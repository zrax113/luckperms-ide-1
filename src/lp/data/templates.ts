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
];
