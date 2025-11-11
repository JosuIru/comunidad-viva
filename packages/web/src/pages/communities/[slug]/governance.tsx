import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import toast from 'react-hot-toast';
import { useState } from 'react';

type ProposalType = 'FEATURE' | 'RULE_CHANGE' | 'FUND_ALLOCATION' | 'PARTNERSHIP' | 'COMMUNITY_UPDATE' | 'COMMUNITY_DISSOLUTION';
type ProposalStatus = 'DRAFT' | 'VOTING' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED';

interface Proposal {
  id: string;
  type: ProposalType;
  title: string;
  description: string;
  status: ProposalStatus;
  votesFor: number;
  votesAgainst: number;
  voteCount: number;
  requiredBudget?: number;
  implementationPlan?: string;
  createdAt: string;
  votingEndsAt?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  communityId?: string;
  userVote?: {
    points: number;
  };
}

interface Community {
  id: string;
  slug: string;
  name: string;
  description?: string;
  location?: string;
}

const TYPE_LABELS: Record<ProposalType, string> = {
  FEATURE: 'Nueva Funcionalidad',
  RULE_CHANGE: 'Cambio de Reglas',
  FUND_ALLOCATION: 'Asignación de Fondos',
  PARTNERSHIP: 'Alianza',
  COMMUNITY_UPDATE: 'Actualización Comunitaria',
  COMMUNITY_DISSOLUTION: 'Disolución de Comunidad',
};

const TYPE_ICONS: Record<ProposalType, string> = {
  FEATURE: '✨',
  RULE_CHANGE: '📜',
  FUND_ALLOCATION: '💰',
  PARTNERSHIP: '🤝',
  COMMUNITY_UPDATE: '🔄',
  COMMUNITY_DISSOLUTION: '❌',
};

const STATUS_BADGES: Record<ProposalStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  VOTING: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  IMPLEMENTED: 'bg-purple-100 text-purple-800',
};

export default function CommunityGovernancePage() {
  const router = useRouter();
  const { slug } = router.query;
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState<'all' | ProposalStatus>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'FEATURE' as ProposalType,
    title: '',
    description: '',
    requiredBudget: '',
    implementationPlan: '',
    // Para COMMUNITY_UPDATE
    newName: '',
    newDescription: '',
    newLocation: '',
    newLat: '',
    newLng: '',
  });

  // Fetch community
  const { data: community, isLoading: communityLoading } = useQuery<Community>({
    queryKey: ['community', slug],
    queryFn: async () => {
      const response = await api.get(`/communities/slug/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });

  // Fetch proposals
  const { data: proposals = [], isLoading: proposalsLoading } = useQuery<Proposal[]>({
    queryKey: ['community-proposals', community?.id, selectedFilter],
    queryFn: async () => {
      const params: any = { communityId: community?.id };
      if (selectedFilter !== 'all') {
        params.status = selectedFilter;
      }
      const response = await api.get('/consensus/proposals', { params });
      return response.data || [];
    },
    enabled: !!community?.id,
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ proposalId, points }: { proposalId: string; points: number }) => {
      const response = await api.post(`/consensus/proposals/${proposalId}/vote`, { points });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Voto registrado');
      queryClient.invalidateQueries({ queryKey: ['community-proposals'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al votar');
    },
  });

  // Create proposal mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload: any = {
        type: data.type,
        title: data.title,
        description: data.description,
        communityId: community?.id,
        requiredBudget: data.requiredBudget ? parseFloat(data.requiredBudget) : undefined,
        implementationPlan: data.implementationPlan || undefined,
      };

      // Para COMMUNITY_UPDATE, construir el objeto updates
      if (data.type === 'COMMUNITY_UPDATE') {
        const updates: any = {};
        if (data.newName) updates.name = data.newName;
        if (data.newDescription) updates.description = data.newDescription;
        if (data.newLocation) updates.location = data.newLocation;
        if (data.newLat) updates.lat = parseFloat(data.newLat);
        if (data.newLng) updates.lng = parseFloat(data.newLng);

        payload.updates = updates;
      }

      const response = await api.post('/consensus/proposals', payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Propuesta creada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['community-proposals'] });
      setShowCreateModal(false);
      setFormData({
        type: 'FEATURE',
        title: '',
        description: '',
        requiredBudget: '',
        implementationPlan: '',
        newName: '',
        newDescription: '',
        newLocation: '',
        newLat: '',
        newLng: '',
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear la propuesta');
    },
  });

  const handleVote = (proposalId: string, points: number) => {
    if (!localStorage.getItem('access_token')) {
      toast.error('Debes iniciar sesión para votar');
      router.push('/auth/login');
      return;
    }
    voteMutation.mutate({ proposalId, points });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localStorage.getItem('access_token')) {
      toast.error('Debes iniciar sesión para crear propuestas');
      router.push('/auth/login');
      return;
    }
    if (!formData.title || !formData.description) {
      toast.error('Título y descripción son obligatorios');
      return;
    }
    createMutation.mutate(formData);
  };

  const geocodeLocation = async () => {
    if (!formData.newLocation) {
      toast.error('Por favor ingresa una dirección primero');
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.newLocation)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setFormData(prev => ({
          ...prev,
          newLat: lat,
          newLng: lon,
        }));
        toast.success('Coordenadas obtenidas correctamente');
      } else {
        toast.error('No se encontraron coordenadas para esta dirección');
      }
    } catch (error) {
      toast.error('Error al obtener coordenadas');
    }
  };

  if (communityLoading) {
    return (
      <Layout title="Cargando...">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando comunidad...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!community) {
    return (
      <Layout title="Comunidad no encontrada">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🏘️</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Comunidad no encontrada</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">La comunidad que buscas no existe</p>
            <Link
              href="/communities"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Ver todas las comunidades
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Gobernanza - ${community.name}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href={`/communities/${slug}`}
                className="text-white hover:text-gray-200 transition"
              >
                ← Volver a {community.name}
              </Link>
            </div>
            <h1 className="text-4xl font-bold mb-2">🗳️ Gobernanza Comunitaria</h1>
            <p className="text-xl opacity-90">
              Propuestas y decisiones de {community.name}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filters and Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Propuestas</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                + Nueva Propuesta
              </button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Todas
              </button>
              {(['VOTING', 'APPROVED', 'IMPLEMENTED'] as ProposalStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status === 'VOTING' && 'En votación'}
                  {status === 'APPROVED' && 'Aprobadas'}
                  {status === 'IMPLEMENTED' && 'Implementadas'}
                </button>
              ))}
            </div>
          </div>

          {/* Proposals List */}
          {proposalsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando propuestas...</p>
            </div>
          ) : proposals.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                No hay propuestas aún
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Sé el primero en crear una propuesta para la comunidad
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Crear Propuesta
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{TYPE_ICONS[proposal.type]}</span>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {proposal.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGES[proposal.status]}`}>
                              {proposal.status}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {TYPE_LABELS[proposal.type]}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 mb-4">{proposal.description}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <span>👤</span>
                          <span>{proposal.author.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>📅</span>
                          <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>🗳️</span>
                          <span>{proposal.voteCount} votos</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Voting Progress */}
                  {proposal.status === 'VOTING' && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          A favor: {proposal.votesFor}
                        </span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          En contra: {proposal.votesAgainst}
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600 transition-all"
                          style={{
                            width: `${
                              proposal.voteCount > 0
                                ? (proposal.votesFor / proposal.voteCount) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Vote Buttons */}
                  {proposal.status === 'VOTING' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleVote(proposal.id, 1)}
                        disabled={voteMutation.isPending || !!proposal.userVote}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                          proposal.userVote?.points === 1
                            ? 'bg-green-600 text-white'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        👍 A favor
                      </button>
                      <button
                        onClick={() => handleVote(proposal.id, -1)}
                        disabled={voteMutation.isPending || !!proposal.userVote}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                          proposal.userVote?.points === -1
                            ? 'bg-red-600 text-white'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        👎 En contra
                      </button>
                      <Link
                        href={`/governance/proposals/${proposal.id}`}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                      >
                        Ver detalles
                      </Link>
                    </div>
                  )}

                  {proposal.status !== 'VOTING' && (
                    <Link
                      href={`/governance/proposals/${proposal.id}`}
                      className="inline-block px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                    >
                      Ver detalles →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Proposal Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nueva Propuesta</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de propuesta *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ProposalType })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="FEATURE">Nueva Funcionalidad</option>
                    <option value="RULE_CHANGE">Cambio de Reglas</option>
                    <option value="FUND_ALLOCATION">Asignación de Fondos</option>
                    <option value="PARTNERSHIP">Alianza</option>
                    <option value="COMMUNITY_UPDATE">Actualización Comunitaria</option>
                    <option value="COMMUNITY_DISSOLUTION">Disolución de Comunidad</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Crear un huerto comunitario"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    placeholder="Describe detalladamente tu propuesta..."
                    required
                  />
                </div>

                {/* Campos específicos para COMMUNITY_UPDATE */}
                {formData.type === 'COMMUNITY_UPDATE' && (
                  <>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <p className="text-sm text-indigo-800 font-medium mb-3">
                        📝 Campos a actualizar (deja vacío lo que no quieras cambiar)
                      </p>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nuevo nombre
                          </label>
                          <input
                            type="text"
                            value={formData.newName}
                            onChange={(e) => setFormData({ ...formData, newName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder={`Actual: ${community?.name || ''}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nueva descripción
                          </label>
                          <textarea
                            value={formData.newDescription}
                            onChange={(e) => setFormData({ ...formData, newDescription: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            rows={2}
                            placeholder={`Actual: ${community?.description || ''}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nueva ubicación
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={formData.newLocation}
                              onChange={(e) => setFormData({ ...formData, newLocation: e.target.value })}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                              placeholder={`Actual: ${community?.location || ''}`}
                            />
                            <button
                              type="button"
                              onClick={geocodeLocation}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium whitespace-nowrap"
                            >
                              📍 Obtener coordenadas
                            </button>
                          </div>
                        </div>

                        {/* Coordenadas (auto-completadas) */}
                        {(formData.newLat || formData.newLng) && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Latitud
                              </label>
                              <input
                                type="text"
                                value={formData.newLat}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-400"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Longitud
                              </label>
                              <input
                                type="text"
                                value={formData.newLng}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-400"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Budget (optional) */}
                {formData.type !== 'COMMUNITY_UPDATE' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Presupuesto requerido (opcional)
                    </label>
                    <input
                      type="number"
                      value={formData.requiredBudget}
                      onChange={(e) => setFormData({ ...formData, requiredBudget: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: 500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}

                {/* Implementation Plan (optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plan de implementación (opcional)
                  </label>
                  <textarea
                    value={formData.implementationPlan}
                    onChange={(e) => setFormData({ ...formData, implementationPlan: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Describe cómo se implementará esta propuesta..."
                  />
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>ℹ️ Información:</strong> Una vez creada, la propuesta entrará en período de votación.
                    La comunidad decidirá mediante votación cuadrática si se aprueba o rechaza.
                  </p>
                  {formData.type === 'COMMUNITY_UPDATE' && (
                    <p className="text-sm text-indigo-800 font-medium">
                      <strong>⚙️ Aplicación automática:</strong> Si la propuesta es aprobada, los cambios se aplicarán
                      automáticamente a la comunidad. No requiere intervención manual.
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium"
                    disabled={createMutation.isPending}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                  >
                    {createMutation.isPending ? 'Creando...' : 'Crear Propuesta'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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

export const getStaticProps = async (context: any) => getI18nProps(context);
