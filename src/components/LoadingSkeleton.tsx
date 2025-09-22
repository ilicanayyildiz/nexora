interface SkeletonProps {
  className?: string;
  height?: string;
  width?: string;
  rounded?: boolean;
}

export default function LoadingSkeleton({ 
  className = "", 
  height = "h-4", 
  width = "w-full", 
  rounded = true 
}: SkeletonProps) {
  return (
    <div 
      className={`loading-skeleton ${height} ${width} ${rounded ? 'rounded' : ''} ${className}`}
    />
  );
}

// Predefined skeleton components
export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/10 p-6 space-y-4">
      <LoadingSkeleton height="h-6" width="w-3/4" />
      <LoadingSkeleton height="h-4" width="w-full" />
      <LoadingSkeleton height="h-4" width="w-2/3" />
      <div className="flex gap-3">
        <LoadingSkeleton height="h-8" width="w-20" />
        <LoadingSkeleton height="h-8" width="w-20" />
      </div>
    </div>
  );
}

export function SkeletonNFT() {
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden">
      <LoadingSkeleton height="h-64" width="w-full" rounded={false} />
      <div className="p-4 space-y-3">
        <LoadingSkeleton height="h-5" width="w-3/4" />
        <LoadingSkeleton height="h-4" width="w-1/2" />
        <div className="flex justify-between items-center">
          <LoadingSkeleton height="h-4" width="w-20" />
          <LoadingSkeleton height="h-8" width="w-24" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTransaction() {
  return (
    <div className="rounded-2xl border border-white/10 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <LoadingSkeleton height="h-12" width="w-12" className="rounded-full" />
          <div className="space-y-2">
            <LoadingSkeleton height="h-4" width="w-32" />
            <LoadingSkeleton height="h-3" width="w-24" />
          </div>
        </div>
        <div className="text-right space-y-2">
          <LoadingSkeleton height="h-4" width="w-16" />
          <LoadingSkeleton height="h-6" width="w-20" />
        </div>
      </div>
    </div>
  );
}
