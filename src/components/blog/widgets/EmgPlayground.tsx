import { useEffect, useRef, useState } from "react";
import { renderInline } from "../inline";

type View = "raw" | "filtered" | "calibrated";

const SAMPLES = 140;
const WIDTH = 600;
const HEIGHT = 200;
// Hysteresis band: activation must rise above ON to "press", and fall below OFF to "release".
const ON = 0.6;
const OFF = 0.35;

const views: Array<{ id: View; label: string; caption: string }> = [
  {
    id: "raw",
    label: "1. Raw",
    caption: "This is what the sensor really sends: a fuzzy, **noisy** signal. Even when you're relaxed, there's interference."
  },
  {
    id: "filtered",
    label: "2. Filtered",
    caption: "After **filtering and smoothing**, the noise becomes a clean line that follows how hard you're contracting."
  },
  {
    id: "calibrated",
    label: "3. Calibrated",
    caption:
      "With **your** relax and max values saved, the signal becomes a 0–100% activation. The **hysteresis band** means it only presses SPACE above the top line and releases below the bottom one, so there's no flickering 🦖"
  }
];

type Sample = { raw: number; envelope: number };

// A simulated EMG signal you can "flex" with: hold the button or drag the slider.
export function EmgPlayground() {
  const [view, setView] = useState<View>("raw");
  const [holding, setHolding] = useState(false);
  const [level, setLevel] = useState(5);
  const [, setFrame] = useState(0);

  // Start with a history of relaxed-muscle noise so the chart is never empty.
  const samples = useRef<Sample[]>(Array.from({ length: SAMPLES }, () => ({ raw: (Math.random() * 2 - 1) * 0.07, envelope: 0.1 })));
  const contraction = useRef(0.05);
  const envelope = useRef(0.1);
  const pressed = useRef(false);
  const target = useRef(0.05);
  const stageRef = useRef<HTMLDivElement>(null);

  target.current = holding ? 0.9 : level / 100;

  useEffect(() => {
    let frameId = 0;
    let visible = true;
    let last = 0;
    const slow = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const interval = slow ? 90 : 33;

    const tick = (time: number) => {
      frameId = requestAnimationFrame(tick);
      if (!visible || time - last < interval) return;
      last = time;

      contraction.current += (target.current - contraction.current) * 0.12;
      const amplitude = 0.07 + contraction.current * 0.85;
      const raw = (Math.random() * 2 - 1) * amplitude + Math.sin(time / 9) * 0.03;
      envelope.current = envelope.current * 0.85 + Math.abs(raw) * 2 * 0.15;

      const activation = Math.min(1, Math.max(0, (envelope.current - 0.1) / 0.8));
      if (activation > ON) pressed.current = true;
      else if (activation < OFF) pressed.current = false;

      samples.current = [...samples.current.slice(1), { raw, envelope: envelope.current }];
      setFrame((value) => value + 1);
    };

    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    if (stageRef.current) observer.observe(stageRef.current);
    frameId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  const step = WIDTH / (SAMPLES - 1);
  const rawPath = samples.current
    .map((sample, index) => `${index ? "L" : "M"}${(index * step).toFixed(1)} ${(HEIGHT / 2 - sample.raw * 90).toFixed(1)}`)
    .join(" ");
  const toActivation = (value: number) => Math.min(1, Math.max(0, (value - 0.1) / 0.8));
  const envelopeY = (sample: Sample) =>
    view === "calibrated" ? HEIGHT - 10 - toActivation(sample.envelope) * (HEIGHT - 20) : HEIGHT - 10 - Math.min(1, sample.envelope) * (HEIGHT - 20);
  const envelopeLine = samples.current.map((sample, index) => `${index ? "L" : "M"}${(index * step).toFixed(1)} ${envelopeY(sample).toFixed(1)}`).join(" ");
  const envelopeArea = `${envelopeLine} L${WIDTH} ${HEIGHT} L0 ${HEIGHT} Z`;
  const bandY = (value: number) => HEIGHT - 10 - value * (HEIGHT - 20);
  const activation = toActivation(envelope.current);
  const current = views.find((item) => item.id === view)!;

  const press = (down: boolean) => () => setHolding(down);

  return (
    <figure className="post-widget">
      <figcaption className="post-widget__title">
        <span>▶ Interactive</span>
        Flex and watch the EMG signal
      </figcaption>

      <div className="emg__tabs" role="tablist" aria-label="Signal stage">
        {views.map((item) => (
          <button key={item.id} type="button" role="tab" aria-selected={view === item.id} className={view === item.id ? "is-active" : undefined} onClick={() => setView(item.id)}>
            {item.label}
          </button>
        ))}
      </div>

      <div className={`post-widget__stage emg${view === "calibrated" ? " emg--calibrated" : ""}`} ref={stageRef}>
        <div className="emg__plot">
        <svg className="emg__chart" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" aria-hidden="true">
          {view === "raw" ? (
            <path d={rawPath} className="emg__raw" />
          ) : (
            <>
              <path d={rawPath} className="emg__raw emg__raw--faint" />
              <path d={envelopeArea} className="emg__area" />
              <path d={envelopeLine} className="emg__envelope" />
            </>
          )}
          {view === "calibrated" ? (
            <>
              <rect x="0" y={bandY(ON)} width={WIDTH} height={bandY(OFF) - bandY(ON)} className="emg__band" />
              <line x1="0" x2={WIDTH} y1={bandY(ON)} y2={bandY(ON)} className="emg__threshold emg__threshold--on" />
              <line x1="0" x2={WIDTH} y1={bandY(OFF)} y2={bandY(OFF)} className="emg__threshold emg__threshold--off" />
            </>
          ) : null}
        </svg>

        {view === "calibrated" ? (
          <>
            <span className="emg__label emg__label--on" style={{ top: `${(bandY(ON) / HEIGHT) * 100}%` }}>press above</span>
            <span className="emg__label emg__label--off" style={{ top: `${(bandY(OFF) / HEIGHT) * 100}%` }}>release below</span>
          </>
        ) : null}
        </div>

        {view === "calibrated" ? (
          <div className="emg__side">
              <div className="emg__flexbar" aria-label={`Activation ${Math.round(activation * 100)}%`}>
                <i style={{ height: `${Math.round(activation * 100)}%` }} />
              </div>
              <b>{Math.round(activation * 100)}%</b>
              <span className={`emg__game${pressed.current ? " is-jumping" : ""}`}>
                <span aria-hidden="true">🦖</span>
                {pressed.current ? "SPACE: jump!" : "relaxed"}
              </span>
          </div>
        ) : null}
      </div>

      <p className="post-widget__caption" aria-live="polite">{renderInline(current.caption)}</p>

      <div className="emg__controls">
        <button
          type="button"
          className={`emg__flex${holding ? " is-holding" : ""}`}
          onPointerDown={press(true)}
          onPointerUp={press(false)}
          onPointerLeave={press(false)}
          onPointerCancel={press(false)}
          onKeyDown={(event) => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); setHolding(true); } }}
          onKeyUp={() => setHolding(false)}
          onContextMenu={(event) => event.preventDefault()}
        >
          💪 {holding ? "Flexing!" : "Hold to flex"}
        </button>
        <label className="emg__slider">
          <span>Muscle effort</span>
          <input type="range" min="0" max="100" value={level} onChange={(event) => setLevel(Number(event.target.value))} />
        </label>
      </div>
    </figure>
  );
}
