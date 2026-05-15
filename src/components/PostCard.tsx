import { defaultPostImage, formatDate, type BlogPost } from "../lib/blog";
import { navigateTo } from "../lib/router";

type PostCardProps = {
  post: BlogPost;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
};

export function PostCard({ post, onDelete, onEdit }: PostCardProps) {
  const path = `/post/${encodeURIComponent(post.id)}`;
  const href = `#${path}`;
  const mediaType = post.media?.type;
  const showMediaChip = mediaType === "video" || mediaType === "embed";
  const postMeta = [post.location, formatDate(post.date)].filter(Boolean).join(" • ");

  return (
    <article className="post-card">
      <a className="post-card__media" href={href} onClick={navigateTo(path)}>
        <img src={post.image || defaultPostImage(post.title)} alt="" />
        {showMediaChip ? <span className="media-chip">{mediaType === "embed" ? "video" : mediaType}</span> : null}
      </a>
      <div className="post-card__body">
        <div className="post-card__topline">
          <div className="post-card__category">{post.category}</div>
          <div className="post-card__meta">{postMeta}</div>
        </div>
        <h3>
          <a href={href} onClick={navigateTo(path)}>
            {post.title}
          </a>
        </h3>
        <p>{post.excerpt}</p>
        <div className="post-card__footer">
          <a className="text-link" href={href} onClick={navigateTo(path)}>
            Read post
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
