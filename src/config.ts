// Site-wide settings shared across the blog storage and owner auth modules.

export const GITHUB_REPO   = "Ouissem-S/OS-website";
export const GITHUB_BRANCH = "main";

// Paths inside the GitHub repo that the blog reads from and writes to at runtime.
export const POSTS_PATH = "posts/posts.json";
export const MEDIA_DIR  = "public/blog-media";

export const POSTS_CACHE_MS = 5_000;

export const BLOG_OWNER_KEY   = "portfolio_blog_owner";
export const BLOG_PASSWORD    = "wissem-oui";
export const GITHUB_TOKEN_KEY = "portfolio_github_token";

export const PUBLIC_BASE = import.meta.env.BASE_URL;
