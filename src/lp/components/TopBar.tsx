import { motion } from "framer-motion";
import { Undo2, Redo2, Search, Download, Upload, FlaskConical, Package, Settings, Zap, GitBranch, Bug, HelpCircle, PanelLeft, PanelRight } from "lucide-react";
import { useStore } from "../store/store";
import { Button } from "@/components/ui/button";
import { getConfig } from "../config";

type DialogKey = "simulator" | "plugins" | "graph" | "search" | "import" | "export" | "debugger" | "settings" | "tutorial";

export function TopBar({ onOpen, onToggleLeft, onToggleRight }: { onOpen: (k: DialogKey) => void; onToggleLeft: () => void; onToggleRight: () => void }) {
  const { undo, redo, history, future } = useStore();
  const brand = getConfig().brand;
  return (
    <div className="h-11 border-b border-border bg-titlebar/80 glass flex items-center px-2 gap-1 select-none relative z-30">
      <Button variant="ghost" size="icon" onClick={onToggleLeft} title="Toggle explorer" className="h-7 w-7"><PanelLeft className="w-3.5 h-3.5" /></Button>
      <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 mr-1">
        <motion.div whileHover={{ rotate: 12, scale: 1.1 }} className="w-7 h-7 rounded-md grid place-items-center bg-primary/15 border border-primary/30 glow-green relative overflow-hidden">
          <span className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/30 to-transparent translate-x-[-100%] animate-[shine_3s_ease-in-out_infinite]" />
          <Zap className="w-3.5 h-3.5 text-primary relative" />
        </motion.div>
        <div className="leading-tight hidden sm:block max-w-[180px]">
          <div className="text-[13px] font-semibold tracking-tight truncate">{brand.name.split(" ")[0]} <span className="text-primary">{brand.name.split(" ").slice(1).join(" ") || "Studio"}</span></div>
          <div className="text-[9px] text-muted-foreground -mt-0.5 font-mono uppercase tracking-widest truncate">{brand.tagline}</div>
        </div>
      </motion.div>
      <div className="h-5 w-px bg-border mx-1" />
      <Button variant="ghost" size="icon" disabled={!history.length} onClick={undo} title="Undo (⌘Z)" className="h-7 w-7"><Undo2 className="w-3.5 h-3.5" /></Button>
      <Button variant="ghost" size="icon" disabled={!future.length} onClick={redo} title="Redo (⇧⌘Z)" className="h-7 w-7"><Redo2 className="w-3.5 h-3.5" /></Button>
      <div className="h-5 w-px bg-border mx-1" />
      <button onClick={() => onOpen("search")} className="glint flex items-center gap-2 h-7 px-2.5 rounded-md bg-input/60 border border-border text-xs text-muted-foreground flex-1 max-w-72 min-w-0 hover:bg-input hover:border-primary/40 transition">
        <Search className="w-3 h-3 shrink-0" /> <span className="truncate">Search permissions, groups, users…</span> <span className="ml-auto font-mono text-[10px] opacity-60 hidden md:inline">⌘K</span>
      </button>
      <div className="ml-auto flex items-center gap-0.5">
        <NavBtn icon={GitBranch} label="Graph" onClick={() => onOpen("graph")} hideLabelOn="md" />
        <NavBtn icon={FlaskConical} label="Simulator" onClick={() => onOpen("simulator")} hideLabelOn="md" />
        <NavBtn icon={Bug} label="Debugger" onClick={() => onOpen("debugger")} accent />
        <NavBtn icon={Package} label="Plugins" onClick={() => onOpen("plugins")} hideLabelOn="lg" />
        <div className="h-5 w-px bg-border mx-1" />
        <NavBtn icon={Upload} label="Import" onClick={() => onOpen("import")} hideLabelOn="lg" />
        <NavBtn icon={Download} label="Export" onClick={() => onOpen("export")} hideLabelOn="lg" />
        <Button variant="ghost" size="icon" onClick={() => onOpen("tutorial")} title="Tutorial" className="h-7 w-7"><HelpCircle className="w-3.5 h-3.5" /></Button>
        <Button variant="ghost" size="icon" onClick={() => onOpen("settings")} title="Settings" className="h-7 w-7"><Settings className="w-3.5 h-3.5" /></Button>
        <Button variant="ghost" size="icon" onClick={onToggleRight} title="Toggle inspector" className="h-7 w-7"><PanelRight className="w-3.5 h-3.5" /></Button>
      </div>
    </div>
  );
}

function NavBtn({ icon: Icon, label, onClick, accent, hideLabelOn }: any) {
  const labelClass = hideLabelOn === "md" ? "hidden xl:inline" : hideLabelOn === "lg" ? "hidden 2xl:inline" : "";
  return (
    <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }} onClick={onClick}
      title={label}
      className={`glint flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium transition border ${
        accent ? "text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50" :
        "text-muted-foreground border-transparent hover:text-foreground hover:bg-accent/50"
      }`}>
      <Icon className="w-3.5 h-3.5" /> <span className={labelClass}>{label}</span>
    </motion.button>
  );
}
