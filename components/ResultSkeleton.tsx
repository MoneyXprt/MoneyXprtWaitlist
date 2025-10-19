export default function ResultSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-zinc-100 rounded" />
      <div className="h-4 bg-zinc-100 rounded w-5/6" />
      <div className="h-4 bg-zinc-100 rounded w-4/6" />
      <div className="h-4 bg-zinc-100 rounded w-2/3" />
      <div className="mt-4 h-4 bg-zinc-100 rounded w-1/2" />
    </div>
  );
}

