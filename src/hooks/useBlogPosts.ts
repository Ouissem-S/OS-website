import { useEffect, useState } from "react";
import { getPosts, getPostsAsync, type BlogPost } from "../lib/blog";

export function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>(() => getPosts());

  useEffect(() => {
    let active = true;
    const sync = async (event?: Event) => {
      const updatedPosts = event instanceof CustomEvent && Array.isArray(event.detail)
        ? event.detail as BlogPost[]
        : await getPostsAsync();

      if (active) setPosts(updatedPosts);
    };

    void sync();
    window.addEventListener("portfolio-posts-updated", sync);
    return () => {
      active = false;
      window.removeEventListener("portfolio-posts-updated", sync);
    };
  }, []);

  return posts;
}
