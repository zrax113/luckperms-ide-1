import { motion } from "framer-motion";
import { Undo2, Redo2, Search, Download, Upload, FlaskConical, Package, Save, Settings, Zap, GitBranch } from "lucide-react";
import { useStore } from "../store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TopBar({ onOpen }: { onOpen: (k: "simulator" | "plugins" | "graph" | "search") => void }) {
  const { undo, redo, history, future, groups, users } = useStore();
  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ groups, users }, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "luckperms-export.json"; a.click();
  };
  const importJson = () => {
    const input = document.createElement("input"); input.type = "file"; input.accept = "application/json,.yml,.yaml";
    input.onchange = async () => {
      const f = input.files?.[0]; if (!f) return;
      const txt = await f.text();
      try { const data = JSON.parse(txt); if (data.groups && data.users) useStore.setState({ groups: data.groups, users: data.users }); } catch {}
    };
    input.click();
  };
  return (
    <div className="h-12 border-b border-border bg-titlebar/80 glass flex items-center px-3 gap-2 select-none relative z-30">
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 mr-3">
        <div className="w-7 h-7 rounded-md gradient-primary grid place-items-center glow-primary">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight gradient-text">LuckPerms</div>
          <div className="text-[10px] text-muted-foreground -mt-0.5 font-mono">Visual Tree Studio</div>
        </div>
      </motion.div>
      <div className="h-6 w-px bg-border mx-1" />
      <Button variant="ghost" size="icon" disabled={!history.length} onClick={undo} title="Undo (⌘Z)"><Undo2 className="w-4 h-4" /></Button>
      <Button variant="ghost" size="icon" disabled={!future.length} onClick={redo} title="Redo (⇧⌘Z)"><Redo2 className="w-4 h-4" /></Button>
      <div className="h-6 w-px bg-border mx-1" />
      <button onClick={() => onOpen("search")} className="glint flex items-center gap-2 h-8 px-3 rounded-md bg-input/60 border border-border text-xs text-muted-foreground w-72 hover:bg-input hover:border-primary/40 transition">
        <Search className="w-3.5 h-3.5" /> Search permissions, groups, users… <span className="ml-auto font-mono text-[10px] opacity-60">⌘K</span>
      </button>
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => onOpen("graph")}><GitBranch className="w-4 h-4 mr-1.5" />Graph</Button>
        <Button variant="ghost" size="sm" onClick={() => onOpen("simulator")}><FlaskConical className="w-4 h-4 mr-1.5" />Simulator</Button>
        <Button variant="ghost" size="sm" onClick={() => onOpen("plugins")}><Package className="w-4 h-4 mr-1.5" />Plugins</Button>
        <div className="h-6 w-px bg-border mx-1" />
        <Button variant="ghost" size="icon" onClick={importJson} title="Import"><Upload className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" onClick={exportJson} title="Export"><Download className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" title="Settings"><Settings className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}
