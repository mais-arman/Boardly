import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  return (
    <section className="trello-section trello-activity-section">
      <h3>{t("card.activity")}</h3>

      {canComment ? (
        <form className="trello-comment-form" onSubmit={onSubmitComment}>
          <textarea
            value={comment}
            onChange={(event) => onCommentChange(event.target.value)}
            placeholder={t("boards.writeComment")}
          />

          <Button type="submit" isLoading={isAddingComment}>
            {t("boards.addComment")}
          </Button>
        </form>
      ) : (
        <p className="viewer-note">{t("card.viewerCommentDisabled")}</p>
      )}

      <CommentList comments={comments} />
    </section>
  );
}