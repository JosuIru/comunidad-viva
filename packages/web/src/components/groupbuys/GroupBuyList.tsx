'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import GroupBuyCard from './GroupBuyCard';
import JoinGroupBuyModal from './JoinGroupBuyModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface GroupBuyListProps {
  category?: string;
  userLocation?: { lat: number; lng: number };
}

export default function GroupBuyList({ category, userLocation }: GroupBuyListProps) {
  const [selectedGroupBuy, setSelectedGroupBuy] = useState<any>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['groupbuys', category, userLocation],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (userLocation) {
        params.append('nearLat', userLocation.lat.toString());
        params.append('nearLng', userLocation.lng.toString());
      }

      const response = await fetch(`${API_URL}/groupbuys?${params}`);
      if (!response.ok) throw new Error('Error al cargar compras colectivas');
      return response.json();
    },
  });

  const handleJoin = (groupBuyId: string) => {
    const groupBuy = data?.groupBuys.find((gb: any) => gb.id === groupBuyId);
    setSelectedGroupBuy(groupBuy);
    setShowJoinModal(true);
  };

  const handleViewDetails = (groupBuyId: string) => {
    // TODO: Navigate to detail page or open detail modal
    console.log('View details:', groupBuyId);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow border border-gray-200 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-20 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data?.groupBuys || data.groupBuys.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <p className="text-gray-600 font-medium mb-2">No hay compras colectivas activas</p>
        <p className="text-sm text-gray-500">
          Sé el primero en crear una para tu comunidad
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Compras Colectivas
        </h2>
        <p className="text-gray-600">
          {data.total} {data.total === 1 ? 'compra activa' : 'compras activas'} · Ahorra comprando en grupo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.groupBuys.map((groupBuy: any) => (
          <GroupBuyCard
            key={groupBuy.id}
            groupBuy={groupBuy}
            onJoin={handleJoin}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {/* Join Modal */}
      {showJoinModal && selectedGroupBuy && (
        <JoinGroupBuyModal
          groupBuy={selectedGroupBuy}
          onClose={() => {
            setShowJoinModal(false);
            setSelectedGroupBuy(null);
          }}
        />
      )}
    </>
  );
}
