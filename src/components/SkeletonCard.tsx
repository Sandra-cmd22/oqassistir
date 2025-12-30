export function SkeletonCard() {
  return (
    <div className="shrink-0 w-[140px]">
      <div className="relative mb-2 rounded-[10px] overflow-hidden bg-white/10 aspect-[2/3]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
      </div>
      <div className="h-[36px] bg-white/10 rounded-[4px] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
      </div>
    </div>
  );
}

export function SkeletonSection() {
  return (
    <div className="mb-8">
      <div className="px-6 mb-4 flex items-center gap-2">
        <div className="w-4 h-4 bg-white/10 rounded animate-pulse"></div>
        <div className="h-6 w-32 bg-white/10 rounded animate-pulse"></div>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide px-6 pb-2 scroll-smooth">
        {[...Array(5)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

