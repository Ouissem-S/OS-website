// Custom background pictures/videos for the GitHub project cards, keyed by repo name.
// Stored in posts/project-covers.json next to the blog posts and edited in owner mode.

import { PROJECT_COVERS_PATH } from "../config";
import { readFileAsDataURL, readImageAsCompressedDataURL } from "./files";
import { fetchRawJson, fetchRemoteJson, requireToken, uploadDataUrl, writeJsonFile } from "./githubContent";

// fit "contain" shows the whole picture (zoomed out) with a blurred copy filling the sides.
export type ProjectCover = { type: "image" | "video"; url: string; fit?: "cover" | "contain" };
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

const MAX_VIDEO_BYTES = 25_000_000;

// Turns a picked or dropped file into a cover: images are resized/compressed, short videos kept as-is.
export async function readCoverFile(file: File): Promise<ProjectCover> {
  if (file.type.startsWith("video/")) {
    if (file.size > MAX_VIDEO_BYTES) throw new Error("That video is over 25 MB. Try a shorter clip.");
    return { type: "video", url: await readFileAsDataURL(file) };
  }
  if (file.type.startsWith("image/")) {
    return { type: "image", url: await readImageAsCompressedDataURL(file, 1400, 0.85) };
  }
  throw new Error("Drop a picture or a video file.");
}
