import { LayoutGrid, Map } from 'lucide-react';

export type ViewMode = 'cards' | 'map';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1" role="group" aria-label="Cambiar vista">
      <button
        onClick={() => onViewModeChange('cards')}
        aria-label="Ver como tarjetas"
        aria-pressed={viewMode === 'cards'}
        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 ${
          viewMode === 'cards'
            ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
        title="Cards"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="font-medium hidden sm:inline">Cards</span>
      </button>
      <button
        onClick={() => onViewModeChange('map')}
        aria-label="Ver en mapa"
        aria-pressed={viewMode === 'map'}
        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 ${
          viewMode === 'map'
            ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
        title="Mapa"
      >
        <Map className="h-4 w-4" />
        <span className="font-medium hidden sm:inline">Mapa</span>
      </button>
    </div>
  );
}
