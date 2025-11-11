import { useState } from 'react';
import Head from 'next/head';
import { getI18nProps } from '@/lib/i18n';

interface SeedResponse {
  success: boolean;
  message: string;
  users: Array<{
    email: string;
    name: string;
    role: string;
    reputation: number;
    description: string;
  }>;
  password: string;
  data: {
    users: number;
    offers: number;
    timeBankOffers: number;
    events: number;
    posts: number;
    proposals: number;
    trustBlocks: number;
    connections: number;
    transactions: number;
    flashDeals?: number;
    challenges?: number;
    swipeCards?: number;
    groupBuys?: number;
    referrals?: number;
    celebrations?: number;
    bridgeEvents?: number;
    delegates?: number;
    delegations?: number;
    streaks?: number;
    happyHours?: number;
    communities?: number;
    memberships?: number;
  };
  tips: string[];
  proposals?: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    votesCount?: number;
  }>;
}

export default function DevPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeedDemo = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:4000/health/seed-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar datos de prueba');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Developer Tools - Truk</title>
      </Head>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
          🛠️ Developer Tools
        </h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Herramientas para desarrollo y testing
        </p>

        <div
          style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
            Datos de Prueba
          </h2>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            Carga la base de datos con usuarios, ofertas, eventos y datos de consenso para testing.
          </p>

          <button
            onClick={handleSeedDemo}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            {loading ? 'Cargando...' : '🌱 Cargar Datos de Prueba'}
          </button>

          {error && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                color: '#991b1b',
              }}
            >
              ❌ {error}
            </div>
          )}

          {result && (
            <div
              style={{
                marginTop: '20px',
                padding: '16px',
                backgroundColor: '#d1fae5',
                border: '1px solid #a7f3d0',
                borderRadius: '6px',
              }}
            >
              <div style={{ color: '#065f46', fontWeight: '600', marginBottom: '12px' }}>
                ✅ {result.message}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <strong>Contraseña para todos:</strong> {result.password}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <strong>Usuarios creados:</strong>
                <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
                  {result.users.map((user) => (
                    <li key={user.email} style={{ marginBottom: '4px' }}>
                      <code style={{ backgroundColor: '#fff', padding: '2px 6px', borderRadius: '3px' }}>
                        {user.email}
                      </code>
                      {' - '}
                      {user.name} ({user.role}, {user.reputation} ayudas)
                      <br />
                      <span style={{ fontSize: '14px', color: '#666' }}>{user.description}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <strong>📊 Datos Base:</strong>
                <ul style={{ marginTop: '8px', marginLeft: '20px', fontSize: '14px' }}>
                  <li>{result.data.users} usuarios</li>
                  <li>{result.data.offers} ofertas</li>
                  <li>{result.data.timeBankOffers} ofertas de banco de tiempo</li>
                  <li>{result.data.events} eventos</li>
                  <li>{result.data.posts} posts</li>
                  <li>{result.data.proposals} propuestas de consenso</li>
                  <li>{result.data.trustBlocks} trust blocks</li>
                  <li>{result.data.connections} conexiones</li>
                  <li>{result.data.transactions} transacciones</li>
                </ul>
              </div>

              {(result.data.flashDeals || result.data.challenges || result.data.swipeCards || result.data.groupBuys) && (
                <div style={{ marginBottom: '16px' }}>
                  <strong>🎮 Gamificación:</strong>
                  <ul style={{ marginTop: '8px', marginLeft: '20px', fontSize: '14px' }}>
                    {result.data.flashDeals && <li>⚡ {result.data.flashDeals} flash deals activos</li>}
                    {result.data.challenges && <li>🏆 {result.data.challenges} challenges semanales</li>}
                    {result.data.swipeCards && <li>💝 {result.data.swipeCards} swipe cards</li>}
                    {result.data.groupBuys && <li>🛒 {result.data.groupBuys} compras grupales</li>}
                    {result.data.referrals && <li>🌟 {result.data.referrals} referidos</li>}
                    {result.data.streaks && <li>🔥 {result.data.streaks} usuarios con rachas activas</li>}
                    {result.data.happyHours && <li>⏰ {result.data.happyHours} happy hour activo (x2 multiplicador)</li>}
                  </ul>
                </div>
              )}

              {(result.data.celebrations || result.data.bridgeEvents) && (
                <div style={{ marginBottom: '16px' }}>
                  <strong>🦎 Sistema Híbrido:</strong>
                  <ul style={{ marginTop: '8px', marginLeft: '20px', fontSize: '14px' }}>
                    {result.data.celebrations && <li>🎉 {result.data.celebrations} celebraciones de migración</li>}
                    {result.data.bridgeEvents && <li>🌉 {result.data.bridgeEvents} bridge events programados</li>}
                  </ul>
                </div>
              )}

              {(result.data.delegates || result.data.delegations) && (
                <div style={{ marginBottom: '16px' }}>
                  <strong>🏛️ Gobernanza:</strong>
                  <ul style={{ marginTop: '8px', marginLeft: '20px', fontSize: '14px' }}>
                    {result.data.delegates && <li>👥 {result.data.delegates} delegados disponibles</li>}
                    {result.data.delegations && <li>🗳️ {result.data.delegations} delegaciones activas</li>}
                  </ul>
                </div>
              )}

              {(result.data.communities || result.data.memberships) && (
                <div style={{ marginBottom: '16px' }}>
                  <strong>🏘️ Comunidades:</strong>
                  <ul style={{ marginTop: '8px', marginLeft: '20px', fontSize: '14px' }}>
                    {result.data.communities && <li>🌆 {result.data.communities} comunidades creadas</li>}
                    {result.data.memberships && <li>👥 {result.data.memberships} membresías activas</li>}
                  </ul>
                </div>
              )}

              {result.proposals && result.proposals.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <strong>📜 Propuestas de Gobernanza:</strong>
                  <ul style={{ marginTop: '8px', marginLeft: '20px', fontSize: '14px' }}>
                    {result.proposals.map((proposal) => (
                      <li key={proposal.id} style={{ marginBottom: '8px' }}>
                        <strong>{proposal.title}</strong>
                        <br />
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          Tipo: {proposal.type} | Estado: {proposal.status}
                          {proposal.votesCount !== undefined && ` | Votos: ${proposal.votesCount}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <strong>💡 Tips:</strong>
                <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
                  {result.tips.map((tip, index) => (
                    <li key={index} style={{ marginBottom: '4px' }}>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            padding: '16px',
            backgroundColor: '#fef3c7',
            border: '1px solid #fde047',
            borderRadius: '8px',
            color: '#92400e',
            fontSize: '14px',
          }}
        >
          ⚠️ <strong>Nota:</strong> Esta página solo está disponible en modo desarrollo. Los datos
          existentes serán eliminados y reemplazados con datos de prueba.
        </div>
      </div>
    </>
  );
}

export const getStaticProps = async (context: any) => getI18nProps(context);
