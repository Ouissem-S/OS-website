import { useState, type CSSProperties, type DragEvent, type PointerEvent } from "react";
import { repoTitle, type GithubRepo } from "../../lib/github";
import { readCoverFile, saveProjectCover, type ProjectCover } from "../../lib/projectCovers";
import { ProjectCoverEditor } from "./ProjectCoverEditor";

// Each card cycles through a different pink gradient.
const palettes = [
  ["#f3b5c4", "#d77a9a"],
  ["#f6cdb8", "#e39a8a"],
  ["#d9c4ef", "#a77bab"],
  ["#f1cbd8", "#b5577f"],
  ["#c9b6e4", "#7e3a5c"],
  ["#f4d6c4", "#c98a8f"]
];

// First keyword match wins, checked against the repo name + description.
const emojiRules: Array<[RegExp, string]> = [
  [/harry|concert|wembley|tour|retro/i, "🎤"],
  [/emotion|feel|mood|motison/i, "💗"],
  [/music|song|audio|spotify/i, "🎵"],
  [/invest|stock|market|finance|portfolio tracker/i, "📈"],
  [/sun|flower|garden|plant/i, "🌻"],
  [/game|play/i, "🎮"],
  [/sensor|robot|hardware|emg/i, "📡"],
  [/website|portfolio|web/i, "💻"],
  [/\bai\b|llm|gpt|model|agent/i, "🤖"]
];

function projectEmoji(repo: GithubRepo) {
  const text = `${repo.name} ${repo.description ?? ""}`;
  return emojiRules.find(([pattern]) => pattern.test(text))?.[1] ?? "✨";
}

function timeAgo(value: string) {
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);
  if (days < 1) return "today";
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (days < 31) return `${Math.floor(days / 7)} week${days < 14 ? "" : "s"} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${days < 60 ? "" : "s"} ago`;
  return `${Math.floor(days / 365)} year${days < 730 ? "" : "s"} ago`;
}

function isFresh(value: string) {
  return Date.now() - new Date(value).getTime() < 45 * 86_400_000;
}

// Tilts the card towards the cursor and moves the glare highlight with it.
function tilt(event: PointerEvent<HTMLElement>) {
  if (event.pointerType !== "mouse") return;
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  card.style.setProperty("--rx", `${(0.5 - y) * 10}deg`);
  card.style.setProperty("--ry", `${(x - 0.5) * 12}deg`);
  card.style.setProperty("--mx", `${x * 100}%`);
  card.style.setProperty("--my", `${y * 100}%`);
}

function resetTilt(event: PointerEvent<HTMLElement>) {
  event.currentTarget.style.setProperty("--rx", "0deg");
  event.currentTarget.style.setProperty("--ry", "0deg");
}

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ProjectCard({
  repo,
  index,
  cover,
  editable = false
}: {
  repo: GithubRepo;
  index: number;
  cover?: ProjectCover;
  editable?: boolean;
}) {
  const [from, to] = palettes[index % palettes.length];
  const [editing, setEditing] = useState(false);
  // Owner mode: drag a picture/video from your computer onto the cover to set it.
  const [dragDepth, setDragDepth] = useState(0);
  const [dropStatus, setDropStatus] = useState<"idle" | "saving" | "error">("idle");
  const [dropError, setDropError] = useState("");

  const hasFiles = (event: DragEvent) => event.dataTransfer.types.includes("Files");

  const dropHandlers = editable
    ? {
        onDragEnter: (event: DragEvent<HTMLDivElement>) => {
          if (!hasFiles(event)) return;
          event.preventDefault();
          setDragDepth((depth) => depth + 1);
        },
        onDragOver: (event: DragEvent<HTMLDivElement>) => {
          if (!hasFiles(event)) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        },
        onDragLeave: () => setDragDepth((depth) => Math.max(0, depth - 1)),
        onDrop: async (event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setDragDepth(0);
          const file = event.dataTransfer.files[0];
          if (!file || dropStatus === "saving") return;
          setDropStatus("saving");
          setDropError("");
          try {
            await saveProjectCover(repo.name, await readCoverFile(file));
            setDropStatus("idle");
          } catch (err) {
            setDropError(err instanceof Error ? err.message : "Saving failed.");
            setDropStatus("error");
          }
        }
      }
    : {};

  return (
    <article
      className={`project-card${cover ? " project-card--has-cover" : ""}`}
      style={{ "--c1": from, "--c2": to } as CSSProperties}
      onPointerMove={tilt}
      onPointerLeave={resetTilt}
    >
      <div className={`project-card__cover${dragDepth > 0 ? " is-drop-target" : ""}`} {...dropHandlers}>
        {cover?.type === "video" ? (
          <video className="project-card__media" src={cover.url} autoPlay={!prefersReducedMotion()} muted loop playsInline preload="metadata" />
        ) : cover?.fit === "contain" ? (
          <>
            <img className="project-card__media project-card__media--backdrop" src={cover.url} alt="" loading="lazy" aria-hidden="true" />
            <img className="project-card__media project-card__media--contain" src={cover.url} alt="" loading="lazy" />
          </>
        ) : cover ? (
          <img className="project-card__media" src={cover.url} alt="" loading="lazy" />
        ) : (
          <>
            <span className="project-card__bubble project-card__bubble--a" aria-hidden="true" />
            <span className="project-card__bubble project-card__bubble--b" aria-hidden="true" />
            <span className="project-card__emoji" aria-hidden="true">{projectEmoji(repo)}</span>
          </>
        )}
        {isFresh(repo.pushed_at) ? <span className="project-card__fresh">✦ Fresh</span> : null}
        {repo.language ? <span className="project-card__language">{repo.language}</span> : null}
        {editable && (dragDepth > 0 || dropStatus !== "idle") ? (
          <div className="project-card__drop" role="status">
            {dropStatus === "saving" ? "Saving cover…" : dropStatus === "error" ? (
              <span>
                {dropError}{" "}
                <button type="button" onClick={() => setDropStatus("idle")}>OK</button>
              </span>
            ) : "Drop to set as cover"}
          </div>
        ) : null}
        {editable ? (
          <button className="project-card__edit-cover" type="button" title="Click to choose a cover, or drag a picture/video onto this card" onClick={() => setEditing(true)}>
            🖼️ Cover
          </button>
        ) : null}
      </div>

      <div className="project-card__body">
        <h3>
          <a className="project-card__title-link" href={repo.html_url} target="_blank" rel="noreferrer">
            {repoTitle(repo.name)}
          </a>
        </h3>
        <p>{repo.description || "A little project in progress. Peek at the code to see what's brewing!"}</p>

        <div className="project-card__footer">
          <span className="project-card__meta">
            Updated {timeAgo(repo.pushed_at)}
            {repo.stargazers_count > 0 ? ` · ★ ${repo.stargazers_count}` : ""}
          </span>
          <span className="project-card__links">
            {repo.homepage ? (
              <a href={repo.homepage} target="_blank" rel="noreferrer">
                Live
              </a>
            ) : null}
            <a href={repo.html_url} target="_blank" rel="noreferrer">
              Code ↗
            </a>
          </span>
        </div>
      </div>
      <span className="project-card__glare" aria-hidden="true" />
      {editing ? <ProjectCoverEditor repoName={repo.name} current={cover} onClose={() => setEditing(false)} /> : null}
    </article>
  );
}
