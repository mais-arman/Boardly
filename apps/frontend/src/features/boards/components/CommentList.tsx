import type { Comment } from "../types";

type CommentListProps = {
  comments: Comment[];
};

function getInitial(comment: Comment) {
  return comment.user?.name?.charAt(0).toUpperCase() || "U";
}

function getName(comment: Comment) {
  return comment.user?.name || comment.user?.email || "User";
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="empty-comments">No comments yet.</p>;
  }

  return (
    <div className="trello-comments-list">
      {comments.map((comment) => (
        <article className="trello-comment" key={comment.id}>
          <div className="comment-avatar">{getInitial(comment)}</div>

          <div className="comment-body">
            <div className="comment-meta">
              <strong>{getName(comment)}</strong>
              <span>{new Date(comment.created_at).toLocaleString()}</span>
            </div>

            <p>{comment.content}</p>
          </div>
        </article>
      ))}
    </div>
  );
}