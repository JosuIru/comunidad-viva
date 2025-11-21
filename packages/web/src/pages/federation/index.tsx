import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import Link from 'next/link';
import { getI18nProps } from '@/lib/i18n';
import {
  GlobeAltIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ServerIcon,
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface NodeInfo {
  nodeId: string;
  name: string;
  type: string;
  version: string;
  protocol: string;
}

interface SemillaStats {
  totalSupply: number;
  totalTransactions: number;
  activeUsers: number;
  averageBalance: number;
}

interface UserDID {
  did: string;
  balance: number;
}

export default function FederationDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUserId = localStorage.getItem('user_id');
    setIsAuthenticated(!!token);
    setUserId(storedUserId);
  }, []);

  // Fetch node info
  const { data: nodeInfo } = useQuery<NodeInfo>({
    queryKey: ['federation-node-info'],
    queryFn: async () => {
      const response = await api.get('/federation/node-info');
      return response.data;
    },
  });

  // Fetch Semilla stats
  const { data: semillaStats } = useQuery<SemillaStats>({
    queryKey: ['semilla-stats'],
    queryFn: async () => {
      const response = await api.get('/federation/semilla/stats');
      return response.data;
    },
  });

  // Fetch user's DID and balance (if authenticated)
  const { data: userDID } = useQuery<UserDID>({
    queryKey: ['user-did', userId],
    queryFn: async () => {
      const response = await api.get('/federation/semilla/balance');
      return response.data;
    },
    enabled: isAuthenticated && !!userId,
  });

  // Fetch all nodes
  const { data: nodes } = useQuery({
    queryKey: ['federation-nodes'],
    queryFn: async () => {
      const response = await api.get('/federation/nodes');
      return response.data;
    },
  });

  // Fetch federated feed preview
  const { data: federatedFeed } = useQuery({
    queryKey: ['federated-feed-preview'],
    queryFn: async () => {
      const response = await api.get('/federation/feed', { params: { limit: 5 } });
      return response.data;
    },
  });

  const features = [
    {
      title: 'Identidad Descentralizada (DID)',
      description: 'Tu identidad única en la red federada Gailu Labs',
      icon: SparklesIcon,
      href: '/federation/did',
      color: 'bg-purple-500',
    },
    {
      title: 'Semilla Wallet',
      description: 'Gestiona tu moneda SEMILLA federada',
      icon: CurrencyDollarIcon,
      href: '/federation/semilla',
      color: 'bg-green-500',
      badge: userDID?.balance ? `${userDID.balance.toFixed(2)} SEMILLA` : undefined,
    },
    {
      title: 'Feed Federado',
      description: 'Contenido de toda la red Gailu',
      icon: GlobeAltIcon,
      href: '/federation/feed',
      color: 'bg-blue-500',
    },
    {
      title: 'Círculos de Conciencia',
      description: 'Espacios de aprendizaje y transformación',
      icon: UserGroupIcon,
      href: '/federation/circulos',
      color: 'bg-indigo-500',
    },
    {
      title: 'Red de Nodos',
      description: 'Explora la red federada global',
      icon: ServerIcon,
      href: '/federation/nodes',
      color: 'bg-cyan-500',
      badge: nodes?.length ? `${nodes.length} nodos` : undefined,
    },
    {
      title: 'Dashboard Ecosistema',
      description: 'Métricas y estadísticas globales',
      icon: ChartBarIcon,
      href: '/federation/ecosystem',
      color: 'bg-orange-500',
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Federación Gailu Labs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Red descentralizada de economía solidaria y transformación social
          </p>
        </div>

        {/* Node Info Card */}
        {nodeInfo && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{nodeInfo.name}</h2>
                <p className="text-purple-100 mb-1">Node ID: {nodeInfo.nodeId}</p>
                <p className="text-purple-100">Protocolo: {nodeInfo.protocol} • Versión: {nodeInfo.version}</p>
              </div>
              <div className="text-right">
                <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 backdrop-blur">
                  <p className="text-sm text-purple-100">Tipo de Nodo</p>
                  <p className="text-xl font-bold">{nodeInfo.type}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User DID Card (if authenticated) */}
        {isAuthenticated && userDID && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tu Identidad Federada
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">DID</p>
                <p className="text-sm font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded truncate">
                  {userDID.did}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Balance SEMILLA</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {userDID.balance.toFixed(2)} <span className="text-sm">SEMILLA</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Semilla Stats */}
        {semillaStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Suministro Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {semillaStats.totalSupply.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">SEMILLA</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Transacciones</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {semillaStats.totalTransactions.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Usuarios Activos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {semillaStats.activeUsers.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Con balance</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Balance Promedio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {semillaStats.averageBalance.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">SEMILLA</p>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                  {feature.badge && (
                    <div className="mt-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {feature.badge}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </Link>
            );
          })}
        </div>

        {/* Quick Info Section */}
        <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ¿Qué es la Federación Gailu Labs?
          </h3>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              La Federación Gailu Labs es una red descentralizada de comunidades conectadas por valores compartidos
              de economía solidaria, transformación social y sostenibilidad. A través de identidades descentralizadas
              (DIDs) y la moneda SEMILLA, las comunidades pueden:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>✨ Mantener su identidad única e independiente</li>
              <li>💱 Realizar transacciones federadas con SEMILLA</li>
              <li>🌍 Compartir contenido y recursos entre nodos</li>
              <li>🎓 Participar en círculos de aprendizaje globales</li>
              <li>🤝 Colaborar en proyectos intercomunitarios</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
