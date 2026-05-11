import { useMemo, useCallback, useEffect } from "react";
import ReactFlow, {
  Background, Controls, MiniMap, Handle, Position,
  type Node, type Edge, MarkerType, useNodesState, useEdgesState,
  type Connection, addEdge, ReactFlowProvider,
} from "reactflow";
import { motion } from "framer-motion";
import { Crown, Users, Shield, ChevronRight } from "lucide-react";
import { useStore, type Group } from "../store/store";
import { toast } from "sonner";

function GroupNode({ data, selected }: any) {
  const g: Group = data.group;
  const userCount: number = data.userCount;
  const isOwner = g.weight >= 500;
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.04, y: -2 }} transition={{ type: "spring", stiffness: 280, damping: 20 }}
      onClick={data.onSelect}
      className={`relative px-4 py-3 rounded-xl border-2 cursor-pointer min-w-[200px] backdrop-blur-md transition-all ${
        selected ? "border-primary glow-neon-lg animate-neon-pulse" : "border-border hover:border-primary/60"
      }`}
      style={{
        background: `linear-gradient(135deg, ${g.color}25, oklch(0.18 0.03 150 / 0.9))`,
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg grid place-items-center font-bold text-sm relative shrink-0"
          style={{ background: `linear-gradient(135deg, ${g.color}, ${g.color}80)`, boxShadow: `0 0 16px ${g.color}80` }}>
          {isOwner ? <Crown className="w-4 h-4 text-white" /> : <Shield className="w-4 h-4 text-white" />}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm tracking-tight truncate text-white">{g.name}</div>
          <div className="text-[10px] font-mono text-white/60 -mt-0.5">weight {g.weight}</div>
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-3 text-[10px] font-mono">
        <span className="flex items-center gap-1 text-primary"><span className="w-1 h-1 rounded-full bg-primary animate-pulse" />{g.permissions.length} perms</span>
        <span className="flex items-center gap-1 text-info"><Users className="w-2.5 h-2.5" />{userCount}</span>
      </div>
      {g.prefix && <div className="mt-1.5 text-[10px] font-mono text-warning/90 truncate">prefix: {g.prefix}</div>}
      <Handle type="source" position={Position.Bottom} />
    </motion.div>
  );
}

function UserNode({ data, selected }: any) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 320 }}
      onClick={data.onSelect}
      className={`relative px-3 py-2 rounded-full border-2 cursor-pointer backdrop-blur-md flex items-center gap-2 ${
        selected ? "border-info glow-neon" : "border-border hover:border-info/60"
      }`}
      style={{ background: "linear-gradient(135deg, oklch(0.78 0.16 200 / 0.25), oklch(0.18 0.03 150 / 0.9))" }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="w-6 h-6 rounded-full grid place-items-center text-[10px] font-bold text-white"
        style={{ background: "linear-gradient(135deg, oklch(0.78 0.16 200), oklch(0.65 0.18 220))" }}>
        {data.user.username[0]}
      </div>
      <span className="text-xs font-medium text-white">{data.user.username}</span>
    </motion.div>
  );
}

const nodeTypes = { groupNode: GroupNode, userNode: UserNode };

// Tree layout: parents on top, children below — based on weight + depth
function layout(groups: Group[], users: any[], onSelectGroup: (id: string) => void, onSelectUser: (id: string) => void) {
  // Compute depth = longest path from a root (no parents) down
  const depth = new Map<string, number>();
  const computeDepth = (id: string, seen: string[] = []): number => {
    if (depth.has(id)) return depth.get(id)!;
    if (seen.includes(id)) return 0;
    const g = groups.find(x => x.id === id);
    if (!g || g.parents.length === 0) { depth.set(id, 0); return 0; }
    const d = 1 + Math.max(...g.parents.map(p => computeDepth(p, [...seen, id])));
    depth.set(id, d);
    return d;
  };
  groups.forEach(g => computeDepth(g.id));

  // Group by depth
  const byDepth = new Map<number, Group[]>();
  for (const g of groups) {
    const d = depth.get(g.id) || 0;
    if (!byDepth.has(d)) byDepth.set(d, []);
    byDepth.get(d)!.push(g);
  }

  const COL_W = 260;
  const ROW_H = 160;
  const nodes: Node[] = [];

  Array.from(byDepth.entries()).sort((a,b) => a[0]-b[0]).forEach(([d, gs]) => {
    const sorted = [...gs].sort((a, b) => b.weight - a.weight);
    const totalW = sorted.length * COL_W;
    sorted.forEach((g, i) => {
      const userCount = users.filter(u => u.groups.includes(g.id)).length;
      nodes.push({
        id: g.id, type: "groupNode", position: { x: i * COL_W - totalW / 2 + COL_W/2, y: d * ROW_H },
        data: { group: g, userCount, onSelect: () => onSelectGroup(g.id) },
      });
    });
  });

  // Place users below their highest-priority group
  const maxDepth = Math.max(0, ...Array.from(byDepth.keys()));
  const userY = (maxDepth + 1) * ROW_H + 40;
  // bucket users by their primary group
  const buckets = new Map<string, any[]>();
  for (const u of users) {
    const primary = u.groups[0] || "_";
    if (!buckets.has(primary)) buckets.set(primary, []);
    buckets.get(primary)!.push(u);
  }
  buckets.forEach((us, gid) => {
    const parent = nodes.find(n => n.id === gid);
    const baseX = parent ? parent.position.x : 0;
    us.forEach((u, i) => {
      nodes.push({
        id: u.id, type: "userNode",
        position: { x: baseX + (i - (us.length - 1) / 2) * 130, y: userY },
        data: { user: u, onSelect: () => onSelectUser(u.id) },
      });
    });
  });

  const edges: Edge[] = [
    ...groups.flatMap(g => g.parents.map(pid => ({
      id: `${pid}->${g.id}`, source: pid, target: g.id, animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: "oklch(0.85 0.25 145)" },
    }))),
    ...users.flatMap(u => u.groups.map((gid: string) => ({
      id: `${gid}->${u.id}`, source: gid, target: u.id,
      style: { stroke: "oklch(0.78 0.16 200)", strokeWidth: 1.5, strokeDasharray: "4 4" },
      markerEnd: { type: MarkerType.ArrowClosed, color: "oklch(0.78 0.16 200)" },
    }))),
  ];
  return { nodes, edges };
}

function FamilyTreeInner() {
  const { groups, users, selection, setSelection, toggleParent, updateUser } = useStore();

  const onSelectGroup = useCallback((id: string) => setSelection({ type: "group", id }), [setSelection]);
  const onSelectUser = useCallback((id: string) => setSelection({ type: "user", id }), [setSelection]);

  const built = useMemo(() => layout(groups, users, onSelectGroup, onSelectUser), [groups, users, onSelectGroup, onSelectUser]);
  const [nodes, setNodes, onNodesChange] = useNodesState(built.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(built.edges);

  useEffect(() => {
    setNodes(built.nodes);
    setEdges(built.edges);
  }, [built, setNodes, setEdges]);

  // selection sync
  const selectedId = selection?.type === "group" || selection?.type === "user" ? selection.id : undefined;
  const styledNodes = useMemo(() => nodes.map(n => ({ ...n, selected: n.id === selectedId })), [nodes, selectedId]);

  const onConnect = useCallback((c: Connection) => {
    if (!c.source || !c.target) return;
    if (c.source === c.target) { toast.error("Can't connect a node to itself"); return; }
    const targetIsUser = users.some(u => u.id === c.target);
    if (targetIsUser) {
      const u = users.find(x => x.id === c.target);
      if (u) {
        if (u.groups.includes(c.source)) { toast.info(`${u.username} already in group`); return; }
        updateUser(u.id, { groups: [...u.groups, c.source] });
        toast.success(`Added ${u.username} to group`);
      }
      return;
    }
    // group -> group inheritance: source becomes parent of target
    toggleParent(c.target, c.source);
    toast.success("Inheritance link created", { description: "Source is now a parent of the target" });
  }, [toggleParent, updateUser, users]);

  return (
    <div className="absolute inset-0 grid-bg">
      <ReactFlow
        nodes={styledNodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView fitViewOptions={{ padding: 0.2, maxZoom: 1.1 }}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ animated: true }}
      >
        <Background color="oklch(0.85 0.25 145 / 0.15)" gap={32} size={1.5} />
        <Controls className="!bg-panel !border !border-border !rounded-lg overflow-hidden" />
        <MiniMap nodeColor={(n) => n.type === "userNode" ? "oklch(0.78 0.16 200)" : (n.data as any)?.group?.color || "oklch(0.85 0.25 145)"} maskColor="oklch(0.10 0.02 150 / 0.7)" />
      </ReactFlow>
      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-md glass border border-border text-[10px] font-mono text-muted-foreground pointer-events-none">
        <span className="text-primary">⬢</span> drag handles between nodes to inherit · click to inspect
      </div>
    </div>
  );
}

export function FamilyTree() {
  return <ReactFlowProvider><FamilyTreeInner /></ReactFlowProvider>;
}
