import type { FormEvent } from "react";
import Button from "../../../../shared/components/Button";
import type { Comment } from "../../types";
import CommentList from "../CommentList";

type CardActivityProps = {
  comments: Comment[];
  comment: string;
  canComment: boolean;
  isAddingComment: boolean;
  onCommentChange: (value: string) => void;
  onSubmitComment: (event: FormEvent<HTMLFormElement>) => void;
};

export default function CardActivity({
  comments,
  comment,
  canComment,
  isAddingComment,
  onCommentChange,
  onSubmitComment,
}: CardActivityProps) {
  return (
    <section className="trello-section trello-activity-section">
      <h3>Activity</h3>

      {canComment ? (
        <form className="trello-comment-form" onSubmit={onSubmitComment}>
          <textarea
            value={comment}
            onChange={(event) => onCommentChange(event.target.value)}
            placeholder="Write a comment..."
          />

          <Button type="submit" isLoading={isAddingComment}>
            Add comment
          </Button>
        </form>
      ) : (
        <p className="viewer-note">Viewer access: commenting is disabled.</p>
      )}

      <CommentList comments={comments} />
    </section>
  );
}