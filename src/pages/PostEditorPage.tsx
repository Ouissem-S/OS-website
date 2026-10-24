import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { ImageBlockEditor } from "../components/editor/ImageBlockEditor";
import { VideoBlockEditor } from "../components/editor/VideoBlockEditor";
import { SiteNav } from "../components/layout/SiteNav";
import { useOwner } from "../hooks/useOwner";
import { requestOwnerAccess } from "../lib/auth";
import {
  parseBlocks,
  serializeBlocks,
  uid,
  type EditorBlock,
  type ImageBlock,
  type TextBlock,
  type VideoBlock
} from "../lib/blog/blocks";
import { getPostsAsync, savePost } from "../lib/blog/storage";
import type { BlogPost } from "../lib/blog/types";
import { readFileAsDataURL, readImageAsCompressedDataURL } from "../lib/files";
import { createExcerpt, createPostId, dateInputValue } from "../lib/format";
import { navigate, navigateTo } from "../lib/router";
import { isShortVideoUrl, youtubeEmbedUrl } from "../lib/video";

export function PostEditorPage({ editId }: { editId?: string }) {
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
      <SiteNav />
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
