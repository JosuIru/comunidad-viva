import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../../lib/api';
import JoinGroupBuyModal from '../../components/groupbuys/JoinGroupBuyModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function GroupBuyDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [showJoinModal, setShowJoinModal] = useState(false);

  const { data: groupBuy, isLoading } = useQuery({
    queryKey: ['groupbuy', id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/groupbuys/${id}`);
      if (!response.ok) throw new Error('Error al cargar la compra colectiva');
      return response.json();
    },
    enabled: !!id,
  });

  if (isLoading || !groupBuy) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando compra colectiva...</p>
        </div>
      </div>
    );
  }

  const deadline = new Date(groupBuy.deadline);
  const timeLeft = formatDistanceToNow(deadline, { locale: es });
  const progressPercent = (groupBuy.currentParticipants / groupBuy.minParticipants) * 100;
  const isFull = groupBuy.currentParticipants >= groupBuy.maxParticipants;
  const isActive = groupBuy.currentParticipants >= groupBuy.minParticipants;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            <span>←</span>
            <span>Volver</span>
          </button>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{groupBuy.offer?.title}</h1>
                <div className="flex items-center gap-2 text-blue-100">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-lg font-bold">
                    {groupBuy.offer?.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span>{groupBuy.offer?.user?.name}</span>
                </div>
              </div>

              {/* Status badge */}
              {isActive && (
                <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  ¡Compra activa!
                </span>
              )}
              {isFull && (
                <span className="px-4 py-2 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                  Llena
                </span>
              )}
            </div>

            {/* Progress */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>
                  {groupBuy.currentParticipants} / {groupBuy.minParticipants} participantes mínimos
                </span>
                <span className="font-medium">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-white transition-all"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm mt-2 text-blue-100">
                Máximo: {groupBuy.maxParticipants} personas
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Description */}
            {groupBuy.offer?.description && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Descripción</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{groupBuy.offer.description}</p>
              </div>
            )}

            {/* Current pricing */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Precio actual</h2>
              <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-900">
                      {groupBuy.currentTier?.pricePerUnit}€ <span className="text-base font-normal text-gray-600">por unidad</span>
                    </p>
                    {groupBuy.currentTier?.savings > 0 && (
                      <p className="text-sm text-blue-700 mt-1">
                        Ahorras {groupBuy.currentTier.savings}% respecto al precio base
                      </p>
                    )}
                  </div>
                  {groupBuy.nextTier && (
                    <div className="text-right">
                      <p className="text-sm text-blue-700">¡Siguiente descuento!</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {groupBuy.nextTier.pricePerUnit}€/ud
                      </p>
                      <p className="text-sm text-blue-600">
                        Faltan {groupBuy.nextTier.minQuantity - groupBuy.totalQuantity} unidades
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Price breaks */}
            {groupBuy.priceBreaks && groupBuy.priceBreaks.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Descuentos por volumen</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {groupBuy.priceBreaks.map((tier: any) => {
                    const isCurrentTier = groupBuy.currentTier?.id === tier.id;
                    return (
                      <div
                        key={tier.id}
                        className={`p-4 rounded-lg text-center transition-all ${
                          isCurrentTier
                            ? 'bg-blue-600 text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <p className="text-2xl font-bold mb-1">{tier.pricePerUnit}€</p>
                        <p className="text-sm opacity-90">desde {tier.minQuantity} uds</p>
                        {tier.savings > 0 && (
                          <p className={`text-xs mt-1 ${isCurrentTier ? 'text-blue-100' : 'text-green-600'}`}>
                            -{tier.savings}%
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Details grid */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Detalles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <span className="text-2xl">📦</span>
                  <div>
                    <p className="font-medium text-gray-900">Cantidad total</p>
                    <p className="text-gray-600">{groupBuy.totalQuantity || 0} unidades pedidas</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="font-medium text-gray-900">Punto de recogida</p>
                    <p className="text-gray-600">{groupBuy.pickupAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <p className="font-medium text-gray-900">Cierre de inscripción</p>
                    <p className="text-gray-600">En {timeLeft}</p>
                    <p className="text-sm text-gray-500">{deadline.toLocaleDateString('es-ES')}</p>
                  </div>
                </div>

                {groupBuy.offer?.category && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <span className="text-2xl">🏷️</span>
                    <div>
                      <p className="font-medium text-gray-900">Categoría</p>
                      <p className="text-gray-600">{groupBuy.offer.category}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Participants */}
            {groupBuy.participants && groupBuy.participants.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Participantes ({groupBuy.participants.length})</h2>
                <div className="space-y-2">
                  {groupBuy.participants.map((participant: any) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                          {participant.user?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium text-gray-900">{participant.user?.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {participant.quantity} unidad{participant.quantity !== 1 ? 'es' : ''}
                        </p>
                        {participant.committedAmount && (
                          <p className="text-xs text-gray-600">
                            Comprometido: {participant.committedAmount}€
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              {!isFull ? (
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                >
                  Unirme a la compra
                </button>
              ) : (
                <div className="flex-1 px-6 py-3 bg-gray-100 text-gray-500 rounded-lg text-center font-medium text-lg">
                  Compra completa
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <JoinGroupBuyModal
          groupBuy={groupBuy}
          onClose={() => setShowJoinModal(false)}
        />
      )}
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  return {
    props: {},
    revalidate: 60,
  };
};
