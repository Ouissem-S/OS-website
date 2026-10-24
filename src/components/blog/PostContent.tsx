import { parseImageMeta } from "../../lib/blog/blocks";
import type { BlogPost } from "../../lib/blog/types";
import { renderVideoPlayer } from "./VideoPlayer";

export function renderPostMedia(post: BlogPost) {
  if (post.media?.type === "video") {
    return <video className="post-view__image" src={post.media.url} controls />;
  }

  if (post.media?.type === "embed") {
    return (
      <div className="post-embed">
        <iframe src={post.media.url} title={post.title} allowFullScreen />
      </div>
    );
  }

  if (post.image) {
    return <img className="post-view__image" src={post.image} alt="" />;
  }

  return null;
}

export function renderRichPost(content: string) {
  const lines = content.split("\n").map((line) => line.trim()).filter(Boolean);
  const elements = [];

  const tableCells = (line: string) => line.replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
  const isTableSeparator = (line: string) => /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line);
  const imageFromLine = (line: string) => {
    const match = line.match(/^!\[(.*?)\]\(([\s\S]+)\)$/);
    if (!match) return null;
    return { meta: parseImageMeta(match[1]), src: match[2] };
  };

  const renderFigure = (image: NonNullable<ReturnType<typeof imageFromLine>>, key: string) => (
    <figure
      key={key}
      className={`post-inline-figure post-inline-figure--${image.meta.size} post-inline-figure--${image.meta.align}`}
    >
      <img className={`post-inline-image post-inline-image--${image.meta.radius}`} src={image.src} alt="" />
      {image.meta.caption ? <figcaption>{image.meta.caption}</figcaption> : null}
    </figure>
  );

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const image = imageFromLine(line);

    if (line.startsWith("|") && lines[index + 1] && isTableSeparator(lines[index + 1])) {
      const headers = tableCells(line);
      const rows = [];
      index += 2;

      while (index < lines.length && lines[index].startsWith("|")) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      index -= 1;

      elements.push(
        <div key={`table-${index}`} className="post-table-wrap">
          <table className="post-table">
            <thead>
              <tr>{headers.map((header, headerIndex) => <th key={headerIndex}>{header}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((_, cellIndex) => <td key={cellIndex}>{row[cellIndex] || ""}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    if (image) {
      const imageRow = [image];
      while (image.meta.size === "small" && index + 1 < lines.length) {
        const nextImage = imageFromLine(lines[index + 1]);
        if (!nextImage || nextImage.meta.size !== "small") break;
        imageRow.push(nextImage);
        index += 1;
      }

      if (imageRow.length > 1) {
        elements.push(
          <div key={`row-${index}`} className="post-image-row">
            {imageRow.map((item, itemIndex) => renderFigure(item, `image-${index}-${itemIndex}`))}
          </div>
        );
      } else {
        elements.push(renderFigure(image, `image-${index}`));
      }
      continue;
    }

    if (/^-{3,}/.test(line)) elements.push(<hr key={index} />);
    else if (line.startsWith("### ")) elements.push(<h3 key={index}>{line.slice(4)}</h3>);
    else if (line.startsWith("## ")) elements.push(<h2 key={index}>{line.slice(3)}</h2>);
    else if (line.startsWith("> ")) elements.push(<blockquote key={index}>{line.slice(2)}</blockquote>);
    else if (line.startsWith("- ")) elements.push(<li key={index}>{line.slice(2)}</li>);
    else if (line.startsWith("[video")) {
      const match = line.match(/^\[video(?::(short|wide))?\]\(([\s\S]+)\)$/);
      if (match) {
        elements.push(renderVideoPlayer(match[2], (match[1] as "short" | "wide") || "wide", index));
      }
    } else {
      elements.push(<p key={index}>{line}</p>);
    }
  }

  return elements;
}
