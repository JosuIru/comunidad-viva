import PackLandingPage from '@/components/community-packs/PackLandingPage';
import { CULTURAL_SPACE_PACK } from '@/lib/communityPacks';
import { getI18nProps } from '@/lib/i18n';

export default function EspacioCulturalPage() {
  return <PackLandingPage pack={CULTURAL_SPACE_PACK} />;
}

export const getStaticProps = getI18nProps;
