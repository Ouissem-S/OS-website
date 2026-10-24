import { useEffect, useState } from "react";
import { GITHUB_PROFILE_URL } from "../config";

export const CONTACT_EMAIL = "ouissemsalag@gmail.com";
export const LINKEDIN_URL = "https://www.linkedin.com/in/ouissem-salag/";

export const contactIcons = {
  linkedin: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.94 8.98H3.72V20h3.22V8.98ZM7.2 5.58a1.86 1.86 0 1 0-3.72 0 1.86 1.86 0 0 0 3.72 0ZM20.52 13.68c0-3.12-1.66-4.96-4.26-4.96-1.62 0-2.62.9-3.02 1.54V8.98h-3.1V20h3.22v-5.46c0-1.44.28-2.84 2.06-2.84 1.76 0 1.78 1.64 1.78 2.94V20h3.22l.1-6.32Z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.25a9.75 9.75 0 0 0-3.08 19c.48.08.66-.2.66-.46v-1.72c-2.7.58-3.26-1.16-3.26-1.16-.44-1.12-1.08-1.42-1.08-1.42-.88-.6.06-.58.06-.58.98.06 1.5 1 1.5 1 .86 1.48 2.28 1.06 2.82.8.1-.62.34-1.06.62-1.3-2.14-.24-4.4-1.08-4.4-4.78 0-1.06.38-1.92 1-2.6-.1-.26-.44-1.3.1-2.72 0 0 .82-.26 2.68 1a9.18 9.18 0 0 1 4.88 0c1.86-1.26 2.68-1 2.68-1 .54 1.42.2 2.46.1 2.72.62.68 1 1.54 1 2.6 0 3.72-2.26 4.54-4.42 4.78.36.32.68.92.68 1.86v2.76c0 .26.18.54.68.46A9.75 9.75 0 0 0 12 2.25Z" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.75 5.5h14.5c1.24 0 2.25 1.01 2.25 2.25v8.5a2.25 2.25 0 0 1-2.25 2.25H4.75a2.25 2.25 0 0 1-2.25-2.25v-8.5c0-1.24 1.01-2.25 2.25-2.25Zm0 2.08v.28l7.25 4.4 7.25-4.4v-.28H4.75Zm14.5 8.84V10.3l-6.66 4.04a1.12 1.12 0 0 1-1.18 0L4.75 10.3v6.12h14.5Z" />
    </svg>
  )
};

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function ContactLinks() {
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (copied === "idle") return;
    const id = window.setTimeout(() => setCopied("idle"), 2200);
    return () => window.clearTimeout(id);
  }, [copied]);

  return (
    <div className="contact-cards">
      <a className="contact-card contact-card--linkedin" href={LINKEDIN_URL} target="_blank" rel="noreferrer">
        <i>{contactIcons.linkedin}</i>
        <span>
          <strong>LinkedIn</strong>
          <small>Professional profile</small>
        </span>
        <b aria-hidden="true">↗</b>
      </a>
      <a className="contact-card contact-card--github" href={GITHUB_PROFILE_URL} target="_blank" rel="noreferrer">
        <i>{contactIcons.github}</i>
        <span>
          <strong>GitHub</strong>
          <small>Code and repositories</small>
        </span>
        <b aria-hidden="true">↗</b>
      </a>
      <div className="contact-card contact-card--email">
        <a href={`mailto:${CONTACT_EMAIL}`}>
          <i>{contactIcons.email}</i>
          <span>
            <strong>Email</strong>
            <small>{CONTACT_EMAIL}</small>
          </span>
        </a>
        <button
          type="button"
          className={copied === "copied" ? "is-copied" : undefined}
          onClick={() => void copyText(CONTACT_EMAIL).then((ok) => setCopied(ok ? "copied" : "failed"))}
        >
          {copied === "copied" ? "Copied! 💗" : copied === "failed" ? "Couldn't copy" : "Copy"}
        </button>
      </div>
    </div>
  );
}
