import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Users, Shield, GitBranch, Package, FileText, Plus, Trash2, Copy, Search, Layers, ArrowRight } from "lucide-react";
import { useStore } from "../store/store";
import { PLUGIN_REGISTRY } from "../data/plugins";
import { TEMPLATES } from "../data/templates";
import { showPrompt } from "./PromptModal";
import { toast } from "sonner";

function Section({ title, icon: Icon, count, children, defaultOpen = true, action }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/40">
      <div className="group flex items-center w-full px-2 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
        <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 hover:text-foreground transition flex-1">
          <ChevronRight className={`w-3 h-3 transition-transform ${open ? "rotate-90" : ""}`} />
          <Icon className="w-3 h-3" />
          <span>{title}</span>
          {count !== undefined && <span className="ml-1 text-[9px] bg-muted/70 px-1.5 py-0.5 rounded font-mono normal-case">{count}</span>}
        </button>
        {action && <div className="opacity-0 group-hover:opacity-100 transition">{action}</div>}
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
            <div className="pb-1.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar({ onOpenDialog }: { onOpenDialog: (k: "plugins") => void }) {
  const { groups, users, selection, setSelection, addGroup, addUser, deleteGroup, deleteUser, cloneGroup, loadData, mergeData, addPermission } = useStore();
  const [q, setQ] = useState("");
  const fg = groups.filter(g => g.name.toLowerCase().includes(q.toLowerCase()));
  const fu = users.filter(u => u.username.toLowerCase().includes(q.toLowerCase()));

  const newGroup = async () => {
    const n = await showPrompt({ title: "New group", placeholder: "e.g. moderator", submitLabel: "Create group" });
    if (n) { addGroup(n); toast.success(`Created group "${n}"`); }
  };
  const newUser = async () => {
    const n = await showPrompt({ title: "New user", placeholder: "Minecraft username", submitLabel: "Create user" });
    if (n) { addUser(n); toast.success(`Created user "${n}"`); }
  };
  const loadTemplate = (id: string) => {
    const t = TEMPLATES.find(x => x.id === id); if (!t) return;
    mergeData(structuredClone(t.groups), structuredClone(t.users));
    toast.success(`Template merged: ${t.name}`, { description: `${t.groups.length} groups added` });
  };
  const importPlugin = async (pluginName: string) => {
    if (!groups.length) { toast.error("Create a group first"); return; }
    const target = await showPrompt({ title: `Import all "${pluginName}" perms into…`, placeholder: groups[0].name, defaultValue: groups[0].name, submitLabel: "Import" });
    if (!target) return;
    const g = groups.find(x => x.name.toLowerCase() === target.toLowerCase());
    if (!g) { toast.error(`Group "${target}" not found`); return; }
    const reg = PLUGIN_REGISTRY.find(p => p.plugin === pluginName)!;
    const existing = new Set(g.permissions.map(p => p.node));
    let added = 0;
    for (const cat of reg.categories) for (const p of cat.permissions) {
      if (!existing.has(p.node)) { addPermission("group", g.id, p.node, pluginName); added++; }
    }
    toast.success(`Imported ${added} ${pluginName} perms into ${g.name}`);
  };

  return (
    <aside className="w-60 shrink-0 bg-sidebar-bg border-r border-border flex flex-col">
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter explorer…"
            className="w-full h-7 pl-6.5 pl-7 pr-2 text-xs rounded-md bg-input/70 border border-border focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/20" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Section title="Groups" icon={Shield} count={groups.length}
          action={<button onClick={newGroup} className="text-primary hover:text-primary/80 px-1"><Plus className="w-3 h-3" /></button>}>
          <div className="px-1">
            {fg.sort((a,b)=>b.weight-a.weight).map(g => {
              const active = selection?.type === "group" && selection.id === g.id;
              return (
                <motion.div key={g.id} layout
                  className={`group flex items-center gap-1.5 px-2 py-1 rounded-md text-xs cursor-pointer transition ${active ? "bg-primary/10 text-foreground ring-1 ring-primary/40" : "hover:bg-accent/40"}`}
                  onClick={() => setSelection({ type: "group", id: g.id })}>
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: g.color || "#94a3b8", boxShadow: `0 0 6px ${g.color || "#94a3b8"}80` }} />
                  <span className="font-medium truncate">{g.name}</span>
                  <span className="ml-auto text-[9px] font-mono text-muted-foreground">{g.weight}</span>
                  <button onClick={(e) => { e.stopPropagation(); cloneGroup(g.id); toast.success(`Cloned ${g.name}`); }} className="opacity-0 group-hover:opacity-100 hover:text-info"><Copy className="w-2.5 h-2.5" /></button>
                  <button onClick={(e) => { e.stopPropagation(); deleteGroup(g.id); toast(`Deleted ${g.name}`); }} className="opacity-0 group-hover:opacity-100 hover:text-destructive"><Trash2 className="w-2.5 h-2.5" /></button>
                </motion.div>
              );
            })}
            {fg.length === 0 && <div className="px-2 py-2 text-[11px] text-muted-foreground italic">No groups</div>}
          </div>
        </Section>

        <Section title="Users" icon={Users} count={users.length}
          action={<button onClick={newUser} className="text-primary hover:text-primary/80 px-1"><Plus className="w-3 h-3" /></button>}>
          <div className="px-1">
            {fu.map(u => {
              const active = selection?.type === "user" && selection.id === u.id;
              return (
                <motion.div key={u.id} layout
                  className={`group flex items-center gap-1.5 px-2 py-1 rounded-md text-xs cursor-pointer transition ${active ? "bg-primary/10 ring-1 ring-primary/40" : "hover:bg-accent/40"}`}
                  onClick={() => setSelection({ type: "user", id: u.id })}>
                  <div className="w-4 h-4 rounded grid place-items-center bg-gradient-to-br from-primary/40 to-primary/10 text-[8px] font-bold shrink-0">{u.username[0]}</div>
                  <span className="truncate">{u.username}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteUser(u.id); toast(`Deleted ${u.username}`); }} className="ml-auto opacity-0 group-hover:opacity-100 hover:text-destructive"><Trash2 className="w-2.5 h-2.5" /></button>
                </motion.div>
              );
            })}
          </div>
        </Section>

        <Section title="Tracks" icon={GitBranch} count={2} defaultOpen={false}>
          <div className="px-2 py-1 text-[11px] space-y-1.5">
            {[
              { name: "staff", chain: ["helper", "moderator", "admin"] },
              { name: "donor", chain: ["vip", "mvp", "legend"] },
            ].map(tr => (
              <div key={tr.name} className="rounded-md bg-card/50 border border-border/60 p-2 hover:border-primary/30 transition">
                <div className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">{tr.name}</div>
                <div className="flex items-center gap-1 mt-1 text-[10px] font-mono flex-wrap">
                  {tr.chain.map((c, i) => (
                    <span key={c} className="flex items-center gap-1">
                      {i > 0 && <ArrowRight className="w-2.5 h-2.5 text-primary/60" />}
                      <span className="text-foreground">{c}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Plugins" icon={Package} count={PLUGIN_REGISTRY.length} defaultOpen={true}>
          <div className="px-1">
            {PLUGIN_REGISTRY.map(p => (
              <div key={p.plugin} className="group flex items-center gap-2 px-2 py-1 text-xs hover:bg-accent/40 rounded-md transition">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.color, boxShadow: `0 0 6px ${p.color}80` }} />
                <span className="truncate">{p.plugin}</span>
                <span className="ml-auto text-[9px] font-mono text-muted-foreground">{p.categories.reduce((s,c)=>s+c.permissions.length,0)}</span>
                <button title="Import all into a group" onClick={() => importPlugin(p.plugin)} className="opacity-0 group-hover:opacity-100 hover:text-primary"><Layers className="w-3 h-3" /></button>
              </div>
            ))}
            <button onClick={() => onOpenDialog("plugins")} className="mt-1 w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] text-muted-foreground hover:text-primary hover:bg-primary/5 transition">
              <ArrowRight className="w-2.5 h-2.5" /> Open plugin browser
            </button>
          </div>
        </Section>

        <Section title="Templates" icon={FileText} count={TEMPLATES.length} defaultOpen={false}>
          <div className="px-1 space-y-1">
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => loadTemplate(t.id)}
                className="w-full text-left px-2 py-1.5 rounded-md hover:bg-primary/5 hover:border-primary/30 border border-transparent transition group">
                <div className="text-xs font-medium group-hover:text-primary transition">{t.name}</div>
                <div className="text-[10px] text-muted-foreground leading-tight">{t.description}</div>
              </button>
            ))}
          </div>
        </Section>
      </div>

      <div className="p-2 border-t border-border text-[10px] font-mono text-muted-foreground flex items-center justify-between">
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> auto-saved</span>
        <span>v1.0</span>
      </div>
    </aside>
  );
}
