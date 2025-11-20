import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
  }
}
import {
  LockOpenIcon,
  LockClosedIcon,
  SparklesIcon,
  UserIcon,
  PencilSquareIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  CalendarDaysIcon,
  UsersIcon,
  HandRaisedIcon,
  BoltIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowsRightLeftIcon,
  RectangleStackIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import Avatar from './Avatar';
import Button from './Button';
import WalletModal from './WalletModal';
import IntentionOnboarding from './IntentionOnboarding';
import EconomicLayerBadge, { EconomicLayer } from './EconomicLayerBadge';
import InfoTooltip from './InfoTooltip';
import { api } from '@/lib/api';
import { logger } from '@/lib/logger';
import { useUserLevel } from '@/hooks/useUserLevel';

export default function Navbar() {
  const router = useRouter();
  const t = useTranslations('nav');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const tCredits = useTranslations('credits');
  const tToasts = useTranslations('toasts');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPlatformMenu, setShowPlatformMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userName, setUserName] = useState(() => t('userMenu.defaultName'));
  const [userId, setUserId] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showWalletConnectModal, setShowWalletConnectModal] = useState(false);
  const [economicLayer, setEconomicLayer] = useState<EconomicLayer>('TRADITIONAL');
  const [showIntentionOnboarding, setShowIntentionOnboarding] = useState(false);

  // User level for feature gating
  const { level: userLevel, getFeatureVisibility } = useUserLevel();
  const featureVisibility = getFeatureVisibility();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUserId = localStorage.getItem('user_id');
    setIsAuthenticated(!!token);
    setUserId(storedUserId);

    const userStr = localStorage.getItem('user');
    const defaultName = t('userMenu.defaultName');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user?.name || defaultName);
        // Check if user has wallet address
        if (user?.walletAddress) {
          setWalletAddress(user.walletAddress);
        }
        // Load economic layer
        if (user?.economicLayer) {
          setEconomicLayer(user.economicLayer as EconomicLayer);
        }
      } catch (e) {
        logger.error('Error parsing user data from localStorage', { error: e });
        setUserName(defaultName);
      }
    } else {
      setUserName(defaultName);
    }
  }, [t]);

  // Fetch user's credit balance
  const { data: balanceData } = useQuery({
    queryKey: ['credits', 'balance', userId],
    queryFn: async () => {
      const response = await api.get('/credits/balance');
      return response.data;
    },
    enabled: !!userId && isAuthenticated,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  useEffect(() => {
    const handleRouteChange = () => {
      setShowMobileMenu(false);
      setShowPlatformMenu(false);
    };

    router.events?.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events?.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-menu')) {
        setShowPlatformMenu(false);
      }
      if (!target.closest('.user-dropdown')) {
        setShowUserMenu(false);
      }
      if (!target.closest('.wallet-dropdown')) {
        setShowWalletMenu(false);
      }
      // Close economic layer dropdown when clicking outside
      if (!target.closest('.economic-layer-dropdown')) {
        // The component handles its own state, but we could add a ref here if needed
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    toast.success(tAuth('sessionClosed'));
    router.push('/');
  };

  const handleDisconnectWallet = async () => {
    try {
      await api.post('/auth/web3/disconnect-wallet');
      // Update local user data
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        delete user.walletAddress;
        delete user.walletType;
        localStorage.setItem('user', JSON.stringify(user));
        setWalletAddress(null);
        toast.success(tToasts('success.walletDisconnected'));
      }
    } catch (error: any) {
      logger.error('Error disconnecting wallet', { error, response: error.response?.data });
      toast.error(error.response?.data?.message || tToasts('error.disconnectWallet'));
    }
    setShowWalletMenu(false);
  };

  const handleConnectWallet = () => {
    setShowWalletConnectModal(true);
  };

  const connectMetaMask = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error(tToasts('error.metamaskNotInstalled'));
      return;
    }

    try {
      setShowWalletConnectModal(false);

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const walletAddressToLink = accounts[0];

      // Request nonce from backend
      const nonceResponse = await api.post('/auth/web3/request-nonce', {
        walletAddress: walletAddressToLink,
        walletType: 'METAMASK',
      });

      const { message } = nonceResponse.data;

      // Sign message with MetaMask
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddressToLink],
      });

      // Link wallet to existing account
      const linkResponse = await api.post('/auth/web3/link-wallet', {
        walletAddress: walletAddressToLink,
        signature,
        walletType: 'METAMASK',
      });

      // Update local user data
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.walletAddress = walletAddressToLink;
        user.walletType = 'METAMASK';
        localStorage.setItem('user', JSON.stringify(user));
        setWalletAddress(walletAddressToLink);
      }

      toast.success(tToasts('success.walletConnected'));
    } catch (error: any) {
      logger.error('MetaMask connection failed', {
        error,
        message: error.message,
        response: error.response?.data
      });
      toast.error(error.response?.data?.message || error.message || tToasts('error.connectWallet'));
    }
  };

  const connectPhantom = async () => {
    if (typeof window === 'undefined' || !window.solana?.isPhantom) {
      toast.error(tToasts('error.phantomNotInstalled'));
      return;
    }

    try {
      setShowWalletConnectModal(false);

      // Connect to Phantom
      const resp = await window.solana.connect();
      const walletAddressToLink = resp.publicKey.toString();

      // Request nonce from backend
      const nonceResponse = await api.post('/auth/web3/request-nonce', {
        walletAddress: walletAddressToLink,
        walletType: 'PHANTOM',
      });

      const { message } = nonceResponse.data;

      // Sign message with Phantom
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8');
      const signature = Buffer.from(signedMessage.signature).toString('base64');

      // Link wallet to existing account
      const linkResponse = await api.post('/auth/web3/link-wallet', {
        walletAddress: walletAddressToLink,
        signature,
        walletType: 'PHANTOM',
      });

      // Update local user data
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.walletAddress = walletAddressToLink;
        user.walletType = 'PHANTOM';
        localStorage.setItem('user', JSON.stringify(user));
        setWalletAddress(walletAddressToLink);
      }

      toast.success(tToasts('success.walletConnected'));
    } catch (error: any) {
      logger.error('Phantom wallet connection failed', {
        error,
        message: error.message,
        response: error.response?.data
      });
      toast.error(error.response?.data?.message || error.message || tToasts('error.connectWallet'));
    }
  };

  // Memoized helper to format wallet addresses
  const formatWalletAddress = useCallback((address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  // Memoized wallet options to prevent recreation on every render
  const walletOptions = useMemo(() => [
    {
      name: 'MetaMask',
      icon: '🦊',
      description: t('wallet.metamaskDesc'),
      isInstalled: typeof window !== 'undefined' && typeof window.ethereum !== 'undefined',
      installUrl: 'https://metamask.io/download/',
      onConnect: connectMetaMask,
    },
    {
      name: 'Phantom',
      icon: '👻',
      description: t('wallet.phantomDesc'),
      isInstalled: typeof window !== 'undefined' && typeof window.solana !== 'undefined' && window.solana.isPhantom,
      installUrl: 'https://phantom.app/',
      onConnect: connectPhantom,
    },
    {
      name: 'WalletConnect',
      icon: '🔗',
      description: t('wallet.walletConnectDesc'),
      isInstalled: false,
      installUrl: 'https://walletconnect.com/',
      onConnect: async () => {
        toast(tToasts('info.walletConnectComingSoon'), { icon: '🔗' });
      },
    },
  ], [connectMetaMask, connectPhantom, tToasts, t]);

  return (
    <>
      {/* Top Bar - Usuario, Theme, Idioma */}
      <div className="py-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-end h-10 gap-4">
            {/* Economic Layer Badge - Show for authenticated users */}
            {isAuthenticated && (
              <InfoTooltip content="Usa €, créditos o horas de tiempo" position="bottom">
                <EconomicLayerBadge layer={economicLayer} showDropdown={true} />
              </InfoTooltip>
            )}

            {/* Wallet Indicator */}
            {isAuthenticated && walletAddress && (
              <div className="relative wallet-dropdown">
                <button
                  onClick={() => setShowWalletMenu(!showWalletMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-sm text-xs font-medium"
                  title="Wallet Web3 conectada"
                >
                  <LockClosedIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{formatWalletAddress(walletAddress)}</span>
                  <svg
                    className={`w-3 h-3 transition-transform ${showWalletMenu ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showWalletMenu && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2 z-50 wallet-dropdown">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('wallet.connected')}</p>
                      <p className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                        {walletAddress}
                      </p>
                    </div>
                    <button
                      onClick={handleDisconnectWallet}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LockOpenIcon className="h-5 w-5" />
                      <span>{t('wallet.disconnect')}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Selector */}
            <LanguageSelector />

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative user-dropdown">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <Avatar name={userName} size="sm" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium hidden sm:block">{userName}</span>
                  <svg
                    className={`w-3 h-3 text-gray-600 dark:text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2 z-50 user-dropdown">
                    {/* Credit Balance Section - Always show */}
                    <div className="px-4 py-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <InfoTooltip content="Moneda local para intercambios. 1 crédito ≈ 1€" position="right">
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{tCredits('balance')}</p>
                          </InfoTooltip>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {balanceData?.balance ?? 0}
                          </p>
                        </div>
                        <div className="text-3xl">{balanceData?.level?.badge || <SparklesIcon className="h-8 w-8 text-green-500" />}</div>
                      </div>
                      {balanceData?.level && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">
                              {t('level')} {balanceData.level.level}
                            </span>
                            {balanceData.nextLevel && (
                              <span className="text-green-600 dark:text-green-400">
                                {Math.round(balanceData.progress)}%
                              </span>
                            )}
                          </div>
                          {balanceData.nextLevel && (
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div
                                className="bg-green-500 dark:bg-green-400 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${balanceData.progress}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <UserIcon className="h-5 w-5" />
                      <span>{t('userMenu.profile')}</span>
                    </Link>
                    <Link
                      href="/manage"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                      <span>{t('userMenu.manage')}</span>
                    </Link>

                    {/* Wallet Connection Option */}
                    {walletAddress ? (
                      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="mb-2">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('wallet.connected')}</p>
                          <p className="text-xs font-mono text-gray-900 dark:text-gray-100 break-all">
                            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            handleDisconnectWallet();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <LockOpenIcon className="h-4 w-4" />
                          <span>{t('wallet.disconnect')}</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          handleConnectWallet();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-t border-gray-200 dark:border-gray-700"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        <span>{t('wallet.connect')}</span>
                      </button>
                    )}

                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                    {/* Help: What can I do? */}
                    <button
                      onClick={() => {
                        setShowIntentionOnboarding(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <QuestionMarkCircleIcon className="h-5 w-5" />
                      <span>¿Qué puedo hacer?</span>
                    </button>

                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    {t('login')}
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm">
                    {t('register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <div className="relative w-40 h-14 transition-transform group-hover:scale-105">
                {/* Logo oscuro para light mode */}
                <Image
                  src="/logo.png"
                  alt="Truk"
                  fill
                  sizes="160px"
                  className="object-contain object-left dark:hidden"
                  priority
                />
                {/* Logo claro para dark mode */}
                <Image
                  src="/logo-light.png"
                  alt="Truk"
                  fill
                  sizes="160px"
                  className="object-contain object-left hidden dark:block"
                  priority
                />
              </div>
            </Link>

            {/* Hamburger Button - Mobile Only */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={tCommon('menu')}
            >
              <svg
                className="w-6 h-6 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              {/* Navegación Principal */}
              <Link href="/" className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition whitespace-nowrap">
                {t('home')}
              </Link>
              <Link href="/offers" className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition whitespace-nowrap">
                {t('offers')}
              </Link>
              <Link href="/events" className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition whitespace-nowrap">
                {t('events')}
              </Link>
              <Link href="/housing" className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition whitespace-nowrap">
                {t('platform.items.housing')}
              </Link>
              <Link href="/communities" className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition whitespace-nowrap">
                {t('communities')}
              </Link>

              {/* Economía Viva - TRUK's crown jewel */}
              <Link
                href="/hybrid/dashboard"
                className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 rounded-md transition whitespace-nowrap font-semibold shadow-sm"
                title={t('platform.livingEconomyTitle')}
              >
                💚 {t('platform.livingEconomy')}
              </Link>

              {/* Más - Dropdown con todo organizado */}
              <div className="relative dropdown-menu">
                <button
                  onClick={() => setShowPlatformMenu(!showPlatformMenu)}
                  className="flex items-center gap-1 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition font-medium"
                >
                  {t('more')}
                  <svg
                    className={`w-4 h-4 transition-transform ${showPlatformMenu ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showPlatformMenu && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2 dropdown-menu z-50">
                    {/* Popular Features - Filtered by user level */}
                    <div className="px-3 py-1">
                      {/* Level 2+ features */}
                      {featureVisibility.mutualAid && (
                        <Link
                          href="/mutual-aid"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition"
                          onClick={() => setShowPlatformMenu(false)}
                        >
                          <HandRaisedIcon className="h-5 w-5" />
                          {t('platform.items.mutualAid')}
                        </Link>
                      )}
                      {featureVisibility.timebank && (
                        <Link
                          href="/timebank"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400 rounded-md transition"
                          onClick={() => setShowPlatformMenu(false)}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {t('platform.items.timebank')}
                        </Link>
                      )}
                      {/* Level 3+ features */}
                      {featureVisibility.challenges && (
                        <Link
                          href="/gamification/challenges"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 rounded-md transition"
                          onClick={() => setShowPlatformMenu(false)}
                        >
                          <BoltIcon className="h-5 w-5" />
                          {t('platform.items.challenges')}
                        </Link>
                      )}
                      {featureVisibility.groupBuys && (
                        <Link
                          href="/gamification/group-buys"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 rounded-md transition"
                          onClick={() => setShowPlatformMenu(false)}
                        >
                          <ShoppingCartIcon className="h-5 w-5" />
                          {t('platform.items.groupBuys')}
                        </Link>
                      )}
                      {/* Level 5+ features */}
                      {featureVisibility.impact && (
                        <Link
                          href="/impacto"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 rounded-md transition"
                          onClick={() => setShowPlatformMenu(false)}
                        >
                          <ChartBarIcon className="h-5 w-5" />
                          {t('platform.items.impact')}
                        </Link>
                      )}
                      {featureVisibility.proposals && (
                        <Link
                          href="/governance/proposals"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 rounded-md transition"
                          onClick={() => setShowPlatformMenu(false)}
                        >
                          <DocumentTextIcon className="h-5 w-5" />
                          {t('platform.items.proposals')}
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                    {/* All Features Link */}
                    <div className="px-3 py-1">
                      <Link
                        href="/docs"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition"
                        onClick={() => setShowPlatformMenu(false)}
                      >
                        <BookOpenIcon className="h-5 w-5" />
                        {t('platform.items.allFeatures')}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu - Reorganizado */}
          {showMobileMenu && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
              <div className="flex flex-col space-y-1">
                {/* Main Navigation */}
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('platform.main')}
                </div>
                <Link
                  href="/"
                  className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <HomeIcon className="h-5 w-5" />
                  <span>{t('home')}</span>
                </Link>
                <Link
                  href="/offers"
                  className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span>{t('offers')}</span>
                </Link>
                <Link
                  href="/events"
                  className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <CalendarDaysIcon className="h-5 w-5" />
                  <span>{t('events')}</span>
                </Link>
                <Link
                  href="/housing"
                  className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>{t('platform.items.housing')}</span>
                </Link>
                <Link
                  href="/communities"
                  className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <UsersIcon className="h-5 w-5" />
                  <span>{t('communities')}</span>
                </Link>

                {/* Economía Viva - TRUK's crown jewel */}
                <Link
                  href="/hybrid/dashboard"
                  className="mx-3 my-2 px-3 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 rounded-lg transition-all flex items-center gap-2 font-semibold shadow-md"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>💚 {t('platform.livingEconomy')}</span>
                  <svg className="h-4 w-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>

                {/* Popular Features - Filtered by user level */}
                <div className="mt-4">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('platform.popularFeatures')}
                  </div>
                  {/* Level 2+ features */}
                  {featureVisibility.mutualAid && (
                    <Link
                      href="/mutual-aid"
                      className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <HandRaisedIcon className="h-5 w-5" />
                      <span>{t('platform.items.mutualAid')}</span>
                    </Link>
                  )}
                  {featureVisibility.timebank && (
                    <Link
                      href="/timebank"
                      className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{t('platform.items.timebank')}</span>
                    </Link>
                  )}
                  {/* Level 3+ features */}
                  {featureVisibility.challenges && (
                    <Link
                      href="/gamification/challenges"
                      className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <BoltIcon className="h-5 w-5" />
                      <span>{t('platform.items.challenges')}</span>
                    </Link>
                  )}
                  {featureVisibility.groupBuys && (
                    <Link
                      href="/gamification/group-buys"
                      className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <ShoppingCartIcon className="h-5 w-5" />
                      <span>{t('platform.items.groupBuys')}</span>
                    </Link>
                  )}
                  {/* Level 5+ features */}
                  {featureVisibility.impact && (
                    <Link
                      href="/impacto"
                      className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <ChartBarIcon className="h-5 w-5" />
                      <span>{t('platform.items.impact')}</span>
                    </Link>
                  )}
                  {featureVisibility.proposals && (
                    <Link
                      href="/governance/proposals"
                      className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <DocumentTextIcon className="h-5 w-5" />
                      <span>{t('platform.items.proposals')}</span>
                    </Link>
                  )}
                </div>

                {/* Documentation */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href="/docs"
                    className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <BookOpenIcon className="h-5 w-5" />
                    <span>{t('platform.items.allFeatures')}</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Wallet Connection Modal */}
      <WalletModal
        isOpen={showWalletConnectModal}
        onClose={() => setShowWalletConnectModal(false)}
        wallets={walletOptions}
        title={t('wallet.linkTitle')}
        subtitle={t('wallet.linkSubtitle')}
      />

      {/* Intention Onboarding Modal */}
      <IntentionOnboarding
        isOpen={showIntentionOnboarding}
        onClose={() => setShowIntentionOnboarding(false)}
        onIntentionSelected={(intention) => {
          logger.debug('User re-selected intention from navbar', { intention });
          setShowIntentionOnboarding(false);
        }}
      />
    </>
  );
}
