import { useEffect, useState } from "react";

// Types each phrase out, pauses, deletes it, then moves on to the next one.
export function useTypewriter(phrases: string[], { typeMs = 70, deleteMs = 35, holdMs = 1600 } = {}) {
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLength(phrases[index].length);
      const id = window.setTimeout(() => setIndex((i) => (i + 1) % phrases.length), holdMs * 2);
      return () => window.clearTimeout(id);
    }

    const phrase = phrases[index];
    let delay = deleting ? deleteMs : typeMs;
    if (!deleting && length === phrase.length) delay = holdMs;

    const id = window.setTimeout(() => {
      if (!deleting && length === phrase.length) setDeleting(true);
      else if (deleting && length === 0) {
        setDeleting(false);
        setIndex((i) => (i + 1) % phrases.length);
      } else setLength((l) => l + (deleting ? -1 : 1));
    }, delay);
    return () => window.clearTimeout(id);
  }, [deleteMs, deleting, holdMs, index, length, phrases, typeMs]);

  return phrases[index].slice(0, length);
}
