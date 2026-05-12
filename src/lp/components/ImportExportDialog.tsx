import { useState, useRef, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  Download,
  Upload,
  Copy,
  FileJson,
  FileCode,
  FileText,
  Terminal,
  Check,
  AlertTriangle,
  Eye,
  Shield,
  Users as UsersIcon,
} from "lucide-react";
import { useStore } from "../store/store";
import {
  exportJSON,
  exportLuckPermsJSON,
  exportYAML,
  exportCommands,
  detectAndImport,
} from "../store/lpFormat";
import { toast } from "sonner";
import { TEMPLATES } from "../data/templates";

type Format = "vt-json" | "lp-json" | "yaml" | "commands";

const FORMATS: { id: Format; name: string; desc: string; icon: any; ext: string; mime: string }[] =
  [
    {
      id: "vt-json",
      name: "Visual Tree JSON",
      desc: "Save & restore the full project (recommended)",
      icon: FileJson,
      ext: "vt.json",
      mime: "application/json",
    },
    {
      id: "lp-json",
      name: "LuckPerms JSON",
      desc: "Drop into LuckPerms /lp import",
      icon: FileJson,
      ext: "lp.json",
      mime: "application/json",
    },
    {
      id: "yaml",
      name: "YAML",
      desc: "Human-readable config",
      icon: FileCode,
      ext: "yml",
      mime: "text/yaml",
    },
    {
      id: "commands",
      name: "/lp Commands",
      desc: "Paste into your server console",
      icon: Terminal,
      ext: "txt",
      mime: "text/plain",
    },
  ];

export function ImportExportDialog({
  open,
  onOpenChange,
  mode,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  mode: "import" | "export";
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-panel border-border p-0 overflow-hidden">
        <DialogHeader className="px-5 py-3 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            {mode === "export" ? (
              <Download className="w-4 h-4 text-primary" />
            ) : (
              <Upload className="w-4 h-4 text-primary" />
            )}
            {mode === "export" ? "Export configuration" : "Import configuration"}
          </DialogTitle>
        </DialogHeader>
        {mode === "export" ? <ExportPanel /> : <ImportPanel onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function ExportPanel() {
  const { groups, users } = useStore();
  const [format, setFormat] = useState<Format>("vt-json");
  const text = (() => {
    switch (format) {
      case "vt-json":
        return exportJSON(groups, users);
      case "lp-json":
        return exportLuckPermsJSON(groups, users);
      case "yaml":
        return exportYAML(groups, users);
      case "commands":
        return exportCommands(groups, users);
    }
  })();
  const fmt = FORMATS.find((f) => f.id === format)!;

  const download = () => {
    const blob = new Blob([text], { type: fmt.mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `luckperms-export.${fmt.ext}`;
    a.click();
    toast.success("Downloaded", { description: `${a.download}` });
  };
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-4 gap-2 p-4 border-b border-border">
        {FORMATS.map((f) => (
          <motion.button
            key={f.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setFormat(f.id)}
            className={`text-left p-3 rounded-lg border transition glint ${
              format === f.id
                ? "border-primary/60 bg-primary/10 glow-green"
                : "border-border bg-card/40 hover:border-primary/30"
            }`}
          >
            <f.icon
              className={`w-4 h-4 mb-2 ${format === f.id ? "text-primary" : "text-muted-foreground"}`}
            />
            <div className="text-xs font-semibold">{f.name}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{f.desc}</div>
          </motion.button>
        ))}
      </div>
      <div className="px-4 pt-3 pb-2 flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
          preview
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">
          · {text.split("\n").length} lines · {(text.length / 1024).toFixed(1)} KB
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={copy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-border hover:border-primary/40 hover:bg-accent transition"
          >
            <Copy className="w-3 h-3" /> Copy
          </button>
          <button
            onClick={download}
            className="glint flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs bg-primary text-primary-foreground glow-green hover:glow-green-soft transition font-semibold"
          >
            <Download className="w-3 h-3" /> Download
          </button>
        </div>
      </div>
      <pre className="mx-4 mb-4 p-3 max-h-96 overflow-auto text-[11px] font-mono bg-input/40 border border-border rounded-md leading-relaxed">
        {text}
      </pre>
    </div>
  );
}

function ImportPanel({ onClose }: { onClose: () => void }) {
  const { loadData, mergeData } = useStore();
  const [text, setText] = useState("");
  const [mergeMode, setMergeMode] = useState<"replace" | "merge">("merge");
  const fileRef = useRef<HTMLInputElement>(null);

  // Live preview — parses on every keystroke (cheap, all in-memory)
  const preview = useMemo(() => {
    if (!text.trim()) return null;
    try {
      return { ok: true as const, ...detectAndImport(text) };
    } catch (e: any) {
      return { ok: false as const, error: e.message };
    }
  }, [text]);

  const onFile = async (f?: File | null) => {
    if (!f) return;
    setText(await f.text());
    toast.info(`Loaded ${f.name}`);
  };

  const doImport = () => {
    if (!text.trim()) {
      toast.error("Nothing to import");
      return;
    }
    try {
      const result = detectAndImport(text);
      if (mergeMode === "replace") loadData(result.groups, result.users);
      else mergeData(result.groups, result.users);
      toast.success(`Imported as ${result.format}`, {
        description: `${result.groups.length} groups · ${result.users.length} users${result.warnings.length ? ` · ${result.warnings.length} warnings` : ""}`,
      });
      onClose();
    } catch (e: any) {
      toast.error("Import failed", { description: e.message });
    }
  };

  const loadTemplate = (id: string) => {
    const t = TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    if (mergeMode === "replace") loadData(structuredClone(t.groups), structuredClone(t.users));
    else mergeData(structuredClone(t.groups), structuredClone(t.users));
    toast.success(`Loaded template: ${t.name}`);
    onClose();
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mb-2">
          templates
        </div>
        <div className="grid grid-cols-3 gap-2">
          {TEMPLATES.map((t) => (
            <motion.button
              key={t.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => loadTemplate(t.id)}
              className="text-left p-3 rounded-lg border border-border bg-card/40 hover:border-primary/40 hover:bg-primary/5 transition glint"
            >
              <div className="text-xs font-semibold">{t.name}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                {t.description}
              </div>
              <div className="mt-2 text-[10px] font-mono text-primary">
                {t.groups.length} groups →
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
            paste or upload
          </div>
          <div className="flex items-center gap-1 bg-input/40 border border-border rounded-md p-0.5">
            {(["merge", "replace"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMergeMode(m)}
                className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded transition ${
                  mergeMode === m
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onFile(e.dataTransfer.files[0]);
            }}
            className="rounded-lg border-2 border-dashed border-border hover:border-primary/40 transition relative bg-input/20"
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste JSON, YAML, or /lp commands here — or drop a file. Auto-detected on import."
              className="w-full h-56 p-3 bg-transparent text-[11px] font-mono outline-none resize-none placeholder:text-muted-foreground/60"
            />
            <div className="absolute top-2 right-2 flex items-center gap-1.5">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1 px-2 py-1 rounded bg-card/80 border border-border text-[10px] hover:border-primary/40 transition"
              >
                <Upload className="w-2.5 h-2.5" /> File
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".json,.yml,.yaml,.txt"
              hidden
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </div>
          <PreviewPane preview={preview} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        {preview?.ok && (
          <span className="mr-auto text-[10px] font-mono text-muted-foreground">
            <span className="text-primary">●</span> ready to {mergeMode}: {preview.groups.length}{" "}
            groups · {preview.users.length} users
          </span>
        )}
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground transition"
        >
          Cancel
        </button>
        <button
          onClick={doImport}
          disabled={!preview?.ok}
          className="glint flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold glow-green hover:glow-green-soft transition disabled:opacity-40 disabled:pointer-events-none"
        >
          <Check className="w-3 h-3" /> Import
        </button>
      </div>
    </div>
  );
}

function PreviewPane({ preview }: { preview: any }) {
  return (
    <div className="rounded-lg border border-border bg-card/40 overflow-hidden flex flex-col h-56">
      <div className="px-3 py-1.5 border-b border-border/60 flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
        <Eye className="w-3 h-3 text-primary" /> live preview
        {preview?.ok && (
          <span className="ml-auto px-1.5 py-0.5 rounded bg-primary/15 text-primary font-mono normal-case">
            {preview.format}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2 text-[11px]">
        {!preview && (
          <div className="h-full grid place-items-center text-muted-foreground italic">
            Paste data to preview…
          </div>
        )}
        {preview?.ok === false && (
          <div className="flex items-start gap-2 text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Cannot parse</div>
              <div className="text-[10px] opacity-80">{preview.error}</div>
            </div>
          </div>
        )}
        {preview?.ok && (
          <div className="space-y-2">
            {preview.warnings?.length > 0 && (
              <div className="flex items-start gap-1.5 text-warning text-[10px] p-1.5 rounded bg-warning/10 border border-warning/30">
                <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" /> {preview.warnings.join("; ")}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Shield className="w-3 h-3 text-primary" /> Groups · {preview.groups.length}
              </div>
              <div className="flex flex-wrap gap-1">
                {preview.groups.slice(0, 24).map((g: any) => (
                  <motion.span
                    key={g.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary font-mono text-[10px]"
                  >
                    {g.name} <span className="opacity-60">·{g.permissions.length}</span>
                  </motion.span>
                ))}
                {preview.groups.length > 24 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{preview.groups.length - 24} more
                  </span>
                )}
              </div>
            </div>
            {preview.users.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <UsersIcon className="w-3 h-3 text-info" /> Users · {preview.users.length}
                </div>
                <div className="flex flex-wrap gap-1">
                  {preview.users.slice(0, 16).map((u: any) => (
                    <span
                      key={u.id}
                      className="px-1.5 py-0.5 rounded bg-info/10 border border-info/30 text-info font-mono text-[10px]"
                    >
                      {u.username}
                    </span>
                  ))}
                  {preview.users.length > 16 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{preview.users.length - 16}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
