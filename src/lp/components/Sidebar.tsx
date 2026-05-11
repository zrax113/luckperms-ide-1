import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Users, Shield, GitBranch, Package, FileText, Plus, Trash2, Copy, Search } from "lucide-react";
import { useStore } from "../store/store";
import { PLUGIN_REGISTRY } from "../data/plugins";

function Section({ title, icon: Icon, count, children, defaultOpen = true }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/50">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hover:text-foreground transition">
        <ChevronRight className={`w-3 h-3 transition-transform ${open ? "rotate-90" : ""}`} />
        <Icon className="w-3.5 h-3.5" />
        <span>{title}</span>
        {count !== undefined && <span className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono normal-case">{count}</span>}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pb-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar() {
  const { groups, users, selection, setSelection, addGroup, addUser, deleteGroup, deleteUser, cloneGroup } = useStore();
  const [q, setQ] = useState("");
  const fg = groups.filter(g => g.name.toLowerCase().includes(q.toLowerCase()));
  const fu = users.filter(u => u.username.toLowerCase().includes(q.toLowerCase()));

  return (
    <aside className="w-64 shrink-0 bg-sidebar-bg border-r border-border flex flex-col">
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter explorer…" className="w-full h-7 pl-7 pr-2 text-xs rounded-md bg-input/70 border border-border focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <Section title="Groups" icon={Shield} count={groups.length}>
          <div className="px-1">
            {fg.sort((a,b)=>b.weight-a.weight).map(g => {
              const active = selection?.type === "group" && selection.id === g.id;
              return (
                <div key={g.id} className={`group flex items-center gap-1.5 px-2 py-1 rounded-md text-xs cursor-pointer transition ${active ? "bg-primary/15 text-foreground border border-primary/40" : "hover:bg-accent/50 border border-transparent"}`}
                  onClick={() => setSelection({ type: "group", id: g.id })}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: g.color || "#94a3b8", boxShadow: `0 0 8px ${g.color || "#94a3b8"}` }} />
                  <span className="font-medium truncate">{g.name}</span>
                  <span className="ml-auto text-[9px] font-mono text-muted-foreground">{g.weight}</span>
                  <button onClick={(e) => { e.stopPropagation(); cloneGroup(g.id); }} className="opacity-0 group-hover:opacity-100 hover:text-info"><Copy className="w-3 h-3" /></button>
                  <button onClick={(e) => { e.stopPropagation(); deleteGroup(g.id); }} className="opacity-0 group-hover:opacity-100 hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                </div>
              );
            })}
            <button onClick={() => { const n = prompt("Group name?"); if (n) addGroup(n); }} className="mt-1 w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition">
              <Plus className="w-3 h-3" /> New group
            </button>
          </div>
        </Section>

        <Section title="Users" icon={Users} count={users.length}>
          <div className="px-1">
            {fu.map(u => {
              const active = selection?.type === "user" && selection.id === u.id;
              return (
                <div key={u.id} className={`group flex items-center gap-1.5 px-2 py-1 rounded-md text-xs cursor-pointer transition ${active ? "bg-primary/15 text-foreground border border-primary/40" : "hover:bg-accent/50 border border-transparent"}`}
                  onClick={() => setSelection({ type: "user", id: u.id })}>
                  <div className="w-5 h-5 rounded grid place-items-center bg-gradient-to-br from-primary/40 to-primary/10 text-[9px] font-bold">{u.username[0]}</div>
                  <span className="truncate">{u.username}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteUser(u.id); }} className="ml-auto opacity-0 group-hover:opacity-100 hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                </div>
              );
            })}
            <button onClick={() => { const n = prompt("Username?"); if (n) addUser(n); }} className="mt-1 w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition">
              <Plus className="w-3 h-3" /> New user
            </button>
          </div>
        </Section>

        <Section title="Tracks" icon={GitBranch} count={1} defaultOpen={false}>
          <div className="px-3 py-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 font-mono">staff: vip → mod → admin → owner</div>
          </div>
        </Section>

        <Section title="Plugins" icon={Package} count={PLUGIN_REGISTRY.length} defaultOpen={false}>
          <div className="px-1">
            {PLUGIN_REGISTRY.map(p => (
              <div key={p.plugin} className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-accent/50 rounded-md transition">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color, boxShadow: `0 0 8px ${p.color}` }} />
                <span className="truncate">{p.plugin}</span>
                <span className="ml-auto text-[9px] font-mono text-muted-foreground">{p.categories.reduce((s,c)=>s+c.permissions.length,0)}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Templates" icon={FileText} defaultOpen={false}>
          <div className="px-3 py-1 text-xs text-muted-foreground space-y-1">
            <div className="hover:text-primary cursor-pointer">Survival server</div>
            <div className="hover:text-primary cursor-pointer">SMP staff ranks</div>
            <div className="hover:text-primary cursor-pointer">Minigame network</div>
          </div>
        </Section>
      </div>

      <div className="p-2 border-t border-border text-[10px] font-mono text-muted-foreground flex items-center justify-between">
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Auto-saved</span>
        <span>v1.0.0</span>
      </div>
    </aside>
  );
}
