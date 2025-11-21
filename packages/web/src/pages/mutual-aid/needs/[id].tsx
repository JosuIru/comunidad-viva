import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';

const SCOPE_LABELS: Record<string, string> = {
  PERSONAL: 'Personal',
  COMMUNITY: 'Comunitario',
  INTERCOMMUNITY: 'Intercomunitario',
  GLOBAL: 'Global',
};

export default function NeedDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionMessage, setContributionMessage] = useState('');
  const [showContributeModal, setShowContributeModal] = useState(false);

  const { data: need, isLoading } = useQuery({
    queryKey: ['need', id],
    queryFn: async () => {
      const response = await api.get(`/mutual-aid/needs/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const contributeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post(`/mutual-aid/needs/${id}/contribute`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('¡Contribución realizada exitosamente!');
      queryClient.invalidateQueries({ queryKey: ['need', id] });
      setShowContributeModal(false);
      setContributionAmount('');
      setContributionMessage('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al contribuir');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/mutual-aid/needs/${id}`),
    onSuccess: () => {
      toast.success('Necesidad eliminada exitosamente');
      router.push('/mutual-aid');
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Error al eliminar la necesidad';
      toast.error(message);
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
    router.push(`/mutual-aid/needs/${id}/edit`);
  };

  const handleDelete = () => {
    if (confirm('¿Estás seguro de que quieres eliminar esta necesidad? Esta acción no se puede deshacer.')) {
      deleteMutation.mutate();
    }
  };

  const handleContribute = () => {
    const data: any = {
      message: contributionMessage,
      contributionType: 'MONETARY',
    };

    if (need?.resourceTypes?.includes('EUR')) {
      data.amountEur = parseFloat(contributionAmount);
    } else if (need?.resourceTypes?.includes('CREDITS')) {
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

  if (!need) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Necesidad no encontrada</h1>
          </div>
        </div>
      </Layout>
    );
  }

  const progress = need.targetEur ? (need.currentEur / need.targetEur) * 100 : 0;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Main Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded">
                    {SCOPE_LABELS[need.scope]}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-4">{need.title}</h1>
                </div>
                {need.urgencyLevel >= 8 && (
                  <span className="text-sm font-medium px-3 py-1 bg-red-100 text-red-800 rounded">
                    Urgente
                  </span>
                )}
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">{need.description}</p>

              {/* Location */}
              {need.location && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-6">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>{need.location}</span>
                </div>
              )}

              {/* Progress */}
              {need.targetEur && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold">Progreso</span>
                    <span className="text-gray-600 dark:text-gray-400">{need.currentEur}€ de {need.targetEur}€</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="text-right text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {Math.round(progress)}% completado
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Contribuciones</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {need.contributorsCount || 0}
                  </div>
                </div>
                {need.targetCredits && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Créditos</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {need.currentCredits}/{need.targetCredits}
                    </div>
                  </div>
                )}
                {need.targetHours && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Horas</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {need.currentHours}/{need.targetHours}
                    </div>
                  </div>
                )}
              </div>

              {/* Skills Needed */}
              {need.neededSkills && need.neededSkills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Habilidades Necesarias</h3>
                  <div className="flex flex-wrap gap-2">
                    {need.neededSkills.map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Edit/Delete buttons for creator */}
              {getCurrentUserId() === need.creatorId && (
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
              {need.status === 'OPEN' && getCurrentUserId() !== need.creatorId && (
                <button
                  onClick={() => setShowContributeModal(true)}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Contribuir
                </button>
              )}
            </div>

            {/* Contributions */}
            {need.contributions && need.contributions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Contribuciones ({need.contributions.length})
                </h2>
                <div className="space-y-4">
                  {need.contributions.map((contribution: any) => (
                    <div key={contribution.id} className="border-l-4 border-blue-600 pl-4 py-2">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {contribution.isAnonymous ? 'Anónimo' : contribution.user?.name || 'Usuario'}
                        </div>
                        {contribution.amountEur > 0 && (
                          <span className="text-green-600 font-semibold">{contribution.amountEur}€</span>
                        )}
                        {contribution.amountCredits > 0 && (
                          <span className="text-blue-600 font-semibold">{contribution.amountCredits} créditos</span>
                        )}
                      </div>
                      {contribution.message && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{contribution.message}</p>
                      )}
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
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Contribuir</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Cantidad {need.resourceTypes?.includes('EUR') ? '(€)' : '(créditos)'}
                </label>
                <input
                  type="number"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
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
