import { PostCard } from "../components/blog/PostCard";
import { SiteNav } from "../components/layout/SiteNav";
import { useBlogPosts } from "../hooks/useBlogPosts";
import { navigateTo } from "../lib/router";

export function HomePage() {
  const posts = useBlogPosts().slice(0, 3);

  return (
    <main className="portfolio-home" role="main">
      <SiteNav className="home-nav" />

      <section className="hero-showcase" aria-labelledby="home-title">
        <div className="hero-content">
          <div className="hero-text">
            <h1 id="home-title">
              I'm <span>Ouissem</span>,
              <br />
              Computer Science with AI Student
            </h1>

            <p className="hero-copy">
              I build thoughtful AI-driven software, explore language models, and write about the ideas I am learning
              along the way.
            </p>
          </div>

          <figure className="hero-portrait" aria-label="Ouissem Salag">
            <span className="portrait-arch" />
            <img src={`${import.meta.env.BASE_URL}profile.png`} alt="Ouissem Salag" />
          </figure>
        </div>
      </section>

      <section className="home-blog" aria-labelledby="latest-posts-heading">
        <div className="home-blog__heading">
          <div>
            <p className="eyebrow">Latest writing</p>
            <h2 id="latest-posts-heading">Blog dashboard</h2>
          </div>
          <a className="text-link" href="#/blog" onClick={navigateTo("/blog")}>
            View all posts
          </a>
        </div>

        <div className="post-list home-blog__grid">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}
