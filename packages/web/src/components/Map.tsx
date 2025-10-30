import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createIcon = (color: string) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

export const icons = {
  offer: createIcon('blue'),
  service: createIcon('green'),
  event: createIcon('orange'),
  user: createIcon('violet'),
  merchant: createIcon('red'),
  need: createIcon('yellow'),
  project: createIcon('gold'),
  housing: createIcon('grey'),
};

interface MapPin {
  id: string;
  type: 'offer' | 'service' | 'event' | 'user' | 'merchant' | 'need' | 'project' | 'housing';
  position: [number, number];
  title: string;
  description?: string;
  link?: string;
  image?: string;
}

interface MapProps {
  center?: [number, number];
  zoom?: number;
  pins?: MapPin[];
  height?: string;
  onPinClick?: (pin: MapPin) => void;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function Map({
  center = [42.8125, -1.6458], // Navarra (Pamplona)
  zoom = 13,
  pins = [],
  height = '500px',
  onPinClick,
}: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="bg-gray-200 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-gray-600">Cargando mapa...</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden shadow-lg" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <ChangeView center={center} zoom={zoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pins.map((pin) => (
          <Marker
            key={pin.id}
            position={pin.position}
            icon={icons[pin.type]}
            eventHandlers={{
              click: () => {
                if (onPinClick) {
                  onPinClick(pin);
                }
              },
            }}
          >
            <Popup maxWidth={300} minWidth={250}>
              <div className="p-2">
                {pin.image && (
                  <div className="mb-2">
                    <img
                      src={pin.image}
                      alt={pin.title}
                      className="w-full h-32 object-cover rounded"
                      style={{ maxWidth: '100%', display: 'block' }}
                      onError={(e) => {
                        console.error('Error loading image:', pin.image);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 mb-1">{pin.title}</h3>
                {pin.description && (
                  <p className="text-sm text-gray-600 mb-2">{pin.description}</p>
                )}
                {pin.link && (
                  <a
                    href={pin.link}
                    className="text-sm text-green-600 hover:underline inline-block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Ver detalles →
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
