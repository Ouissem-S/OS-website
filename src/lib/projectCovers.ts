// Custom background pictures/videos for the GitHub project cards, keyed by repo name.
// Stored in posts/project-covers.json next to the blog posts and edited in owner mode.

import { PROJECT_COVERS_PATH } from "../config";
import { fetchRawJson, fetchRemoteJson, requireToken, uploadDataUrl, writeJsonFile } from "./githubContent";

export type ProjectCover = { type: "image" | "video"; url: string };
export type ProjectCovers = Record<string, ProjectCover>;

let cachedCovers: ProjectCovers | null = null;

export async function getProjectCovers(): Promise<ProjectCovers> {
  if (cachedCovers) return cachedCovers;
  try {
    cachedCovers = (await fetchRawJson<ProjectCovers>(PROJECT_COVERS_PATH)) ?? {};
  } catch {
    cachedCovers = {};
  }
  return cachedCovers;
}

// Pass null to remove a repo's cover.
export async function saveProjectCover(repoName: string, cover: ProjectCover | null) {
  const token = requireToken();
  const { data, sha } = await fetchRemoteJson<ProjectCovers>(PROJECT_COVERS_PATH, token, { allowMissing: true });
  const next: ProjectCovers = { ...(data ?? {}) };

  if (cover) {
    next[repoName] = { type: cover.type, url: await uploadDataUrl(cover.url, token, `project-${repoName}`, cover.type) };
  } else {
    delete next[repoName];
  }

  await writeJsonFile(PROJECT_COVERS_PATH, next, sha, token, `Update cover for ${repoName}`);
  cachedCovers = next;
  window.dispatchEvent(new CustomEvent("portfolio-covers-updated", { detail: next }));
}

export function guessMediaType(url: string): ProjectCover["type"] {
  return /^data:video\/|\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url) ? "video" : "image";
}
