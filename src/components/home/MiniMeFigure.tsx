import { useEffect, useId, useRef, type ReactNode } from "react";

// Eye centres in SVG viewBox units — the pupils drift towards the cursor from here.
const EYES = [
  { x: 109, y: 120 },
  { x: 151, y: 120 }
];
const VIEWBOX_WIDTH = 260;

export type MiniMePose = "wave" | "rest";

// The cartoon Ouissem drawing on its own: used by the hero MiniMe and the About page story.
export function MiniMeFigure({
  size,
  pose = "wave",
  prop,
  waveKey = 0,
  className = ""
}: {
  // CSS width; leave it out to fill the parent.
  size?: number | string;
  // "wave" raises the right arm (and waves on mount), "rest" lets it hang.
  pose?: MiniMePose;
  // SVG held in the raised hand, in viewBox units — the hand sits around (212, 166).
  prop?: ReactNode;
  // Bump to replay the wave.
  waveKey?: number;
  className?: string;
}) {
  // Gradient ids must be unique per copy, or a second figure on the page reuses the first one's.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const hair = `minime-hair-${uid}`;
  const skin = `minime-skin-${uid}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const pupilRefs = useRef<Array<SVGGElement | null>>([]);

  useEffect(() => {
    const follow = (event: PointerEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scale = rect.width / VIEWBOX_WIDTH;

      EYES.forEach((eye, index) => {
        const dx = event.clientX - (rect.left + eye.x * scale);
        const dy = event.clientY - (rect.top + eye.y * scale);
        const distance = Math.hypot(dx, dy) || 1;
        const reach = Math.min(3.2, distance / 60);
        pupilRefs.current[index]?.setAttribute(
          "transform",
          `translate(${((dx / distance) * reach).toFixed(2)} ${((dy / distance) * reach).toFixed(2)})`
        );
      });
    };

    window.addEventListener("pointermove", follow);
    return () => window.removeEventListener("pointermove", follow);
  }, []);

  return (
    <svg
      ref={svgRef}
      className={`minime${className ? ` ${className}` : ""}`}
      style={size === undefined ? undefined : { width: size }}
      viewBox="0 0 260 320"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={hair} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#33221e" />
          <stop offset="1" stopColor="#1a1110" />
        </linearGradient>
        <linearGradient id={skin} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f1c8a6" />
          <stop offset="1" stopColor="#e8b893" />
        </linearGradient>
      </defs>

      <g className="minime__body">
        {/* long hair behind */}
        <path d="M72 110 C 62 48, 198 48, 188 110 C 192 170, 200 236, 208 320 L 52 320 C 60 236, 68 170, 72 110 Z" fill={`url(#${hair})`} />

        {/* neck, shoulders and black tank top */}
        <rect x="115" y="160" width="30" height="42" rx="12" fill="#dfa983" />
        <path d="M68 320 C 68 240, 88 202, 130 196 C 172 202, 192 240, 192 320 Z" fill={`url(#${skin})`} />
        <path d="M84 320 C 84 268, 92 244, 104 240 Q 130 254 156 240 C 168 244, 176 268, 176 320 Z" fill="#1d1a1c" />
        <path d="M103 241 L100 204 M157 241 L160 204" stroke="#1d1a1c" strokeWidth="3" strokeLinecap="round" />
        <path d="M114 200 Q130 220 146 200" stroke="#d6ad62" strokeWidth="1.3" fill="none" />
        <circle cx="130" cy="210" r="2.2" fill="#d6ad62" />

        {/* resting arm (and its mirror when the other one isn't raised) */}
        <path d="M80 234 C 68 258, 66 290, 70 320" stroke="#eab894" strokeWidth="16" strokeLinecap="round" fill="none" />
        {pose === "rest" && (
          <path d="M180 234 C 192 258, 194 290, 190 320" stroke="#eab894" strokeWidth="16" strokeLinecap="round" fill="none" />
        )}

        {/* hair falling in front of the shoulders */}
        <path d="M78 130 C 72 180, 68 236, 82 320 L 100 320 C 92 252, 92 190, 94 136 Z" fill={`url(#${hair})`} />
        <path d="M182 130 C 188 180, 192 236, 178 320 L 160 320 C 168 252, 168 190, 166 136 Z" fill={`url(#${hair})`} />

        {/* waving arm: remounted on click so the wave animation replays */}
        {pose === "wave" && (
          <g key={waveKey} className="minime__arm">
            {prop}
            <path d="M178 228 C 198 212, 208 194, 212 176" stroke="#eab894" strokeWidth="16" strokeLinecap="round" fill="none" />
            <path d="M204 162 L202 150 M210 160 L210 146 M216 160 L218 147 M221 164 L225 154" stroke="#eab894" strokeWidth="5.5" strokeLinecap="round" />
            <ellipse cx="212" cy="166" rx="12" ry="11" fill="#eab894" />
            <path d="M202 170 L196 162" stroke="#eab894" strokeWidth="6" strokeLinecap="round" />
          </g>
        )}

        {/* face */}
        <ellipse cx="130" cy="118" rx="52" ry="60" fill={`url(#${skin})`} />

        {/* hair framing the face, middle part */}
        <path d="M130 54 C 94 54, 72 80, 72 122 C 72 152, 77 172, 75 198 C 88 168, 86 128, 98 100 C 108 80, 122 68, 130 61 Z" fill={`url(#${hair})`} />
        <path d="M130 54 C 166 54, 188 80, 188 122 C 188 152, 183 172, 185 198 C 172 168, 174 128, 162 100 C 152 80, 138 68, 130 61 Z" fill={`url(#${hair})`} />
        <path d="M116 63 Q 101 76 93 102 M146 64 Q 160 78 166 100" stroke="#5b3f36" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.65" />

        {/* brows */}
        <path d="M98 103 Q 109 95 121 100" stroke="#2a1b17" strokeWidth="3.6" strokeLinecap="round" fill="none" />
        <path d="M139 100 Q 151 95 162 103" stroke="#2a1b17" strokeWidth="3.6" strokeLinecap="round" fill="none" />

        {/* eyes: the outer group blinks, the inner groups follow the cursor */}
        <g className="minime__eyes">
          {EYES.map((eye, index) => (
            <g key={index} ref={(node) => { pupilRefs.current[index] = node; }}>
              <ellipse cx={eye.x} cy={eye.y} rx="6.6" ry="7.2" fill="#4a2a1d" />
              <circle cx={eye.x} cy={eye.y} r="3.6" fill="#1b0f0b" />
              <circle cx={eye.x + 2.3} cy={eye.y - 2.6} r="2" fill="#fff" />
            </g>
          ))}
          <path d="M99 117 Q 109 109 120 116 M99 117 L 94 113" stroke="#1b110e" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          <path d="M140 116 Q 151 109 161 117 M161 117 L 166 113" stroke="#1b110e" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        </g>

        {/* rosy cheeks, smiling lower lids, nose, big smile */}
        <ellipse cx="99" cy="138" rx="10" ry="5.5" fill="#f28c9b" opacity="0.38" />
        <ellipse cx="161" cy="138" rx="10" ry="5.5" fill="#f28c9b" opacity="0.38" />
        <path d="M102 127.5 Q 109 130.5 116 127.5 M144 127.5 Q 151 130.5 158 127.5" stroke="#c98d6b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M127 134 Q 130 140 134 137" stroke="#c98d6b" strokeWidth="2" strokeLinecap="round" fill="none" />
        <g transform="translate(130 154) scale(0.85) translate(-130 -154)">
          <path d="M115 148 Q 130 151 145 148 Q 142 167 130 168 Q 118 167 115 148 Z" fill="#8f3443" />
          <path d="M117.5 149.5 Q 130 152.5 142.5 149.5 L 141.5 154.5 Q 130 157 118.5 154.5 Z" fill="#fff" />
          <ellipse cx="130" cy="163.5" rx="6.5" ry="3.2" fill="#e8798a" />
          <path d="M115 148 Q 130 151 145 148 Q 142 167 130 168 Q 118 167 115 148 Z" stroke="#c4766c" strokeWidth="1.4" fill="none" strokeLinejoin="round" />
          <path d="M112.5 146 Q 114 148.5 116 148.2 M147.5 146 Q 146 148.5 144 148.2" stroke="#c98d6b" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        </g>
      </g>
    </svg>
  );
}
