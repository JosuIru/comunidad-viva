import PackLandingPage from '@/components/community-packs/PackLandingPage';
import { WORKER_COOP_PACK } from '@/lib/communityPacks';
import { getI18nProps } from '@/lib/i18n';

export default function CooperativaTrabajoPage() {
  return <PackLandingPage pack={WORKER_COOP_PACK} />;
}

export const getStaticProps = async (context: any) => getI18nProps(context);
