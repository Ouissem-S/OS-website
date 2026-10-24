import { useState } from "react";
import { StepWidget } from "./StepWidget";

const fields = [
  { label: "Method", value: "GET" },
  { label: "Page", value: "/shop" },
  { label: "Headers", value: "✓ 12 items" },
  { label: "Session", value: "✓ user #42" },
  { label: "Settings", value: "✓ loaded" }
];

const captions = [
  "A request arrives. PHP starts **setting up** its internal \"form\" for it.",
  "It fills in the first few fields…",
  "💥 **Out of memory!** Setup stops halfway. Some fields are never filled in.",
  "Later, another part of PHP **assumes the form is complete** and reads the empty fields as if they were real. That's where things go wrong ⚠️"
];

export function HalfFilledForm() {
  const [step, setStep] = useState(0);
  const filledCount = step === 0 ? 0 : 3;

  return (
    <StepWidget title="Bug #1: the half-filled form" step={step} captions={captions} onStep={setStep}>
      <div className="hff">
        <div className={`hff__form${step >= 2 ? " is-broken" : ""}`}>
          <p className="hff__heading">📋 Request setup</p>
          {fields.map((field, index) => {
            const filled = index < filledCount;
            const missing = step >= 2 && !filled;
            const misread = step === 3 && missing;
            return (
              <div key={field.label} className={`hff__row${filled ? " is-filled" : ""}${missing ? " is-missing" : ""}${misread ? " is-misread" : ""}`}>
                <span>{field.label}</span>
                <b>{filled ? field.value : missing ? (misread ? "??? 🤷" : "—") : "…"}</b>
              </div>
            );
          })}
        </div>
        {step >= 2 ? <span className="hff__stamp">OUT OF MEMORY</span> : null}
      </div>
    </StepWidget>
  );
}
