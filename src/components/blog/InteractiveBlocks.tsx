// Reusable interactive blocks for blog posts. Each one is a single line in the post text:
//   [callout:key](text)          kinds: key, tip, warning, info
//   [stat:~70%](what the number means)
//   [stats:Title](6|teammates ;; 8 months|of work)
//   [reveal:Question?](answer shown on click; use " ;; " to split it into bullet points)
//   [flip:Front text](back text)              myth → reality card
//   [fix:Issue](how it was fixed)              consecutive fix lines become a grid of flip cards
//   [quiz:Question?](Option A | *Correct option | Option C)

import { useState } from "react";
import { renderInline } from "./inline";

const calloutIcons: Record<string, string> = { key: "✨", tip: "💡", warning: "⚠️", info: "ℹ️" };

export function Callout({ kind, text }: { kind: string; text: string }) {
  const safeKind = kind in calloutIcons ? kind : "info";
  return (
    <aside className={`post-callout post-callout--${safeKind}`}>
      <span className="post-callout__icon" aria-hidden="true">{calloutIcons[safeKind]}</span>
      <p>{renderInline(text)}</p>
    </aside>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="post-stat">
      <strong>{value}</strong>
      <p>{renderInline(label)}</p>
    </div>
  );
}

export function Stats({ title, items }: { title: string; items: string }) {
  const stats = items.split(";;").map((item) => item.split("|").map((part) => part.trim()));
  return (
    <div className="post-stats">
      <p className="post-stats__title">{renderInline(title)}</p>
      <div className="post-stats__grid">
        {stats.map(([value, label], index) => (
          <div key={index} className="post-stats__item">
            <strong>{value}</strong>
            <span>{label ? renderInline(label) : null}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RevealBlock({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const points = answer.split(";;").map((point) => point.trim()).filter(Boolean);
  return (
    <div className={`post-reveal${open ? " is-open" : ""}`}>
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span>🤔 {renderInline(question)}</span>
        <b aria-hidden="true">{open ? "−" : "+"}</b>
      </button>
      <div className="post-reveal__answer" hidden={!open}>
        {points.length > 1 ? (
          <ul>{points.map((point, index) => <li key={index}>{renderInline(point)}</li>)}</ul>
        ) : (
          <p>{renderInline(answer)}</p>
        )}
      </div>
    </div>
  );
}

export function FlipBlock({ front, back, variant = "myth" }: { front: string; back: string; variant?: "myth" | "fix" }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      type="button"
      className={`post-flip post-flip--${variant}${flipped ? " is-flipped" : ""}`}
      aria-pressed={flipped}
      onClick={() => setFlipped((value) => !value)}
    >
      <span className="post-flip__inner">
        <span className="post-flip__face post-flip__front">
          <span>{renderInline(front)}</span>
          <small>{variant === "fix" ? "Tap to see the fix ↻" : "Tap to see the reality ↻"}</small>
        </span>
        <span className="post-flip__face post-flip__back">
          <span>{renderInline(back)}</span>
        </span>
      </span>
    </button>
  );
}

export function Quiz({ question, options }: { question: string; options: string }) {
  const choices = options.split("|").map((option) => option.trim()).filter(Boolean);
  const correct = choices.findIndex((option) => option.startsWith("*"));
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <div className="post-quiz">
      <p className="post-quiz__label">🧠 Quick check</p>
      <p className="post-quiz__question">{renderInline(question)}</p>
      <div className="post-quiz__options">
        {choices.map((choice, index) => {
          const state = picked === null ? "" : index === correct ? " is-correct" : index === picked ? " is-wrong" : " is-dim";
          return (
            <button key={choice} type="button" className={`post-quiz__option${state}`} disabled={picked !== null} onClick={() => setPicked(index)}>
              {renderInline(choice.replace(/^\*/, ""))}
            </button>
          );
        })}
      </div>
      {picked !== null ? (
        <p className="post-quiz__result" role="status">
          {picked === correct ? "Yes! You've got it 🎉" : "Not quite. The highlighted answer is the right one 💗"}
          <button type="button" onClick={() => setPicked(null)}>Try again</button>
        </p>
      ) : null}
    </div>
  );
}
