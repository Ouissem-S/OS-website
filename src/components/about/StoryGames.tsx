import { useEffect, useRef, useState, type CSSProperties } from "react";

export type Reaction = { text: string; prop: string };

// ── Third year: catch what it's full of ─────────────────────

const LOOT = [
  { emoji: "🛠️", name: "Projects" },
  { emoji: "🌍", name: "Experiences" },
  { emoji: "🚪", name: "Opportunities" },
  { emoji: "✨", name: "& so much more" }
];

const CONFETTI = ["#e07a9b", "#a77bab", "#8fd3b0", "#f4c7b4", "#d9c4ef", "#ee9a8c"];

export function YearThreeGame({ onReact }: { onReact: (reaction: Reaction) => void }) {
  const [caught, setCaught] = useState<boolean[]>(() => LOOT.map(() => false));
  const count = caught.filter(Boolean).length;
  const done = count === LOOT.length;

  const catchOne = (index: number) => {
    const next = caught.map((value, i) => value || i === index);
    setCaught(next);
    const loot = LOOT[index];
    onReact(
      next.every(Boolean)
        ? { text: "Level up! Third year, full of it all 🎓", prop: "🎓" }
        : { text: `+1 ${loot.name} ${loot.emoji}`, prop: loot.emoji }
    );
  };

  return (
    <div className={`xp${done ? " is-done" : ""}`}>
      <div className="xp__field">
        {LOOT.map((loot, index) => (
          <button
            key={loot.name}
            type="button"
            className={`xp-orb xp-orb--${index + 1}${caught[index] ? " is-caught" : ""}`}
            onClick={() => catchOne(index)}
            disabled={caught[index]}
            aria-label={`Catch ${loot.name}`}
          >
            <span className="xp-orb__emoji" aria-hidden="true">{loot.emoji}</span>
            {caught[index] && <span className="xp-orb__plus" aria-hidden="true">+1 {loot.name}</span>}
          </button>
        ))}
        {!count && <p className="xp__hint">Tap the bubbles to catch them 👆</p>}
        {done && (
          <span className="xp__confetti" aria-hidden="true">
            {Array.from({ length: 16 }, (_, i) => (
              <span
                key={i}
                style={{ "--i": i, "--c": CONFETTI[i % CONFETTI.length] } as CSSProperties}
              />
            ))}
          </span>
        )}
      </div>

      <div className="xp__hud">
        <span className="xp__level">{done ? "Level 3 ✨" : "Year 3"}</span>
        <span className="xp__bar" role="progressbar" aria-label="Third year" aria-valuenow={count} aria-valuemin={0} aria-valuemax={LOOT.length}>
          <span className="xp__fill" style={{ "--level": count / LOOT.length } as CSSProperties} />
        </span>
        {done ? (
          <button type="button" className="xp__again" onClick={() => setCaught(LOOT.map(() => false))}>
            Again ↻
          </button>
        ) : (
          <span className="xp__count">{count}/{LOOT.length}</span>
        )}
      </div>
    </div>
  );
}


// ── Moving to the UK: a boarding pass you can board ─────────

export function BoardingPass({ onReact }: { onReact: (reaction: Reaction) => void }) {
  const [flights, setFlights] = useState(0);

  const board = () => {
    setFlights((n) => n + 1);
    onReact({ text: "Challenge accepted! ✈️", prop: "✈️" });
  };

  return (
    <button type="button" className={`pass${flights ? " is-boarded" : ""}`} onClick={board} aria-label="Board the flight from Algeria to the UK">
      <span className="pass__main">
        <span className="pass__route">
          <span className="pass__city">
            <strong>DZA</strong>
            <small>Algeria</small>
          </span>
          <span className="pass__flight" aria-hidden="true">
            <svg viewBox="0 0 140 44">
              <path d="M6 38 Q 70 -8 134 38" />
            </svg>
            <span key={flights} className="pass__plane">✈️</span>
          </span>
          <span className="pass__city">
            <strong>GBR</strong>
            <small>Nottingham</small>
          </span>
        </span>
        <span className="pass__details">
          <span><small>Passenger</small>Ouissem</span>
          <span><small>Class</small>CS with AI</span>
          <span><small>Gate</small>Russell Group</span>
        </span>
      </span>
      <span className="pass__stub" aria-hidden="true">
        <span className="pass__barcode" />
        <span className="pass__board">{flights ? "Fly again ↻" : "Tap to board"}</span>
      </span>
      {flights > 0 && (
        <span key={`stamp-${flights}`} className="pass__stamp" aria-hidden="true">
          Challenge accepted
        </span>
      )}
    </button>
  );
}

// ── Free time: a cat walks by and drops my hobbies ──────────

// Dropped in order, one per column, as the cat's head passes over each column.
const HOBBIES = [
  { emoji: "🎤", label: "I sing", line: "La la la ♪ (yes, I sing!)" },
  { emoji: "✍️", label: "I write pop songs", line: "Writing my next pop song ✍️" },
  { emoji: "🏊‍♀️", label: "I swim", line: "Off for a swim! 🏊‍♀️" },
  { emoji: "📚", label: "I read books", line: "Lost in a good book 📚" },
  { emoji: "🌿", label: "I walk in nature… A LOT", line: "Nature walk time 🌿 (again)" }
];

const WALK_MS = 7000;

function Cat() {
  return (
    <svg className="cat" viewBox="0 0 120 90" aria-hidden="true">
      <path className="cat__tail" d="M26 50 C 8 46, 4 26, 14 16" />
      {/* far legs sit behind the body, a shade darker */}
      <rect className="cat__leg cat__leg--b" x="34" y="56" width="8" height="24" rx="4" fill="#e9ad8a" />
      <rect className="cat__leg cat__leg--a" x="80" y="56" width="8" height="24" rx="4" fill="#e9ad8a" />
      <ellipse cx="58" cy="52" rx="34" ry="18" fill="#f6c9a8" />
      <path d="M48 36 Q 50 44 46 50 M58 35 Q 60 43 56 50 M68 36 Q 70 43 66 49" stroke="#e9a983" strokeWidth="3" strokeLinecap="round" fill="none" />
      <rect className="cat__leg cat__leg--a" x="26" y="58" width="8" height="24" rx="4" fill="#f6c9a8" />
      <rect className="cat__leg cat__leg--b" x="72" y="58" width="8" height="24" rx="4" fill="#f6c9a8" />
      <g className="cat__head">
        <path d="M80 30 L 81 8 L 95 20 Z M99 20 L 111 7 L 112 30 Z" fill="#f6c9a8" />
        <path d="M83 24 L 84 14 L 91 20 Z M103 19 L 109 12 L 109 24 Z" fill="#f2a1b4" />
        <circle cx="96" cy="36" r="18" fill="#f6c9a8" />
        <ellipse cx="89" cy="34" rx="2.4" ry="3.2" fill="#3a2a2e" />
        <ellipse cx="103" cy="34" rx="2.4" ry="3.2" fill="#3a2a2e" />
        <circle cx="89.8" cy="32.8" r="0.9" fill="#fff" />
        <circle cx="103.8" cy="32.8" r="0.9" fill="#fff" />
        <ellipse cx="85" cy="41" rx="4" ry="2.4" fill="#f28c9b" opacity="0.45" />
        <ellipse cx="107" cy="41" rx="4" ry="2.4" fill="#f28c9b" opacity="0.45" />
        <path d="M94 39 L 98 39 L 96 41.5 Z" fill="#e07a9b" />
        <path d="M96 41.5 Q 94 45 91.5 43.5 M96 41.5 Q 98 45 100.5 43.5" stroke="#3a2a2e" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M84 40 L 74 38 M84 43 L 75 45 M108 40 L 118 38 M108 43 L 117 45" stroke="#c9a08a" strokeWidth="1" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function CatWalk({ onReact }: { onReact: (reaction: Reaction) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [walks, setWalks] = useState(0);
  const [done, setDone] = useState(false);

  // Start the walk the first time the strip is properly on screen.
  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) return setOn(true);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setOn(true);
        observer.disconnect();
      }
    }, { threshold: 0.6 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const walkAgain = () => {
    setWalks((n) => n + 1);
    setDone(false);
    onReact({ text: "Meow! (the cat says hi) 🐾", prop: "🐾" });
  };

  return (
    <div ref={ref} className={`catwalk${on ? " is-on" : ""}${done ? " is-done" : ""}`} style={{ "--walk": `${WALK_MS}ms` } as CSSProperties}>
      <div key={walks}>
        <div className="catwalk__lane">
          <button
          type="button"
          className="catwalk__cat"
          onClick={walkAgain}
          onAnimationEnd={(event) => event.target === event.currentTarget && setDone(true)}
          aria-label="Pet the cat to make it walk again"
        >
          <Cat />
          <span className="catwalk__meow" aria-hidden="true">mrrp! 🐾</span>
          </button>
        </div>

        <div className="catwalk__shelf">
        {HOBBIES.map((hobby, index) => (
          <button
            key={hobby.label}
            type="button"
            className="catwalk__item"
            style={{ "--at": (index + 0.5) / HOBBIES.length } as CSSProperties}
            onClick={() => onReact({ text: hobby.line, prop: hobby.emoji })}
          >
            <span className="catwalk__emoji" aria-hidden="true">
              {hobby.emoji}
              {hobby.emoji === "🌿" && (
                <>
                  <span className="catwalk__extra catwalk__extra--1">🌿</span>
                  <span className="catwalk__extra catwalk__extra--2">🍃</span>
                  <span className="catwalk__extra catwalk__extra--3">🌿</span>
                </>
              )}
            </span>
            <span className="catwalk__label">{hobby.label}</span>
          </button>
        ))}
        </div>
      </div>
    </div>
  );
}
