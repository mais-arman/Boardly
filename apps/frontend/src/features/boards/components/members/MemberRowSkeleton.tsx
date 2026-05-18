import Skeleton from "../../../../shared/components/Skeleton";

export default function MemberRowSkeleton() {
  return (
    <article className="member-row">
      <div className="member-skeleton-content">
        <Skeleton width="140px" height="16px" />
        <Skeleton width="200px" height="13px" />
      </div>

      <Skeleton width="96px" height="40px" />
    </article>
  );
}