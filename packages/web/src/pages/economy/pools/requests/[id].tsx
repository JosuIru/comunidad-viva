import { useState, useEffect } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  generosityScore?: number;
}

interface Pool {
  type: string;
  balance: number;
}

interface Vote {
  id: string;
  vote: boolean;
  comment?: string;
  voter: User;
  createdAt: string;
}

interface PoolRequest {
  id: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISTRIBUTED' | 'CANCELLED';
  user: User;
  pool: Pool;
  votes: Vote[];
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  distributedAt?: string;
}

const POOL_INFO: Record<string, any> = {
  NEEDS: {
    name: 'Necesidades Básicas',
    icon: '🆘',
    color: 'from-red-500 to-orange-600',
  },
  PROJECTS: {
    name: 'Proyectos Comunitarios',
    icon: '🚀',
    color: 'from-blue-500 to-purple-600',
  },
  EMERGENCY: {
    name: 'Emergencias',
    icon: '⚡',
    color: 'from-yellow-500 to-red-600',
  },
  CELEBRATION: {
    name: 'Celebraciones',
    icon: '🎉',
    color: 'from-pink-500 to-purple-600',
  },
  EQUALITY: {
    name: 'Igualdad Económica',
    icon: '⚖️',
    color: 'from-green-500 to-teal-600',
  },
};

const STATUS_INFO = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  APPROVED: { label: 'Aprobada', color: 'bg-green-100 text-green-800', icon: '✅' },
  REJECTED: { label: 'Rechazada', color: 'bg-red-100 text-red-800', icon: '❌' },
  DISTRIBUTED: { label: 'Distribuida', color: 'bg-blue-100 text-blue-800', icon: '💰' },
  CANCELLED: { label: 'Cancelada', color: 'bg-gray-100 text-gray-800', icon: '🚫' },
};

export default function PoolRequestDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [showVoteForm, setShowVoteForm] = useState(false);
  const [voteValue, setVoteValue] = useState<boolean>(true);
  const [voteComment, setVoteComment] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.error('Debes iniciar sesión');
      router.push('/auth/login');
      return;
    }
    const user = JSON.parse(userStr);
    setUserId(user.id);
  }, [router]);

  const { data: request, isLoading } = useQuery<PoolRequest>({
    queryKey: ['pool-request', id],
    queryFn: async () => {
      const { data } = await api.get(`/flow-economics/pool-requests/${id}`);
      return data;
    },
    enabled: !!id && !!userId,
  });

  const voteMutation = useMutation({
    mutationFn: async (data: { vote: boolean; comment?: string }) => {
      const response = await api.post(`/flow-economics/pool-requests/${id}/vote`, data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Voto registrado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['pool-request', id] });
      queryClient.invalidateQueries({ queryKey: ['pool-requests'] });
      setShowVoteForm(false);
      setVoteComment('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al votar');
    },
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      const response = await api.put(`/flow-economics/pool-requests/${id}/approve`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Solicitud aprobada');
      queryClient.invalidateQueries({ queryKey: ['pool-request', id] });
      queryClient.invalidateQueries({ queryKey: ['pool-requests'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al aprobar');
    },
  });

  const distributeMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/flow-economics/pool-requests/${id}/distribute`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Fondos distribuidos exitosamente');
      queryClient.invalidateQueries({ queryKey: ['pool-request', id] });
      queryClient.invalidateQueries({ queryKey: ['pool-requests'] });
      queryClient.invalidateQueries({ queryKey: ['economy-metrics'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al distribuir fondos');
    },
  });

  const handleVoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    voteMutation.mutate({
      vote: voteValue,
      comment: voteComment.trim() || undefined,
    });
  };

  if (isLoading || !request) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const poolInfo = POOL_INFO[request.pool.type];
  const statusInfo = STATUS_INFO[request.status];
  const approveVotes = request.votes.filter((v) => v.vote).length;
  const rejectVotes = request.votes.filter((v) => !v.vote).length;
  const userVote = request.votes.find((v) => v.voter.id === userId);
  const isRequestor = request.user.id === userId;

  return (
    <Layout title={`Solicitud de Pool - Comunidad Viva`}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
            >
              ← Volver
            </button>
          </div>

          {/* Request Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            {/* Status Banner */}
            <div className={`p-4 ${statusInfo.color.replace('bg-', 'bg-gradient-to-r from-').replace('text-', 'to-')} border-b`}>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  {statusInfo.icon} Estado: {statusInfo.label}
                </span>
                {request.distributedAt && (
                  <span className="text-sm">
                    Distribuido: {new Date(request.distributedAt).toLocaleDateString('es-ES')}
                  </span>
                )}
              </div>
            </div>

            <div className="p-6">
              {/* User Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {request.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{request.user.name}</h2>
                  <div className="text-sm text-gray-600">{request.user.email}</div>
                  {request.user.generosityScore !== undefined && (
                    <div className="text-sm text-gray-600">
                      Generosidad: {request.user.generosityScore.toFixed(1)}
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(request.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              {/* Pool Type */}
              <div className={`bg-gradient-to-r ${poolInfo.color} rounded-lg p-6 text-white mb-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-4xl">{poolInfo.icon}</span>
                      <div>
                        <div className="text-2xl font-bold">{poolInfo.name}</div>
                        <div className="text-sm text-white/80">
                          Balance del pool: {request.pool.balance} créditos
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">{request.amount}</div>
                    <div className="text-sm text-white/90">créditos solicitados</div>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Motivo de la Solicitud</h3>
                <div className="bg-gray-50 p-4 rounded-lg text-gray-900 whitespace-pre-wrap">
                  {request.reason}
                </div>
              </div>

              {/* Vote Stats */}
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Votos de la Comunidad</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-green-600">{approveVotes}</div>
                    <div className="text-sm text-gray-600">✓ A favor</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-red-600">{rejectVotes}</div>
                    <div className="text-sm text-gray-600">✗ En contra</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-gray-900">{request.votes.length}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>

                {/* Auto-approval info */}
                {request.status === 'PENDING' && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    💡 Se necesitan 3 votos a favor sin rechazos para aprobación automática, o 3 rechazos para rechazo automático.
                  </div>
                )}
              </div>

              {/* Voting Section */}
              {request.status === 'PENDING' && !isRequestor && (
                <div className="border-t border-gray-200 pt-6">
                  {userVote ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className={`text-2xl ${userVote.vote ? 'text-green-600' : 'text-red-600'}`}>
                          {userVote.vote ? '✓' : '✗'}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">
                            Tu voto: {userVote.vote ? 'A favor' : 'En contra'}
                          </div>
                          {userVote.comment && (
                            <div className="text-sm text-gray-700 bg-white p-3 rounded">
                              {userVote.comment}
                            </div>
                          )}
                          <button
                            onClick={() => setShowVoteForm(true)}
                            className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                          >
                            Cambiar voto
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowVoteForm(true)}
                      className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                      Votar sobre esta solicitud
                    </button>
                  )}
                </div>
              )}

              {/* Admin Actions */}
              {request.status === 'APPROVED' && (
                <div className="border-t border-gray-200 pt-6">
                  <button
                    onClick={() => distributeMutation.mutate()}
                    disabled={distributeMutation.isPending}
                    className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50"
                  >
                    {distributeMutation.isPending ? 'Distribuyendo...' : '💰 Distribuir Fondos'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Votes List */}
          {request.votes.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Votos ({request.votes.length})
              </h3>
              <div className="space-y-3">
                {request.votes.map((vote) => (
                  <div
                    key={vote.id}
                    className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {vote.voter.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{vote.voter.name}</span>
                        <span className={`text-2xl ${vote.vote ? 'text-green-600' : 'text-red-600'}`}>
                          {vote.vote ? '✓' : '✗'}
                        </span>
                      </div>
                      {vote.comment && (
                        <div className="text-sm text-gray-700 mt-2">{vote.comment}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(vote.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vote Form Modal */}
          {showVoteForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Emitir Voto</h2>
                  <button
                    onClick={() => {
                      setShowVoteForm(false);
                      setVoteComment('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleVoteSubmit} className="space-y-4">
                  {/* Vote Choice */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Tu decisión <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setVoteValue(true)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          voteValue
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-3xl mb-2">✓</div>
                        <div className="font-semibold">Aprobar</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoteValue(false)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          !voteValue
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-3xl mb-2">✗</div>
                        <div className="font-semibold">Rechazar</div>
                      </button>
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                      Comentario (opcional)
                    </label>
                    <textarea
                      id="comment"
                      value={voteComment}
                      onChange={(e) => setVoteComment(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Explica tu decisión..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowVoteForm(false);
                        setVoteComment('');
                      }}
                      className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={voteMutation.isPending}
                      className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
                    >
                      {voteMutation.isPending ? 'Votando...' : 'Confirmar Voto'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export { getI18nProps as getStaticProps };
