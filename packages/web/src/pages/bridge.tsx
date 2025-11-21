import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import WalletModal from '@/components/WalletModal';
import { getI18nProps } from '@/lib/i18n';
import { useTranslations } from 'next-intl';
import {
  LockClosedIcon,
  LockOpenIcon,
  RocketLaunchIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  LinkIcon,
  ShieldCheckIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';

interface SupportedChain {
  chain: string;
  name: string;
  minAmount: number;
  fee: number;
}

interface BridgeTransaction {
  id: string;
  amount: number;
  direction: 'LOCK' | 'UNLOCK';
  targetChain: string;
  status: string;
  externalTxHash?: string;
  createdAt: string;
  completedAt?: string;
}

export default function BridgePage() {
  const router = useRouter();
  const tToasts = useTranslations('toasts');
  const [loading, setLoading] = useState(false);
  const [chains, setChains] = useState<SupportedChain[]>([]);
  const [history, setHistory] = useState<BridgeTransaction[]>([]);
  const [userAddress, setUserAddress] = useState('');
  const [semillaBalance, setSemillaBalance] = useState(0);

  // Bridge form state
  const [direction, setDirection] = useState<'LOCK' | 'UNLOCK'>('LOCK');
  const [selectedChain, setSelectedChain] = useState('POLYGON');
  const [amount, setAmount] = useState('');
  const [externalAddress, setExternalAddress] = useState('');
  const [externalTxHash, setExternalTxHash] = useState('');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [hasPhantom, setHasPhantom] = useState(false);

  useEffect(() => {
    loadData();
    // Check for available wallets
    setHasMetaMask(typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined');
    setHasPhantom(typeof window !== 'undefined' && typeof (window as any).solana !== 'undefined' && (window as any).solana.isPhantom);
  }, []);

  const loadData = async () => {
    try {
      // Load supported chains
      const chainsRes = await api.get('/bridge/chains');
      setChains(chainsRes.data);

      // Load user's bridge history
      const historyRes = await api.get('/bridge/history');
      setHistory(historyRes.data);

      // Load user profile for balance
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const profileRes = await api.get(`/users/${user.id}`);
      setSemillaBalance(profileRes.data.semillaBalance || 0);

      // Get MetaMask address if available
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_accounts',
        });
        if (accounts.length > 0) {
          setExternalAddress(accounts[0]);
        }
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error(tToasts('error.loadBridge'));
    }
  };

  const connectMetaMask = async () => {
    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        toast.error(tToasts('error.metamaskNotInstalled'));
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });

      setExternalAddress(accounts[0]);
      setIsWalletModalOpen(false);
      toast.success(tToasts('success.walletConnected'));
    } catch (error) {
      toast.error(tToasts('error.connectWallet'));
    }
  };

  const connectPhantom = async () => {
    try {
      if (typeof window === 'undefined' || !(window as any).solana?.isPhantom) {
        toast.error(tToasts('error.phantomNotInstalled'));
        window.open('https://phantom.app/', '_blank');
        return;
      }

      const resp = await (window as any).solana.connect();
      const walletAddress = resp.publicKey.toString();

      setExternalAddress(walletAddress);
      setIsWalletModalOpen(false);
      toast.success(tToasts('success.walletConnected'));
    } catch (error) {
      toast.error(tToasts('error.connectWallet'));
    }
  };

  const handleBridgeLock = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error(tToasts('error.invalidAmount'));
      return;
    }

    if (!externalAddress) {
      toast.error(tToasts('error.walletNotConnected'));
      return;
    }

    const selectedChainData = chains.find((c) => c.chain === selectedChain);
    if (!selectedChainData) {
      toast.error(tToasts('error.chainNotSupported'));
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum < selectedChainData.minAmount) {
      toast.error(`Mínimo: ${selectedChainData.minAmount} SEMILLA`);
      return;
    }

    const totalCost = amountNum + selectedChainData.fee;
    if (totalCost > semillaBalance) {
      toast.error(tToasts('error.insufficientBalance'));
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/bridge/lock', {
        amount: amountNum,
        targetChain: selectedChain,
        externalAddress,
      });

      toast.success(tToasts('success.bridgeStarted'));
      setAmount('');
      await loadData();

      // Redirect to history
      setTimeout(() => {
        const historySection = document.getElementById('history');
        historySection?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || tToasts('error.createBridge'));
    } finally {
      setLoading(false);
    }
  };

  const handleBridgeUnlock = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error(tToasts('error.invalidAmount'));
      return;
    }

    if (!externalTxHash) {
      toast.error(tToasts('error.txHashRequired'));
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/bridge/unlock', {
        amount: parseFloat(amount),
        sourceChain: selectedChain,
        externalTxHash,
      });

      toast.success(tToasts('success.returnBridgeComplete'));
      setAmount('');
      setExternalTxHash('');
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || tToasts('error.unlockFailed'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOCKED':
        return 'bg-blue-100 text-blue-800';
      case 'MINTED':
        return 'bg-green-100 text-green-800';
      case 'UNLOCKED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout title="Bridge - SEMILLA Multi-Chain">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
              <LinkIcon className="w-10 h-10" />
              SEMILLA Bridge
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Mueve tus tokens SEMILLA entre diferentes blockchains de bajo costo
            </p>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Balance Disponible</p>
                <p className="text-4xl font-bold">{semillaBalance.toFixed(2)} SEMILLA</p>
              </div>
              <CircleStackIcon className="w-16 h-16" />
            </div>
          </div>

          {/* Bridge Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Lock/Unlock Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setDirection('LOCK')}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    direction === 'LOCK'
                      ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <LockClosedIcon className="w-5 h-5" />
                  Enviar a Chain Externa
                </button>
                <button
                  onClick={() => setDirection('UNLOCK')}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    direction === 'UNLOCK'
                      ? 'bg-purple-600 dark:bg-purple-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <LockOpenIcon className="w-5 h-5" />
                  Traer de Chain Externa
                </button>
              </div>

              {direction === 'LOCK' ? (
                <>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Enviar SEMILLA</h3>

                  {/* Chain Selector */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Red de Destino
                    </label>
                    <select
                      value={selectedChain}
                      onChange={(e) => setSelectedChain(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                      {chains.map((chain) => (
                        <option key={chain.chain} value={chain.chain}>
                          {chain.name} (Min: {chain.minAmount}, Fee: {chain.fee} SEMILLA)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="100"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                  </div>

                  {/* External Address */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dirección de Destino
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={externalAddress}
                        onChange={(e) => setExternalAddress(e.target.value)}
                        placeholder="0x..."
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                      <button
                        onClick={() => setIsWalletModalOpen(true)}
                        className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                        title="Conectar billetera"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="hidden sm:inline">Conectar</span>
                      </button>
                    </div>
                  </div>

                  {/* Fee Info */}
                  {amount && chains.find((c) => c.chain === selectedChain) && (
                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
                      <div className="flex justify-between text-sm mb-2 text-gray-900 dark:text-gray-100">
                        <span>Cantidad:</span>
                        <span className="font-medium">{amount} SEMILLA</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2 text-gray-900 dark:text-gray-100">
                        <span>Comisión:</span>
                        <span className="font-medium">
                          {chains.find((c) => c.chain === selectedChain)?.fee} SEMILLA
                        </span>
                      </div>
                      <div className="border-t border-blue-300 dark:border-blue-600 mt-2 pt-2 flex justify-between font-bold text-gray-900 dark:text-gray-100">
                        <span>Total:</span>
                        <span>
                          {(
                            parseFloat(amount) +
                            (chains.find((c) => c.chain === selectedChain)?.fee || 0)
                          ).toFixed(2)}{' '}
                          SEMILLA
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleBridgeLock}
                    disabled={loading || !amount || !externalAddress}
                    className="w-full py-4 bg-blue-600 dark:bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      'Procesando...'
                    ) : (
                      <>
                        <RocketLaunchIcon className="w-5 h-5" />
                        Enviar a {chains.find((c) => c.chain === selectedChain)?.name || ''}
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Recibir SEMILLA</h3>

                  {/* Chain Selector */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Red de Origen
                    </label>
                    <select
                      value={selectedChain}
                      onChange={(e) => setSelectedChain(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                    >
                      {chains.map((chain) => (
                        <option key={chain.chain} value={chain.chain}>
                          {chain.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cantidad Quemada
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="100"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                    />
                  </div>

                  {/* Transaction Hash */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hash de Transacción (burn en {chains.find((c) => c.chain === selectedChain)?.name})
                    </label>
                    <input
                      type="text"
                      value={externalTxHash}
                      onChange={(e) => setExternalTxHash(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      El hash de la transacción donde quemaste los wrapped tokens
                    </p>
                  </div>

                  <button
                    onClick={handleBridgeUnlock}
                    disabled={loading || !amount || !externalTxHash}
                    className="w-full py-4 bg-purple-600 dark:bg-purple-700 text-white rounded-lg font-medium hover:bg-purple-700 dark:hover:bg-purple-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      'Verificando...'
                    ) : (
                      <>
                        <LockOpenIcon className="w-5 h-5" />
                        Desbloquear SEMILLA
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Info Panel */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <InformationCircleIcon className="w-6 h-6" />
                  Cómo Funciona
                </h3>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full font-bold">1</span>
                    <p>
                      <strong>Enviar:</strong> Bloquea SEMILLA y recibe wrapped tokens en la otra blockchain
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full font-bold">2</span>
                    <p>
                      <strong>Usar:</strong> Usa los wrapped tokens en DeFi, DEX, o envía a otros
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full font-bold">3</span>
                    <p>
                      <strong>Regresar:</strong> Quema los wrapped tokens y recupera SEMILLA original
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 rounded-xl shadow-lg p-6 border border-green-200 dark:border-green-700">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <CurrencyDollarIcon className="w-6 h-6" />
                  Comisiones Ultra-Bajas
                </h3>
                <div className="space-y-2">
                  {chains.map((chain) => (
                    <div
                      key={chain.chain}
                      className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600 last:border-0"
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-100">{chain.name}</span>
                      <span className="text-green-600 dark:text-green-400 font-bold">~$0.002</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          <div id="history" className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <DocumentTextIcon className="w-7 h-7" />
              Historial de Bridges
            </h3>

            {history.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <LinkIcon className="w-20 h-20 mx-auto mb-4 opacity-50" />
                <p>No has hecho ningún bridge todavía</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((tx) => (
                  <div
                    key={tx.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {tx.direction === 'LOCK' ? (
                          <LockClosedIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <LockOpenIcon className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                        )}
                        <div>
                          <p className="font-bold text-lg text-gray-900 dark:text-gray-100">{tx.amount} SEMILLA</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {tx.direction === 'LOCK' ? 'Enviado a' : 'Recibido de'} {tx.targetChain}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          tx.status,
                        )}`}
                      >
                        {tx.status}
                      </span>
                    </div>

                    {tx.externalTxHash && (
                      <div className="mt-2">
                        <a
                          href={`https://mumbai.polygonscan.com/tx/${tx.externalTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                        >
                          Ver en Polygonscan →
                        </a>
                      </div>
                    )}

                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        wallets={[
          {
            name: 'MetaMask',
            icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M22.05 11.17l-3.54-2.63.65-3.06a.5.5 0 00-.19-.54l-7-5.5a.5.5 0 00-.62 0l-7 5.5a.5.5 0 00-.19.54l.65 3.06-3.54 2.63a.5.5 0 00-.19.54l2.5 7.5a.5.5 0 00.48.35h15.76a.5.5 0 00.48-.35l2.5-7.5a.5.5 0 00-.19-.54z"/></svg>,
            description: 'La billetera más popular para Ethereum y EVM chains',
            isInstalled: hasMetaMask,
            installUrl: 'https://metamask.io/download/',
            onConnect: connectMetaMask,
          },
          {
            name: 'Phantom',
            icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>,
            description: 'Billetera líder para Solana y multi-chain',
            isInstalled: hasPhantom,
            installUrl: 'https://phantom.app/',
            onConnect: connectPhantom,
          },
          {
            name: 'WalletConnect',
            icon: <LinkIcon className="w-6 h-6" />,
            description: 'Conecta con 300+ billeteras móviles',
            isInstalled: false,
            installUrl: 'https://walletconnect.com/',
            onConnect: async () => {
              toast('WalletConnect próximamente disponible');
            },
          },
          {
            name: 'Coinbase Wallet',
            icon: <CircleStackIcon className="w-6 h-6" />,
            description: 'Billetera oficial de Coinbase',
            isInstalled: false,
            installUrl: 'https://www.coinbase.com/wallet',
            onConnect: async () => {
              toast('Coinbase Wallet próximamente disponible');
            },
          },
          {
            name: 'Trust Wallet',
            icon: <ShieldCheckIcon className="w-6 h-6" />,
            description: 'Billetera multi-chain con DeFi integrado',
            isInstalled: false,
            installUrl: 'https://trustwallet.com/',
            onConnect: async () => {
              toast('Trust Wallet próximamente disponible');
            },
          },
        ]}
        title="Conectar Billetera Web3"
        subtitle="Elige tu billetera para conectar al Bridge y enviar tokens cross-chain"
      />
    </Layout>
  );
}

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
