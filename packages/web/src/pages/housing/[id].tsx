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

  // Form data for different solution types
  const [joinData, setJoinData] = useState<any>({
    // For SPACE_BANK
    startTime: '',
    endTime: '',
    // For TEMPORARY_HOUSING
    checkIn: '',
    checkOut: '',
    guests: 1,
    // For HOUSING_COOP
    message: '',
    skills: '',
    commitmentLevel: 'MEDIUM',
    availability: 'WEEKENDS',
  });

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
      // Prepare data based on solution type
      let requestData = {};

      if (solution.solutionType === 'SPACE_BANK') {
        requestData = {
          startTime: new Date(joinData.startTime).toISOString(),
          endTime: new Date(joinData.endTime).toISOString(),
        };
      } else if (solution.solutionType === 'TEMPORARY_HOUSING') {
        requestData = {
          checkIn: joinData.checkIn,
          checkOut: joinData.checkOut,
          guests: joinData.guests,
        };
      } else if (solution.solutionType === 'HOUSING_COOP') {
        requestData = {
          message: joinData.message,
          skills: joinData.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
          commitmentLevel: joinData.commitmentLevel,
          availability: joinData.availability,
        };
      }

      const response = await api.post(`/housing/solutions/${id}/join`, requestData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('¡Te has unido exitosamente!');
      queryClient.invalidateQueries({ queryKey: ['housing-solution', id] });
      setShowJoinModal(false);
      // Reset form
      setJoinData({
        startTime: '',
        endTime: '',
        checkIn: '',
        checkOut: '',
        guests: 1,
        message: '',
        skills: '',
        commitmentLevel: 'MEDIUM',
        availability: 'WEEKENDS',
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al unirse');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      // Delete based on solution type
      const endpoint = solution.solutionType === 'SPACE_BANK'
        ? `/housing/spaces/${solution.id}`
        : solution.solutionType === 'TEMPORARY_HOUSING'
        ? `/housing/temporary/${solution.id}`
        : `/housing/solutions/${id}`;
      return await api.delete(endpoint);
    },
    onSuccess: () => {
      toast.success('Solución eliminada exitosamente');
      router.push('/housing');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar');
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
    router.push(`/housing/${id}/edit`);
  };

  const handleDelete = () => {
    if (confirm('¿Estás seguro de que quieres eliminar esta solución de vivienda? Esta acción no se puede deshacer.')) {
      deleteMutation.mutate();
    }
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

  if (!solution) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Solución no encontrada</h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header Image */}
            {solution.images && solution.images.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
                <img
                  src={solution.images[0]}
                  alt={solution.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            {/* Main Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded">
                    {SOLUTION_TYPE_LABELS[solution.solutionType as keyof typeof SOLUTION_TYPE_LABELS]}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-4">{solution.title}</h1>
                </div>
                <span className={`text-sm font-medium px-3 py-1 rounded ${
                  solution.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                  solution.status === 'FILLED' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {STATUS_LABELS[solution.status as keyof typeof STATUS_LABELS]}
                </span>
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">{solution.description}</p>

              {/* Location */}
              {solution.location && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-6">
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
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Capacidad</h3>
                    <p className="text-lg text-gray-900 dark:text-gray-100">{solution.capacity} personas</p>
                  </div>
                )}

                {solution.monthlyContribution && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Contribución Mensual</h3>
                    <p className="text-lg text-gray-900 dark:text-gray-100">{solution.monthlyContribution}€/mes</p>
                  </div>
                )}

                {solution.solutionType === 'HOUSING_COOP' && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Miembros</h3>
                      <p className="text-lg text-gray-900 dark:text-gray-100">{solution.currentMembers}/{solution.targetMembers}</p>
                    </div>
                    {solution.initialContribution && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Aportación Inicial</h3>
                        <p className="text-lg text-gray-900 dark:text-gray-100">{solution.initialContribution}€</p>
                      </div>
                    )}
                  </>
                )}

                {solution.solutionType === 'COMMUNITY_GUARANTEE' && solution.guaranteeAmount && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Monto del Aval</h3>
                    <p className="text-lg text-gray-900 dark:text-gray-100">{solution.guaranteeAmount}€</p>
                  </div>
                )}
              </div>

              {/* Requirements */}
              {solution.requirements && solution.requirements.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Requisitos</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    {solution.requirements.map((req: string, idx: number) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rules */}
              {solution.rules && solution.rules.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Normas</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    {solution.rules.map((rule: string, idx: number) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Edit/Delete buttons for owner */}
              {getCurrentUserId() === solution.createdBy?.id && (
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

              {/* Join Button */}
              {solution.status === 'ACTIVE' && getCurrentUserId() !== solution.createdBy?.id && (
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Miembros ({solution.members.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {solution.members.map((member: any) => (
                    <div key={member.userId} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {member.user?.profileImage ? (
                        <img
                          src={member.user.profileImage}
                          alt={member.user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-300 font-semibold">
                            {member.user?.name?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{member.user?.name || 'Usuario'}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 my-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Unirse a {SOLUTION_TYPE_LABELS[solution.solutionType as keyof typeof SOLUTION_TYPE_LABELS]}
            </h3>

            {/* SPACE_BANK Form */}
            {solution.solutionType === 'SPACE_BANK' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha y Hora de Inicio
                  </label>
                  <input
                    type="datetime-local"
                    value={joinData.startTime}
                    onChange={(e) => setJoinData({ ...joinData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha y Hora de Fin
                  </label>
                  <input
                    type="datetime-local"
                    value={joinData.endTime}
                    onChange={(e) => setJoinData({ ...joinData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
              </div>
            )}

            {/* TEMPORARY_HOUSING Form */}
            {solution.solutionType === 'TEMPORARY_HOUSING' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha de Entrada
                  </label>
                  <input
                    type="date"
                    value={joinData.checkIn}
                    onChange={(e) => setJoinData({ ...joinData, checkIn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha de Salida
                  </label>
                  <input
                    type="date"
                    value={joinData.checkOut}
                    onChange={(e) => setJoinData({ ...joinData, checkOut: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Número de Huéspedes
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={joinData.guests}
                    onChange={(e) => setJoinData({ ...joinData, guests: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
              </div>
            )}

            {/* HOUSING_COOP Form */}
            {solution.solutionType === 'HOUSING_COOP' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mensaje de Presentación
                  </label>
                  <textarea
                    value={joinData.message}
                    onChange={(e) => setJoinData({ ...joinData, message: e.target.value })}
                    rows={3}
                    placeholder="Cuéntanos por qué quieres unirte..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Habilidades (separadas por comas)
                  </label>
                  <input
                    type="text"
                    value={joinData.skills}
                    onChange={(e) => setJoinData({ ...joinData, skills: e.target.value })}
                    placeholder="ej: carpintería, diseño, contabilidad"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nivel de Compromiso
                  </label>
                  <select
                    value={joinData.commitmentLevel}
                    onChange={(e) => setJoinData({ ...joinData, commitmentLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="LOW">Bajo</option>
                    <option value="MEDIUM">Medio</option>
                    <option value="HIGH">Alto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Disponibilidad
                  </label>
                  <select
                    value={joinData.availability}
                    onChange={(e) => setJoinData({ ...joinData, availability: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="WEEKDAYS">Entre semana</option>
                    <option value="WEEKENDS">Fines de semana</option>
                    <option value="FLEXIBLE">Flexible</option>
                  </select>
                </div>
              </div>
            )}

            {/* COMMUNITY_GUARANTEE or other types */}
            {solution.solutionType !== 'SPACE_BANK' &&
             solution.solutionType !== 'TEMPORARY_HOUSING' &&
             solution.solutionType !== 'HOUSING_COOP' && (
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                ¿Estás seguro de que quieres participar en "{solution.title}"?
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {joinMutation.isPending ? 'Procesando...' : 'Confirmar'}
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

export const getStaticProps = async (context: any) => getI18nProps(context);
