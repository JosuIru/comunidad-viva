import { LayoutGrid, Map } from 'lucide-react';

export type ViewMode = 'cards' | 'map';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <button
        onClick={() => onViewModeChange('cards')}
        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md transition-all ${
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
        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md transition-all ${
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
