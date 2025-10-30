import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
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

const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800',
  FILLED: 'bg-yellow-100 text-yellow-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

export default function HousingPage() {
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const { data: solutions, isLoading } = useQuery({
    queryKey: ['housing-solutions', selectedType],
    queryFn: async () => {
      const params: any = {};
      if (selectedType !== 'ALL') {
        params.type = selectedType;
      }
      const response = await api.get('/housing/solutions', { params });
      return response.data;
    },
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Vivienda Comunitaria</h1>
                <p className="text-gray-600 mt-2">
                  Soluciones de vivienda solidaria y colaborativa
                </p>
              </div>
              <Link
                href="/housing/new"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                + Crear Solución
              </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedType('ALL')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedType === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              {Object.entries(SOLUTION_TYPE_LABELS).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Solutions Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : solutions && solutions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {solutions.map((solution: any) => (
                <Link
                  key={solution.id}
                  href={`/housing/${solution.id}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  {solution.images && solution.images.length > 0 && (
                    <img
                      src={solution.images[0]}
                      alt={solution.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {SOLUTION_TYPE_LABELS[solution.solutionType as keyof typeof SOLUTION_TYPE_LABELS]}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        STATUS_COLORS[solution.status as keyof typeof STATUS_COLORS]
                      }`}>
                        {STATUS_LABELS[solution.status as keyof typeof STATUS_LABELS]}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {solution.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {solution.description}
                    </p>

                    <div className="space-y-2 text-sm text-gray-600">
                      {solution.location && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{solution.location}</span>
                        </div>
                      )}

                      {solution.solutionType === 'SPACE_BANK' && solution.capacity && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>Capacidad: {solution.capacity} personas</span>
                        </div>
                      )}

                      {solution.solutionType === 'HOUSING_COOP' && solution.targetMembers && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <span>{solution.currentMembers}/{solution.targetMembers} miembros</span>
                        </div>
                      )}

                      {solution.monthlyContribution && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span>{solution.monthlyContribution}€/mes</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay soluciones de vivienda disponibles
              </h3>
              <p className="text-gray-600 mb-4">
                Sé el primero en crear una solución de vivienda comunitaria
              </p>
              <Link
                href="/housing/new"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Crear Solución
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps = getI18nProps;
