import { useState } from 'react';
import Layout from '@/components/Layout';
import Web3WalletButton from '@/components/Web3WalletButton';
import Link from 'next/link';
import { WalletIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function Web3LoginPage() {
  const [error, setError] = useState<string>('');

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center">
                <WalletIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Conecta con Web3
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Inicia sesión o regístrate usando tu billetera descentralizada
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <Web3WalletButton
              mode="login"
              onSuccess={(data) => {
                console.log('Web3 login successful:', data);
              }}
              onError={(error) => {
                setError(error);
              }}
            />

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="mt-8 grid grid-cols-1 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-start gap-3">
              <div className="bg-purple-100 dark:bg-purple-900 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <ShieldCheckIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  Seguro y Descentralizado
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Tu identidad está protegida por criptografía de blockchain
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-start gap-3">
              <div className="bg-green-100 dark:bg-green-900 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <SparklesIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  Sin Contraseñas
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Autenticación simple con firma digital de tu wallet
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <WalletIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  Integración con SEMILLA
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Accede automáticamente a la economía tokenizada de Gailu Labs
                </p>
              </div>
            </div>
          </div>

          {/* Alternative Auth */}
          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-br from-purple-50 via-orange-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-500 dark:text-gray-400">
                  ¿Prefieres el método tradicional?
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                href="/auth/login"
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Iniciar sesión con email
              </Link>
              <Link
                href="/auth/register"
                className="block w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Crear cuenta nueva
              </Link>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              💡 ¿Nuevo en Web3?
            </h3>
            <p className="text-xs text-gray-700 dark:text-gray-300 mb-3">
              Las billeteras Web3 como MetaMask y Phantom te permiten controlar tu identidad digital
              y participar en economías descentralizadas. Son gratuitas y fáciles de configurar.
            </p>
            <div className="flex gap-2">
              <a
                href="https://metamask.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Aprende sobre MetaMask →
              </a>
              <a
                href="https://phantom.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Aprende sobre Phantom →
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
