// Site-wide settings shared across the blog storage and owner auth modules.

export const GITHUB_USER   = "Ouissem-S";
export const GITHUB_REPO   = `${GITHUB_USER}/OS-website`;
export const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USER}`;
// Repos never shown in the home page project grid.
export const HIDDEN_REPOS = ["OS-website"];
export const GITHUB_BRANCH = "main";

// Paths inside the GitHub repo that the blog reads from and writes to at runtime.
export const POSTS_PATH = "posts/posts.json";
export const MEDIA_DIR  = "public/blog-media";
export const PROJECT_COVERS_PATH = "posts/project-covers.json";

export const POSTS_CACHE_MS = 5_000;

export const BLOG_OWNER_KEY   = "portfolio_blog_owner";
export const BLOG_PASSWORD    = "wissem-oui";
export const GITHUB_TOKEN_KEY = "portfolio_github_token";

export const PUBLIC_BASE = import.meta.env.BASE_URL;
