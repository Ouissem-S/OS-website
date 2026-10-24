import { useMemo, useState } from "react";
import { GITHUB_PROFILE_URL } from "../../config";
import { useGithubRepos } from "../../hooks/useGithubRepos";
import { useOwner } from "../../hooks/useOwner";
import { useProjectCovers } from "../../hooks/useProjectCovers";
import { Reveal } from "../Reveal";
import { ProjectCard } from "./ProjectCard";

const INITIAL_COUNT = 6;

export function ProjectsSection() {
  const state = useGithubRepos();
  const covers = useProjectCovers();
  const owner = useOwner();
  const [language, setLanguage] = useState("All");
  const [showAll, setShowAll] = useState(false);

  const repos = state.status === "ready" ? state.repos : [];
  const languages = useMemo(() => {
    const counts = new Map<string, number>();
    repos.forEach((repo) => {
      if (repo.language) counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [repos]);

  const filtered = language === "All" ? repos : repos.filter((repo) => repo.language === language);
  const visible = showAll ? filtered : filtered.slice(0, INITIAL_COUNT);

  return (
    <section id="projects" className="home-section projects-section" aria-labelledby="projects-heading">
      <Reveal className="home-section__heading">
        <div>
          <p className="eyebrow">💻 Open source</p>
          <h2 id="projects-heading">Things I've built</h2>
        </div>
        <a className="github-button" href={GITHUB_PROFILE_URL} target="_blank" rel="noreferrer">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.25a9.75 9.75 0 0 0-3.08 19c.48.08.66-.2.66-.46v-1.72c-2.7.58-3.26-1.16-3.26-1.16-.44-1.12-1.08-1.42-1.08-1.42-.88-.6.06-.58.06-.58.98.06 1.5 1 1.5 1 .86 1.48 2.28 1.06 2.82.8.1-.62.34-1.06.62-1.3-2.14-.24-4.4-1.08-4.4-4.78 0-1.06.38-1.92 1-2.6-.1-.26-.44-1.3.1-2.72 0 0 .82-.26 2.68 1a9.18 9.18 0 0 1 4.88 0c1.86-1.26 2.68-1 2.68-1 .54 1.42.2 2.46.1 2.72.62.68 1 1.54 1 2.6 0 3.72-2.26 4.54-4.42 4.78.36.32.68.92.68 1.86v2.76c0 .26.18.54.68.46A9.75 9.75 0 0 0 12 2.25Z" />
          </svg>
          Follow on GitHub
        </a>
      </Reveal>

      {state.status === "ready" && languages.length > 1 ? (
        <Reveal className="project-filters" delay={80}>
          {[["All", repos.length] as const, ...languages].map(([name, count]) => (
            <button
              key={name}
              type="button"
              className={language === name ? "is-active" : undefined}
              onClick={() => { setLanguage(name); setShowAll(false); }}
            >
              {name} <span>{count}</span>
            </button>
          ))}
        </Reveal>
      ) : null}

      {state.status === "loading" ? (
        <div className="project-grid" aria-busy="true">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="project-card project-card--skeleton" />
          ))}
        </div>
      ) : state.status === "error" || repos.length === 0 ? (
        <div className="empty-state">
          Projects couldn't be loaded right now.{" "}
          <a className="text-link" href={GITHUB_PROFILE_URL} target="_blank" rel="noreferrer">
            See them on GitHub ↗
          </a>
        </div>
      ) : (
        <>
          <div className="project-grid" key={language}>
            {visible.map((repo, index) => (
              <Reveal key={repo.name} className="project-grid__item" delay={(index % 3) * 100}>
                <ProjectCard repo={repo} index={repos.indexOf(repo)} cover={covers[repo.name]} editable={owner} />
              </Reveal>
            ))}
          </div>
          {filtered.length > INITIAL_COUNT ? (
            <button className="show-more-button" type="button" onClick={() => setShowAll((value) => !value)}>
              {showAll ? "Show fewer" : `Show all ${filtered.length} projects`}
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
