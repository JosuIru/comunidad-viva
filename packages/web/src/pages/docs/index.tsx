import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { getI18nProps } from '@/lib/i18n';
import Layout from '@/components/Layout';

type TabType = 'about' | 'features' | 'hybrid' | 'gamification' | 'governance' | 'guide' | 'tech' | 'deployment' | 'contribute' | 'downloads';

export default function DocsPage() {
  const t = useTranslations('docs');
  const [activeTab, setActiveTab] = useState<TabType>('about');

  const tabs = [
    { id: 'about' as TabType, icon: '🏘️' },
    { id: 'features' as TabType, icon: '✨' },
    { id: 'hybrid' as TabType, icon: '🔄' },
    { id: 'gamification' as TabType, icon: '🎮' },
    { id: 'governance' as TabType, icon: '🏛️' },
    { id: 'downloads' as TabType, icon: '📥' },
    { id: 'guide' as TabType, icon: '📖' },
    { id: 'tech' as TabType, icon: '⚙️' },
    { id: 'deployment' as TabType, icon: '🚀' },
    { id: 'contribute' as TabType, icon: '🤝' },
  ];

  return (
    <Layout title={t('title')}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <h1 className="text-5xl font-bold mb-4">{t('header.title')}</h1>
            <p className="text-xl opacity-90 max-w-2xl">
              {t('header.subtitle')}
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {t(`tabs.${tab.id}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* About Section */}
            {activeTab === 'about' && (
              <div className="space-y-8">
                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-3">
                    <span className="text-4xl">🌱</span>
                    {t('about.whatIs.title')}
                  </h2>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    {t('about.whatIs.intro')}
                  </p>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {t('about.whatIs.description')}
                  </p>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
                    <span className="text-4xl">🎯</span>
                    {t('about.mission.title')}
                  </h2>
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="text-3xl">💚</div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {t('about.mission.strengthen.title')}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {t('about.mission.strengthen.description')}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="text-3xl">♻️</div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {t('about.mission.circular.title')}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {t('about.mission.circular.description')}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="text-3xl">⚖️</div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {t('about.mission.access.title')}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {t('about.mission.access.description')}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="text-3xl">🌍</div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {t('about.mission.sustainability.title')}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {t('about.mission.sustainability.description')}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-3">
                    <span className="text-4xl">💡</span>
                    {t('about.principles.title')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">{t('about.principles.reciprocity.title')}</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {t('about.principles.reciprocity.description')}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg border-2 border-green-200 dark:border-green-700">
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">{t('about.principles.trust.title')}</h4>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        {t('about.principles.trust.description')}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg border-2 border-purple-200 dark:border-purple-700">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">{t('about.principles.democracy.title')}</h4>
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        {t('about.principles.democracy.description')}
                      </p>
                    </div>
                    <div className="p-4 bg-pink-50 dark:bg-pink-900 rounded-lg border-2 border-pink-200 dark:border-pink-700">
                      <h4 className="font-semibold text-pink-900 dark:text-pink-100 mb-2">{t('about.principles.transparency.title')}</h4>
                      <p className="text-sm text-pink-800 dark:text-pink-200">
                        {t('about.principles.transparency.description')}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Features Section */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('features.offersAndServices.title')}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {t('features.offersAndServices.description')}
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 text-xl">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        <strong>{t('features.offersAndServices.timeBank.title')}</strong> {t('features.offersAndServices.timeBank.description')}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 text-xl">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        <strong>{t('features.offersAndServices.localMarket.title')}</strong> {t('features.offersAndServices.localMarket.description')}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 text-xl">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        <strong>{t('features.offersAndServices.loans.title')}</strong> {t('features.offersAndServices.loans.description')}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 text-xl">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        <strong>{t('features.offersAndServices.geolocation.title')}</strong> {t('features.offersAndServices.geolocation.description')}
                      </span>
                    </li>
                  </ul>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('features.creditsSystem.title')}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {t('features.creditsSystem.description')}
                  </p>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-700 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      {t('features.creditsSystem.howItWorks.title')}
                    </h3>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li>{t('features.creditsSystem.howItWorks.initialBalance')}</li>
                      <li>{t('features.creditsSystem.howItWorks.earnCredits')}</li>
                      <li>{t('features.creditsSystem.howItWorks.spendCredits')}</li>
                      <li>{t('features.creditsSystem.howItWorks.noRealMoney')}</li>
                    </ul>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('features.events.title')}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {t('features.events.description')}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border-2 border-green-200 dark:border-green-700 rounded-lg">
                      <div className="text-2xl mb-2">🎨</div>
                      <h4 className="font-semibold mb-1">{t('features.events.workshops.title')}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('features.events.workshops.description')}</p>
                    </div>
                    <div className="p-4 border-2 border-blue-200 dark:border-blue-700 rounded-lg">
                      <div className="text-2xl mb-2">🤝</div>
                      <h4 className="font-semibold mb-1">{t('features.events.social.title')}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('features.events.social.description')}</p>
                    </div>
                    <div className="p-4 border-2 border-purple-200 dark:border-purple-700 rounded-lg">
                      <div className="text-2xl mb-2">🌳</div>
                      <h4 className="font-semibold mb-1">{t('features.events.volunteering.title')}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('features.events.volunteering.description')}</p>
                    </div>
                    <div className="p-4 border-2 border-pink-200 dark:border-pink-700 rounded-lg">
                      <div className="text-2xl mb-2">🎉</div>
                      <h4 className="font-semibold mb-1">{t('features.events.parties.title')}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('features.events.parties.description')}</p>
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('features.socialFeatures.title')}
                  </h2>
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="text-3xl">💬</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{t('features.socialFeatures.messaging.title')}</h3>
                        <p className="text-gray-700 dark:text-gray-300">{t('features.socialFeatures.messaging.description')}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="text-3xl">❤️</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{t('features.socialFeatures.swipe.title')}</h3>
                        <p className="text-gray-700 dark:text-gray-300">{t('features.socialFeatures.swipe.description')}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="text-3xl">📖</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{t('features.socialFeatures.stories.title')}</h3>
                        <p className="text-gray-700 dark:text-gray-300">{t('features.socialFeatures.stories.description')}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="text-3xl">🎯</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{t('features.socialFeatures.matches.title')}</h3>
                        <p className="text-gray-700 dark:text-gray-300">{t('features.socialFeatures.matches.description')}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('features.groupBuying.title')}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {t('features.groupBuying.description')}
                  </p>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      {t('features.groupBuying.organize')}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      {t('features.groupBuying.access')}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      {t('features.groupBuying.support')}
                    </li>
                  </ul>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('features.governance.title')}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {t('features.governance.description')}
                  </p>
                  <div className="space-y-3">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                        {t('features.governance.proposals.title')}
                      </h4>
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        {t('features.governance.proposals.description')}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        {t('features.governance.voting.title')}
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {t('features.governance.voting.description')}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                        {t('features.governance.transparency.title')}
                      </h4>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        {t('features.governance.transparency.description')}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('features.reputation.title')}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {t('features.reputation.description')}
                  </p>
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border-2 border-yellow-200 dark:border-yellow-700">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      {t('features.reputation.earnPoints.title')}
                    </h4>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li>{t('features.reputation.earnPoints.completing')}</li>
                      <li>{t('features.reputation.earnPoints.participating')}</li>
                      <li>{t('features.reputation.earnPoints.receiving')}</li>
                      <li>{t('features.reputation.earnPoints.contributing')}</li>
                      <li>{t('features.reputation.earnPoints.referring')}</li>
                    </ul>
                  </div>
                </section>
              </div>
            )}

            {/* Hybrid Layer Section */}
            {activeTab === 'hybrid' && (
              <div className="space-y-6">
                <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-lg shadow-lg p-8">
                  <h2 className="text-4xl font-bold mb-4">
                    {t('hybrid.title')}
                  </h2>
                  <p className="text-xl opacity-90">
                    {t('hybrid.subtitle')}
                  </p>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('hybrid.whatIs.title')}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
                    {t('hybrid.whatIs.description')}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border-4 border-blue-200 dark:border-blue-700 rounded-lg p-6 bg-blue-50 dark:bg-blue-900">
                      <div className="text-4xl mb-3">🏦</div>
                      <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-3">{t('hybrid.traditional.title')}</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{t('hybrid.traditional.description')}</p>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>{t('hybrid.traditional.feature1')}</li>
                        <li>{t('hybrid.traditional.feature2')}</li>
                        <li>{t('hybrid.traditional.feature3')}</li>
                        <li>{t('hybrid.traditional.feature4')}</li>
                      </ul>
                    </div>

                    <div className="border-4 border-green-200 dark:border-green-700 rounded-lg p-6 bg-green-50 dark:bg-green-900">
                      <div className="text-4xl mb-3">🔄</div>
                      <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-3">{t('hybrid.transitional.title')}</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{t('hybrid.transitional.description')}</p>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>{t('hybrid.transitional.feature1')}</li>
                        <li>{t('hybrid.transitional.feature2')}</li>
                        <li>{t('hybrid.transitional.feature3')}</li>
                        <li>{t('hybrid.transitional.feature4')}</li>
                      </ul>
                    </div>

                    <div className="border-4 border-purple-200 dark:border-purple-700 rounded-lg p-6 bg-purple-50 dark:bg-purple-900">
                      <div className="text-4xl mb-3">🎁</div>
                      <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-3">{t('hybrid.giftPure.title')}</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{t('hybrid.giftPure.description')}</p>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>{t('hybrid.giftPure.feature1')}</li>
                        <li>{t('hybrid.giftPure.feature2')}</li>
                        <li>{t('hybrid.giftPure.feature3')}</li>
                        <li>{t('hybrid.giftPure.feature4')}</li>
                      </ul>
                    </div>

                    <div className="border-4 border-pink-200 dark:border-pink-700 rounded-lg p-6 bg-pink-50 dark:bg-pink-900">
                      <div className="text-4xl mb-3">🦎</div>
                      <h3 className="text-2xl font-bold text-pink-900 dark:text-pink-100 mb-3">{t('hybrid.chameleon.title')}</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{t('hybrid.chameleon.description')}</p>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>{t('hybrid.chameleon.feature1')}</li>
                        <li>{t('hybrid.chameleon.feature2')}</li>
                        <li>{t('hybrid.chameleon.feature3')}</li>
                        <li>{t('hybrid.chameleon.feature4')}</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('hybrid.mainFeatures.title')}
                  </h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                      <h4 className="font-semibold text-lg mb-2">{t('hybrid.mainFeatures.migration.title')}</h4>
                      <p className="text-gray-700 dark:text-gray-300">{t('hybrid.mainFeatures.migration.description')}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 dark:border-purple-700">
                      <h4 className="font-semibold text-lg mb-2">{t('hybrid.mainFeatures.bridge.title')}</h4>
                      <p className="text-gray-700 dark:text-gray-300">{t('hybrid.mainFeatures.bridge.description')}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 dark:border-green-700">
                      <h4 className="font-semibold text-lg mb-2">{t('hybrid.mainFeatures.threshold.title')}</h4>
                      <p className="text-gray-700 dark:text-gray-300">{t('hybrid.mainFeatures.threshold.description')}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200 dark:border-yellow-700">
                      <h4 className="font-semibold text-lg mb-2">{t('hybrid.mainFeatures.celebrations.title')}</h4>
                      <p className="text-gray-700 dark:text-gray-300">{t('hybrid.mainFeatures.celebrations.description')}</p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Gamification Section */}
            {activeTab === 'gamification' && (
              <div className="space-y-6">
                <section className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white rounded-lg shadow-lg p-8">
                  <h2 className="text-4xl font-bold mb-4">
                    {t('gamification.title')}
                  </h2>
                  <p className="text-xl opacity-90">
                    {t('gamification.subtitle')}
                  </p>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('gamification.features.title')}
                  </h2>

                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900 p-6 rounded-r-lg">
                      <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-3">{t('gamification.features.onboarding.title')}</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{t('gamification.features.onboarding.description')}</p>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>{t('gamification.features.onboarding.step1')}</li>
                        <li>{t('gamification.features.onboarding.step2')}</li>
                        <li>{t('gamification.features.onboarding.step3')}</li>
                        <li>{t('gamification.features.onboarding.step4')}</li>
                        <li>{t('gamification.features.onboarding.step5')}</li>
                        <li><strong>{t('gamification.features.onboarding.bonus')}</strong></li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900 p-6 rounded-r-lg">
                      <h3 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-3">{t('gamification.features.flashDeals.title')}</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{t('gamification.features.flashDeals.description')}</p>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>{t('gamification.features.flashDeals.feature1')}</li>
                        <li>{t('gamification.features.flashDeals.feature2')}</li>
                        <li>{t('gamification.features.flashDeals.feature3')}</li>
                        <li>{t('gamification.features.flashDeals.feature4')}</li>
                        <li>{t('gamification.features.flashDeals.feature5')}</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900 p-6 rounded-r-lg">
                      <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-3">{t('gamification.features.stories.title')}</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{t('gamification.features.stories.description')}</p>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>{t('gamification.features.stories.feature1')}</li>
                        <li>{t('gamification.features.stories.feature2')}</li>
                        <li>{t('gamification.features.stories.feature3')}</li>
                        <li>{t('gamification.features.stories.feature4')}</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-pink-500 bg-pink-50 dark:bg-pink-900 p-6 rounded-r-lg">
                      <h3 className="text-2xl font-bold text-pink-900 dark:text-pink-100 mb-3">{t('gamification.features.swipe.title')}</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{t('gamification.features.swipe.description')}</p>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>{t('gamification.features.swipe.feature1')}</li>
                        <li>{t('gamification.features.swipe.feature2')}</li>
                        <li>{t('gamification.features.swipe.feature3')}</li>
                        <li>{t('gamification.features.swipe.feature4')}</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-green-500 bg-green-50 dark:bg-green-900 p-6 rounded-r-lg">
                      <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-3">{t('gamification.features.challenges.title')}</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{t('gamification.features.challenges.description')}</p>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>{t('gamification.features.challenges.feature1')}</li>
                        <li>{t('gamification.features.challenges.feature2')}</li>
                        <li>{t('gamification.features.challenges.feature3')}</li>
                        <li>{t('gamification.features.challenges.feature4')}</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900 p-6 rounded-r-lg">
                      <h3 className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mb-3">{t('gamification.features.referrals.title')}</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{t('gamification.features.referrals.description')}</p>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>{t('gamification.features.referrals.feature1')}</li>
                        <li>{t('gamification.features.referrals.feature2')}</li>
                        <li>{t('gamification.features.referrals.feature3')}</li>
                        <li>{t('gamification.features.referrals.feature4')}</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-900 p-6 rounded-r-lg">
                      <h3 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-3">{t('gamification.features.levels.title')}</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{t('gamification.features.levels.description')}</p>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>{t('gamification.features.levels.feature1')}</li>
                        <li>{t('gamification.features.levels.feature2')}</li>
                        <li>{t('gamification.features.levels.feature3')}</li>
                        <li>{t('gamification.features.levels.feature4')}</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900 p-6 rounded-r-lg">
                      <h3 className="text-2xl font-bold text-orange-900 dark:text-orange-100 mb-3">{t('gamification.features.streaks.title')}</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{t('gamification.features.streaks.description')}</p>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>{t('gamification.features.streaks.feature1')}</li>
                        <li>{t('gamification.features.streaks.feature2')}</li>
                        <li>{t('gamification.features.streaks.feature3')}</li>
                        <li>{t('gamification.features.streaks.feature4')}</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-cyan-500 bg-cyan-50 dark:bg-cyan-900 p-6 rounded-r-lg">
                      <h3 className="text-2xl font-bold text-cyan-900 mb-3">{t('gamification.features.happyHour.title')}</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{t('gamification.features.happyHour.description')}</p>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>{t('gamification.features.happyHour.feature1')}</li>
                        <li>{t('gamification.features.happyHour.feature2')}</li>
                        <li>{t('gamification.features.happyHour.feature3')}</li>
                        <li>{t('gamification.features.happyHour.feature4')}</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900 p-6 rounded-r-lg">
                      <h3 className="text-2xl font-bold text-amber-900 mb-3">{t('gamification.features.achievements.title')}</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{t('gamification.features.achievements.description')}</p>
                      <div className="space-y-3">
                        <div>
                          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('gamification.features.achievements.categories.title')}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-gray-600 dark:text-gray-400">{t('gamification.features.achievements.categories.help')}</div>
                            <div className="text-gray-600 dark:text-gray-400">{t('gamification.features.achievements.categories.events')}</div>
                            <div className="text-gray-600 dark:text-gray-400">{t('gamification.features.achievements.categories.timebank')}</div>
                            <div className="text-gray-600 dark:text-gray-400">{t('gamification.features.achievements.categories.credits')}</div>
                            <div className="text-gray-600 dark:text-gray-400">{t('gamification.features.achievements.categories.community')}</div>
                            <div className="text-gray-600 dark:text-gray-400">{t('gamification.features.achievements.categories.governance')}</div>
                            <div className="text-gray-600 dark:text-gray-400">{t('gamification.features.achievements.categories.social')}</div>
                            <div className="text-gray-600 dark:text-gray-400">{t('gamification.features.achievements.categories.creativity')}</div>
                            <div className="text-gray-600 dark:text-gray-400">{t('gamification.features.achievements.categories.technical')}</div>
                            <div className="text-gray-600 dark:text-gray-400">{t('gamification.features.achievements.categories.environmental')}</div>
                            <div className="text-gray-600 dark:text-gray-400">{t('gamification.features.achievements.categories.education')}</div>
                            <div className="text-gray-600 dark:text-gray-400">{t('gamification.features.achievements.categories.generosity')}</div>
                            <div className="text-gray-600 dark:text-gray-400">{t('gamification.features.achievements.categories.secret')}</div>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('gamification.features.achievements.rarities.title')}</p>
                          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                            <li>{t('gamification.features.achievements.rarities.common')}</li>
                            <li>{t('gamification.features.achievements.rarities.uncommon')}</li>
                            <li>{t('gamification.features.achievements.rarities.rare')}</li>
                            <li>{t('gamification.features.achievements.rarities.epic')}</li>
                            <li>{t('gamification.features.achievements.rarities.legendary')}</li>
                            <li>{t('gamification.features.achievements.rarities.secret')}</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('gamification.features.achievements.features.title')}</p>
                          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                            <li>{t('gamification.features.achievements.features.autoCheck')}</li>
                            <li>{t('gamification.features.achievements.features.rewards')}</li>
                            <li>{t('gamification.features.achievements.features.notifications')}</li>
                            <li>{t('gamification.features.achievements.features.tracking')}</li>
                            <li>{t('gamification.features.achievements.features.gallery')}</li>
                            <li>{t('gamification.features.achievements.features.newIndicator')}</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border-l-4 border-rose-500 bg-rose-50 dark:bg-rose-900 p-6 rounded-r-lg">
                      <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-100 mb-3">{t('gamification.features.creditDecay.title')}</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{t('gamification.features.creditDecay.description')}</p>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>{t('gamification.features.creditDecay.decay')}</li>
                        <li>{t('gamification.features.creditDecay.expiration')}</li>
                        <li>{t('gamification.features.creditDecay.protection')}</li>
                        <li>{t('gamification.features.creditDecay.notifications.title')}
                          <ul className="ml-6 mt-2 space-y-1">
                            <li>{t('gamification.features.creditDecay.notifications.thirtyDays')}</li>
                            <li>{t('gamification.features.creditDecay.notifications.sevenDays')}</li>
                            <li>{t('gamification.features.creditDecay.notifications.expired')}</li>
                          </ul>
                        </li>
                        <li>{t('gamification.features.creditDecay.objective')}</li>
                        <li>{t('gamification.features.creditDecay.cronJob')}</li>
                        <li>{t('gamification.features.creditDecay.transparency')}</li>
                      </ul>
                      <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-rose-200 dark:border-rose-700">
                        <p className="text-sm font-semibold text-rose-900 dark:text-rose-100 mb-2">{t('gamification.features.creditDecay.why.title')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {t('gamification.features.creditDecay.why.description')}
                        </p>
                      </div>
                    </div>

                    <div className="border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-900 p-6 rounded-r-lg">
                      <h3 className="text-2xl font-bold text-emerald-900 mb-3">{t('gamification.features.notifications.title')}</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{t('gamification.features.notifications.description')}</p>
                      <div className="space-y-3">
                        <div>
                          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('gamification.features.notifications.websocket.title')}</p>
                          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                            <li>{t('gamification.features.notifications.websocket.badgeUnlocked')}</li>
                            <li>{t('gamification.features.notifications.websocket.creditsUpdate')}</li>
                            <li>{t('gamification.features.notifications.websocket.eventConfirmation')}</li>
                            <li>{t('gamification.features.notifications.websocket.messages')}</li>
                            <li>{t('gamification.features.notifications.websocket.timebank')}</li>
                            <li>{t('gamification.features.notifications.websocket.happyHour')}</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('gamification.features.notifications.email.title')}</p>
                          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                            <li>{t('gamification.features.notifications.email.badgeUnlocked')}</li>
                            <li>{t('gamification.features.notifications.email.levelUp')}</li>
                            <li>{t('gamification.features.notifications.email.creditDecay')}</li>
                            <li>{t('gamification.features.notifications.email.eventConfirmation')}</li>
                            <li>{t('gamification.features.notifications.email.timebank')}</li>
                            <li>{t('gamification.features.notifications.email.groupBuy')}</li>
                            <li>{t('gamification.features.notifications.email.governance')}</li>
                            <li>{t('gamification.features.notifications.email.community')}</li>
                          </ul>
                        </div>
                        <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-emerald-200">
                          <p className="text-sm font-semibold text-emerald-900 mb-1">{t('gamification.features.notifications.highlights.title')}</p>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>{t('gamification.features.notifications.highlights.templates')}</li>
                            <li>{t('gamification.features.notifications.highlights.colors')}</li>
                            <li>{t('gamification.features.notifications.highlights.ctas')}</li>
                            <li>{t('gamification.features.notifications.highlights.multilang')}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Governance Section */}
            {activeTab === 'governance' && (
              <div className="space-y-6">
                <section className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-8">
                  <h2 className="text-4xl font-bold mb-4">
                    {t('governance.title')}
                  </h2>
                  <p className="text-xl opacity-90">
                    {t('governance.subtitle')}
                  </p>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('governance.whatIs.title')}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
                    {t('governance.whatIs.description')}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-6">
                      <div className="text-4xl mb-3">⛏️</div>
                      <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-3">{t('governance.whatIs.mining.title')}</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {t('governance.whatIs.mining.description')}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg p-6">
                      <div className="text-4xl mb-3">⛓️</div>
                      <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-3">{t('governance.whatIs.trustChain.title')}</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {t('governance.whatIs.trustChain.description')}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-6">
                      <div className="text-4xl mb-3">🏆</div>
                      <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-3">{t('governance.whatIs.reputation.title')}</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {t('governance.whatIs.reputation.description')}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('governance.reputationSystem.title')}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {t('governance.reputationSystem.description')}
                  </p>

                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 rounded-r-lg">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-3xl">⭐</div>
                        <h3 className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{t('governance.reputationSystem.level1.title')}</h3>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>{t('governance.reputationSystem.level1.privileges')}</strong></p>
                      <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                        <li>{t('governance.reputationSystem.level1.privilege1')}</li>
                        <li>{t('governance.reputationSystem.level1.privilege2')}</li>
                        <li>{t('governance.reputationSystem.level1.privilege3')}</li>
                      </ul>
                    </div>

                    <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-l-4 border-blue-500 rounded-r-lg">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-3xl">🌟</div>
                        <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">{t('governance.reputationSystem.level2.title')}</h3>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>{t('governance.reputationSystem.level2.privileges')}</strong></p>
                      <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                        <li>{t('governance.reputationSystem.level2.privilege1')}</li>
                        <li>{t('governance.reputationSystem.level2.privilege2')}</li>
                        <li>{t('governance.reputationSystem.level2.privilege3')}</li>
                        <li>{t('governance.reputationSystem.level2.privilege4')}</li>
                      </ul>
                    </div>

                    <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-500 rounded-r-lg">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-3xl">💎</div>
                        <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100">{t('governance.reputationSystem.level3.title')}</h3>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>{t('governance.reputationSystem.level3.privileges')}</strong></p>
                      <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                        <li>{t('governance.reputationSystem.level3.privilege1')}</li>
                        <li>{t('governance.reputationSystem.level3.privilege2')}</li>
                        <li>{t('governance.reputationSystem.level3.privilege3')}</li>
                        <li>{t('governance.reputationSystem.level3.privilege4')}</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('governance.proposals.title')}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {t('governance.proposals.description')}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900 border-2 border-blue-200 dark:border-blue-700 rounded-lg text-center">
                      <div className="text-3xl mb-2">📝</div>
                      <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-1">{t('governance.proposals.step1.title')}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('governance.proposals.step1.description')}</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900 border-2 border-green-200 dark:border-green-700 rounded-lg text-center">
                      <div className="text-3xl mb-2">💬</div>
                      <h4 className="font-bold text-green-900 dark:text-green-100 mb-1">{t('governance.proposals.step2.title')}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('governance.proposals.step2.description')}</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900 border-2 border-purple-200 dark:border-purple-700 rounded-lg text-center">
                      <div className="text-3xl mb-2">🗳️</div>
                      <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-1">{t('governance.proposals.step3.title')}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('governance.proposals.step3.description')}</p>
                    </div>
                    <div className="p-4 bg-pink-50 dark:bg-pink-900 border-2 border-pink-200 dark:border-pink-700 rounded-lg text-center">
                      <div className="text-3xl mb-2">✅</div>
                      <h4 className="font-bold text-pink-900 dark:text-pink-100 mb-1">{t('governance.proposals.step4.title')}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('governance.proposals.step4.description')}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border-2 border-indigo-200 dark:border-indigo-700">
                    <h4 className="font-semibold text-lg mb-3">{t('governance.proposals.quadraticVoting.title')}</h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{t('governance.proposals.quadraticVoting.description')}</p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="font-bold text-indigo-900 dark:text-indigo-100">{t('governance.proposals.quadraticVoting.point1')}</div>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="font-bold text-indigo-900 dark:text-indigo-100">{t('governance.proposals.quadraticVoting.point5')}</div>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="font-bold text-indigo-900 dark:text-indigo-100">{t('governance.proposals.quadraticVoting.point10')}</div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('governance.moderation.title')}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {t('governance.moderation.description')}
                  </p>

                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-red-50 dark:bg-red-9000 text-white rounded-full flex items-center justify-center font-bold text-xl">
                        1
                      </div>
                      <div className="flex-1 pt-2">
                        <h4 className="font-semibold text-lg mb-2">{t('governance.moderation.step1.title')}</h4>
                        <p className="text-gray-700 dark:text-gray-300">{t('governance.moderation.step1.description')}</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-orange-50 dark:bg-orange-9000 text-white rounded-full flex items-center justify-center font-bold text-xl">
                        2
                      </div>
                      <div className="flex-1 pt-2">
                        <h4 className="font-semibold text-lg mb-2">{t('governance.moderation.step2.title')}</h4>
                        <p className="text-gray-700 dark:text-gray-300">{t('governance.moderation.step2.description')}</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-yellow-50 dark:bg-yellow-9000 text-white rounded-full flex items-center justify-center font-bold text-xl">
                        3
                      </div>
                      <div className="flex-1 pt-2">
                        <h4 className="font-semibold text-lg mb-2">{t('governance.moderation.step3.title')}</h4>
                        <p className="text-gray-700 dark:text-gray-300">{t('governance.moderation.step3.description')}</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-50 dark:bg-green-9000 text-white rounded-full flex items-center justify-center font-bold text-xl">
                        4
                      </div>
                      <div className="flex-1 pt-2">
                        <h4 className="font-semibold text-lg mb-2">{t('governance.moderation.step4.title')}</h4>
                        <p className="text-gray-700 dark:text-gray-300">{t('governance.moderation.step4.description')}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-8">
                  <h2 className="text-3xl font-bold mb-4">
                    {t('governance.benefits.title')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">✓</div>
                      <div>
                        <h4 className="font-semibold mb-1">{t('governance.benefits.noSinglePoint.title')}</h4>
                        <p className="text-sm opacity-90">{t('governance.benefits.noSinglePoint.description')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">✓</div>
                      <div>
                        <h4 className="font-semibold mb-1">{t('governance.benefits.resistant.title')}</h4>
                        <p className="text-sm opacity-90">{t('governance.benefits.resistant.description')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">✓</div>
                      <div>
                        <h4 className="font-semibold mb-1">{t('governance.benefits.incentives.title')}</h4>
                        <p className="text-sm opacity-90">{t('governance.benefits.incentives.description')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">✓</div>
                      <div>
                        <h4 className="font-semibold mb-1">{t('governance.benefits.transparency.title')}</h4>
                        <p className="text-sm opacity-90">{t('governance.benefits.transparency.description')}</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Guide Section */}
            {activeTab === 'guide' && (
              <div className="space-y-6">
                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('guide.gettingStarted.title')}
                  </h2>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        1
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{t('guide.gettingStarted.step1.title')}</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {t('guide.gettingStarted.step1.description')}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        2
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{t('guide.gettingStarted.step2.title')}</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {t('guide.gettingStarted.step2.description')}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        3
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{t('guide.gettingStarted.step3.title')}</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {t('guide.gettingStarted.step3.description')}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        4
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{t('guide.gettingStarted.step4.title')}</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {t('guide.gettingStarted.step4.description')}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        5
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{t('guide.gettingStarted.step5.title')}</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {t('guide.gettingStarted.step5.description')}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('guide.createOffer.title')}
                  </h2>
                  <ol className="space-y-4 text-gray-700 dark:text-gray-300">
                    <li className="flex gap-3">
                      <span className="font-semibold text-blue-600">1.</span>
                      <span>{t('guide.createOffer.step1')}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-blue-600">2.</span>
                      <span>{t('guide.createOffer.step2')}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-blue-600">3.</span>
                      <span>{t('guide.createOffer.step3')}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-blue-600">4.</span>
                      <span>{t('guide.createOffer.step4')}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-blue-600">5.</span>
                      <span>{t('guide.createOffer.step5')}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-blue-600">6.</span>
                      <span>{t('guide.createOffer.step6')}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-blue-600">7.</span>
                      <span>{t('guide.createOffer.step7')}</span>
                    </li>
                  </ol>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('guide.organizeEvent.title')}
                  </h2>
                  <ol className="space-y-4 text-gray-700 dark:text-gray-300">
                    <li className="flex gap-3">
                      <span className="font-semibold text-purple-600">1.</span>
                      <span>{t('guide.organizeEvent.step1')}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-purple-600">2.</span>
                      <span>{t('guide.organizeEvent.step2')}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-purple-600">3.</span>
                      <span>{t('guide.organizeEvent.step3')}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-purple-600">4.</span>
                      <span>{t('guide.organizeEvent.step4')}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-purple-600">5.</span>
                      <span>{t('guide.organizeEvent.step5')}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-purple-600">6.</span>
                      <span>{t('guide.organizeEvent.step6')}</span>
                    </li>
                  </ol>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('guide.tips.title')}
                  </h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">{t('guide.tips.clear.title')}</h4>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        {t('guide.tips.clear.description')}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border-l-4 border-blue-500">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">{t('guide.tips.respond.title')}</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {t('guide.tips.respond.description')}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg border-l-4 border-purple-500">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">{t('guide.tips.fulfill.title')}</h4>
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        {t('guide.tips.fulfill.description')}
                      </p>
                    </div>
                    <div className="p-4 bg-pink-50 dark:bg-pink-900 rounded-lg border-l-4 border-pink-500">
                      <h4 className="font-semibold text-pink-900 dark:text-pink-100 mb-2">{t('guide.tips.rate.title')}</h4>
                      <p className="text-sm text-pink-800 dark:text-pink-200">
                        {t('guide.tips.rate.description')}
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg border-l-4 border-yellow-500">
                      <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">{t('guide.tips.participate.title')}</h4>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        {t('guide.tips.participate.description')}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-2 border-orange-300 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    {t('guide.safety.title')}
                  </h2>
                  <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                    <li className="flex gap-2">
                      <span className="text-red-600">•</span>
                      <span>{t('guide.safety.noPersonalInfo')}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-600">•</span>
                      <span>{t('guide.safety.publicPlaces')}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-600">•</span>
                      <span>{t('guide.safety.report')}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-600">•</span>
                      <span>{t('guide.safety.checkReputation')}</span>
                    </li>
                  </ul>
                </section>
              </div>
            )}

            {/* Tech Section */}
            {activeTab === 'tech' && (
              <div className="space-y-6">
                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('tech.architecture.title')}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {t('tech.architecture.description')}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border-2 border-blue-200 dark:border-blue-700 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-3">{t('tech.architecture.frontend.title')}</h3>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-center gap-2">
                          <span className="text-blue-600">▸</span>
                          <span>{t('tech.architecture.frontend.nextjs')}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-blue-600">▸</span>
                          <span>{t('tech.architecture.frontend.typescript')}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-blue-600">▸</span>
                          <span>{t('tech.architecture.frontend.tailwind')}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-blue-600">▸</span>
                          <span>{t('tech.architecture.frontend.reactQuery')}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-blue-600">▸</span>
                          <span>{t('tech.architecture.frontend.leaflet')}</span>
                        </li>
                      </ul>
                    </div>

                    <div className="border-2 border-purple-200 dark:border-purple-700 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-3">{t('tech.architecture.backend.title')}</h3>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-center gap-2">
                          <span className="text-purple-600">▸</span>
                          <span>{t('tech.architecture.backend.nestjs')}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-purple-600">▸</span>
                          <span>{t('tech.architecture.backend.prisma')}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-purple-600">▸</span>
                          <span>{t('tech.architecture.backend.postgresql')}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-purple-600">▸</span>
                          <span>{t('tech.architecture.backend.redis')}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-purple-600">▸</span>
                          <span>{t('tech.architecture.backend.jwt')}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('tech.security.title')}
                  </h2>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="text-3xl">🔐</div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t('tech.security.encryption.title')}</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {t('tech.security.encryption.description')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-3xl">🛡️</div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t('tech.security.protection.title')}</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {t('tech.security.protection.description')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-3xl">⚡</div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t('tech.security.rateLimiting.title')}</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {t('tech.security.rateLimiting.description')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-3xl">👁️</div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t('tech.security.accessControl.title')}</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {t('tech.security.accessControl.description')}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('tech.docker.title')}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {t('tech.docker.description')}
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-6 rounded-lg font-mono text-sm overflow-x-auto">
                    <div className="mb-2 text-green-400">{t('tech.docker.servicesTitle')}</div>
                    <div>{t('tech.docker.backendApi')}</div>
                    <div>{t('tech.docker.frontendWeb')}</div>
                    <div>{t('tech.docker.postgresql')}</div>
                    <div>{t('tech.docker.redis')}</div>
                    <div>{t('tech.docker.nginx')}</div>
                    <div className="mt-4 text-green-400">{t('tech.docker.monitoringTitle')}</div>
                    <div>{t('tech.docker.prometheus')}</div>
                    <div>{t('tech.docker.grafana')}</div>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('tech.monitoring.title')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">{t('tech.monitoring.monitoring.title')}</h3>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li>{t('tech.monitoring.monitoring.prometheus')}</li>
                        <li>{t('tech.monitoring.monitoring.grafana')}</li>
                        <li>{t('tech.monitoring.monitoring.alerts')}</li>
                        <li>{t('tech.monitoring.monitoring.logs')}</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">{t('tech.monitoring.backups.title')}</h3>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li>{t('tech.monitoring.backups.automatic')}</li>
                        <li>{t('tech.monitoring.backups.retention')}</li>
                        <li>{t('tech.monitoring.backups.restore')}</li>
                        <li>{t('tech.monitoring.backups.encrypted')}</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('tech.advanced.title')}
                  </h2>
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900 rounded-lg">
                      <h4 className="font-semibold mb-1">{t('tech.advanced.ssr.title')}</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{t('tech.advanced.ssr.description')}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                      <h4 className="font-semibold mb-1">{t('tech.advanced.imageOptimization.title')}</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{t('tech.advanced.imageOptimization.description')}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                      <h4 className="font-semibold mb-1">{t('tech.advanced.geolocation.title')}</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{t('tech.advanced.geolocation.description')}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
                      <h4 className="font-semibold mb-1">{t('tech.advanced.realtime.title')}</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{t('tech.advanced.realtime.description')}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
                      <h4 className="font-semibold mb-1">{t('tech.advanced.messaging.title')}</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{t('tech.advanced.messaging.description')}</p>
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('tech.api.title')}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {t('tech.api.description')}
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                      {t('tech.api.access')}
                    </h4>
                    <code className="block bg-white dark:bg-gray-800 p-3 rounded border border-blue-300 text-sm">
                      {t('tech.api.url')}
                    </code>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mt-3">
                      {t('tech.api.explore')}
                    </p>
                  </div>
                </section>
              </div>
            )}

            {/* Deployment Section */}
            {activeTab === 'deployment' && (
              <div className="space-y-6">
                <section className="bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 text-white rounded-lg shadow-lg p-8">
                  <h2 className="text-4xl font-bold mb-4">
                    {t('deployment.title')}
                  </h2>
                  <p className="text-xl opacity-90">
                    {t('deployment.subtitle')}
                  </p>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('deployment.prerequisites.title')}
                  </h2>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <div className="flex gap-3 items-start">
                      <span className="text-green-600 text-xl">✓</span>
                      <span>{t('deployment.prerequisites.docker')}</span>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="text-green-600 text-xl">✓</span>
                      <span>{t('deployment.prerequisites.domain')}</span>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="text-green-600 text-xl">✓</span>
                      <span>{t('deployment.prerequisites.ports')}</span>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="text-green-600 text-xl">✓</span>
                      <span>{t('deployment.prerequisites.ram')}</span>
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('deployment.automatic.title')}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {t('deployment.automatic.description')}
                  </p>

                  <div className="bg-gray-900 text-gray-100 p-6 rounded-lg font-mono text-sm mb-4">
                    <div className="text-green-400 mb-2">{t('deployment.automatic.cloneTitle')}</div>
                    <div>{t('deployment.automatic.cloneCmd1')}</div>
                    <div>{t('deployment.automatic.cloneCmd2')}</div>
                    <div className="mt-3 text-green-400">{t('deployment.automatic.executableTitle')}</div>
                    <div>{t('deployment.automatic.executableCmd')}</div>
                    <div className="mt-3 text-green-400">{t('deployment.automatic.deployTitle')}</div>
                    <div>{t('deployment.automatic.deployCmd')}</div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                      {t('deployment.automatic.scriptsDoesTitle')}
                    </h4>
                    <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                      <li>{t('deployment.automatic.check')}</li>
                      <li>{t('deployment.automatic.backup')}</li>
                      <li>{t('deployment.automatic.build')}</li>
                      <li>{t('deployment.automatic.start')}</li>
                      <li>{t('deployment.automatic.migrate')}</li>
                      <li>{t('deployment.automatic.verify')}</li>
                      <li>{t('deployment.automatic.cleanup')}</li>
                    </ul>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('deployment.manual.title')}
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">{t('deployment.manual.step1.title')}</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div className="text-green-400">{t('deployment.manual.step1.backendComment')}</div>
                        <div>{t('deployment.manual.step1.backendCmd1')}</div>
                        <div>{t('deployment.manual.step1.backendCmd2')}</div>
                        <div className="mt-3 text-green-400">{t('deployment.manual.step1.frontendComment')}</div>
                        <div>{t('deployment.manual.step1.frontendCmd1')}</div>
                        <div>{t('deployment.manual.step1.frontendCmd2')}</div>
                      </div>
                      <div className="mt-3 p-4 bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-500">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          {t('deployment.manual.step1.important')}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">{t('deployment.manual.step2.title')}</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div>{t('deployment.manual.step2.cmd')}</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">{t('deployment.manual.step3.title')}</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div>{t('deployment.manual.step3.cmd')}</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">{t('deployment.manual.step4.title')}</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div>{t('deployment.manual.step4.cmd')}</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">{t('deployment.manual.step5.title')}</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div className="text-green-400">{t('deployment.manual.step5.verifyComment')}</div>
                        <div>{t('deployment.manual.step5.verifyCmd')}</div>
                        <div className="mt-3 text-green-400">{t('deployment.manual.step5.backendComment')}</div>
                        <div>{t('deployment.manual.step5.backendCmd')}</div>
                        <div className="mt-3 text-green-400">{t('deployment.manual.step5.frontendComment')}</div>
                        <div>{t('deployment.manual.step5.frontendCmd')}</div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('deployment.domain.title')}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {t('deployment.domain.description')}
                  </p>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{t('deployment.domain.step1.title')}</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div>{t('deployment.domain.step1.cmd1')}</div>
                        <div>{t('deployment.domain.step1.cmd2')}</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">{t('deployment.domain.step2.title')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {t('deployment.domain.step2.description')}
                      </p>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                        <div className="text-green-400">{t('deployment.domain.step2.frontendComment')}</div>
                        <div>server {'{'}</div>
                        <div>{'  '}listen 80;</div>
                        <div>{'  '}server_name tu-dominio.com;</div>
                        <div>{'  '}location / {'{'}</div>
                        <div>{'    '}proxy_pass http://localhost:3000;</div>
                        <div>{'    '}proxy_set_header Host $host;</div>
                        <div>{'  }}'}</div>
                        <div>{'}'}</div>
                        <div className="mt-3 text-green-400">{t('deployment.domain.step2.backendComment')}</div>
                        <div>server {'{'}</div>
                        <div>{'  '}listen 80;</div>
                        <div>{'  '}server_name api.tu-dominio.com;</div>
                        <div>{'  '}location / {'{'}</div>
                        <div>{'    '}proxy_pass http://localhost:4000;</div>
                        <div>{'  }}'}</div>
                        <div>{'}'}</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">{t('deployment.domain.step3.title')}</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div className="text-green-400">{t('deployment.domain.step3.activateComment')}</div>
                        <div>{t('deployment.domain.step3.activateCmd1')}</div>
                        <div>{t('deployment.domain.step3.activateCmd2')}</div>
                        <div>{t('deployment.domain.step3.activateCmd3')}</div>
                        <div className="mt-3 text-green-400">{t('deployment.domain.step3.sslComment')}</div>
                        <div>{t('deployment.domain.step3.sslCmd')}</div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('deployment.update.title')}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {t('deployment.update.description')}
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                    <div className="text-green-400">{t('deployment.update.pullComment')}</div>
                    <div>{t('deployment.update.pullCmd')}</div>
                    <div className="mt-3 text-green-400">{t('deployment.update.rebuildComment')}</div>
                    <div>{t('deployment.update.rebuildCmd1')}</div>
                    <div>{t('deployment.update.rebuildCmd2')}</div>
                    <div className="mt-3 text-green-400">{t('deployment.update.migrateComment')}</div>
                    <div>{t('deployment.update.migrateCmd')}</div>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('deployment.backup.title')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">{t('deployment.backup.create.title')}</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div>{t('deployment.backup.create.cmd')}</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">{t('deployment.backup.restore.title')}</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div>{t('deployment.backup.restore.cmd')}</div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('deployment.monitoring.title')}
                  </h2>
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <h4 className="font-semibold mb-2">{t('deployment.monitoring.allLogs.title')}</h4>
                      <code className="text-sm bg-gray-900 text-gray-100 px-3 py-1 rounded">
                        {t('deployment.monitoring.allLogs.cmd')}
                      </code>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                      <h4 className="font-semibold mb-2">{t('deployment.monitoring.specificLogs.title')}</h4>
                      <code className="text-sm bg-gray-900 text-gray-100 px-3 py-1 rounded">
                        {t('deployment.monitoring.specificLogs.cmd')}
                      </code>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                      <h4 className="font-semibold mb-2">{t('deployment.monitoring.status.title')}</h4>
                      <code className="text-sm bg-gray-900 text-gray-100 px-3 py-1 rounded">
                        {t('deployment.monitoring.status.cmd')}
                      </code>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900 rounded-lg">
                      <h4 className="font-semibold mb-2">{t('deployment.monitoring.resources.title')}</h4>
                      <code className="text-sm bg-gray-900 text-gray-100 px-3 py-1 rounded">
                        {t('deployment.monitoring.resources.cmd')}
                      </code>
                    </div>
                  </div>
                </section>

                <section className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-2 border-orange-300 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    {t('deployment.troubleshooting.title')}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('deployment.troubleshooting.portInUse.title')}</h4>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                        <div>{t('deployment.troubleshooting.portInUse.cmd1')}</div>
                        <div>{t('deployment.troubleshooting.portInUse.cmd2')}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('deployment.troubleshooting.frontendConnection.title')}</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {t('deployment.troubleshooting.frontendConnection.description')}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('deployment.troubleshooting.migrations.title')}</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {t('deployment.troubleshooting.migrations.description')}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-8">
                  <h2 className="text-3xl font-bold mb-4">
                    {t('deployment.docs.title')}
                  </h2>
                  <p className="text-lg mb-4">
                    {t('deployment.docs.description')}
                  </p>
                  <p className="text-sm opacity-90">
                    {t('deployment.docs.platforms')}
                  </p>
                </section>
              </div>
            )}

            {/* Downloads Section */}
            {activeTab === 'downloads' && (
              <div className="space-y-6">
                <section className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-8 text-white">
                  <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <span className="text-4xl">🎯</span>
                    {t('downloads.presentation.title')}
                  </h2>
                  <p className="text-purple-100 mb-6 text-lg">
                    {t('downloads.presentation.subtitle')}
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <a
                      href="/docs/PRESENTATION.pptx"
                      download
                      className="group bg-white dark:bg-gray-800 text-purple-700 px-8 py-6 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl block"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-5xl">📊</div>
                        <div className="text-sm bg-purple-100 px-3 py-1 rounded-full font-semibold">{t('downloads.presentation.powerpoint.size')}</div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{t('downloads.presentation.powerpoint.title')}</h3>
                      <p className="text-purple-600 text-sm mb-3">{t('downloads.presentation.powerpoint.filename')}</p>
                      <div className="flex items-center gap-2 text-purple-700 group-hover:gap-3 transition-all">
                        <span className="font-semibold">{t('downloads.presentation.powerpoint.cta')}</span>
                        <span>→</span>
                      </div>
                    </a>

                    <a
                      href="/docs/PRESENTATION.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-white dark:bg-gray-800 text-blue-700 px-8 py-6 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl block"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-5xl">🌐</div>
                        <div className="text-sm bg-blue-100 px-3 py-1 rounded-full font-semibold">{t('downloads.presentation.browser.size')}</div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{t('downloads.presentation.browser.title')}</h3>
                      <p className="text-blue-600 text-sm mb-3">{t('downloads.presentation.browser.filename')}</p>
                      <div className="flex items-center gap-2 text-blue-700 group-hover:gap-3 transition-all">
                        <span className="font-semibold">{t('downloads.presentation.browser.cta')}</span>
                        <span>→</span>
                      </div>
                    </a>
                  </div>

                  <div className="mt-6 bg-white dark:bg-gray-800/10 backdrop-blur rounded-lg p-4">
                    <p className="text-sm text-purple-100">
                      {t('downloads.presentation.note')}
                    </p>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('downloads.documents.title')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        title: '📊 Presentación (PRESENTATION.md)',
                        file: 'PRESENTATION.md',
                        size: '13 KB',
                        description: 'Presentación completa con 30+ diapositivas en formato Markdown.',
                      },
                      {
                        title: '📄 Whitepaper Completo',
                        file: 'WHITEPAPER.md',
                        size: '36 KB',
                        description: 'Documento técnico principal con todos los detalles del proyecto (~21,000 palabras).',
                      },
                      {
                        title: '⚡ Resumen Ejecutivo',
                        file: 'EXECUTIVE_SUMMARY.md',
                        size: '12 KB',
                        description: 'Versión condensada del whitepaper (2-3 páginas) ideal para presentaciones rápidas.',
                      },
                      {
                        title: '🔧 Módulos Técnicos',
                        file: 'TECHNICAL_MODULES.md',
                        size: '21 KB',
                        description: 'Documentación detallada de todos los módulos técnicos complementarios.',
                      },
                      {
                        title: '🎁 Economía de Regalo y Gobernanza',
                        file: 'GIFT_ECONOMY_GOVERNANCE.md',
                        size: '20 KB',
                        description: 'Sistema de economía de regalo y mecanismos de gobernanza avanzada.',
                      },
                      {
                        title: '📖 Instrucciones de Conversión',
                        file: 'PRESENTATION_INSTRUCTIONS.md',
                        size: '7.2 KB',
                        description: 'Guía completa para convertir la presentación a PowerPoint (.pptx) y PDF.',
                      },
                    ].map((doc, idx) => (
                      <a
                        key={idx}
                        href={`/docs/${doc.file}`}
                        download
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-xl transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex-1">{doc.title}</h3>
                          <span className="ml-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-full">{doc.size}</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{doc.description}</p>
                        <div className="text-purple-600 font-medium text-sm flex items-center gap-2">
                          <span>{t('downloads.documents.cta')}</span>
                          <span>→</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* Contribute Section */}
            {activeTab === 'contribute' && (
              <div className="space-y-6">
                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('contribute.how.title')}
                  </h2>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                    {t('contribute.how.description')}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border-2 border-blue-200 dark:border-blue-700 rounded-lg p-6">
                      <div className="text-4xl mb-3">💻</div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('contribute.how.development.title')}</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {t('contribute.how.development.description')}
                      </p>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>{t('contribute.how.development.frontend')}</li>
                        <li>{t('contribute.how.development.backend')}</li>
                        <li>{t('contribute.how.development.database')}</li>
                        <li>{t('contribute.how.development.devops')}</li>
                      </ul>
                    </div>

                    <div className="border-2 border-purple-200 dark:border-purple-700 rounded-lg p-6">
                      <div className="text-4xl mb-3">🎨</div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('contribute.how.design.title')}</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {t('contribute.how.design.description')}
                      </p>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>{t('contribute.how.design.uiux')}</li>
                        <li>{t('contribute.how.design.graphic')}</li>
                        <li>{t('contribute.how.design.icons')}</li>
                        <li>{t('contribute.how.design.accessibility')}</li>
                      </ul>
                    </div>

                    <div className="border-2 border-green-200 dark:border-green-700 rounded-lg p-6">
                      <div className="text-4xl mb-3">📝</div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('contribute.how.documentation.title')}</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {t('contribute.how.documentation.description')}
                      </p>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>{t('contribute.how.documentation.userGuides')}</li>
                        <li>{t('contribute.how.documentation.technical')}</li>
                        <li>{t('contribute.how.documentation.translations')}</li>
                        <li>{t('contribute.how.documentation.videos')}</li>
                      </ul>
                    </div>

                    <div className="border-2 border-pink-200 dark:border-pink-700 rounded-lg p-6">
                      <div className="text-4xl mb-3">🧪</div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('contribute.how.testing.title')}</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {t('contribute.how.testing.description')}
                      </p>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>{t('contribute.how.testing.manual')}</li>
                        <li>{t('contribute.how.testing.bugs')}</li>
                        <li>{t('contribute.how.testing.automated')}</li>
                        <li>{t('contribute.how.testing.qa')}</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('contribute.guide.title')}
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">{t('contribute.guide.step1.title')}</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div className="text-green-400">{t('contribute.guide.step1.forkComment')}</div>
                        <div>{t('contribute.guide.step1.cloneCmd')}</div>
                        <div>{t('contribute.guide.step1.cdCmd')}</div>
                        <div className="mt-2 text-green-400">{t('contribute.guide.step1.installComment')}</div>
                        <div>{t('contribute.guide.step1.installCmd')}</div>
                        <div className="mt-2 text-green-400">{t('contribute.guide.step1.devComment')}</div>
                        <div>{t('contribute.guide.step1.devCmd')}</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">{t('contribute.guide.step2.title')}</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div>{t('contribute.guide.step2.cmd')}</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">{t('contribute.guide.step3.title')}</h3>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li>{t('contribute.guide.step3.conventions')}</li>
                        <li>{t('contribute.guide.step3.clean')}</li>
                        <li>{t('contribute.guide.step3.tests')}</li>
                        <li>{t('contribute.guide.step3.compile')}</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">{t('contribute.guide.step4.title')}</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div>{t('contribute.guide.step4.addCmd')}</div>
                        <div>{t('contribute.guide.step4.commitCmd')}</div>
                        <div className="mt-2 text-green-400">{t('contribute.guide.step4.typesComment')}</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">{t('contribute.guide.step5.title')}</h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div>{t('contribute.guide.step5.pushCmd')}</div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mt-3">
                        {t('contribute.guide.step5.description')}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('contribute.practices.title')}
                  </h2>
                  <div className="space-y-3">
                    <div className="flex gap-3 items-start">
                      <span className="text-green-600 text-xl">✓</span>
                      <div>
                        <h4 className="font-semibold mb-1">{t('contribute.practices.small.title')}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('contribute.practices.small.description')}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="text-green-600 text-xl">✓</span>
                      <div>
                        <h4 className="font-semibold mb-1">{t('contribute.practices.descriptive.title')}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('contribute.practices.descriptive.description')}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="text-green-600 text-xl">✓</span>
                      <div>
                        <h4 className="font-semibold mb-1">{t('contribute.practices.tests.title')}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('contribute.practices.tests.description')}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="text-green-600 text-xl">✓</span>
                      <div>
                        <h4 className="font-semibold mb-1">{t('contribute.practices.document.title')}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('contribute.practices.document.description')}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="text-green-600 text-xl">✓</span>
                      <div>
                        <h4 className="font-semibold mb-1">{t('contribute.practices.style.title')}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('contribute.practices.style.description')}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('contribute.bugs.title')}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {t('contribute.bugs.description')}
                  </p>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span>{t('contribute.bugs.clear')}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span>{t('contribute.bugs.steps')}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span>{t('contribute.bugs.expected')}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span>{t('contribute.bugs.screenshots')}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span>{t('contribute.bugs.environment')}</span>
                    </li>
                  </ul>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('contribute.community.title')}
                  </h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">{t('contribute.community.discussions.title')}</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {t('contribute.community.discussions.description')}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">{t('contribute.community.issues.title')}</h4>
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        {t('contribute.community.issues.description')}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">{t('contribute.community.prs.title')}</h4>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        {t('contribute.community.prs.description')}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-8">
                  <h2 className="text-3xl font-bold mb-4">
                    {t('contribute.contributors.title')}
                  </h2>
                  <p className="text-lg mb-4">
                    {t('contribute.contributors.description')}
                  </p>
                  <p className="text-sm opacity-90">
                    {t('contribute.contributors.cta')}
                  </p>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t('contribute.license.title')}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {t('contribute.license.licensed')}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {t('contribute.license.means')}
                  </p>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps = async (context: any) => getI18nProps(context);
