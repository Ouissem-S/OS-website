import { useEffect, useMemo, useState } from "react";
import { renderPostMedia, renderRichPost } from "../components/blog/PostContent";
import { SiteNav } from "../components/layout/SiteNav";
import { useBlogPosts } from "../hooks/useBlogPosts";
import { getPostsAsync } from "../lib/blog/storage";
import type { BlogPost } from "../lib/blog/types";
import { formatDate } from "../lib/format";
import { navigateTo } from "../lib/router";

export function PostPage({ id }: { id: string }) {
  const posts = useBlogPosts();
  const [freshPosts, setFreshPosts] = useState<BlogPost[] | null>(null);
  const [checkedPosts, setCheckedPosts] = useState(false);
  const post = useMemo(() => (freshPosts ?? posts).find((item) => item.id === id || item.legacyId === id), [freshPosts, id, posts]);

  useEffect(() => {
    let active = true;
    setFreshPosts(null);
    setCheckedPosts(false);
    void getPostsAsync().then((updatedPosts) => {
      if (!active) return;
      setFreshPosts(updatedPosts);
      setCheckedPosts(true);
    });
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <>
      <SiteNav />
      <main className="page-shell narrow" role="main">
        {post ? (
          <article className="post-view">
            <div className="post-view__topline">
              <p className="eyebrow">{post.category}</p>
              <p className="post-view__meta">{[post.location, formatDate(post.date)].filter(Boolean).join(" • ")}</p>
            </div>
            <h1>{post.title}</h1>
            {renderPostMedia(post)}
            <div className="post-view__content">
              {renderRichPost(post.content)}
            </div>
            <a className="text-link" href="#/blog" onClick={navigateTo("/blog")}>
              Back to blog
            </a>
          </article>
        ) : checkedPosts ? (
          <section className="editor-card">
            <h1>Post not found</h1>
            <p>This post may have been deleted or the link may be incorrect.</p>
            <a className="primary-button" href="#/blog" onClick={navigateTo("/blog")}>
              Back to blog
            </a>
          </section>
        ) : (
          <section className="editor-card">
            <p className="eyebrow">Loading post</p>
            <h1>Opening post...</h1>
          </section>
        )}
      </main>
    </>
  );
}
