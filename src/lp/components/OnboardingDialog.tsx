import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  GitBranch,
  FlaskConical,
  Bug,
  Download,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";

const STEPS = [
  {
    icon: Sparkles,
    title: "Welcome to your permission studio",
    body: "A modern, no-code visual IDE for managing LuckPerms. Drag, click, and drop — never type a /lp command again.",
    accent: "var(--primary)",
  },
  {
    icon: GitBranch,
    title: "Build your hierarchy as a family tree",
    body: "Drag handles between groups to create inheritance. Higher weight = higher priority. Drop users onto groups to assign them.",
    accent: "var(--primary)",
  },
  {
    icon: Sparkles,
    title: "Add permissions with one click",
    body: "Open the bottom panel, hit Add permission, and pick from any plugin's catalog — or import an entire plugin's perms in bulk from the sidebar.",
    accent: "var(--info)",
  },
  {
    icon: FlaskConical,
    title: "Simulate before you ship",
    body: "Use the Simulator to test if a user has a permission in any world. The Conflict Debugger detects circular inheritance, conflicts, and shadowed wildcards — and fixes them in one click.",
    accent: "var(--warning)",
  },
  {
    icon: Download,
    title: "Export to LuckPerms",
    body: "Export as LuckPerms JSON, YAML, or /lp commands you can paste straight into your console. Your work auto-saves locally.",
    accent: "var(--primary)",
  },
];

export function OnboardingDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [step, setStep] = useState(0);
  const cur = STEPS[step];
  const Icon = cur.icon;
  const last = step === STEPS.length - 1;
  const next = () => (last ? finish() : setStep(step + 1));
  const finish = () => {
    localStorage.setItem("lpvt-onboarded", "1");
    onOpenChange(false);
    setStep(0);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) finish();
        else onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-panel border-primary/40 glow-green-soft">
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, var(--primary)/15%, transparent 70%)",
          }}
        />
        <div className="relative px-6 pt-7 pb-4 min-h-[320px] flex flex-col">
          <div className="flex items-center gap-1.5 mb-5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${i === step ? "w-8 bg-primary glow-green" : i < step ? "w-4 bg-primary/60" : "w-4 bg-border"}`}
              />
            ))}
            <span className="ml-auto text-[10px] font-mono text-muted-foreground">
              {step + 1} / {STEPS.length}
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex-1"
            >
              <motion.div
                initial={{ scale: 0.6, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 240 }}
                className="w-14 h-14 rounded-2xl grid place-items-center mb-4 glow-green animate-soft-pulse"
                style={{
                  background: `linear-gradient(135deg, ${cur.accent}, transparent)`,
                  border: `1px solid ${cur.accent}`,
                }}
              >
                <Icon className="w-7 h-7 text-foreground" />
              </motion.div>
              <h2 className="text-xl font-bold tracking-tight mb-2 gradient-text">{cur.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{cur.body}</p>
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border/60">
            <button
              onClick={finish}
              className="text-xs text-muted-foreground hover:text-foreground transition"
            >
              Skip tour
            </button>
            <div className="ml-auto flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs border border-border hover:bg-accent/50 transition"
                >
                  <ChevronLeft className="w-3 h-3" /> Back
                </button>
              )}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={next}
                className="glint flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold glow-green hover:glow-green-soft transition"
              >
                {last ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Get started
                  </>
                ) : (
                  <>
                    Next <ChevronRight className="w-3 h-3" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
