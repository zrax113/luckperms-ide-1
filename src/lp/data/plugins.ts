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

const mk = (
  node: string,
  description?: string,
  def: PluginPermission["default"] = "op",
): PluginPermission => ({
  node,
  description,
  default: def,
  wildcard: node.endsWith(".*"),
});

export const PLUGIN_REGISTRY: PluginRegistry[] = [
  // ===================== ESSENTIALS =====================
  {
    plugin: "EssentialsX",
    version: "2.20.1",
    color: "#3b82f6",
    icon: "Sparkles",
    categories: [
      {
        name: "Movement",
        permissions: [
          mk("essentials.fly", "Toggle flight"),
          mk("essentials.fly.safelogin", "Fly on join"),
          mk("essentials.tp", "Teleport"),
          mk("essentials.tpa", "Teleport request"),
          mk("essentials.tpahere"),
          mk("essentials.tpaccept"),
          mk("essentials.tpo"),
          mk("essentials.spawn"),
          mk("essentials.back"),
          mk("essentials.speed"),
          mk("essentials.god"),
        ],
      },
      {
        name: "Homes",
        permissions: [
          mk("essentials.home", "Use home", "true"),
          mk("essentials.sethome"),
          mk("essentials.delhome"),
          mk("essentials.home.multiple"),
          mk("essentials.warp"),
          mk("essentials.warp.*"),
          mk("essentials.warp.safepoint"),
          mk("essentials.setwarp"),
          mk("essentials.delwarp"),
          mk("essentials.hat", "Wear item as hat"),
        ],
      },
      {
        name: "Economy",
        permissions: [
          mk("essentials.balance", "Check balance", "true"),
          mk("essentials.pay", "Send money", "true"),
          mk("essentials.eco"),
          mk("essentials.sell"),
          mk("essentials.worth"),
          mk("essentials.baltop"),
          mk("essentials.shop"),
        ],
      },
      {
        name: "Chat",
        permissions: [
          mk("essentials.msg", "Private messages", "true"),
          mk("essentials.reply"),
          mk("essentials.nick"),
          mk("essentials.chat.color"),
          mk("essentials.chat.format"),
          mk("essentials.mute"),
          mk("essentials.afk"),
          mk("essentials.message"),
        ],
      },
      {
        name: "Moderation",
        permissions: [
          mk("essentials.kick"),
          mk("essentials.ban"),
          mk("essentials.unban"),
          mk("essentials.warn"),
          mk("essentials.jail"),
        ],
      },
    ],
  },

  // ===================== WORLD EDIT =====================
  {
    plugin: "WorldEdit",
    version: "7.3.0",
    color: "#22c55e",
    icon: "Pickaxe",
    categories: [
      {
        name: "Selection",
        permissions: [
          mk("worldedit.selection.*"),
          mk("worldedit.selection.pos"),
          mk("worldedit.selection.expand"),
          mk("worldedit.selection.contract"),
          mk("worldedit.selection.shift"),
        ],
      },
      {
        name: "Region",
        permissions: [
          mk("worldedit.region.set"),
          mk("worldedit.region.copy"),
          mk("worldedit.region.paste"),
          mk("worldedit.region.replace"),
          mk("worldedit.region.rotate"),
          mk("worldedit.region.flip"),
          mk("worldedit.region.undo"),
          mk("worldedit.region.redo"),
        ],
      },
      {
        name: "Brush",
        permissions: [
          mk("worldedit.brush.sphere"),
          mk("worldedit.brush.cylinder"),
          mk("worldedit.brush.smooth"),
          mk("worldedit.brush.mask"),
        ],
      },
    ],
  },

  // ===================== LUCKPERMS =====================
  {
    plugin: "LuckPerms",
    version: "5.4",
    color: "#22d3ee",
    icon: "Shield",
    categories: [
      {
        name: "User",
        permissions: [
          mk("luckperms.user.permission.set"),
          mk("luckperms.user.permission.unset"),
          mk("luckperms.user.parent.add"),
          mk("luckperms.user.meta.set"),
        ],
      },
      {
        name: "Group",
        permissions: [
          mk("luckperms.creategroup"),
          mk("luckperms.deletegroup"),
          mk("luckperms.group.permission.set"),
          mk("luckperms.group.setweight"),
        ],
      },
      {
        name: "Tools",
        permissions: [
          mk("luckperms.editor"),
          mk("luckperms.import"),
          mk("luckperms.export"),
          mk("luckperms.sync"),
        ],
      },
    ],
  },

  // ===================== WORLDGUARD =====================
  {
    plugin: "WorldGuard",
    version: "7.0.9",
    color: "#f59e0b",
    icon: "ShieldCheck",
    categories: [
      {
        name: "Regions",
        permissions: [
          mk("worldguard.region.define"),
          mk("worldguard.region.flag"),
          mk("worldguard.region.remove"),
          mk("worldguard.region.list"),
          mk("worldguard.region.wand"),
          mk("worldguard.region.bypass"),
        ],
      },
      {
        name: "Bypass",
        permissions: [
          mk("worldguard.region.bypass.*"),
          mk("worldguard.god"),
          mk("worldguard.heal"),
          mk("worldguard.bypass.event.*"),
        ],
      },
    ],
  },

  // ===================== ECONOMY / SERVERS =====================
  {
    plugin: "Vault",
    version: "1.7.3",
    color: "#a855f7",
    icon: "Wallet",
    categories: [{ name: "API", permissions: [mk("vault.admin"), mk("vault.update")] }],
  },

  {
    plugin: "PlaceholderAPI",
    version: "2.11.6",
    color: "#ec4899",
    icon: "Tags",
    categories: [
      {
        name: "Admin",
        permissions: [
          mk("placeholderapi.admin"),
          mk("placeholderapi.reload"),
          mk("placeholderapi.ecloud.download"),
        ],
      },
    ],
  },

  // ===================== MODERATION =====================
  {
    plugin: "LiteBans",
    version: "2.10",
    color: "#ef4444",
    icon: "Gavel",
    categories: [
      {
        name: "Punish",
        permissions: [
          mk("litebans.ban"),
          mk("litebans.tempban"),
          mk("litebans.mute"),
          mk("litebans.kick"),
        ],
      },
      {
        name: "History",
        permissions: [mk("litebans.history"), mk("litebans.alts"), mk("litebans.staffhistory")],
      },
    ],
  },

  {
    plugin: "CoreProtect",
    version: "22.4",
    color: "#14b8a6",
    icon: "History",
    categories: [
      {
        name: "Inspect",
        permissions: [
          mk("coreprotect.inspect"),
          mk("coreprotect.lookup"),
          mk("coreprotect.rollback"),
        ],
      },
    ],
  },

  // ===================== SOCIAL / NETWORK =====================
  {
    plugin: "DiscordSRV",
    version: "1.28",
    color: "#5865f2",
    icon: "MessageSquare",
    categories: [
      {
        name: "Linking",
        permissions: [mk("discordsrv.link"), mk("discordsrv.unlink"), mk("discordsrv.broadcast")],
      },
    ],
  },

  {
    plugin: "TAB",
    version: "4.2.2",
    color: "#f97316",
    icon: "Layout",
    categories: [
      { name: "Admin", permissions: [mk("tab.admin"), mk("tab.reload"), mk("tab.staff")] },
    ],
  },

  // ===================== NEW ADDITIONS =====================

  {
    plugin: "GriefPrevention",
    version: "16.18",
    color: "#dc2626",
    icon: "Shield",
    categories: [
      {
        name: "Claims",
        permissions: [
          mk("griefprevention.claims"),
          mk("griefprevention.adminclaims"),
          mk("griefprevention.deleteclaims"),
        ],
      },
    ],
  },

  {
    plugin: "mcMMO",
    version: "2.2.0",
    color: "#10b981",
    icon: "Swords",
    categories: [
      {
        name: "Skills",
        permissions: [mk("mcmmo.skills.*"), mk("mcmmo.skills.mining"), mk("mcmmo.skills.swords")],
      },
    ],
  },

  {
    plugin: "Citizens",
    version: "2.0.34",
    color: "#f59e0b",
    icon: "Users",
    categories: [
      {
        name: "NPC",
        permissions: [mk("citizens.npc.create"), mk("citizens.npc.remove"), mk("citizens.admin")],
      },
    ],
  },

  {
    plugin: "Multiverse",
    version: "4.3.14",
    color: "#06b6d4",
    icon: "Globe",
    categories: [
      {
        name: "Core",
        permissions: [
          mk("multiverse.core.create"),
          mk("multiverse.core.tp.self"),
          mk("multiverse.core.tp.other"),
        ],
      },
    ],
  },

  {
    plugin: "ViaVersion",
    version: "5.0",
    color: "#22c55e",
    icon: "GitMerge",
    categories: [{ name: "Admin", permissions: [mk("viaversion.reload"), mk("viaversion.info")] }],
  },
];

// Flattened export
export const ALL_PERMISSIONS = PLUGIN_REGISTRY.flatMap((p) =>
  p.categories.flatMap((c) =>
    c.permissions.map((perm) => ({
      ...perm,
      plugin: p.plugin,
    })),
  ),
);
