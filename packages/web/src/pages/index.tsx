import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Import components with SSR disabled to avoid localStorage errors
const LandingPage = dynamic(() => import('@/components/LandingPage'), { ssr: false });
const MainDashboard = dynamic(() => import('@/components/MainDashboard'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando dashboard...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasVisited, setHasVisited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check auth and visit status only on client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      const visited = localStorage.getItem('has_visited_public_view');

      setIsAuthenticated(!!token);
      setHasVisited(!!visited);
      setIsLoading(false);

      // Mark as visited for future visits
      if (!visited) {
        localStorage.setItem('has_visited_public_view', 'true');
      }
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show landing page for first-time visitors who are not authenticated
  if (!isAuthenticated && !hasVisited) {
    return <LandingPage />;
  }

  // Show dashboard for authenticated users or returning visitors
  return <MainDashboard />;
}
