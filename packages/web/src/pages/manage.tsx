import { useState, useEffect } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import MyOffers from '@/components/manage/MyOffers';
import MyEvents from '@/components/manage/MyEvents';
import MyTimeBank from '@/components/manage/MyTimeBank';

export default function ManagePage() {
  const t = useTranslations('manage');
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('offers');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
    }
  }, [router]);

  useEffect(() => {
    if (router.query.tab) {
      setActiveTab(router.query.tab as string);
    }
  }, [router.query.tab]);

  const tabs = [
    { id: 'offers', label: t('myOffers'), icon: '🎁' },
    { id: 'events', label: t('myEvents'), icon: '📅' },
    { id: 'timebank', label: t('timeBank'), icon: '⏰' },
  ];

  return (
    <Layout title={`${t('title')} - Comunidad Viva`}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('title')}
            </h1>
            <p className="text-lg text-gray-600">
              Administra tus ofertas, eventos y perfil en un solo lugar
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      router.push(`/manage?tab=${tab.id}`, undefined, { shallow: true });
                    }}
                    className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {activeTab === 'offers' && <MyOffers />}
            {activeTab === 'events' && <MyEvents />}
            {activeTab === 'timebank' && <MyTimeBank />}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export { getI18nProps as getStaticProps };
