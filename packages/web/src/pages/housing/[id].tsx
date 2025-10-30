import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';

const SOLUTION_TYPE_LABELS = {
  SPACE_BANK: 'Banco de Espacios',
  TEMPORARY_HOUSING: 'Vivienda Temporal',
  HOUSING_COOP: 'Cooperativa de Vivienda',
  COMMUNITY_GUARANTEE: 'Aval Comunitario',
};

const STATUS_LABELS = {
  ACTIVE: 'Activo',
  FILLED: 'Completo',
  CLOSED: 'Cerrado',
};

export default function HousingSolutionDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const [showJoinModal, setShowJoinModal] = useState(false);

  const { data: solution, isLoading } = useQuery({
    queryKey: ['housing-solution', id],
    queryFn: async () => {
      const response = await api.get(`/housing/solutions/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/housing/solutions/${id}/join`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('¡Te has unido exitosamente!');
      queryClient.invalidateQueries({ queryKey: ['housing-solution', id] });
      setShowJoinModal(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al unirse');
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!solution) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Solución no encontrada</h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header Image */}
            {solution.images && solution.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                <img
                  src={solution.images[0]}
                  alt={solution.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            {/* Main Content */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded">
                    {SOLUTION_TYPE_LABELS[solution.solutionType as keyof typeof SOLUTION_TYPE_LABELS]}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900 mt-4">{solution.title}</h1>
                </div>
                <span className={`text-sm font-medium px-3 py-1 rounded ${
                  solution.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  solution.status === 'FILLED' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {STATUS_LABELS[solution.status as keyof typeof STATUS_LABELS]}
                </span>
              </div>

              <p className="text-gray-700 text-lg mb-6">{solution.description}</p>

              {/* Location */}
              {solution.location && (
                <div className="flex items-center gap-2 text-gray-600 mb-6">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{solution.location}</span>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {solution.capacity && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Capacidad</h3>
                    <p className="text-lg text-gray-900">{solution.capacity} personas</p>
                  </div>
                )}

                {solution.monthlyContribution && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Contribución Mensual</h3>
                    <p className="text-lg text-gray-900">{solution.monthlyContribution}€/mes</p>
                  </div>
                )}

                {solution.solutionType === 'HOUSING_COOP' && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Miembros</h3>
                      <p className="text-lg text-gray-900">{solution.currentMembers}/{solution.targetMembers}</p>
                    </div>
                    {solution.initialContribution && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Aportación Inicial</h3>
                        <p className="text-lg text-gray-900">{solution.initialContribution}€</p>
                      </div>
                    )}
                  </>
                )}

                {solution.solutionType === 'COMMUNITY_GUARANTEE' && solution.guaranteeAmount && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Monto del Aval</h3>
                    <p className="text-lg text-gray-900">{solution.guaranteeAmount}€</p>
                  </div>
                )}
              </div>

              {/* Requirements */}
              {solution.requirements && solution.requirements.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Requisitos</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {solution.requirements.map((req: string, idx: number) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rules */}
              {solution.rules && solution.rules.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Normas</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {solution.rules.map((rule: string, idx: number) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Join Button */}
              {solution.status === 'ACTIVE' && (
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Unirse a esta Solución
                </button>
              )}
            </div>

            {/* Members/Participants */}
            {solution.members && solution.members.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Miembros ({solution.members.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {solution.members.map((member: any) => (
                    <div key={member.userId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {member.user?.profileImage ? (
                        <img
                          src={member.user.profileImage}
                          alt={member.user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {member.user?.name?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{member.user?.name || 'Usuario'}</p>
                        <p className="text-sm text-gray-600">
                          {member.role === 'ORGANIZER' ? 'Organizador' :
                           member.role === 'MEMBER' ? 'Miembro' : 'Participante'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmar Participación</h3>
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que quieres unirte a "{solution.title}"?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {joinMutation.isPending ? 'Uniéndose...' : 'Confirmar'}
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

export const getStaticProps = getI18nProps;
