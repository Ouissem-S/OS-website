import { ContactLinks } from "../components/ContactLinks";
import { SiteNav } from "../components/layout/SiteNav";

export function AboutPage() {
  return (
    <>
      <SiteNav />
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
