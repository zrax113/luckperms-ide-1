import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Asterisk, Sparkles, Ban } from "lucide-react";
import { PLUGIN_REGISTRY } from "../data/plugins";
import { useStore } from "../store/store";

export function PermissionPicker({ ownerType, ownerId, existing }: { ownerType: "group"|"user"; ownerId: string; existing: Set<string> }) {
  const { addPermission } = useStore();
  const [q, setQ] = useState("");
  const [activePlugin, setActivePlugin] = useState<string>("ALL");
  const [open, setOpen] = useState(false);

  const groups = useMemo(() => {
    const ql = q.toLowerCase();
    return PLUGIN_REGISTRY
      .filter(p => activePlugin === "ALL" || p.plugin === activePlugin)
      .map(p => ({
        plugin: p.plugin, color: p.color,
        items: p.categories.flatMap(c => c.permissions.map(perm => ({ ...perm, category: c.name, plugin: p.plugin })))
          .filter(x => !ql || x.node.toLowerCase().includes(ql) || (x.description || "").toLowerCase().includes(ql))
      }))
      .filter(p => p.items.length > 0);
  }, [q, activePlugin]);

  const add = (node: string, plugin: string) => {
    addPermission(ownerType, ownerId, node, plugin);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="glint flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium bg-primary text-primary-foreground glow-neon hover:glow-neon-lg transition">
          <Plus className="w-3.5 h-3.5" /> Add permission
        </motion.button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[480px] p-0 bg-popover border-primary/40 glow-neon overflow-hidden">
        <div className="p-2.5 border-b border-border flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search permissions across all plugins…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" />
          <kbd className="text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">esc</kbd>
        </div>
        <div className="px-2 py-1.5 border-b border-border flex items-center gap-1 overflow-x-auto">
          {["ALL", ...PLUGIN_REGISTRY.map(p => p.plugin)].map(name => (
            <button key={name} onClick={() => setActivePlugin(name)}
              className={`shrink-0 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md transition ${activePlugin===name?"bg-primary/20 text-primary border border-primary/40":"text-muted-foreground hover:text-foreground"}`}>
              {name}
            </button>
          ))}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {groups.length === 0 && <div className="p-6 text-center text-xs text-muted-foreground">No permissions match</div>}
          {groups.map(p => (
            <div key={p.plugin}>
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground bg-muted/30 sticky top-0 backdrop-blur flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }} />
                {p.plugin} <span className="font-mono text-[9px] opacity-60 ml-auto">{p.items.length}</span>
              </div>
              {p.items.map((perm, i) => {
                const has = existing.has(perm.node);
                return (
                  <motion.button key={perm.node} disabled={has}
                    initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.005 }}
                    onClick={() => { add(perm.node, perm.plugin); setOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 flex items-center gap-2 text-xs hover:bg-primary/10 hover:border-l-2 hover:border-primary border-l-2 border-transparent transition ${has ? "opacity-40 cursor-not-allowed" : ""}`}>
                    {perm.node.endsWith(".*") ? <Asterisk className="w-3 h-3 text-warning shrink-0" /> :
                     perm.node.startsWith("-") ? <Ban className="w-3 h-3 text-destructive shrink-0" /> :
                     <Sparkles className="w-3 h-3 text-primary shrink-0" />}
                    <span className="font-mono truncate">{perm.node}</span>
                    <span className="ml-auto text-[9px] text-muted-foreground truncate max-w-[180px]">{perm.description}</span>
                    {has && <span className="text-[9px] text-success font-mono">✓</span>}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="p-2 border-t border-border flex items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => {
            if (e.key === "Enter" && q && /^[\w*.-]+$/.test(q)) { add(q, undefined as any); setOpen(false); }
          }} placeholder="…or type custom node + Enter" className="flex-1 h-7 px-2 text-xs font-mono bg-input border border-border rounded focus:border-primary outline-none" />
        </div>
      </PopoverContent>
    </Popover>
  );
}
