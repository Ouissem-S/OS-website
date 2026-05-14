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

const BLOG_POSTS_KEY = "portfolio_blog_posts";
const BLOG_OWNER_KEY = "portfolio_blog_owner";
const BLOG_PASSWORD = "wissem-oui";
const BLOG_DB_NAME = "portfolio_blog_db";
const BLOG_DB_VERSION = 1;
const BLOG_STORE_NAME = "posts";
const BLOG_STORE_KEY = "all_posts";

export const samplePosts: BlogPost[] = [
  {
    id: "ai-robotics-physical-world",
    title: "AI Is Starting to Move Into the Physical World",
    excerpt:
      "Recent robotics news shows AI moving beyond screens and into machines that can learn, move, and act in real spaces.",
    category: "AI + Robotics",
    image: "/gabriele-malaspina-CjWsslYVnPI-unsplash.jpg",
    content: `## Why this caught my attention
A lot of AI news still focuses on chatbots, image generators, and software agents. But one of the most interesting shifts happening right now is that AI is starting to move into the physical world.

---

## From language to action
Recent robotics news makes that clear. Meta has acquired a humanoid robotics startup to strengthen its work on AI for robots, while Boston Dynamics is working with Google DeepMind on the next generation of Atlas. The interesting part is not only the hardware. It is the idea that robots may need foundation models of their own: systems trained to understand movement, objects, space, and physical interaction.

> Intelligence becomes more than prediction. It becomes action.

That changes how I think about AI. A chatbot can be wrong and correct itself in text, but a robot acting in the real world has to deal with gravity, friction, timing, safety, and uncertainty. Intelligence becomes more than prediction. It becomes action.

## Why robotics feels exciting
This is why robotics feels like one of the most exciting areas of AI. It combines perception, language, control, planning, and real-world feedback. It also shows how difficult “general intelligence” really is. Understanding a sentence is one challenge. Understanding how to pick up a fragile object, navigate a room, or work safely near people is another.

For me, this is the kind of AI progress worth watching: not just models that can answer questions, but systems that can eventually help in homes, hospitals, factories, and everyday environments.`,
    date: "2026-05-14"
  }
];

export function getPosts(): BlogPost[] {
  const saved = window.localStorage.getItem(BLOG_POSTS_KEY);
  if (!saved) return samplePosts;

  try {
    const posts = JSON.parse(saved) as BlogPost[];
    return posts.length ? posts : samplePosts;
  } catch {
    return samplePosts;
  }
}

function openBlogDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(BLOG_DB_NAME, BLOG_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(BLOG_STORE_NAME)) {
        db.createObjectStore(BLOG_STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readPostsFromIndexedDb() {
  const db = await openBlogDb();

  return new Promise<BlogPost[]>((resolve, reject) => {
    const transaction = db.transaction(BLOG_STORE_NAME, "readonly");
    const store = transaction.objectStore(BLOG_STORE_NAME);
    const request = store.get(BLOG_STORE_KEY);

    request.onsuccess = () => resolve((request.result as BlogPost[] | undefined) ?? []);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

async function writePostsToIndexedDb(posts: BlogPost[]) {
  const db = await openBlogDb();

  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(BLOG_STORE_NAME, "readwrite");
    const store = transaction.objectStore(BLOG_STORE_NAME);
    const request = store.put(posts, BLOG_STORE_KEY);

    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getPostsAsync(): Promise<BlogPost[]> {
  try {
    const saved = await readPostsFromIndexedDb();
    if (saved.length) return saved;

    const legacyPosts = getPosts();
    if (legacyPosts.length) {
      await writePostsToIndexedDb(legacyPosts);
      return legacyPosts;
    }

    return samplePosts;
  } catch {
    return getPosts();
  }
}

export async function savePosts(posts: BlogPost[]) {
  await writePostsToIndexedDb(posts);
  window.dispatchEvent(new CustomEvent("portfolio-posts-updated", { detail: posts }));
}

export function isOwner() {
  return window.localStorage.getItem(BLOG_OWNER_KEY) === "true";
}

export function requestOwnerAccess() {
  if (isOwner()) return true;

  const attempt = window.prompt("Owner password:");
  if (attempt === BLOG_PASSWORD) {
    window.localStorage.setItem(BLOG_OWNER_KEY, "true");
    window.dispatchEvent(new Event("portfolio-owner-updated"));
    return true;
  }

  window.localStorage.removeItem(BLOG_OWNER_KEY);
  window.dispatchEvent(new Event("portfolio-owner-updated"));
  return false;
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
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function readImageAsCompressedDataURL(file?: File, maxWidth = 1400, quality = 0.82) {
  return new Promise<string>((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Could not prepare image."));
          return;
        }
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
