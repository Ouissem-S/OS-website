import { ContactLinks } from "../components/ContactLinks";
import { SiteNav } from "../components/layout/SiteNav";

export function ContactPage() {
  return (
    <>
      <SiteNav />
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
