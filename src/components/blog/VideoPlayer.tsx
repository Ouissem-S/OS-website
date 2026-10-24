import { isShortVideoUrl, youtubeEmbedUrl } from "../../lib/video";

export function renderVideoPlayer(src: string, layout: "wide" | "short", key?: string | number) {
  const embed = youtubeEmbedUrl(src);
  const isEmbed = embed.includes("youtube.com/embed/");
  const playerClass = layout === "short" || isShortVideoUrl(src) ? "post-embed post-embed--short" : "post-embed";

  if (isEmbed) {
    return (
      <div key={key} className={playerClass}>
        <iframe src={embed} title="Video" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
      </div>
    );
  }

  return (
    <div key={key} className={playerClass}>
      <video src={src} controls playsInline preload="metadata" />
    </div>
  );
}
