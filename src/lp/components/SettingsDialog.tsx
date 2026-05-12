import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  Settings,
  Palette,
  RotateCcw,
  Sparkles,
  Layers,
  Trash2,
  FileJson,
  Plus,
  Wand2,
  Eye,
} from "lucide-react";
import { getConfig, updateConfig } from "../config";
import { useStore } from "../store/store";
import { toast } from "sonner";
import { showPrompt } from "./PromptModal";
import { Switch } from "@/components/ui/switch";

const SWATCHES = ["#22e08c", "#22d3ee", "#a855f7", "#f59e0b", "#ef4444", "#ec4899", "#3b82f6"];

export function SettingsDialog({
  open,
  onOpenChange,
  onTutorial,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onTutorial: () => void;
}) {
  const cfg = getConfig();
  const [brandName, setBrandName] = useState(cfg.brand.name);
  const [accent, setAccent] = useState(cfg.brand.accent);
  const [autocomplete, setAutocomplete] = useState(cfg.ui.permissionAutocomplete);
  const [bgAnim, setBgAnim] = useState(cfg.ui.backgroundAnim);
  const { reset, loadDemoData } = useStore();

  useEffect(() => {
    if (open) {
      setBrandName(cfg.brand.name);
      setAccent(cfg.brand.accent);
      setAutocomplete(cfg.ui.permissionAutocomplete);
      setBgAnim(cfg.ui.backgroundAnim);
    }
  }, [open]);

  const save = () => {
    updateConfig({
      brand: { ...cfg.brand, name: brandName, accent },
      ui: { ...cfg.ui, permissionAutocomplete: autocomplete, backgroundAnim: bgAnim },
    });
    toast.success("Settings saved");
    setTimeout(() => onOpenChange(false), 300);
  };

  const addPlugin = async () => {
    const name = await showPrompt({
      title: "Plugin name",
      placeholder: "MyPlugin",
      submitLabel: "Next",
    });
    if (!name) return;
    const perms = await showPrompt({
      title: `Permissions for ${name}`,
      placeholder: "myplugin.use, myplugin.admin",
      submitLabel: "Add",
      multiline: true,
    });
    if (!perms) return;
    const list = perms
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const extra = {
      plugin: name,
      color: accent,
      version: "custom",
      categories: [
        {
          name: "Custom",
          permissions: list.map((node) => ({
            node,
            default: "op" as const,
            wildcard: node.endsWith(".*"),
          })),
        },
      ],
    };
    updateConfig({ extraPlugins: [...(cfg.extraPlugins || []), extra as any] });
    toast.success(`Added plugin "${name}" with ${list.length} perms`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-panel border-border p-0 overflow-hidden">
        <DialogHeader className="px-5 py-3 border-b border-border bg-gradient-to-r from-titlebar to-panel relative">
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{ background: "var(--gradient-glint)" }}
          />
          <DialogTitle className="flex items-center gap-2 relative">
            <Settings className="w-4 h-4 text-primary" /> Settings
          </DialogTitle>
        </DialogHeader>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <Section title="Branding" icon={<Palette className="w-3.5 h-3.5" />}>
            <Field label="Brand name">
              <input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full h-9 px-2.5 text-sm rounded-md bg-input border border-border focus:border-primary outline-none"
              />
            </Field>
            <Field label="Accent color">
              <div className="flex items-center gap-2 flex-wrap">
                {SWATCHES.map((c) => (
                  <motion.button
                    key={c}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setAccent(c)}
                    className={`w-7 h-7 rounded-md border-2 transition ${accent === c ? "border-foreground scale-110" : "border-transparent"}`}
                    style={{ background: c, boxShadow: `0 0 12px ${c}80` }}
                  />
                ))}
                <input
                  type="color"
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                  className="w-7 h-7 rounded-md border border-border bg-input cursor-pointer"
                />
                <code className="text-xs font-mono text-muted-foreground">{accent}</code>
              </div>
            </Field>
            <button
              onClick={save}
              className="glint w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-semibold glow-green hover:glow-green-soft transition"
            >
              Save branding
            </button>
          </Section>

          <Section title="Editor" icon={<Wand2 className="w-3.5 h-3.5" />}>
            <ToggleRow
              label="Permission autocomplete"
              hint="Suggest matching nodes when typing custom permissions"
              checked={autocomplete}
              onChange={setAutocomplete}
              icon={<Sparkles className="w-3 h-3" />}
            />
            <ToggleRow
              label="Animated background"
              hint="Subtle gradient + grid drift behind the workspace"
              checked={bgAnim}
              onChange={setBgAnim}
              icon={<Eye className="w-3 h-3" />}
            />
            <button
              onClick={save}
              className="glint w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-semibold glow-green hover:glow-green-soft transition"
            >
              Save preferences
            </button>
          </Section>

          <Section title="Custom plugins" icon={<Layers className="w-3.5 h-3.5" />}>
            <div className="space-y-1.5">
              {(cfg.extraPlugins || []).map((p) => (
                <div
                  key={p.plugin}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-card border border-border"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }}
                  />
                  <span className="text-xs">{p.plugin}</span>
                  <span className="ml-auto text-[10px] font-mono text-muted-foreground">
                    {p.categories.reduce((s, c) => s + c.permissions.length, 0)} perms
                  </span>
                </div>
              ))}
              {!(cfg.extraPlugins || []).length && (
                <div className="text-[11px] text-muted-foreground italic">
                  No custom plugins yet
                </div>
              )}
              <button
                onClick={addPlugin}
                className="glint w-full h-8 flex items-center justify-center gap-1.5 rounded-md border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-xs text-muted-foreground hover:text-primary transition"
              >
                <Plus className="w-3 h-3" /> Add custom plugin
              </button>
            </div>
          </Section>

          <Section title="Help" icon={<Sparkles className="w-3.5 h-3.5" />}>
            <button
              onClick={() => {
                onOpenChange(false);
                onTutorial();
              }}
              className="glint w-full h-9 flex items-center justify-center gap-2 rounded-md border border-primary/40 bg-primary/5 hover:bg-primary/10 text-sm transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Replay onboarding tutorial
            </button>
          </Section>

          <Section title="Danger zone" icon={<Trash2 className="w-3.5 h-3.5" />}>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  loadDemoData();
                  toast.success("Demo data restored");
                }}
                className="flex-1 h-9 rounded-md border border-border hover:border-info/40 hover:bg-info/5 text-xs transition flex items-center justify-center gap-1.5"
              >
                <FileJson className="w-3 h-3" /> Restore demo
              </button>
              <button
                onClick={() => {
                  toast.warning("Wipe all groups, users & tracks?", {
                    description: "This cannot be undone.",
                    action: {
                      label: "Reset",
                      onClick: () => {
                        reset();
                        toast.success("Workspace reset");
                      },
                    },
                  });
                }}
                className="flex-1 h-9 rounded-md border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3 h-3" /> Reset all
              </button>
            </div>
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const Section = ({ title, icon, children }: any) => (
  <div className="rounded-lg border border-border bg-card/40">
    <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground border-b border-border/60 flex items-center gap-1.5">
      {icon} {title}
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
const ToggleRow = ({ label, hint, checked, onChange, icon }: any) => (
  <div className="flex items-center gap-2 py-1">
    <div className="flex-1">
      <div className="text-xs font-medium flex items-center gap-1.5">
        {icon} {label}
      </div>
      {hint && <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);
