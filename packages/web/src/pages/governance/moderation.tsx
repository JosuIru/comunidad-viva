import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tantml:react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

interface ModerationCase {
  id: string;
  contentId: string;
  contentType: string;
  contentPreview: string;
  reason: string;
  reporter: {
    name: string;
  };
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  votesKeep: number;
  votesRemove: number;
  votesWarn: number;
  totalVotes: number;
  requiredVotes: number;
  createdAt: string;
}

export default function ModerationPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [selectedCase, setSelectedCase] = useState<ModerationCase | null>(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsAuthenticated(true);
      setUserId(JSON.parse(user).id);
    }
  }, []);

  // Fetch pending moderation cases
  const { data: pendingCases, isLoading } = useQuery<ModerationCase[]>({
    queryKey: ['moderation-pending', userId],
    queryFn: async () => {
      const response = await api.get('/consensus/moderation/pending');
      return response.data;
    },
    enabled: isAuthenticated,
  });

  // Vote on moderation case
  const voteMutation = useMutation({
    mutationFn: async (data: { caseId: string; decision: 'KEEP' | 'REMOVE' | 'WARN'; reason?: string }) => {
      const response = await api.post(`/consensus/moderation/${data.caseId}/vote`, {
        decision: data.decision,
        reason: data.reason,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-pending'] });
      setShowVoteModal(false);
      setSelectedCase(null);
      alert('¡Voto registrado exitosamente!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Error al votar');
    },
  });

  const handleVote = (decision: 'KEEP' | 'REMOVE' | 'WARN') => {
    if (!selectedCase) return;

    voteMutation.mutate({
      caseId: selectedCase.id,
      decision,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'REVIEWED':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'RESOLVED':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'POST':
        return '📝';
      case 'COMMENT':
        return '💬';
      case 'OFFER':
        return '🎁';
      case 'MESSAGE':
        return '✉️';
      case 'REVIEW':
        return '⭐';
      case 'EVENT':
        return '📅';
      default:
        return '📄';
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheckIcon className="h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Moderación DAO
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Sistema de moderación descentralizado por la comunidad
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <ShieldCheckIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Inicia sesión para participar en la moderación
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              La moderación requiere autenticación y reputación mínima
            </p>
          </div>
        ) : (
          <>
            {/* Info Box */}
            <div className="bg-orange-50 dark:bg-orange-900 dark:bg-opacity-20 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    ¿Cómo funciona la Moderación DAO?
                  </h3>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    <li>• <strong>Reportes comunitarios</strong>: Los miembros reportan contenido inapropiado</li>
                    <li>• <strong>Jurado aleatorio</strong>: Un grupo de miembros con reputación alta es seleccionado como jurado</li>
                    <li>• <strong>Votación transparente</strong>: El jurado vota: MANTENER, ELIMINAR o ADVERTIR</li>
                    <li>• <strong>Consenso mayoritario</strong>: Se requiere mayoría simple para tomar acción</li>
                    <li>• <strong>Sin censura centralizada</strong>: Las decisiones las toma la comunidad, no un admin</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Pending Cases */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Casos Pendientes de Moderación
              </h2>

              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
              ) : pendingCases && pendingCases.length > 0 ? (
                <div className="space-y-4">
                  {pendingCases.map((case_) => (
                    <div
                      key={case_.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{getContentTypeIcon(case_.contentType)}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {case_.contentType} Reportado
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Por {case_.reporter.name} • {new Date(case_.createdAt).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
                          {case_.status}
                        </span>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <strong>Motivo del reporte:</strong>
                        </p>
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                          {case_.reason}
                        </p>
                      </div>

                      <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <strong>Vista previa del contenido:</strong>
                        </p>
                        <p className="text-sm text-gray-800 dark:text-gray-200 italic">
                          "{case_.contentPreview}"
                        </p>
                      </div>

                      {/* Voting Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">
                            Progreso de votación: {case_.totalVotes} / {case_.requiredVotes} votos
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {Math.round((case_.totalVotes / case_.requiredVotes) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                          <div
                            className="bg-orange-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min((case_.totalVotes / case_.requiredVotes) * 100, 100)}%` }}
                          ></div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-lg p-3 text-center">
                            <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
                            <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                              {case_.votesKeep} Mantener
                            </p>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded-lg p-3 text-center">
                            <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400 mx-auto mb-1" />
                            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                              {case_.votesRemove} Eliminar
                            </p>
                          </div>
                          <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 rounded-lg p-3 text-center">
                            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-1" />
                            <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                              {case_.votesWarn} Advertir
                            </p>
                          </div>
                        </div>
                      </div>

                      {case_.status === 'PENDING' && (
                        <button
                          onClick={() => {
                            setSelectedCase(case_);
                            setShowVoteModal(true);
                          }}
                          className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold"
                        >
                          <EyeIcon className="inline h-5 w-5 mr-2" />
                          Revisar y Votar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShieldCheckIcon className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                    No hay casos pendientes
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    ¡Excelente! La comunidad está limpia por ahora
                  </p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Tu Participación
                </h3>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  -
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Votos de moderación emitidos
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Casos Resueltos
                </h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  -
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total en la plataforma
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Tiempo Promedio
                </h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  -
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Para resolver casos
                </p>
              </div>
            </div>
          </>
        )}

        {/* Vote Modal */}
        {showVoteModal && selectedCase && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Votar Caso de Moderación
                </h2>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <strong>Tipo:</strong> {selectedCase.contentType}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <strong>Motivo:</strong> {selectedCase.reason}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <strong>Contenido:</strong>
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 italic">
                    "{selectedCase.contentPreview}"
                  </p>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Como miembro del jurado, tu voto ayuda a decidir qué acción tomar:
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => handleVote('KEEP')}
                    disabled={voteMutation.isPending}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 disabled:opacity-50"
                  >
                    <CheckCircleIcon className="h-6 w-6" />
                    <div className="text-left flex-1">
                      <p className="font-semibold">Mantener</p>
                      <p className="text-xs">El contenido no viola las reglas de la comunidad</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleVote('WARN')}
                    disabled={voteMutation.isPending}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800 disabled:opacity-50"
                  >
                    <ExclamationTriangleIcon className="h-6 w-6" />
                    <div className="text-left flex-1">
                      <p className="font-semibold">Advertir</p>
                      <p className="text-xs">Enviar una advertencia al autor del contenido</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleVote('REMOVE')}
                    disabled={voteMutation.isPending}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 disabled:opacity-50"
                  >
                    <XCircleIcon className="h-6 w-6" />
                    <div className="text-left flex-1">
                      <p className="font-semibold">Eliminar</p>
                      <p className="text-xs">El contenido viola las reglas y debe ser eliminado</p>
                    </div>
                  </button>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => {
                      setShowVoteModal(false);
                      setSelectedCase(null);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
