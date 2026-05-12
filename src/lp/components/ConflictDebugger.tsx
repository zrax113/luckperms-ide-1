import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  GitBranch,
  Bug,
  Layers,
  Filter,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Wand2,
  Zap,
} from "lucide-react";
import { useStore, resolveEffectivePermissions, type Group, type User } from "../store/store";
import { validateAll } from "../store/validation";
import { toast } from "sonner";

type Conflict = {
  kind: "override" | "deny-vs-allow" | "wildcard-shadow" | "circular" | "duplicate" | "unreachable";
  level: "error" | "warning" | "info";
  ownerName: string;
  ownerType: "group" | "user";
  ownerId: string;
  node: string;
  message: string;
  trace: string[];
  permId?: string;
  fix?: () => void;
  fixLabel?: string;
};

export function ConflictDebugger({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { groups, users, setSelection, deletePermission, updateGroup } = useStore();
  const [filter, setFilter] = useState<"all" | "error" | "warning" | "info">("all");
  const [scope, setScope] = useState<"all" | "group" | "user">("all");

  const conflicts = useMemo<Conflict[]>(() => {
    const out: Conflict[] = [];
    const issues = validateAll(groups, users);
    for (const i of issues) {
      const owner =
        i.scope === "group" || (i.scope === "perm" && groups.find((g) => g.id === i.ownerId))
          ? groups.find((g) => g.id === i.ownerId)
          : users.find((u) => u.id === i.ownerId);
      if (!owner) continue;
      const ownerType: "group" | "user" =
        "permissions" in owner && "weight" in owner ? "group" : "user";
      const isGroup = ownerType === "group";
      const node = i.permId ? owner.permissions.find((p) => p.id === i.permId)?.node || "?" : "—";
      const kind: Conflict["kind"] = /circular/i.test(i.message)
        ? "circular"
        : /duplicate/i.test(i.message)
          ? "duplicate"
          : /redundant/i.test(i.message)
            ? "wildcard-shadow"
            : /conflict/i.test(i.message)
              ? "deny-vs-allow"
              : "duplicate";
      const permId = i.permId;
      let fix: (() => void) | undefined;
      let fixLabel: string | undefined;
      if (kind === "circular") {
        const g = groups.find((x) => x.id === owner.id);
        if (g && g.parents.length) {
          fix = () => updateGroup(g.id, { parents: [] });
          fixLabel = "Clear parents";
        }
      } else if ((kind === "duplicate" || kind === "wildcard-shadow") && permId) {
        fix = () => deletePermission(ownerType, owner.id, permId);
        fixLabel = "Remove perm";
      } else if (kind === "deny-vs-allow" && permId) {
        fix = () => deletePermission(ownerType, owner.id, permId);
        fixLabel = "Remove deny";
      }
      out.push({
        kind,
        level: i.level,
        ownerType,
        ownerId: owner.id,
        node,
        permId,
        ownerName: isGroup ? (owner as Group).name : (owner as User).username,
        message: i.message,
        trace: [],
        fix,
        fixLabel,
      });
    }

    // Cross-group override detection: same node defined in multiple groups in same chain
    for (const g of groups) {
      const eff = resolveEffectivePermissions(groups, "group", g.id);
      const directNodes = new Set(g.permissions.map((p) => p.node));
      eff.forEach((info, node) => {
        if (directNodes.has(node)) {
          const direct = g.permissions.find((p) => p.node === node)!;
          if (direct.value !== info.value && info.from !== g.name) {
            out.push({
              kind: "override",
              level: "info",
              ownerType: "group",
              ownerId: g.id,
              ownerName: g.name,
              node,
              message: `"${node}" in ${g.name} overrides ${info.from} (${info.value} → ${direct.value})`,
              trace: [info.from, g.name],
            });
          }
        }
      });
    }

    // User wildcard shadowing
    for (const u of users) {
      const merged = new Map<string, { value: boolean; from: string; weight: number }>();
      for (const gid of u.groups) {
        const m = resolveEffectivePermissions(groups, "group", gid);
        m.forEach((v, k) => {
          const cur = merged.get(k);
          if (!cur || v.weight >= cur.weight) merged.set(k, v);
        });
      }
      const wildcards = Array.from(merged.keys()).filter((k) => k.endsWith(".*"));
      for (const p of u.permissions) {
        for (const wc of wildcards) {
          const base = wc.slice(0, -2);
          if (p.node.startsWith(base + ".") && merged.get(wc)?.value === p.value) {
            out.push({
              kind: "wildcard-shadow",
              level: "info",
              ownerType: "user",
              ownerId: u.id,
              ownerName: u.username,
              node: p.node,
              message: `"${p.node}" already covered by inherited wildcard "${wc}" from ${merged.get(wc)?.from}`,
              trace: [merged.get(wc)?.from || "", u.username],
              permId: p.id,
              fix: () => deletePermission("user", u.id, p.id),
              fixLabel: "Remove redundant",
            });
          }
        }
      }
    }

    return out;
  }, [groups, users, updateGroup, deletePermission]);

  const fixAll = () => {
    const fixable = conflicts.filter((c) => c.fix);
    if (!fixable.length) {
      toast.info("Nothing to auto-fix");
      return;
    }
    fixable.forEach((c) => c.fix!());
    toast.success(`Auto-fixed ${fixable.length} issue${fixable.length === 1 ? "" : "s"}`);
  };

  const filtered = conflicts.filter(
    (c) => (filter === "all" || c.level === filter) && (scope === "all" || c.ownerType === scope),
  );

  const counts = {
    error: conflicts.filter((c) => c.level === "error").length,
    warning: conflicts.filter((c) => c.level === "warning").length,
    info: conflicts.filter((c) => c.level === "info").length,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[78vh] bg-panel border-border p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-5 py-3 border-b border-border bg-gradient-to-r from-titlebar via-panel to-titlebar relative">
          <div
            className="absolute inset-0 opacity-50 pointer-events-none"
            style={{ background: "var(--gradient-glint)" }}
          />
          <DialogTitle className="flex items-center gap-2 relative">
            <Bug className="w-4 h-4 text-primary" />
            <span>Conflict Debugger</span>
            <span className="text-[10px] font-mono text-muted-foreground ml-1">
              · {conflicts.length} issue{conflicts.length === 1 ? "" : "s"} detected
            </span>
            <div className="ml-auto flex items-center gap-2 text-xs">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={fixAll}
                disabled={!conflicts.some((c) => c.fix)}
                className="glint flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/15 text-primary border border-primary/40 text-[11px] font-semibold hover:bg-primary/25 disabled:opacity-40 disabled:hover:bg-primary/15 transition"
              >
                <Wand2 className="w-3 h-3" /> Auto-fix all
              </motion.button>
              <Pill
                icon={<ShieldAlert className="w-3 h-3" />}
                label={String(counts.error)}
                color="destructive"
                active={filter === "error"}
                onClick={() => setFilter(filter === "error" ? "all" : "error")}
              />
              <Pill
                icon={<AlertTriangle className="w-3 h-3" />}
                label={String(counts.warning)}
                color="warning"
                active={filter === "warning"}
                onClick={() => setFilter(filter === "warning" ? "all" : "warning")}
              />
              <Pill
                icon={<Sparkles className="w-3 h-3" />}
                label={String(counts.info)}
                color="info"
                active={filter === "info"}
                onClick={() => setFilter(filter === "info" ? "all" : "info")}
              />
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 py-2 border-b border-border flex items-center gap-2 text-xs">
          <Filter className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">Scope:</span>
          {(["all", "group", "user"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`px-2 py-0.5 rounded-md transition ${scope === s ? "bg-primary/15 text-primary border border-primary/40" : "text-muted-foreground hover:text-foreground border border-transparent"}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <AnimatePresence>
            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full grid place-items-center text-center py-12"
              >
                <div>
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-success/15 grid place-items-center glow-green">
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  </div>
                  <div className="text-sm font-semibold text-success">No conflicts found</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Your permission tree is clean and consistent.
                  </div>
                </div>
              </motion.div>
            )}
            {filtered.map((c, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-md border transition group hover:bg-accent/40 ${
                  c.level === "error"
                    ? "border-destructive/30 bg-destructive/5"
                    : c.level === "warning"
                      ? "border-warning/30 bg-warning/5"
                      : "border-info/20 bg-info/5"
                }`}
              >
                <div
                  className={`shrink-0 mt-0.5 w-7 h-7 rounded-md grid place-items-center ${
                    c.level === "error"
                      ? "bg-destructive/15 text-destructive"
                      : c.level === "warning"
                        ? "bg-warning/15 text-warning"
                        : "bg-info/15 text-info"
                  }`}
                >
                  {c.kind === "circular" ? (
                    <GitBranch className="w-3.5 h-3.5" />
                  ) : c.kind === "wildcard-shadow" ? (
                    <Layers className="w-3.5 h-3.5" />
                  ) : c.kind === "override" ? (
                    <ArrowRight className="w-3.5 h-3.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelection({ type: c.ownerType, id: c.ownerId } as any);
                    onOpenChange(false);
                  }}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                      {c.kind.replace("-", " ")}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded bg-muted">
                      {c.ownerType}
                    </span>
                    <span className="text-xs font-medium text-foreground">{c.ownerName}</span>
                    {c.node !== "—" && (
                      <code className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-input/60 text-primary truncate">
                        {c.node}
                      </code>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{c.message}</div>
                  {c.trace.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-muted-foreground/70">
                      {c.trace.map((t, i) => (
                        <span key={i} className="flex items-center gap-1">
                          {i > 0 && <ArrowRight className="w-2.5 h-2.5" />}
                          <span className="px-1.5 py-0.5 rounded bg-muted/50">{t}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </button>
                {c.fix && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      c.fix!();
                      toast.success(c.fixLabel || "Fixed");
                    }}
                    className="glint shrink-0 self-center flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-primary/15 text-primary border border-primary/40 hover:bg-primary/25 transition"
                  >
                    <Zap className="w-3 h-3" /> {c.fixLabel}
                  </motion.button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Pill({ icon, label, color, active, onClick }: any) {
  const colorMap: any = {
    destructive: "text-destructive border-destructive/40 bg-destructive/10",
    warning: "text-warning border-warning/40 bg-warning/10",
    info: "text-info border-info/40 bg-info/10",
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-mono transition ${colorMap[color]} ${active ? "ring-1 ring-current" : "opacity-70 hover:opacity-100"}`}
    >
      {icon}
      {label}
    </button>
  );
}
