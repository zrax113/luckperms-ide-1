import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Asterisk,
  Ban,
  Clock,
  Globe,
  Trash2,
  Layers,
  Sparkles,
  AlertTriangle,
  Info,
  ChevronUp,
  ChevronDown,
  X,
  Search,
} from "lucide-react";
import { useStore, resolveEffectivePermissions, type PermissionNode } from "../store/store";
import { validateAll } from "../store/validation";
import { PermissionPicker } from "./PermissionPicker";

function PermRow({ perm, ownerType, ownerId, inherited, fromGroup, issues }: any) {
  const { setSelection, selection, updatePermission, deletePermission } = useStore();
  const isWildcard = perm.node.includes("*");
  const isNegated = perm.node.startsWith("-") || !perm.value;
  const active = selection?.type === "permission" && selection.permId === perm.id;
  const myIssues = issues?.filter((i: any) => i.permId === perm.id) || [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={() =>
        !inherited && setSelection({ type: "permission", ownerType, ownerId, permId: perm.id })
      }
      className={`group flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono cursor-pointer border transition-all ${
        active
          ? "bg-primary/10 border-primary/60 glow-neon"
          : myIssues.length
            ? "border-warning/40 bg-warning/5"
            : "border-transparent hover:bg-accent/40 hover:border-border"
      } ${inherited ? "opacity-60" : ""}`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          !inherited && updatePermission(ownerType, ownerId, perm.id, { value: !perm.value });
        }}
        className={`w-2 h-2 rounded-full shrink-0 transition-all ${perm.value ? "bg-success shadow-[0_0_10px_oklch(0.85_0.25_145)]" : "bg-destructive shadow-[0_0_10px_oklch(0.68_0.24_25)]"}`}
      />
      {isWildcard && <Asterisk className="w-3 h-3 text-warning shrink-0" />}
      {isNegated && !isWildcard && <Ban className="w-3 h-3 text-destructive shrink-0" />}
      <span className={`truncate ${isNegated ? "text-destructive" : ""}`}>{perm.node}</span>
      {perm.plugin && (
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground normal-case font-sans shrink-0">
          {perm.plugin}
        </span>
      )}
      {perm.temporary && <Clock className="w-3 h-3 text-info shrink-0" />}
      {perm.contexts && Object.keys(perm.contexts).length > 0 && (
        <Globe className="w-3 h-3 text-info shrink-0" />
      )}
      {myIssues.length > 0 && (
        <span title={myIssues.map((i: any) => i.message).join("\n")} className="shrink-0">
          <AlertTriangle className="w-3 h-3 text-warning" />
        </span>
      )}
      {inherited && (
        <span className="ml-auto text-[9px] text-muted-foreground italic font-sans shrink-0">
          ↳ {fromGroup}
        </span>
      )}
      {!inherited && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            deletePermission(ownerType, ownerId, perm.id);
          }}
          className="ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition shrink-0"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </motion.div>
  );
}

export function PermissionsPanel({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { selection, groups, users, setSelection, updateUser } = useStore();
  const [filter, setFilter] = useState("");
  const [tab, setTab] = useState<"direct" | "inherited" | "issues">("direct");

  const issues = useMemo(() => validateAll(groups, users), [groups, users]);

  let title = "Select a node in the tree to manage";
  let owner: any = null;
  let ownerType: "group" | "user" = "group";
  let direct: PermissionNode[] = [];
  let inherited: { node: string; value: boolean; from: string }[] = [];
  let parentChips: any[] = [];

  if (selection?.type === "group") {
    owner = groups.find((g) => g.id === selection.id);
    ownerType = "group";
  } else if (selection?.type === "user") {
    owner = users.find((u) => u.id === selection.id);
    ownerType = "user";
  } else if (selection?.type === "permission") {
    if (selection.ownerType === "group") owner = groups.find((g) => g.id === selection.ownerId);
    else owner = users.find((u) => u.id === selection.ownerId);
    ownerType = selection.ownerType;
  }

  if (owner) {
    title = ownerType === "group" ? owner.name : owner.username;
    direct = owner.permissions || [];
    if (ownerType === "group") {
      const eff = resolveEffectivePermissions(groups, "group", owner.id);
      const directSet = new Set(direct.map((p) => p.node));
      inherited = Array.from(eff.entries())
        .filter(([n]) => !directSet.has(n))
        .map(([node, v]) => ({ node, value: v.value, from: v.from }));
      parentChips = owner.parents
        .map((pid: string) => groups.find((g) => g.id === pid))
        .filter(Boolean);
    } else {
      // resolve via groups
      const merged = new Map<string, { value: boolean; from: string; weight: number }>();
      for (const gid of owner.groups) {
        const m = resolveEffectivePermissions(groups, "group", gid);
        m.forEach((v, k) => {
          const cur = merged.get(k);
          if (!cur || v.weight >= cur.weight) merged.set(k, v);
        });
      }
      const directSet = new Set(direct.map((p) => p.node));
      inherited = Array.from(merged.entries())
        .filter(([n]) => !directSet.has(n))
        .map(([node, v]) => ({ node, value: v.value, from: v.from }));
      parentChips = owner.groups
        .map((gid: string) => groups.find((g) => g.id === gid))
        .filter(Boolean);
    }
  }

  const ownerIssues = owner ? issues.filter((i) => i.ownerId === owner.id) : [];
  const errCount = ownerIssues.filter((i) => i.level === "error").length;
  const warnCount = ownerIssues.filter((i) => i.level === "warning").length;

  const filteredDirect = direct.filter(
    (p) => !filter || p.node.toLowerCase().includes(filter.toLowerCase()),
  );
  const filteredInh = inherited.filter(
    (p) => !filter || p.node.toLowerCase().includes(filter.toLowerCase()),
  );

  const existing = new Set(direct.map((p) => p.node));

  if (collapsed) {
    return (
      <div className="border-t border-border bg-titlebar/80 glass">
        <button
          onClick={onToggle}
          className="w-full px-4 py-2 flex items-center gap-3 text-xs hover:bg-accent/30 transition"
        >
          <ChevronUp className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Permissions panel</span>
          {owner && (
            <span className="font-mono text-primary">
              {title} · {direct.length} direct · {inherited.length} inherited
            </span>
          )}
          {errCount > 0 && (
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-destructive/20 text-destructive font-mono">
              {errCount} errors
            </span>
          )}
          {warnCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/20 text-warning font-mono">
              {warnCount} warnings
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: 360 }}
      exit={{ height: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 26 }}
      className="border-t border-border bg-titlebar/90 glass flex flex-col overflow-hidden"
    >
      <div className="px-4 py-2.5 border-b border-border flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold tracking-tight">
          {owner ? title : "No selection"}
        </span>
        {owner && (
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono bg-primary/15 text-primary border border-primary/30">
            {ownerType}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          {owner && (
            <div className="flex bg-input/40 border border-border rounded-md p-0.5 mr-2">
              {(["direct", "inherited", "issues"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded transition ${
                    tab === t
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}{" "}
                  {t === "direct"
                    ? `(${direct.length})`
                    : t === "inherited"
                      ? `(${inherited.length})`
                      : `(${ownerIssues.length})`}
                </button>
              ))}
            </div>
          )}
          {owner && (
            <PermissionPicker ownerType={ownerType} ownerId={owner.id} existing={existing} />
          )}
          <button onClick={onToggle} className="ml-1 p-1 hover:bg-accent rounded">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {owner && parentChips.length > 0 && (
        <div className="px-4 py-2 border-b border-border/50 flex items-center gap-2 flex-wrap">
          <Layers className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
            {ownerType === "group" ? "inherits" : "in groups"}
          </span>
          {parentChips.map((p: any) => (
            <motion.button
              key={p.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelection({ type: "group", id: p.id })}
              className="group flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-card border border-border text-[11px] hover:border-primary/40 transition"
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }}
              />
              {p.name}
              {ownerType === "user" && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    updateUser(owner.id, {
                      groups: owner.groups.filter((g: string) => g !== p.id),
                    });
                  }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </span>
              )}
            </motion.button>
          ))}
        </div>
      )}

      {owner && (
        <div className="px-4 py-1.5 border-b border-border/50 flex items-center gap-2">
          <Search className="w-3 h-3 text-muted-foreground" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter permissions…"
            className="flex-1 h-6 text-xs bg-transparent outline-none placeholder:text-muted-foreground/60"
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3">
        {!owner && (
          <div className="h-full grid place-items-center text-center text-xs text-muted-foreground">
            <div>
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl gradient-primary grid place-items-center glow-neon">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              Click any node in the family tree above to manage its permissions
            </div>
          </div>
        )}
        {owner && tab === "direct" && (
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {filteredDirect.length === 0 && (
                <div className="text-center text-xs text-muted-foreground py-6">
                  No direct permissions yet — click{" "}
                  <span className="text-primary font-semibold">+ Add permission</span> above
                </div>
              )}
              {filteredDirect.map((p) => (
                <PermRow
                  key={p.id}
                  perm={p}
                  ownerType={ownerType}
                  ownerId={owner.id}
                  issues={ownerIssues}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
        {owner && tab === "inherited" && (
          <div className="space-y-1">
            {filteredInh.length === 0 && (
              <div className="text-center text-xs text-muted-foreground py-6">
                No inherited permissions
              </div>
            )}
            {filteredInh.map((p) => (
              <PermRow
                key={p.node}
                perm={{ id: p.node, node: p.node, value: p.value }}
                ownerType={ownerType}
                ownerId={owner.id}
                inherited
                fromGroup={p.from}
              />
            ))}
          </div>
        )}
        {owner && tab === "issues" && (
          <div className="space-y-1.5">
            {ownerIssues.length === 0 && (
              <div className="text-center text-xs text-success py-6 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-success/15 grid place-items-center">
                  <Sparkles className="w-5 h-5 text-success" />
                </div>
                All clean — no issues detected
              </div>
            )}
            {ownerIssues.map((i, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-start gap-2 px-3 py-2 rounded-md text-xs border ${
                  i.level === "error"
                    ? "bg-destructive/10 border-destructive/30 text-destructive"
                    : i.level === "warning"
                      ? "bg-warning/10 border-warning/30 text-warning"
                      : "bg-info/10 border-info/30 text-info"
                }`}
              >
                {i.level === "error" ? (
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                ) : i.level === "warning" ? (
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                )}
                <span>{i.message}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
