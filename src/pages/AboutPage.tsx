import { useState, type CSSProperties } from "react";
import { SiteNav } from "../components/layout/SiteNav";
import { Reveal } from "../components/Reveal";
import { navigateTo } from "../lib/router";

const facts = [
  { emoji: "🎓", label: "Studying", detail: "BSc Computer Science with AI @University of Nottingham", colour: "#f9e6ec" },
  { emoji: "🤖", label: "Into", detail: "Software Engineering, Technology, & Consultancy", colour: "#f1e4ff" },
  { emoji: "🛠️", label: "Currently Building", detail: "Adaptive Playlists Based on Brain Signals", colour: "#dcf5ea" },
  { emoji: "💗", label: "Cares about", detail: "Technology that shapes our lives", colour: "#ffe6dc" }
];

function FactCard({ fact }: { fact: (typeof facts)[number] }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      className={`fact-card${flipped ? " is-flipped" : ""}`}
      style={{ "--fact-bg": fact.colour } as CSSProperties}
      onClick={() => setFlipped((value) => !value)}
      aria-pressed={flipped}
    >
      <span className="fact-card__inner">
        <span className="fact-card__front">
          <span className="fact-card__emoji" aria-hidden="true">{fact.emoji}</span>
          <strong>{fact.label}</strong>
          <small>Tap to flip ↻</small>
        </span>
        <span className="fact-card__back">{fact.detail}</span>
      </span>
    </button>
  );
}

export function AboutPage() {
  return (
    <>
      <SiteNav />
      <main className="page-shell about-page" role="main">
        <section className="about-hero">
          <figure className="polaroid">
            <span className="polaroid__tape" aria-hidden="true" />
            <img src={`${import.meta.env.BASE_URL}photos/ouissem.jpg`} alt="Ouissem Salag" />
            <span className="polaroid__sticker polaroid__sticker--1" aria-hidden="true">💗</span>
            <span className="polaroid__sticker polaroid__sticker--2" aria-hidden="true">✨</span>
            <span className="polaroid__sticker polaroid__sticker--3" aria-hidden="true">🌸</span>
          </figure>

          <div className="about-hero__text">
            <h1>
              Hey, I'm <span>Ouissem</span>
            </h1>
            <div className="prose">
              <p>
                I’m a Computer Science with Artificial Intelligence student 👩‍🎓 at the University of Nottingham, interested in building modern software and exploring how AI can enhance applications.
              </p>
              <p>
                I enjoy bringing together APIs, language models, and thoughtful design to build practical, user-friendly software 🤍
              </p>
              <p>
                When I’m not coding, I’m probably playing video games 🎮, baking 🥐, reading fiction or biographies 📚, diving into history and World War II documents 📜, or occasionally writing pop songs 🎧. Still waiting for my electric guitar era to begin (soon hehehe).
              </p>
            </div>
          </div>
        </section>

        <section className="about-facts" aria-label="Quick facts">
          {facts.map((fact, index) => (
            <Reveal key={fact.label} delay={index * 90}>
              <FactCard fact={fact} />
            </Reveal>
          ))}
        </section>

        <Reveal>
          <section className="about-cta">
            <div>
              <h2>Let's build something lovely ✨</h2>
              <p>Want to chat about AI, a project, or an opportunity? I'd love to hear from you.</p>
            </div>
            <div className="about-cta__actions">
              <a className="pink-button" href="#/contact" onClick={navigateTo("/contact")}>
                Say hi 👋
              </a>
              <a className="ghost-button" href="#/blog" onClick={navigateTo("/blog")}>
                Read my blog
              </a>
            </div>
          </section>
        </Reveal>
      </main>
    </>
  );
}
