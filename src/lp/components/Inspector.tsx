import { motion } from "framer-motion";
import { useMemo } from "react";
import { Info, Trash2, Clock, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useStore } from "../store/store";
import { validateAll } from "../store/validation";
import { Switch } from "@/components/ui/switch";

export function Inspector() {
  const {
    selection,
    groups,
    users,
    updateGroup,
    updateUser,
    updatePermission,
    deletePermission,
    setSelection,
  } = useStore();
  const issues = useMemo(() => validateAll(groups, users), [groups, users]);

  let content;
  if (!selection) content = <Empty />;
  else if (selection.type === "group") {
    const g = groups.find((x) => x.id === selection.id);
    content = g ? (
      <div className="space-y-3">
        <NameField
          label="Group name"
          value={g.name}
          onChange={(v) => updateGroup(g.id, { name: v })}
        />
        <Block title="Display">
          <Field label="Prefix">
            <LabeledInput
              value={g.prefix || ""}
              onChange={(v) => updateGroup(g.id, { prefix: v })}
              placeholder="&6[VIP] "
              mono
            />
          </Field>
          <Field label="Suffix">
            <LabeledInput
              value={g.suffix || ""}
              onChange={(v) => updateGroup(g.id, { suffix: v })}
              mono
            />
          </Field>
          <Field label="Color">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={g.color || "#94a3b8"}
                onChange={(e) => updateGroup(g.id, { color: e.target.value })}
                className="w-10 h-9 rounded-md bg-input border border-border cursor-pointer"
              />
              <code className="text-xs font-mono text-muted-foreground">{g.color}</code>
            </div>
          </Field>
        </Block>
        <Block title="Hierarchy">
          <Field label={`Weight: ${g.weight}`}>
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={g.weight}
              onChange={(e) => updateGroup(g.id, { weight: Number(e.target.value) })}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[9px] font-mono text-muted-foreground mt-0.5">
              <span>guest</span>
              <span>owner</span>
            </div>
          </Field>
          <Field label="Inherits from">
            <div className="flex flex-wrap gap-1.5">
              {groups
                .filter((x) => x.id !== g.id)
                .map((p) => {
                  const checked = g.parents.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() =>
                        updateGroup(g.id, {
                          parents: checked
                            ? g.parents.filter((x) => x !== p.id)
                            : [...g.parents, p.id],
                        })
                      }
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] border transition ${
                        checked
                          ? "bg-primary/15 border-primary/50 text-primary glow-neon"
                          : "bg-card border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
                      {p.name}
                    </button>
                  );
                })}
            </div>
          </Field>
        </Block>
        <StatsBlock>
          <Stat label="Direct perms" value={g.permissions.length} />
          <Stat label="Inherits" value={g.parents.length} />
          <Stat label="Members" value={users.filter((u) => u.groups.includes(g.id)).length} />
        </StatsBlock>
        <IssuesBlock issues={issues.filter((i) => i.ownerId === g.id)} />
      </div>
    ) : (
      <Empty />
    );
  } else if (selection.type === "user") {
    const u = users.find((x) => x.id === selection.id);
    content = u ? (
      <div className="space-y-3">
        <NameField
          label="Username"
          value={u.username}
          onChange={(v) => updateUser(u.id, { username: v })}
        />
        <Block title="Identity">
          <Field label="UUID">
            <code className="block text-[10px] font-mono text-muted-foreground p-2 bg-input/40 rounded border border-border break-all">
              {u.uuid}
            </code>
          </Field>
        </Block>
        <Block title="Member of">
          <div className="flex flex-wrap gap-1.5">
            {groups.map((g) => {
              const checked = u.groups.includes(g.id);
              return (
                <button
                  key={g.id}
                  onClick={() =>
                    updateUser(u.id, {
                      groups: checked ? u.groups.filter((x) => x !== g.id) : [...u.groups, g.id],
                    })
                  }
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] border transition ${
                    checked
                      ? "bg-primary/15 border-primary/50 text-primary glow-neon"
                      : "bg-card border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: g.color }} />
                  {g.name}
                </button>
              );
            })}
          </div>
        </Block>
        <StatsBlock>
          <Stat label="Direct perms" value={u.permissions.length} />
          <Stat label="Groups" value={u.groups.length} />
        </StatsBlock>
        <IssuesBlock issues={issues.filter((i) => i.ownerId === u.id)} />
      </div>
    ) : (
      <Empty />
    );
  } else {
    const owner =
      selection.ownerType === "group"
        ? groups.find((g) => g.id === selection.ownerId)
        : users.find((u) => u.id === selection.ownerId);
    const perm = owner?.permissions.find((p: any) => p.id === selection.permId);
    content =
      perm && owner ? (
        <div className="space-y-3">
          <Block title="Permission node">
            <code className="block px-2.5 py-2 bg-input/40 rounded-md border border-border text-xs font-mono break-all">
              {perm.node}
            </code>
            {perm.description && (
              <div className="text-[11px] text-muted-foreground mt-2">{perm.description}</div>
            )}
          </Block>
          <Block title="Value">
            <ToggleRow
              label={perm.value ? "Allow" : "Deny"}
              checked={perm.value}
              onChange={(v) =>
                updatePermission(selection.ownerType, selection.ownerId, perm.id, { value: v })
              }
            />
          </Block>
          <Block title="Temporary">
            <ToggleRow
              label="Expires after a while"
              icon={<Clock className="w-3 h-3" />}
              checked={!!perm.temporary}
              onChange={(v) =>
                updatePermission(selection.ownerType, selection.ownerId, perm.id, {
                  temporary: v,
                  expiry: v ? Date.now() + 86400000 * 7 : undefined,
                })
              }
            />
            {perm.temporary && (
              <Field label="Duration">
                <select
                  className="w-full h-8 px-2 text-xs rounded-md bg-input border border-border focus:border-primary outline-none"
                  value={String(perm.expiry || 0)}
                  onChange={(e) =>
                    updatePermission(selection.ownerType, selection.ownerId, perm.id, {
                      expiry: Number(e.target.value),
                    })
                  }
                >
                  {[
                    ["1 hour", 3600e3],
                    ["1 day", 86400e3],
                    ["1 week", 7 * 86400e3],
                    ["30 days", 30 * 86400e3],
                    ["90 days", 90 * 86400e3],
                  ].map(([l, ms]) => (
                    <option key={String(l)} value={Date.now() + Number(ms)}>
                      {l}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </Block>
          <Block title="Context">
            <Field label="Server">
              <select
                value={perm.server || ""}
                onChange={(e) =>
                  updatePermission(selection.ownerType, selection.ownerId, perm.id, {
                    server: e.target.value,
                  })
                }
                className="w-full h-8 px-2 text-xs rounded-md bg-input border border-border focus:border-primary outline-none"
              >
                <option value="">global</option>
                {["survival", "creative", "lobby", "minigames", "pvp"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="World">
              <select
                value={perm.world || ""}
                onChange={(e) =>
                  updatePermission(selection.ownerType, selection.ownerId, perm.id, {
                    world: e.target.value,
                  })
                }
                className="w-full h-8 px-2 text-xs rounded-md bg-input border border-border focus:border-primary outline-none"
              >
                <option value="">any world</option>
                {["world", "world_nether", "world_the_end", "spawn", "resource"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </Block>
          <button
            onClick={() => deletePermission(selection.ownerType, selection.ownerId, perm.id)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs hover:bg-destructive/20 transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove permission
          </button>
        </div>
      ) : (
        <Empty />
      );
  }

  const totalIssues = issues.length;
  return (
    <aside className="w-80 shrink-0 bg-sidebar-bg border-l border-border flex flex-col">
      <div className="h-9 px-3 border-b border-border flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
        <Info className="w-3.5 h-3.5 text-primary" /> Inspector
        <span className="ml-auto flex items-center gap-1">
          {totalIssues > 0 ? (
            <span className="flex items-center gap-1 text-warning normal-case font-mono">
              <AlertTriangle className="w-3 h-3" />
              {totalIssues}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-success normal-case font-mono">
              <CheckCircle2 className="w-3 h-3" />
              clean
            </span>
          )}
        </span>
      </div>
      <motion.div
        key={JSON.stringify(selection)}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="flex-1 overflow-y-auto p-3"
      >
        {content}
      </motion.div>
    </aside>
  );
}

const Block = ({ title, children }: any) => (
  <div className="rounded-lg border border-border bg-card/40 backdrop-blur-sm">
    <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground border-b border-border/60">
      {title}
    </div>
    <div className="p-3 space-y-2.5">{children}</div>
  </div>
);
const Field = ({ label, children }: any) => (
  <div>
    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
      {label}
    </label>
    <div className="mt-1">{children}</div>
  </div>
);
const NameField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-3 glow-neon">
    <div className="text-[10px] uppercase tracking-wider text-primary font-mono">{label}</div>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full mt-1 bg-transparent text-lg font-bold tracking-tight outline-none focus:text-neon transition"
    />
  </div>
);
const LabeledInput = ({
  value,
  onChange,
  placeholder,
  mono,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) => (
  <input
    value={value}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`w-full h-8 px-2 text-xs rounded-md bg-input border border-border focus:border-primary outline-none ${mono ? "font-mono" : ""}`}
  />
);
const ToggleRow = ({
  label,
  checked,
  onChange,
  icon,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-xs flex items-center gap-1.5">
      {icon}
      {label}
    </span>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);
const StatsBlock = ({ children }: any) => <div className="grid grid-cols-3 gap-2">{children}</div>;
const Stat = ({ label, value }: any) => (
  <div className="rounded-md border border-border bg-card/50 p-2 text-center">
    <div className="text-lg font-bold text-primary text-glow">{value}</div>
    <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono">
      {label}
    </div>
  </div>
);
const IssuesBlock = ({ issues }: any) =>
  issues.length > 0 ? (
    <div className="rounded-lg border border-warning/30 bg-warning/5">
      <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-warning border-b border-warning/30 flex items-center gap-1.5">
        <AlertTriangle className="w-3 h-3" /> Issues ({issues.length})
      </div>
      <div className="p-2 space-y-1">
        {issues.map((i: any, idx: number) => (
          <div key={idx} className="text-[11px] px-2 py-1 rounded text-warning/90 bg-warning/5">
            {i.message}
          </div>
        ))}
      </div>
    </div>
  ) : null;
const Empty = () => (
  <div className="text-xs text-muted-foreground italic text-center py-12 flex flex-col items-center gap-3">
    <Shield className="w-10 h-10 opacity-30" />
    Click any node in the tree
  </div>
);
