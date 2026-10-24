import { useState, type CSSProperties, type PointerEvent } from "react";
import { repoTitle, type GithubRepo } from "../../lib/github";
import type { ProjectCover } from "../../lib/projectCovers";
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

  return (
    <article
      className={`project-card${cover ? " project-card--has-cover" : ""}`}
      style={{ "--c1": from, "--c2": to } as CSSProperties}
      onPointerMove={tilt}
      onPointerLeave={resetTilt}
    >
      <div className="project-card__cover">
        {cover?.type === "video" ? (
          <video className="project-card__media" src={cover.url} autoPlay={!prefersReducedMotion()} muted loop playsInline preload="metadata" />
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
        {editable ? (
          <button className="project-card__edit-cover" type="button" onClick={() => setEditing(true)}>
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
