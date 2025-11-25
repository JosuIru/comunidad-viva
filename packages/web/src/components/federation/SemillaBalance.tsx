import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, message, Tag, Space } from 'antd';
import { SendOutlined, HistoryOutlined, GiftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  fromDID: string;
  toDID: string;
  amount: number;
  fee: number;
  type: string;
  reason: string;
  status: string;
  createdAt: string;
  from?: { name: string };
  to?: { name: string };
}

const SemillaBalance: React.FC = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, []);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/federation/semilla/balance`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBalance(response.data.balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<Transaction[]>(
        `${process.env.NEXT_PUBLIC_API_URL}/federation/semilla/transactions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (values: any) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/federation/semilla/transfer`,
        values,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success('Transferencia realizada con éxito');
      setTransferModalVisible(false);
      form.resetFields();
      fetchBalance();
      fetchTransactions();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error al realizar la transferencia');
    }
  };

  const handleGrantInitial = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/federation/semilla/grant-initial`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success('¡Has recibido tus 100 SEMILLA iniciales!');
      fetchBalance();
      fetchTransactions();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error al solicitar SEMILLA inicial');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'REWARD':
        return 'gold';
      case 'TRANSFER':
        return 'blue';
      case 'INITIAL_GRANT':
        return 'green';
      case 'PURCHASE':
        return 'purple';
      case 'DONATION':
        return 'magenta';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      REWARD: 'Recompensa',
      TRANSFER: 'Transferencia',
      INITIAL_GRANT: 'Grant Inicial',
      PURCHASE: 'Compra',
      DONATION: 'Donación',
      POOL_CONTRIBUTION: 'Contribución',
      POOL_DISTRIBUTION: 'Distribución',
    };
    return labels[type] || type;
  };

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => format(new Date(date), 'dd/MM/yyyy HH:mm'),
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color={getTypeColor(type)}>{getTypeLabel(type)}</Tag>,
    },
    {
      title: 'Cantidad',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: Transaction) => (
        <span style={{ color: record.toDID.includes(record.id) ? 'green' : 'red' }}>
          {record.toDID.includes(record.id) ? '+' : '-'}
          {amount} Ꙩ
        </span>
      ),
    },
    {
      title: 'Motivo',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'COMPLETED' ? 'success' : 'processing'}>{status}</Tag>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <HistoryOutlined />
            Balance SEMILLA
          </Space>
        }
        extra={
          <Space>
            {balance === 0 && (
              <Button type="default" icon={<GiftOutlined />} onClick={handleGrantInitial}>
                Recibir SEMILLA Inicial
              </Button>
            )}
            <Button type="primary" icon={<SendOutlined />} onClick={() => setTransferModalVisible(true)}>
              Enviar SEMILLA
            </Button>
          </Space>
        }
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 48, margin: 0, color: '#52c41a' }}>
            {balance} <span style={{ fontSize: 32 }}>Ꙩ</span>
          </h2>
          <p style={{ color: '#888' }}>SEMILLA es el token de intercambio del ecosistema Gailu Labs</p>
        </div>

        <h3 style={{ marginTop: 32, marginBottom: 16 }}>Historial de Transacciones</h3>
        <Table
          dataSource={transactions}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Transfer Modal */}
      <Modal
        title="Enviar SEMILLA"
        open={transferModalVisible}
        onCancel={() => setTransferModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleTransfer} layout="vertical">
          <Form.Item
            name="toDID"
            label="DID del Destinatario"
            rules={[{ required: true, message: 'Por favor ingresa el DID del destinatario' }]}
          >
            <Input placeholder="did:gailu:node:user:uuid" />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Cantidad"
            rules={[
              { required: true, message: 'Por favor ingresa la cantidad' },
              { type: 'number', min: 1, message: 'La cantidad debe ser mayor a 0' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              max={balance}
              addonAfter="Ꙩ"
              placeholder="100"
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Motivo"
            rules={[{ required: true, message: 'Por favor indica el motivo' }]}
          >
            <Input.TextArea rows={3} placeholder="Pago por servicios, donación, etc." />
          </Form.Item>

          <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
            * Se aplicará una tarifa del 1% para el mantenimiento del nodo
          </p>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Enviar SEMILLA
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SemillaBalance;
