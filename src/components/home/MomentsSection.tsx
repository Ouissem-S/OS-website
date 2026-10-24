import { useMemo, useState } from "react";
import { pinnedMoments, type Moment } from "../../content/moments";
import { useBlogPosts } from "../../hooks/useBlogPosts";
import { useOwner } from "../../hooks/useOwner";
import type { BlogPost } from "../../lib/blog/types";
import { navigateTo } from "../../lib/router";
import { Reveal } from "../Reveal";

const BASE = import.meta.env.BASE_URL;
const LIKES_KEY = "portfolio_liked_moments";

// Pinned moments use paths relative to public/; blog moments already hold full URLs.
function withBase(image: string) {
  return /^(https?:|data:|\/)/.test(image) ? image : `${BASE}${image}`;
}

function momentFromPost(post: BlogPost): Moment | null {
  if (!post.moment?.image) return null;
  return {
    image: post.moment.image,
    caption: post.moment.caption || post.excerpt,
    place: post.location,
    link: { href: `#/post/${encodeURIComponent(post.id)}`, label: "Read the post" }
  };
}

// Likes are a per-visitor nicety kept in this browser only.
function readLikes(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(LIKES_KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

function writeLikes(likes: string[]) {
  try {
    window.localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
  } catch {
    // Storage blocked (private mode etc.) — likes just won't persist.
  }
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20.5s-7.5-4.4-9.3-9.2C1.4 7.8 3.6 4.5 7 4.5c2 0 3.6 1.1 5 2.9 1.4-1.8 3-2.9 5-2.9 3.4 0 5.6 3.3 4.3 6.8-1.8 4.8-9.3 9.2-9.3 9.2Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MomentCard({ moment, liked, onToggleLike }: { moment: Moment; liked: boolean; onToggleLike: (like?: boolean) => void }) {
  const [burstKey, setBurstKey] = useState(0);

  const likeFromPhoto = () => {
    onToggleLike(true);
    setBurstKey((key) => key + 1);
  };

  const link = moment.link;
  const linkPath = link?.href.startsWith("#/") ? link.href.slice(1) : undefined;

  return (
    <article className="moment">
      <header className="moment__header">
        <span className="moment__avatar">
          <img src={`${BASE}photos/ouissem-avatar.jpg`} alt="" />
        </span>
        <span>
          <strong>Ouissem Salag</strong>
          {moment.place ? <small>{moment.place}</small> : null}
        </span>
      </header>

      <div className="moment__photo" onDoubleClick={likeFromPhoto}>
        <img src={withBase(moment.image)} alt={moment.caption} loading="lazy" />
        {burstKey ? (
          <span key={burstKey} className="moment__burst" aria-hidden="true">
            <HeartIcon filled />
          </span>
        ) : null}
      </div>

      <div className="moment__body">
        <button
          className={`moment__like${liked ? " is-liked" : ""}`}
          type="button"
          aria-pressed={liked}
          aria-label={liked ? "Unlike" : "Like"}
          onClick={() => onToggleLike()}
        >
          <HeartIcon filled={liked} />
        </button>
        <p>
          <strong>ouissem</strong> {moment.caption}
        </p>
        {link ? (
          <a className="moment__link" href={link.href} onClick={linkPath ? navigateTo(linkPath) : undefined}>
            {link.label} →
          </a>
        ) : null}
      </div>
    </article>
  );
}

export function MomentsSection() {
  const [likes, setLikes] = useState<string[]>(readLikes);
  const posts = useBlogPosts();
  const owner = useOwner();
  const moments = useMemo(() => {
    const fromPosts = posts.map(momentFromPost).filter((moment): moment is Moment => moment !== null);
    const postLinks = new Set(fromPosts.map((moment) => moment.link?.href));
    return [...pinnedMoments.filter((moment) => !moment.link || !postLinks.has(moment.link.href)), ...fromPosts];
  }, [posts]);

  const toggleLike = (image: string, like?: boolean) => {
    setLikes((current) => {
      const isLiked = current.includes(image);
      const shouldLike = like ?? !isLiked;
      if (shouldLike === isLiked) return current;
      const next = shouldLike ? [...current, image] : current.filter((item) => item !== image);
      writeLikes(next);
      return next;
    });
  };

  return (
    <section id="moments" className="home-section moments-section" aria-labelledby="moments-heading">
      <Reveal className="home-section__heading">
        <div>
          <p className="eyebrow">📸 Life lately</p>
          <h2 id="moments-heading">Little moments</h2>
        </div>
        <p className="home-section__hint">Double-tap a photo to send some love 💗</p>
      </Reveal>

      <div className="moments-grid">
        {moments.map((moment, index) => (
          <Reveal key={moment.image} className="moments-grid__item" delay={index * 110}>
            <MomentCard
              moment={moment}
              liked={likes.includes(moment.image)}
              onToggleLike={(like) => toggleLike(moment.image, like)}
            />
          </Reveal>
        ))}
      </div>

      {owner && moments.length === pinnedMoments.length ? (
        <p className="moments-owner-hint">
          Add a moment from any blog post: open it in the editor and tick “Show this post on my home page”.
        </p>
      ) : null}
    </section>
  );
}
