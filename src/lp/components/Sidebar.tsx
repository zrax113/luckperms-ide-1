import React, { useState, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Users, Shield, GitBranch, Package, FileText, Plus, Trash2, Copy, Search, Layers, ArrowRight, Zap } from "lucide-react";
import { useStore } from "../store/store";
import { PLUGIN_REGISTRY } from "../data/plugins";
import { TEMPLATES } from "../data/templates";
import { showPrompt } from "./PromptModal";
import { toast } from "sonner";

// Memoized Section Header
const SectionHeader = memo(function SectionHeader({
  title,
  icon: Icon,
  count,
  isOpen,
  onToggle,
  action
}: any) {
  return (
    <button
      onClick={onToggle}
      className="w-full px-2 py-2 flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-all duration-200"
    >
      <ChevronRight className={`w-3 h-3 transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-90" : ""}`} />
      <Icon className="w-3 h-3 flex-shrink-0 text-primary/70 group-hover:text-primary transition-colors" />
      <span className="truncate">{title}</span>
      {count !== undefined && (
        <span className="ml-auto text-[8px] bg-primary/15 px-1.5 py-0.5 rounded font-mono text-primary flex-shrink-0">
          {count}
        </span>
      )}
      {action}
    </button>
  );
});

// Memoized Section Container
const Section = memo(function Section({ 
  title, 
  icon, 
  count, 
  children,
  defaultOpen = true,
  action 
}: any) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-border/40">
      <SectionHeader
        title={title}
        icon={icon}
        count={count}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        action={action}
      />
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-2 py-1.5 space-y-0.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Memoized Group Item
const GroupItemRow = memo(function GroupItemRow({
  group,
  isActive,
  onSelect,
  onClone,
  onDelete
}: any) {
  return (
    <button
      onClick={() => onSelect(group.id)}
      className={`group w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs cursor-pointer transition-all duration-200 ${
        isActive
          ? "bg-primary/10 text-foreground ring-1 ring-primary/40"
          : "text-foreground/80 hover:bg-accent/40 hover:text-foreground"
      }`}
    >
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: group.color || "#94a3b8" }}
      />
      <span className="truncate flex-1 font-medium">{group.name}</span>
      <span className="hidden group-hover:inline text-[8px] font-mono text-muted-foreground flex-shrink-0">
        {group.weight}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClone(group.id);
        }}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-info transition-all flex-shrink-0"
      >
        <Copy className="w-2.5 h-2.5" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(group.id);
        }}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all flex-shrink-0"
      >
        <Trash2 className="w-2.5 h-2.5" />
      </button>
    </button>
  );
});

// Memoized User Item
const UserItemRow = memo(function UserItemRow({
  user,
  isActive,
  onSelect,
  onDelete
}: any) {
  return (
    <button
      onClick={() => onSelect(user.id)}
      className={`group w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs cursor-pointer transition-all ${
        isActive
          ? "bg-primary/10 text-foreground ring-1 ring-primary/40"
          : "text-foreground/80 hover:bg-accent/40 hover:text-foreground"
      }`}
    >
      <div className="w-4 h-4 rounded flex items-center justify-center bg-gradient-to-br from-primary/40 to-primary/10 text-[7px] font-bold flex-shrink-0 text-primary">
        {user.username[0].toUpperCase()}
      </div>
      <span className="truncate flex-1">{user.username}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(user.id);
        }}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all flex-shrink-0"
      >
        <Trash2 className="w-2.5 h-2.5" />
      </button>
    </button>
  );
});

export function Sidebar({ onOpenDialog }: { onOpenDialog: (k: "plugins") => void }) {
  const {
    groups,
    users,
    selection,
    setSelection,
    addGroup,
    addUser,
    deleteGroup,
    deleteUser,
    cloneGroup,
    mergeData,
    addPermission
  } = useStore();
  const [query, setQuery] = useState("");

  // Memoized filtered results
  const filteredGroups = useMemo(
    () =>
      groups
        .filter((g) => g.name.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => b.weight - a.weight),
    [groups, query]
  );

  const filteredUsers = useMemo(
    () => users.filter((u) => u.username.toLowerCase().includes(query.toLowerCase())),
    [users, query]
  );

  // Memoized handlers
  const handleNewGroup = useCallback(async () => {
    const name = await showPrompt({
      title: "New group",
      placeholder: "e.g. moderator",
      submitLabel: "Create group"
    });
    if (name) {
      addGroup(name);
      toast.success(`Created group "${name}"`);
    }
  }, [addGroup]);

  const handleNewUser = useCallback(async () => {
    const name = await showPrompt({
      title: "New user",
      placeholder: "Minecraft username",
      submitLabel: "Create user"
    });
    if (name) {
      addUser(name);
      toast.success(`Created user "${name}"`);
    }
  }, [addUser]);

  const handleSelectGroup = useCallback(
    (id: string) => setSelection({ type: "group", id }),
    [setSelection]
  );

  const handleSelectUser = useCallback(
    (id: string) => setSelection({ type: "user", id }),
    [setSelection]
  );

  const handleCloneGroup = useCallback(
    (id: string) => {
      cloneGroup(id);
      toast.success("Group cloned");
    },
    [cloneGroup]
  );

  const handleDeleteGroup = useCallback(
    (id: string) => {
      const group = groups.find((g) => g.id === id);
      deleteGroup(id);
      toast.success(`Deleted ${group?.name}`);
    },
    [deleteGroup, groups]
  );

  const handleDeleteUser = useCallback(
    (id: string) => {
      const user = users.find((u) => u.id === id);
      deleteUser(id);
      toast.success(`Deleted ${user?.username}`);
    },
    [deleteUser, users]
  );

  const handleLoadTemplate = useCallback(
    (id: string) => {
      const template = TEMPLATES.find((t) => t.id === id);
      if (!template) return;
      mergeData(structuredClone(template.groups), structuredClone(template.users));
      toast.success(`Template merged: ${template.name}`, {
        description: `${template.groups.length} groups added`
      });
    },
    [mergeData]
  );

  const handleImportPlugin = useCallback(
    async (pluginName: string) => {
      if (!groups.length) {
        toast.error("Create a group first");
        return;
      }
      const target = await showPrompt({
        title: `Import all "${pluginName}" perms into…`,
        placeholder: groups[0].name,
        defaultValue: groups[0].name,
        submitLabel: "Import"
      });
      if (!target) return;

      const group = groups.find(
        (g) => g.name.toLowerCase() === target.toLowerCase()
      );
      if (!group) {
        toast.error(`Group "${target}" not found`);
        return;
      }

      const registry = PLUGIN_REGISTRY.find((p) => p.plugin === pluginName)!;
      const existing = new Set(group.permissions.map((p) => p.node));
      let added = 0;

      for (const category of registry.categories) {
        for (const permission of category.permissions) {
          if (!existing.has(permission.node)) {
            addPermission("group", group.id, permission.node, pluginName);
            added++;
          }
        }
      }

      toast.success(`Imported ${added} ${pluginName} perms into ${group.name}`);
    },
    [groups, addPermission]
  );

  return (
    <div className="flex flex-col w-full h-full bg-sidebar-bg border-r border-border">
      {/* Search Header */}
      <div className="flex-shrink-0 p-3 border-b border-border/50 bg-gradient-to-b from-titlebar/60 to-sidebar-bg/80 backdrop-blur-sm">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search groups, users…"
            className="w-full h-8 pl-8 pr-3 text-xs rounded-md bg-input/50 border border-border/60 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border/40 hover:scrollbar-thumb-border/70">
        {/* Quick Stats */}
        <div className="flex-shrink-0 px-3 py-2 space-y-1 text-[9px] text-muted-foreground border-b border-border/30 bg-accent/5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-primary" />
              Groups
            </span>
            <span className="font-mono bg-primary/10 px-1.5 py-0.5 rounded text-primary font-semibold">
              {groups.length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="w-3 h-3 text-info" />
              Users
            </span>
            <span className="font-mono bg-info/10 px-1.5 py-0.5 rounded text-info font-semibold">
              {users.length}
            </span>
          </div>
        </div>

        {/* Groups Section */}
        <Section
          title="Groups"
          icon={Shield}
          count={groups.length}
          defaultOpen={true}
          action={
            <button
              onClick={handleNewGroup}
              className="ml-auto text-primary hover:text-primary/80 transition-colors flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          }
        >
          <AnimatePresence mode="popLayout">
            {filteredGroups.length === 0 ? (
              <div className="text-[10px] text-muted-foreground italic py-2 text-center">
                {query ? "No groups found" : "No groups yet"}
              </div>
            ) : (
              filteredGroups.map((group) => (
                <GroupItemRow
                  key={group.id}
                  group={group}
                  isActive={selection?.type === "group" && selection?.id === group.id}
                  onSelect={handleSelectGroup}
                  onClone={handleCloneGroup}
                  onDelete={handleDeleteGroup}
                />
              ))
            )}
          </AnimatePresence>
        </Section>

        {/* Users Section */}
        <Section
          title="Users"
          icon={Users}
          count={users.length}
          defaultOpen={true}
          action={
            <button
              onClick={handleNewUser}
              className="ml-auto text-primary hover:text-primary/80 transition-colors flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          }
        >
          <AnimatePresence mode="popLayout">
            {filteredUsers.length === 0 ? (
              <div className="text-[10px] text-muted-foreground italic py-2 text-center">
                {query ? "No users found" : "No users yet"}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <UserItemRow
                  key={user.id}
                  user={user}
                  isActive={selection?.type === "user" && selection?.id === user.id}
                  onSelect={handleSelectUser}
                  onDelete={handleDeleteUser}
                />
              ))
            )}
          </AnimatePresence>
        </Section>

        {/* Tracks Section */}
        <Section
          title="Tracks"
          icon={GitBranch}
          count={2}
          defaultOpen={false}
        >
          {[
            { name: "staff", chain: ["helper", "moderator", "admin"] },
            { name: "donor", chain: ["vip", "mvp", "legend"] }
          ].map((track) => (
            <div
              key={track.name}
              className="rounded-md bg-card/40 border border-border/40 p-2 hover:border-primary/40 hover:bg-card/60 transition-all"
            >
              <div className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">
                {track.name}
              </div>
              <div className="flex items-center gap-1 mt-1.5 text-[9px] font-mono flex-wrap">
                {track.chain.map((item, idx) => (
                  <span key={item} className="flex items-center gap-1">
                    {idx > 0 && <ArrowRight className="w-2.5 h-2.5 text-primary/50" />}
                    <span className="text-foreground/70">{item}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </Section>

        {/* Plugins Section */}
        <Section
          title="Plugins"
          icon={Package}
          count={PLUGIN_REGISTRY.length}
          defaultOpen={true}
        >
          <div className="space-y-0.5">
            {PLUGIN_REGISTRY.map((plugin) => (
              <div
                key={plugin.plugin}
                className="group flex items-center gap-2 px-2 py-1.5 text-xs rounded-md hover:bg-accent/40 transition-all cursor-pointer"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: plugin.color }}
                />
                <span className="truncate flex-1 text-foreground/80 group-hover:text-foreground transition-colors">
                  {plugin.plugin}
                </span>
                <span className="text-[8px] font-mono text-muted-foreground flex-shrink-0">
                  {plugin.categories.reduce(
                    (sum, cat) => sum + cat.permissions.length,
                    0
                  )}
                </span>
                <button
                  onClick={() => handleImportPlugin(plugin.plugin)}
                  title="Import all into a group"
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-all flex-shrink-0"
                >
                  <Layers className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() => onOpenDialog("plugins")}
              className="mt-2 w-full flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-[10px] text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all font-semibold"
            >
              <Zap className="w-3 h-3" /> Browse more
            </button>
          </div>
        </Section>

        {/* Templates Section */}
        <Section
          title="Templates"
          icon={FileText}
          count={TEMPLATES.length}
          defaultOpen={false}
        >
          <div className="space-y-1">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleLoadTemplate(template.id)}
                className="w-full text-left px-2 py-1.5 rounded-md hover:bg-primary/5 border border-transparent hover:border-primary/30 transition-all group"
              >
                <div className="text-xs font-medium text-foreground/80 group-hover:text-primary transition-colors">
                  {template.name}
                </div>
                <div className="text-[9px] text-muted-foreground leading-tight group-hover:text-muted-foreground/80 transition-colors">
                  {template.description}
                </div>
              </button>
            ))}
          </div>
        </Section>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-2.5 border-t border-border/50 bg-gradient-to-t from-titlebar/40 to-sidebar-bg/80 backdrop-blur-sm text-[9px] font-mono text-muted-foreground flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          auto-saved
        </span>
        <span className="text-[8px] text-muted-foreground/60">v1.0</span>
      </div>
    </div>
  );
}
