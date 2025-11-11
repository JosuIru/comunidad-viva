'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getLayerIcon, getLayerColors, getLayerName } from './icons/EconomicLayerIcons';

export type EconomicLayer = 'TRADITIONAL' | 'TRANSITIONAL' | 'GIFT_PURE' | 'CHAMELEON';

interface EconomicLayerBadgeProps {
  layer: EconomicLayer;
  compact?: boolean;
  showDropdown?: boolean;
}

export default function EconomicLayerBadge({
  layer,
  compact = false,
  showDropdown = true
}: EconomicLayerBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const IconComponent = getLayerIcon(layer);
  const colors = getLayerColors(layer);
  const layerName = getLayerName(layer);

  const layerDescriptions = {
    TRADITIONAL: 'Sistema capitalista tradicional con créditos y medición completa',
    TRANSITIONAL: 'Transición hacia la economía del regalo con menor medición',
    GIFT_PURE: 'Economía del regalo pura sin medición ni rastro',
    CHAMELEON: 'Modo experimental que se adapta a tu interacción',
  };

  const badge = (
    <button
      onClick={() => showDropdown && setIsOpen(!isOpen)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${colors.bg} ${colors.text} ${colors.border} ${showDropdown ? colors.hover : ''} ${showDropdown ? 'cursor-pointer' : 'cursor-default'}`}
      title={layerDescriptions[layer]}
    >
      <IconComponent size={16} className={colors.text} />
      {!compact && (
        <>
          <span className="text-xs font-semibold hidden sm:inline">{layerName}</span>
          {showDropdown && (
            <svg
              className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </>
      )}
    </button>
  );

  if (!showDropdown) {
    return badge;
  }

  return (
    <div className="relative economic-layer-dropdown">
      {badge}

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-3 z-50 economic-layer-dropdown">
          {/* Current Layer Info */}
          <div className={`mx-3 mb-3 p-3 rounded-lg ${colors.bg} ${colors.border} border`}>
            <div className="flex items-center gap-2 mb-2">
              <IconComponent size={20} className={colors.text} />
              <h3 className={`font-bold text-sm ${colors.text}`}>
                Capa Económica: {layerName}
              </h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {layerDescriptions[layer]}
            </p>
          </div>

          {/* Quick Links */}
          <div className="px-3 space-y-1">
            <Link
              href="/hybrid/dashboard"
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 rounded-md transition"
              onClick={() => setIsOpen(false)}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div>
                <div className="font-medium">Dashboard Híbrido</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Ver tu economía personal
                </div>
              </div>
            </Link>

            <Link
              href="/hybrid/celebrations"
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 rounded-md transition"
              onClick={() => setIsOpen(false)}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <div>
                <div className="font-medium">Eventos Puente</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Explora otras capas temporalmente
                </div>
              </div>
            </Link>

            <Link
              href="/docs#hybrid"
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition"
              onClick={() => setIsOpen(false)}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="font-medium">Aprende Más</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Sobre el sistema híbrido
                </div>
              </div>
            </Link>
          </div>

          {/* Layer Migration CTA */}
          <div className="mt-3 mx-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/hybrid/dashboard"
              className="block w-full px-4 py-2 bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 hover:from-blue-600 hover:via-green-600 hover:to-purple-600 text-white text-center text-sm font-medium rounded-lg transition-all shadow-sm"
              onClick={() => setIsOpen(false)}
            >
              Cambiar de Capa Económica
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
