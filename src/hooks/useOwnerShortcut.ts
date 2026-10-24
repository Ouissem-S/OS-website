import { useEffect, useRef } from "react";
import { isOwner, logoutOwner, requestOwnerAccess } from "../lib/auth";

const SECRET = "owner";
const TAPS_NEEDED = 5;
const TAP_WINDOW_MS = 2000;

function toggleOwnerMode() {
  if (isOwner()) {
    if (window.confirm("Log out of owner mode?")) logoutOwner();
  } else {
    requestOwnerAccess();
  }
}

// Hidden ways into owner mode, instead of a visible button:
// type "owner" anywhere outside a text field, or tap the footer 5 times quickly (for phones).
export function useOwnerShortcut() {
  const typed = useRef("");
  const taps = useRef<number[]>([]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.key.length !== 1) return;

      typed.current = (typed.current + event.key.toLowerCase()).slice(-SECRET.length);
      if (typed.current === SECRET) {
        typed.current = "";
        toggleOwnerMode();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Attach to the footer's onClick.
  return () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((time) => now - time < TAP_WINDOW_MS), now];
    if (taps.current.length >= TAPS_NEEDED) {
      taps.current = [];
      toggleOwnerMode();
    }
  };
}
