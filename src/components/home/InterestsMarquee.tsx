import type { CSSProperties } from "react";

// Two slow rows of pastel "sticker" chips drifting in opposite directions.
const rows: Array<Array<[string, string]>> = [
  [
    ["🤖", "LLMs & NLP"],
    ["🧠", "AI agents"],
    ["📡", "Real-time systems"],
    ["🛠️", "Full-stack apps"],
    ["💗", "Human-centred design"],
    ["🐍", "Python"],
    ["⚛️", "React & TypeScript"]
  ],
  [
    ["🎓", "CS with AI @ Nottingham"],
    ["🎵", "Music-powered apps"],
    ["🎮", "Retro games"],
    ["📈", "Markets & data"],
    ["✍️", "Writing on my blog"],
    ["🌻", "Building for fun"],
    ["✨", "Always learning"]
  ]
];

const pastels = ["#f9e6ec", "#f1e4ff", "#ffe6dc", "#dcf5ea", "#fff1c9", "#e1efff"];

export function InterestsMarquee() {
  return (
    <section className="interests" aria-label="Things I love">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={`interests__row${rowIndex % 2 ? " interests__row--reverse" : ""}`}>
          <ul className="interests__track">
            {/* The list is repeated so the loop is seamless; only the first copy is read out. */}
            {[0, 1, 2, 3].flatMap((copy) =>
              row.map(([emoji, label], index) => (
                <li
                  key={`${copy}-${label}`}
                  aria-hidden={copy > 0 ? true : undefined}
                  className="interest-chip"
                  style={{
                    "--chip-bg": pastels[(index + rowIndex * 3) % pastels.length],
                    "--chip-tilt": `${index % 2 ? 1.5 : -1.5}deg`
                  } as CSSProperties}
                >
                  <span aria-hidden="true">{emoji}</span>
                  {label}
                </li>
              ))
            )}
          </ul>
        </div>
      ))}
    </section>
  );
}
