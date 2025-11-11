import { memo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { isValidImageSrc, handleImageError } from '@/lib/imageUtils';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

// Generate a consistent color based on the name
const getColorFromName = (name: string): string => {
  const colors = [
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
    'from-yellow-400 to-yellow-600',
    'from-red-400 to-red-600',
    'from-indigo-400 to-indigo-600',
    'from-teal-400 to-teal-600',
    'from-orange-400 to-orange-600',
    'from-cyan-400 to-cyan-600',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

// Get initials from name
const getInitials = (name: string): string => {
  if (!name) return '?';

  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  const initials = getInitials(name);
  const gradient = getColorFromName(name);

  if (isValidImageSrc(src)) {
    const sizeMap = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 };
    const pixelSize = sizeMap[size];

    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white dark:ring-gray-800 shadow-md relative ${className}`}
      >
        <Image
          src={src}
          alt={name}
          width={pixelSize}
          height={pixelSize}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={handleImageError}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 ring-2 ring-white dark:ring-gray-800 shadow-md ${className}`}
    >
      <span className="font-bold text-white select-none">{initials}</span>
    </motion.div>
  );
}

// Memoize with custom comparison for better performance
export default memo(Avatar, (prevProps, nextProps) => {
  return (
    prevProps.name === nextProps.name &&
    prevProps.src === nextProps.src &&
    prevProps.size === nextProps.size &&
    prevProps.className === nextProps.className
  );
});
