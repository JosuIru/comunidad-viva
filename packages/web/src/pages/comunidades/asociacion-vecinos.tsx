import PackLandingPage from '@/components/community-packs/PackLandingPage';
import { NEIGHBORHOOD_ASSOCIATION_PACK } from '@/lib/communityPacks';
import { getI18nProps } from '@/lib/i18n';

export default function AsociacionVecinosPage() {
  return <PackLandingPage pack={NEIGHBORHOOD_ASSOCIATION_PACK} />;
}

export const getStaticProps = getI18nProps;
