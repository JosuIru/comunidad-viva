import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Tabs, Spin, message } from 'antd';
import {
  WalletOutlined,
  TrophyOutlined,
  StarOutlined,
  TeamOutlined,
  GlobalOutlined,
  FireOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import SemillaBalance from './SemillaBalance';
import FederatedFeed from './FederatedFeed';
import CirculosParticipation from './CirculosParticipation';
import ProofOfHelpCard from './ProofOfHelpCard';

const { TabPane } = Tabs;

interface EcosystemData {
  user: {
    did: string;
    semillaBalance: number;
    proofOfHelpScore: number;
    consciousnessLevel: number;
  };
  semilla: {
    balance: number;
    totalSupply: number;
    recentTransactions: number;
  };
  circulos: {
    myCirculos: number;
    totalCirculos: number;
    activeCirculos: number;
  };
  federation: {
    nodes: number;
    nodeId: string;
  };
}

/**
 * Ecosystem Dashboard - Main view for Gailu Labs federation features
 *
 * Displays:
 * - User's DID and reputation scores
 * - SEMILLA token balance and transactions
 * - Círculos de Conciencia participation
 * - Federated content feed
 * - Connected nodes information
 */
const EcosystemDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EcosystemData | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Por favor inicia sesión');
        return;
      }

      const response = await axios.get<EcosystemData>(
        `${process.env.NEXT_PUBLIC_API_URL}/federation/ecosystem/dashboard`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setData(response.data);
    } catch (error: any) {
      console.error('Error fetching ecosystem data:', error);
      message.error('Error al cargar el dashboard del ecosistema');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Cargando Ecosistema Gailu Labs...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>No se pudo cargar la información del ecosistema</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: 24 }}>
        <GlobalOutlined /> Ecosistema Gailu Labs
      </h1>

      <p style={{ fontSize: 16, marginBottom: 32, color: '#666' }}>
        Red federada de economía colaborativa y conciencia colectiva
      </p>

      {/* Stats Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Balance SEMILLA"
              value={data.user.semillaBalance}
              prefix={<WalletOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix="Ꙩ"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Proof-of-Help"
              value={data.user.proofOfHelpScore}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Nivel de Conciencia"
              value={data.user.consciousnessLevel}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#722ed1' }}
              suffix="/ 7"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Círculos Activos"
              value={data.circulos.myCirculos}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* User DID */}
      <Card style={{ marginBottom: 24 }}>
        <div>
          <strong>Identidad Descentralizada (DID):</strong>
          <code
            style={{
              display: 'block',
              padding: '8px 12px',
              background: '#f5f5f5',
              borderRadius: 4,
              marginTop: 8,
              fontSize: 12,
              overflowX: 'auto',
            }}
          >
            {data.user.did}
          </code>
          <p style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
            Tu identidad única en el ecosistema Gailu Labs. Úsala para interactuar con otros nodos
            y recibir SEMILLA de cualquier parte de la red.
          </p>
        </div>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultActiveKey="feed" size="large">
        <TabPane
          tab={
            <span>
              <FireOutlined /> Feed Federado
            </span>
          }
          key="feed"
        >
          <FederatedFeed />
        </TabPane>

        <TabPane
          tab={
            <span>
              <WalletOutlined /> SEMILLA
            </span>
          }
          key="semilla"
        >
          <SemillaBalance />
        </TabPane>

        <TabPane
          tab={
            <span>
              <TeamOutlined /> Círculos de Conciencia
            </span>
          }
          key="circulos"
        >
          <CirculosParticipation />
        </TabPane>

        <TabPane
          tab={
            <span>
              <TrophyOutlined /> Proof-of-Help
            </span>
          }
          key="poh"
        >
          <ProofOfHelpCard />
        </TabPane>
      </Tabs>

      {/* Federation Info */}
      <Card style={{ marginTop: 24, background: '#f0f5ff', border: '1px solid #adc6ff' }}>
        <Row gutter={16}>
          <Col span={12}>
            <strong>Nodo Local:</strong> {data.federation.nodeId}
          </Col>
          <Col span={12}>
            <strong>Nodos Conectados:</strong> {data.federation.nodes}
          </Col>
        </Row>
        <p style={{ marginTop: 12, marginBottom: 0, fontSize: 12, color: '#666' }}>
          Estás conectado a una red de {data.federation.nodes} nodos que comparten valores de
          colaboración, transparencia y evolución de conciencia.
        </p>
      </Card>
    </div>
  );
};

export default EcosystemDashboard;
