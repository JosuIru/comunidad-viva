import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import {
  UserGroupIcon,
  PlusIcon,
  CalendarIcon,
  UsersIcon,
  BookOpenIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface Circulo {
  id: string;
  name: string;
  description: string;
  type: string;
  facilitatorDID: string;
  facilitatorName: string;
  maxParticipants: number | null;
  schedule: string;
  location: string;
  memberCount: number;
  createdAt: string;
  isMember?: boolean;
}

export default function Circulos() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    type: 'APRENDIZAJE',
    maxParticipants: '',
    schedule: '',
    location: '',
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, []);

  // Fetch all círculos
  const { data: circulos, isLoading } = useQuery<Circulo[]>({
    queryKey: ['circulos', selectedType],
    queryFn: async () => {
      const response = await api.get('/federation/circulos');
      const data = response.data;
      if (selectedType === 'all') return data;
      return data.filter((c: Circulo) => c.type === selectedType);
    },
  });

  // Fetch user's círculos
  const { data: myCirculos } = useQuery<Circulo[]>({
    queryKey: ['my-circulos'],
    queryFn: async () => {
      const response = await api.get('/federation/circulos/my');
      return response.data;
    },
    enabled: isAuthenticated,
  });

  // Create círculo mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/federation/circulos', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circulos'] });
      queryClient.invalidateQueries({ queryKey: ['my-circulos'] });
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        description: '',
        type: 'APRENDIZAJE',
        maxParticipants: '',
        schedule: '',
        location: '',
      });
      alert('¡Círculo creado exitosamente!');
    },
  });

  // Join círculo mutation
  const joinMutation = useMutation({
    mutationFn: async (circuloId: string) => {
      const response = await api.post(`/federation/circulos/${circuloId}/join`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circulos'] });
      queryClient.invalidateQueries({ queryKey: ['my-circulos'] });
      alert('¡Te has unido al círculo!');
    },
  });

  // Leave círculo mutation
  const leaveMutation = useMutation({
    mutationFn: async (circuloId: string) => {
      const response = await api.post(`/federation/circulos/${circuloId}/leave`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circulos'] });
      queryClient.invalidateQueries({ queryKey: ['my-circulos'] });
      alert('Has salido del círculo');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...createForm,
      maxParticipants: createForm.maxParticipants ? parseInt(createForm.maxParticipants) : null,
    });
  };

  const circuloTypes = [
    { value: 'all', label: 'Todos', icon: '🌟', color: 'bg-gray-500' },
    { value: 'APRENDIZAJE', label: 'Aprendizaje', icon: '📚', color: 'bg-blue-500' },
    { value: 'TRANSFORMACION', label: 'Transformación', icon: '✨', color: 'bg-purple-500' },
    { value: 'APOYO', label: 'Apoyo Mutuo', icon: '🤝', color: 'bg-green-500' },
    { value: 'CREATIVIDAD', label: 'Creatividad', icon: '🎨', color: 'bg-pink-500' },
    { value: 'ACCION', label: 'Acción Social', icon: '🌍', color: 'bg-orange-500' },
  ];

  const getCirculoTypeInfo = (type: string) => {
    return circuloTypes.find(t => t.value === type) || circuloTypes[0];
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <UserGroupIcon className="h-8 w-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Círculos de Conciencia
              </h1>
            </div>
            {isAuthenticated && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                Crear Círculo
              </button>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Espacios federados de aprendizaje, transformación y acción colectiva
          </p>
        </div>

        {/* My Círculos (if authenticated) */}
        {isAuthenticated && myCirculos && myCirculos.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <h2 className="text-xl font-bold mb-4">Mis Círculos Activos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {myCirculos.slice(0, 3).map((circulo) => {
                const typeInfo = getCirculoTypeInfo(circulo.type);
                return (
                  <div key={circulo.id} className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{typeInfo.icon}</span>
                      <h3 className="font-semibold">{circulo.name}</h3>
                    </div>
                    <p className="text-sm text-indigo-100">{circulo.memberCount} miembros</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 mb-6 flex flex-wrap gap-2">
          {circuloTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedType === type.value
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>

        {/* Círculos Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : circulos && circulos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {circulos.map((circulo) => {
              const typeInfo = getCirculoTypeInfo(circulo.type);
              const isFull = circulo.maxParticipants && circulo.memberCount >= circulo.maxParticipants;

              return (
                <div
                  key={circulo.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className={`${typeInfo.color} h-2`}></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="text-3xl mb-2 block">{typeInfo.icon}</span>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {circulo.name}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {typeInfo.label}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {circulo.description}
                    </p>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        <UsersIcon className="h-4 w-4" />
                        <span>
                          {circulo.memberCount} miembros
                          {circulo.maxParticipants && ` / ${circulo.maxParticipants} max`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{circulo.schedule || 'Horario flexible'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpenIcon className="h-4 w-4" />
                        <span>{circulo.location}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Facilitador: {circulo.facilitatorName}
                      </p>

                      {isAuthenticated ? (
                        circulo.isMember ? (
                          <button
                            onClick={() => leaveMutation.mutate(circulo.id)}
                            disabled={leaveMutation.isPending}
                            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                          >
                            {leaveMutation.isPending ? 'Saliendo...' : 'Salir del Círculo'}
                          </button>
                        ) : (
                          <button
                            onClick={() => joinMutation.mutate(circulo.id)}
                            disabled={joinMutation.isPending || isFull}
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                          >
                            {isFull ? 'Círculo Lleno' : joinMutation.isPending ? 'Uniéndose...' : 'Unirse al Círculo'}
                          </button>
                        )
                      ) : (
                        <a
                          href="/auth/login"
                          className="block w-full px-4 py-2 bg-indigo-600 text-white text-center rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Iniciar Sesión para Unirse
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <UserGroupIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No hay círculos todavía
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Sé el primero en crear un círculo de conciencia
            </p>
            {isAuthenticated && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Crear Círculo
                </button>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-purple-600" />
            ¿Qué son los Círculos de Conciencia?
          </h3>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Los Círculos de Conciencia son espacios federados de encuentro, aprendizaje y transformación
              personal y colectiva. Funcionan a través de toda la red Gailu Labs, permitiendo conexiones
              más allá de las fronteras de un solo nodo.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tipos de Círculos:</h4>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>📚 <strong>Aprendizaje:</strong> Compartir conocimientos y habilidades</li>
                  <li>✨ <strong>Transformación:</strong> Crecimiento personal y espiritual</li>
                  <li>🤝 <strong>Apoyo Mutuo:</strong> Acompañamiento emocional y solidario</li>
                  <li>🎨 <strong>Creatividad:</strong> Expresión artística colectiva</li>
                  <li>🌍 <strong>Acción Social:</strong> Organizarse para el cambio</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Características:</h4>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>✓ Facilitación horizontal</li>
                  <li>✓ Participación voluntaria</li>
                  <li>✓ Conexión federada entre nodos</li>
                  <li>✓ Registro de reflexiones</li>
                  <li>✓ Asistencia y compromiso</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Crear Nuevo Círculo
              </h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre del Círculo
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Círculo
                  </label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    {circuloTypes.slice(1).map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Máx. Participantes (opcional)
                    </label>
                    <input
                      type="number"
                      min="2"
                      value={createForm.maxParticipants}
                      onChange={(e) => setCreateForm({ ...createForm, maxParticipants: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Horario
                    </label>
                    <input
                      type="text"
                      value={createForm.schedule}
                      onChange={(e) => setCreateForm({ ...createForm, schedule: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Ej: Lunes 18:00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ubicación (Online/Presencial)
                  </label>
                  <input
                    type="text"
                    value={createForm.location}
                    onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ej: Zoom / Barcelona"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {createMutation.isPending ? 'Creando...' : 'Crear Círculo'}
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
