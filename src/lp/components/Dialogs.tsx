import { useMemo, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStore, resolveEffectivePermissions } from "../store/store";
import { PLUGIN_REGISTRY, ALL_PERMISSIONS } from "../data/plugins";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  MarkerType,
} from "reactflow";
import { Search, FlaskConical, Package, GitBranch, Check, X, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

// SIMULATOR
export function SimulatorDialog({ open, onOpenChange }: any) {
  const { groups, users } = useStore();
  const [userId, setUserId] = useState(users[0]?.id || "");
  const [world, setWorld] = useState("");
  const [perm, setPerm] = useState("essentials.fly");
  const user = users.find((u) => u.id === userId);

  const result = useMemo(() => {
    if (!user) return null;
    const merged = new Map<
      string,
      { value: boolean; from: string; reason: string; weight: number }
    >();
    for (const gid of user.groups) {
      const m = resolveEffectivePermissions(groups, "group", gid, { world });
      m.forEach((v, k) => {
        const cur = merged.get(k);
        if (!cur || v.weight >= cur.weight) merged.set(k, v);
      });
    }
    for (const p of user.permissions) {
      if (p.contexts?.world && world && p.contexts.world !== world) continue;
      merged.set(p.node, {
        value: p.value,
        from: user.username,
        reason: `direct on user ${user.username}`,
        weight: 9999,
      });
    }
    // wildcard expansion: if "*" granted, base default true
    const wildcard = merged.get("*");
    let direct = merged.get(perm);
    if (!direct && wildcard)
      direct = { ...wildcard, reason: `matched wildcard "*" — ${wildcard.reason}` };
    // try parent wildcards
    if (!direct) {
      const parts = perm.split(".");
      for (let i = parts.length - 1; i > 0; i--) {
        const wc = parts.slice(0, i).join(".") + ".*";
        const m = merged.get(wc);
        if (m) {
          direct = { ...m, reason: `matched wildcard "${wc}" — ${m.reason}` };
          break;
        }
      }
    }
    return { result: direct, all: merged };
  }, [user, groups, perm, world]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-panel border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-primary" /> Permission Simulator
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3">
          <Select
            label="User"
            value={userId}
            onChange={setUserId}
            options={users.map((u) => ({ v: u.id, l: u.username }))}
          />
          <Field label="World">
            <input
              value={world}
              onChange={(e) => setWorld(e.target.value)}
              placeholder="any"
              className="w-full h-9 px-2 text-sm rounded-md bg-input border border-border focus:border-primary focus:outline-none"
            />
          </Field>
          <Field label="Permission node">
            <input
              value={perm}
              onChange={(e) => setPerm(e.target.value)}
              className="w-full h-9 px-2 text-sm font-mono rounded-md bg-input border border-border focus:border-primary focus:outline-none"
            />
          </Field>
        </div>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm text-muted-foreground">Result:</span>
              {result.result ? (
                <span
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-mono text-sm font-bold ${result.result.value ? "bg-success/15 text-success border border-success/30" : "bg-destructive/15 text-destructive border border-destructive/30"}`}
                >
                  {result.result.value ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  {String(result.result.value).toUpperCase()}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-md font-mono text-sm bg-muted text-muted-foreground border border-border">
                  UNDEFINED (default deny)
                </span>
              )}
            </div>
            {result.result && (
              <div className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">Reason:</span> {result.result.reason}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-border/60">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                Resolved permissions ({result.all.size})
              </div>
              <div className="max-h-48 overflow-y-auto space-y-0.5 font-mono text-xs">
                {Array.from(result.all.entries())
                  .slice(0, 50)
                  .map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-center gap-2 px-2 py-0.5 rounded hover:bg-accent/40"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${v.value ? "bg-success" : "bg-destructive"}`}
                      />
                      <span className="truncate">{k}</span>
                      <span className="ml-auto text-muted-foreground text-[10px]">{v.from}</span>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// PLUGIN BROWSER
export function PluginsDialog({ open, onOpenChange }: any) {
  const [active, setActive] = useState(PLUGIN_REGISTRY[0].plugin);
  const [q, setQ] = useState("");
  const plugin = PLUGIN_REGISTRY.find((p) => p.plugin === active)!;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[70vh] bg-panel border-border p-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" /> Plugin Browser
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-56 border-r border-border overflow-y-auto p-2 space-y-0.5">
            {PLUGIN_REGISTRY.map((p) => (
              <button
                key={p.plugin}
                onClick={() => setActive(p.plugin)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition ${active === p.plugin ? "bg-primary/15 border border-primary/40" : "hover:bg-accent/50 border border-transparent"}`}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: p.color, boxShadow: `0 0 8px ${p.color}` }}
                />
                <span className="truncate">{p.plugin}</span>
                <span className="ml-auto text-[9px] font-mono text-muted-foreground">
                  {p.categories.reduce((s, c) => s + c.permissions.length, 0)}
                </span>
              </button>
            ))}
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-border flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg grid place-items-center text-lg font-bold"
                style={{
                  background: `linear-gradient(135deg, ${plugin.color}40, ${plugin.color}10)`,
                  boxShadow: `0 0 20px ${plugin.color}30`,
                }}
              >
                {plugin.plugin[0]}
              </div>
              <div>
                <div className="font-semibold">{plugin.plugin}</div>
                <div className="text-[10px] font-mono text-muted-foreground">v{plugin.version}</div>
              </div>
              <div className="ml-auto relative">
                <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Filter…"
                  className="w-56 h-8 pl-7 pr-2 text-xs rounded-md bg-input border border-border focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {plugin.categories.map((cat) => {
                const filtered = cat.permissions.filter((p) =>
                  p.node.toLowerCase().includes(q.toLowerCase()),
                );
                if (!filtered.length) return null;
                return (
                  <div key={cat.name} className="rounded-lg border border-border bg-card/40">
                    <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/60">
                      {cat.name}
                    </div>
                    <div className="p-2 space-y-0.5">
                      {filtered.map((perm) => (
                        <div
                          key={perm.node}
                          className="group flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent/40 transition"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${perm.default === "true" ? "bg-success" : perm.default === "false" ? "bg-destructive" : "bg-warning"}`}
                          />
                          <span className="font-mono text-xs">{perm.node}</span>
                          {perm.wildcard && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-warning/20 text-warning">
                              wildcard
                            </span>
                          )}
                          <span className="ml-auto text-xs text-muted-foreground truncate max-w-md">
                            {perm.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// INHERITANCE GRAPH
export function GraphDialog({ open, onOpenChange }: any) {
  const { groups } = useStore();
  const { nodes, edges } = useMemo(() => {
    const sorted = [...groups].sort((a, b) => a.weight - b.weight);
    const nodes: Node[] = sorted.map((g, i) => ({
      id: g.id,
      position: { x: (i % 4) * 220, y: Math.floor(i / 4) * 140 },
      data: {
        label: (
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full" style={{ background: g.color || "#94a3b8" }} />
              {g.name}
            </div>
            <div className="text-[10px] font-mono opacity-70 mt-1">
              w:{g.weight} • {g.permissions.length} perms
            </div>
          </div>
        ),
      },
      style: {
        background: "oklch(0.22 0.025 270)",
        color: "white",
        border: `1px solid ${g.color || "#475569"}`,
        borderRadius: 8,
        padding: 8,
        width: 180,
        boxShadow: `0 0 20px ${g.color || "#475569"}30`,
      },
    }));
    const edges: Edge[] = groups.flatMap((g) =>
      g.parents.map((p) => ({
        id: `${p}-${g.id}`,
        source: p,
        target: g.id,
        animated: true,
        style: { stroke: "oklch(0.72 0.18 195)", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "oklch(0.72 0.18 195)" },
      })),
    );
    return { nodes, edges };
  }, [groups]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[80vh] bg-panel border-border p-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" /> Inheritance Graph
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1" style={{ height: "calc(80vh - 60px)" }}>
          <ReactFlow nodes={nodes} edges={edges} fitView>
            <Background color="#334155" gap={20} />
            <Controls />
            <MiniMap nodeColor={() => "#22d3ee"} style={{ background: "oklch(0.18 0.02 270)" }} />
          </ReactFlow>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// COMMAND/SEARCH PALETTE
export function SearchDialog({ open, onOpenChange }: any) {
  const { groups, users, setSelection } = useStore();
  const [q, setQ] = useState("");
  useEffect(() => {
    if (open) setQ("");
  }, [open]);
  const results = useMemo(() => {
    if (!q) return [];
    const ql = q.toLowerCase();
    return [
      ...groups
        .filter((g) => g.name.toLowerCase().includes(ql))
        .map((g) => ({
          kind: "group" as const,
          label: g.name,
          sub: `weight ${g.weight}`,
          action: () => setSelection({ type: "group", id: g.id }),
        })),
      ...users
        .filter((u) => u.username.toLowerCase().includes(ql))
        .map((u) => ({
          kind: "user" as const,
          label: u.username,
          sub: u.uuid,
          action: () => setSelection({ type: "user", id: u.id }),
        })),
      ...ALL_PERMISSIONS.filter((p) => p.node.toLowerCase().includes(ql))
        .slice(0, 20)
        .map((p) => ({
          kind: "perm" as const,
          label: p.node,
          sub: p.plugin || "",
          action: () => {},
        })),
    ].slice(0, 30);
  }, [q, groups, users]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-panel border-border p-0 overflow-hidden">
        <div className="p-3 border-b border-border flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search anything…"
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <kbd className="text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">
            esc
          </kbd>
        </div>
        <div className="max-h-96 overflow-y-auto p-1">
          {results.length === 0 && (
            <div className="text-xs text-muted-foreground p-6 text-center">
              {q ? "No results" : "Start typing to search groups, users, and permissions"}
            </div>
          )}
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => {
                r.action();
                onOpenChange(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/60 text-sm transition"
            >
              <span
                className={`text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded ${r.kind === "group" ? "bg-primary/20 text-primary" : r.kind === "user" ? "bg-info/20 text-info" : "bg-warning/20 text-warning"}`}
              >
                {r.kind}
              </span>
              <span className={r.kind === "perm" ? "font-mono text-xs" : ""}>{r.label}</span>
              <span className="ml-auto text-xs text-muted-foreground truncate">{r.sub}</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const Field = ({ label, children }: any) => (
  <div>
    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
      {label}
    </label>
    <div className="mt-0.5">{children}</div>
  </div>
);
const Select = ({ label, value, onChange, options }: any) => (
  <Field label={label}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-9 px-2 text-sm rounded-md bg-input border border-border focus:border-primary focus:outline-none"
    >
      {options.map((o: any) => (
        <option key={o.v} value={o.v}>
          {o.l}
        </option>
      ))}
    </select>
  </Field>
);
