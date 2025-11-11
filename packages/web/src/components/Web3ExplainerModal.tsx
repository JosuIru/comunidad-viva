import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface Web3ExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}

export default function Web3ExplainerModal({
  isOpen,
  onClose,
  onConnect,
}: Web3ExplainerModalProps) {
  const t = useTranslations('web3');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 m-4"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-2xl">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-lg">
                  🔐
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    ¿Qué es una Wallet Web3?
                  </h2>
                  <p className="text-blue-100 text-sm">
                    Tu cartera digital descentralizada
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Simple Explanation */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                  <span>💡</span>
                  <span>Explicación simple</span>
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Una wallet es como tu <strong>cartera digital</strong> que te permite:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span><strong>Conectarte sin contraseña</strong> - Autenticación segura y rápida</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span><strong>Ser dueño de tus tokens</strong> - Tú controlas tus activos digitales</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span><strong>Transacciones directas</strong> - Sin intermediarios bancarios</span>
                  </li>
                </ul>
              </div>

              {/* FAQ */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span>❓</span>
                  <span>Preguntas frecuentes</span>
                </h3>

                <details className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 cursor-pointer group">
                  <summary className="font-medium text-gray-900 dark:text-gray-100 flex items-center justify-between">
                    <span>¿Necesito comprar criptomonedas?</span>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">
                    <strong>No</strong>, puedes usar toda la plataforma Truk sin comprar criptomonedas.
                    La wallet es <strong>opcional</strong> y solo necesaria si quieres usar funciones blockchain específicas.
                  </p>
                </details>

                <details className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 cursor-pointer group">
                  <summary className="font-medium text-gray-900 dark:text-gray-100 flex items-center justify-between">
                    <span>¿Es seguro?</span>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">
                    <strong>Sí</strong>, tu wallet es controlada solo por ti.
                    Nosotros <strong>nunca</strong> tenemos acceso a tus claves privadas ni a tus fondos.
                    La seguridad depende de que mantengas tu clave secreta guardada.
                  </p>
                </details>

                <details className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 cursor-pointer group">
                  <summary className="font-medium text-gray-900 dark:text-gray-100 flex items-center justify-between">
                    <span>¿Qué wallets son compatibles?</span>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-sm">
                      <span className="text-orange-500">🦊</span>
                      <span><strong>MetaMask</strong> - Ethereum y compatibles</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-sm">
                      <span className="text-purple-500">👻</span>
                      <span><strong>Phantom</strong> - Solana y compatibles</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                      Más wallets próximamente: WalletConnect, Coinbase Wallet, Trust Wallet
                    </p>
                  </div>
                </details>

                <details className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 cursor-pointer group">
                  <summary className="font-medium text-gray-900 dark:text-gray-100 flex items-center justify-between">
                    <span>¿Qué pasa si rechazo la conexión?</span>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">
                    No pasa nada. Puedes seguir usando Truk con tu cuenta normal (email/contraseña).
                    Puedes conectar tu wallet en cualquier momento desde tu perfil.
                  </p>
                </details>
              </div>

              {/* Benefits */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-5">
                <h3 className="font-semibold text-green-900 dark:text-green-300 mb-3 flex items-center gap-2">
                  <span>✨</span>
                  <span>Beneficios exclusivos con Wallet</span>
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">🎁</span>
                    <span>Tokens de recompensa por participación</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">🗳️</span>
                    <span>Voto en decisiones de la comunidad</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">🌉</span>
                    <span>Puente entre tokens locales y blockchain</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">🔒</span>
                    <span>Mayor privacidad y control de tus datos</span>
                  </li>
                </ul>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <div className="flex gap-3">
                  <span className="text-yellow-600 dark:text-yellow-400 text-xl">⚠️</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">
                      Importante
                    </h4>
                    <p className="text-sm text-yellow-800 dark:text-yellow-400">
                      Nunca compartas tu clave privada o frase de recuperación con nadie, incluyendo el equipo de Truk.
                      Si alguien te pide esta información, es un fraude.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 p-6 rounded-b-2xl border-t border-gray-200 dark:border-gray-600 flex flex-col sm:flex-row gap-3">
              <button
                onClick={onConnect}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>🔐</span>
                <span>Conectar Wallet</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Explorar sin wallet
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
