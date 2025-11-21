import PackLandingPage from '@/components/community-packs/PackLandingPage';
import { SOCIAL_CENTER_PACK } from '@/lib/communityPacks';
import { getI18nProps } from '@/lib/i18n';

export default function CentroSocialPage() {
  return <PackLandingPage pack={SOCIAL_CENTER_PACK} />;
}

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
