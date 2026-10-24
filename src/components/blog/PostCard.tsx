import type { BlogPost } from "../../lib/blog/types";
import { defaultPostImage, formatDate, postTopics, readingTime } from "../../lib/format";
import { navigateTo } from "../../lib/router";

type PostCardProps = {
  post: BlogPost;
  featured?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
};

export function PostCard({ post, featured = false, onDelete, onEdit }: PostCardProps) {
  const path = `/post/${encodeURIComponent(post.id)}`;
  const href = `#${path}`;
  const mediaType = post.media?.type;
  const showMediaChip = mediaType === "video" || mediaType === "embed";
  const topic = postTopics(post.category)[0];
  const meta = [formatDate(post.date), readingTime(post.content), post.location].filter(Boolean).join(" · ");

  return (
    <article className={`post-card${featured ? " post-card--featured" : ""}`}>
      <a className="post-card__media" href={href} onClick={navigateTo(path)} tabIndex={-1} aria-hidden="true">
        <img src={post.image || defaultPostImage(post.title)} alt="" loading="lazy" />
        {topic ? <span className="post-card__topic">{topic}</span> : null}
        {showMediaChip ? <span className="media-chip">▶ video</span> : null}
      </a>
      <div className="post-card__body">
        {featured ? <p className="post-card__badge">{post.pinned ? "📌 Pinned" : "✦ Latest post"}</p> : null}
        <p className="post-card__meta">{meta}</p>
        <h3>
          <a href={href} onClick={navigateTo(path)}>
            {post.title}
          </a>
        </h3>
        <p className="post-card__excerpt">{post.excerpt}</p>
        <div className="post-card__footer">
          <a className="post-card__read" href={href} onClick={navigateTo(path)}>
            Read post <span aria-hidden="true">→</span>
          </a>
          {onDelete || onEdit ? (
            <span className="owner-actions">
              {onEdit ? (
                <button className="icon-action" type="button" onClick={() => onEdit(post.id)}>
                  Edit
                </button>
              ) : null}
              {onDelete ? (
                <button className="icon-action danger" type="button" onClick={() => onDelete(post.id)}>
                  Delete
                </button>
              ) : null}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
