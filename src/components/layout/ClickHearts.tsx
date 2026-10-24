import { useEffect } from "react";

const HEARTS = ["💗", "💖", "💕", "🌸", "✨"];

// Pops a small floating heart wherever the visitor clicks.
export function ClickHearts() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const spawn = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;

      const heart = document.createElement("span");
      heart.className = "click-heart";
      heart.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
      heart.style.left = `${event.clientX}px`;
      heart.style.top = `${event.clientY}px`;
      heart.style.setProperty("--drift", `${Math.round((Math.random() - 0.5) * 60)}px`);
      document.body.appendChild(heart);
      heart.addEventListener("animationend", () => heart.remove());
    };

    document.addEventListener("pointerdown", spawn);
    return () => document.removeEventListener("pointerdown", spawn);
  }, []);

  return null;
}
