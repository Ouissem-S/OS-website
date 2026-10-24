import { PostCard } from "../components/blog/PostCard";
import { SiteNav } from "../components/layout/SiteNav";
import { Reveal } from "../components/Reveal";
import { useBlogPosts } from "../hooks/useBlogPosts";
import { useOwner } from "../hooks/useOwner";
import { logoutOwner } from "../lib/auth";
import { deletePostById } from "../lib/blog/storage";
import { navigate, navigateTo } from "../lib/router";

export function BlogPage() {
  const posts = useBlogPosts();
  const owner = useOwner();
  // Pinned posts first, then the rest in their saved order.
  const ordered = [...posts.filter((post) => post.pinned), ...posts.filter((post) => !post.pinned)];
  const [featuredPost, ...morePosts] = ordered;

  const deletePost = (id: string) => {
    if (!window.confirm("Delete this post?")) return;
    void deletePostById(id);
  };
  const editPost = (id: string) => navigate(`/edit/${encodeURIComponent(id)}`);
  const ownerProps = owner ? { onDelete: deletePost, onEdit: editPost } : {};

  return (
    <>
      <SiteNav />
      <main className="blog-shell" role="main">
        <section className="blog-hero" aria-labelledby="blog-title">
          {["📝", "💡", "🤖", "🌸"].map((sticker, index) => (
            <span key={index} className={`blog-hero__sticker blog-hero__sticker--${index + 1}`} aria-hidden="true">
              {sticker}
            </span>
          ))}
          <h1 id="blog-title">
            Inside my head, the <span>ideas</span> live here.
          </h1>
          <p className="lead">
            Notes on artificial intelligence, robotics, software engineering, and the technologies shaping what comes
            next.
          </p>

          {owner ? (
            <div className="blog-hero__owner">
              <span className="admin-chip">Owner mode</span>
              <a className="pink-button" href="#/new" onClick={navigateTo("/new")}>
                + New post
              </a>
              <button className="text-link" type="button" onClick={logoutOwner}>
                Log out
              </button>
            </div>
          ) : null}
        </section>

        {featuredPost ? (
          <>
            <Reveal>
              <PostCard post={featuredPost} featured {...ownerProps} />
            </Reveal>
            {morePosts.length ? (
              <div className="blog-grid">
                {morePosts.map((post, index) => (
                  <Reveal key={post.id} delay={(index % 3) * 90}>
                    <PostCard post={post} {...ownerProps} />
                  </Reveal>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <div className="empty-state blog-empty">No posts here yet. Check back soon 🌸</div>
        )}
      </main>
    </>
  );
}
