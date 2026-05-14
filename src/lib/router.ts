import type { MouseEvent } from "react";

export function normalisePath(pathname: string) {
  if (window.location.hash.startsWith("#/")) return window.location.hash.slice(1);
  if (pathname === "/" || pathname === "/index.html" || pathname === "/Main.html") return "/";
  if (pathname === "/AboutMe.html") return "/about";
  if (pathname === "/Blog.html") return "/blog";
  if (pathname === "/new-post.html") return "/new";
  if (pathname === "/view-post.html") {
    const id = new URLSearchParams(window.location.search).get("id");
    return id ? `/post/${id}` : "/blog";
  }
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
