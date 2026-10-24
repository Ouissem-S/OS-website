// Reads and writes files in the site's own GitHub repo. Public reads go through
// raw.githubusercontent.com; writes use the contents API with the owner's token.

import { GITHUB_BRANCH, GITHUB_REPO, GITHUB_TOKEN_KEY, MEDIA_DIR, PUBLIC_BASE } from "../config";

const contentsUrl = (path: string) => `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
export const rawUrl = (path: string) => `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;

export function requireToken(): string {
  const token = window.localStorage.getItem(GITHUB_TOKEN_KEY);
  if (!token) throw new Error("No GitHub token stored. Log out and log in again to enter your token.");
  return token;
}

function rejectToken(): never {
  window.localStorage.removeItem(GITHUB_TOKEN_KEY);
  throw new Error("GitHub token rejected (401). Log out and log in again to re-enter your token.");
}

function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function fromBase64(str: string): string {
  const binary = atob(str.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// Media saved while the site lived at github.io/OS-website/ still points there;
// rewrite those addresses so they work from the custom domain.
const OLD_BASE = "/OS-website/";
export function fixLegacyPaths<T>(data: T): T {
  if (PUBLIC_BASE === OLD_BASE || data === null || data === undefined) return data;
  return JSON.parse(JSON.stringify(data).split(OLD_BASE).join(PUBLIC_BASE)) as T;
}

// Public, cache-busted read. Returns null when the file doesn't exist yet.
export async function fetchRawJson<T>(path: string): Promise<T | null> {
  const response = await fetch(`${rawUrl(path)}?t=${Date.now()}`, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub raw error reading ${path}: ${response.status}`);
  return fixLegacyPaths(JSON.parse(await response.text()) as T);
}

// Authenticated read that also returns the file's sha, which GitHub needs for an update.
// With allowMissing, a file that doesn't exist yet comes back as { data: null }.
export async function fetchRemoteJson<T>(
  path: string,
  token?: string,
  { allowMissing = false } = {}
): Promise<{ data: T | null; sha?: string }> {
  const response = await fetch(`${contentsUrl(path)}?ref=${GITHUB_BRANCH}&t=${Date.now()}`, {
    cache: "no-store",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: "application/vnd.github+json"
    }
  });

  if (response.status === 401) rejectToken();
  if (response.status === 404 && allowMissing) return { data: null };
  if (!response.ok) throw new Error(`GitHub API error fetching ${path}: ${response.status}`);

  const { content, download_url: downloadUrl, sha } = await response.json() as {
    content?: string;
    download_url?: string;
    sha: string;
  };
  let rawJson = "";

  if (content?.trim()) {
    rawJson = fromBase64(content);
  } else if (downloadUrl) {
    const rawResponse = await fetch(`${downloadUrl}?t=${Date.now()}`, { cache: "no-store" });
    if (!rawResponse.ok) throw new Error(`GitHub raw error reading ${path}: ${rawResponse.status}`);
    rawJson = await rawResponse.text();
  }

  return { data: rawJson.trim() ? fixLegacyPaths(JSON.parse(rawJson) as T) : null, sha };
}

export async function writeJsonFile(path: string, data: unknown, sha: string | undefined, token: string, message: string) {
  const response = await fetch(contentsUrl(path), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      content: toBase64(JSON.stringify(data, null, 2)),
      ...(sha ? { sha } : {}),
      branch: GITHUB_BRANCH
    })
  });

  if (response.status === 401) rejectToken();
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API error saving ${path} (${response.status}): ${text}`);
  }
}

export function isDataUrl(value?: string) {
  return Boolean(dataUrlParts(value));
}

function dataUrlParts(value?: string) {
  const match = value?.match(/^data:([^;,]+);base64,([\s\S]+)$/);
  if (!match) return null;
  const mime = match[1];
  const extension =
    mime === "image/jpeg" ? "jpg" :
    mime === "image/png" ? "png" :
    mime === "image/webp" ? "webp" :
    mime === "image/gif" ? "gif" :
    mime === "video/mp4" ? "mp4" :
    mime === "video/webm" ? "webm" :
    mime === "video/quicktime" ? "mov" : "bin";

  return { mime, extension, content: match[2] };
}

const slug = (value: string, fallback: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || fallback;

// Commits a data: URL into public/blog-media and returns the URL it will be served from.
// Anything that isn't a data: URL is returned unchanged.
export async function uploadDataUrl(dataUrl: string, token: string, prefix: string, label: string) {
  const parts = dataUrlParts(dataUrl);
  if (!parts) return dataUrl;

  const fileName = `${slug(prefix, "post")}-${slug(label, "media")}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${parts.extension}`;

  const response = await fetch(contentsUrl(`${MEDIA_DIR}/${fileName}`), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: `Upload blog media ${fileName}`,
      content: parts.content,
      branch: GITHUB_BRANCH
    })
  });

  if (response.status === 401) rejectToken();
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API error uploading media (${response.status}): ${text}`);
  }

  return `${PUBLIC_BASE}blog-media/${fileName}`;
}
