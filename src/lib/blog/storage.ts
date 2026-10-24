// Posts live in posts/posts.json in the GitHub repo. Reads go through raw.githubusercontent.com;
// writes go through the GitHub contents API using the owner's personal access token.

import { GITHUB_BRANCH, GITHUB_REPO, GITHUB_TOKEN_KEY, MEDIA_DIR, POSTS_CACHE_MS, POSTS_PATH, PUBLIC_BASE } from "../../config";
import { samplePosts } from "./samplePosts";
import type { BlogPost } from "./types";

const API_URL       = `https://api.github.com/repos/${GITHUB_REPO}/contents/${POSTS_PATH}`;
const RAW_POSTS_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${POSTS_PATH}`;

let memoryPosts: BlogPost[] | null = null;
let memorySavedAt = 0;

export function getPosts(): BlogPost[] {
  return memoryPosts ?? samplePosts;
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

export async function getPostsAsync(forceFresh = false): Promise<BlogPost[]> {
  if (!forceFresh && memoryPosts && Date.now() - memorySavedAt < POSTS_CACHE_MS) return memoryPosts;
  try {
    const posts = await fetchRawPosts();
    const result = Array.isArray(posts) && posts.length > 0 ? posts : samplePosts;
    memoryPosts = result;
    memorySavedAt = Date.now();
    return result;
  } catch {
    return memoryPosts ?? samplePosts;
  }
}

async function fetchRawPosts(): Promise<BlogPost[]> {
  const response = await fetch(`${RAW_POSTS_URL}?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`GitHub raw posts error: ${response.status}`);
  const posts = JSON.parse(await response.text()) as BlogPost[];
  return Array.isArray(posts) ? posts : [];
}

async function fetchRemotePosts(token?: string): Promise<{ posts: BlogPost[]; sha: string }> {
  const response = await fetch(`${API_URL}?ref=${GITHUB_BRANCH}&t=${Date.now()}`, {
    cache: "no-store",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: "application/vnd.github+json"
    }
  });

  if (response.status === 401) {
    window.localStorage.removeItem(GITHUB_TOKEN_KEY);
    throw new Error("GitHub token rejected (401). Log out and log in again to re-enter your token.");
  }

  if (!response.ok) {
    throw new Error(`GitHub API error fetching posts: ${response.status}`);
  }

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
    if (!rawResponse.ok) throw new Error(`GitHub raw posts error: ${rawResponse.status}`);
    rawJson = await rawResponse.text();
  }

  if (!rawJson.trim()) return { posts: [], sha };

  const posts = JSON.parse(rawJson) as BlogPost[];
  return { posts: Array.isArray(posts) ? posts : [], sha };
}

async function writePosts(posts: BlogPost[], sha: string, token: string): Promise<void> {
  const content = toBase64(JSON.stringify(posts, null, 2));

  const putResponse = await fetch(API_URL, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: "Update posts", content, sha, branch: GITHUB_BRANCH })
  });

  if (putResponse.status === 401) {
    window.localStorage.removeItem(GITHUB_TOKEN_KEY);
    throw new Error("GitHub token rejected (401). Log out and log in again to re-enter your token.");
  }

  if (!putResponse.ok) {
    const text = await putResponse.text();
    throw new Error(`GitHub API error saving posts (${putResponse.status}): ${text}`);
  }

  memoryPosts = posts;
  memorySavedAt = Date.now();
  window.dispatchEvent(new CustomEvent("portfolio-posts-updated", { detail: posts }));
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

async function uploadDataUrl(dataUrl: string, token: string, postId: string, label: string) {
  const parts = dataUrlParts(dataUrl);
  if (!parts) return dataUrl;

  const safePostId = postId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "post";
  const safeLabel = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "media";
  const fileName = `${safePostId}-${safeLabel}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${parts.extension}`;
  const path = `${MEDIA_DIR}/${fileName}`;

  const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`, {
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

  if (response.status === 401) {
    window.localStorage.removeItem(GITHUB_TOKEN_KEY);
    throw new Error("GitHub token rejected (401). Log out and log in again to re-enter your token.");
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API error uploading media (${response.status}): ${text}`);
  }

  return `${PUBLIC_BASE}blog-media/${fileName}`;
}

async function replaceInlineDataUrls(content: string, token: string, postId: string) {
  const imagePattern = /!\[([^\]]*)\]\((data:[^)]+)\)/g;
  const replacements: Array<{ original: string; next: string }> = [];
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = imagePattern.exec(content)) !== null) {
    const url = await uploadDataUrl(match[2], token, postId, `inline-${index}`);
    replacements.push({ original: match[0], next: `![${match[1]}](${url})` });
    index += 1;
  }

  return replacements.reduce((nextContent, item) => nextContent.replace(item.original, item.next), content);
}

async function externalisePostMedia(post: BlogPost, token: string) {
  const nextPost: BlogPost = { ...post };

  if (dataUrlParts(nextPost.image)) {
    nextPost.image = await uploadDataUrl(nextPost.image || "", token, post.id, "cover");
  }

  if (nextPost.media && dataUrlParts(nextPost.media.url)) {
    nextPost.media = {
      ...nextPost.media,
      url: await uploadDataUrl(nextPost.media.url, token, post.id, nextPost.media.type)
    };
  }

  nextPost.content = await replaceInlineDataUrls(nextPost.content, token, post.id);
  return nextPost;
}

export async function savePost(post: BlogPost): Promise<void> {
  const token = window.localStorage.getItem(GITHUB_TOKEN_KEY);
  if (!token) throw new Error("No GitHub token stored. Log out and log in again to enter your token.");

  const { posts, sha } = await fetchRemotePosts(token);
  const cleanPost = await externalisePostMedia(post, token);
  const nextPosts = [cleanPost, ...posts.filter((item) => item.id !== post.id && item.id !== "welcome-blog")];
  await writePosts(nextPosts, sha, token);
}

export async function deletePostById(id: string): Promise<void> {
  const token = window.localStorage.getItem(GITHUB_TOKEN_KEY);
  if (!token) throw new Error("No GitHub token stored. Log out and log in again to enter your token.");

  const { posts, sha } = await fetchRemotePosts(token);
  const nextPosts = posts.filter((post) => post.id !== id);
  await writePosts(nextPosts, sha, token);
}

export async function savePosts(posts: BlogPost[]): Promise<void> {
  const token = window.localStorage.getItem(GITHUB_TOKEN_KEY);
  if (!token) throw new Error("No GitHub token stored. Log out and log in again to enter your token.");
  const { sha } = await fetchRemotePosts(token);
  await writePosts(posts, sha, token);
}
