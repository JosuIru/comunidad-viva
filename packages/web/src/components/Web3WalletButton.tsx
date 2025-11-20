import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

// Lazy load modals - only loaded when user clicks button
const WalletModal = dynamic(() => import('./WalletModal'), {
  loading: () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  ),
  ssr: false,
});

const Web3ExplainerModal = dynamic(() => import('./Web3ExplainerModal'), {
  loading: () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh]">
        <div className="p-6 space-y-4 animate-pulse">
          <div className="h-16 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-t-2xl"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  ),
  ssr: false,
});

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
  }
}

interface Web3WalletButtonProps {
  mode: 'login' | 'link'; // login = auth flow, link = link to existing account
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export default function Web3WalletButton({ mode, onSuccess, onError }: Web3WalletButtonProps) {
  const router = useRouter();
  const t = useTranslations('web3Wallet');
  const tToasts = useTranslations('toasts');
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [hasPhantom, setHasPhantom] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);

  useEffect(() => {
    // Check for available wallets
    setHasMetaMask(typeof window !== 'undefined' && typeof window.ethereum !== 'undefined');
    setHasPhantom(typeof window !== 'undefined' && typeof window.solana !== 'undefined' && window.solana.isPhantom);
  }, []);

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      const error = t('errors.metamaskNotInstalled');
      onError?.(error);
      toast.error(error);
      return;
    }

    setIsConnecting(true);
    setIsModalOpen(false);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const walletAddress = accounts[0];

      // Request nonce from backend
      const nonceResponse = await api.post('/auth/web3/request-nonce', {
        walletAddress,
        walletType: 'METAMASK',
      });

      const { message } = nonceResponse.data;

      // Sign message with MetaMask
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });

      if (mode === 'login') {
        // Verify signature and login/register
        const authResponse = await api.post('/auth/web3/verify-signature', {
          walletAddress,
          signature,
          walletType: 'METAMASK',
        });

        const { access_token, user, isNewUser } = authResponse.data;

        // Store token
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user', JSON.stringify(user));

        onSuccess?.(authResponse.data);

        // Redirect to dashboard
        if (isNewUser) {
          toast.success(t('alerts.metaWelcome'));
          router.push('/profile/edit');
        } else {
          toast.success(t('alerts.metaLoginSuccess'));
          router.push('/');
        }
      } else {
        // Link wallet to existing account
        const linkResponse = await api.post('/auth/web3/link-wallet', {
          walletAddress,
          signature,
          walletType: 'METAMASK',
        });

        onSuccess?.(linkResponse.data);
        toast.success(t('alerts.linkSuccess'));
      }
    } catch (error: any) {
      console.error('MetaMask connection error:', error);
      const errorMessage = error.response?.data?.message || error.message || t('errors.metaConnect');
      onError?.(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const connectPhantom = async () => {
    if (!window.solana?.isPhantom) {
      const error = t('errors.phantomNotInstalled');
      onError?.(error);
      toast.error(error);
      return;
    }

    setIsConnecting(true);
    setIsModalOpen(false);

    try {
      // Connect to Phantom
      const resp = await window.solana.connect();
      const walletAddress = resp.publicKey.toString();

      // Request nonce from backend
      const nonceResponse = await api.post('/auth/web3/request-nonce', {
        walletAddress,
        walletType: 'PHANTOM',
      });

      const { message } = nonceResponse.data;

      // Sign message with Phantom
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8');
      const signature = Buffer.from(signedMessage.signature).toString('base64');

      if (mode === 'login') {
        // Verify signature and login/register
        const authResponse = await api.post('/auth/web3/verify-signature', {
          walletAddress,
          signature,
          walletType: 'PHANTOM',
        });

        const { access_token, user, isNewUser } = authResponse.data;

        // Store token
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user', JSON.stringify(user));

        onSuccess?.(authResponse.data);

        // Redirect to dashboard
        if (isNewUser) {
          toast.success(t('alerts.phantomWelcome'));
          router.push('/profile/edit');
        } else {
          toast.success(t('alerts.phantomLoginSuccess'));
          router.push('/');
        }
      } else {
        // Link wallet to existing account
        const linkResponse = await api.post('/auth/web3/link-wallet', {
          walletAddress,
          signature,
          walletType: 'PHANTOM',
        });

        onSuccess?.(linkResponse.data);
        toast.success(t('alerts.linkSuccess'));
      }
    } catch (error: any) {
      console.error('Phantom connection error:', error);
      const errorMessage = error.response?.data?.message || error.message || t('errors.phantomConnect');
      onError?.(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const walletOptions = [
    {
      name: 'MetaMask',
      icon: '🦊',
      description: 'La billetera más popular para Ethereum y EVM chains',
      isInstalled: hasMetaMask,
      installUrl: 'https://metamask.io/download/',
      onConnect: connectMetaMask,
    },
    {
      name: 'Phantom',
      icon: '👻',
      description: 'Billetera líder para Solana y multi-chain',
      isInstalled: hasPhantom,
      installUrl: 'https://phantom.app/',
      onConnect: connectPhantom,
    },
    {
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Conecta con 300+ billeteras móviles',
      isInstalled: false,
      installUrl: 'https://walletconnect.com/',
      onConnect: async () => {
        toast(tToasts('walletComingSoon', { wallet: 'WalletConnect' }), { icon: '🔗' });
      },
    },
    {
      name: 'Coinbase Wallet',
      icon: '🔵',
      description: 'Billetera oficial de Coinbase',
      isInstalled: false,
      installUrl: 'https://www.coinbase.com/wallet',
      onConnect: async () => {
        toast(tToasts('walletComingSoon', { wallet: 'Coinbase Wallet' }), { icon: '🔵' });
      },
    },
    {
      name: 'Trust Wallet',
      icon: '🛡️',
      description: 'Billetera multi-chain con DeFi integrado',
      isInstalled: false,
      installUrl: 'https://trustwallet.com/',
      onConnect: async () => {
        toast(tToasts('walletComingSoon', { wallet: 'Trust Wallet' }), { icon: '🛡️' });
      },
    },
  ];

  const handleExplainerConnect = () => {
    setIsExplainerOpen(false);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="w-full space-y-2">
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={isConnecting}
          aria-label={mode === 'login' ? 'Iniciar sesión con billetera Web3' : 'Vincular billetera Web3'}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>
            {isConnecting
              ? t('buttons.connecting')
              : mode === 'login'
                ? t('intro.login')
                : t('intro.link')
            }
          </span>
        </button>

        <button
          onClick={() => setIsExplainerOpen(true)}
          className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors flex items-center justify-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>¿Qué es una wallet Web3?</span>
        </button>
      </div>

      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        wallets={walletOptions}
        title={mode === 'login' ? 'Iniciar Sesión con Billetera' : 'Vincular Billetera'}
        subtitle={mode === 'login'
          ? 'Elige tu billetera Web3 para iniciar sesión o crear una cuenta'
          : 'Vincula tu billetera Web3 a tu cuenta existente'
        }
      />

      <Web3ExplainerModal
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
        onConnect={handleExplainerConnect}
      />
    </>
  );
}
