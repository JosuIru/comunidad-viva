import React from 'react';

export interface LayerIconProps {
  className?: string;
  size?: number;
}

/**
 * Icon for TRADITIONAL layer - Bank/Building representing capitalism
 */
export function TraditionalIcon({ className = '', size = 24 }: LayerIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3 21h18M3 10h18M5 6l7-3 7 3M6 10v7M10 10v7M14 10v7M18 10v7M4 21h16v-4H4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Icon for TRANSITIONAL layer - Arrows representing transition/flow
 */
export function TransitionalIcon({ className = '', size = 24 }: LayerIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M7 7l5-5 5 5M12 2v12M5 12l-3 3 3 3M2 15h8M19 12l3 3-3 3M14 15h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Icon for GIFT_PURE layer - Gift box representing pure gift economy
 */
export function GiftPureIcon({ className = '', size = 24 }: LayerIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7C12 5.5 13 3 15 3s3 2 3 4-2 3-3 3H9c-1 0-3-1-3-3s1-4 3-4 3 1.5 3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Icon for CHAMELEON layer - Chameleon representing adaptability
 */
export function ChameleonIcon({ className = '', size = 24 }: LayerIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2C8 2 5 5 5 9c0 2 1 4 2 5l-3 3c-1 1-1 3 0 4s3 1 4 0l3-3c1 1 3 2 5 2 4 0 7-3 7-7s-3-7-7-7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="15" cy="9" r="1" fill="currentColor" />
      <path
        d="M9 12c1 1 3 1 4 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Get the appropriate icon component for a given economic layer
 */
export function getLayerIcon(layer: 'TRADITIONAL' | 'TRANSITIONAL' | 'GIFT_PURE' | 'CHAMELEON') {
  switch (layer) {
    case 'TRADITIONAL':
      return TraditionalIcon;
    case 'TRANSITIONAL':
      return TransitionalIcon;
    case 'GIFT_PURE':
      return GiftPureIcon;
    case 'CHAMELEON':
      return ChameleonIcon;
    default:
      return TraditionalIcon;
  }
}

/**
 * Get layer colors for styling
 */
export function getLayerColors(layer: 'TRADITIONAL' | 'TRANSITIONAL' | 'GIFT_PURE' | 'CHAMELEON') {
  switch (layer) {
    case 'TRADITIONAL':
      return {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-300 dark:border-blue-700',
        hover: 'hover:bg-blue-200 dark:hover:bg-blue-800/40',
      };
    case 'TRANSITIONAL':
      return {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-300',
        border: 'border-green-300 dark:border-green-700',
        hover: 'hover:bg-green-200 dark:hover:bg-green-800/40',
      };
    case 'GIFT_PURE':
      return {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-300 dark:border-purple-700',
        hover: 'hover:bg-purple-200 dark:hover:bg-purple-800/40',
      };
    case 'CHAMELEON':
      return {
        bg: 'bg-gradient-to-r from-blue-100 via-green-100 to-purple-100 dark:from-blue-900/30 dark:via-green-900/30 dark:to-purple-900/30',
        text: 'text-gray-700 dark:text-gray-300',
        border: 'border-gray-300 dark:border-gray-700',
        hover: 'hover:from-blue-200 hover:via-green-200 hover:to-purple-200 dark:hover:from-blue-800/40 dark:hover:via-green-800/40 dark:hover:to-purple-800/40',
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-700 dark:text-gray-300',
        border: 'border-gray-300 dark:border-gray-700',
        hover: 'hover:bg-gray-200 dark:hover:bg-gray-700',
      };
  }
}

/**
 * Get layer names for display
 */
export function getLayerName(layer: 'TRADITIONAL' | 'TRANSITIONAL' | 'GIFT_PURE' | 'CHAMELEON') {
  switch (layer) {
    case 'TRADITIONAL':
      return 'Tradicional';
    case 'TRANSITIONAL':
      return 'Transicional';
    case 'GIFT_PURE':
      return 'Regalo Puro';
    case 'CHAMELEON':
      return 'Camaleón';
    default:
      return 'Tradicional';
  }
}
