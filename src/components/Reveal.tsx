import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// Fades and slides its children in the first time they scroll into view.
export function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div"
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "article" | "section" | "li";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={(node: HTMLElement | null) => { ref.current = node; }}
      className={`reveal${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
