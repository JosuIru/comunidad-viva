import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode, memo } from 'react';
import Image from 'next/image';
import { CubeIcon } from '@heroicons/react/24/outline';
import { isValidImageSrc, handleImageError } from '@/lib/imageUtils';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  hover?: boolean;
  clickable?: boolean;
  className?: string;
}

const Card = memo(function Card({
  children,
  hover = true,
  clickable = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <motion.div
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-md
        ${clickable ? 'cursor-pointer' : ''}
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={
        hover
          ? {
              y: -4,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }
          : {}
      }
      whileTap={clickable ? { scale: 0.98 } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
});

export default Card;

// Componente de Card con imagen
interface ImageCardProps extends Omit<CardProps, 'children'> {
  imageSrc?: string;
  imageAlt?: string;
  imagePlaceholder?: ReactNode;
  title: string;
  description?: string;
  footer?: ReactNode;
  children?: ReactNode;
}

export const ImageCard = memo(function ImageCard({
  imageSrc,
  imageAlt,
  imagePlaceholder,
  title,
  description,
  footer,
  children,
  ...props
}: ImageCardProps) {
  return (
    <Card {...props}>
      {/* Image or Placeholder */}
      <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-t-lg overflow-hidden relative">
        {isValidImageSrc(imageSrc) ? (
          <Image
            src={imageSrc}
            alt={imageAlt || title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            {imagePlaceholder || <CubeIcon className="h-24 w-24" />}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
        {description && <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>}
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 rounded-b-lg">
          {footer}
        </div>
      )}
    </Card>
  );
});
