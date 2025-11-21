import { useState } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalRewards: number;
  currentTier: string;
  nextTierAt: number;
}

interface Referral {
  id: string;
  referredUserId: string;
  referredUserName: string;
  status: 'PENDING' | 'ACTIVE' | 'REWARDED';
  rewardEarned: number;
  createdAt: string;
  activatedAt?: string;
}

interface ReferralTier {
  name: string;
  minReferrals: number;
  bonusMultiplier: number;
  perks: string[];
}

const tiers: ReferralTier[] = [
  {
    name: 'Iniciado',
    minReferrals: 0,
    bonusMultiplier: 1.0,
    perks: ['10 puntos por referido activo'],
  },
  {
    name: 'Conector',
    minReferrals: 5,
    bonusMultiplier: 1.2,
    perks: ['12 puntos por referido', 'Badge especial'],
  },
  {
    name: 'Embajador',
    minReferrals: 15,
    bonusMultiplier: 1.5,
    perks: ['15 puntos por referido', 'Acceso a eventos VIP', 'Badge oro'],
  },
  {
    name: 'Líder Comunitario',
    minReferrals: 50,
    bonusMultiplier: 2.0,
    perks: ['20 puntos por referido', 'Recompensas exclusivas', 'Reconocimiento público', 'Badge platino'],
  },
];

export default function ReferralsPage() {
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch referral stats
  const { data: stats } = useQuery<ReferralStats>({
    queryKey: ['referral-stats'],
    queryFn: async () => {
      const response = await api.get('/viral-features/referrals/stats');
      return response.data;
    },
  });

  // Fetch referral code
  const { data: referralData } = useQuery<{ code: string }>({
    queryKey: ['referral-code'],
    queryFn: async () => {
      const response = await api.get('/viral-features/referrals/my-code');
      return response.data;
    },
  });

  // Fetch referrals list
  const { data: referrals } = useQuery<Referral[]>({
    queryKey: ['referrals-list'],
    queryFn: async () => {
      const response = await api.get('/viral-features/referrals/my-referrals');
      return response.data.referrals || [];
    },
  });

  const copyToClipboard = async () => {
    if (!referralData?.code) return;

    const referralLink = `${window.location.origin}/signup?ref=${referralData.code}`;

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopySuccess(true);
      toast.success('¡Link copiado al portapapeles!');
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      toast.error('Error al copiar el link');
    }
  };

  const shareOnWhatsApp = () => {
    if (!referralData?.code) return;

    const referralLink = `${window.location.origin}/signup?ref=${referralData.code}`;
    const message = `¡Únete a Truk! Una plataforma revolucionaria para la economía colaborativa. Usa mi código de referido: ${referralLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  };

  const shareOnTelegram = () => {
    if (!referralData?.code) return;

    const referralLink = `${window.location.origin}/signup?ref=${referralData.code}`;
    const message = `¡Únete a Truk! Una plataforma revolucionaria para la economía colaborativa. Usa mi código de referido: ${referralLink}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`;

    window.open(telegramUrl, '_blank');
  };

  const getCurrentTier = () => {
    if (!stats) return tiers[0];
    return tiers.reverse().find((tier) => stats.totalReferrals >= tier.minReferrals) || tiers[0];
  };

  const getNextTier = () => {
    if (!stats) return tiers[1];
    const sortedTiers = [...tiers].sort((a, b) => a.minReferrals - b.minReferrals);
    return sortedTiers.find((tier) => tier.minReferrals > stats.totalReferrals) || null;
  };

  const getProgressToNextTier = () => {
    if (!stats) return 0;
    const nextTier = getNextTier();
    if (!nextTier) return 100;

    const currentTier = getCurrentTier();
    const progress = stats.totalReferrals - currentTier.minReferrals;
    const needed = nextTier.minReferrals - currentTier.minReferrals;

    return (progress / needed) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:text-yellow-400';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'REWARDED':
        return 'bg-blue-100 text-blue-800 dark:text-blue-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'ACTIVE':
        return 'Activo';
      case 'REWARDED':
        return 'Recompensado';
      default:
        return status;
    }
  };

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();

  return (
    <Layout title="Sistema de Referidos - Truk">
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 text-white">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-4">🌟 Sistema de Referidos</h1>
            <p className="text-xl opacity-90">
              Invita amigos y gana recompensas por hacer crecer la comunidad
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">{stats.totalReferrals}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Referidos</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stats.activeReferrals}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Activos</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">{stats.totalRewards}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Puntos Ganados</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                <div className="text-4xl font-bold text-orange-600">{currentTier.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Nivel Actual</div>
              </div>
            </div>
          )}

          {/* Referral Code Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
              Tu Código de Referido
            </h2>

            {referralData?.code && (
              <>
                <div className="bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 rounded-lg p-6 mb-6">
                  <div className="text-center mb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tu link de referido:</div>
                    <div className="text-2xl font-mono font-bold text-green-700 break-all">
                      {window.location.origin}/signup?ref={referralData.code}
                    </div>
                  </div>

                  <button
                    onClick={copyToClipboard}
                    className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors font-semibold"
                  >
                    {copySuccess ? '✓ Copiado!' : '📋 Copiar Link'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={shareOnWhatsApp}
                    className="py-3 px-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <span className="text-2xl">💬</span>
                    Compartir en WhatsApp
                  </button>
                  <button
                    onClick={shareOnTelegram}
                    className="py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <span className="text-2xl">✈️</span>
                    Compartir en Telegram
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Current Tier & Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Tu Nivel de Referidos</h2>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentTier.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Multiplicador: ×{currentTier.bonusMultiplier}
                  </p>
                </div>
                <div className="text-6xl">🏆</div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Beneficios actuales:</h4>
                <ul className="space-y-1">
                  {currentTier.perks.map((perk, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <span className="text-green-600 dark:text-green-400">✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {nextTier && stats && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-3">
                  🎯 Próximo Nivel: {nextTier.name}
                </h4>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Progreso</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {stats.totalReferrals} / {nextTier.minReferrals} referidos
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-green-500 to-blue-500 transition-all"
                      style={{ width: `${Math.min(getProgressToNextTier(), 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm text-purple-800 dark:text-purple-400">
                  Faltan {nextTier.minReferrals - stats.totalReferrals} referidos para alcanzar {nextTier.name}
                </div>
              </div>
            )}

            {!nextTier && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
                <div className="text-4xl mb-2">👑</div>
                <h4 className="font-bold text-yellow-900 dark:text-yellow-300 mb-2">¡Nivel Máximo Alcanzado!</h4>
                <p className="text-yellow-800 dark:text-yellow-400">Has llegado al nivel más alto del sistema de referidos</p>
              </div>
            )}
          </div>

          {/* All Tiers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Todos los Niveles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tiers.sort((a, b) => a.minReferrals - b.minReferrals).map((tier, index) => (
                <div
                  key={tier.name}
                  className={`rounded-lg p-6 border-2 ${
                    stats && stats.totalReferrals >= tier.minReferrals
                      ? 'bg-gradient-to-br from-green-50 to-blue-50 border-green-300'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">
                      {index === 0 ? '🌱' : index === 1 ? '🌿' : index === 2 ? '🌳' : '👑'}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{tier.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{tier.minReferrals}+ referidos</p>
                  </div>

                  <div className="mb-3">
                    <div className="text-center text-2xl font-bold text-green-600 dark:text-green-400">
                      ×{tier.bonusMultiplier}
                    </div>
                    <div className="text-center text-xs text-gray-600 dark:text-gray-400">Multiplicador</div>
                  </div>

                  <ul className="space-y-1">
                    {tier.perks.map((perk, perkIndex) => (
                      <li key={perkIndex} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1">
                        <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>

                  {stats && stats.totalReferrals >= tier.minReferrals && (
                    <div className="mt-4 text-center">
                      <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-semibold">
                        ✓ Desbloqueado
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Referrals List */}
          {referrals && referrals.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Tus Referidos</h2>
              <div className="space-y-4">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {referral.referredUserName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100">{referral.referredUserName}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Registrado: {new Date(referral.createdAt).toLocaleDateString()}
                        </p>
                        {referral.activatedAt && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Activado: {new Date(referral.activatedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(referral.status)}`}>
                        {getStatusText(referral.status)}
                      </span>
                      {referral.rewardEarned > 0 && (
                        <div className="text-sm text-green-600 dark:text-green-400 font-semibold mt-1">
                          +{referral.rewardEarned} puntos
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How it Works */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">¿Cómo funciona el Sistema de Referidos?</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">1️⃣</div>
                <h4 className="font-bold mb-2">Comparte</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Copia tu link de referido y compártelo con amigos
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">2️⃣</div>
                <h4 className="font-bold mb-2">Se Registran</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tus amigos usan tu link para crear su cuenta
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">3️⃣</div>
                <h4 className="font-bold mb-2">Se Activan</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cuando completan acciones, se vuelven referidos activos
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">4️⃣</div>
                <h4 className="font-bold mb-2">Ganas Puntos</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recibes puntos y subes de nivel con más referidos
                </p>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-3">💡 Tips para más referidos</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
                <li>• Comparte tu experiencia personal con Truk</li>
                <li>• Explica cómo la plataforma puede ayudar a tus amigos</li>
                <li>• Usa redes sociales y grupos de WhatsApp/Telegram</li>
                <li>• Entre más referidos activos, mayor tu multiplicador de recompensas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps = async (context: any) => getI18nProps(context);
