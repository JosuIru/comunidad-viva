import { useState } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUtils';

interface Offer {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  priceEur?: number;
  priceCredits?: number;
  images: string[];
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  views: number;
  interested: number;
}

export default function OffersPage() {
  const t = useTranslations('offers');
  const tCommon = useTranslations('common');

  const [filters, setFilters] = useState({
    type: '',
    category: '',
  });

  const { data: offersResponse, isLoading } = useQuery({
    queryKey: ['offers', filters],
    queryFn: async () => {
      const response = await api.get('/offers', { params: filters });
      return response.data as Offer[];
    },
  });

  const offers = offersResponse || [];

  const offerTypes = ['PRODUCT', 'SERVICE', 'TIME_BANK', 'GROUP_BUY', 'EVENT'];
  const categories = ['Alimentación', 'Ropa', 'Hogar', 'Tecnología', 'Servicios', 'Otros'];

  return (
    <Layout title={`${t('title')} - ${t('title')}`}>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
              <Link
                href="/offers/new"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {t('newOffer')}
              </Link>
            </div>

            <div className="flex gap-4">
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('allTypes')}</option>
                {offerTypes.map((type) => (
                  <option key={type} value={type}>
                    {t(`types.${type}`)}
                  </option>
                ))}
              </select>

              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('allCategories')}</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {t(`categories.${category}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">{tCommon('loadingOffers')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers?.map((offer) => (
                <Link
                  key={offer.id}
                  href={`/offers/${offer.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {offer.images?.length > 0 ? (
                      <img
                        src={getImageUrl(offer.images[0])}
                        alt={offer.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">{tCommon('noImage')}</span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                        {t(`types.${offer.type}`)}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {t(`categories.${offer.category}`)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{offer.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{offer.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        <span className="text-sm text-gray-700">{offer.user?.name || 'Usuario'}</span>
                      </div>
                      {offer.priceEur && (
                        <span className="text-lg font-bold text-blue-600">€{offer.priceEur}</span>
                      )}
                      {offer.priceCredits && (
                        <span className="text-lg font-bold text-purple-600">
                          {offer.priceCredits} {tCommon('credits')}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 text-sm text-gray-500">
                      <span>👁️ {offer.views}</span>
                      <span>⭐ {offer.interested}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && offers?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">{t('noOffersAvailable')}</p>
              <Link
                href="/offers/new"
                className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t('createFirstOffer')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export { getI18nProps as getStaticProps };
