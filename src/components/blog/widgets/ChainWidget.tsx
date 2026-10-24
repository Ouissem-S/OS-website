import { useState, type CSSProperties } from "react";
import { renderInline } from "../inline";

export type ChainLink = { icon: string; title: string; text: string };

// A row of tappable steps (stacked on phones) with a caption and Back/Next controls.
// `flowing` animates little dots along the connectors, e.g. for a data pipeline.
export function ChainWidget({ title, links, flowing = false }: { title: string; links: ChainLink[]; flowing?: boolean }) {
  const [active, setActive] = useState(0);

  return (
    <figure className="post-widget">
      <figcaption className="post-widget__title">
        <span>▶ Interactive</span>
        {title}
      </figcaption>
      <div className="post-widget__stage">
        <ol className={`chain${flowing ? " chain--flowing" : ""}`} style={{ "--count": links.length } as CSSProperties}>
          {links.map((link, index) => (
            <li key={link.title}>
              <button
                type="button"
                className={`chain__link${index === active ? " is-active" : ""}${index < active ? " is-done" : ""}`}
                onClick={() => setActive(index)}
                aria-pressed={index === active}
              >
                <span aria-hidden="true">{link.icon}</span>
                <b>{link.title}</b>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <p className="post-widget__caption" aria-live="polite">
        <b>{active + 1}/{links.length}</b> {renderInline(links[active].text)}
      </p>
      <div className="post-widget__controls">
        <button type="button" onClick={() => setActive(active - 1)} disabled={active === 0}>← Back</button>
        <span className="post-widget__dots" aria-hidden="true">
          {links.map((_, index) => (
            <i key={index} className={index === active ? "is-active" : index < active ? "is-done" : undefined} />
          ))}
        </span>
        {active < links.length - 1 ? (
          <button type="button" className="is-next" onClick={() => setActive(active + 1)}>Next →</button>
        ) : (
          <button type="button" className="is-next" onClick={() => setActive(0)}>↺ Replay</button>
        )}
      </div>
    </figure>
  );
}
