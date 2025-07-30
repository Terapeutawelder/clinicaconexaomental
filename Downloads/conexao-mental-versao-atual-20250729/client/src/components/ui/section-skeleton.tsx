import { memo } from 'react';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface SectionSkeletonProps {
  height?: string;
  className?: string;
}

const SectionSkeleton = memo(({ height = 'h-64', className = '' }: SectionSkeletonProps) => {
  return (
    <div className={`${height} bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse flex items-center justify-center ${className}`}>
      <LoadingSpinner size="lg" />
    </div>
  );
});

SectionSkeleton.displayName = 'SectionSkeleton';

export default SectionSkeleton;