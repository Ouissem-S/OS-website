import { useState } from "react";
import type { ImageBlock } from "../../lib/blog/blocks";
import { CropModal } from "./CropModal";

export function ImageBlockEditor({ block, onChange, onDelete }: { block: ImageBlock; onChange: (b: ImageBlock) => void; onDelete: () => void }) {
  const [cropping, setCropping] = useState(false);
  return (
    <div className={`editor-img-block editor-img-block--${block.size} editor-img-block--${block.align}`}>
      <img src={block.src} alt="" />
      <div className="img-block-bar">
        <span className="img-control-group" aria-label="Image size">
          {(["small", "medium", "full"] as const).map((s) => (
            <button key={s} type="button" className={`size-btn${block.size === s ? " active" : ""}`} onClick={() => onChange({ ...block, size: s })}>
              {s === "small" ? "S" : s === "medium" ? "M" : "L"}
            </button>
          ))}
        </span>
        <span className="img-control-group" aria-label="Image alignment">
          {(["left", "center", "right"] as const).map((align) => (
            <button key={align} type="button" className={`size-btn${block.align === align ? " active" : ""}`} onClick={() => onChange({ ...block, align })}>
              {align === "left" ? "Left" : align === "center" ? "Mid" : "Right"}
            </button>
          ))}
        </span>
        <span className="img-control-group" aria-label="Image corners">
          {(["soft", "round", "square"] as const).map((radius) => (
            <button key={radius} type="button" className={`size-btn${block.radius === radius ? " active" : ""}`} onClick={() => onChange({ ...block, radius })}>
              {radius === "soft" ? "Soft" : radius === "round" ? "Round" : "Square"}
            </button>
          ))}
        </span>
        <button type="button" className="toolbar-btn" onClick={() => setCropping(true)}>Crop</button>
        <button type="button" className="icon-action danger" style={{ borderRadius: "8px", padding: "5px 9px" }} onClick={onDelete}>✕</button>
      </div>
      <input
        className="img-caption-input"
        value={block.caption}
        onChange={(e) => onChange({ ...block, caption: e.target.value })}
        placeholder="Optional caption"
      />
      {cropping && (
        <CropModal src={block.src} onApply={(src) => { onChange({ ...block, src }); setCropping(false); }} onCancel={() => setCropping(false)} />
      )}
    </div>
  );
}
