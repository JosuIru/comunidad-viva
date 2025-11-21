import PackLandingPage from '@/components/community-packs/PackLandingPage';
import { SOLIDARITY_NETWORK_PACK } from '@/lib/communityPacks';
import { getI18nProps } from '@/lib/i18n';

export default function RedSolidariaPage() {
  return <PackLandingPage pack={SOLIDARITY_NETWORK_PACK} />;
}

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
