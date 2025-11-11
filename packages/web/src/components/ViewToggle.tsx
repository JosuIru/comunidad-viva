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
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
          viewMode === 'cards'
            ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="font-medium">Cards</span>
      </button>
      <button
        onClick={() => onViewModeChange('map')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
          viewMode === 'map'
            ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        <Map className="h-4 w-4" />
        <span className="font-medium">Mapa</span>
      </button>
    </div>
  );
}
