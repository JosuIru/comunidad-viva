import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import LanguageSelector from './LanguageSelector';

/**
 * EJEMPLO: Este es el Navbar con soporte multilenguaje
 *
 * Para aplicarlo al Navbar real:
 * 1. Copia este archivo sobre Navbar.tsx cuando termines tus cambios actuales
 * 2. O copia las líneas específicas de traducción
 */

export default function Navbar() {
  const router = useRouter();
  const t = useTranslations('nav');
  const tAuth = useTranslations('auth');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showEconomyMenu, setShowEconomyMenu] = useState(false);
  const [showViralMenu, setShowViralMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setShowMobileMenu(false);
      setShowEconomyMenu(false);
      setShowViralMenu(false);
    };

    router.events?.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events?.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-menu')) {
        setShowEconomyMenu(false);
        setShowViralMenu(false);
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

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            {t('title')}
          </Link>

          {/* Hamburger Button - Mobile Only */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Menu"
          >
            <svg
              className="w-6 h-6 text-gray-700"
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
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              {t('home')}
            </Link>
            <Link href="/offers" className="text-gray-700 hover:text-blue-600">
              {t('offers')}
            </Link>
            <Link href="/events" className="text-gray-700 hover:text-blue-600">
              {t('events')}
            </Link>
            <Link href="/docs" className="text-gray-700 hover:text-blue-600">
              📚 {t('docs')}
            </Link>

            {isAuthenticated && (
              <>
                <div className="relative dropdown-menu">
                  <button
                    onClick={() => setShowViralMenu(!showViralMenu)}
                    className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
                  >
                    {t('discover')}
                    <svg
                      className={`w-4 h-4 transition-transform ${showViralMenu ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showViralMenu && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 dropdown-menu">
                      <Link
                        href="/swipe"
                        className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                        onClick={() => setShowViralMenu(false)}
                      >
                        💜 {t('swipeOffers')}
                      </Link>
                      <Link
                        href="/matches"
                        className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                        onClick={() => setShowViralMenu(false)}
                      >
                        🎯 {t('myMatches')}
                      </Link>
                      <Link
                        href="/stories"
                        className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                        onClick={() => setShowViralMenu(false)}
                      >
                        📖 {t('stories')}
                      </Link>
                      <div className="border-t border-gray-200 my-2"></div>
                      <Link
                        href="/flash-deals"
                        className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                        onClick={() => setShowViralMenu(false)}
                      >
                        🔥 {t('flashDeals')}
                      </Link>
                      <Link
                        href="/challenges"
                        className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                        onClick={() => setShowViralMenu(false)}
                      >
                        🏆 {t('weeklyChallenges')}
                      </Link>
                    </div>
                  )}
                </div>

                <div className="relative dropdown-menu">
                  <button
                    onClick={() => setShowEconomyMenu(!showEconomyMenu)}
                    className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
                  >
                    {t('economy')}
                    <svg
                      className={`w-4 h-4 transition-transform ${showEconomyMenu ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showEconomyMenu && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 dropdown-menu">
                      <Link
                        href="/economy/dashboard"
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => setShowEconomyMenu(false)}
                      >
                        📊 {t('economicDashboard')}
                      </Link>
                      <Link
                        href="/credits/send"
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => setShowEconomyMenu(false)}
                      >
                        💸 {t('sendCredits')}
                      </Link>
                      <Link
                        href="/economy/pools"
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => setShowEconomyMenu(false)}
                      >
                        🏦 {t('communityPools')}
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}

            {isAuthenticated ? (
              <>
                <Link href="/manage" className="text-gray-700 hover:text-blue-600">
                  {t('manage')}
                </Link>
                <Link href="/profile" className="text-gray-700 hover:text-blue-600">
                  {t('profile')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('register')}
                </Link>
              </>
            )}

            {/* Selector de idioma */}
            <LanguageSelector />
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                {t('home')}
              </Link>
              <Link
                href="/offers"
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                {t('offers')}
              </Link>
              <Link
                href="/events"
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                {t('events')}
              </Link>
              <Link
                href="/docs"
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                📚 {t('docs')}
              </Link>

              {isAuthenticated && (
                <>
                  <div className="border-t border-gray-200 pt-3 mt-2">
                    <div className="px-4 py-2 text-sm font-semibold text-gray-500">
                      {t('discover')}
                    </div>
                    <Link
                      href="/swipe"
                      className="px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg flex items-center gap-2"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      💜 {t('swipeOffers')}
                    </Link>
                    <Link
                      href="/matches"
                      className="px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg flex items-center gap-2"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      🎯 {t('myMatches')}
                    </Link>
                    <Link
                      href="/stories"
                      className="px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg flex items-center gap-2"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      📖 {t('stories')}
                    </Link>
                    <Link
                      href="/flash-deals"
                      className="px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-lg flex items-center gap-2"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      🔥 {t('flashDeals')}
                    </Link>
                    <Link
                      href="/challenges"
                      className="px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg flex items-center gap-2"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      🏆 {t('weeklyChallenges')}
                    </Link>
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-2">
                    <div className="px-4 py-2 text-sm font-semibold text-gray-500">
                      {t('economy')}
                    </div>
                    <Link
                      href="/economy/dashboard"
                      className="px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg flex items-center gap-2"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      📊 {t('economicDashboard')}
                    </Link>
                    <Link
                      href="/credits/send"
                      className="px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg flex items-center gap-2"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      💸 {t('sendCredits')}
                    </Link>
                    <Link
                      href="/economy/pools"
                      className="px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg flex items-center gap-2"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      🏦 {t('communityPools')}
                    </Link>
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-2">
                    <Link
                      href="/manage"
                      className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg block flex items-center gap-2"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      ⚙️ {t('manage')}
                    </Link>
                    <Link
                      href="/profile"
                      className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg block"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {t('profile')}
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowMobileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      {t('logout')}
                    </button>
                  </div>
                </>
              )}

              {!isAuthenticated && (
                <div className="border-t border-gray-200 pt-3 mt-2 space-y-2">
                  <Link
                    href="/auth/login"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {t('register')}
                  </Link>
                </div>
              )}

              {/* Selector de idioma en mobile */}
              <div className="border-t border-gray-200 pt-3 mt-2">
                <LanguageSelector />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
