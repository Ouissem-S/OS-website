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

  return (
    <nav className={className} aria-label="Primary navigation">
      {links.map((link) => (
        <a
          key={link.path}
          className={active === link.path ? "home-nav__active" : undefined}
          href={link.href}
          onClick={navigateTo(link.path)}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
