import { useTranslations } from 'next-intl';
import Navbar from '../components/Navbar';
import BadgeGallery from '../components/achievements/BadgeGallery';
import { getI18nProps } from '@/lib/i18n';

export default function AchievementsPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <BadgeGallery />
    </div>
  );
}

export const getStaticProps = async (context: any) => getI18nProps(context);
