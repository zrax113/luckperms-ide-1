import { useEffect } from "react";

type KeyboardModifier = "ctrl" | "shift" | "alt" | "meta";

interface KeyboardShortcut {
  key: string;
  modifiers?: KeyboardModifier[];
  handler: () => void;
  description?: string;
}

/**
 * Hook for handling keyboard shortcuts with proper cleanup and prevention of default behavior
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const modifiersMatch = !shortcut.modifiers?.length
          ? !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
          : shortcut.modifiers.every((mod) => {
              switch (mod) {
                case "ctrl":
                  return event.ctrlKey;
                case "shift":
                  return event.shiftKey;
                case "alt":
                  return event.altKey;
                case "meta":
                  return event.metaKey;
                default:
                  return false;
              }
            });

        if (modifiersMatch && event.key.toLowerCase() === shortcut.key.toLowerCase()) {
          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

export const KEYBOARD_SHORTCUTS = {
  UNDO: { key: "z", modifiers: ["ctrl"] as KeyboardModifier[], description: "Undo" },
  REDO: { key: "y", modifiers: ["ctrl"] as KeyboardModifier[], description: "Redo" },
  SAVE: { key: "s", modifiers: ["ctrl"] as KeyboardModifier[], description: "Save" },
  DELETE: { key: "Delete", description: "Delete selected" },
  SEARCH: { key: "/", description: "Search (focus search)" },
  ESCAPE: { key: "Escape", description: "Close dialog" },
  DUPLICATE: {
    key: "d",
    modifiers: ["ctrl"] as KeyboardModifier[],
    description: "Duplicate selected",
  },
} as const;
