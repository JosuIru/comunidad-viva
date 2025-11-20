import Link from 'next/link';
import { motion } from 'framer-motion';
import Button from './Button';
import { ReactNode } from 'react';

interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

interface EmptyStateProps {
  icon: string | ReactNode;
  title: string;
  description: string;
  actions?: EmptyStateAction[];
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actions,
  className = '',
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`text-center py-12 px-4 ${className}`}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="text-6xl md:text-8xl mb-6"
      >
        {icon}
      </motion.div>

      {/* Title */}
      <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-sm md:text-base">
        {description}
      </p>

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {actions.map((action, index) => (
            action.href ? (
              <Link key={index} href={action.href}>
                <Button variant={action.variant || 'primary'} size="md">
                  {action.label}
                </Button>
              </Link>
            ) : (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant || 'primary'}
                size="md"
              >
                {action.label}
              </Button>
            )
          ))}
        </div>
      )}
    </motion.div>
  );
}
