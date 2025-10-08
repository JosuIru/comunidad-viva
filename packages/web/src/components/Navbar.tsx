import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const router = useRouter();
  const t = useTranslations('nav');
  const tAuth = useTranslations('auth');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPlatformMenu, setShowPlatformMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, []);

  // Close mobile menu on route change
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-menu')) {
        setShowPlatformMenu(false);
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

            <Link href="/communities" className="text-gray-700 hover:text-blue-600">
              🏘️ Comunidades
            </Link>

            <Link href="/features" className="text-gray-700 hover:text-blue-600">
              ✨ Funcionalidades
            </Link>

            {isAuthenticated && (
              <div className="relative dropdown-menu">
                <button
                  onClick={() => setShowPlatformMenu(!showPlatformMenu)}
                  className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium"
                >
                  🚀 Plataforma
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
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl py-3 z-50 dropdown-menu">
                    {/* Gamification Section */}
                    <div className="px-4 py-2">
                      <div className="text-xs font-bold text-purple-600 mb-2">🎮 GAMIFICACIÓN</div>
                      <Link
                        href="/gamification/challenges"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded"
                        onClick={() => setShowPlatformMenu(false)}
                      >
                        🏆 Challenges & Leaderboard
                      </Link>
                      <Link
                        href="/gamification/swipe"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded"
                        onClick={() => setShowPlatformMenu(false)}
                      >
                        💝 Swipe & Match
                      </Link>
                      <Link
                        href="/gamification/flash-deals"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded"
                        onClick={() => setShowPlatformMenu(false)}
                      >
                        ⚡ Flash Deals
                      </Link>
                      <Link
                        href="/gamification/group-buys"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded"
                        onClick={() => setShowPlatformMenu(false)}
                      >
                        🛒 Compras Grupales
                      </Link>
                      <Link
                        href="/gamification/referrals"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 rounded"
                        onClick={() => setShowPlatformMenu(false)}
                      >
                        🌟 Referidos
                      </Link>
                    </div>

                    <div className="border-t border-gray-200 my-2"></div>

                    {/* Economy Section */}
                    <div className="px-4 py-2">
                      <div className="text-xs font-bold text-blue-600 mb-2">💰 ECONOMÍA</div>
                      <Link
                        href="/hybrid/dashboard"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded"
                        onClick={() => setShowPlatformMenu(false)}
                      >
                        🦎 Sistema Híbrido
                      </Link>
                      <Link
                        href="/hybrid/events"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded"
                        onClick={() => setShowPlatformMenu(false)}
                      >
                        🎉 Celebraciones
                      </Link>
                      <Link
                        href="/economy/dashboard"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded"
                        onClick={() => setShowPlatformMenu(false)}
                      >
                        📊 Dashboard Económico
                      </Link>
                    </div>

                    <div className="border-t border-gray-200 my-2"></div>

                    {/* Governance Section */}
                    <div className="px-4 py-2">
                      <div className="text-xs font-bold text-indigo-600 mb-2">🏛️ GOBERNANZA</div>
                      <Link
                        href="/governance/proposals"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded"
                        onClick={() => setShowPlatformMenu(false)}
                      >
                        📜 Propuestas
                      </Link>
                      <Link
                        href="/governance/delegation"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded"
                        onClick={() => setShowPlatformMenu(false)}
                      >
                        🗳️ Delegación de Votos
                      </Link>
                    </div>

                    <div className="border-t border-gray-200 my-2"></div>

                    {/* View All */}
                    <Link
                      href="/features"
                      className="block px-4 py-2 text-sm text-center text-blue-600 hover:bg-blue-50 font-semibold rounded"
                      onClick={() => setShowPlatformMenu(false)}
                    >
                      ✨ Ver todas las funcionalidades →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {isAuthenticated && (
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
            )}

            {!isAuthenticated && (
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
                href="/communities"
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                🏘️ Comunidades
              </Link>
              {isAuthenticated && (
                <>
                  <div className="border-t border-gray-200 pt-3 mt-2">
                    <div className="px-4 py-2 text-xs font-bold text-purple-600">
                      🎮 GAMIFICACIÓN
                    </div>
                    <Link
                      href="/gamification/challenges"
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-lg block"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      🏆 Challenges
                    </Link>
                    <Link
                      href="/gamification/swipe"
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-lg block"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      💝 Swipe & Match
                    </Link>
                    <Link
                      href="/gamification/flash-deals"
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 rounded-lg block"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      ⚡ Flash Deals
                    </Link>
                    <Link
                      href="/gamification/group-buys"
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg block"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      🛒 Compras Grupales
                    </Link>
                    <Link
                      href="/gamification/referrals"
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-green-50 rounded-lg block"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      🌟 Referidos
                    </Link>
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-2">
                    <div className="px-4 py-2 text-xs font-bold text-blue-600">
                      💰 ECONOMÍA
                    </div>
                    <Link
                      href="/hybrid/dashboard"
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-lg block"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      🦎 Sistema Híbrido
                    </Link>
                    <Link
                      href="/hybrid/events"
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 rounded-lg block"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      🎉 Celebraciones
                    </Link>
                    <Link
                      href="/economy/dashboard"
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg block"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      📊 Dashboard Económico
                    </Link>
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-2">
                    <div className="px-4 py-2 text-xs font-bold text-indigo-600">
                      🏛️ GOBERNANZA
                    </div>
                    <Link
                      href="/governance/proposals"
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 rounded-lg block"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      📜 Propuestas
                    </Link>
                    <Link
                      href="/governance/delegation"
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-lg block"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      🗳️ Delegación
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

              {/* Links para todos */}
              <div className="border-t border-gray-200 pt-3 mt-2">
                <Link
                  href="/features"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg block"
                  onClick={() => setShowMobileMenu(false)}
                >
                  ✨ Funcionalidades
                </Link>
                <Link
                  href="/docs"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg block"
                  onClick={() => setShowMobileMenu(false)}
                >
                  📚 {t('docs')}
                </Link>
              </div>

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
