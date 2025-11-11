import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Installer() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requirements, setRequirements] = useState<any>(null);
  const [dbConfig, setDbConfig] = useState({
    host: 'localhost',
    port: 5432,
    database: 'comunidad_viva',
    username: 'comunidad',
    password: '',
  });
  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [includeTestData, setIncludeTestData] = useState(true);
  const [blockchainConfig, setBlockchainConfig] = useState({
    useOfficialToken: true,
    polygonRpcUrl: '',
    solanaRpcUrl: '',
    enableFederation: true,
  });

  const steps = [
    { id: 1, name: 'Bienvenida', icon: '🚀' },
    { id: 2, name: 'Requisitos', icon: '📋' },
    { id: 3, name: 'Base de Datos', icon: '🗄️' },
    { id: 4, name: 'Administrador', icon: '👤' },
    { id: 5, name: 'Blockchain', icon: '⛓️' },
    { id: 6, name: 'Configuración', icon: '⚙️' },
    { id: 7, name: 'Finalizar', icon: '🎉' },
  ];

  useEffect(() => {
    checkInstallationStatus();
  }, []);

  const checkInstallationStatus = async () => {
    try {
      const res = await fetch('http://localhost:4000/installer/status');
      const data = await res.json();

      if (data.installed) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error checking installation status:', error);
    }
  };

  const checkRequirements = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:4000/installer/check-requirements');
      const data = await res.json();
      setRequirements(data);
      setCurrentStep(2);
    } catch (error: any) {
      setError('Error verificando requisitos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseConnection = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:4000/installer/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbConfig),
      });
      const data = await res.json();

      if (data.success) {
        // Run migrations
        const migrateRes = await fetch('http://localhost:4000/installer/migrate', {
          method: 'POST',
        });
        const migrateData = await migrateRes.json();

        if (migrateData.success) {
          setCurrentStep(4);
        } else {
          setError('Error ejecutando migraciones: ' + migrateData.error);
        }
      } else {
        setError('Error conectando a la base de datos: ' + data.error);
      }
    } catch (error: any) {
      setError('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async () => {
    if (adminData.password !== adminData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (adminData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:4000/installer/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: adminData.name,
          email: adminData.email,
          password: adminData.password,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setCurrentStep(5);
      } else {
        setError('Error creando usuario admin: ' + data.error);
      }
    } catch (error: any) {
      setError('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const configureBlockchain = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:4000/installer/blockchain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blockchainConfig),
      });
      const data = await res.json();

      if (data.success) {
        setCurrentStep(6);
      } else {
        setError('Error configurando blockchain: ' + data.error);
      }
    } catch (error: any) {
      setError('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const finishInstallation = async () => {
    setLoading(true);
    setError('');
    try {
      // Seed database if requested
      if (includeTestData) {
        await fetch('http://localhost:4000/installer/seed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ includeTestData }),
        });
      }

      // Mark as installed
      const res = await fetch('http://localhost:4000/installer/complete', {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        setCurrentStep(7);
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setError('Error finalizando instalación: ' + data.error);
      }
    } catch (error: any) {
      setError('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Instalador - Truk</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="text-4xl">🌱</span>
              Truk - Instalador
            </h1>
            <p className="mt-2 text-gray-700 font-medium">
              Configuración inicial de la plataforma
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                      step.id === currentStep
                        ? 'bg-green-500 text-white scale-110 shadow-lg'
                        : step.id < currentStep
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div className={`mt-2 text-sm font-medium text-center ${
                    step.id === currentStep
                      ? 'text-green-600'
                      : step.id < currentStep
                      ? 'text-green-700'
                      : 'text-gray-700'
                  }`}>
                    {step.name}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-all ${
                      step.id < currentStep ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <strong className="font-bold">Error: </strong>
              <span>{error}</span>
            </div>
          )}

          {/* Content Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <div className="text-center">
                <div className="text-6xl mb-6">🌱</div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  ¡Bienvenido a Truk!
                </h2>
                <p className="text-gray-800 mb-6 text-lg max-w-2xl mx-auto">
                  Este asistente te guiará paso a paso en la configuración inicial
                  de tu plataforma de economía colaborativa.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left max-w-2xl mx-auto">
                  <h3 className="font-semibold mb-3 text-lg text-gray-900">
                    ⏱️ Tiempo estimado: 5-10 minutos
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      Verificaremos los requisitos del sistema
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      Configuraremos la base de datos PostgreSQL
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      Crearemos tu usuario administrador
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      Inicializaremos la plataforma
                    </li>
                  </ul>
                </div>
                <button
                  onClick={checkRequirements}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verificando...' : 'Comenzar Instalación →'}
                </button>
              </div>
            )}

            {/* Step 2: Requirements */}
            {currentStep === 2 && requirements && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  Verificación de Requisitos
                </h2>
                <div className="space-y-4">
                  {Object.entries(requirements).map(([key, req]: [string, any]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-2xl ${
                            req.installed ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {req.installed ? '✓' : '✗'}
                        </span>
                        <div>
                          <div className="font-semibold capitalize text-gray-900">{key}</div>
                          {req.version && (
                            <div className="text-sm text-gray-800">
                              Versión: {req.version}
                              {req.required && ` (requerida: ${req.required})`}
                            </div>
                          )}
                          {req.available && (
                            <div className="text-sm text-gray-800">
                              Disponible: {req.available}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900"
                  >
                    ← Atrás
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg"
                  >
                    Continuar →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Database */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  Configuración de Base de Datos
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Host
                    </label>
                    <input
                      type="text"
                      value={dbConfig.host}
                      onChange={(e) =>
                        setDbConfig({ ...dbConfig, host: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="localhost"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Puerto
                    </label>
                    <input
                      type="number"
                      value={dbConfig.port}
                      onChange={(e) =>
                        setDbConfig({ ...dbConfig, port: parseInt(e.target.value) })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="5432"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Nombre de la Base de Datos
                    </label>
                    <input
                      type="text"
                      value={dbConfig.database}
                      onChange={(e) =>
                        setDbConfig({ ...dbConfig, database: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="comunidad_viva"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Usuario
                    </label>
                    <input
                      type="text"
                      value={dbConfig.username}
                      onChange={(e) =>
                        setDbConfig({ ...dbConfig, username: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="comunidad"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={dbConfig.password}
                      onChange={(e) =>
                        setDbConfig({ ...dbConfig, password: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900"
                    disabled={loading}
                  >
                    ← Atrás
                  </button>
                  <button
                    onClick={testDatabaseConnection}
                    disabled={loading}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg disabled:opacity-50"
                  >
                    {loading ? 'Conectando...' : 'Probar Conexión y Continuar →'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Admin User */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  Crear Usuario Administrador
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={adminData.name}
                      onChange={(e) =>
                        setAdminData({ ...adminData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Email
                    </label>
                    <input
                      type="email"
                      value={adminData.email}
                      onChange={(e) =>
                        setAdminData({ ...adminData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="admin@ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={adminData.password}
                      onChange={(e) =>
                        setAdminData({ ...adminData, password: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                    <p className="text-sm text-gray-700 mt-1">
                      Mínimo 6 caracteres
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Confirmar Contraseña
                    </label>
                    <input
                      type="password"
                      value={adminData.confirmPassword}
                      onChange={(e) =>
                        setAdminData({
                          ...adminData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900"
                    disabled={loading}
                  >
                    ← Atrás
                  </button>
                  <button
                    onClick={createAdmin}
                    disabled={loading}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg disabled:opacity-50"
                  >
                    {loading ? 'Creando...' : 'Crear Administrador →'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Blockchain Configuration */}
            {currentStep === 5 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  Configuración de Blockchain
                </h2>
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold mb-3 text-lg text-gray-900">
                      🪙 Token SEMILLA
                    </h3>
                    <p className="text-gray-800 mb-4">
                      SEMILLA es el token de la red Truk que permite la interoperabilidad
                      entre todas las instalaciones de la plataforma.
                    </p>

                    <div className="space-y-4">
                      <div className="border border-blue-300 rounded-lg p-4 bg-white">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="radio"
                            checked={blockchainConfig.useOfficialToken}
                            onChange={() => setBlockchainConfig({ ...blockchainConfig, useOfficialToken: true })}
                            className="mt-1 w-5 h-5 text-green-500"
                          />
                          <div>
                            <div className="font-semibold text-gray-900">
                              ✅ Usar Token SEMILLA Oficial (Recomendado)
                            </div>
                            <div className="text-sm text-gray-700 mt-1">
                              Conecta con el token oficial de Truk en Polygon y Solana.
                              Tu comunidad formará parte de la red global y podrás intercambiar
                              valor con otras instalaciones.
                            </div>
                            <div className="mt-2 text-xs bg-green-50 border border-green-200 rounded p-2 text-gray-800">
                              <strong>Beneficios:</strong> Liquidez compartida, interoperabilidad,
                              listado en DEXes, soporte oficial
                            </div>
                          </div>
                        </label>
                      </div>

                      <div className="border border-gray-300 rounded-lg p-4 bg-white">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="radio"
                            checked={!blockchainConfig.useOfficialToken}
                            onChange={() => setBlockchainConfig({ ...blockchainConfig, useOfficialToken: false })}
                            className="mt-1 w-5 h-5 text-gray-500"
                          />
                          <div>
                            <div className="font-semibold text-gray-900">
                              🔧 Deployment Personalizado (Avanzado)
                            </div>
                            <div className="text-sm text-gray-700 mt-1">
                              Despliega tus propios contratos inteligentes. Requiere conocimientos
                              técnicos de Solidity y Rust.
                            </div>
                            <div className="mt-2 text-xs bg-yellow-50 border border-yellow-200 rounded p-2 text-gray-800">
                              <strong>Advertencia:</strong> No habrá interoperabilidad automática
                              con otras instalaciones de Truk
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={blockchainConfig.enableFederation}
                        onChange={(e) => setBlockchainConfig({ ...blockchainConfig, enableFederation: e.target.checked })}
                        className="mt-1 w-5 h-5 text-green-500 rounded focus:ring-green-500"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">
                          🌐 Habilitar Federación (Recomendado)
                        </div>
                        <div className="text-sm text-gray-800 mt-1">
                          Permite que tu instalación se comunique con otras comunidades
                          usando ActivityPub y DID. Tu comunidad recibirá un identificador
                          único descentralizado.
                        </div>
                        <div className="mt-2 text-xs bg-blue-50 border border-blue-200 rounded p-2 text-gray-800">
                          <strong>Incluye:</strong> Identidad descentralizada (DID),
                          Mutual Credit (Círculos), intercambio inter-comunitario
                        </div>
                      </div>
                    </label>
                  </div>

                  {blockchainConfig.useOfficialToken && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-3 text-gray-900">
                        ⚙️ Configuración Avanzada (Opcional)
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-900">
                            Polygon RPC URL (dejar vacío para usar oficial)
                          </label>
                          <input
                            type="text"
                            value={blockchainConfig.polygonRpcUrl}
                            onChange={(e) => setBlockchainConfig({ ...blockchainConfig, polygonRpcUrl: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                            placeholder="https://rpc-mumbai.maticvigil.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-900">
                            Solana RPC URL (dejar vacío para usar oficial)
                          </label>
                          <input
                            type="text"
                            value={blockchainConfig.solanaRpcUrl}
                            onChange={(e) => setBlockchainConfig({ ...blockchainConfig, solanaRpcUrl: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                            placeholder="https://api.devnet.solana.com"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900"
                    disabled={loading}
                  >
                    ← Atrás
                  </button>
                  <button
                    onClick={configureBlockchain}
                    disabled={loading}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg disabled:opacity-50"
                  >
                    {loading ? 'Configurando...' : 'Continuar →'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 6: Configuration */}
            {currentStep === 6 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  Configuración Final
                </h2>
                <div className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeTestData}
                        onChange={(e) => setIncludeTestData(e.target.checked)}
                        className="w-5 h-5 text-green-500 rounded focus:ring-green-500"
                      />
                      <div>
                        <div className="font-semibold">
                          Incluir Datos de Prueba
                        </div>
                        <div className="text-sm text-gray-800">
                          Crea usuarios, comunidades, ofertas y eventos de ejemplo
                          para probar la plataforma
                        </div>
                      </div>
                    </label>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <span>⚠️</span>
                      Configuraciones Opcionales
                    </h3>
                    <p className="text-sm text-gray-700">
                      Después de completar la instalación, puedes configurar:
                    </p>
                    <ul className="mt-2 text-sm text-gray-700 space-y-1 ml-6 list-disc">
                      <li>Email (Gmail, SMTP personalizado)</li>
                      <li>AWS S3 (almacenamiento de imágenes)</li>
                      <li>Redis (caché y rendimiento)</li>
                      <li>Blockchain (Polygon, Solana)</li>
                    </ul>
                    <p className="text-sm text-gray-800 mt-2">
                      Consulta la documentación para más detalles.
                    </p>
                  </div>
                </div>
                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900"
                    disabled={loading}
                  >
                    ← Atrás
                  </button>
                  <button
                    onClick={finishInstallation}
                    disabled={loading}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg disabled:opacity-50"
                  >
                    {loading ? 'Finalizando...' : 'Finalizar Instalación →'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 7: Complete */}
            {currentStep === 7 && (
              <div className="text-center">
                <div className="text-6xl mb-6 animate-bounce">🎉</div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  ¡Instalación Completada!
                </h2>
                <p className="text-gray-800 mb-6 text-lg max-w-2xl mx-auto">
                  Truk ha sido instalado exitosamente. Serás redirigido
                  al login en unos segundos...
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-left max-w-2xl mx-auto">
                  <h3 className="font-semibold mb-3 text-lg text-gray-900">
                    📝 Próximos Pasos:
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="mr-2">1.</span>
                      Inicia sesión con tu cuenta de administrador
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">2.</span>
                      Explora las diferentes secciones de la plataforma
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">3.</span>
                      Configura las opciones adicionales en Ajustes
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">4.</span>
                      Consulta la documentación para más información
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => router.push('/auth/login')}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg"
                >
                  Ir al Login →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
