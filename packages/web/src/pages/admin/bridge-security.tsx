import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

interface SecurityStats {
  totalEvents: number;
  eventsLast24h: number;
  eventsLast1h: number;
  criticalEvents: number;
  blacklistedDIDs: number;
  blacklistedAddresses: number;
  circuitBreaker: {
    open: boolean;
    reason: string | null;
  };
  eventsBySeverity: Array<{
    severity: string;
    count: number;
  }>;
  topEventTypes: Array<{
    type: string;
    count: number;
  }>;
}

interface SecurityEvent {
  id: string;
  type: string;
  severity: string;
  details: any;
  timestamp: string;
  resolved: boolean;
}

interface BlacklistEntry {
  id: string;
  type: string;
  value: string;
  reason: string;
  active: boolean;
  addedAt: string;
}

export default function BridgeSecurityDashboard() {
  const router = useRouter();
  const tAdmin = useTranslations('admin');
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [blacklist, setBlacklist] = useState<{ dids: BlacklistEntry[]; addresses: BlacklistEntry[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'blacklist'>('overview');

  // Circuit Breaker controls
  const [circuitBreakerReason, setCircuitBreakerReason] = useState('');
  const [showCircuitBreakerModal, setShowCircuitBreakerModal] = useState(false);

  // Blacklist controls
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [blacklistType, setBlacklistType] = useState<'DID' | 'ADDRESS'>('DID');
  const [blacklistValue, setBlacklistValue] = useState('');
  const [blacklistReason, setBlacklistReason] = useState('');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, eventsRes, blacklistRes] = await Promise.all([
        api.get('/bridge/admin/security-stats'),
        api.get('/bridge/admin/security-events'),
        api.get('/bridge/admin/blacklist'),
      ]);

      setStats(statsRes.data.stats);
      setEvents(eventsRes.data.events);
      setBlacklist(blacklistRes.data.blacklist);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || tAdmin('bridge.errors.loadingData'));
      setLoading(false);
    }
  };

  const openCircuitBreaker = async () => {
    if (!circuitBreakerReason.trim()) {
      toast.error(tAdmin('bridge.alerts.reasonRequired'));
      return;
    }

    try {
      await api.post('/bridge/admin/circuit-breaker/open', {
        reason: circuitBreakerReason,
      });
      setShowCircuitBreakerModal(false);
      setCircuitBreakerReason('');
      loadData();
      toast.success(tAdmin('bridge.alerts.circuitBreakerOpened'));
    } catch (err: any) {
      toast.error(tAdmin('bridge.alerts.error') + (err.response?.data?.message || tAdmin('bridge.alerts.unknownError')));
    }
  };

  const closeCircuitBreaker = async () => {
    if (!confirm(tAdmin('bridge.confirms.resumeOperations'))) return;

    try {
      await api.post('/bridge/admin/circuit-breaker/close');
      loadData();
      toast.success(tAdmin('bridge.alerts.circuitBreakerClosed'));
    } catch (err: any) {
      toast.error(tAdmin('bridge.alerts.error') + (err.response?.data?.message || tAdmin('bridge.alerts.unknownError')));
    }
  };

  const addToBlacklist = async () => {
    if (!blacklistValue.trim() || !blacklistReason.trim()) {
      toast.error(tAdmin('bridge.alerts.completeAllFields'));
      return;
    }

    try {
      const endpoint = blacklistType === 'DID'
        ? '/bridge/admin/blacklist/did'
        : '/bridge/admin/blacklist/address';

      await api.post(endpoint, {
        [blacklistType === 'DID' ? 'did' : 'address']: blacklistValue,
        reason: blacklistReason,
      });

      setShowBlacklistModal(false);
      setBlacklistValue('');
      setBlacklistReason('');
      loadData();
      toast.success(tAdmin('bridge.alerts.addedToBlacklist', { type: blacklistType }));
    } catch (err: any) {
      toast.error(tAdmin('bridge.alerts.error') + (err.response?.data?.message || tAdmin('bridge.alerts.unknownError')));
    }
  };

  const removeFromBlacklist = async (id: string) => {
    if (!confirm(tAdmin('bridge.confirms.removeFromBlacklist'))) return;

    try {
      await api.post(`/bridge/admin/blacklist/${id}/remove`);
      loadData();
      toast.success(tAdmin('bridge.alerts.removedFromBlacklist'));
    } catch (err: any) {
      toast.error(tAdmin('bridge.alerts.error') + (err.response?.data?.message || tAdmin('bridge.alerts.unknownError')));
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{tAdmin('bridge.loading.dashboard')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => router.push('/admin')}
              className="mt-4 text-red-600 underline"
            >
              {tAdmin('bridge.buttons.backToAdmin')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Bridge Security Dashboard - Truk Admin</title>
      </Head>

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{tAdmin('bridge.title')}</h1>
          <p className="mt-2 text-gray-600">{tAdmin('bridge.subtitle')}</p>
        </div>

        {/* Circuit Breaker Alert */}
        {stats?.circuitBreaker.open && (
          <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-red-900">{tAdmin('bridge.circuitBreaker.activeTitle')}</h3>
                <p className="text-red-700 mt-1">{tAdmin('bridge.circuitBreaker.operationsStopped')}</p>
                <p className="text-red-600 mt-2 text-sm">{tAdmin('bridge.circuitBreaker.reason')}: {stats.circuitBreaker.reason}</p>
              </div>
              <button
                onClick={closeCircuitBreaker}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
              >
                {tAdmin('bridge.buttons.closeCircuitBreaker')}
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'events', 'blacklist'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'overview' && tAdmin('bridge.tabs.overview')}
                {tab === 'events' && tAdmin('bridge.tabs.events')}
                {tab === 'blacklist' && tAdmin('bridge.tabs.blacklist')}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 text-sm">{tAdmin('bridge.metrics.totalEvents')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalEvents}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 text-sm">{tAdmin('bridge.metrics.last24h')}</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.eventsLast24h}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 text-sm">{tAdmin('bridge.metrics.lastHour')}</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.eventsLast1h}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 text-sm">{tAdmin('bridge.metrics.critical')}</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.criticalEvents}</p>
              </div>
            </div>

            {/* Severity Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{tAdmin('bridge.sections.eventsBySeverity')}</h3>
              <div className="space-y-3">
                {stats.eventsBySeverity.map((item) => (
                  <div key={item.severity} className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(item.severity)}`}>
                      {item.severity}
                    </span>
                    <span className="text-2xl font-bold text-gray-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Event Types */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{tAdmin('bridge.sections.topEventTypes')}</h3>
              <div className="space-y-2">
                {stats.topEventTypes.map((item, idx) => (
                  <div key={item.type} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700 text-sm">{idx + 1}. {item.type}</span>
                    <span className="font-semibold text-gray-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Blacklist Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{tAdmin('bridge.blacklist.blockedDIDs')}</h3>
                <p className="text-4xl font-bold text-orange-600">{stats.blacklistedDIDs}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{tAdmin('bridge.blacklist.blockedAddresses')}</h3>
                <p className="text-4xl font-bold text-orange-600">{stats.blacklistedAddresses}</p>
              </div>
            </div>

            {/* Circuit Breaker Control */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{tAdmin('bridge.sections.emergencyControl')}</h3>
              {!stats.circuitBreaker.open ? (
                <button
                  onClick={() => setShowCircuitBreakerModal(true)}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                >
                  {tAdmin('bridge.buttons.openCircuitBreaker')}
                </button>
              ) : (
                <p className="text-green-600 font-semibold">{tAdmin('bridge.circuitBreaker.closedNormal')}</p>
              )}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{tAdmin('bridge.events.recentTitle')}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tAdmin('bridge.events.columns.timestamp')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tAdmin('bridge.events.columns.type')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tAdmin('bridge.events.columns.severity')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tAdmin('bridge.events.columns.details')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tAdmin('bridge.events.columns.status')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{event.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                          {event.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <pre className="text-xs">{JSON.stringify(event.details, null, 2)}</pre>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {event.resolved ? (
                          <span className="text-green-600">{tAdmin('bridge.events.status.resolved')}</span>
                        ) : (
                          <span className="text-yellow-600">{tAdmin('bridge.events.status.pending')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Blacklist Tab */}
        {activeTab === 'blacklist' && blacklist && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowBlacklistModal(true)}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold"
              >
                {tAdmin('bridge.buttons.addToBlacklist')}
              </button>
            </div>

            {/* DIDs Blacklist */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{tAdmin('bridge.blacklist.blockedDIDs')} ({blacklist.dids.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tAdmin('bridge.blacklist.columns.did')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tAdmin('bridge.blacklist.columns.reason')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tAdmin('bridge.blacklist.columns.added')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tAdmin('bridge.blacklist.columns.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {blacklist.dids.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-6 py-4 text-sm font-mono text-gray-900">{entry.value}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{entry.reason}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(entry.addedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => removeFromBlacklist(entry.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            {tAdmin('bridge.buttons.remove')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Addresses Blacklist */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{tAdmin('bridge.blacklist.blockedAddresses')} ({blacklist.addresses.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tAdmin('bridge.blacklist.columns.address')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tAdmin('bridge.blacklist.columns.reason')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tAdmin('bridge.blacklist.columns.added')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tAdmin('bridge.blacklist.columns.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {blacklist.addresses.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-6 py-4 text-sm font-mono text-gray-900">{entry.value}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{entry.reason}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(entry.addedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => removeFromBlacklist(entry.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            {tAdmin('bridge.buttons.remove')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Circuit Breaker Modal */}
        {showCircuitBreakerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h3 className="text-xl font-bold text-red-900 mb-4">{tAdmin('bridge.modal.openCircuitBreaker.title')}</h3>
              <p className="text-gray-700 mb-4">
                {tAdmin('bridge.modal.openCircuitBreaker.warning')}
              </p>
              <label className="block mb-4">
                <span className="text-gray-700 font-medium">{tAdmin('bridge.modal.openCircuitBreaker.reasonLabel')}:</span>
                <textarea
                  value={circuitBreakerReason}
                  onChange={(e) => setCircuitBreakerReason(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200"
                  rows={3}
                  placeholder={tAdmin('bridge.modal.openCircuitBreaker.reasonPlaceholder')}
                />
              </label>
              <div className="flex space-x-3">
                <button
                  onClick={openCircuitBreaker}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                >
                  {tAdmin('bridge.buttons.confirm')}
                </button>
                <button
                  onClick={() => setShowCircuitBreakerModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  {tAdmin('bridge.buttons.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Blacklist Modal */}
        {showBlacklistModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{tAdmin('bridge.modal.addToBlacklist.title')}</h3>

              <label className="block mb-4">
                <span className="text-gray-700 font-medium">{tAdmin('bridge.modal.addToBlacklist.typeLabel')}:</span>
                <select
                  value={blacklistType}
                  onChange={(e) => setBlacklistType(e.target.value as 'DID' | 'ADDRESS')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200"
                >
                  <option value="DID">{tAdmin('bridge.modal.addToBlacklist.typeDID')}</option>
                  <option value="ADDRESS">{tAdmin('bridge.modal.addToBlacklist.typeAddress')}</option>
                </select>
              </label>

              <label className="block mb-4">
                <span className="text-gray-700 font-medium">
                  {blacklistType === 'DID' ? tAdmin('bridge.modal.addToBlacklist.typeDID') : tAdmin('bridge.modal.addToBlacklist.addressLabel')}:
                </span>
                <input
                  type="text"
                  value={blacklistValue}
                  onChange={(e) => setBlacklistValue(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200"
                  placeholder={blacklistType === 'DID' ? 'did:gailu:node:user' : '0x...'}
                />
              </label>

              <label className="block mb-4">
                <span className="text-gray-700 font-medium">{tAdmin('bridge.modal.addToBlacklist.reasonLabel')}:</span>
                <textarea
                  value={blacklistReason}
                  onChange={(e) => setBlacklistReason(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200"
                  rows={3}
                  placeholder={tAdmin('bridge.modal.addToBlacklist.reasonPlaceholder')}
                />
              </label>

              <div className="flex space-x-3">
                <button
                  onClick={addToBlacklist}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold"
                >
                  {tAdmin('bridge.buttons.add')}
                </button>
                <button
                  onClick={() => setShowBlacklistModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  {tAdmin('bridge.buttons.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const getStaticProps = async (context: any) => getI18nProps(context);
