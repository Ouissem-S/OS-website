import { useEffect, useRef, useState } from "react";

type CropRect = { x: number; y: number; w: number; h: number };

export function CropModal({ src, onApply, onCancel }: { src: string; onApply: (url: string) => void; onCancel: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<CropRect>({ x: 5, y: 5, w: 90, h: 90 });
  const dragRef = useRef<{ handle: string; ox: number; oy: number; r: CropRect } | null>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d || !stageRef.current) return;
      const b = stageRef.current.getBoundingClientRect();
      const px = ((e.clientX - b.left) / b.width) * 100;
      const py = ((e.clientY - b.top) / b.height) * 100;
      const dx = px - d.ox, dy = py - d.oy;
      const { x, y, w, h } = d.r;
      const cl = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
      let nr: CropRect;
      if (d.handle === "body") {
        nr = { x: cl(x + dx, 0, 100 - w), y: cl(y + dy, 0, 100 - h), w, h };
      } else if (d.handle === "tl") {
        const nx = cl(x + dx, 0, x + w - 10), ny = cl(y + dy, 0, y + h - 10);
        nr = { x: nx, y: ny, w: x + w - nx, h: y + h - ny };
      } else if (d.handle === "tr") {
        const ny = cl(y + dy, 0, y + h - 10);
        nr = { x, y: ny, w: cl(w + dx, 10, 100 - x), h: y + h - ny };
      } else if (d.handle === "bl") {
        const nx = cl(x + dx, 0, x + w - 10);
        nr = { x: nx, y, w: x + w - nx, h: cl(h + dy, 10, 100 - y) };
      } else {
        nr = { x, y, w: cl(w + dx, 10, 100 - x), h: cl(h + dy, 10, 100 - y) };
      }
      dragRef.current = { ...d, ox: px, oy: py, r: nr };
      setRect(nr);
    };
    const onUp = () => { dragRef.current = null; };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    return () => { document.removeEventListener("pointermove", onMove); document.removeEventListener("pointerup", onUp); };
  }, []);

  const startDrag = (handle: string) => (e: { clientX: number; clientY: number; preventDefault(): void; stopPropagation(): void }) => {
    e.preventDefault(); e.stopPropagation();
    if (!stageRef.current) return;
    const b = stageRef.current.getBoundingClientRect();
    dragRef.current = { handle, ox: ((e.clientX - b.left) / b.width) * 100, oy: ((e.clientY - b.top) / b.height) * 100, r: { ...rect } };
  };

  const applyCrop = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const cx = (rect.x / 100) * img.width, cy = (rect.y / 100) * img.height;
      const cw = (rect.w / 100) * img.width, ch = (rect.h / 100) * img.height;
      canvas.width = Math.round(cw); canvas.height = Math.round(ch);
      canvas.getContext("2d")!.drawImage(img, cx, cy, cw, ch, 0, 0, canvas.width, canvas.height);
      onApply(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.src = src;
  };

  return (
    <div className="crop-overlay-bg" onPointerDown={onCancel}>
      <div className="crop-modal" onPointerDown={(e) => e.stopPropagation()}>
        <p className="eyebrow">Drag the box or pull corners to crop</p>
        <div ref={stageRef} className="crop-stage">
          <img src={src} className="crop-img" alt="" draggable={false} />
          <div
            className="crop-rect"
            style={{ left: `${rect.x}%`, top: `${rect.y}%`, width: `${rect.w}%`, height: `${rect.h}%` }}
            onPointerDown={startDrag("body")}
          >
            {(["tl", "tr", "bl", "br"] as const).map((h) => (
              <span key={h} className={`crop-handle crop-handle--${h}`} onPointerDown={startDrag(h)} />
            ))}
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="ghost-button" onClick={onCancel}>Cancel</button>
          <button type="button" className="primary-button" onClick={applyCrop}>Apply crop</button>
        </div>
      </div>
    </div>
  );
}
