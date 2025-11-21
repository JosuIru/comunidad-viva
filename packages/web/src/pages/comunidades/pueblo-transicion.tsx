import PackLandingPage from '@/components/community-packs/PackLandingPage';
import { TRANSITION_TOWN_PACK } from '@/lib/communityPacks';
import { getI18nProps } from '@/lib/i18n';

export default function PuebloTransicionPage() {
  return <PackLandingPage pack={TRANSITION_TOWN_PACK} />;
}

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
