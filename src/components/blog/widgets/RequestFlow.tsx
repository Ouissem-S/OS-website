import { useState } from "react";
import { renderInline } from "../inline";

const actions = [
  { label: "🔑 Log in", request: "POST /login" },
  { label: "🔍 Search", request: "GET /search?q=shoes" },
  { label: "🛒 Add to basket", request: "POST /basket" }
];

// Click an action and watch the request travel: browser → PHP → memory.
export function RequestFlow() {
  const [sent, setSent] = useState<{ request: string; id: number } | null>(null);

  return (
    <figure className="post-widget">
      <figcaption className="post-widget__title">
        <span>▶ Interactive</span>
        What happens when you click something
      </figcaption>
      <div className="post-widget__stage">
        <div className="rf">
          <div className="rf__node">
            <span aria-hidden="true">💻</span>
            <b>Your browser</b>
          </div>
          <div className="rf__wire">
            {sent ? (
              <span key={sent.id} className="rf__packet">
                {sent.request}
              </span>
            ) : null}
          </div>
          <div className={`rf__node${sent ? " is-busy" : ""}`} key={`server-${sent?.id ?? 0}`}>
            <span aria-hidden="true">🐘</span>
            <b>Server + PHP</b>
          </div>
          <div className="rf__wire rf__wire--short" />
          <div className="rf__node rf__node--memory" key={`memory-${sent?.id ?? 0}`}>
            <span aria-hidden="true">🧠</span>
            <b>Memory</b>
            <i className={sent ? "is-allocated" : undefined} />
          </div>
        </div>
      </div>
      <p className="post-widget__caption" aria-live="polite">
        {sent
          ? renderInline(`Your browser sent \`${sent.request}\` → PHP grabbed some **memory** to work on it.`)
          : "Pick an action to send a request 👇"}
      </p>
      <div className="post-widget__controls post-widget__controls--wrap">
        {actions.map((action) => (
          <button key={action.request} type="button" className="is-next" onClick={() => setSent({ request: action.request, id: Date.now() })}>
            {action.label}
          </button>
        ))}
      </div>
    </figure>
  );
}
