import { useState } from 'react';
import Layout from '@/components/Layout';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { getI18nProps } from '@/lib/i18n';

export default function AdminAnalyticsPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              📊 Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Visualiza las métricas de uso y comportamiento de los usuarios
            </p>
          </div>

          {/* Dashboard */}
          <AnalyticsDashboard />
        </div>
      </div>
    </Layout>
  );
}

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);