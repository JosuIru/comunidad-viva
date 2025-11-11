import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface WalletOption {
  name: string;
  icon: string;
  description: string;
  isInstalled: boolean;
  installUrl: string;
  onConnect: () => Promise<void>;
}

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: WalletOption[];
  title?: string;
  subtitle?: string;
}

export default function WalletModal({
  isOpen,
  onClose,
  wallets,
  title = 'Conectar Billetera',
  subtitle = 'Elige tu billetera Web3 favorita para continuar',
}: WalletModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                  >
                    {title}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  {subtitle}
                </p>

                <div className="space-y-3">
                  {wallets.map((wallet) => (
                    <button
                      key={wallet.name}
                      onClick={wallet.isInstalled ? wallet.onConnect : undefined}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        wallet.isInstalled
                          ? 'border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg cursor-pointer'
                          : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="text-4xl">{wallet.icon}</div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 dark:text-gray-100">
                            {wallet.name}
                          </p>
                          {wallet.isInstalled && (
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                              Instalada
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {wallet.description}
                        </p>
                        {!wallet.isInstalled && (
                          <a
                            href={wallet.installUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
                          >
                            Instalar {wallet.name} →
                          </a>
                        )}
                      </div>
                      {wallet.isInstalled && (
                        <svg
                          className="w-6 h-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    🔒 Al conectar tu billetera, aceptas nuestros{' '}
                    <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                      términos de servicio
                    </a>{' '}
                    y{' '}
                    <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                      política de privacidad
                    </a>
                    .
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
