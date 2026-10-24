import { GITHUB_USER, HIDDEN_REPOS } from "../config";

export type GithubRepo = {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
};

let cachedRepos: GithubRepo[] | null = null;

// Public, unauthenticated API: no token needed, limited to 60 requests per hour per visitor.
export async function fetchRepos(): Promise<GithubRepo[]> {
  if (cachedRepos) return cachedRepos;

  const response = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`, {
    headers: { Accept: "application/vnd.github+json" }
  });
  if (!response.ok) throw new Error(`GitHub API error fetching repos: ${response.status}`);

  const repos = await response.json() as GithubRepo[];
  cachedRepos = repos
    .filter((repo) => !repo.fork && !repo.archived && !HIDDEN_REPOS.includes(repo.name))
    .sort((a, b) => b.pushed_at.localeCompare(a.pushed_at));
  return cachedRepos;
}

// "Guess-the-Music" -> "Guess the Music"
export function repoTitle(name: string) {
  return name.replace(/[-_]+/g, " ");
}
