import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Button from './Button';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ShoppingBagIcon,
  Cog6ToothIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  RocketLaunchIcon,
  HomeIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';

interface MapFilterPanelProps {
  show: boolean;
  onClose: () => void;
  selectedTypes: Set<string>;
  onTypesChange: (types: Set<string>) => void;
  selectedCommunities: Set<string>;
  onCommunitiesChange: (communities: Set<string>) => void;
  proximityRadius: number | null;
  onProximityChange: (radius: number | null) => void;
  proximityCenter: 'location' | 'community' | 'custom';
  onProximityCenterChange: (center: 'location' | 'community' | 'custom') => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  communities: any[];
  userLocation: [number, number] | null;
  userCommunity?: { id: string; name: string; lat: number; lng: number } | null;
  allItems?: Array<{ id: string; title: string; type: string }>;
  customLocation?: [number, number] | null;
  onCustomLocationChange?: (location: [number, number] | null) => void;
}

const contentTypes = [
  { id: 'offer', label: 'Ofertas', icon: ShoppingBagIcon, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  { id: 'service', label: 'Servicios', icon: Cog6ToothIcon, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  { id: 'event', label: 'Eventos', icon: CalendarDaysIcon, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  { id: 'need', label: 'Necesidades', icon: ExclamationTriangleIcon, color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  { id: 'project', label: 'Proyectos', icon: RocketLaunchIcon, color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' },
  { id: 'housing', label: 'Vivienda', icon: HomeIcon, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
];

export default function MapFilterPanel({
  show,
  onClose,
  selectedTypes,
  onTypesChange,
  selectedCommunities,
  onCommunitiesChange,
  proximityRadius,
  onProximityChange,
  proximityCenter,
  onProximityCenterChange,
  searchText,
  onSearchChange,
  communities,
  userLocation,
  userCommunity,
  allItems = [],
  customLocation,
  onCustomLocationChange,
}: MapFilterPanelProps) {
  const tToasts = useTranslations('toasts');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  // Filter suggestions based on search text
  const suggestions = searchText.trim().length > 0
    ? allItems
        .filter(item => item.title.toLowerCase().includes(searchText.toLowerCase()))
        .slice(0, 10) // Limit to 10 suggestions
    : [];

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleType = (typeId: string) => {
    const newTypes = new Set(selectedTypes);
    if (newTypes.has(typeId)) {
      newTypes.delete(typeId);
    } else {
      newTypes.add(typeId);
    }
    onTypesChange(newTypes);
  };

  const handleSearchChange = (value: string) => {
    onSearchChange(value);
    setShowSuggestions(value.trim().length > 0);
    setSelectedSuggestionIndex(-1);
  };

  const handleSuggestionClick = (suggestion: { title: string }) => {
    onSearchChange(suggestion.title);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const toggleCommunity = (communityId: string) => {
    const newCommunities = new Set(selectedCommunities);
    const isAdding = !newCommunities.has(communityId);

    if (newCommunities.has(communityId)) {
      newCommunities.delete(communityId);
      // Al deseleccionar la última comunidad, limpiar el filtro de proximidad
      if (newCommunities.size === 0) {
        onProximityChange(null);
        onCustomLocationChange?.(null);
      }
    } else {
      newCommunities.add(communityId);

      // Al seleccionar una comunidad, activar filtro de proximidad
      if (isAdding) {
        const selectedCommunity = communities.find(c => c.id === communityId);
        if (selectedCommunity && selectedCommunity.lat && selectedCommunity.lng) {
          // Establecer la ubicación personalizada en la comunidad seleccionada
          onCustomLocationChange?.([selectedCommunity.lat, selectedCommunity.lng]);
          // Cambiar el centro de proximidad a "custom" (que ahora es la comunidad)
          onProximityCenterChange('custom');
          // Activar filtro de proximidad con un radio razonable
          if (proximityRadius === null) {
            // Usar el radio de la comunidad si está disponible, si no, un valor por defecto
            const defaultRadius = selectedCommunity.radiusKm || 5;
            onProximityChange(defaultRadius);
          }
        }
      }
    }
    onCommunitiesChange(newCommunities);
  };

  const clearAllFilters = () => {
    onTypesChange(new Set(['offer', 'service', 'event', 'need', 'project', 'housing']));
    onCommunitiesChange(new Set());
    onProximityChange(null);
    onSearchChange('');
    setLocationSearch('');
    onCustomLocationChange?.(null);
  };

  // Geocode location search using OpenStreetMap Nominatim
  const handleLocationSearch = async () => {
    if (!locationSearch.trim() || !onCustomLocationChange) return;

    setIsSearchingLocation(true);
    try {
      // Add User-Agent header as required by Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&q=${encodeURIComponent(locationSearch)}&limit=5&countrycodes=es&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ComunidadViva/1.0',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log('Nominatim search results:', data);

      if (data && data.length > 0) {
        // Prefer results that are cities, towns, or villages
        const preferredResult = data.find((result: any) =>
          ['city', 'town', 'village', 'municipality'].includes(result.type)
        ) || data[0];

        const lat = parseFloat(preferredResult.lat);
        const lon = parseFloat(preferredResult.lon);
        onCustomLocationChange([lat, lon]);
        onProximityCenterChange('custom');
        // Automatically set 5km radius when a location is selected
        if (proximityRadius === null) {
          onProximityChange(5);
        }
      } else {
        alert(tToasts('locationNotFound'));
      }
    } catch (error) {
      console.error('Error geocoding:', error);
      alert(tToasts('locationSearchError'));
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const hasActiveFilters =
    selectedTypes.size < 6 ||
    selectedCommunities.size > 0 ||
    proximityRadius !== null ||
    searchText.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 desktop:rounded-lg desktop:shadow-lg desktop:border desktop:border-gray-200 desktop:dark:border-gray-700 desktop:sticky desktop:top-4 flex flex-col desktop:max-h-[calc(100vh-32px)]">
      <div className="desktop:p-6 desktop:overflow-y-auto desktop:flex-1">
        {/* Header with Clear Button - Desktop Only */}
        <div className="hidden desktop:flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FunnelIcon className="h-5 w-5" />
            <span>Filtros</span>
          </h2>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Limpiar todo
            </button>
          )}
        </div>

        {/* Clear Button - Mobile Only */}
        {hasActiveFilters && (
          <div className="desktop:hidden mb-4">
            <button
              onClick={clearAllFilters}
              className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium text-center py-2"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}

        {/* Search with Suggestions */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-1">
            <MagnifyingGlassIcon className="h-4 w-4" />
            <span>Buscar</span>
          </label>
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => searchText.trim().length > 0 && setShowSuggestions(true)}
              placeholder="Buscar por título..."
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all"
              autoComplete="off"
            />
            {searchText && (
              <button
                onClick={() => {
                  onSearchChange('');
                  setShowSuggestions(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-full p-1"
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                ref={suggestionsRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-xl max-h-64 overflow-y-auto"
              >
                {suggestions.map((suggestion, index) => {
                  const typeConfig = contentTypes.find(t => t.id === suggestion.type);
                  const IconComponent = typeConfig?.icon || MapPinIcon;

                  return (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-3 ${
                        index === selectedSuggestionIndex
                          ? 'bg-blue-50 dark:bg-blue-900/30'
                          : ''
                      }`}
                    >
                      <IconComponent className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {suggestion.title}
                        </p>
                        {typeConfig && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {typeConfig.label}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* No results message */}
          {showSuggestions && searchText.trim().length > 0 && suggestions.length === 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-lg p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No se encontraron resultados
            </div>
          )}
        </div>

        {/* Content Types - Grid Layout */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide flex items-center gap-1">
            <FolderIcon className="h-4 w-4" />
            <span>Tipos de contenido</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {contentTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => toggleType(type.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl transition-all border-2 ${
                    selectedTypes.has(type.id)
                      ? `${type.color} border-current scale-105 shadow-sm`
                      : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:scale-105'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="text-xs font-medium truncate">
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Proximity Filter */}
        <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
          <label className="block text-xs font-semibold text-blue-900 dark:text-blue-100 mb-3 uppercase tracking-wide flex items-center gap-1">
            <MapPinIcon className="h-4 w-4" />
            <span>Distancia</span>
          </label>

          {!(userLocation || userCommunity || customLocation) && proximityCenter !== 'custom' ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border-2 border-yellow-300 dark:border-yellow-700">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                ⚠️ No disponible
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
                Activa la geolocalización, únete a una comunidad o busca una ubicación personalizada.
              </p>
              <button
                onClick={() => onProximityCenterChange('custom')}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                🔍 Buscar ubicación personalizada
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Center Selection - Now includes Custom */}
              <div className="flex flex-col gap-2">
                {userLocation && (
                  <button
                    onClick={() => onProximityCenterChange('location')}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                      proximityCenter === 'location'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <MapPinIcon className="h-4 w-4" />
                    <span>Mi ubicación</span>
                  </button>
                )}
                {userCommunity && (
                  <button
                    onClick={() => onProximityCenterChange('community')}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                      proximityCenter === 'community'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <BuildingOfficeIcon className="h-4 w-4" />
                    <span>Comunidad</span>
                  </button>
                )}
                <button
                  onClick={() => onProximityCenterChange('custom')}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                    proximityCenter === 'custom'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <GlobeAltIcon className="h-4 w-4" />
                  <span>Ubicación personalizada</span>
                </button>
              </div>

              {/* Custom Location Search */}
              {proximityCenter === 'custom' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 space-y-2">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Buscar ubicación
                  </label>
                  <input
                    type="text"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                    placeholder="Ej: Pamplona, Plaza del Castillo..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                  <button
                    onClick={handleLocationSearch}
                    disabled={!locationSearch.trim() || isSearchingLocation}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {isSearchingLocation ? '⏳ Buscando...' : '🔍 Buscar ubicación'}
                  </button>
                  {customLocation && (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-300 dark:border-green-700">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-1">
                          ✓ Ubicación establecida
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                          📍 {customLocation[0].toFixed(4)}, {customLocation[1].toFixed(4)}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          onCustomLocationChange?.(null);
                          setLocationSearch('');
                        }}
                        className="px-3 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md font-medium transition-colors"
                      >
                        Limpiar
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Current Value Display with Zoom Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="text-center mb-2">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {proximityRadius === null ? '∞' : `${proximityRadius} km`}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {proximityRadius === null ? 'Sin límite' : 'Radio de búsqueda'}
                  </div>
                </div>

                {/* Zoom Level Indicator */}
                {proximityRadius !== null && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">🔍 Zoom del mapa:</span>
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {proximityRadius <= 1 ? '14 (máximo)' :
                         proximityRadius <= 2 ? '13' :
                         proximityRadius <= 5 ? '12' :
                         proximityRadius <= 10 ? '11' :
                         proximityRadius <= 25 ? '10' :
                         proximityRadius <= 50 ? '9' :
                         proximityRadius <= 100 ? '8' : '7'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Slider */}
              <div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={proximityRadius ?? 0}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    onProximityChange(value === 0 ? null : value);
                  }}
                  className="w-full h-3 bg-gradient-to-r from-blue-200 to-blue-400 dark:from-blue-800 dark:to-blue-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Quick distance buttons - More compact */}
              <div className="grid grid-cols-5 gap-1.5">
                {[5, 10, 25, 50].map((distance) => (
                  <button
                    key={distance}
                    onClick={() => onProximityChange(distance)}
                    className={`px-2 py-2 text-xs rounded-lg font-bold transition-all ${
                      proximityRadius === distance
                        ? 'bg-blue-600 text-white shadow-lg scale-110'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600 hover:scale-105'
                    }`}
                  >
                    {distance}
                  </button>
                ))}
                <button
                  onClick={() => onProximityChange(null)}
                  className={`px-2 py-2 text-xs rounded-lg font-bold transition-all ${
                    proximityRadius === null
                      ? 'bg-blue-600 text-white shadow-lg scale-110'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600 hover:scale-105'
                  }`}
                >
                  ∞
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Communities Filter - Collapsible */}
        {communities && communities.length > 0 && (
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide flex items-center gap-1">
              <BuildingOfficeIcon className="h-4 w-4" />
              <span>Comunidades ({selectedCommunities.size > 0 ? selectedCommunities.size : 'Todas'})</span>
            </label>
            <div className="space-y-1.5 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-2">
              {communities.map((community: any) => (
                <button
                  key={community.id}
                  onClick={() => toggleCommunity(community.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                    selectedCommunities.has(community.id)
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 border-2 border-blue-500'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    selectedCommunities.has(community.id) ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                  <span className="text-sm font-medium truncate flex-1 text-left">
                    {community.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
