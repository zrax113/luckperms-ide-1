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
import { Toaster } from "@/components/ui/sonner";
import { useStore } from "@/lp/store/store";
import { validateAll } from "@/lp/store/validation";
import { AlertTriangle, CheckCircle2, Database, GitBranch, Shield, Users } from "lucide-react";

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

type DialogKey = null | "simulator" | "plugins" | "graph" | "search" | "import" | "export" | "debugger";

function Index() {
  const [dialog, setDialog] = useState<DialogKey>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const { undo, redo, groups, users } = useStore();
  const issues = useMemo(() => validateAll(groups, users), [groups, users]);
  const errors = issues.filter(i => i.level === "error").length;
  const warnings = issues.filter(i => i.level === "warning").length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === "k") { e.preventDefault(); setDialog("search"); }
      else if (meta && e.shiftKey && e.key.toLowerCase() === "z") { e.preventDefault(); redo(); }
      else if (meta && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); }
      else if (e.key === "Escape") setDialog(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const close = () => setDialog(null);

  return (
    <div className="dark h-screen flex flex-col overflow-hidden bg-background text-foreground">
      <TopBar onOpen={setDialog} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onOpenDialog={(k) => setDialog(k)} />
        <main className="flex-1 flex flex-col overflow-hidden bg-background relative">
          <div className="flex-1 relative">
            <FamilyTree />
          </div>
          <PermissionsPanel collapsed={!panelOpen} onToggle={() => setPanelOpen(o => !o)} />
        </main>
        <Inspector />
      </div>
      <div className="h-6 border-t border-border bg-titlebar/90 glass flex items-center px-3 gap-4 text-[10px] font-mono text-muted-foreground select-none">
        <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-primary" />{groups.length} groups</span>
        <span className="flex items-center gap-1.5"><Users className="w-3 h-3 text-info" />{users.length} users</span>
        <span className="flex items-center gap-1.5"><GitBranch className="w-3 h-3 text-warning" />{groups.reduce((s, g) => s + g.parents.length, 0)} inheritance links</span>
        <span className="flex items-center gap-1.5"><Database className="w-3 h-3 text-info" />{groups.reduce((s, g) => s + g.permissions.length, 0) + users.reduce((s, u) => s + u.permissions.length, 0)} perms</span>
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
      <PromptModalRoot />
      <Toaster theme="dark" position="bottom-right" richColors closeButton />
    </div>
  );
}
