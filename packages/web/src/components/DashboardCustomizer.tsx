import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardSettings, { AVAILABLE_WIDGETS, DashboardWidget } from '@/lib/dashboardSettings';
import Button from '@/components/Button';
import Analytics, { ANALYTICS_EVENTS } from '@/lib/analytics';

interface DashboardCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function DashboardCustomizer({ isOpen, onClose, onSave }: DashboardCustomizerProps) {
  const [enabledWidgetIds, setEnabledWidgetIds] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedTabFilter, setSelectedTabFilter] = useState<'all' | 'discover' | 'activity' | 'community'>('all');

  useEffect(() => {
    if (isOpen) {
      const currentEnabledWidgets = DashboardSettings.getEnabledWidgets();
      setEnabledWidgetIds(currentEnabledWidgets);
      setHasChanges(false);
    }
  }, [isOpen]);

  const handleToggleWidget = (widgetId: string) => {
    setEnabledWidgetIds(currentEnabledWidgets => {
      const newEnabledWidgets = currentEnabledWidgets.includes(widgetId)
        ? currentEnabledWidgets.filter(id => id !== widgetId)
        : [...currentEnabledWidgets, widgetId];

      setHasChanges(true);
      return newEnabledWidgets;
    });
  };

  const handleSave = () => {
    DashboardSettings.setEnabledWidgets(enabledWidgetIds);
    Analytics.track(ANALYTICS_EVENTS.DASHBOARD_CUSTOMIZED, {
      enabledCount: enabledWidgetIds.length,
      widgets: enabledWidgetIds,
    });
    setHasChanges(false);
    onSave();
    onClose();
  };

  const handleRestoreDefaults = () => {
    const defaultWidgetIds = Object.values(AVAILABLE_WIDGETS)
      .filter(widget => widget.defaultEnabled)
      .map(widget => widget.id);

    setEnabledWidgetIds(defaultWidgetIds);
    setHasChanges(true);
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmCancel = confirm('¿Descartar los cambios no guardados?');
      if (!confirmCancel) return;
    }
    onClose();
  };

  // Group widgets by tab
  const widgetsByTab: Record<string, DashboardWidget[]> = {
    discover: [],
    activity: [],
    community: [],
  };

  Object.values(AVAILABLE_WIDGETS).forEach(widget => {
    widgetsByTab[widget.tab].push(widget);
  });

  // Filter widgets based on selected tab
  const filteredWidgets = selectedTabFilter === 'all'
    ? Object.values(AVAILABLE_WIDGETS)
    : widgetsByTab[selectedTabFilter];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="fixed inset-0 bg-black/60 z-[10000] backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <span>⚙️</span>
                    <span>Personalizar Dashboard</span>
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Elige qué widgets mostrar en cada pestaña
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>

              {/* Tab Filter */}
              <div className="px-6 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => setSelectedTabFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedTabFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setSelectedTabFilter('discover')}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedTabFilter === 'discover'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    🏠 Descubre
                  </button>
                  <button
                    onClick={() => setSelectedTabFilter('activity')}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedTabFilter === 'activity'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    👤 Mi Actividad
                  </button>
                  <button
                    onClick={() => setSelectedTabFilter('community')}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedTabFilter === 'community'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    📊 Comunidad
                  </button>
                </div>
              </div>

              {/* Widgets List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {filteredWidgets.map(widget => {
                  const isWidgetEnabled = enabledWidgetIds.includes(widget.id);
                  const tabLabels = {
                    discover: '🏠 Descubre',
                    activity: '👤 Mi Actividad',
                    community: '📊 Comunidad',
                  };

                  return (
                    <motion.div
                      key={widget.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isWidgetEnabled
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                          : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={() => handleToggleWidget(widget.id)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Widget Icon */}
                        <div className={`text-4xl ${isWidgetEnabled ? 'grayscale-0' : 'grayscale opacity-50'}`}>
                          {widget.icon}
                        </div>

                        {/* Widget Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100">
                              {widget.name}
                            </h3>
                            {selectedTabFilter === 'all' && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                                {tabLabels[widget.tab]}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {widget.description}
                          </p>
                        </div>

                        {/* Toggle */}
                        <div className="flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleWidget(widget.id);
                            }}
                            className={`relative w-14 h-8 rounded-full transition-colors ${
                              isWidgetEnabled
                                ? 'bg-blue-600'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span
                              className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                                isWidgetEnabled ? 'left-7' : 'left-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Preview Info */}
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {enabledWidgetIds.length} de {Object.keys(AVAILABLE_WIDGETS).length} widgets activos
                  </span>
                  {hasChanges && (
                    <span className="text-orange-600 dark:text-orange-400 font-medium">
                      • Cambios sin guardar
                    </span>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={handleRestoreDefaults}
                  variant="ghost"
                  size="md"
                >
                  🔄 Restaurar Predeterminados
                </Button>
                <div className="flex gap-3">
                  <Button
                    onClick={handleCancel}
                    variant="ghost"
                    size="md"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant="primary"
                    size="md"
                    disabled={!hasChanges}
                  >
                    💾 Guardar Cambios
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
