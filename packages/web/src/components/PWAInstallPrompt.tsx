import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalada
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(isStandaloneMode);

    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Verificar si ya se ha rechazado antes
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Solo mostrar si:
    // 1. No está instalada
    // 2. No se ha rechazado recientemente (últimos 7 días)
    // 3. Es iOS o el evento beforeinstallprompt está disponible
    if (!isStandaloneMode && daysSinceDismissed > 7) {
      if (iOS) {
        // En iOS, mostrar instrucciones después de unos segundos
        const timer = setTimeout(() => setShowPrompt(true), 5000);
        return () => clearTimeout(timer);
      }

      // Para Android/Desktop
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        // Mostrar prompt después de 3 segundos
        setTimeout(() => setShowPrompt(true), 3000);
      };

      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('[PWA] Usuario aceptó la instalación');
    } else {
      console.log('[PWA] Usuario rechazó la instalación');
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  // No mostrar si ya está instalada
  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          {/* Install prompt */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:max-w-md z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Header con gradiente */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">📱</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Instalar Truk</h3>
                    <p className="text-xs text-blue-100">Acceso rápido desde tu inicio</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {isIOS ? (
                  // Instrucciones para iOS
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Para instalar la app en tu iPhone:
                    </p>
                    <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold">1.</span>
                        <span>
                          Toca el botón <strong>Compartir</strong>
                          <svg className="inline w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
                          </svg>
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold">2.</span>
                        <span>Selecciona <strong>&quot;Añadir a inicio&quot;</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold">3.</span>
                        <span>Pulsa <strong>&quot;Añadir&quot;</strong></span>
                      </li>
                    </ol>
                  </div>
                ) : (
                  // Para Android/Desktop
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ¿Por qué instalar la app?
                    </p>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Acceso rápido desde tu pantalla de inicio</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Funciona sin conexión</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Notificaciones push</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Experiencia similar a una app nativa</span>
                      </li>
                    </ul>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-2 mt-4">
                  {!isIOS && deferredPrompt && (
                    <button
                      onClick={handleInstallClick}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Instalar ahora
                    </button>
                  )}
                  <button
                    onClick={handleDismiss}
                    className={`${
                      isIOS || !deferredPrompt ? 'flex-1' : 'flex-shrink-0'
                    } bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-4 rounded-lg transition-colors`}
                  >
                    {isIOS ? 'Entendido' : 'Ahora no'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
