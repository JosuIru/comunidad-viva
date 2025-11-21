import PackLandingPage from '@/components/community-packs/PackLandingPage';
import { CULTURAL_SPACE_PACK } from '@/lib/communityPacks';
import { getI18nProps } from '@/lib/i18n';

export default function EspacioCulturalPage() {
  return <PackLandingPage pack={CULTURAL_SPACE_PACK} />;
}

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
