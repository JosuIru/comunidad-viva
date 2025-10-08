import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';

type CommunityType = 'NEIGHBORHOOD' | 'VILLAGE' | 'TOWN' | 'COUNTY' | 'REGION' | 'CUSTOM';
type CommunityVisibility = 'PRIVATE' | 'PUBLIC' | 'OPEN' | 'FEDERATED';

interface Community {
  id: string;
  slug: string;
  name: string;
  description?: string;
  location?: string;
  type: CommunityType;
  visibility: CommunityVisibility;
  membersCount: number;
  activeOffersCount: number;
  logo?: string;
  bannerImage?: string;
  primaryColor?: string;
}

const typeLabels: Record<CommunityType, string> = {
  NEIGHBORHOOD: 'Barrio',
  VILLAGE: 'Pueblo',
  TOWN: 'Ciudad',
  COUNTY: 'Comarca',
  REGION: 'Región',
  CUSTOM: 'Personalizado',
};

const visibilityLabels: Record<CommunityVisibility, string> = {
  PRIVATE: 'Privada',
  PUBLIC: 'Pública',
  OPEN: 'Abierta',
  FEDERATED: 'Federada',
};

export default function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterVisibility, setFilterVisibility] = useState<string>('');

  const { data: communities, isLoading } = useQuery<Community[]>({
    queryKey: ['communities', searchQuery, filterType, filterVisibility],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterType) params.append('type', filterType);
      if (filterVisibility) params.append('visibility', filterVisibility);

      const response = await api.get(`/communities?${params.toString()}`);
      return response.data;
    },
  });

  return (
    <Layout title="Comunidades - Explora">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <h1 className="text-5xl font-bold mb-6 text-center">
              🏘️ Comunidades Locales
            </h1>
            <p className="text-2xl opacity-90 text-center max-w-3xl mx-auto">
              Descubre y únete a comunidades de economía colaborativa cerca de ti
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Search & Filters */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔍 Buscar
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nombre o ubicación..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📍 Tipo
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔓 Visibilidad
                </label>
                <select
                  value={filterVisibility}
                  onChange={(e) => setFilterVisibility(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas</option>
                  {Object.entries(visibilityLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              💡 ¿No encuentras tu comunidad?{' '}
              <Link href="/admin/communities" className="text-blue-600 hover:underline font-semibold">
                Créala tú
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {communities?.length || 0}
              </div>
              <div className="text-gray-600">Comunidades Activas</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {communities?.reduce((sum, c) => sum + c.membersCount, 0) || 0}
              </div>
              <div className="text-gray-600">Miembros Total</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-teal-600 mb-2">
                {communities?.reduce((sum, c) => sum + c.activeOffersCount, 0) || 0}
              </div>
              <div className="text-gray-600">Ofertas Activas</div>
            </div>
          </div>

          {/* Communities Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Cargando comunidades...</p>
            </div>
          ) : communities && communities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map((community) => (
                <Link
                  key={community.id}
                  href={`/communities/${community.slug}`}
                  className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1"
                >
                  {/* Banner */}
                  <div
                    className="h-32 bg-gradient-to-r from-blue-500 to-green-500"
                    style={
                      community.primaryColor
                        ? {
                            background: `linear-gradient(135deg, ${community.primaryColor}, ${community.primaryColor}dd)`,
                          }
                        : undefined
                    }
                  >
                    {community.bannerImage && (
                      <img
                        src={community.bannerImage}
                        alt={community.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Logo */}
                    {community.logo && (
                      <div className="-mt-16 mb-4">
                        <img
                          src={community.logo}
                          alt={community.name}
                          className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                        />
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {community.name}
                    </h3>

                    {community.location && (
                      <p className="text-sm text-gray-600 mb-3">📍 {community.location}</p>
                    )}

                    {community.description && (
                      <p className="text-gray-700 mb-4 line-clamp-2">{community.description}</p>
                    )}

                    {/* Stats */}
                    <div className="flex gap-4 text-sm text-gray-600 mb-4">
                      <span>👥 {community.membersCount}</span>
                      <span>🛍️ {community.activeOffersCount}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        {typeLabels[community.type]}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          community.visibility === 'OPEN'
                            ? 'bg-green-100 text-green-800'
                            : community.visibility === 'PUBLIC'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {visibilityLabels[community.visibility]}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="text-blue-600 font-semibold text-sm group-hover:text-blue-700 flex items-center justify-between">
                      <span>Ver comunidad</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🏘️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No hay comunidades todavía
              </h3>
              <p className="text-gray-600 mb-6">
                Sé el primero en crear una comunidad local
              </p>
              <Link
                href="/admin/communities"
                className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Crear Comunidad
              </Link>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl shadow-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">¿Quieres gestionar comunidades?</h2>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Crea y administra comunidades locales de economía colaborativa. Conecta vecinos,
              organiza eventos y construye redes de apoyo mutuo.
            </p>
            <Link
              href="/admin/communities"
              className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-bold"
            >
              Ir al Panel de Gestión →
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export { getI18nProps as getStaticProps };
