/**
 * Demo Badge Component
 * Displays a badge to mark demo/example content
 */

import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface DemoBadgeProps {
  variant?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
  className?: string;
}

export default function DemoBadge({
  variant = 'small',
  showTooltip = true,
  className = '',
}: DemoBadgeProps) {
  const [showTooltipContent, setShowTooltipContent] = useState(false);

  const sizeClasses = {
    small: 'text-xs px-2 py-0.5',
    medium: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-2',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <span
        className={`
          inline-flex items-center gap-1 rounded-full font-medium
          bg-blue-100 dark:bg-blue-900/30
          text-blue-800 dark:text-blue-300
          border border-blue-200 dark:border-blue-700
          ${sizeClasses[variant]}
        `}
        onMouseEnter={() => showTooltip && setShowTooltipContent(true)}
        onMouseLeave={() => setShowTooltipContent(false)}
      >
        <span>Ejemplo</span>
        {showTooltip && (
          <InformationCircleIcon className="h-3.5 w-3.5" />
        )}
      </span>

      {/* Tooltip */}
      {showTooltip && showTooltipContent && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-lg">
          <div className="font-semibold mb-1">Contenido de demostración</div>
          <p className="text-gray-300 dark:text-gray-400">
            Esta es una oferta de ejemplo. La plataforma tiene más contenido real en tu zona.
          </p>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Inline Demo Indicator (for compact spaces)
 */
interface DemoIndicatorProps {
  className?: string;
}

export function DemoIndicator({ className = '' }: DemoIndicatorProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 text-xs font-medium
        text-blue-600 dark:text-blue-400
        ${className}
      `}
    >
      <InformationCircleIcon className="h-3.5 w-3.5" />
      <span>Demo</span>
    </span>
  );
}
