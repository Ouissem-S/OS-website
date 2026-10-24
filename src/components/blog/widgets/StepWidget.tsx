import type { ReactNode } from "react";
import { renderInline } from "../inline";

// Shared frame for step-through explainers: a stage, a caption and Back/Next controls.
export function StepWidget({
  title,
  step,
  captions,
  onStep,
  children
}: {
  title: string;
  step: number;
  captions: string[];
  onStep: (step: number) => void;
  children: ReactNode;
}) {
  const last = captions.length - 1;
  return (
    <figure className="post-widget">
      <figcaption className="post-widget__title">
        <span>▶ Interactive</span>
        {title}
      </figcaption>
      <div className="post-widget__stage">{children}</div>
      <p className="post-widget__caption" aria-live="polite">
        <b>{step + 1}/{captions.length}</b> {renderInline(captions[step])}
      </p>
      <div className="post-widget__controls">
        <button type="button" onClick={() => onStep(step - 1)} disabled={step === 0}>← Back</button>
        <span className="post-widget__dots" aria-hidden="true">
          {captions.map((_, index) => (
            <i key={index} className={index === step ? "is-active" : index < step ? "is-done" : undefined} />
          ))}
        </span>
        {step < last ? (
          <button type="button" className="is-next" onClick={() => onStep(step + 1)}>Next →</button>
        ) : (
          <button type="button" className="is-next" onClick={() => onStep(0)}>↺ Replay</button>
        )}
      </div>
    </figure>
  );
}
