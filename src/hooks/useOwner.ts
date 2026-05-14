import { useEffect, useState } from "react";
import { isOwner } from "../lib/blog";

export function useOwner() {
  const [owner, setOwner] = useState(() => isOwner());

  useEffect(() => {
    const sync = () => setOwner(isOwner());
    window.addEventListener("storage", sync);
    window.addEventListener("portfolio-owner-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("portfolio-owner-updated", sync);
    };
  }, []);

  return owner;
}
