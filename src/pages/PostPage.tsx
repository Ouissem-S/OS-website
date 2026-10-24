import { useEffect, useMemo, useState } from "react";
import { renderPostMedia, renderRichPost } from "../components/blog/PostContent";
import { SiteNav } from "../components/layout/SiteNav";
import { useBlogPosts } from "../hooks/useBlogPosts";
import { getPostsAsync } from "../lib/blog/storage";
import type { BlogPost } from "../lib/blog/types";
import { formatDate, postTopics, readingTime } from "../lib/format";
import { navigateTo } from "../lib/router";

export function PostPage({ id }: { id: string }) {
  const posts = useBlogPosts();
  const [freshPosts, setFreshPosts] = useState<BlogPost[] | null>(null);
  const [checkedPosts, setCheckedPosts] = useState(false);
  const post = useMemo(() => (freshPosts ?? posts).find((item) => item.id === id || item.legacyId === id), [freshPosts, id, posts]);

  const allPosts = freshPosts ?? posts;
  const nextPost = post ? allPosts[allPosts.indexOf(post) + 1] ?? (allPosts[0] !== post ? allPosts[0] : undefined) : undefined;

  // Reading progress bar along the top of the page.
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [post]);

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
      {post ? <div className="read-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" /> : null}
      <SiteNav />
      <main className="page-shell narrow" role="main">
        {post ? (
          <>
            <article className="post-view">
              <a className="post-view__back" href="#/blog" onClick={navigateTo("/blog")}>
                ← All posts
              </a>
              <div className="post-view__topics">
                {postTopics(post.category).map((topic) => (
                  <span key={topic}>{topic}</span>
                ))}
              </div>
              <h1>{post.title}</h1>
              <div className="post-view__author">
                <img src={`${import.meta.env.BASE_URL}photos/ouissem-avatar.jpg`} alt="" />
                <div>
                  <strong>Ouissem Salag</strong>
                  <span>{[formatDate(post.date), post.location, readingTime(post.content)].filter(Boolean).join(" · ")}</span>
                </div>
              </div>
              {renderPostMedia(post)}
              <div className="post-view__content">
                {renderRichPost(post.content)}
              </div>
            </article>

            <section className="end-card" aria-labelledby="end-card-title">
              <img src={`${import.meta.env.BASE_URL}photos/ouissem-avatar.jpg`} alt="" />
              <div>
                <h2 id="end-card-title">Thanks for reading 💗</h2>
                <p>I'm Ouissem, a Computer Science with AI student writing about what I build and learn.</p>
              </div>
              <div className="end-card__actions">
                {nextPost ? (
                  <a className="pink-button" href={`#/post/${encodeURIComponent(nextPost.id)}`} onClick={navigateTo(`/post/${encodeURIComponent(nextPost.id)}`)}>
                    Next: {nextPost.title.length > 38 ? `${nextPost.title.slice(0, 36)}…` : nextPost.title}
                  </a>
                ) : null}
                <a className="ghost-button" href="#/blog" onClick={navigateTo("/blog")}>
                  All posts
                </a>
              </div>
            </section>
          </>
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
