import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

type PromptOpts = {
  title: string;
  placeholder?: string;
  defaultValue?: string;
  submitLabel?: string;
  multiline?: boolean;
};
type Resolver = (value: string | null) => void;
let openHandler: ((opts: PromptOpts) => Promise<string | null>) | null = null;

export function showPrompt(opts: PromptOpts) {
  if (!openHandler) return Promise.resolve(null);
  return openHandler(opts);
}

export function PromptModalRoot() {
  const [opts, setOpts] = useState<any>(null);
  const [value, setValue] = useState("");
  const [resolver, setResolver] = useState<Resolver | null>(null);

  useEffect(() => {
    openHandler = (o) =>
      new Promise((resolve) => {
        setOpts(o);
        setValue(o.defaultValue || "");
        setResolver(() => resolve);
      });
    return () => {
      openHandler = null;
    };
  }, []);

  const close = (v: string | null) => {
    resolver?.(v);
    setOpts(null);
    setResolver(null);
  };

  return (
    <Dialog open={!!opts} onOpenChange={(o) => !o && close(null)}>
      <DialogContent className="max-w-sm bg-popover border-primary/30 glow-green-soft p-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <DialogHeader className="px-5 pt-5 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-4 h-4 text-primary" />
            {opts?.title}
          </DialogTitle>
        </DialogHeader>
        <motion.form
          initial={{ y: 4, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) close(value.trim());
          }}
          className="px-5 pb-5 space-y-3"
        >
          {opts?.multiline ? (
            <textarea
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={opts?.placeholder}
              className="w-full h-28 px-3 py-2 rounded-md bg-input border border-border focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition text-sm font-mono resize-none"
            />
          ) : (
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={opts?.placeholder}
              className="w-full h-10 px-3 rounded-md bg-input border border-border focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition text-sm"
            />
          )}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => close(null)}
              className="px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="glint px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-40 hover:glow-green transition"
            >
              {opts?.submitLabel || "Create"}
            </button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}
