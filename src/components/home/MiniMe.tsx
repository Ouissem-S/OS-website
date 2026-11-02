import { useState } from "react";
import { MiniMeFigure } from "./MiniMeFigure";

export function MiniMe() {
  const [waveKey, setWaveKey] = useState(0);

  const sayHi = () => setWaveKey((key) => key + 1);

  return (
    <div className="minime-stage">
      <span className="minime-stage__ring" aria-hidden="true" />
      <span className="minime-stage__glow" aria-hidden="true" />
      {["💗", "✨", "🌸", "💕", "✨"].map((item, index) => (
        <span key={index} className={`minime-float minime-float--${index + 1}`} aria-hidden="true">
          {item}
        </span>
      ))}

      <button className="minime-button" type="button" onClick={sayHi} aria-label="Say hi to mini Ouissem">
        <MiniMeFigure waveKey={waveKey} />
      </button>
    </div>
  );
}
