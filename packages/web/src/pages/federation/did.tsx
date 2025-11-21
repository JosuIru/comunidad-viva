import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import {
  IdentificationIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface DIDInfo {
  did: string;
  document: {
    '@context': string[];
    id: string;
    verificationMethod: any[];
    authentication: string[];
    created: string;
  };
}

export default function DIDManagement() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUserId = localStorage.getItem('user_id');
    setIsAuthenticated(!!token);
    setUserId(storedUserId);
  }, []);

  // Fetch user's DID
  const { data: didInfo, isLoading } = useQuery<DIDInfo>({
    queryKey: ['user-did', userId],
    queryFn: async () => {
      const response = await api.get(`/federation/did/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });

  // Copy DID to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <IdentificationIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              Autenticación requerida
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Necesitas iniciar sesión para ver tu DID
            </p>
            <div className="mt-6">
              <a
                href="/auth/login"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                Iniciar Sesión
              </a>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <SparklesIcon className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Identidad Descentralizada
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Tu DID (Decentralized Identifier) es tu identidad única en la red federada Gailu Labs
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : didInfo ? (
          <>
            {/* DID Card */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg shadow-xl p-8 mb-8 text-white">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-purple-100 text-sm mb-2">Tu DID</p>
                  <h2 className="text-2xl font-bold font-mono break-all">
                    {didInfo.did}
                  </h2>
                </div>
                <button
                  onClick={() => copyToClipboard(didInfo.did)}
                  className="flex-shrink-0 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur p-3 rounded-lg transition-all"
                  title="Copiar DID"
                >
                  {copied ? (
                    <CheckCircleIcon className="h-6 w-6 text-green-300" />
                  ) : (
                    <ClipboardDocumentIcon className="h-6 w-6" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur">
                  <p className="text-purple-100 text-sm mb-1">Estado</p>
                  <p className="text-lg font-semibold">Activo</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur">
                  <p className="text-purple-100 text-sm mb-1">Creado</p>
                  <p className="text-lg font-semibold">
                    {new Date(didInfo.document.created).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </div>

            {/* DID Document */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Documento DID
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                El documento DID contiene tu información de verificación y métodos de autenticación
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-gray-800 dark:text-gray-200">
                  {JSON.stringify(didInfo.document, null, 2)}
                </pre>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  ¿Qué es un DID?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Un identificador descentralizado que te pertenece completamente,
                  sin depender de ninguna autoridad central.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Beneficios
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>✓ Control total de tu identidad</li>
                  <li>✓ Portabilidad entre nodos</li>
                  <li>✓ Verificación criptográfica</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Usos
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Transacciones SEMILLA</li>
                  <li>• Publicaciones federadas</li>
                  <li>• Círculos de conciencia</li>
                </ul>
              </div>
            </div>

            {/* Warning Box */}
            <div className="mt-8 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-200">
                    <strong>Importante:</strong> Guarda tu DID en un lugar seguro. Lo necesitarás
                    para interactuar con otros nodos de la federación.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No se pudo cargar tu DID. Por favor, intenta recargar la página.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
