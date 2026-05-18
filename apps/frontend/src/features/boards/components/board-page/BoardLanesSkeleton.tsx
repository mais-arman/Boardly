import Skeleton from "../../../../shared/components/Skeleton";

function CardSkeleton() {
  return (
    <div className="trello-card">
      <Skeleton width="80%" height="14px" />
      <Skeleton width="65%" height="12px" />
      <Skeleton width="45%" height="12px" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <article className="trello-list">
      <header className="trello-list-header">
        <Skeleton width="55%" height="18px" />
        <Skeleton width="28px" height="24px" />
      </header>

      <div className="trello-cards">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </article>
  );
}

export default function BoardLanesSkeleton() {
  return (
    <section className="trello-lanes">
      {Array.from({ length: 4 }).map((_, index) => (
        <ListSkeleton key={index} />
      ))}
    </section>
  );
}