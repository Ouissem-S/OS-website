import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { MiniMeFigure } from "../home/MiniMeFigure";
import { Reveal } from "../Reveal";
import { AlgeriaMap } from "./AlgeriaMap";
import { useTypewriter } from "../../hooks/useTypewriter";
import { BoardingPass, CatWalk, YearThreeGame, type Reaction } from "./StoryGames";

type Side = "left" | "right";
type Said = { text: string; lang?: string; prop?: ReactNode };

// Algeria's flag on a little pole, held in mini me's raised hand.
const STAR = Array.from({ length: 10 }, (_, i) => {
  const r = i % 2 ? 1.1 : 2.7;
  const a = -Math.PI / 2 + (i * Math.PI) / 5;
  return `${(5.4 + r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`;
}).join(" ");

const FLAG = (
  <g>
    <path d="M213 172 L213 90" stroke="#8a5a3c" strokeWidth="3" strokeLinecap="round" />
    <rect x="213" y="90" width="21" height="28" fill="#006233" />
    <rect x="234" y="90" width="21" height="28" fill="#fff" />
    <g transform="translate(232 104)" fill="#d21034">
      <path d="M6.76 -4.28 A 8 8 0 1 0 6.76 4.28 A 6.4 6.4 0 1 1 6.76 -4.28 Z" />
      <polygon points={STAR} />
    </g>
  </g>
);

const emoji = (char: string) => (
  <text x="214" y="142" fontSize="40" textAnchor="middle">{char}</text>
);

// What mini me holds and says at each chapter, in order. Lines play one after another.
const CHAPTERS: Array<{ side: Side; prop?: ReactNode; lines: string[] }> = [
  { side: "left", prop: FLAG, lines: ["Hey! I'm Algerian 🇩🇿"] },
  { side: "right", prop: emoji("💗"), lines: ["This is home 💗"] },
  { side: "left", lines: ["Tap a bubble! 👆"] },
  { side: "right", prop: emoji("🌱"), lines: ["¡Hola!", "mamma mia!", "(wait, that's Italian 🤌)"] },
  { side: "left", prop: emoji("💡"), lines: ["Computer… Science? 👀"] },
  { side: "right", prop: emoji("💻"), lines: ["It was love at first print() 💻"] },
  { side: "left", prop: emoji("✈️"), lines: ["Next stop: the UK ✈️"] },
  { side: "right", prop: emoji("🎓"), lines: ["Third year already?! 🎓", "Help me catch it all 👉"] },
  { side: "left", prop: emoji("🌿"), lines: ["Follow the cat 🐾", "Tap what it drops 👇"] }
];


const GREETINGS: Array<{ label: string; greeting: string; lang: string }> = [
  { label: "العربية", greeting: "مرحبا!", lang: "ar" },
  { label: "Français", greeting: "Bonjour !", lang: "fr" },
  { label: "English", greeting: "Hello!", lang: "en" }
];

const CODE_LINES = ['print("hello, world")', "while (curious) learn();", 'git commit -m "fell in love"'];

const LINE_MS = 1500;

type Anchor = { x: number; y: number; stop: boolean };

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const ease = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

// One cubic per pair of anchors, leaving and arriving vertically so the line swings side to side.
function segments(anchors: Anchor[]) {
  return anchors.map((p, i) => {
    if (i === 0) return `M${p.x} ${p.y}`;
    const q = anchors[i - 1];
    const bend = (p.y - q.y) * 0.55;
    return ` C${q.x} ${q.y + bend} ${p.x} ${p.y - bend} ${p.x} ${p.y}`;
  });
}

function Chapter({ index, side, label, children }: { index: number; side: Side; label: string; children: ReactNode }) {
  return (
    <article className={`story-chapter story-chapter--${side}`} aria-label={label}>
      <div className="story-chapter__spot" data-story-anchor="stop" aria-hidden="true" />
      <div className="story-chapter__body">
        <span className="story-chapter__num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        {children}
      </div>
    </article>
  );
}

// Kept apart from MyStory so the typing only re-renders this little window.
function CodeWindow() {
  const code = useTypewriter(CODE_LINES);
  return (
    <div className="story-code" aria-hidden="true">
      <span className="story-code__dots" />
      <code>
        <span className="story-code__prompt">&gt;</span> {code}
        <span className="story-code__caret" />
      </code>
    </div>
  );
}

export function MyStory() {
  const trackRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const drawRef = useRef<SVGPathElement>(null);
  const walkerRef = useRef<HTMLDivElement>(null);
  const geometry = useRef<{ total: number; stops: Array<{ y: number; len: number }> }>({ total: 0, stops: [] });
  const lastX = useRef(0);
  const atRef = useRef<number | null>(0);

  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [at, setAt] = useState<number | null>(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [said, setSaid] = useState<Said | null>(null);
  const [waveKey, setWaveKey] = useState(0);
  const maskId = `story-draw-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // Maps the scroll position to how much line is drawn and where mini me stands on it.
  // Near a chapter she waits beside it; in the gaps the line draws ahead and she walks after it.
  const update = useCallback(() => {
    const track = trackRef.current;
    const path = pathRef.current;
    const { total, stops } = geometry.current;
    if (!track || !path || stops.length === 0) return;

    const focus = window.innerHeight * 0.55 - track.getBoundingClientRect().top;
    const last = stops.length - 1;
    let walk = stops[0].len;
    let draw = walk;
    let next: number | null = 0;

    if (focus >= stops[last].y) {
      walk = draw = stops[last].len;
      next = last;
    } else if (focus > stops[0].y) {
      const i = stops.findIndex((_, k) => k < last && focus < stops[k + 1].y);
      const from = stops[i];
      const to = stops[i + 1];
      const f = (focus - from.y) / (to.y - from.y);
      const walked = ease((f - 0.3) / 0.45);
      walk = from.len + walked * (to.len - from.len);
      draw = from.len + ease((f - 0.1) / 0.45) * (to.len - from.len);
      next = walked === 0 ? i : walked === 1 ? i + 1 : null;
    }

    const point = path.getPointAtLength(walk);
    const walker = walkerRef.current;
    if (walker) {
      walker.style.transform = `translate(${point.x}px, ${point.y}px)`;
      if (Math.abs(point.x - lastX.current) > 0.5) {
        walker.style.setProperty("--story-tilt", point.x > lastX.current ? "1" : "-1");
      }
    }
    lastX.current = point.x;
    drawRef.current?.style.setProperty("stroke-dashoffset", String(total - draw));

    if (next !== atRef.current) {
      atRef.current = next;
      setAt(next);
      setLineIndex(0);
      setSaid(null);
    }
  }, []);

  // Measure the anchors (each chapter's spot plus any waypoints) whenever the layout changes.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      const base = track.getBoundingClientRect();
      setAnchors(
        Array.from(track.querySelectorAll<HTMLElement>("[data-story-anchor]")).map((node) => {
          const rect = node.getBoundingClientRect();
          return {
            x: Math.round(rect.left + rect.width / 2 - base.left),
            y: Math.round(rect.top + rect.height / 2 - base.top),
            stop: node.dataset.storyAnchor === "stop"
          };
        })
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, []);

  // Work out how far along the path each stop is by measuring the path one segment at a time.
  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path || anchors.length < 2) return;

    const parts = segments(anchors);
    const lengths = [0];
    let d = parts[0];
    for (const part of parts.slice(1)) {
      d += part;
      path.setAttribute("d", d);
      lengths.push(path.getTotalLength());
    }

    const total = lengths[lengths.length - 1];
    geometry.current = {
      total,
      stops: anchors.flatMap((anchor, i) => (anchor.stop ? [{ y: anchor.y, len: lengths[i] }] : []))
    };
    drawRef.current?.setAttribute("stroke-dasharray", `${total} ${total}`);
    update();
  }, [anchors, update]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [update]);

  // Play the current chapter's lines one after another.
  useEffect(() => {
    if (at === null || said || lineIndex >= CHAPTERS[at].lines.length - 1) return;
    const id = window.setTimeout(() => setLineIndex((i) => i + 1), LINE_MS);
    return () => window.clearTimeout(id);
  }, [at, lineIndex, said]);

  const greet = (greeting: (typeof GREETINGS)[number]) => {
    setSaid({ text: greeting.greeting, lang: greeting.lang });
    setWaveKey((key) => key + 1);
  };

  const react = useCallback((reaction: Reaction) => {
    setSaid({ text: reaction.text, prop: emoji(reaction.prop) });
    setWaveKey((key) => key + 1);
  }, []);

  const chapter = at === null ? null : CHAPTERS[at];
  const bubble: Said | null = said ?? (chapter ? { text: chapter.lines[lineIndex] } : null);
  const d = anchors.length > 1 ? segments(anchors).join("") : "";

  return (
    <section className="story" aria-labelledby="story-title">
      <header className="story__intro">
        <h2 id="story-title">
          My <span>story</span>
        </h2>
        <p>Scroll down and mini me will walk you through it ✨</p>
      </header>

      <div className="story__track" ref={trackRef}>
        <svg className="story__line" aria-hidden="true">
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse">
              <path ref={drawRef} d={d} stroke="#fff" strokeWidth="14" fill="none" />
            </mask>
          </defs>
          <path ref={pathRef} d={d} className="story__dash" mask={`url(#${maskId})`} />
        </svg>

        <Chapter index={0} side="left" label="I'm Algerian">
          <span className="story-chip">
            <span aria-hidden="true">🇩🇿</span> Algerian
            <span className="story-chip__tail" data-story-anchor="via" aria-hidden="true" />
          </span>
        </Chapter>

        <Chapter index={1} side="right" label="Algeria, home">
          <AlgeriaMap />
        </Chapter>

        <Chapter index={2} side="left" label="I speak three languages">
          <h3>I speak three languages</h3>
          <div className="story-langs">
            {GREETINGS.map((greeting) => (
              <button
                key={greeting.lang}
                type="button"
                className={`story-lang${said?.lang === greeting.lang ? " is-active" : ""}`}
                lang={greeting.lang}
                onClick={() => greet(greeting)}
              >
                {greeting.label}
              </button>
            ))}
          </div>
        </Chapter>

        <Chapter index={3} side="right" label="Learning Spanish">
          <h3>
            Since I already speak French… why not learn Spanish? <span aria-hidden="true">🇪🇸</span>
          </h3>
          <Reveal className="story-progress">
            <span className="story-progress__label">
              Spanish: learning <span aria-hidden="true">🌱</span>
            </span>
            <span
              className="story-progress__bar"
              role="progressbar"
              aria-label="Spanish"
              aria-valuenow={30}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span className="story-progress__fill" style={{ "--level": 0.3 } as CSSProperties} />
            </span>
          </Reveal>
        </Chapter>

        <Chapter index={4} side="left" label="It started with a classmate">
          <h3>
            Falling in love with computers <span aria-hidden="true">💻</span>
          </h3>
          <p>
            It all started with a classmate casually mentioning Computer Science… and something just clicked.
          </p>
        </Chapter>

        <Chapter index={5} side="right" label="One year of Computer Science back home">
          <h3>
            One year of CS back home <span aria-hidden="true">🇩🇿</span>
          </h3>
          <p>I started studying it at university in Algeria and spent a whole year getting hooked on code.</p>
          <CodeWindow />
        </Chapter>

        <Chapter index={6} side="left" label="Moving to the UK">
          <h3>
            Then I decided to challenge myself <span aria-hidden="true">✈️</span>
          </h3>
          <p>So I packed my bags for a Russell Group university in the UK: the University of Nottingham.</p>
          <BoardingPass onReact={react} />
        </Chapter>

        <Chapter index={7} side="right" label="Third year now">
          <h3>
            And here I am, in third year <span aria-hidden="true">🎓</span>
          </h3>
          <p>Full of projects, experiences, opportunities and so many other things.</p>
          <YearThreeGame onReact={react} />
        </Chapter>

        <Chapter index={8} side="left" label="In my free time">
          <h3>
            In my free time <span aria-hidden="true">🌸</span>
          </h3>
          <p>A little cat is about to walk by with my hobbies. Tap anything it drops, or pet it to go again.</p>
          <CatWalk onReact={react} />
        </Chapter>

        <div
          ref={walkerRef}
          className={`story__walker story__walker--${chapter?.side ?? "left"}${at === null ? " is-walking" : ""}${d ? " is-ready" : ""}`}
        >
          <div className="story__walker-inner">
            <p className={`story__bubble${bubble ? " is-shown" : ""}`} lang={bubble?.lang} aria-live="polite">
              {bubble?.text}
            </p>
            <button className="minime-button story__minime" type="button" onClick={() => setWaveKey((key) => key + 1)} aria-label="Say hi to mini Ouissem">
              <span className="story__hop">
                <MiniMeFigure size="var(--story-minime)" pose={at === null ? "rest" : "wave"} prop={said?.prop ?? chapter?.prop} waveKey={waveKey} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
