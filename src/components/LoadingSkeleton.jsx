export default function LoadingSkeleton({ className = "" }) {
  return (
    <div
      aria-hidden
      className={[
        "skeleton-shimmer",
        "w-full",
        "h-9",          // ✅ explicit height so shimmer shows
        "rounded-md",
        className,
      ].join(" ")}
    />
  );
}
