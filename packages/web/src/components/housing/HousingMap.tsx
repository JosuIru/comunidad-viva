import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPinIcon } from '@heroicons/react/24/solid';

// Dynamic import for leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface Housing {
  id: string;
  title: string;
  lat: number;
  lng: number;
  type: string;
  price?: number;
  isFree?: boolean;
}

interface HousingMapProps {
  housings: Housing[];
  onMarkerClick?: (housing: Housing) => void;
  center?: [number, number];
  zoom?: number;
}

export default function HousingMap({ housings, onMarkerClick, center = [40.416775, -3.703790], zoom = 13 }: HousingMapProps) {
  useEffect(() => {
    // Import leaflet CSS
    // @ts-ignore - CSS import
    import('leaflet/dist/leaflet.css');

    // Fix for default marker icons in Next.js
    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        iconUrl: '/leaflet/marker-icon.png',
        shadowUrl: '/leaflet/marker-shadow.png',
      });
    });
  }, []);

  if (typeof window === 'undefined') {
    return (
      <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <MapPinIcon className="h-12 w-12 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-md">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {housings.map((housing) => (
          <Marker
            key={housing.id}
            position={[housing.lat, housing.lng]}
            eventHandlers={{
              click: () => onMarkerClick?.(housing),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {housing.title}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  {housing.type}
                </p>
                {housing.isFree ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Gratis
                  </span>
                ) : housing.price ? (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {housing.price} créditos
                  </span>
                ) : null}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
