import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import { HeartIcon, GlobeAltIcon, AcademicCapIcon, HomeIcon } from '@heroicons/react/24/outline';

const SCOPE_LABELS = {
  PERSONAL: 'Personal',
  COMMUNITY: 'Comunitario',
  INTERCOMMUNITY: 'Intercomunitario',
  GLOBAL: 'Global',
};

const SCOPE_COLORS = {
  PERSONAL: 'bg-blue-100 text-blue-800',
  COMMUNITY: 'bg-green-100 text-green-800',
  INTERCOMMUNITY: 'bg-purple-100 text-purple-800',
  GLOBAL: 'bg-orange-100 text-orange-800',
};

const TYPE_LABELS: Record<string, string> = {
  FOOD: 'Alimentos',
  HOUSING: 'Vivienda',
  HEALTH: 'Salud',
  EDUCATION: 'Educación',
  INFRASTRUCTURE: 'Infraestructura',
  WATER_SANITATION: 'Agua y Saneamiento',
  ENVIRONMENT: 'Medio Ambiente',
  AUZOLAN: 'Auzolan',
};

// UN Sustainable Development Goals (SDG/ODS)
const SDG_ICONS: Record<number, string> = {
  1: '🚫', 2: '🌾', 3: '❤️', 4: '📚', 5: '⚖️',
  6: '💧', 7: '⚡', 8: '📈', 9: '🏗️', 10: '🤝',
  11: '🏘️', 12: '♻️', 13: '🌍', 14: '🌊', 15: '🌳',
  16: '⚖️', 17: '🤲',
};

const SDG_NAMES: Record<number, string> = {
  1: 'Fin de la Pobreza',
  2: 'Hambre Cero',
  3: 'Salud y Bienestar',
  4: 'Educación de Calidad',
  5: 'Igualdad de Género',
  6: 'Agua Limpia y Saneamiento',
  7: 'Energía Asequible',
  8: 'Trabajo Decente',
  9: 'Industria e Innovación',
  10: 'Reducción Desigualdades',
  11: 'Ciudades Sostenibles',
  12: 'Consumo Responsable',
  13: 'Acción Climática',
  14: 'Vida Submarina',
  15: 'Vida Terrestre',
  16: 'Paz y Justicia',
  17: 'Alianzas',
};

const SDG_COLORS: Record<number, string> = {
  1: 'from-red-600 to-red-700',
  2: 'from-yellow-600 to-yellow-700',
  3: 'from-green-600 to-green-700',
  4: 'from-red-700 to-red-800',
  5: 'from-orange-600 to-orange-700',
  6: 'from-cyan-600 to-cyan-700',
  7: 'from-yellow-500 to-yellow-600',
  8: 'from-red-800 to-red-900',
  9: 'from-orange-700 to-orange-800',
  10: 'from-pink-600 to-pink-700',
  11: 'from-orange-500 to-orange-600',
  12: 'from-yellow-700 to-yellow-800',
  13: 'from-green-700 to-green-800',
  14: 'from-blue-600 to-blue-700',
  15: 'from-green-800 to-green-900',
  16: 'from-blue-700 to-blue-800',
  17: 'from-blue-800 to-blue-900',
};

export default function MutualAidPage() {
  const [tab, setTab] = useState<'needs' | 'projects'>('needs');
  const [selectedSDG, setSelectedSDG] = useState<number | null>(null);
  const [showSDGFilter, setShowSDGFilter] = useState(false);

  const { data: needs, isLoading: needsLoading } = useQuery({
    queryKey: ['mutual-aid-needs'],
    queryFn: async () => {
      const response = await api.get('/mutual-aid/needs', {
        params: { limit: 20 },
      });
      return response.data;
    },
    enabled: tab === 'needs',
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['mutual-aid-projects'],
    queryFn: async () => {
      const response = await api.get('/mutual-aid/projects', {
        params: { limit: 20 },
      });
      return response.data;
    },
    enabled: tab === 'projects',
  });

  // Filter projects by SDG
  const filteredProjects = selectedSDG && projects
    ? projects.filter((p: any) => p.sdgGoals && p.sdgGoals.includes(selectedSDG))
    : projects;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Ayuda Mutua</h1>
                <p className="text-gray-600 mt-2">
                  Comparte necesidades y proyectos comunitarios alineados con los ODS
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTab('needs')}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  tab === 'needs'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Necesidades
              </button>
              <button
                onClick={() => setTab('projects')}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  tab === 'projects'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Proyectos Comunitarios
              </button>
            </div>

            {/* SDG Filter - Only show for projects */}
            {tab === 'projects' && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Filtrar por Objetivos de Desarrollo Sostenible (ODS)
                  </h3>
                  <button
                    onClick={() => setShowSDGFilter(!showSDGFilter)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {showSDGFilter ? 'Ocultar' : 'Mostrar'} ODS
                  </button>
                </div>

                {showSDGFilter && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2">
                    <button
                      onClick={() => setSelectedSDG(null)}
                      className={`p-2 rounded-lg text-center transition ${
                        selectedSDG === null
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <div className="text-sm font-semibold">Todos</div>
                    </button>
                    {Object.keys(SDG_ICONS).map((sdgNum) => {
                      const num = parseInt(sdgNum);
                      return (
                        <button
                          key={num}
                          onClick={() => setSelectedSDG(num)}
                          className={`p-2 rounded-lg text-center transition ${
                            selectedSDG === num
                              ? `bg-gradient-to-br ${SDG_COLORS[num]} text-white shadow-md`
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                          title={SDG_NAMES[num]}
                        >
                          <div className="text-2xl mb-1">{SDG_ICONS[num]}</div>
                          <div className="text-xs font-semibold">ODS {num}</div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedSDG && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm text-gray-600">Filtrando por:</span>
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${SDG_COLORS[selectedSDG]}`}>
                      {SDG_ICONS[selectedSDG]} ODS {selectedSDG}: {SDG_NAMES[selectedSDG]}
                    </span>
                    <button
                      onClick={() => setSelectedSDG(null)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      ✕ Limpiar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Needs Tab */}
          {tab === 'needs' && (
            <div>
              <div className="flex justify-end mb-4">
                <Link
                  href="/mutual-aid/needs/new"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  + Publicar Necesidad
                </Link>
              </div>

              {needsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : needs && needs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {needs.map((need: any) => (
                    <Link
                      key={need.id}
                      href={`/mutual-aid/needs/${need.id}`}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          SCOPE_COLORS[need.scope as keyof typeof SCOPE_COLORS]
                        }`}>
                          {SCOPE_LABELS[need.scope as keyof typeof SCOPE_LABELS]}
                        </span>
                        {need.urgencyLevel >= 8 && (
                          <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-800 rounded">
                            Urgente
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {need.title}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {need.description}
                      </p>

                      <div className="space-y-2 text-sm text-gray-600">
                        {need.location && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span>{need.location}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <span>{need.contributorsCount || 0} contribuciones</span>
                        </div>

                        {need.targetEur && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progreso</span>
                              <span>{Math.round((need.currentEur / need.targetEur) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${Math.min((need.currentEur / need.targetEur) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay necesidades publicadas
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Sé el primero en publicar una necesidad
                  </p>
                  <Link
                    href="/mutual-aid/needs/new"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Publicar Necesidad
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Projects Tab */}
          {tab === 'projects' && (
            <div>
              <div className="flex justify-end mb-4">
                <Link
                  href="/mutual-aid/projects/new"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  + Crear Proyecto
                </Link>
              </div>

              {projectsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : filteredProjects && filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project: any) => (
                    <Link
                      key={project.id}
                      href={`/mutual-aid/projects/${project.id}`}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
                    >
                      {project.images && project.images.length > 0 && (
                        <img
                          src={project.images[0]}
                          alt={project.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-800 rounded">
                            {TYPE_LABELS[project.type] || project.type}
                          </span>
                          {project.isVerified && (
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>

                        {/* SDG Badges */}
                        {project.sdgGoals && project.sdgGoals.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {project.sdgGoals.slice(0, 4).map((sdg: number) => (
                              <span
                                key={sdg}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-white bg-gradient-to-r ${SDG_COLORS[sdg]}`}
                                title={SDG_NAMES[sdg]}
                              >
                                {SDG_ICONS[sdg]} ODS {sdg}
                              </span>
                            ))}
                            {project.sdgGoals.length > 4 && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700">
                                +{project.sdgGoals.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {project.title}
                        </h3>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {project.description}
                        </p>

                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span>{project.location}</span>
                          </div>

                          {project.beneficiaries && (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span>{project.beneficiaries} beneficiarios</span>
                            </div>
                          )}

                          {project.targetEur && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span>{project.currentEur}€ / {project.targetEur}€</span>
                                <span>{Math.round((project.currentEur / project.targetEur) * 100)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{ width: `${Math.min((project.currentEur / project.targetEur) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedSDG ? `No hay proyectos para ODS ${selectedSDG}` : 'No hay proyectos comunitarios'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {selectedSDG ? 'Intenta con otro objetivo de desarrollo sostenible' : 'Crea el primer proyecto comunitario'}
                  </p>
                  {selectedSDG ? (
                    <button
                      onClick={() => setSelectedSDG(null)}
                      className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                      Ver Todos los Proyectos
                    </button>
                  ) : (
                    <Link
                      href="/mutual-aid/projects/new"
                      className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Crear Proyecto
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SDG Information Box */}
          {tab === 'projects' && (
            <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900 dark:to-green-900 dark:bg-opacity-20 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <GlobeAltIcon className="h-6 w-6 text-blue-600" />
                Objetivos de Desarrollo Sostenible (ODS)
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
                Los proyectos de ayuda mutua están alineados con los 17 Objetivos de Desarrollo Sostenible de las Naciones Unidas,
                asegurando que nuestras acciones contribuyan a un futuro más sostenible y equitativo.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{SDG_ICONS[1]}</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      ODS 1: Fin de la Pobreza
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Proyectos que combaten la pobreza y garantizan recursos básicos
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{SDG_ICONS[3]}</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      ODS 3: Salud y Bienestar
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Iniciativas de salud comunitaria y bienestar
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{SDG_ICONS[11]}</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      ODS 11: Ciudades Sostenibles
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Desarrollo urbano sostenible y comunidades resilientes
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps = getI18nProps;
