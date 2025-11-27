import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import Footer from './Footer';
import EconomyUnlockModal from './EconomyUnlockModal';
import { useEconomyProgression } from '../hooks/useEconomyProgression';

interface AppContentProps {
  children: ReactNode;
}

export default function AppContent({ children }: AppContentProps) {
  const router = useRouter();

  // TEMPORARILY DISABLED: Economy progression hook causing initialization errors
  // const {
  //   tier,
  //   showUnlockModal,
  //   unlockedTier,
  //   setShowUnlockModal,
  // } = useEconomyProgression();

  // Don't show footer on landing page (it has its own integrated footer) or installer
  const showFooter = router.pathname !== '/' && router.pathname !== '/installer';

  return (
    <>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <div className="flex-grow">
          {children}
        </div>
        {showFooter && <Footer />}
      </div>
    </>
  );
}
