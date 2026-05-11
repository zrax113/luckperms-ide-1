import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TopBar } from "@/lp/components/TopBar";
import { Sidebar } from "@/lp/components/Sidebar";
import { TreeEditor } from "@/lp/components/TreeEditor";
import { Inspector } from "@/lp/components/Inspector";
import { SimulatorDialog, PluginsDialog, GraphDialog, SearchDialog } from "@/lp/components/Dialogs";
import { useStore } from "@/lp/store/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LuckPerms Visual Tree — Modern Permission Studio" },
      { name: "description", content: "Visual permission management studio for Minecraft LuckPerms — edit groups, users, inheritance, and plugin permissions without YAML." },
      { property: "og:title", content: "LuckPerms Visual Tree" },
      { property: "og:description", content: "A modern IDE for managing LuckPerms groups, users, and inheritance visually." },
    ],
  }),
  component: Index,
});

function Index() {
  const [dialog, setDialog] = useState<null | "simulator" | "plugins" | "graph" | "search">(null);
  const { undo, redo } = useStore();

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

  return (
    <div className="dark h-screen flex flex-col overflow-hidden bg-background text-foreground">
      <TopBar onOpen={setDialog} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden bg-background relative">
          <TreeEditor />
        </main>
        <Inspector />
      </div>
      <SimulatorDialog open={dialog === "simulator"} onOpenChange={(o: boolean) => setDialog(o ? "simulator" : null)} />
      <PluginsDialog open={dialog === "plugins"} onOpenChange={(o: boolean) => setDialog(o ? "plugins" : null)} />
      <GraphDialog open={dialog === "graph"} onOpenChange={(o: boolean) => setDialog(o ? "graph" : null)} />
      <SearchDialog open={dialog === "search"} onOpenChange={(o: boolean) => setDialog(o ? "search" : null)} />
    </div>
  );
}
