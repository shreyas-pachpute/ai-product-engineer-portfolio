"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type CommandPaletteContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(
  null,
);

/**
 * Open/close state lives here rather than inside `CommandPalette` because
 * two separate things need to drive it: the global ⌘K/Ctrl+K shortcut, and
 * the navbar's visible trigger button (without which the feature is
 * invisible to anyone who doesn't already know the shortcut exists).
 */
export function useCommandPalette(): CommandPaletteContextValue {
  const context = use(CommandPaletteContext);
  if (!context) {
    throw new Error(
      "useCommandPalette must be used within <CommandPaletteProvider>",
    );
  }
  return context;
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      // metaKey covers macOS ⌘; ctrlKey covers Windows/Linux. Browsers bind
      // Ctrl+K to the address bar on some platforms, hence preventDefault.
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setIsOpen((current) => !current);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return (
    <CommandPaletteContext value={value}>{children}</CommandPaletteContext>
  );
}
