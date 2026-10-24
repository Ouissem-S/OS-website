import { useEffect, useState } from "react";
import { getProjectCovers, type ProjectCovers } from "../lib/projectCovers";

export function useProjectCovers() {
  const [covers, setCovers] = useState<ProjectCovers>({});

  useEffect(() => {
    let active = true;
    void getProjectCovers().then((loaded) => { if (active) setCovers(loaded); });

    const sync = (event: Event) => {
      if (event instanceof CustomEvent) setCovers(event.detail as ProjectCovers);
    };
    window.addEventListener("portfolio-covers-updated", sync);
    return () => {
      active = false;
      window.removeEventListener("portfolio-covers-updated", sync);
    };
  }, []);

  return covers;
}
