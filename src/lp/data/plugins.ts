export type PluginPermission = {
  node: string;
  description?: string;
  default?: "op" | "true" | "false" | "not op";
  children?: string[];
  wildcard?: boolean;
};

export type PluginCategory = { name: string; permissions: PluginPermission[] };

export type PluginRegistry = {
  plugin: string;
  version?: string;
  color: string;
  icon: string;
  categories: PluginCategory[];
};

const mk = (node: string, description?: string, def: PluginPermission["default"] = "op"): PluginPermission => ({
  node, description, default: def, wildcard: node.endsWith(".*"),
});

export const PLUGIN_REGISTRY: PluginRegistry[] = [
  {
    plugin: "EssentialsX", version: "2.20.1", color: "#3b82f6", icon: "Sparkles",
    categories: [
      { name: "Movement", permissions: [
        mk("essentials.fly", "Allows flying"),
        mk("essentials.fly.others", "Toggle fly for others"),
        mk("essentials.tp", "Teleport to a player"),
        mk("essentials.tpa", "Request teleport"),
        mk("essentials.back", "Return to previous location"),
      ]},
      { name: "Homes & Warps", permissions: [
        mk("essentials.home", "Use /home", "true"),
        mk("essentials.sethome", "Set a home"),
        mk("essentials.warp", "Use /warp", "true"),
        mk("essentials.warp.*", "Access all warps", "false"),
      ]},
      { name: "Chat", permissions: [
        mk("essentials.msg", "Send private messages", "true"),
        mk("essentials.nick", "Change nickname"),
        mk("essentials.mute", "Mute players"),
      ]},
      { name: "Economy", permissions: [
        mk("essentials.balance", "Check balance", "true"),
        mk("essentials.pay", "Pay other players", "true"),
        mk("essentials.eco", "Manage economy"),
      ]},
    ],
  },
  {
    plugin: "WorldEdit", version: "7.3.0", color: "#22c55e", icon: "Pickaxe",
    categories: [
      { name: "Selection", permissions: [
        mk("worldedit.selection.pos"), mk("worldedit.selection.expand"),
        mk("worldedit.selection.*", "All selection commands"),
      ]},
      { name: "Region", permissions: [
        mk("worldedit.region.set"), mk("worldedit.region.replace"),
        mk("worldedit.region.copy"), mk("worldedit.region.paste"),
      ]},
      { name: "Navigation", permissions: [
        mk("worldedit.navigation.jumpto"), mk("worldedit.navigation.thru"),
      ]},
    ],
  },
  {
    plugin: "LuckPerms", version: "5.4", color: "#22d3ee", icon: "Shield",
    categories: [
      { name: "User", permissions: [
        mk("luckperms.user.info"), mk("luckperms.user.permission.set"),
        mk("luckperms.user.parent.add"),
      ]},
      { name: "Group", permissions: [
        mk("luckperms.group.info"), mk("luckperms.group.permission.set"),
      ]},
    ],
  },
  {
    plugin: "WorldGuard", version: "7.0.9", color: "#f59e0b", icon: "ShieldCheck",
    categories: [
      { name: "Regions", permissions: [
        mk("worldguard.region.define"), mk("worldguard.region.redefine"),
        mk("worldguard.region.flag"), mk("worldguard.region.bypass.*"),
      ]},
    ],
  },
  {
    plugin: "Vault", version: "1.7.3", color: "#a855f7", icon: "Wallet",
    categories: [{ name: "API", permissions: [mk("vault.admin"), mk("vault.update")] }],
  },
  {
    plugin: "PlaceholderAPI", version: "2.11.6", color: "#ec4899", icon: "Tags",
    categories: [{ name: "Admin", permissions: [
      mk("placeholderapi.admin"), mk("placeholderapi.ecloud.download"),
    ]}],
  },
  {
    plugin: "LiteBans", version: "2.10", color: "#ef4444", icon: "Gavel",
    categories: [{ name: "Punishments", permissions: [
      mk("litebans.ban"), mk("litebans.kick"), mk("litebans.mute"), mk("litebans.warn"),
      mk("litebans.unban"),
    ]}],
  },
  {
    plugin: "CoreProtect", version: "22.4", color: "#14b8a6", icon: "History",
    categories: [{ name: "Inspect", permissions: [
      mk("coreprotect.inspect"), mk("coreprotect.lookup"), mk("coreprotect.rollback"),
    ]}],
  },
  {
    plugin: "mcMMO", version: "2.2.0", color: "#10b981", icon: "Swords",
    categories: [{ name: "Skills", permissions: [
      mk("mcmmo.skills.mining"), mk("mcmmo.skills.woodcutting"), mk("mcmmo.skills.*"),
    ]}],
  },
  {
    plugin: "DiscordSRV", version: "1.28", color: "#5865f2", icon: "MessageSquare",
    categories: [{ name: "Linking", permissions: [
      mk("discordsrv.link"), mk("discordsrv.broadcast"),
    ]}],
  },
  {
    plugin: "TAB", version: "4.2.2", color: "#f97316", icon: "Layout",
    categories: [{ name: "Admin", permissions: [mk("tab.admin"), mk("tab.staff")] }],
  },
  {
    plugin: "Towny", version: "0.100", color: "#84cc16", icon: "Castle",
    categories: [{ name: "Town", permissions: [
      mk("towny.town.new"), mk("towny.town.claim"), mk("towny.nation.new"),
    ]}],
  },
];

export const ALL_PERMISSIONS = PLUGIN_REGISTRY.flatMap(p =>
  p.categories.flatMap(c => c.permissions.map(perm => ({ ...perm, plugin: p.plugin })))
);
