import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { readFileAsDataURL, readImageAsCompressedDataURL } from "../../lib/files";
import { guessMediaType, saveProjectCover, type ProjectCover } from "../../lib/projectCovers";

const MAX_VIDEO_BYTES = 25_000_000;

export function ProjectCoverEditor({
  repoName,
  current,
  onClose
}: {
  repoName: string;
  current?: ProjectCover;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<ProjectCover | null>(current ?? null);
  const [link, setLink] = useState("");
  const [status, setStatus] = useState<"idle" | "reading" | "saving">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pickFile = async (file?: File) => {
    if (!file) return;
    setError("");
    setStatus("reading");
    try {
      if (file.type.startsWith("video/")) {
        if (file.size > MAX_VIDEO_BYTES) throw new Error("That video is over 25 MB. Try a shorter clip.");
        setDraft({ type: "video", url: await readFileAsDataURL(file) });
      } else {
        setDraft({ type: "image", url: await readImageAsCompressedDataURL(file, 1400, 0.85) });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that file.");
    }
    setStatus("idle");
  };

  const useLink = () => {
    const url = link.trim();
    if (!url) return;
    setDraft({ type: guessMediaType(url), url });
    setError("");
  };

  const save = async (cover: ProjectCover | null) => {
    setStatus("saving");
    setError("");
    try {
      await saveProjectCover(repoName, cover);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saving failed.");
      setStatus("idle");
    }
  };

  // Rendered at <body> level so the card's 3D tilt transform can't trap the fixed overlay.
  return createPortal(
    <div className="cover-editor-bg" onPointerDown={onClose} onPointerMove={(e) => e.stopPropagation()}>
      <div className="cover-editor" role="dialog" aria-label={`Cover for ${repoName}`} onPointerDown={(e) => e.stopPropagation()}>
        <p className="eyebrow">Project cover</p>
        <h3>{repoName}</h3>

        <div className="cover-editor__preview">
          {draft?.type === "video" ? (
            <video src={draft.url} autoPlay muted loop playsInline />
          ) : draft ? (
            <img src={draft.url} alt="" />
          ) : (
            <span>No cover yet: the card uses its pink gradient.</span>
          )}
        </div>

        <label className="cover-editor__upload">
          <input type="file" accept="image/*,video/*" onChange={(e) => void pickFile(e.target.files?.[0])} />
          <span>{status === "reading" ? "Reading file…" : "Upload a picture or video"}</span>
        </label>

        <div className="cover-editor__link">
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="…or paste an image / .mp4 link" />
          <button type="button" className="ghost-button" onClick={useLink}>Use link</button>
        </div>

        <p className="cover-editor__tip">Short, silent clips (under ~10 s) work best: videos play muted on a loop.</p>
        {error ? <p className="editor-error">{error}</p> : null}

        <div className="form-actions">
          {current ? (
            <button type="button" className="ghost-button cover-editor__remove" disabled={status !== "idle"} onClick={() => void save(null)}>
              Remove cover
            </button>
          ) : null}
          <button type="button" className="ghost-button" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="pink-button"
            disabled={!draft || draft === current || status !== "idle"}
            onClick={() => void save(draft)}
          >
            {status === "saving" ? "Saving…" : "Save cover"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
