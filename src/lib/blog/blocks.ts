// Post content is stored as markdown-like text. The editor works on it as a list of
// text / image / video blocks; these helpers convert between the two forms.

import { isShortVideoUrl } from "../video";

export type TextBlock  = { id: string; type: "text";  content: string };
export type ImageBlock = {
  id: string;
  type: "image";
  src: string;
  size: "small" | "medium" | "full";
  align: "left" | "center" | "right";
  radius: "soft" | "round" | "square";
  caption: string;
};
export type VideoBlock = { id: string; type: "video"; src: string; layout: "wide" | "short" };
export type EditorBlock = TextBlock | ImageBlock | VideoBlock;

let _bid = 0;
export function uid() { return `b${++_bid}`; }

export function parseImageMeta(meta: string) {
  const parts = meta.split("|");
  const size = ["small", "medium", "full"].includes(parts[0]) ? parts[0] as ImageBlock["size"] : "full";
  const align = ["left", "center", "right"].includes(parts[1]) ? parts[1] as ImageBlock["align"] : "center";
  const radius = ["soft", "round", "square"].includes(parts[2]) ? parts[2] as ImageBlock["radius"] : "soft";
  const caption = parts[3] ? decodeURIComponent(parts.slice(3).join("|")) : "";
  return { size, align, radius, caption };
}

export function parseBlocks(content: string): EditorBlock[] {
  const result: EditorBlock[] = [];
  const pending: string[] = [];
  for (const raw of content.split("\n")) {
    const video = raw.trim().match(/^\[video(?::(short|wide))?\]\(([\s\S]+)\)$/);
    const image = raw.trim().match(/^!\[([^\]]*)\]\(([\s\S]+)\)$/);
    if (video) {
      if (pending.length) { result.push({ id: uid(), type: "text", content: pending.join("\n") }); pending.length = 0; }
      result.push({
        id: uid(),
        type: "video",
        layout: (video[1] as VideoBlock["layout"]) || (isShortVideoUrl(video[2]) ? "short" : "wide"),
        src: video[2]
      });
    } else if (image) {
      if (pending.length) { result.push({ id: uid(), type: "text", content: pending.join("\n") }); pending.length = 0; }
      result.push({ id: uid(), type: "image", src: image[2], ...parseImageMeta(image[1]) });
    } else {
      pending.push(raw);
    }
  }
  if (pending.length) result.push({ id: uid(), type: "text", content: pending.join("\n") });
  return result.length ? result : [{ id: uid(), type: "text", content: "" }];
}

export function serializeBlocks(blocks: EditorBlock[]): string {
  return blocks.map((b) => {
    if (b.type === "text") return b.content;
    if (b.type === "video") return `[video:${b.layout}](${b.src})`;
    const caption = b.caption.trim() ? `|${encodeURIComponent(b.caption.trim())}` : "";
    return `![${b.size}|${b.align}|${b.radius}${caption}](${b.src})`;
  }).join("\n");
}
