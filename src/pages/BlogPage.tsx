import { PostCard } from "../components/blog/PostCard";
import { SiteNav } from "../components/layout/SiteNav";
import { useBlogPosts } from "../hooks/useBlogPosts";
import { useOwner } from "../hooks/useOwner";
import { logoutOwner, requestOwnerAccess } from "../lib/auth";
import { deletePostById } from "../lib/blog/storage";
import { navigate, navigateTo } from "../lib/router";

export function BlogPage() {
  const posts = useBlogPosts();
  const owner = useOwner();
  const [featuredPost, ...morePosts] = posts;
  const sidebarPosts = posts.slice(0, 4);

  const deletePost = (id: string) => {
    if (!window.confirm("Delete this post?")) return;
    void deletePostById(id);
  };
  const editPost = (id: string) => navigate(`/edit/${encodeURIComponent(id)}`);

  return (
    <>
      <SiteNav />
      <main className="blog-shell" role="main">
        <section className="blog-landing" aria-labelledby="blog-title">
          <p className="eyebrow">AI, robotics, software</p>
          <h1 id="blog-title">Inside my head, the ideas live here.</h1>
          <p className="lead">
            Notes on artificial intelligence, robotics, software engineering, and the technologies shaping what comes
            next.
          </p>
          <div className="blog-actions-inline">
            {owner ? (
              <a className="primary-button" href="#/new" onClick={navigateTo("/new")}>
                New post
              </a>
            ) : (
              <button className="ghost-button" type="button" onClick={requestOwnerAccess}>
                Owner
              </button>
            )}
          </div>
          {owner ? (
            <button className="text-link blog-logout" type="button" onClick={logoutOwner}>
              Log out of owner mode
            </button>
          ) : null}
        </section>

        <section className="blog-magazine" aria-labelledby="posts-heading">
          <div className="blog-main">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Published posts</p>
                <h2 id="posts-heading">Latest entries</h2>
              </div>
              {owner ? <span className="admin-chip">Owner mode</span> : null}
            </div>

            {featuredPost ? (
              <div className="featured-post">
                <PostCard
                  post={featuredPost}
                  onDelete={owner ? deletePost : undefined}
                  onEdit={owner ? editPost : undefined}
                />
              </div>
            ) : (
              <div className="empty-state">No posts yet.</div>
            )}

            <div className="post-list blog-card-grid">
              {morePosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={owner ? deletePost : undefined}
                  onEdit={owner ? editPost : undefined}
                />
              ))}
            </div>
          </div>

          <aside className="blog-sidebar" aria-label="Featured posts">
            <h3>Featured</h3>
            {sidebarPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </aside>
        </section>
      </main>
    </>
  );
}
