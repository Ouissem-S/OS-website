export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category?: string;
  image?: string;
  media?: {
    type: "image" | "video" | "embed";
    url: string;
  };
};

const BLOG_OWNER_KEY   = "portfolio_blog_owner";
const BLOG_PASSWORD    = "wissem-oui";
const GITHUB_TOKEN_KEY = "portfolio_github_token";
const GITHUB_REPO      = "Ouissem-S/OS-website";
const GITHUB_BRANCH    = "main";
const POSTS_PATH       = "posts/posts.json";
const API_URL          = `https://api.github.com/repos/${GITHUB_REPO}/contents/${POSTS_PATH}`;

let memoryPosts: BlogPost[] | null = null;

export const samplePosts: BlogPost[] = [
  {
    id: "ai-robotics-physical-world",
    title: "AI Is Starting to Move Into the Physical World",
    excerpt:
      "Recent robotics news shows AI moving beyond screens and into machines that can learn, move, and act in real spaces.",
    category: "AI + Robotics",
    image: `${import.meta.env.BASE_URL}gabriele-malaspina-CjWsslYVnPI-unsplash.jpg`,
    content: `## Why this caught my attention
A lot of AI news still focuses on chatbots, image generators, and software agents. But one of the most interesting shifts happening right now is that AI is starting to move into the physical world.

---

## From language to action
Recent robotics news makes that clear. Meta has acquired a humanoid robotics startup to strengthen its work on AI for robots, while Boston Dynamics is working with Google DeepMind on the next generation of Atlas. The interesting part is not only the hardware. It is the idea that robots may need foundation models of their own: systems trained to understand movement, objects, space, and physical interaction.

> Intelligence becomes more than prediction. It becomes action.

That changes how I think about AI. A chatbot can be wrong and correct itself in text, but a robot acting in the real world has to deal with gravity, friction, timing, safety, and uncertainty. Intelligence becomes more than prediction. It becomes action.

## Why robotics feels exciting
This is why robotics feels like one of the most exciting areas of AI. It combines perception, language, control, planning, and real-world feedback. It also shows how difficult "general intelligence" really is. Understanding a sentence is one challenge. Understanding how to pick up a fragile object, navigate a room, or work safely near people is another.

For me, this is the kind of AI progress worth watching: not just models that can answer questions, but systems that can eventually help in homes, hospitals, factories, and everyday environments.`,
    date: "2026-05-14"
  }
];

export function getPosts(): BlogPost[] {
  return memoryPosts ?? samplePosts;
}

function toBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

export async function getPostsAsync(): Promise<BlogPost[]> {
  try {
    const response = await fetch(API_URL, {
      headers: { Accept: "application/vnd.github+json", "Cache-Control": "no-cache" }
    });
    if (!response.ok) return memoryPosts ?? samplePosts;
    const { content } = await response.json() as { content: string };
    const posts = JSON.parse(atob(content.replace(/\n/g, ""))) as BlogPost[];
    const result = Array.isArray(posts) && posts.length > 0 ? posts : samplePosts;
    memoryPosts = result;
    return result;
  } catch {
    return memoryPosts ?? samplePosts;
  }
}

export async function savePosts(posts: BlogPost[]): Promise<void> {
  const token = window.localStorage.getItem(GITHUB_TOKEN_KEY);
  if (!token) throw new Error("No GitHub token stored. Log out and log in again to enter your token.");

  const shaResponse = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json"
    }
  });

  if (shaResponse.status === 401) {
    window.localStorage.removeItem(GITHUB_TOKEN_KEY);
    throw new Error("GitHub token rejected (401). Log out and log in again to re-enter your token.");
  }

  if (!shaResponse.ok) {
    throw new Error(`GitHub API error fetching file info: ${shaResponse.status}`);
  }

  const { sha } = await shaResponse.json() as { sha: string };
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
  window.dispatchEvent(new CustomEvent("portfolio-posts-updated", { detail: posts }));
}

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

export function createExcerpt(content: string) {
  const text = content.trim().replace(/\s+/g, " ");
  return text.length > 150 ? `${text.slice(0, 147)}...` : text;
}

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export function readFileAsDataURL(file?: File) {
  return new Promise<string>((resolve, reject) => {
    if (!file) { resolve(""); return; }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function readImageAsCompressedDataURL(file?: File, maxWidth = 1400, quality = 0.82) {
  return new Promise<string>((resolve, reject) => {
    if (!file) { resolve(""); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d");
        if (!context) { reject(new Error("Could not prepare image.")); return; }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.onerror = () => reject(new Error("This image format cannot be displayed by the browser."));
      image.src = String(reader.result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function defaultPostImage(title: string) {
  const initials = encodeURIComponent(title.slice(0, 2).toUpperCase() || "WE");
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop stop-color='%23fff7fb'/%3E%3Cstop offset='0.52' stop-color='%23eaf6ff'/%3E%3Cstop offset='1' stop-color='%23f3ffe9'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='640' height='420' fill='url(%23g)'/%3E%3Ccircle cx='520' cy='88' r='70' fill='%23ffd6e6' opacity='.7'/%3E%3Ccircle cx='92' cy='330' r='90' fill='%23d7f5ee' opacity='.75'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='Poppins, Arial' font-size='96' font-weight='700' fill='%237a315f'%3E${initials}%3C/text%3E%3C/svg%3E`;
}
