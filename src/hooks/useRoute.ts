import { useEffect, useState } from "react";
import { normalisePath } from "../lib/router";

export function useRoute() {
  const [route, setRoute] = useState(() => normalisePath(window.location.pathname));

  useEffect(() => {
    const sync = () => setRoute(normalisePath(window.location.pathname));
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    window.addEventListener("portfolio-route-change", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("portfolio-route-change", sync);
    };
  }, []);

  return route;
}
