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
        mk("essentials.tpaccept", "Accept tp request"),
        mk("essentials.tpahere", "Request a player to tp to you"),
        mk("essentials.tphere", "Teleport a player to you"),
        mk("essentials.tpall", "Teleport all players"),
        mk("essentials.tpo", "Override tp toggles"),
        mk("essentials.speed", "Change walk/fly speed"),
        mk("essentials.god", "God mode"),
        mk("essentials.back", "Return to previous location"),
        mk("essentials.spawn", "Teleport to spawn"),
        mk("essentials.setspawn", "Set the spawn location"),
      ]},
      { name: "Homes & Warps", permissions: [
        mk("essentials.home", "Use /home", "true"),
        mk("essentials.sethome", "Set a home"),
        mk("essentials.delhome", "Delete a home"),
        mk("essentials.sethome.multiple", "Set multiple homes"),
        mk("essentials.warp", "Use /warp", "true"),
        mk("essentials.warp.*", "Access all warps", "false"),
        mk("essentials.setwarp", "Create warps"),
        mk("essentials.delwarp", "Delete warps"),
      ]},
      { name: "Chat", permissions: [
        mk("essentials.msg", "Send private messages", "true"),
        mk("essentials.msg.color", "Use color codes in private messages"),
        mk("essentials.reply", "Reply to last message"),
        mk("essentials.chat.color", "Use chat color codes"),
        mk("essentials.chat.format", "Use chat formatting"),
        mk("essentials.broadcast", "Broadcast a server message"),
        mk("essentials.helpop", "Send a message to staff"),
        mk("essentials.nick", "Change nickname"),
        mk("essentials.nick.color", "Use color in nicknames"),
        mk("essentials.realname", "Lookup nicknames"),
        mk("essentials.mute", "Mute players"),
        mk("essentials.unmute", "Unmute players"),
        mk("essentials.afk", "Toggle AFK"),
        mk("essentials.afk.auto", "Auto AFK timer"),
      ]},
      { name: "Economy", permissions: [
        mk("essentials.balance", "Check balance", "true"),
        mk("essentials.balance.others", "Check others balance"),
        mk("essentials.balancetop", "View richest players"),
        mk("essentials.pay", "Pay other players", "true"),
        mk("essentials.eco", "Manage economy"),
        mk("essentials.eco.loan", "Allow negative balance"),
        mk("essentials.sell", "Sell items"),
        mk("essentials.worth", "Check item worth"),
      ]},
      { name: "Items & Inventory", permissions: [
        mk("essentials.give"), mk("essentials.item"), mk("essentials.itemdb"),
        mk("essentials.repair"), mk("essentials.repair.all"),
        mk("essentials.enchant"), mk("essentials.enchant.*"),
        mk("essentials.kit", "Use kits", "true"),
        mk("essentials.kit.*", "Use all kits"),
        mk("essentials.feed"), mk("essentials.heal"), mk("essentials.hat"),
        mk("essentials.invsee"), mk("essentials.workbench"), mk("essentials.anvil"),
      ]},
      { name: "Server Admin", permissions: [
        mk("essentials.gamemode"), mk("essentials.gamemode.creative"),
        mk("essentials.gamemode.survival"), mk("essentials.gamemode.spectator"),
        mk("essentials.kick"), mk("essentials.ban"), mk("essentials.tempban"),
        mk("essentials.weather"), mk("essentials.time"), mk("essentials.kill"),
        mk("essentials.vanish"), mk("essentials.fireball"), mk("essentials.lightning"),
      ]},
    ],
  },
  {
    plugin: "WorldEdit", version: "7.3.0", color: "#22c55e", icon: "Pickaxe",
    categories: [
      { name: "Selection", permissions: [
        mk("worldedit.selection.pos"), mk("worldedit.selection.expand"),
        mk("worldedit.selection.contract"), mk("worldedit.selection.shift"),
        mk("worldedit.selection.size"), mk("worldedit.selection.chunk"),
        mk("worldedit.selection.*", "All selection commands"),
      ]},
      { name: "Region", permissions: [
        mk("worldedit.region.set"), mk("worldedit.region.replace"),
        mk("worldedit.region.copy"), mk("worldedit.region.paste"),
        mk("worldedit.region.cut"), mk("worldedit.region.move"),
        mk("worldedit.region.stack"), mk("worldedit.region.smooth"),
        mk("worldedit.region.naturalize"), mk("worldedit.region.walls"),
        mk("worldedit.region.faces"), mk("worldedit.region.overlay"),
        mk("worldedit.region.flip"), mk("worldedit.region.rotate"),
      ]},
      { name: "Navigation", permissions: [
        mk("worldedit.navigation.jumpto"), mk("worldedit.navigation.thru"),
        mk("worldedit.navigation.up"), mk("worldedit.navigation.unstuck"),
        mk("worldedit.navigation.ascend"), mk("worldedit.navigation.descend"),
      ]},
      { name: "Brushes & Tools", permissions: [
        mk("worldedit.brush.sphere"), mk("worldedit.brush.cylinder"),
        mk("worldedit.brush.smooth"), mk("worldedit.brush.gravity"),
        mk("worldedit.tool.tree"), mk("worldedit.tool.repl"),
      ]},
      { name: "History", permissions: [
        mk("worldedit.history.undo"), mk("worldedit.history.redo"),
        mk("worldedit.history.clear"),
      ]},
    ],
  },
  {
    plugin: "LuckPerms", version: "5.4", color: "#22d3ee", icon: "Shield",
    categories: [
      { name: "User", permissions: [
        mk("luckperms.user.info"),
        mk("luckperms.user.permission.set"), mk("luckperms.user.permission.unset"),
        mk("luckperms.user.permission.info"), mk("luckperms.user.permission.check"),
        mk("luckperms.user.parent.add"), mk("luckperms.user.parent.remove"),
        mk("luckperms.user.parent.set"), mk("luckperms.user.meta.set"),
      ]},
      { name: "Group", permissions: [
        mk("luckperms.group.info"),
        mk("luckperms.group.permission.set"), mk("luckperms.group.permission.unset"),
        mk("luckperms.group.parent.add"), mk("luckperms.group.parent.remove"),
        mk("luckperms.group.setweight"), mk("luckperms.group.rename"),
        mk("luckperms.creategroup"), mk("luckperms.deletegroup"),
      ]},
      { name: "Track", permissions: [
        mk("luckperms.createtrack"), mk("luckperms.deletetrack"),
        mk("luckperms.track.append"), mk("luckperms.track.insert"),
        mk("luckperms.user.promote"), mk("luckperms.user.demote"),
      ]},
      { name: "Editor", permissions: [
        mk("luckperms.editor"), mk("luckperms.tree"), mk("luckperms.search"),
        mk("luckperms.import"), mk("luckperms.export"), mk("luckperms.sync"),
      ]},
    ],
  },
  {
    plugin: "WorldGuard", version: "7.0.9", color: "#f59e0b", icon: "ShieldCheck",
    categories: [
      { name: "Regions", permissions: [
        mk("worldguard.region.define"), mk("worldguard.region.redefine"),
        mk("worldguard.region.flag"), mk("worldguard.region.bypass.*"),
        mk("worldguard.region.remove"), mk("worldguard.region.list"),
        mk("worldguard.region.info"), mk("worldguard.region.addmember.own"),
        mk("worldguard.region.addowner.own"), mk("worldguard.region.removemember.own"),
        mk("worldguard.region.setpriority.own"), mk("worldguard.region.teleport.own"),
      ]},
      { name: "Bypass", permissions: [
        mk("worldguard.god"), mk("worldguard.heal"), mk("worldguard.slay"),
        mk("worldguard.stack"), mk("worldguard.locate"),
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
      mk("placeholderapi.ecloud.placeholder"), mk("placeholderapi.reload"),
      mk("placeholderapi.list"),
    ]}],
  },
  {
    plugin: "LiteBans", version: "2.10", color: "#ef4444", icon: "Gavel",
    categories: [
      { name: "Punishments", permissions: [
        mk("litebans.ban"), mk("litebans.tempban"), mk("litebans.ipban"),
        mk("litebans.kick"), mk("litebans.mute"), mk("litebans.tempmute"),
        mk("litebans.warn"), mk("litebans.unban"), mk("litebans.unmute"),
        mk("litebans.unwarn"),
      ]},
      { name: "History", permissions: [
        mk("litebans.history"), mk("litebans.staffhistory"), mk("litebans.dupeip"),
        mk("litebans.alts"), mk("litebans.lockdown"),
      ]},
    ],
  },
  {
    plugin: "CoreProtect", version: "22.4", color: "#14b8a6", icon: "History",
    categories: [{ name: "Inspect", permissions: [
      mk("coreprotect.inspect"), mk("coreprotect.lookup"), mk("coreprotect.rollback"),
      mk("coreprotect.restore"), mk("coreprotect.purge"), mk("coreprotect.help"),
      mk("coreprotect.teleport"), mk("coreprotect.lookup.chat"),
      mk("coreprotect.lookup.command"), mk("coreprotect.lookup.sign"),
    ]}],
  },
  {
    plugin: "mcMMO", version: "2.2.0", color: "#10b981", icon: "Swords",
    categories: [
      { name: "Skills", permissions: [
        mk("mcmmo.skills.mining"), mk("mcmmo.skills.woodcutting"),
        mk("mcmmo.skills.excavation"), mk("mcmmo.skills.herbalism"),
        mk("mcmmo.skills.fishing"), mk("mcmmo.skills.unarmed"),
        mk("mcmmo.skills.archery"), mk("mcmmo.skills.swords"),
        mk("mcmmo.skills.axes"), mk("mcmmo.skills.taming"),
        mk("mcmmo.skills.acrobatics"), mk("mcmmo.skills.repair"),
        mk("mcmmo.skills.alchemy"), mk("mcmmo.skills.*"),
      ]},
      { name: "Commands", permissions: [
        mk("mcmmo.commands.mcstats"), mk("mcmmo.commands.mctop"),
        mk("mcmmo.commands.mcrank"), mk("mcmmo.commands.party"),
        mk("mcmmo.commands.inspect"), mk("mcmmo.commands.mcability"),
      ]},
    ],
  },
  {
    plugin: "DiscordSRV", version: "1.28", color: "#5865f2", icon: "MessageSquare",
    categories: [{ name: "Linking", permissions: [
      mk("discordsrv.link"), mk("discordsrv.broadcast"),
      mk("discordsrv.discord"), mk("discordsrv.unlink"),
      mk("discordsrv.reload"), mk("discordsrv.resync"),
    ]}],
  },
  {
    plugin: "TAB", version: "4.2.2", color: "#f97316", icon: "Layout",
    categories: [{ name: "Admin", permissions: [
      mk("tab.admin"), mk("tab.staff"), mk("tab.reload"),
      mk("tab.bypass"), mk("tab.debug"), mk("tab.cpu"),
    ]}],
  },
  {
    plugin: "Towny", version: "0.100", color: "#84cc16", icon: "Castle",
    categories: [
      { name: "Town", permissions: [
        mk("towny.town.new"), mk("towny.town.claim"), mk("towny.town.unclaim"),
        mk("towny.town.delete"), mk("towny.town.invite"), mk("towny.town.kick"),
        mk("towny.town.set"), mk("towny.town.spawn"), mk("towny.town.toggle"),
      ]},
      { name: "Nation", permissions: [
        mk("towny.nation.new"), mk("towny.nation.delete"),
        mk("towny.nation.invite"), mk("towny.nation.ally"),
        mk("towny.nation.enemy"), mk("towny.nation.king"),
      ]},
      { name: "Resident", permissions: [
        mk("towny.command.resident.friend"), mk("towny.command.resident.spawn"),
        mk("towny.command.resident.tp"), mk("towny.command.resident.toggle"),
      ]},
    ],
  },
  {
    plugin: "Multiverse", version: "4.3.14", color: "#06b6d4", icon: "Globe",
    categories: [
      { name: "Core", permissions: [
        mk("multiverse.core.list.worlds"), mk("multiverse.core.tp.self"),
        mk("multiverse.core.tp.other"), mk("multiverse.core.spawn.self"),
        mk("multiverse.core.create"), mk("multiverse.core.delete"),
        mk("multiverse.core.modify.set"), mk("multiverse.core.import"),
      ]},
    ],
  },
  {
    plugin: "ProtocolLib", version: "5.3", color: "#8b5cf6", icon: "Plug",
    categories: [{ name: "Admin", permissions: [
      mk("protocol.admin"), mk("protocol.info"), mk("protocol.debug"),
    ]}],
  },
  {
    plugin: "GriefPrevention", version: "16.18", color: "#dc2626", icon: "Shield",
    categories: [{ name: "Claims", permissions: [
      mk("griefprevention.claims"), mk("griefprevention.adminclaims"),
      mk("griefprevention.deleteclaims"), mk("griefprevention.ignoreclaims"),
      mk("griefprevention.restorenature"), mk("griefprevention.unlockdrops"),
    ]}],
  },
  {
    plugin: "Citizens", version: "2.0.34", color: "#f59e0b", icon: "Users",
    categories: [{ name: "NPC", permissions: [
      mk("citizens.npc.create"), mk("citizens.npc.remove"),
      mk("citizens.npc.select"), mk("citizens.npc.spawn"),
      mk("citizens.npc.despawn"), mk("citizens.npc.tp"),
      mk("citizens.npc.path"), mk("citizens.admin"),
    ]}],
  },
  {
    plugin: "ChestShop", version: "3.12", color: "#eab308", icon: "ShoppingCart",
    categories: [{ name: "Shop", permissions: [
      mk("ChestShop.shop.create.normal"), mk("ChestShop.shop.create.admin"),
      mk("ChestShop.shop.buy"), mk("ChestShop.shop.sell"),
      mk("ChestShop.shop.destroy.other"),
    ]}],
  },
  {
    plugin: "Vanish", version: "1.2", color: "#64748b", icon: "EyeOff",
    categories: [{ name: "Vanish", permissions: [
      mk("vanish.vanish"), mk("vanish.see"), mk("vanish.smokeyeffects"),
      mk("vanish.preventincomingdamage"), mk("vanish.silentchestaccess"),
    ]}],
  },
  {
    plugin: "Skript", version: "2.8", color: "#a3e635", icon: "Code",
    categories: [{ name: "Admin", permissions: [
      mk("skript.admin"), mk("skript.reloadall"), mk("skript.reload"),
      mk("skript.update"),
    ]}],
  },
  {
    plugin: "ViaVersion", version: "5.0", color: "#22c55e", icon: "GitMerge",
    categories: [{ name: "Admin", permissions: [
      mk("viaversion.info"), mk("viaversion.reload"), mk("viaversion.dontfix"),
    ]}],
  },
];

export const ALL_PERMISSIONS = PLUGIN_REGISTRY.flatMap(p =>
  p.categories.flatMap(c => c.permissions.map(perm => ({ ...perm, plugin: p.plugin })))
);
