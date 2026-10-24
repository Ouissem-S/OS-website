import { FeaturedProject } from "../components/home/FeaturedProject";
import { InterestsMarquee } from "../components/home/InterestsMarquee";
import { MiniMe } from "../components/home/MiniMe";
import { MomentsSection } from "../components/home/MomentsSection";
import { ProjectsSection } from "../components/home/ProjectsSection";
import { SiteNav } from "../components/layout/SiteNav";
import { useTypewriter } from "../hooks/useTypewriter";
import { navigateTo } from "../lib/router";

const buildPhrases = ["AI-driven software", "REST APIs", "Backend apps", "things that feel lovely"];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function HomePage() {
  const typed = useTypewriter(buildPhrases);

  return (
    <main className="portfolio-home" role="main">
      <div className="home-blobs" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <SiteNav className="home-nav" />

      <section className="hero-showcase" aria-labelledby="home-title">
        <div className="hero-content">
          <div className="hero-text">
            <h1 id="home-title">
              Hi, I'm <span className="hero-name">Ouissem</span>
            </h1>
            <p className="hero-typed" aria-label={`I build ${buildPhrases.join(", ")}`}>
              I build <span className="hero-typed__word">{typed}</span>
              <span className="hero-typed__caret" aria-hidden="true" />
            </p>

            <p className="hero-copy">
              I build thoughtful AI-driven software, explore language models, and write about the ideas I am learning
              along the way.
            </p>

            <div className="hero-actions">
              <button className="pink-button" type="button" onClick={() => scrollToSection("projects")}>
                View projects
              </button>
              <a className="ghost-button" href="#/contact" onClick={navigateTo("/contact")}>
                Get in touch
              </a>
            </div>
          </div>

          <MiniMe />
        </div>

        <button className="scroll-cue" type="button" onClick={() => scrollToSection("moments")} aria-label="Scroll down">
          <span />
        </button>
      </section>

      <InterestsMarquee />
      <FeaturedProject />

      <MomentsSection />
      <ProjectsSection />
    </main>
  );
}
