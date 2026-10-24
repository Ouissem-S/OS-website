import type { MouseEvent } from "react";

export function normalisePath(pathname: string) {
  if (window.location.hash.startsWith("#/")) return window.location.hash.slice(1);
  const base = import.meta.env.BASE_URL;
  if (pathname === "/" || pathname === "/index.html" || pathname === base || pathname === `${base}index.html`) return "/";
  return pathname;
}

export function navigate(path: string) {
  window.location.hash = path === "/" ? "" : path;
  window.dispatchEvent(new Event("portfolio-route-change"));
}

export function navigateTo(path: string) {
  return (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(path);
  };
}
