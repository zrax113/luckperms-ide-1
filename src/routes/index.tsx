import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/lp/components/TopBar";
import { Sidebar } from "@/lp/components/Sidebar";
import { FamilyTree } from "@/lp/components/FamilyTree";
import { PermissionsPanel } from "@/lp/components/PermissionsPanel";
import { Inspector } from "@/lp/components/Inspector";
import { SimulatorDialog, PluginsDialog, GraphDialog, SearchDialog } from "@/lp/components/Dialogs";
import { ConflictDebugger } from "@/lp/components/ConflictDebugger";
import { ImportExportDialog } from "@/lp/components/ImportExportDialog";
import { PromptModalRoot } from "@/lp/components/PromptModal";
import { SettingsDialog } from "@/lp/components/SettingsDialog";
import { OnboardingDialog } from "@/lp/components/OnboardingDialog";
import { Toaster } from "@/components/ui/sonner";
import { useStore } from "@/lp/store/store";
import { validateAll } from "@/lp/store/validation";
import { loadConfig, onConfigChange, getConfig } from "@/lp/config";
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, Database, GitBranch, Shield, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LuckPerms Visual Tree — Family-Tree Permission Studio" },
      { name: "description", content: "Drag-and-drop visual permission management for Minecraft LuckPerms — edit groups, users, inheritance, and plugin permissions in a modern family tree." },
      { property: "og:title", content: "LuckPerms Visual Tree" },
      { property: "og:description", content: "A modern family-tree IDE for managing LuckPerms groups, users, and inheritance visually." },
    ],
  }),
  component: Index,
});

type DialogKey = null | "simulator" | "plugins" | "graph" | "search" | "import" | "export" | "debugger" | "settings" | "tutorial";

function Index() {
  const [dialog, setDialog] = useState<DialogKey>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [, force] = useState(0);
  const { undo, redo, groups, users } = useStore();
  const issues = useMemo(() => validateAll(groups, users), [groups, users]);
  const errors = issues.filter(i => i.level === "error").length;
  const warnings = issues.filter(i => i.level === "warning").length;

  useEffect(() => {
    loadConfig().then(() => {
      force(x => x + 1);
      const cfg = getConfig();
      if (cfg.ui.showOnboarding && !localStorage.getItem("lpvt-onboarded")) {
        setTimeout(() => setDialog("tutorial"), 600);
      }
    });
    return onConfigChange(() => force(x => x + 1));
  }, []);

  // Auto-collapse on mobile
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 768) { setLeftOpen(false); setRightOpen(false); }
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === "k") { e.preventDefault(); setDialog("search"); }
      else if (meta && e.shiftKey && e.key.toLowerCase() === "z") { e.preventDefault(); redo(); }
      else if (meta && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); }
      else if (meta && e.key.toLowerCase() === "b") { e.preventDefault(); setLeftOpen(o => !o); }
      else if (meta && e.key.toLowerCase() === "/") { e.preventDefault(); setRightOpen(o => !o); }
      else if (e.key === "Escape") setDialog(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const close = () => setDialog(null);
  const open = (k: DialogKey) => setDialog(k);

  return (
    <div className="dark h-screen flex flex-col overflow-hidden bg-background text-foreground">
      {getConfig().ui.backgroundAnim && <div className="bg-anim" aria-hidden />}
      <TopBar onOpen={open} onToggleLeft={() => setLeftOpen(o => !o)} onToggleRight={() => setRightOpen(o => !o)} />
      <div className="flex-1 overflow-hidden">
        <PanelGroup orientation="horizontal" id="lpvt-h-layout">
          {leftOpen && (
            <>
              <Panel id="left" defaultSize={16} minSize={10} maxSize={30}>
                <Sidebar onOpenDialog={(k) => setDialog(k)} />
              </Panel>
              <ResizeBar />
            </>
          )}
          <Panel id="main" minSize={30}>
            <PanelGroup orientation="vertical" id="lpvt-v-layout">
              <Panel id="tree" defaultSize={panelOpen ? 62 : 96} minSize={20}>
                <main className="h-full flex flex-col overflow-hidden bg-background relative">
                  <div className="flex-1 relative">
                    <FamilyTree />
                  </div>
                </main>
              </Panel>
              {panelOpen && <ResizeBar vertical />}
              <Panel id="bottom" defaultSize={panelOpen ? 38 : 4} minSize={4} maxSize={70}>
                <PermissionsPanel collapsed={!panelOpen} onToggle={() => setPanelOpen(o => !o)} />
              </Panel>
            </PanelGroup>
          </Panel>
          {rightOpen && (
            <>
              <ResizeBar />
              <Panel id="right" defaultSize={20} minSize={14} maxSize={36}>
                <Inspector />
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
      <div className="h-6 border-t border-border bg-titlebar/90 glass flex items-center px-3 gap-4 text-[10px] font-mono text-muted-foreground select-none">
        <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-primary" />{groups.length} groups</span>
        <span className="flex items-center gap-1.5"><Users className="w-3 h-3 text-info" />{users.length} users</span>
        <span className="hidden sm:flex items-center gap-1.5"><GitBranch className="w-3 h-3 text-warning" />{groups.reduce((s, g) => s + g.parents.length, 0)} links</span>
        <span className="hidden md:flex items-center gap-1.5"><Database className="w-3 h-3 text-info" />{groups.reduce((s, g) => s + g.permissions.length, 0) + users.reduce((s, u) => s + u.permissions.length, 0)} perms</span>
        <span className="ml-auto flex items-center gap-3">
          {errors > 0 && <button onClick={() => setDialog("debugger")} className="flex items-center gap-1 text-destructive hover:underline"><AlertTriangle className="w-3 h-3" /> {errors} errors</button>}
          {warnings > 0 && <button onClick={() => setDialog("debugger")} className="flex items-center gap-1 text-warning hover:underline"><AlertTriangle className="w-3 h-3" /> {warnings} warnings</button>}
          {errors === 0 && warnings === 0 && <span className="flex items-center gap-1 text-success"><CheckCircle2 className="w-3 h-3" /> all clean</span>}
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> auto-saved · v1.0</span>
        </span>
      </div>

      <SimulatorDialog open={dialog === "simulator"} onOpenChange={(o: boolean) => o ? setDialog("simulator") : close()} />
      <PluginsDialog open={dialog === "plugins"} onOpenChange={(o: boolean) => o ? setDialog("plugins") : close()} />
      <GraphDialog open={dialog === "graph"} onOpenChange={(o: boolean) => o ? setDialog("graph") : close()} />
      <SearchDialog open={dialog === "search"} onOpenChange={(o: boolean) => o ? setDialog("search") : close()} />
      <ConflictDebugger open={dialog === "debugger"} onOpenChange={(o: boolean) => o ? setDialog("debugger") : close()} />
      <ImportExportDialog open={dialog === "import" || dialog === "export"} onOpenChange={(o: boolean) => !o && close()} mode={dialog === "export" ? "export" : "import"} />
      <SettingsDialog open={dialog === "settings"} onOpenChange={(o: boolean) => o ? setDialog("settings") : close()} onTutorial={() => setDialog("tutorial")} />
      <OnboardingDialog open={dialog === "tutorial"} onOpenChange={(o: boolean) => o ? setDialog("tutorial") : close()} />
      <PromptModalRoot />
      <Toaster theme="dark" position="bottom-right" richColors closeButton />
    </div>
  );
}

function ResizeBar({ vertical }: { vertical?: boolean } = {}) {
  return (
    <PanelResizeHandle className={`group relative ${vertical ? "h-1 w-full" : "w-1 h-full"} bg-border hover:bg-primary/50 transition-colors data-[resize-handle-active]:bg-primary`}>
      <div className={`absolute inset-0 ${vertical ? "h-3 -translate-y-1" : "w-3 -translate-x-1"} group-hover:bg-primary/10`} />
    </PanelResizeHandle>
  );
}
