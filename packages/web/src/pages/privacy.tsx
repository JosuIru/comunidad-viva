import Layout from '@/components/Layout';
import { getI18nProps } from '@/lib/i18n';
import { useTranslations } from 'next-intl';

interface PrivacySection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

export default function PrivacyPage() {
  const t = useTranslations('privacy');
  const sections = t.raw('sections') as PrivacySection[];
  const contact = t.raw('contact') as { title: string; paragraphs: string[] };

  return (
    <Layout title={t('title')}>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <header className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
            <p className="text-sm text-gray-500">{t('updated')}</p>
            <p className="mt-6 text-lg text-gray-700 leading-relaxed">{t('intro')}</p>
          </header>

          <div className="space-y-10">
            {sections.map((section, index) => (
              <section key={index} className="bg-white rounded-2xl shadow p-6 md:p-8 border border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">{section.title}</h2>
                {section.paragraphs?.map((paragraph, idx) => (
                  <p key={idx} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="mt-4 list-disc list-inside space-y-2 text-gray-700">
                    {section.bullets.map((item, bulletIdx) => (
                      <li key={bulletIdx}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <section className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-blue-900 mb-3">{contact.title}</h2>
            {contact.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-blue-800 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </section>
        </div>
      </div>
    </Layout>
  );
}

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
