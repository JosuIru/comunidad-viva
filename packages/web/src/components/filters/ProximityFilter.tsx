'use client';

import { useState, useEffect } from 'react';
import { MapPinIcon, PencilIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface ProximityFilterProps {
  value: number;
  onChange: (distance: number) => void;
  onLocationChange?: (coords: { lat: number; lng: number } | null) => void;
  label?: string;
  className?: string;
}

const DISTANCE_OPTIONS = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
  { value: 0, label: 'Todas las distancias' },
];

export default function ProximityFilter({
  value,
  onChange,
  onLocationChange,
  label = 'Proximidad',
  className = '',
}: ProximityFilterProps) {
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showCustomLocation, setShowCustomLocation] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationName, setLocationName] = useState<string>('');

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Tu navegador no soporta geolocalización');
      return;
    }

    setLocationError(null);
    setShowCustomLocation(false);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        setLocationEnabled(true);
        setLocationName('Tu ubicación');
        onLocationChange?.(coords);
      },
      (error) => {
        let errorMessage = 'Error al obtener ubicación';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Permiso de ubicación denegado';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Ubicación no disponible';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Tiempo de espera agotado';
        }
        setLocationError(errorMessage);
        setLocationEnabled(false);
        setUserLocation(null);
        onLocationChange?.(null);
      }
    );
  };

  // Geocode location search using backend proxy
  const handleLocationSearch = async () => {
    if (!locationSearch.trim()) return;

    setIsSearchingLocation(true);
    setLocationError(null);

    try {
      // Use backend API to avoid CORS issues
      const { api } = await import('@/lib/api');
      const response = await api.get('/search/geocode', {
        params: { q: locationSearch }
      });

      const data = response.data;

      console.log('Geocode search results:', data);

      if (data && data.length > 0) {
        // Prefer results that are cities, towns, or villages
        const preferredResult = data.find((result: any) =>
          ['city', 'town', 'village', 'municipality'].includes(result.type)
        ) || data[0];

        const lat = parseFloat(preferredResult.lat);
        const lng = parseFloat(preferredResult.lon);
        const coords = { lat, lng };

        setUserLocation(coords);
        setLocationEnabled(true);
        setLocationName(preferredResult.display_name || locationSearch);
        setShowCustomLocation(false);
        onLocationChange?.(coords);

        // Automatically set 5km radius when a location is selected if no radius is set
        if (value === 0) {
          onChange(5);
        }
      } else {
        setLocationError('No se encontró la ubicación. Intenta con otro nombre o escribe más detalles.');
      }
    } catch (error) {
      console.error('Error geocoding:', error);
      setLocationError('Error al buscar la ubicación. Intenta de nuevo.');
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const disableLocation = () => {
    setLocationEnabled(false);
    setUserLocation(null);
    setLocationError(null);
    setShowCustomLocation(false);
    setLocationSearch('');
    setLocationName('');
    onChange(0);
    onLocationChange?.(null);
  };

  const editLocation = () => {
    setShowCustomLocation(true);
    setLocationEnabled(false);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
        <MapPinIcon className="h-4 w-4" />
        {label}
      </label>

      <div className="space-y-3">
        {/* Location toggle */}
        <div className="flex items-center gap-2">
          {!locationEnabled ? (
            <>
              <button
                onClick={requestLocation}
                type="button"
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <MapPinIcon className="h-4 w-4" />
                Mi ubicación
              </button>
              <button
                onClick={() => setShowCustomLocation(!showCustomLocation)}
                type="button"
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                title="Ubicación personalizada"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              onClick={disableLocation}
              type="button"
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors text-sm font-medium"
            >
              Desactivar proximidad
            </button>
          )}
        </div>

        {/* Custom location input - Search by address */}
        {showCustomLocation && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              Buscar ubicación:
            </p>
            <div className="relative">
              <input
                type="text"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLocationSearch();
                  }
                }}
                placeholder="Ej: Bilbao, Pamplona, Madrid..."
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <button
              onClick={handleLocationSearch}
              disabled={isSearchingLocation || !locationSearch.trim()}
              type="button"
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              {isSearchingLocation ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Buscando...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  Buscar ubicación
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Escribe el nombre de un pueblo, ciudad o dirección
            </p>
          </div>
        )}

        {/* Distance selector - only show when location is enabled */}
        {locationEnabled && userLocation && !showCustomLocation && (
          <div>
            <select
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {DISTANCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1 mr-2" title={locationName}>
                📍 {locationName || `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`}
              </p>
              <button
                onClick={editLocation}
                type="button"
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 flex-shrink-0"
              >
                <PencilIcon className="h-3 w-3" />
                Cambiar
              </button>
            </div>
          </div>
        )}

        {/* Location error */}
        {locationError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-300">{locationError}</p>
          </div>
        )}

        {/* Info text when disabled */}
        {!locationEnabled && !locationError && !showCustomLocation && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Activa la proximidad para ver solo resultados cercanos a una ubicación
          </p>
        )}
      </div>
    </div>
  );
}
