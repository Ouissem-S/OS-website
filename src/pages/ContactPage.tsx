import { ContactLinks } from "../components/ContactLinks";
import { MiniMe } from "../components/home/MiniMe";
import { SiteNav } from "../components/layout/SiteNav";

export function ContactPage() {
  return (
    <>
      <SiteNav />
      <main className="page-shell contact-page" role="main">
        <section className="contact-hero">
          <div className="contact-hero__text">
            <h1>
              Let's <span>connect</span>
            </h1>
            <p className="lead">Find me on LinkedIn, see my code on GitHub, or email me directly. I'd love to hear from you!</p>
            <ContactLinks />
          </div>
          <MiniMe />
        </section>
      </main>
    </>
  );
}
