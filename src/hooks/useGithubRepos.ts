import { useEffect, useState } from "react";
import { fetchRepos, type GithubRepo } from "../lib/github";

type ReposState =
  | { status: "loading" }
  | { status: "ready"; repos: GithubRepo[] }
  | { status: "error" };

export function useGithubRepos() {
  const [state, setState] = useState<ReposState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    fetchRepos()
      .then((repos) => { if (active) setState({ status: "ready", repos }); })
      .catch(() => { if (active) setState({ status: "error" }); });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
