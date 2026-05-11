import { motion } from "framer-motion";
import { Info, Trash2, Clock, Globe } from "lucide-react";
import { useStore } from "../store/store";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

export function Inspector() {
  const { selection, groups, users, updateGroup, updateUser, updatePermission, deletePermission } = useStore();

  let content;
  if (!selection) content = <Empty />;
  else if (selection.type === "group") {
    const g = groups.find(x => x.id === selection.id);
    content = g ? (
      <div className="space-y-4">
        <Block title="Identity">
          <Field label="Name"><Input value={g.name} onChange={(e) => updateGroup(g.id, { name: e.target.value })} /></Field>
          <Field label="Display Name"><Input value={g.displayName || ""} onChange={(e) => updateGroup(g.id, { displayName: e.target.value })} /></Field>
          <Field label="Weight"><Input type="number" value={g.weight} onChange={(e) => updateGroup(g.id, { weight: Number(e.target.value) })} /></Field>
        </Block>
        <Block title="Display">
          <Field label="Prefix"><Input value={g.prefix || ""} onChange={(e) => updateGroup(g.id, { prefix: e.target.value })} placeholder="&6[VIP] " /></Field>
          <Field label="Suffix"><Input value={g.suffix || ""} onChange={(e) => updateGroup(g.id, { suffix: e.target.value })} /></Field>
          <Field label="Color">
            <input type="color" value={g.color || "#94a3b8"} onChange={(e) => updateGroup(g.id, { color: e.target.value })} className="w-full h-9 rounded-md bg-input border border-border cursor-pointer" />
          </Field>
        </Block>
        <Block title="Stats">
          <Stat label="Direct permissions" value={g.permissions.length} />
          <Stat label="Inherits from" value={g.parents.length} />
          <Stat label="Members" value={users.filter(u => u.groups.includes(g.id)).length} />
        </Block>
      </div>
    ) : <Empty />;
  } else if (selection.type === "user") {
    const u = users.find(x => x.id === selection.id);
    content = u ? (
      <div className="space-y-4">
        <Block title="Identity">
          <Field label="Username"><Input value={u.username} onChange={(e) => updateUser(u.id, { username: e.target.value })} /></Field>
          <Field label="UUID"><Input value={u.uuid} onChange={(e) => updateUser(u.id, { uuid: e.target.value })} className="font-mono text-xs" /></Field>
        </Block>
        <Block title="Stats">
          <Stat label="Direct permissions" value={u.permissions.length} />
          <Stat label="Groups" value={u.groups.length} />
        </Block>
      </div>
    ) : <Empty />;
  } else {
    const owner = selection.ownerType === "group" ? groups.find(g => g.id === selection.ownerId) : users.find(u => u.id === selection.ownerId);
    const perm = owner?.permissions.find((p: any) => p.id === selection.permId);
    content = perm ? (
      <div className="space-y-4">
        <Block title="Permission">
          <Field label="Node"><Input value={perm.node} onChange={(e) => updatePermission(selection.ownerType, selection.ownerId, perm.id, { node: e.target.value })} className="font-mono text-xs" /></Field>
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-muted-foreground">Allow</span>
            <Switch checked={perm.value} onCheckedChange={(v) => updatePermission(selection.ownerType, selection.ownerId, perm.id, { value: v })} />
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="w-3 h-3" /> Temporary</span>
            <Switch checked={!!perm.temporary} onCheckedChange={(v) => updatePermission(selection.ownerType, selection.ownerId, perm.id, { temporary: v, expiry: v ? Date.now() + 86400000 : undefined })} />
          </div>
        </Block>
        <Block title="Context">
          <Field label="Server"><Input value={perm.server || ""} onChange={(e) => updatePermission(selection.ownerType, selection.ownerId, perm.id, { server: e.target.value })} placeholder="global" /></Field>
          <Field label="World"><Input value={perm.world || ""} onChange={(e) => updatePermission(selection.ownerType, selection.ownerId, perm.id, { world: e.target.value })} placeholder="any" /></Field>
        </Block>
        <Block title="Metadata">
          <Field label="Plugin"><Input value={perm.plugin || ""} onChange={(e) => updatePermission(selection.ownerType, selection.ownerId, perm.id, { plugin: e.target.value })} /></Field>
          <Field label="Description"><Input value={perm.description || ""} onChange={(e) => updatePermission(selection.ownerType, selection.ownerId, perm.id, { description: e.target.value })} /></Field>
        </Block>
        <button onClick={() => deletePermission(selection.ownerType, selection.ownerId, perm.id)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs hover:bg-destructive/20 transition">
          <Trash2 className="w-3.5 h-3.5" /> Delete permission
        </button>
      </div>
    ) : <Empty />;
  }

  return (
    <aside className="w-80 shrink-0 bg-sidebar-bg border-l border-border flex flex-col">
      <div className="h-9 px-3 border-b border-border flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
        <Info className="w-3.5 h-3.5 text-primary" /> Inspector
      </div>
      <motion.div key={JSON.stringify(selection)} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="flex-1 overflow-y-auto p-3">
        {content}
      </motion.div>
    </aside>
  );
}

const Block = ({ title, children }: any) => (
  <div className="rounded-lg border border-border bg-card/40">
    <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground border-b border-border/60">{title}</div>
    <div className="p-3 space-y-2">{children}</div>
  </div>
);
const Field = ({ label, children }: any) => (
  <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{label}</label><div className="mt-0.5">{children}</div></div>
);
const Stat = ({ label, value }: any) => (
  <div className="flex items-center justify-between py-1 text-xs"><span className="text-muted-foreground">{label}</span><span className="font-mono font-bold text-primary">{value}</span></div>
);
const Empty = () => <div className="text-xs text-muted-foreground italic text-center py-12">Nothing selected</div>;
