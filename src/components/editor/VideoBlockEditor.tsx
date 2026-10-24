import type { VideoBlock } from "../../lib/blog/blocks";
import { renderVideoPlayer } from "../blog/VideoPlayer";

export function VideoBlockEditor({
  block,
  onChange,
  onDelete
}: {
  block: VideoBlock;
  onChange: (block: VideoBlock) => void;
  onDelete: () => void;
}) {
  const previewClass = `editor-video-block editor-video-block--${block.layout}`;

  return (
    <div className={previewClass}>
      {renderVideoPlayer(block.src, block.layout)}
      <div className="img-block-bar">
        <span className="img-control-group" aria-label="Video shape">
          {(["short", "wide"] as const).map((layout) => (
            <button
              key={layout}
              type="button"
              className={`size-btn${block.layout === layout ? " active" : ""}`}
              onClick={() => onChange({ ...block, layout })}
            >
              {layout === "short" ? "Short" : "Wide"}
            </button>
          ))}
        </span>
        <button type="button" className="icon-action danger" style={{ borderRadius: "8px", padding: "5px 9px" }} onClick={onDelete}>✕</button>
      </div>
    </div>
  );
}
