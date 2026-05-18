import Skeleton from "../../../../shared/components/Skeleton";

export default function BoardCardSkeleton() {
  return (
    <article className="board-card board-card-skeleton">
      <Skeleton height="86px" />

      <div className="board-card-body">
        <Skeleton width="70%" height="22px" />
        <Skeleton height="14px" />
        <Skeleton width="55%" height="14px" />
        <Skeleton width="80%" height="14px" />
      </div>
    </article>
  );
}