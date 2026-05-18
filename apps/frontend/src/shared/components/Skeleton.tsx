type SkeletonProps = {
  width?: string;
  height?: string;
  rounded?: boolean;
};

export default function Skeleton({
  width = "100%",
  height = "16px",
  rounded = false,
}: SkeletonProps) {
  return (
    <span
      className={rounded ? "skeleton skeleton-rounded" : "skeleton"}
      style={{ width, height }}
    />
  );
}