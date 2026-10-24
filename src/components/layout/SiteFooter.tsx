import { GITHUB_PROFILE_URL } from "../../config";
import { CONTACT_EMAIL, LINKEDIN_URL, contactIcons } from "../ContactLinks";

// Contact links on every page. The copyright line doubles as the hidden owner-mode tap target.
export function SiteFooter({ onCopyrightTap }: { onCopyrightTap: () => void }) {
  return (
    <footer className="site-footer-wrap">
      <nav className="footer-links" aria-label="Contact">
        <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" aria-label="LinkedIn">
          {contactIcons.linkedin}
        </a>
        <a href={GITHUB_PROFILE_URL} target="_blank" rel="noreferrer" aria-label="GitHub">
          {contactIcons.github}
        </a>
        <a href={`mailto:${CONTACT_EMAIL}`} aria-label="Email">
          {contactIcons.email}
        </a>
      </nav>
      <p className="site-footer" onClick={onCopyrightTap}>Copyright © Ouissem Salag 2026</p>
    </footer>
  );
}
