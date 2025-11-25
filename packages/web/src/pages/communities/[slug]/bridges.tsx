import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import BridgesVisualization from '@/components/community-packs/BridgesVisualization';
import { Network, Loader } from 'lucide-react';

export default function CommunityBridgesPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [communityName, setCommunityName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchCommunity();
    }
  }, [slug]);

  const fetchCommunity = async () => {
    try {
      const response = await fetch(`/api/communities/slug/${slug}`);
      if (!response.ok) throw new Error('Community not found');

      const data = await response.json();
      setCommunityId(data.id);
      setCommunityName(data.name);
    } catch (error) {
      console.error('Error fetching community:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin mx-auto text-gray-400" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!communityId) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">Comunidad no encontrada</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Red de Conexiones - {communityName}</title>
        <meta
          name="description"
          content={`Descubre las conexiones de ${communityName} con otras comunidades organizadas`}
        />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="max-w-4xl mx-auto text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 font-semibold mb-4">
                <Network className="h-5 w-5" />
                <span>Red de Conexiones</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {communityName}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Descubre cómo esta comunidad está conectada con otras organizaciones a través de
                diferentes tipos de puentes colaborativos.
              </p>
            </div>

            {/* Bridges Visualization */}
            <div className="max-w-6xl mx-auto">
              <BridgesVisualization communityId={communityId} communityName={communityName} />
            </div>

            {/* Info Section */}
            <div className="max-w-4xl mx-auto mt-12">
              <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border-2 border-green-200 dark:border-green-700 p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  ¿Por qué son importantes las conexiones?
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    Las conexiones entre comunidades organizadas crean un <strong>ecosistema
                    cooperativo distribuido</strong> donde cada nodo fortalece al resto.
                  </p>
                  <ul className="space-y-2 ml-6 list-disc">
                    <li>
                      <strong>Aprendizaje mutuo:</strong> Comunidades experimentadas pueden
                      mentorizar a las nuevas
                    </li>
                    <li>
                      <strong>Economías de escala:</strong> Compras conjuntas, proveedores
                      compartidos
                    </li>
                    <li>
                      <strong>Resiliencia:</strong> Red de apoyo mutuo ante crisis o necesidades
                    </li>
                    <li>
                      <strong>Visibilidad:</strong> Demostrar el impacto colectivo del movimiento
                    </li>
                  </ul>
                  <p className="pt-4 border-t border-green-200 dark:border-green-800">
                    <strong>Las conexiones se detectan automáticamente</strong> basándose en
                    proximidad geográfica, temática común, miembros compartidos, y otras señales de
                    colaboración real.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

