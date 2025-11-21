import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';

const TYPE_LABELS: Record<string, string> = {
  INFRASTRUCTURE: 'Infraestructura',
  WATER_SANITATION: 'Agua y Saneamiento',
  EDUCATION: 'Educación',
  HEALTH: 'Salud',
  ENVIRONMENT: 'Medio Ambiente',
  AUZOLAN: 'Auzolan',
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionMessage, setContributionMessage] = useState('');
  const [showContributeModal, setShowContributeModal] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const response = await api.get(`/mutual-aid/projects/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const contributeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post(`/mutual-aid/projects/${id}/contribute`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('¡Contribución realizada exitosamente!');
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setShowContributeModal(false);
      setContributionAmount('');
      setContributionMessage('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al contribuir');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/mutual-aid/projects/${id}`),
    onSuccess: () => {
      toast.success('Proyecto eliminado exitosamente');
      router.push('/mutual-aid');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al eliminar el proyecto');
    },
  });

  const getCurrentUserId = () => {
    const user = localStorage.getItem('user');
    if (!user) return null;
    try {
      return JSON.parse(user).id;
    } catch {
      return null;
    }
  };

  const handleEdit = () => {
    router.push(`/mutual-aid/projects/${id}/edit`);
  };

  const handleDelete = () => {
    if (confirm('¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.')) {
      deleteMutation.mutate();
    }
  };

  const handleContribute = () => {
    const data: any = {
      message: contributionMessage,
      contributionType: 'MONETARY',
    };

    if (project?.targetEur) {
      data.amountEur = parseFloat(contributionAmount);
    } else if (project?.targetCredits) {
      data.amountCredits = parseInt(contributionAmount);
    }

    contributeMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Proyecto no encontrado</h1>
          </div>
        </div>
      </Layout>
    );
  }

  const progress = project.targetEur ? (project.currentEur / project.targetEur) * 100 : 0;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header Image */}
            {project.images && project.images.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
                <img
                  src={project.images[0]}
                  alt={project.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            {/* Main Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-sm font-medium px-3 py-1 bg-purple-100 text-purple-800 rounded">
                    {TYPE_LABELS[project.type] || project.type}
                  </span>
                  {project.isVerified && (
                    <span className="ml-2 text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded inline-flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verificado
                    </span>
                  )}
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-4">{project.title}</h1>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">{project.description}</p>

              {/* Vision */}
              {project.vision && (
                <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-600 p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Visión</h3>
                  <p className="text-blue-800 dark:text-blue-200">{project.vision}</p>
                </div>
              )}

              {/* Location */}
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-6">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>{project.location}, {project.country}</span>
              </div>

              {/* Progress */}
              {project.targetEur && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold">Financiación</span>
                    <span className="text-gray-600 dark:text-gray-400">{project.currentEur}€ de {project.targetEur}€</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="text-right text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {Math.round(progress)}% completado
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {project.beneficiaries && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Beneficiarios</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.beneficiaries}</div>
                  </div>
                )}
                {project.contributorsCount > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Contribuciones</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.contributorsCount}</div>
                  </div>
                )}
                {project.volunteersNeeded && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Voluntarios</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {project.volunteersEnrolled}/{project.volunteersNeeded}
                    </div>
                  </div>
                )}
                {project.estimatedMonths && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Duración</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.estimatedMonths}m</div>
                  </div>
                )}
              </div>

              {/* Impact Goals */}
              {project.impactGoals && project.impactGoals.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Objetivos de Impacto</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    {project.impactGoals.map((goal: string, idx: number) => (
                      <li key={idx}>{goal}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* SDG Goals */}
              {project.sdgGoals && project.sdgGoals.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">ODS</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.sdgGoals.map((sdg: number) => (
                      <span key={sdg} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        ODS {sdg}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Edit/Delete buttons for creator */}
              {getCurrentUserId() === project.creatorId && (
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={handleEdit}
                    className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition font-semibold"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition font-semibold disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? 'Eliminando...' : '🗑️ Eliminar'}
                  </button>
                </div>
              )}

              {/* Contribute Button */}
              {project.status === 'FUNDING' && getCurrentUserId() !== project.creatorId && (
                <button
                  onClick={() => setShowContributeModal(true)}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Contribuir al Proyecto
                </button>
              )}
            </div>

            {/* Updates */}
            {project.updates && project.updates.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Actualizaciones ({project.updates.length})
                </h2>
                <div className="space-y-6">
                  {project.updates.map((update: any) => (
                    <div key={update.id} className="border-l-4 border-purple-600 pl-4 py-2">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{update.title}</h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(update.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{update.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contribute Modal */}
      {showContributeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Contribuir al Proyecto</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Cantidad {project.targetEur ? '(€)' : '(créditos)'}
                </label>
                <input
                  type="number"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Mensaje (opcional)
                </label>
                <textarea
                  value={contributionMessage}
                  onChange={(e) => setContributionMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Escribe un mensaje de apoyo..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowContributeModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleContribute}
                disabled={contributeMutation.isPending || !contributionAmount}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {contributeMutation.isPending ? 'Contribuyendo...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
