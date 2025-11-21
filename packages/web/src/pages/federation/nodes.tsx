import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import {
  ServerIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

interface Node {
  id: string;
  nodeId: string;
  name: string;
  type: string;
  url: string;
  description: string | null;
  status: string;
  lastSeen: string;
  createdAt: string;
  activitiesCount?: number;
  membersCount?: number;
}

export default function NodesNetwork() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Fetch all nodes
  const { data: nodes, isLoading } = useQuery<Node[]>({
    queryKey: ['federation-nodes'],
    queryFn: async () => {
      const response = await api.get('/federation/nodes');
      return response.data;
    },
  });

  // Fetch current node info
  const { data: currentNode } = useQuery({
    queryKey: ['current-node-info'],
    queryFn: async () => {
      const response = await api.get('/federation/node-info');
      return response.data;
    },
  });

  // Fetch activities for selected node
  const { data: nodeActivities } = useQuery({
    queryKey: ['node-activities', selectedNode?.nodeId],
    queryFn: async () => {
      const response = await api.get(`/federation/activities/node/${selectedNode?.nodeId}`, {
        params: { limit: 5 },
      });
      return response.data;
    },
    enabled: !!selectedNode,
  });

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case 'GENESIS':
        return 'from-purple-600 to-indigo-600';
      case 'HUB':
        return 'from-blue-600 to-cyan-600';
      case 'COMMUNITY':
        return 'from-green-600 to-emerald-600';
      case 'PERSONAL':
        return 'from-orange-600 to-yellow-600';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'GENESIS':
        return '🌟';
      case 'HUB':
        return '🔷';
      case 'COMMUNITY':
        return '🏘️';
      case 'PERSONAL':
        return '👤';
      default:
        return '🔸';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'INACTIVE':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ServerIcon className="h-8 w-8 text-cyan-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Red de Nodos
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Explora la red federada Gailu Labs y sus nodos conectados
          </p>
        </div>

        {/* Current Node Info */}
        {currentNode && (
          <div className={`bg-gradient-to-r ${getNodeTypeColor(currentNode.type)} rounded-lg shadow-xl p-6 mb-8 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">{getNodeTypeIcon(currentNode.type)}</span>
                  <div>
                    <h2 className="text-2xl font-bold">{currentNode.name}</h2>
                    <p className="text-purple-100">Nodo Actual</p>
                  </div>
                </div>
                <p className="text-purple-100 text-sm mb-1">Node ID: {currentNode.nodeId}</p>
                <p className="text-purple-100 text-sm">Protocolo: {currentNode.protocol} • Versión: {currentNode.version}</p>
              </div>
              <div className="text-right">
                <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 backdrop-blur">
                  <p className="text-sm text-purple-100">Tipo</p>
                  <p className="text-xl font-bold">{currentNode.type}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {nodes && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Nodos</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{nodes.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Activos</p>
              <p className="text-3xl font-bold text-green-600">
                {nodes.filter(n => n.status === 'ACTIVE').length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tipo Hub</p>
              <p className="text-3xl font-bold text-blue-600">
                {nodes.filter(n => n.type === 'HUB').length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Comunidades</p>
              <p className="text-3xl font-bold text-green-600">
                {nodes.filter(n => n.type === 'COMMUNITY').length}
              </p>
            </div>
          </div>
        )}

        {/* Nodes Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
          </div>
        ) : nodes && nodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nodes.map((node) => (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className={`h-2 bg-gradient-to-r ${getNodeTypeColor(node.type)}`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getNodeTypeIcon(node.type)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          {node.name}
                        </h3>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(node.status)}`}>
                          {node.status === 'ACTIVE' ? '🟢 Activo' : '⚪ Inactivo'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {node.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {node.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <ServerIcon className="h-4 w-4" />
                      <span className="font-mono text-xs truncate">{node.nodeId}</span>
                    </div>
                    {node.url && (
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        <a
                          href={node.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {node.url}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4" />
                      <span>Última actividad: {new Date(node.lastSeen).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>

                  {(node.activitiesCount !== undefined || node.membersCount !== undefined) && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-4">
                      {node.activitiesCount !== undefined && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <GlobeAltIcon className="h-4 w-4" />
                          <span>{node.activitiesCount} actividades</span>
                        </div>
                      )}
                      {node.membersCount !== undefined && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <UserGroupIcon className="h-4 w-4" />
                          <span>{node.membersCount} miembros</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <ServerIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No hay nodos registrados
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              La red está creciendo, vuelve pronto
            </p>
          </div>
        )}

        {/* Node Types Info */}
        <div className="mt-12 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tipos de Nodos en la Red
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🌟</span>
                <h4 className="font-semibold text-gray-900 dark:text-white">GENESIS</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nodo fundacional de la red. Coordina la federación y mantiene el registro central.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🔷</span>
                <h4 className="font-semibold text-gray-900 dark:text-white">HUB</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nodo regional que conecta múltiples comunidades y facilita la comunicación federada.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🏘️</span>
                <h4 className="font-semibold text-gray-900 dark:text-white">COMMUNITY</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Comunidad local con su propio espacio en la federación. La mayoría de los nodos.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">👤</span>
                <h4 className="font-semibold text-gray-900 dark:text-white">PERSONAL</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nodo individual que permite a una persona participar directamente en la federación.
              </p>
            </div>
          </div>
        </div>

        {/* Selected Node Modal */}
        {selectedNode && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedNode(null)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{getNodeTypeIcon(selectedNode.type)}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedNode.name}
                    </h2>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedNode.status)}`}>
                      {selectedNode.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {selectedNode.description && (
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {selectedNode.description}
                </p>
              )}

              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Node ID</p>
                  <p className="text-sm font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                    {selectedNode.nodeId}
                  </p>
                </div>

                {selectedNode.url && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">URL</p>
                    <a
                      href={selectedNode.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400"
                    >
                      {selectedNode.url}
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tipo</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {selectedNode.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Última actividad</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {new Date(selectedNode.lastSeen).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>

              {nodeActivities && nodeActivities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Actividades Recientes
                  </h3>
                  <div className="space-y-2">
                    {nodeActivities.map((activity: any) => (
                      <div
                        key={activity.id}
                        className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                      >
                        <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                          {activity.content}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(activity.createdAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getStaticProps = async (context: any) => getI18nProps(context);
