import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useRoute } from "../../hooks/useRoute";
import { navigateTo } from "../../lib/router";

const links = [
  { path: "/", href: "./", label: "Home" },
  { path: "/about", href: "#/about", label: "About" },
  { path: "/blog", href: "#/blog", label: "Blog" },
  { path: "/contact", href: "#/contact", label: "Contact" }
];

export function SiteNav({ className = "home-nav page-nav" }: { className?: string }) {
  const route = useRoute();
  const active = route.startsWith("/post/") || route.startsWith("/edit/") || route === "/new" ? "/blog" : route;
  const activeIndex = links.findIndex((link) => link.path === active);

  // The pink pill slides to whichever link is hovered, then back to the current page.
  const [hovered, setHovered] = useState<number | null>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const lit = hovered ?? (activeIndex >= 0 ? activeIndex : null);

  const placePill = useCallback(() => {
    const link = lit === null ? null : linkRefs.current[lit];
    setPill(link ? { left: link.offsetLeft, width: link.offsetWidth } : null);
  }, [lit]);

  useLayoutEffect(() => {
    placePill();
    void document.fonts?.ready.then(placePill);
    window.addEventListener("resize", placePill);
    return () => window.removeEventListener("resize", placePill);
  }, [placePill]);

  return (
    <nav className={className} aria-label="Primary navigation" onMouseLeave={() => setHovered(null)}>
      <span
        className="home-nav__pill"
        style={pill ? { transform: `translateX(${pill.left}px)`, width: pill.width, opacity: 1 } : { opacity: 0 }}
        aria-hidden="true"
      />
      {links.map((link, index) => (
        <a
          key={link.path}
          ref={(node) => { linkRefs.current[index] = node; }}
          className={index === lit ? "is-lit" : undefined}
          aria-current={index === activeIndex ? "page" : undefined}
          href={link.href}
          onClick={navigateTo(link.path)}
          onMouseEnter={() => setHovered(index)}
          onFocus={() => setHovered(index)}
          onBlur={() => setHovered(null)}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
