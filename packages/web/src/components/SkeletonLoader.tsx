import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'profile' | 'feed';
  count?: number;
}

export default function SkeletonLoader({ type = 'card', count = 3 }: SkeletonLoaderProps) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <Skeleton height={200} />
            <div className="p-6">
              <Skeleton height={24} width="80%" className="mb-2" />
              <Skeleton count={2} className="mb-4" />
              <div className="flex gap-4">
                <Skeleton width={60} height={20} />
                <Skeleton width={60} height={20} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center gap-4">
            <Skeleton circle width={48} height={48} />
            <div className="flex-1">
              <Skeleton width="60%" height={20} className="mb-2" />
              <Skeleton width="40%" height={16} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-6 mb-6">
          <Skeleton circle width={100} height={100} />
          <div className="flex-1">
            <Skeleton width="50%" height={32} className="mb-2" />
            <Skeleton width="30%" height={20} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <Skeleton height={60} />
          </div>
          <div>
            <Skeleton height={60} />
          </div>
          <div>
            <Skeleton height={60} />
          </div>
        </div>
        <Skeleton count={4} />
      </div>
    );
  }

  if (type === 'feed') {
    return (
      <div className="space-y-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton circle width={40} height={40} />
              <div className="flex-1">
                <Skeleton width="30%" height={16} className="mb-1" />
                <Skeleton width="20%" height={14} />
              </div>
            </div>
            <Skeleton count={3} className="mb-4" />
            <Skeleton height={200} />
          </div>
        ))}
      </div>
    );
  }

  return <Skeleton count={count} />;
}
