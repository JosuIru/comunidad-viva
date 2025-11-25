import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { Package, CheckCircle, ArrowRight, ArrowLeft, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PackType {
  id: string;
  name: string;
  icon: string;
  description: string;
  features: string[];
  metrics: string[];
  examples: string[];
}

const PACK_TYPES: PackType[] = [
  {
    id: 'CONSUMER_GROUP',
    name: 'Grupo de Consumo',
    icon: '🥬',
    description:
      'Compra colectiva de productos locales y ecológicos directamente a productores',
    features: [
      'Sistema de pedidos colectivos',
      'Gestión de productores locales',
      'Cálculo automático de ahorros',
      'Coordinación de reparto',
      'Banco de tiempo para tareas',
    ],
    metrics: [
      'Ahorro mensual colectivo',
      'Kg de comida local consumida',
      'CO2 evitado',
      'Número de productores',
    ],
    examples: ['La Garbancita (Madrid)', 'La Osa (Bizkaia)', 'El Brot (Barcelona)'],
  },
  {
    id: 'HOUSING_COOP',
    name: 'Cooperativa de Vivienda',
    icon: '🏠',
    description:
      'Vivienda cooperativa en cesión de uso: propiedad colectiva, uso individual',
    features: [
      'Gestión de viviendas',
      'Reserva de espacios comunes',
      'Banco de herramientas',
      'Coordinación de tareas',
      'Asamblea digital',
    ],
    metrics: [
      'Ahorro vs mercado',
      'Espacios reservados',
      'Participación en tareas',
      'Herramientas compartidas',
    ],
    examples: [
      'La Borda (Barcelona)',
      'Entrepatios (Madrid)',
      'Trabensol (Madrid)',
    ],
  },
  {
    id: 'COMMUNITY_BAR',
    name: 'Bar Comunitario',
    icon: '☕',
    description:
      'Espacio social gestionado por la comunidad con productos locales y eventos',
    features: [
      'Calendario de eventos',
      'Gestión de turnos',
      'Proveedores locales',
      'Moneda social',
      'Sistema de socios',
    ],
    metrics: [
      'Eventos realizados',
      'Socios activos',
      'Proveedores locales',
      'Moneda social circulante',
    ],
    examples: [
      'La Villana de Vallekas (Madrid)',
      'El Campo de Cebada (Madrid)',
      'Traficantes de Sueños (Madrid)',
    ],
  },
];

export default function SetupPackPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [step, setStep] = useState<'select' | 'confirm' | 'complete'>('select');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (slug) {
      checkCommunityAccess();
    }
  }, [slug]);

  const checkCommunityAccess = async () => {
    try {
      const response = await fetch(`/api/communities/slug/${slug}`);
      if (!response.ok) throw new Error('Community not found');

      const community = await response.json();
      setCommunityId(community.id);

      // Check if user is admin
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Debes iniciar sesión');
        router.push('/auth/login');
        return;
      }

      const profileResponse = await fetch('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        const memberResponse = await fetch(
          `/api/communities/${community.id}/members/${profile.id}`
        );

        if (memberResponse.ok) {
          const member = await memberResponse.json();
          if (member.role === 'ADMIN' || member.role === 'MODERATOR') {
            setIsAdmin(true);
          } else {
            toast.error('Solo los administradores pueden configurar packs');
            router.push(`/communities/${slug}`);
          }
        }
      }
    } catch (error) {
      console.error('Error checking access:', error);
      toast.error('Error al verificar permisos');
      router.push(`/communities/${slug}`);
    }
  };

  const handleCreatePack = async () => {
    if (!selectedType || !communityId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/community-packs/communities/${communityId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ packType: selectedType }),
      });

      if (!response.ok) throw new Error('Failed to create pack');

      setStep('complete');
      toast.success('Pack configurado correctamente');
    } catch (error) {
      console.error('Error creating pack:', error);
      toast.error('Error al crear el pack');
    } finally {
      setLoading(false);
    }
  };

  const selectedPack = PACK_TYPES.find((p) => p.id === selectedType);

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin mx-auto text-gray-400" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Verificando permisos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Configurar Pack - {slug}</title>
      </Head>

      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 font-semibold mb-4">
                  <Package className="h-5 w-5" />
                  <span>Configuración de Pack</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {step === 'select' && 'Selecciona tu tipo de comunidad'}
                  {step === 'confirm' && 'Confirma tu selección'}
                  {step === 'complete' && '¡Pack configurado!'}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {step === 'select' &&
                    'Elige el pack que mejor se adapte a tu tipo de organización'}
                  {step === 'confirm' && 'Revisa la configuración antes de continuar'}
                  {step === 'complete' && 'Tu comunidad ya tiene acceso a todas las funciones'}
                </p>
              </div>

              {/* Step: Select Pack Type */}
              {step === 'select' && (
                <div className="space-y-4">
                  {PACK_TYPES.map((pack) => (
                    <button
                      key={pack.id}
                      onClick={() => setSelectedType(pack.id)}
                      className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
                        selectedType === pack.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-5xl">{pack.icon}</div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {pack.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {pack.description}
                          </p>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                                ✨ Funciones incluidas:
                              </h4>
                              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                {pack.features.map((feature, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                                📊 Métricas de impacto:
                              </h4>
                              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                {pack.metrics.map((metric, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-green-600 dark:text-green-400">•</span>
                                    <span>{metric}</span>
                                  </li>
                                ))}
                              </ul>

                              <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2 mt-4">
                                🌟 Ejemplos:
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {pack.examples.join(', ')}
                              </p>
                            </div>
                          </div>
                        </div>

                        {selectedType === pack.id && (
                          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}

                  <div className="flex justify-end mt-8">
                    <button
                      onClick={() => setStep('confirm')}
                      disabled={!selectedType}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Continuar
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step: Confirm */}
              {step === 'confirm' && selectedPack && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-6xl">{selectedPack.icon}</div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                          {selectedPack.name}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedPack.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          ✅ Qué obtienes:
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                          <li>✨ Funciones específicas activadas para tu tipo de comunidad</li>
                          <li>📊 Dashboard con métricas de impacto adaptadas</li>
                          <li>📚 Guías paso a paso para configurar tu comunidad</li>
                          <li>🤝 Conexión automática con comunidades similares</li>
                          <li>🎓 Posibilidad de solicitar mentoría de comunidades experimentadas</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          📝 Próximos pasos:
                        </h3>
                        <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside">
                          <li>Completa el wizard de configuración inicial</li>
                          <li>Invita a los miembros de tu comunidad</li>
                          <li>Configura las funciones específicas de tu pack</li>
                          <li>Empieza a registrar tu impacto y métricas</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setStep('select')}
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      Atrás
                    </button>
                    <button
                      onClick={handleCreatePack}
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold disabled:opacity-50 transition-colors"
                    >
                      {loading ? (
                        <>
                          <Loader className="h-5 w-5 animate-spin" />
                          Configurando...
                        </>
                      ) : (
                        <>
                          Confirmar y Activar
                          <CheckCircle className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step: Complete */}
              {step === 'complete' && selectedPack && (
                <div className="text-center">
                  <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-green-500 p-12">
                    <div className="text-6xl mb-6">{selectedPack.icon}</div>
                    <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      ¡Pack configurado correctamente!
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                      Tu comunidad ahora tiene acceso a todas las funciones de{' '}
                      <strong>{selectedPack.name}</strong>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => router.push(`/communities/${slug}/pack-dashboard`)}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
                      >
                        <Package className="h-5 w-5" />
                        Ir al Dashboard
                      </button>
                      <button
                        onClick={() => router.push(`/communities/${slug}`)}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-colors"
                      >
                        Volver a la comunidad
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

// Force SSR to avoid prerender errors with React Query
export const getServerSideProps = async () => {
  return { props: {} };
};
