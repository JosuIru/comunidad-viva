import dynamic from 'next/dynamic';

// Import dashboard with SSR disabled to avoid localStorage errors
// Force rebuild: v2024-11-27-2
const DashboardContent = dynamic(() => import('@/components/DashboardContent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  ),
});

export default function Dashboard() {
  return <DashboardContent />;
}
