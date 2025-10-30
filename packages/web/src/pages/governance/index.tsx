import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import Link from 'next/link';
import {
  ChartBarIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  TrophyIcon,
  UserGroupIcon,
  SparklesIcon,
  FireIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface GovernanceDashboard {
  totalProposals: number;
  activeProposals: number;
  approvedProposals: number;
  rejectedProposals: number;
  totalVotes: number;
  totalParticipants: number;
  pendingModerations: number;
  totalBlocks: number;
}

interface Proposal {
  id: string;
  type: string;
  title: string;
  description: string;
  status: string;
  votesFor: number;
  votesAgainst: number;
  votesNeeded: number;
  createdAt: string;
  author: {
    name: string;
  };
}

export default function GovernanceDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, []);

  // Fetch dashboard stats
  const { data: dashboard, isLoading: dashboardLoading } = useQuery<GovernanceDashboard>({
    queryKey: ['governance-dashboard'],
    queryFn: async () => {
      const response = await api.get('/consensus/dashboard');
      return response.data;
    },
  });

  // Fetch recent proposals
  const { data: proposals, isLoading: proposalsLoading } = useQuery<Proposal[]>({
    queryKey: ['proposals-recent'],
    queryFn: async () => {
      const response = await api.get('/consensus/proposals', {
        params: { limit: 10 },
      });
      return response.data;
    },
  });

  const stats = [
    {
      title: 'Propuestas Activas',
      value: dashboard?.activeProposals || 0,
      total: dashboard?.totalProposals || 0,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      href: '/governance/proposals',
    },
    {
      title: 'Total de Votos',
      value: dashboard?.totalVotes || 0,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      href: '/governance/proposals',
    },
    {
      title: 'Participantes',
      value: dashboard?.totalParticipants || 0,
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      href: '/governance/leaderboard',
    },
    {
      title: 'Moderaciones Pendientes',
      value: dashboard?.pendingModerations || 0,
      icon: ShieldCheckIcon,
      color: 'bg-orange-500',
      href: '/governance/moderation',
    },
  ];

  const features = [
    {
      title: 'Propuestas (CIPs)',
      description: 'Crea y vota propuestas de mejora comunitaria',
      icon: DocumentTextIcon,
      href: '/governance/proposals',
      color: 'bg-gradient-to-br from-blue-600 to-blue-700',
      badge: `${dashboard?.activeProposals || 0} activas`,
    },
    {
      title: 'Delegación Líquida',
      description: 'Delega tu poder de voto a representantes de confianza',
      icon: UserGroupIcon,
      href: '/governance/delegation',
      color: 'bg-gradient-to-br from-purple-600 to-purple-700',
    },
    {
      title: 'Moderación DAO',
      description: 'Participa en la moderación comunitaria descentralizada',
      icon: ShieldCheckIcon,
      href: '/governance/moderation',
      color: 'bg-gradient-to-br from-orange-600 to-orange-700',
      badge: dashboard?.pendingModerations ? `${dashboard.pendingModerations} pendientes` : undefined,
    },
    {
      title: 'Leaderboard de Reputación',
      description: 'Ranking de miembros según su Proof of Help',
      icon: TrophyIcon,
      href: '/governance/leaderboard',
      color: 'bg-gradient-to-br from-yellow-600 to-yellow-700',
    },
    {
      title: 'Bloques de Confianza',
      description: 'Historial de acciones validadas por la comunidad',
      icon: SparklesIcon,
      href: '/governance/blocks',
      color: 'bg-gradient-to-br from-green-600 to-green-700',
      badge: `${dashboard?.totalBlocks || 0} bloques`,
    },
    {
      title: 'Mi Reputación',
      description: 'Ve tu puntuación y privilegios de gobernanza',
      icon: FireIcon,
      href: '/governance/my-reputation',
      color: 'bg-gradient-to-br from-red-600 to-red-700',
    },
  ];

  const getProposalStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'APPROVED':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getProposalTypeIcon = (type: string) => {
    switch (type) {
      case 'FEATURE':
        return '✨';
      case 'RULE_CHANGE':
        return '📜';
      case 'FUND_ALLOCATION':
        return '💰';
      case 'PARTNERSHIP':
        return '🤝';
      case 'COMMUNITY_UPDATE':
        return '🏘️';
      default:
        return '📝';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ChartBarIcon className="h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard de Gobernanza
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Sistema de gobernanza descentralizada con votación cuadrática y democracia líquida
          </p>
        </div>

        {/* Stats Grid */}
        {dashboardLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Link
                    key={stat.title}
                    href={stat.href}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      {stat.total !== undefined && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          de {stat.total}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value.toLocaleString()}
                    </p>
                  </Link>
                );
              })}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Link
                    key={feature.title}
                    href={feature.href}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className={`${feature.color} p-6`}>
                      <div className="flex items-center justify-between">
                        <Icon className="h-10 w-10 text-white" />
                        {feature.badge && (
                          <span className="px-3 py-1 bg-white bg-opacity-20 backdrop-blur rounded-full text-xs font-medium text-white">
                            {feature.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Recent Proposals */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Propuestas Recientes
                </h2>
                <Link
                  href="/governance/proposals"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Ver todas →
                </Link>
              </div>

              {proposalsLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : proposals && proposals.length > 0 ? (
                <div className="space-y-4">
                  {proposals.slice(0, 5).map((proposal) => (
                    <Link
                      key={proposal.id}
                      href={`/governance/proposals/${proposal.id}`}
                      className="block p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getProposalTypeIcon(proposal.type)}</span>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {proposal.title}
                          </h3>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProposalStatusColor(proposal.status)}`}>
                          {proposal.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {proposal.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Por {proposal.author.name} • {new Date(proposal.createdAt).toLocaleDateString('es-ES')}
                        </span>
                        {proposal.status === 'ACTIVE' && (
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-green-600 dark:text-green-400">
                              ✓ {proposal.votesFor}
                            </span>
                            <span className="text-red-600 dark:text-red-400">
                              ✗ {proposal.votesAgainst}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    No hay propuestas todavía
                  </p>
                  {isAuthenticated && (
                    <Link
                      href="/governance/proposals/create"
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Crear Primera Propuesta
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900 dark:to-red-900 dark:bg-opacity-20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                💡 Sobre el Sistema de Gobernanza
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Comunidad Viva utiliza un sistema híbrido de gobernanza que combina votación cuadrática,
                democracia líquida y Proof of Help para decisiones justas y descentralizadas.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                    📊 Votación Cuadrática
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Vota con puntos. El costo aumenta cuadráticamente para evitar plutocracy
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                    🔄 Democracia Líquida
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Delega tu voto a expertos o vota directamente
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                    ✨ Proof of Help
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Tu reputación determina tus privilegios de gobernanza
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
