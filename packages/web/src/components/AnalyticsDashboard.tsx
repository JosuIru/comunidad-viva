import { useState, useEffect } from 'react';
import Analytics, { AnalyticsEvent } from '@/lib/analytics';

interface AnalyticsSummary {
  totalEvents: number;
  eventCounts: Record<string, number>;
  firstEvent?: number;
  lastEvent?: number;
}

export default function AnalyticsDashboard() {
  const [resumenAnalytics, setResumenAnalytics] = useState<AnalyticsSummary | null>(null);
  const [eventosRecientes, setEventosRecientes] = useState<AnalyticsEvent[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarAnalytics();
  }, []);

  const cargarAnalytics = () => {
    setCargando(true);
    try {
      const resumen = Analytics.getSummary();
      const eventos = Analytics.getEvents().slice(-20);

      setResumenAnalytics(resumen);
      setEventosRecientes(eventos.reverse());
    } catch (error) {
      console.error('Error cargando analytics:', error);
    } finally {
      setCargando(false);
    }
  };

  const limpiarAnalytics = () => {
    if (window.confirm('¿Estás seguro de que deseas limpiar todos los eventos de analytics?')) {
      Analytics.clear();
      setResumenAnalytics({
        totalEvents: 0,
        eventCounts: {},
        firstEvent: undefined,
        lastEvent: undefined,
      });
      setEventosRecientes([]);
    }
  };

  const obtenerTop5Eventos = (): Array<[string, number]> => {
    if (!resumenAnalytics) return [];

    return Object.entries(resumenAnalytics.eventCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const formatearFecha = (timestamp?: number): string => {
    if (!timestamp) return 'N/A';

    const fecha = new Date(timestamp);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    let etiquetaDia = '';
    if (fecha.toDateString() === hoy.toDateString()) {
      etiquetaDia = 'Hoy';
    } else if (fecha.toDateString() === ayer.toDateString()) {
      etiquetaDia = 'Ayer';
    } else {
      etiquetaDia = fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });
    }

    const hora = fecha.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return `${etiquetaDia} ${hora}`;
  };

  const colorPorIndice = (indice: number): string => {
    const colores = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600',
    ];
    return colores[indice % colores.length];
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">Cargando analytics...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard de Analytics
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Seguimiento de eventos e interacciones del usuario
          </p>
        </div>
        <button
          onClick={limpiarAnalytics}
          className="px-3 sm:px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base whitespace-nowrap"
        >
          Limpiar Analytics
        </button>
      </div>

      {/* Resumen Principal - Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Events Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-6 text-white shadow-lg border border-blue-400 dark:border-blue-600">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-blue-100 text-xs sm:text-sm font-medium">Total de Eventos</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2">{resumenAnalytics?.totalEvents || 0}</p>
            </div>
            <div className="bg-blue-400 dark:bg-blue-500 rounded-full p-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.5 1.5H3.75A2.25 2.25 0 001.5 3.75v12.5A2.25 2.25 0 003.75 18.5h12.5a2.25 2.25 0 002.25-2.25V9.5m-15-4h12m-12 4v10m12-10v10" />
              </svg>
            </div>
          </div>
        </div>

        {/* First Event Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-lg p-6 text-white shadow-lg border border-green-400 dark:border-green-600">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-green-100 text-xs sm:text-sm font-medium">Primer Evento</p>
              <p className="text-xs sm:text-sm md:text-base font-mono text-green-50 mt-2 break-words">
                {formatearFecha(resumenAnalytics?.firstEvent)}
              </p>
            </div>
            <div className="bg-green-400 dark:bg-green-500 rounded-full p-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.5H7a1 1 0 100 2h4a1 1 0 001-1V7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Last Event Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-lg p-6 text-white shadow-lg border border-purple-400 dark:border-purple-600">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-purple-100 text-xs sm:text-sm font-medium">Último Evento</p>
              <p className="text-xs sm:text-sm md:text-base font-mono text-purple-50 mt-2 break-words">
                {formatearFecha(resumenAnalytics?.lastEvent)}
              </p>
            </div>
            <div className="bg-purple-400 dark:bg-purple-500 rounded-full p-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Event Types */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
          Top 5 Eventos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {obtenerTop5Eventos().map(([nombreEvento, conteo], indice) => (
            <div
              key={nombreEvento}
              className={`bg-gradient-to-br ${colorPorIndice(
                indice
              )} rounded-lg p-4 text-white shadow-lg border border-opacity-20 border-white min-w-0`}
            >
              <p className="text-xs sm:text-sm font-medium opacity-90 truncate" title={nombreEvento}>{nombreEvento}</p>
              <p className="text-2xl sm:text-3xl font-bold mt-2">{conteo}</p>
              <div className="mt-2 bg-white bg-opacity-20 rounded px-2 py-1 text-xs font-medium w-fit">
                {((conteo / (resumenAnalytics?.totalEvents || 1)) * 100).toFixed(1)}%
              </div>
            </div>
          ))}
          {obtenerTop5Eventos().length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
              No hay eventos registrados aún
            </div>
          )}
        </div>
      </div>

      {/* Últimos Eventos */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
          Últimos 20 Eventos
        </h2>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          {eventosRecientes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Evento
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      User ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Propiedades
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {eventosRecientes.map((evento, indice) => (
                    <tr
                      key={indice}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-semibold">
                          {evento.event}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {formatearFecha(evento.timestamp)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {evento.userId ? (
                          <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                            {evento.userId.substring(0, 8)}...
                          </code>
                        ) : (
                          <span className="text-gray-400 italic">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {evento.properties ? (
                          <details className="cursor-pointer">
                            <summary className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                              Ver
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-auto max-h-32">
                              {JSON.stringify(evento.properties, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          <span className="text-gray-400 italic">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No hay eventos registrados aún
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Información Adicional */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Última actualización: {new Date().toLocaleTimeString('es-ES')}
        </p>
      </div>
    </div>
  );
}
