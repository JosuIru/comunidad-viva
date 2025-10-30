import { GetStaticProps } from 'next';
import { useTranslations } from 'next-intl';
import Navbar from '../components/Navbar';
import BadgeGallery from '../components/achievements/BadgeGallery';

export default function AchievementsPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <BadgeGallery />
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../messages/${locale}.json`)).default,
    },
  };
};
