import { BLOG_OWNER_KEY, BLOG_PASSWORD, GITHUB_TOKEN_KEY } from "../config";

export function isOwner() {
  return window.localStorage.getItem(BLOG_OWNER_KEY) === "true";
}

export function requestOwnerAccess(): boolean {
  if (isOwner()) return true;

  const attempt = window.prompt("Owner password:");
  if (attempt !== BLOG_PASSWORD) {
    window.localStorage.removeItem(BLOG_OWNER_KEY);
    window.dispatchEvent(new Event("portfolio-owner-updated"));
    return false;
  }

  if (!window.localStorage.getItem(GITHUB_TOKEN_KEY)) {
    const token = window.prompt(
      "Enter your GitHub Personal Access Token.\n(Fine-grained PAT with contents: write on this repo — stored only in your browser.)"
    );
    if (token?.trim()) window.localStorage.setItem(GITHUB_TOKEN_KEY, token.trim());
  }

  window.localStorage.setItem(BLOG_OWNER_KEY, "true");
  window.dispatchEvent(new Event("portfolio-owner-updated"));
  return true;
}

export function logoutOwner() {
  window.localStorage.removeItem(BLOG_OWNER_KEY);
  window.dispatchEvent(new Event("portfolio-owner-updated"));
}
