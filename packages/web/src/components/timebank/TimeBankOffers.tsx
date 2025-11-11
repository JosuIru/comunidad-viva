'use client';

import { useQuery } from '@tanstack/react-query';
import { ClockIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface TimeBankOffersProps {
  onSelectOffer?: (offer: any) => void;
}

const EXPERIENCE_LABELS: Record<string, string> = {
  BEGINNER: 'Principiante',
  INTERMEDIATE: 'Intermedio',
  EXPERT: 'Experto',
};

const EXPERIENCE_COLORS: Record<string, string> = {
  BEGINNER: 'bg-green-100 text-green-800',
  INTERMEDIATE: 'bg-blue-100 text-blue-800',
  EXPERT: 'bg-purple-100 text-purple-800',
};

export default function TimeBankOffers({ onSelectOffer }: TimeBankOffersProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['timebank', 'offers'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/timebank/offers`);
      if (!response.ok) throw new Error('Error al cargar ofertas');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Ofertas de Banco de Tiempo</h3>
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data?.offers || data.offers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
        <div className="flex justify-center mb-4">
          <ClockIcon className="h-24 w-24 text-gray-400" />
        </div>
        <p className="text-gray-600 mb-2">No hay ofertas disponibles</p>
        <p className="text-sm text-gray-500">
          Sé el primero en ofrecer tu tiempo a la comunidad
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Ofertas de Banco de Tiempo</h3>
        <p className="text-sm text-gray-600 mt-1">
          {data.total} {data.total === 1 ? 'oferta disponible' : 'ofertas disponibles'}
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {data.offers.map((offer: any) => (
          <div
            key={offer.id}
            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => onSelectOffer?.(offer)}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                {offer.offer.user.name?.[0]?.toUpperCase() || '?'}
              </div>

              <div className="flex-1 min-w-0">
                {/* User name and skill */}
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-gray-900">{offer.offer.user.name}</p>
                  {offer.skill && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {offer.skill.name}
                    </span>
                  )}
                </div>

                {/* Offer title/description */}
                <p className="text-sm text-gray-900 mb-2 line-clamp-2">
                  {offer.offer.title}
                </p>

                {/* Details */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    {offer.estimatedHours}h estimadas
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      EXPERIENCE_COLORS[offer.experienceLevel] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {EXPERIENCE_LABELS[offer.experienceLevel] || offer.experienceLevel}
                  </span>

                  {offer.canTeach && (
                    <span className="flex items-center gap-1 text-green-600">
                      <AcademicCapIcon className="h-4 w-4" />
                      Puede enseñar
                    </span>
                  )}

                  {offer.skill?.category && (
                    <span className="text-gray-500">
                      {offer.skill.category}
                    </span>
                  )}
                </div>

                {/* Tools needed */}
                {offer.toolsNeeded?.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    <span className="font-medium">Herramientas: </span>
                    {offer.toolsNeeded.join(', ')}
                  </div>
                )}
              </div>

              {/* Action button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectOffer?.(offer);
                }}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex-shrink-0"
              >
                Solicitar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {data.total > data.offers.length && (
        <div className="p-4 border-t border-gray-200 text-center">
          <button className="text-sm text-green-600 hover:text-green-700 font-medium">
            Ver más ofertas
          </button>
        </div>
      )}
    </div>
  );
}
