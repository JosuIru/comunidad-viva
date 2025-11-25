// Catch-all page for locale routes like /en, /eu, /ca
// Redirects to home with proper locale handling
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetStaticPaths, GetStaticProps } from 'next';

const LocaleRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    const { locale } = router.query;

    if (locale && typeof locale === 'string') {
      // Save locale preference
      if (typeof window !== 'undefined') {
        localStorage.setItem('locale', locale);
      }

      // Redirect to home
      router.replace('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
      </div>
    </div>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const locales = ['es', 'eu', 'en', 'ca'];

  return {
    paths: locales.map((locale) => ({ params: { locale } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const locale = params?.locale as string;

  return {
    props: {
      locale,
    },
  };
};

export default LocaleRedirect;
