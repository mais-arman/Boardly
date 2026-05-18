import Skeleton from "../../../../shared/components/Skeleton";

export default function InvitationCardSkeleton() {
  return (
    <article className="invitation-card">
      <div className="member-skeleton-content">
        <Skeleton width="180px" height="18px" />
        <Skeleton width="220px" height="14px" />
        <Skeleton width="160px" height="14px" />
      </div>

      <div className="invitation-actions">
        <Skeleton width="90px" height="44px" />
        <Skeleton width="90px" height="44px" />
      </div>
    </article>
  );
}