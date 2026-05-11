import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Plus, Trash2, Asterisk, Ban, Clock, Globe, Layers, Sparkles } from "lucide-react";
import { useStore, resolveEffectivePermissions, type PermissionNode } from "../store/store";
import { ALL_PERMISSIONS } from "../data/plugins";

function PermissionRow({ perm, ownerType, ownerId, inherited, fromGroup }: { perm: PermissionNode; ownerType: "group"|"user"; ownerId: string; inherited?: boolean; fromGroup?: string }) {
  const { setSelection, selection, deletePermission, updatePermission } = useStore();
  const isWildcard = perm.node.includes("*");
  const isNegated = perm.node.startsWith("-") || !perm.value;
  const active = selection?.type === "permission" && selection.permId === perm.id;
  return (
    <motion.div layout initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
      onClick={() => !inherited && setSelection({ type: "permission", ownerType, ownerId, permId: perm.id })}
      className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-mono cursor-pointer transition border ${active ? "bg-primary/10 border-primary/50 glow-primary" : "border-transparent hover:bg-accent/40 hover:border-border"} ${inherited ? "opacity-60" : ""}`}>
      <button onClick={(e) => { e.stopPropagation(); !inherited && updatePermission(ownerType, ownerId, perm.id, { value: !perm.value }); }}
        className={`w-2 h-2 rounded-full shrink-0 ${perm.value ? "bg-success shadow-[0_0_8px_oklch(0.72_0.18_150)]" : "bg-destructive shadow-[0_0_8px_oklch(0.65_0.22_25)]"}`} />
      {isWildcard && <Asterisk className="w-3 h-3 text-warning" />}
      {isNegated && !isWildcard && <Ban className="w-3 h-3 text-destructive" />}
      <span className={`truncate ${isNegated ? "text-destructive" : ""}`}>{perm.node}</span>
      {perm.plugin && <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground normal-case font-sans">{perm.plugin}</span>}
      {perm.temporary && <Clock className="w-3 h-3 text-info" />}
      {perm.contexts && Object.keys(perm.contexts).length > 0 && <Globe className="w-3 h-3 text-info" />}
      {inherited && <span className="ml-auto text-[9px] text-muted-foreground italic font-sans">↳ {fromGroup}</span>}
      {!inherited && (
        <button onClick={(e) => { e.stopPropagation(); deletePermission(ownerType, ownerId, perm.id); }}
          className="ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition">
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </motion.div>
  );
}

function AddPermission({ ownerType, ownerId }: { ownerType: "group"|"user"; ownerId: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const { addPermission } = useStore();
  const matches = useMemo(() => q.length < 1 ? [] : ALL_PERMISSIONS.filter(p => p.node.toLowerCase().includes(q.toLowerCase())).slice(0, 8), [q]);
  if (!open) return (
    <button onClick={() => setOpen(true)} className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition border border-dashed border-border hover:border-primary/40">
      <Plus className="w-3.5 h-3.5" /> Add permission
    </button>
  );
  return (
    <div className="mt-2 rounded-md bg-card border border-primary/40 p-2 glow-primary">
      <div className="flex gap-2">
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && q) { addPermission(ownerType, ownerId, q); setQ(""); setOpen(false); } if (e.key === "Escape") setOpen(false); }}
          placeholder="essentials.fly or -minecraft.command.stop"
          className="flex-1 h-8 px-2 text-xs font-mono rounded bg-input border border-border focus:border-primary focus:outline-none" />
        <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-foreground px-2">Esc</button>
      </div>
      {matches.length > 0 && (
        <div className="mt-2 space-y-0.5 max-h-48 overflow-y-auto">
          {matches.map(m => (
            <button key={m.node} onClick={() => { addPermission(ownerType, ownerId, m.node, m.plugin); setOpen(false); setQ(""); }}
              className="w-full text-left flex items-center gap-2 px-2 py-1 text-xs font-mono rounded hover:bg-accent transition">
              {m.node.endsWith(".*") ? <Asterisk className="w-3 h-3 text-warning" /> : <Sparkles className="w-3 h-3 text-info" />}
              <span className="truncate">{m.node}</span>
              <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-secondary/60 normal-case font-sans">{m.plugin}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TreeEditor() {
  const { selection, groups, users } = useStore();
  if (!selection || selection.type === "permission") return <EmptyState />;

  if (selection.type === "user") {
    const u = users.find(x => x.id === selection.id); if (!u) return <EmptyState />;
    return (
      <div className="flex-1 overflow-y-auto">
        <Header title={u.username} subtitle={u.uuid} icon="user" />
        <div className="p-4 space-y-4 max-w-4xl">
          <Section title="Inherited Groups" icon={Layers}>
            <div className="flex flex-wrap gap-2">
              {u.groups.map(gid => {
                const g = groups.find(x => x.id === gid); if (!g) return null;
                return (
                  <div key={gid} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-card border border-border text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ background: g.color, boxShadow: `0 0 8px ${g.color}` }} />
                    <span className="font-medium">{g.name}</span>
                    <span className="text-[9px] font-mono text-muted-foreground">w:{g.weight}</span>
                  </div>
                );
              })}
            </div>
          </Section>
          <Section title="Direct Permissions" icon={Sparkles} count={u.permissions.length}>
            <div className="space-y-1">
              {u.permissions.map(p => <PermissionRow key={p.id} perm={p} ownerType="user" ownerId={u.id} />)}
              <AddPermission ownerType="user" ownerId={u.id} />
            </div>
          </Section>
        </div>
      </div>
    );
  }

  const g = groups.find(x => x.id === selection.id); if (!g) return <EmptyState />;
  const effective = resolveEffectivePermissions(groups, "group", g.id);
  const directIds = new Set(g.permissions.map(p => p.node));
  const inheritedNodes = Array.from(effective.entries()).filter(([n]) => !directIds.has(n));

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title={g.name} subtitle={`weight ${g.weight} • ${g.parents.length} parent${g.parents.length===1?"":"s"}`} icon="group" color={g.color} />
      <div className="p-4 space-y-4 max-w-4xl">
        <Section title="Inheritance Chain" icon={Layers}>
          {g.parents.length === 0 ? <div className="text-xs text-muted-foreground italic">No parent groups</div> : (
            <div className="flex flex-wrap items-center gap-2">
              {g.parents.map(pid => {
                const p = groups.find(x => x.id === pid); if (!p) return null;
                return (
                  <motion.div key={pid} whileHover={{ scale: 1.04 }} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-card border border-border text-xs glint">
                    <div className="w-2 h-2 rounded-full" style={{ background: p.color, boxShadow: `0 0 8px ${p.color}` }} />
                    <span className="font-medium">{p.name}</span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{g.name}</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Section>

        <Section title="Direct Permissions" icon={Sparkles} count={g.permissions.length}>
          <div className="space-y-1">
            <AnimatePresence>
              {g.permissions.map(p => <PermissionRow key={p.id} perm={p} ownerType="group" ownerId={g.id} />)}
            </AnimatePresence>
            <AddPermission ownerType="group" ownerId={g.id} />
          </div>
        </Section>

        {inheritedNodes.length > 0 && (
          <Section title="Inherited Permissions" icon={Layers} count={inheritedNodes.length}>
            <div className="space-y-1">
              {inheritedNodes.map(([node, info]) => (
                <PermissionRow key={node}
                  perm={{ id: node, node, value: info.value }}
                  ownerType="group" ownerId={g.id} inherited fromGroup={info.from} />
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function Header({ title, subtitle, icon, color }: { title: string; subtitle?: string; icon: "group"|"user"; color?: string }) {
  return (
    <div className="px-6 py-5 border-b border-border bg-gradient-to-r from-titlebar via-panel to-titlebar relative overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-glow)" }} />
      <div className="flex items-center gap-3 relative">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-12 h-12 rounded-lg grid place-items-center border border-border glow-primary"
          style={{ background: color ? `linear-gradient(135deg, ${color}40, ${color}10)` : "var(--gradient-primary)" }}>
          <span className="text-lg font-bold uppercase">{title[0]}</span>
        </motion.div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          {subtitle && <div className="text-xs text-muted-foreground font-mono">{subtitle}</div>}
        </div>
        <div className="ml-auto text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
          {icon === "group" ? "Group" : "User"}
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, count, children }: any) {
  return (
    <div className="rounded-lg border border-border bg-panel/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/60">
        <Icon className="w-3.5 h-3.5 text-primary" />
        <span className="text-[11px] uppercase tracking-wider font-semibold">{title}</span>
        {count !== undefined && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">{count}</span>}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 grid place-items-center text-center p-8">
      <div className="max-w-sm">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="w-16 h-16 rounded-2xl mx-auto mb-4 gradient-primary grid place-items-center glow-primary">
          <Sparkles className="w-7 h-7 text-primary-foreground" />
        </motion.div>
        <h2 className="text-lg font-semibold gradient-text">Select a group or user</h2>
        <p className="text-sm text-muted-foreground mt-2">Pick something from the explorer to start editing permissions visually. Drag, drop, and inherit — no YAML required.</p>
      </div>
    </div>
  );
}
