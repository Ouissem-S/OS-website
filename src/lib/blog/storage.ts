// Posts live in posts/posts.json in the GitHub repo. Reads go through raw.githubusercontent.com;
// writes go through the GitHub contents API using the owner's personal access token.

import { POSTS_CACHE_MS, POSTS_PATH } from "../../config";
import { fetchRawJson, fetchRemoteJson, fixLegacyPaths, requireToken, uploadDataUrl, writeJsonFile } from "../githubContent";
import bundledPostsJson from "../../../posts/posts.json";
import { samplePosts } from "./samplePosts";
import type { BlogPost } from "./types";

// The copy of posts.json baked in at build time. Used whenever the live file on GitHub
// can't be read (e.g. while the repo is private) so the blog never goes empty.
const bundledPosts = fixLegacyPaths(bundledPostsJson as BlogPost[]);
const fallbackPosts = Array.isArray(bundledPosts) && bundledPosts.length > 0 ? bundledPosts : samplePosts;

let memoryPosts: BlogPost[] | null = null;
let memorySavedAt = 0;

export function getPosts(): BlogPost[] {
  return memoryPosts ?? fallbackPosts;
}

export async function getPostsAsync(forceFresh = false): Promise<BlogPost[]> {
  if (!forceFresh && memoryPosts && Date.now() - memorySavedAt < POSTS_CACHE_MS) return memoryPosts;
  try {
    const posts = await fetchRawJson<BlogPost[]>(POSTS_PATH);
    const result = Array.isArray(posts) && posts.length > 0 ? posts : fallbackPosts;
    memoryPosts = result;
    memorySavedAt = Date.now();
    return result;
  } catch {
    return memoryPosts ?? fallbackPosts;
  }
}

async function fetchRemotePosts(token: string): Promise<{ posts: BlogPost[]; sha?: string }> {
  const { data, sha } = await fetchRemoteJson<BlogPost[]>(POSTS_PATH, token);
  return { posts: Array.isArray(data) ? data : [], sha };
}

async function writePosts(posts: BlogPost[], sha: string | undefined, token: string): Promise<void> {
  await writeJsonFile(POSTS_PATH, posts, sha, token, "Update posts");
  memoryPosts = posts;
  memorySavedAt = Date.now();
  window.dispatchEvent(new CustomEvent("portfolio-posts-updated", { detail: posts }));
}

// Uploads every embedded data: URL in a post (cover, media, inline images, moment photo) to
// public/blog-media. The same data: URL used twice is only uploaded once.
async function externalisePostMedia(post: BlogPost, token: string) {
  const uploaded = new Map<string, string>();
  const upload = async (dataUrl: string, label: string) => {
    const existing = uploaded.get(dataUrl);
    if (existing) return existing;
    const url = await uploadDataUrl(dataUrl, token, post.id, label);
    uploaded.set(dataUrl, url);
    return url;
  };

  const nextPost: BlogPost = { ...post };

  if (nextPost.image) {
    nextPost.image = await upload(nextPost.image, "cover");
  }

  if (nextPost.media) {
    nextPost.media = { ...nextPost.media, url: await upload(nextPost.media.url, nextPost.media.type) };
  }

  const imagePattern = /!\[([^\]]*)\]\((data:[^)]+)\)/g;
  const replacements: Array<{ original: string; next: string }> = [];
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = imagePattern.exec(nextPost.content)) !== null) {
    const url = await upload(match[2], `inline-${index}`);
    replacements.push({ original: match[0], next: `![${match[1]}](${url})` });
    index += 1;
  }
  nextPost.content = replacements.reduce((content, item) => content.replace(item.original, item.next), nextPost.content);

  if (nextPost.moment) {
    nextPost.moment = { ...nextPost.moment, image: await upload(nextPost.moment.image, "moment") };
  }

  return nextPost;
}

export async function savePost(post: BlogPost): Promise<void> {
  const token = requireToken();
  const { posts, sha } = await fetchRemotePosts(token);
  const cleanPost = await externalisePostMedia(post, token);
  const nextPosts = [cleanPost, ...posts.filter((item) => item.id !== post.id && item.id !== "welcome-blog")];
  await writePosts(nextPosts, sha, token);
}

export async function deletePostById(id: string): Promise<void> {
  const token = requireToken();
  const { posts, sha } = await fetchRemotePosts(token);
  await writePosts(posts.filter((post) => post.id !== id), sha, token);
}

export async function savePosts(posts: BlogPost[]): Promise<void> {
  const token = requireToken();
  const { sha } = await fetchRemotePosts(token);
  await writePosts(posts, sha, token);
}
