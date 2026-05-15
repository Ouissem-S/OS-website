import { useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { NetworkCanvas } from "./components/NetworkCanvas";
import { PostCard } from "./components/PostCard";
import { useBlogPosts } from "./hooks/useBlogPosts";
import { useOwner } from "./hooks/useOwner";
import {
  createExcerpt,
  deletePostById,
  formatDate,
  getPostsAsync,
  logoutOwner,
  readFileAsDataURL,
  readImageAsCompressedDataURL,
  requestOwnerAccess,
  savePost,
  type BlogPost
} from "./lib/blog";
import { navigate, navigateTo, normalisePath } from "./lib/router";

function dateInputValue(value?: string) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function createPostId() {
  return `post-${Date.now().toString(36).slice(-7)}`;
}

function useRoute() {
  const [route, setRoute] = useState(() => normalisePath(window.location.pathname));

  useEffect(() => {
    const sync = () => setRoute(normalisePath(window.location.pathname));
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    window.addEventListener("portfolio-route-change", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("portfolio-route-change", sync);
    };
  }, []);

  return route;
}

function HomePage() {
  const posts = useBlogPosts().slice(0, 3);

  return (
    <main className="portfolio-home" role="main">
      <nav className="home-nav" aria-label="Primary navigation">
        <a className="home-nav__active" href="./" onClick={navigateTo("/")}>
          Home
        </a>
        <a href="#/about" onClick={navigateTo("/about")}>
          About
        </a>
        <a href="#/blog" onClick={navigateTo("/blog")}>
          Blog
        </a>
        <a href="#/contact" onClick={navigateTo("/contact")}>
          Contact
        </a>
      </nav>

      <section className="hero-showcase" aria-labelledby="home-title">
        <div className="hero-content">
          <div className="hero-text">
            <h1 id="home-title">
              I'm <span>Ouissem</span>,
              <br />
              Computer Science with AI Student
            </h1>

            <p className="hero-copy">
              I build thoughtful AI-driven software, explore language models, and write about the ideas I am learning
              along the way.
            </p>
          </div>

          <figure className="hero-portrait" aria-label="Ouissem Salag">
            <span className="portrait-arch" />
            <img src={`${import.meta.env.BASE_URL}profile.png`} alt="Ouissem Salag" />
          </figure>
        </div>
      </section>

      <section className="home-blog" aria-labelledby="latest-posts-heading">
        <div className="home-blog__heading">
          <div>
            <p className="eyebrow">Latest writing</p>
            <h2 id="latest-posts-heading">Blog dashboard</h2>
          </div>
          <a className="text-link" href="#/blog" onClick={navigateTo("/blog")}>
            View all posts
          </a>
        </div>

        <div className="post-list home-blog__grid">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}

function Topbar() {
  const route = useRoute();
  const active = route.startsWith("/post/") || route.startsWith("/edit/") || route === "/new" ? "/blog" : route;

  return (
    <nav className="home-nav page-nav" aria-label="Primary navigation">
      <a className={active === "/" ? "home-nav__active" : undefined} href="./" onClick={navigateTo("/")}>
        Home
      </a>
      <a className={active === "/about" ? "home-nav__active" : undefined} href="#/about" onClick={navigateTo("/about")}>
        About
      </a>
      <a className={active === "/blog" ? "home-nav__active" : undefined} href="#/blog" onClick={navigateTo("/blog")}>
        Blog
      </a>
      <a className={active === "/contact" ? "home-nav__active" : undefined} href="#/contact" onClick={navigateTo("/contact")}>
        Contact
      </a>
    </nav>
  );
}

function ContactLinks() {
  const icons = {
    linkedin: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.94 8.98H3.72V20h3.22V8.98ZM7.2 5.58a1.86 1.86 0 1 0-3.72 0 1.86 1.86 0 0 0 3.72 0ZM20.52 13.68c0-3.12-1.66-4.96-4.26-4.96-1.62 0-2.62.9-3.02 1.54V8.98h-3.1V20h3.22v-5.46c0-1.44.28-2.84 2.06-2.84 1.76 0 1.78 1.64 1.78 2.94V20h3.22l.1-6.32Z" />
      </svg>
    ),
    github: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.25a9.75 9.75 0 0 0-3.08 19c.48.08.66-.2.66-.46v-1.72c-2.7.58-3.26-1.16-3.26-1.16-.44-1.12-1.08-1.42-1.08-1.42-.88-.6.06-.58.06-.58.98.06 1.5 1 1.5 1 .86 1.48 2.28 1.06 2.82.8.1-.62.34-1.06.62-1.3-2.14-.24-4.4-1.08-4.4-4.78 0-1.06.38-1.92 1-2.6-.1-.26-.44-1.3.1-2.72 0 0 .82-.26 2.68 1a9.18 9.18 0 0 1 4.88 0c1.86-1.26 2.68-1 2.68-1 .54 1.42.2 2.46.1 2.72.62.68 1 1.54 1 2.6 0 3.72-2.26 4.54-4.42 4.78.36.32.68.92.68 1.86v2.76c0 .26.18.54.68.46A9.75 9.75 0 0 0 12 2.25Z" />
      </svg>
    ),
    email: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4.75 5.5h14.5c1.24 0 2.25 1.01 2.25 2.25v8.5a2.25 2.25 0 0 1-2.25 2.25H4.75a2.25 2.25 0 0 1-2.25-2.25v-8.5c0-1.24 1.01-2.25 2.25-2.25Zm0 2.08v.28l7.25 4.4 7.25-4.4v-.28H4.75Zm14.5 8.84V10.3l-6.66 4.04a1.12 1.12 0 0 1-1.18 0L4.75 10.3v6.12h14.5Z" />
      </svg>
    )
  };

  return (
    <div className="contact-grid">
      <a href="https://www.linkedin.com/in/ouissem-salag/?trk=public-profile-join-page">
        <i>{icons.linkedin}</i>
        <span>LinkedIn</span>
        <strong>Professional profile</strong>
      </a>
      <a href="https://github.com/ouissemsalag">
        <i>{icons.github}</i>
        <span>GitHub</span>
        <strong>Code and repositories</strong>
      </a>
      <a href="mailto:ouissemsalag@gmail.com">
        <i>{icons.email}</i>
        <span>Email</span>
        <strong>ouissemsalag@gmail.com</strong>
      </a>
    </div>
  );
}

function AboutPage() {
  return (
    <>
      <Topbar />
      <main className="page-shell narrow" role="main">
        <section className="modern-page-card">
          <p className="eyebrow">About me</p>
          <h1>Ouissem Salag</h1>
          <div className="prose">
            <p>
              I am a Computer Science with Artificial Intelligence student at the University of Nottingham, focusing on
              AI-driven software and modern application development.
            </p>
            <p>
              I like working on software that combines language models, APIs, and clean design to create systems that
              feel intuitive and intelligent. I am particularly interested in LLMs, NLP, AI agents, and adaptive,
              user-centered experiences.
            </p>
            <p>
              I enjoy the extra steps that make a build feel complete: clear structure, thoughtful interaction, and
              details that make the experience feel finished rather than merely functional.
            </p>
          </div>
          <ContactLinks />
        </section>
      </main>
    </>
  );
}

function ContactPage() {
  return (
    <>
      <Topbar />
      <main className="page-shell narrow" role="main">
        <section className="modern-page-card">
          <p className="eyebrow">Contact</p>
          <h1>Let's connect</h1>
          <p className="lead">
            Find me on LinkedIn, see my code on GitHub, or email me directly.
          </p>
          <ContactLinks />
        </section>
      </main>
    </>
  );
}

function BlogPage() {
  const posts = useBlogPosts();
  const owner = useOwner();
  const [featuredPost, ...morePosts] = posts;
  const sidebarPosts = posts.slice(0, 4);

  const deletePost = (id: string) => {
    if (!window.confirm("Delete this post?")) return;
    void deletePostById(id);
  };
  const editPost = (id: string) => navigate(`/edit/${encodeURIComponent(id)}`);

  return (
    <>
      <Topbar />
      <main className="blog-shell" role="main">
        <section className="blog-landing" aria-labelledby="blog-title">
          <p className="eyebrow">AI, robotics, software</p>
          <h1 id="blog-title">Inside my head, the ideas live here.</h1>
          <p className="lead">
            Notes on artificial intelligence, robotics, software engineering, and the technologies shaping what comes
            next.
          </p>
          <div className="blog-actions-inline">
            {owner ? (
              <a className="primary-button" href="#/new" onClick={navigateTo("/new")}>
                New post
              </a>
            ) : (
              <button className="ghost-button" type="button" onClick={requestOwnerAccess}>
                Owner
              </button>
            )}
          </div>
          {owner ? (
            <button className="text-link blog-logout" type="button" onClick={logoutOwner}>
              Log out of owner mode
            </button>
          ) : null}
        </section>

        <section className="blog-magazine" aria-labelledby="posts-heading">
          <div className="blog-main">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Published posts</p>
                <h2 id="posts-heading">Latest entries</h2>
              </div>
              {owner ? <span className="admin-chip">Owner mode</span> : null}
            </div>

            {featuredPost ? (
              <div className="featured-post">
                <PostCard
                  post={featuredPost}
                  onDelete={owner ? deletePost : undefined}
                  onEdit={owner ? editPost : undefined}
                />
              </div>
            ) : (
              <div className="empty-state">No posts yet.</div>
            )}

            <div className="post-list blog-card-grid">
              {morePosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={owner ? deletePost : undefined}
                  onEdit={owner ? editPost : undefined}
                />
              ))}
            </div>
          </div>

          <aside className="blog-sidebar" aria-label="Featured posts">
            <h3>Featured</h3>
            {sidebarPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </aside>
        </section>
      </main>
    </>
  );
}

function renderPostMedia(post: BlogPost) {
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

function renderVideoPlayer(src: string, layout: "wide" | "short", key?: string | number) {
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

function renderRichPost(content: string) {
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

function youtubeEmbedUrl(url: string) {
  if (!url.trim()) return "";
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");
    if (parsed.hostname.includes("youtube.com")) {
      const pathParts = parsed.pathname.split("/").filter(Boolean);
      const shortsIndex = pathParts.indexOf("shorts");
      if (shortsIndex !== -1 && pathParts[shortsIndex + 1]) {
        return `https://www.youtube.com/embed/${pathParts[shortsIndex + 1]}`;
      }
      if (pathParts[0] === "embed" && pathParts[1]) {
        return `https://www.youtube.com/embed/${pathParts[1]}`;
      }
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (host.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${parsed.pathname.replace("/", "")}`;
    }
    return url;
  } catch {
    return url;
  }
}

function isShortVideoUrl(url: string) {
  try {
    return new URL(url).pathname.includes("/shorts/");
  } catch {
    return false;
  }
}

// ─── block editor ────────────────────────────────────────────────────────────

type TextBlock  = { id: string; type: "text";  content: string };
type ImageBlock = {
  id: string;
  type: "image";
  src: string;
  size: "small" | "medium" | "full";
  align: "left" | "center" | "right";
  radius: "soft" | "round" | "square";
  caption: string;
};
type VideoBlock = { id: string; type: "video"; src: string; layout: "wide" | "short" };
type EditorBlock = TextBlock | ImageBlock | VideoBlock;
type CropRect = { x: number; y: number; w: number; h: number };

let _bid = 0;
function uid() { return `b${++_bid}`; }

function parseImageMeta(meta: string) {
  const parts = meta.split("|");
  const size = ["small", "medium", "full"].includes(parts[0]) ? parts[0] as ImageBlock["size"] : "full";
  const align = ["left", "center", "right"].includes(parts[1]) ? parts[1] as ImageBlock["align"] : "center";
  const radius = ["soft", "round", "square"].includes(parts[2]) ? parts[2] as ImageBlock["radius"] : "soft";
  const caption = parts[3] ? decodeURIComponent(parts.slice(3).join("|")) : "";
  return { size, align, radius, caption };
}

function parseBlocks(content: string): EditorBlock[] {
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

function serializeBlocks(blocks: EditorBlock[]): string {
  return blocks.map((b) => {
    if (b.type === "text") return b.content;
    if (b.type === "video") return `[video:${b.layout}](${b.src})`;
    const caption = b.caption.trim() ? `|${encodeURIComponent(b.caption.trim())}` : "";
    return `![${b.size}|${b.align}|${b.radius}${caption}](${b.src})`;
  }).join("\n");
}

function CropModal({ src, onApply, onCancel }: { src: string; onApply: (url: string) => void; onCancel: () => void }) {
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

function ImageBlockEditor({ block, onChange, onDelete }: { block: ImageBlock; onChange: (b: ImageBlock) => void; onDelete: () => void }) {
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

function VideoBlockEditor({
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

// ─────────────────────────────────────────────────────────────────────────────

function NewPostPage({ editId }: { editId?: string }) {
  const owner = useOwner();
  const prompted = useRef(false);
  const [loadedPost, setLoadedPost] = useState<BlogPost | undefined>();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("AI + Robotics");
  const [publishDate, setPublishDate] = useState(() => dateInputValue());
  const [location, setLocation] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [blocks, setBlocks] = useState<EditorBlock[]>([{ id: uid(), type: "text", content: "" }]);
  const [coverImage, setCoverImage] = useState<File | undefined>();
  const [coverPreview, setCoverPreview] = useState("");
  const [coverVideo, setCoverVideo] = useState<File | undefined>();
  const [embedUrl, setEmbedUrl] = useState("");
  const [editorError, setEditorError] = useState("");
  const addImageRef = useRef<HTMLInputElement>(null);
  const addVideoRef = useRef<HTMLInputElement>(null);
  const activeTA = useRef<HTMLTextAreaElement | null>(null);
  const activeIdx = useRef(0);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    const id = setTimeout(() => { document.addEventListener("mousedown", close); document.addEventListener("keydown", onKey); }, 0);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", close); document.removeEventListener("keydown", onKey); };
  }, [contextMenu]);

  useEffect(() => {
    let active = true;
    if (!editId) {
      setLoadedPost(undefined);
      return;
    }

    void getPostsAsync().then((posts) => {
      if (active) setLoadedPost(posts.find((post) => post.id === editId));
    });

    return () => {
      active = false;
    };
  }, [editId]);

  useEffect(() => {
    if (!loadedPost) return;
    setTitle(loadedPost.title);
    setCategory(loadedPost.category || "AI + Robotics");
    setPublishDate(dateInputValue(loadedPost.date));
    setLocation(loadedPost.location || "");
    setExcerpt(loadedPost.excerpt);
    setBlocks(parseBlocks(loadedPost.content));
    setCoverPreview(loadedPost.image || "");
    setEmbedUrl(loadedPost.media?.type === "embed" ? loadedPost.media.url : "");
  }, [loadedPost]);

  useEffect(() => {
    if (owner || prompted.current) return;
    prompted.current = true;
    if (!requestOwnerAccess()) navigate("/blog");
  }, [owner]);

  const addImageBlock = async (file?: File) => {
    if (!file) return;
    setEditorError("");
    try {
      const src = await readImageAsCompressedDataURL(file, 1400, 0.92);
      const imageBlock: ImageBlock = {
        id: uid(),
        type: "image",
        src,
        size: "full",
        align: "center",
        radius: "soft",
        caption: ""
      };
      const ta = activeTA.current;
      const idx = activeIdx.current;
      if (ta) {
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        setBlocks((prev) => {
          const current = prev[idx];
          if (!current || current.type !== "text") return [...prev, imageBlock];
          const before = current.content.slice(0, start).trimEnd();
          const after = current.content.slice(end).trimStart();
          const nextBlocks: EditorBlock[] = [];
          if (before) nextBlocks.push({ ...current, content: before });
          nextBlocks.push(imageBlock);
          nextBlocks.push({ id: uid(), type: "text", content: after });
          return [...prev.slice(0, idx), ...nextBlocks, ...prev.slice(idx + 1)];
        });
      } else {
        setBlocks(prev => [...prev, imageBlock]);
      }
    } catch {
      setEditorError("Could not process this image.");
    }
    if (addImageRef.current) addImageRef.current.value = "";
  };

  const insertVideo = () => {
    const url = window.prompt("Video URL (YouTube, Shorts, or direct link):");
    if (!url?.trim()) return;
    const cleanUrl = url.trim();
    const videoBlock: VideoBlock = {
      id: uid(),
      type: "video",
      src: cleanUrl,
      layout: isShortVideoUrl(cleanUrl) ? "short" : "wide"
    };
    const ta = activeTA.current;
    const idx = activeIdx.current;
    if (ta) {
      insertBlockAtTextSelection(videoBlock, ta, idx);
      return;
    }
    setBlocks(prev => [...prev, videoBlock, { id: uid(), type: "text", content: "" }]);
  };

  const insertTextAtSelection = (text: string) => {
    const ta = activeTA.current;
    const idx = activeIdx.current;
    if (!ta) {
      setBlocks((prev) => {
        const last = prev[prev.length - 1];
        if (last?.type === "text") return [...prev.slice(0, -1), { ...last, content: `${last.content}\n${text}` }];
        return [...prev, { id: uid(), type: "text", content: text }];
      });
      return;
    }

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    setBlocks((prev) => prev.map((block, blockIndex) => {
      if (blockIndex !== idx || block.type !== "text") return block;
      return { ...block, content: block.content.slice(0, start) + text + block.content.slice(end) };
    }));
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + text.length, start + text.length);
    });
  };

  const insertTable = () => {
    insertTextAtSelection("\n| Heading | Notes |\n| --- | --- |\n| Example | Add details here |\n| Example | Add details here |\n");
  };

  const insertBlockAtTextSelection = (newBlock: ImageBlock | VideoBlock, ta: HTMLTextAreaElement, idx: number) => {
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    setBlocks((prev) => {
      const current = prev[idx];
      if (!current || current.type !== "text") return [...prev, newBlock, { id: uid(), type: "text", content: "" }];
      const before = current.content.slice(0, start).trimEnd();
      const after = current.content.slice(end).trimStart();
      const nextBlocks: EditorBlock[] = [];
      if (before) nextBlocks.push({ ...current, content: before });
      nextBlocks.push(newBlock);
      nextBlocks.push({ id: uid(), type: "text", content: after });
      return [...prev.slice(0, idx), ...nextBlocks, ...prev.slice(idx + 1)];
    });
  };

  const addVideoFile = async (file?: File) => {
    if (!file) return;
    setEditorError("");
    if (file.size > 4_000_000) {
      setEditorError("This video is large. If publishing fails, use a shorter clip or an embed link.");
    }
    try {
      const src = await readFileAsDataURL(file);
      const videoBlock: VideoBlock = { id: uid(), type: "video", src, layout: "short" };
      const ta = activeTA.current;
      const idx = activeIdx.current;
      if (ta) {
        insertBlockAtTextSelection(videoBlock, ta, idx);
      } else {
        setBlocks(prev => [...prev, videoBlock, { id: uid(), type: "text", content: "" }]);
      }
    } catch {
      setEditorError("Could not add this video.");
    }
    if (addVideoRef.current) addVideoRef.current.value = "";
  };

  const applyFormat = (prefix: string) => {
    setContextMenu(null);
    const ta = activeTA.current;
    const idx = activeIdx.current;
    if (!ta) return;
    const block = blocks[idx];
    if (!block || block.type !== "text") return;
    const bc = block.content;
    const s = ta.selectionStart, e = ta.selectionEnd;
    if (prefix === "---") {
      const ins = "\n---\n";
      const nc = bc.slice(0, s) + ins + bc.slice(e);
      setBlocks(prev => prev.map((b, i) => i === idx ? { ...b, content: nc } as TextBlock : b));
      requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s + ins.length, s + ins.length); });
      return;
    }
    const ls = bc.lastIndexOf("\n", s - 1) + 1;
    const lei = bc.indexOf("\n", e);
    const le = lei === -1 ? bc.length : lei;
    const prefixed = bc.slice(ls, le).split("\n").map(l => prefix + l).join("\n");
    const nc = bc.slice(0, ls) + prefixed + bc.slice(le);
    setBlocks(prev => prev.map((b, i) => i === idx ? { ...b, content: nc } as TextBlock : b));
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(ls, ls + prefixed.length); });
  };

  const handleContextMenu = (e: MouseEvent<HTMLTextAreaElement>, idx: number) => {
    e.preventDefault();
    activeTA.current = e.currentTarget;
    activeIdx.current = idx;
    setContextMenu({ x: Math.min(e.clientX, window.innerWidth - 168), y: Math.min(e.clientY, window.innerHeight - 220) });
  };

  const publish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanContent = serializeBlocks(blocks).trim();
    if (!cleanTitle || !cleanContent) { setEditorError("Title and post content are required."); return; }
    setEditorError("");
    let imageData = "";
    try { imageData = await readImageAsCompressedDataURL(coverImage); }
    catch (err) { setEditorError(err instanceof Error ? err.message : "Cover image failed."); return; }
    const videoData = await readFileAsDataURL(coverVideo);
    const embed = youtubeEmbedUrl(embedUrl);
    const post: BlogPost = {
      id: loadedPost?.id ?? createPostId(),
      title: cleanTitle, category: category.trim(),
      excerpt: excerpt.trim() || createExcerpt(cleanContent),
      content: cleanContent,
      image: imageData || loadedPost?.image || "",
      media: videoData ? { type: "video", url: videoData } : embed ? { type: "embed", url: embed } : imageData ? { type: "image", url: imageData } : loadedPost?.media,
      date: publishDate || dateInputValue(loadedPost?.date),
      location: location.trim() || undefined
    };
    try { await savePost(post); navigate("/blog"); }
    catch (err) { setEditorError(err instanceof Error ? err.message : "Failed to save post to GitHub. Check your token and try again."); }
  };

  const updateCover = async (file?: File) => {
    setCoverImage(file); setCoverPreview(""); setEditorError("");
    if (!file) return;
    if (file.size > 3_000_000) setEditorError("Large image — will compress it.");
    try { setCoverPreview(await readImageAsCompressedDataURL(file, 900, 0.78)); }
    catch { setEditorError("Cannot preview this image. Export as JPEG or PNG and try again."); }
  };

  return (
    <>
      <Topbar />
      <main className="page-shell narrow" role="main">
        <section className="editor-card" aria-labelledby="editor-title">
          <p className="eyebrow">Owner workspace</p>
          <h1 id="editor-title">{loadedPost ? "Edit post" : "Create a new post"}</h1>
          <input ref={addImageRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }}
            onChange={(e) => void addImageBlock(e.target.files?.[0])} />
          <input ref={addVideoRef} type="file" accept="video/*" style={{ display: "none" }}
            onChange={(e) => void addVideoFile(e.target.files?.[0])} />
          <form className="post-form" onSubmit={publish}>
            <label><span>Title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
            <label><span>Category</span>
              <input value={category} onChange={(e) => setCategory(e.target.value)} />
            </label>
            <div className="media-field-grid">
              <label><span>Publish date</span>
                <input type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} />
              </label>
              <label><span>Location</span>
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Nottingham, UK" />
              </label>
            </div>
            <label><span>Excerpt</span>
              <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
            </label>
            <div className="post-form-field">
              <span className="post-form-label">Post</span>
              <div className="editor-toolbar">
                <button type="button" className="toolbar-btn" onClick={() => addImageRef.current?.click()}>+ Image</button>
                <button type="button" className="toolbar-btn" onClick={() => addVideoRef.current?.click()}>+ Video file</button>
                <button type="button" className="toolbar-btn" onClick={insertVideo}>+ Video URL</button>
                <button type="button" className="toolbar-btn" onClick={insertTable}>+ Table</button>
                <span className="toolbar-hint">Images upload from your computer. Right-click text for headings, dividers, quotes, and bullets.</span>
              </div>
              <div className="block-editor">
                {blocks.map((block, i) =>
                  block.type === "text" ? (
                    <textarea key={block.id} className="block-textarea"
                      value={block.content}
                      placeholder={i === 0 ? "Write your post here..." : "Continue writing..."}
                      onChange={(e) => setBlocks(prev => prev.map((b, j) => j === i ? { ...b, content: e.target.value } as TextBlock : b))}
                      onFocus={(e) => { activeTA.current = e.currentTarget; activeIdx.current = i; }}
                      onContextMenu={(e) => handleContextMenu(e, i)}
                    />
                  ) : block.type === "image" ? (
                    <ImageBlockEditor key={block.id} block={block}
                      onChange={(updated) => setBlocks(prev => prev.map((b, j) => j === i ? updated : b))}
                      onDelete={() => setBlocks(prev => prev.filter((_, j) => j !== i))}
                    />
                  ) : (
                    <VideoBlockEditor key={block.id} block={block}
                      onChange={(updated) => setBlocks(prev => prev.map((b, j) => j === i ? updated : b))}
                      onDelete={() => setBlocks(prev => prev.filter((_, j) => j !== i))}
                    />
                  )
                )}
              </div>
            </div>
            <div className="media-field-grid">
              <label><span>Cover image</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => void updateCover(e.target.files?.[0])} />
              </label>
              <label><span>Cover video</span>
                <input type="file" accept="video/*" onChange={(e) => setCoverVideo(e.target.files?.[0])} />
              </label>
            </div>
            <label>
              <span>Embed URL</span>
              <input value={embedUrl} onChange={(e) => setEmbedUrl(e.target.value)} placeholder="YouTube or interactive embed URL" />
            </label>
            {coverPreview ? <img className="editor-preview" src={coverPreview} alt="Cover preview" /> : null}
            {editorError ? <p className="editor-error">{editorError}</p> : null}
            <div className="form-actions">
              <a className="ghost-button" href="#/blog" onClick={navigateTo("/blog")}>
                Cancel
              </a>
              <button className="primary-button" type="submit">
                {loadedPost ? "Save changes" : "Publish"}
              </button>
            </div>
          </form>
        </section>
      </main>
      {contextMenu && (
        <div
          className="format-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button type="button" onClick={() => applyFormat("## ")}>H2 Heading</button>
          <button type="button" onClick={() => applyFormat("### ")}>H3 Heading</button>
          <button type="button" onClick={() => applyFormat("---")}>― Divider</button>
          <button type="button" onClick={() => applyFormat("> ")}>❝ Quote</button>
          <button type="button" onClick={() => applyFormat("- ")}>• Bullet</button>
        </div>
      )}
    </>
  );
}

function ViewPostPage({ id }: { id: string }) {
  const posts = useBlogPosts();
  const [freshPosts, setFreshPosts] = useState<BlogPost[] | null>(null);
  const [checkedPosts, setCheckedPosts] = useState(false);
  const post = useMemo(() => (freshPosts ?? posts).find((item) => item.id === id || item.legacyId === id), [freshPosts, id, posts]);

  useEffect(() => {
    let active = true;
    setFreshPosts(null);
    setCheckedPosts(false);
    void getPostsAsync().then((updatedPosts) => {
      if (!active) return;
      setFreshPosts(updatedPosts);
      setCheckedPosts(true);
    });
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <>
      <Topbar />
      <main className="page-shell narrow" role="main">
        {post ? (
          <article className="post-view">
            <div className="post-view__topline">
              <p className="eyebrow">{post.category}</p>
              <p className="post-view__meta">{[post.location, formatDate(post.date)].filter(Boolean).join(" • ")}</p>
            </div>
            <h1>{post.title}</h1>
            {renderPostMedia(post)}
            <div className="post-view__content">
              {renderRichPost(post.content)}
            </div>
            <a className="text-link" href="#/blog" onClick={navigateTo("/blog")}>
              Back to blog
            </a>
          </article>
        ) : checkedPosts ? (
          <section className="editor-card">
            <h1>Post not found</h1>
            <p>This post may have been deleted or the link may be incorrect.</p>
            <a className="primary-button" href="#/blog" onClick={navigateTo("/blog")}>
              Back to blog
            </a>
          </section>
        ) : (
          <section className="editor-card">
            <p className="eyebrow">Loading post</p>
            <h1>Opening post...</h1>
          </section>
        )}
      </main>
    </>
  );
}

export function App() {
  const route = useRoute();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [route]);

  let page = <HomePage />;
  if (route === "/about") page = <AboutPage />;
  if (route === "/contact") page = <ContactPage />;
  if (route === "/blog") page = <BlogPage />;
  if (route === "/new") page = <NewPostPage />;
  if (route.startsWith("/edit/")) page = <NewPostPage editId={decodeURIComponent(route.replace("/edit/", ""))} />;
  if (route.startsWith("/post/")) page = <ViewPostPage id={decodeURIComponent(route.replace("/post/", ""))} />;

  return (
    <>
      <NetworkCanvas />
      {page}
      <footer className="site-footer">Copyright © Ouissem Salag 2026</footer>
    </>
  );
}
