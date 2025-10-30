import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    loadData();
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
      setSemillaBalance(profileRes.data.data.semillaBalance || 0);

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
      toast.error('Error cargando datos del bridge');
    }
  };

  const connectMetaMask = async () => {
    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        toast.error('MetaMask no está instalado');
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });

      setExternalAddress(accounts[0]);
      toast.success('MetaMask conectado');
    } catch (error) {
      toast.error('Error conectando MetaMask');
    }
  };

  const handleBridgeLock = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Ingresa una cantidad válida');
      return;
    }

    if (!externalAddress) {
      toast.error('Conecta tu wallet primero');
      return;
    }

    const selectedChainData = chains.find((c) => c.chain === selectedChain);
    if (!selectedChainData) {
      toast.error('Chain no soportada');
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum < selectedChainData.minAmount) {
      toast.error(`Mínimo: ${selectedChainData.minAmount} SEMILLA`);
      return;
    }

    const totalCost = amountNum + selectedChainData.fee;
    if (totalCost > semillaBalance) {
      toast.error(`Balance insuficiente. Necesitas ${totalCost} SEMILLA (${amountNum} + ${selectedChainData.fee} fee)`);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/bridge/lock', {
        amount: amountNum,
        targetChain: selectedChain,
        externalAddress,
      });

      toast.success('Bridge iniciado! Los tokens llegarán en ~30 segundos');
      setAmount('');
      await loadData();

      // Redirect to history
      setTimeout(() => {
        const historySection = document.getElementById('history');
        historySection?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear bridge');
    } finally {
      setLoading(false);
    }
  };

  const handleBridgeUnlock = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Ingresa una cantidad válida');
      return;
    }

    if (!externalTxHash) {
      toast.error('Ingresa el hash de la transacción');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/bridge/unlock', {
        amount: parseFloat(amount),
        sourceChain: selectedChain,
        externalTxHash,
      });

      toast.success('Bridge de regreso completado!');
      setAmount('');
      setExternalTxHash('');
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al desbloquear');
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🌉 SEMILLA Bridge
            </h1>
            <p className="text-gray-600">
              Mueve tus tokens SEMILLA entre diferentes blockchains de bajo costo
            </p>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Balance Disponible</p>
                <p className="text-4xl font-bold">{semillaBalance.toFixed(2)} SEMILLA</p>
              </div>
              <div className="text-6xl">💎</div>
            </div>
          </div>

          {/* Bridge Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Lock/Unlock Selector */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setDirection('LOCK')}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                    direction === 'LOCK'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🔒 Enviar a Chain Externa
                </button>
                <button
                  onClick={() => setDirection('UNLOCK')}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                    direction === 'UNLOCK'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🔓 Traer de Chain Externa
                </button>
              </div>

              {direction === 'LOCK' ? (
                <>
                  <h3 className="text-xl font-bold mb-4">Enviar SEMILLA</h3>

                  {/* Chain Selector */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Red de Destino
                    </label>
                    <select
                      value={selectedChain}
                      onChange={(e) => setSelectedChain(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* External Address */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección de Destino
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={externalAddress}
                        onChange={(e) => setExternalAddress(e.target.value)}
                        placeholder="0x..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={connectMetaMask}
                        className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        🦊
                      </button>
                    </div>
                  </div>

                  {/* Fee Info */}
                  {amount && chains.find((c) => c.chain === selectedChain) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Cantidad:</span>
                        <span className="font-medium">{amount} SEMILLA</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Comisión:</span>
                        <span className="font-medium">
                          {chains.find((c) => c.chain === selectedChain)?.fee} SEMILLA
                        </span>
                      </div>
                      <div className="border-t border-blue-300 mt-2 pt-2 flex justify-between font-bold">
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
                    className="w-full py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Procesando...' : '🚀 Enviar a ' + (chains.find((c) => c.chain === selectedChain)?.name || '')}
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-4">Recibir SEMILLA</h3>

                  {/* Chain Selector */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Red de Origen
                    </label>
                    <select
                      value={selectedChain}
                      onChange={(e) => setSelectedChain(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad Quemada
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Transaction Hash */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hash de Transacción (burn en {chains.find((c) => c.chain === selectedChain)?.name})
                    </label>
                    <input
                      type="text"
                      value={externalTxHash}
                      onChange={(e) => setExternalTxHash(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      El hash de la transacción donde quemaste los wrapped tokens
                    </p>
                  </div>

                  <button
                    onClick={handleBridgeUnlock}
                    disabled={loading || !amount || !externalTxHash}
                    className="w-full py-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Verificando...' : '🔓 Desbloquear SEMILLA'}
                  </button>
                </>
              )}
            </div>

            {/* Info Panel */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">ℹ️ Cómo Funciona</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex gap-3">
                    <span className="text-2xl">1️⃣</span>
                    <p>
                      <strong>Enviar:</strong> Bloquea SEMILLA y recibe wrapped tokens en la otra blockchain
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">2️⃣</span>
                    <p>
                      <strong>Usar:</strong> Usa los wrapped tokens en DeFi, DEX, o envía a otros
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">3️⃣</span>
                    <p>
                      <strong>Regresar:</strong> Quema los wrapped tokens y recupera SEMILLA original
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-lg p-6 border border-green-200">
                <h3 className="text-xl font-bold mb-4">💰 Comisiones Ultra-Bajas</h3>
                <div className="space-y-2">
                  {chains.map((chain) => (
                    <div
                      key={chain.chain}
                      className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0"
                    >
                      <span className="font-medium">{chain.name}</span>
                      <span className="text-green-600 font-bold">~$0.002</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          <div id="history" className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold mb-6">📜 Historial de Bridges</h3>

            {history.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-6xl mb-4">🌉</p>
                <p>No has hecho ningún bridge todavía</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((tx) => (
                  <div
                    key={tx.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {tx.direction === 'LOCK' ? '🔒' : '🔓'}
                        </span>
                        <div>
                          <p className="font-bold text-lg">{tx.amount} SEMILLA</p>
                          <p className="text-sm text-gray-500">
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
                          className="text-blue-600 text-sm hover:underline"
                        >
                          Ver en Polygonscan →
                        </a>
                      </div>
                    )}

                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
