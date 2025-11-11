import PackLandingPage from '@/components/community-packs/PackLandingPage';
import { TRANSITION_TOWN_PACK } from '@/lib/communityPacks';
import { getI18nProps } from '@/lib/i18n';

export default function PuebloTransicionPage() {
  return <PackLandingPage pack={TRANSITION_TOWN_PACK} />;
}

export const getStaticProps = getI18nProps;
