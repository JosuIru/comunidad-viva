import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function CommunityStats() {
  const { data: stats } = useQuery({
    queryKey: ['community-stats'],
    queryFn: () => api.get('/analytics/community/metrics'),
  });

  const metrics = stats?.data?.[0] || {};

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {metrics.activeUsers || 0}
            </p>
            <p className="text-sm text-gray-600">Usuarios Activos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {metrics.hoursExchanged || 0}h
            </p>
            <p className="text-sm text-gray-600">Horas Compartidas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              €{metrics.eurosSaved || 0}
            </p>
            <p className="text-sm text-gray-600">Ahorro Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {metrics.co2Avoided || 0}kg
            </p>
            <p className="text-sm text-gray-600">CO2 Evitado</p>
          </div>
        </div>
      </div>
    </div>
  );
}
