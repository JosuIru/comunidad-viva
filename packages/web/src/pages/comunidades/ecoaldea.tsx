import PackLandingPage from '@/components/community-packs/PackLandingPage';
import { ECOVILLAGE_PACK } from '@/lib/communityPacks';
import { getI18nProps } from '@/lib/i18n';

export default function EcoaldeaPage() {
  return <PackLandingPage pack={ECOVILLAGE_PACK} />;
}

export const getStaticProps = async (context: any) => getI18nProps(context);
