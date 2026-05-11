import { motion } from "framer-motion";
import { Undo2, Redo2, Search, Download, Upload, FlaskConical, Package, Settings, Zap, GitBranch, Bug } from "lucide-react";
import { useStore } from "../store/store";
import { Button } from "@/components/ui/button";

export function TopBar({ onOpen }: { onOpen: (k: "simulator" | "plugins" | "graph" | "search" | "import" | "export" | "debugger") => void }) {
  const { undo, redo, history, future } = useStore();
  return (
    <div className="h-11 border-b border-border bg-titlebar/80 glass flex items-center px-2.5 gap-1.5 select-none relative z-30">
      <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 mr-2">
        <div className="w-7 h-7 rounded-md grid place-items-center bg-primary/15 border border-primary/30 glow-green">
          <Zap className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-semibold tracking-tight">LuckPerms <span className="text-primary">Visual Tree</span></div>
          <div className="text-[9px] text-muted-foreground -mt-0.5 font-mono uppercase tracking-widest">studio · 1.0</div>
        </div>
      </motion.div>
      <div className="h-5 w-px bg-border mx-1" />
      <Button variant="ghost" size="icon" disabled={!history.length} onClick={undo} title="Undo (⌘Z)" className="h-7 w-7"><Undo2 className="w-3.5 h-3.5" /></Button>
      <Button variant="ghost" size="icon" disabled={!future.length} onClick={redo} title="Redo (⇧⌘Z)" className="h-7 w-7"><Redo2 className="w-3.5 h-3.5" /></Button>
      <div className="h-5 w-px bg-border mx-1" />
      <button onClick={() => onOpen("search")} className="glint flex items-center gap-2 h-7 px-2.5 rounded-md bg-input/60 border border-border text-xs text-muted-foreground w-72 hover:bg-input hover:border-primary/40 transition">
        <Search className="w-3 h-3" /> <span>Search permissions, groups, users…</span> <span className="ml-auto font-mono text-[10px] opacity-60">⌘K</span>
      </button>
      <div className="ml-auto flex items-center gap-0.5">
        <NavBtn icon={GitBranch} label="Graph" onClick={() => onOpen("graph")} />
        <NavBtn icon={FlaskConical} label="Simulator" onClick={() => onOpen("simulator")} />
        <NavBtn icon={Bug} label="Debugger" onClick={() => onOpen("debugger")} accent />
        <NavBtn icon={Package} label="Plugins" onClick={() => onOpen("plugins")} />
        <div className="h-5 w-px bg-border mx-1" />
        <NavBtn icon={Upload} label="Import" onClick={() => onOpen("import")} />
        <NavBtn icon={Download} label="Export" onClick={() => onOpen("export")} />
        <Button variant="ghost" size="icon" title="Settings" className="h-7 w-7"><Settings className="w-3.5 h-3.5" /></Button>
      </div>
    </div>
  );
}

function NavBtn({ icon: Icon, label, onClick, accent }: any) {
  return (
    <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }} onClick={onClick}
      className={`glint flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium transition border ${
        accent ? "text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50" :
        "text-muted-foreground border-transparent hover:text-foreground hover:bg-accent/50"
      }`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </motion.button>
  );
}
