import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { GetServerSideProps } from 'next';
import { userStorage, tokenStorage } from '@/lib/storage';

// Types
type PlatformType = 'TELEGRAM' | 'WHATSAPP_BUSINESS' | 'DISCORD' | 'SIGNAL' | 'SLACK';

interface Integration {
  id: string;
  communityId: string;
  platform: PlatformType;
  channelId: string;
  channelName?: string;
  botToken?: string;
  enabled: boolean;
  autoPublish: boolean;
  publishOffers: boolean;
  publishEvents: boolean;
  publishNeeds: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Community {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

interface IntegrationFormData {
  platform: PlatformType;
  channelId: string;
  channelName: string;
  botToken: string;
  autoPublish: boolean;
  publishOffers: boolean;
  publishEvents: boolean;
  publishNeeds: boolean;
}

// Platform icons and display data
const PLATFORM_DATA: Record<PlatformType, { icon: string; name: string; color: string }> = {
  TELEGRAM: { icon: '✈️', name: 'Telegram', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  WHATSAPP_BUSINESS: { icon: '💬', name: 'WhatsApp Business', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  DISCORD: { icon: '🎮', name: 'Discord', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' },
  SIGNAL: { icon: '🔒', name: 'Signal', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
  SLACK: { icon: '💼', name: 'Slack', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
};

const INITIAL_FORM_DATA: IntegrationFormData = {
  platform: 'TELEGRAM',
  channelId: '',
  channelName: '',
  botToken: '',
  autoPublish: true,
  publishOffers: true,
  publishEvents: true,
  publishNeeds: true,
};

export default function IntegrationsPage() {
  const router = useRouter();
  const { slug } = router.query;
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [formData, setFormData] = useState<IntegrationFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch community data
  const { data: community, isLoading: communityLoading } = useQuery<Community>({
    queryKey: ['community', slug],
    queryFn: async () => {
      const response = await api.get(`/communities/slug/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });

  // Fetch integrations
  const { data: integrations, isLoading: integrationsLoading } = useQuery<Integration[]>({
    queryKey: ['integrations', community?.id],
    queryFn: async () => {
      const response = await api.get(`/integrations/community/${community?.id}`);
      return response.data;
    },
    enabled: !!community?.id,
  });

  // Toggle integration enabled status
  const toggleMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      const response = await api.post(`/integrations/${integrationId}/toggle`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Estado actualizado');
      queryClient.invalidateQueries({ queryKey: ['integrations', community?.id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el estado');
    },
  });

  // Test integration
  const testMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      const response = await api.post(`/integrations/${integrationId}/test`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Mensaje de prueba enviado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al enviar mensaje de prueba');
    },
  });

  // Delete integration
  const deleteMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      const response = await api.delete(`/integrations/${integrationId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Integración eliminada correctamente');
      queryClient.invalidateQueries({ queryKey: ['integrations', community?.id] });
      setDeleteConfirmId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar la integración');
    },
  });

  const handleOpenModal = (integration?: Integration) => {
    if (integration) {
      setEditingIntegration(integration);
      setFormData({
        platform: integration.platform,
        channelId: integration.channelId,
        channelName: integration.channelName || '',
        botToken: '', // Don't prefill token for security
        autoPublish: integration.autoPublish,
        publishOffers: integration.publishOffers,
        publishEvents: integration.publishEvents,
        publishNeeds: integration.publishNeeds,
      });
    } else {
      setEditingIntegration(null);
      setFormData(INITIAL_FORM_DATA);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIntegration(null);
    setFormData(INITIAL_FORM_DATA);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.channelId || !formData.botToken) {
      toast.error('Por favor, completa los campos requeridos');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingIntegration) {
        // Update existing integration
        await api.put(`/integrations/${editingIntegration.id}`, {
          channelId: formData.channelId,
          channelName: formData.channelName,
          botToken: formData.botToken,
          autoPublish: formData.autoPublish,
          publishOffers: formData.publishOffers,
          publishEvents: formData.publishEvents,
          publishNeeds: formData.publishNeeds,
        });
        toast.success('Integración actualizada correctamente');
      } else {
        // Create new integration
        await api.post('/integrations', {
          communityId: community?.id,
          platform: formData.platform,
          channelId: formData.channelId,
          channelName: formData.channelName,
          botToken: formData.botToken,
          autoPublish: formData.autoPublish,
          publishOffers: formData.publishOffers,
          publishEvents: formData.publishEvents,
          publishNeeds: formData.publishNeeds,
        });
        toast.success('Integración creada correctamente');
      }

      queryClient.invalidateQueries({ queryKey: ['integrations', community?.id] });
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar la integración');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSettings = async (integrationId: string, updates: Partial<Integration>) => {
    try {
      await api.put(`/integrations/${integrationId}`, updates);
      toast.success('Configuración actualizada');
      queryClient.invalidateQueries({ queryKey: ['integrations', community?.id] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar la configuración');
    }
  };

  if (communityLoading) {
    return (
      <Layout title="Cargando...">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!community) {
    return (
      <Layout title="Comunidad no encontrada">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Comunidad no encontrada
            </h1>
            <Button onClick={() => router.push('/comunidades')}>
              Volver a comunidades
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Integraciones - {community.name} - Truk</title>
      </Head>

      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Integraciones de Redes Sociales
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Conecta {community.name} con tus canales de comunicación favoritos
                  </p>
                </div>
                <Button
                  onClick={() => handleOpenModal()}
                  icon={<PlusIcon className="h-5 w-5" />}
                  size="md"
                >
                  Añadir Integración
                </Button>
              </div>
            </div>

            {/* Integrations List */}
            {integrationsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando integraciones...</p>
              </div>
            ) : integrations && integrations.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {integrations.map((integration) => {
                  const platformData = PLATFORM_DATA[integration.platform];
                  return (
                    <Card key={integration.id} className="p-6" hover={false}>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl">{platformData.icon}</div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {platformData.name}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${platformData.color}`}>
                                {integration.platform}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {integration.channelName || integration.channelId}
                            </p>
                          </div>
                        </div>

                        {/* Toggle Switch */}
                        <button
                          onClick={() => toggleMutation.mutate(integration.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            integration.enabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                          disabled={toggleMutation.isPending}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              integration.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Channel Info */}
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID del Canal</p>
                        <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                          {integration.channelId}
                        </p>
                      </div>

                      {/* Settings Checkboxes */}
                      <div className="space-y-2 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={integration.autoPublish}
                            onChange={(e) => handleUpdateSettings(integration.id, { autoPublish: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Publicación automática
                          </span>
                        </label>

                        <div className="ml-6 space-y-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={integration.publishOffers}
                              onChange={(e) => handleUpdateSettings(integration.id, { publishOffers: e.target.checked })}
                              disabled={!integration.autoPublish}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Publicar ofertas
                            </span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={integration.publishEvents}
                              onChange={(e) => handleUpdateSettings(integration.id, { publishEvents: e.target.checked })}
                              disabled={!integration.autoPublish}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Publicar eventos
                            </span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={integration.publishNeeds}
                              onChange={(e) => handleUpdateSettings(integration.id, { publishNeeds: e.target.checked })}
                              disabled={!integration.autoPublish}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Publicar necesidades
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          onClick={() => testMutation.mutate(integration.id)}
                          variant="outline"
                          size="sm"
                          icon={<BoltIcon className="h-4 w-4" />}
                          isLoading={testMutation.isPending}
                        >
                          Probar
                        </Button>
                        <Button
                          onClick={() => handleOpenModal(integration)}
                          variant="ghost"
                          size="sm"
                          icon={<PencilIcon className="h-4 w-4" />}
                        >
                          Editar
                        </Button>
                        <Button
                          onClick={() => setDeleteConfirmId(integration.id)}
                          variant="ghost"
                          size="sm"
                          icon={<TrashIcon className="h-4 w-4" />}
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Eliminar
                        </Button>
                      </div>

                      {/* Status Badge */}
                      <div className="mt-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          integration.enabled
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {integration.enabled ? (
                            <>
                              <CheckIcon className="h-3 w-3" />
                              Activa
                            </>
                          ) : (
                            <>
                              <XMarkIcon className="h-3 w-3" />
                              Inactiva
                            </>
                          )}
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 text-center" hover={false}>
                <div className="text-6xl mb-4">📱</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No hay integraciones configuradas
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Conecta tu comunidad con plataformas de mensajería para compartir contenido automáticamente
                </p>
                <Button
                  onClick={() => handleOpenModal()}
                  icon={<PlusIcon className="h-5 w-5" />}
                >
                  Añadir Primera Integración
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Create/Edit Modal */}
        <Transition appear show={isModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={handleCloseModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-50" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      {editingIntegration ? 'Editar Integración' : 'Añadir Integración'}
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Platform Selection (only for new) */}
                      {!editingIntegration && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Plataforma *
                          </label>
                          <select
                            value={formData.platform}
                            onChange={(e) => setFormData({ ...formData, platform: e.target.value as PlatformType })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            required
                          >
                            {Object.entries(PLATFORM_DATA).map(([value, data]) => (
                              <option key={value} value={value}>
                                {data.icon} {data.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Channel ID */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          ID del Canal *
                        </label>
                        <input
                          type="text"
                          value={formData.channelId}
                          onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
                          placeholder="ej: -1001234567890"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
                          required
                        />
                      </div>

                      {/* Channel Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nombre del Canal (opcional)
                        </label>
                        <input
                          type="text"
                          value={formData.channelName}
                          onChange={(e) => setFormData({ ...formData, channelName: e.target.value })}
                          placeholder="ej: Canal Principal"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      {/* Bot Token */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Token del Bot *
                        </label>
                        <input
                          type="password"
                          value={formData.botToken}
                          onChange={(e) => setFormData({ ...formData, botToken: e.target.value })}
                          placeholder="ej: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
                          required
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          El token será encriptado y almacenado de forma segura
                        </p>
                      </div>

                      {/* Auto-publish Settings */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.autoPublish}
                            onChange={(e) => setFormData({ ...formData, autoPublish: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Publicación Automática
                          </span>
                        </label>

                        <div className="ml-6 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.publishOffers}
                              onChange={(e) => setFormData({ ...formData, publishOffers: e.target.checked })}
                              disabled={!formData.autoPublish}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Publicar ofertas
                            </span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.publishEvents}
                              onChange={(e) => setFormData({ ...formData, publishEvents: e.target.checked })}
                              disabled={!formData.autoPublish}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Publicar eventos
                            </span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.publishNeeds}
                              onChange={(e) => setFormData({ ...formData, publishNeeds: e.target.checked })}
                              disabled={!formData.autoPublish}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Publicar necesidades de ayuda mutua
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          onClick={handleCloseModal}
                          variant="outline"
                          fullWidth
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          fullWidth
                          isLoading={isSubmitting}
                        >
                          {editingIntegration ? 'Actualizar' : 'Guardar'}
                        </Button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Delete Confirmation Modal */}
        <Transition appear show={deleteConfirmId !== null} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setDeleteConfirmId(null)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-50" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <TrashIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                        Eliminar Integración
                      </Dialog.Title>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      ¿Estás seguro de que deseas eliminar esta integración? Esta acción no se puede deshacer.
                    </p>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => setDeleteConfirmId(null)}
                        variant="outline"
                        fullWidth
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
                        variant="danger"
                        fullWidth
                        isLoading={deleteMutation.isPending}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </Layout>
    </>
  );
}

// Server-side authentication and authorization check
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params as { slug: string };

  // Get i18n props
  const i18nProps = await getI18nProps(context);

  // Note: In a real implementation, you would:
  // 1. Check if user is authenticated (via cookies/session)
  // 2. Verify user is admin of the community
  // 3. Redirect to login or 403 if not authorized
  //
  // Example (simplified):
  // const session = await getServerSession(context);
  // if (!session) {
  //   return {
  //     redirect: {
  //       destination: `/auth/login?returnTo=/comunidades/${slug}/integrations`,
  //       permanent: false,
  //     },
  //   };
  // }
  //
  // const isAdmin = await checkIfUserIsAdmin(session.user.id, slug);
  // if (!isAdmin) {
  //   return {
  //     redirect: {
  //       destination: `/comunidades/${slug}`,
  //       permanent: false,
  //     },
  //   };
  // }

  return {
    props: {
      ...i18nProps,
      slug,
    },
  };
};
