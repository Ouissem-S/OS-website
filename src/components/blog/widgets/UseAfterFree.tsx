import { useState } from "react";
import { StepWidget } from "./StepWidget";

const captions = [
  "PHP **allocates** box 3 to hold your basket, and keeps a **pointer** to it.",
  "It uses the pointer to read the basket. All good ✅",
  "Done! Box 3 is **freed**… but a pointer still points to it. It's now *dangling*.",
  "Box 3 gets **reused** for completely different data.",
  "The old pointer is used again and reads data that isn't the basket at all 💥 That's **use-after-free**."
];

const ADDRESSES = ["0x01", "0x02", "0x03", "0x04", "0x05", "0x06"];

export function UseAfterFree() {
  const [step, setStep] = useState(0);

  const content = step <= 1 ? "🛒 basket" : step === 2 ? "" : "🔑 other data";
  const pointerState = step <= 1 ? "ok" : step === 2 ? "dangling" : "bad";

  return (
    <StepWidget title="Use-after-free, step by step" step={step} captions={captions} onStep={setStep}>
      <div className={`uaf uaf--step-${step}`}>
        <div className={`uaf__pointer uaf__pointer--${pointerState}`}>
          <code>basketPtr</code>
          <span aria-hidden="true">↓</span>
        </div>
        <div className="uaf__memory">
          {ADDRESSES.map((address, index) => {
            const isTarget = index === 2;
            const filled = isTarget ? content : index === 0 ? "📄 page" : index === 4 ? "👤 user" : "";
            return (
              <div
                key={address}
                className={`uaf__box${isTarget ? " uaf__box--target" : ""}${filled ? " is-filled" : ""}${isTarget && step === 1 ? " is-read" : ""}${isTarget && step === 4 ? " is-boom" : ""}`}
              >
                <span>{filled || "free"}</span>
                <small>{address}</small>
              </div>
            );
          })}
        </div>
        <p className="uaf__legend">🧠 Memory: each box is a spot PHP can store data in</p>
      </div>
    </StepWidget>
  );
}
