'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface JoinGroupBuyModalProps {
  groupBuy: any;
  onClose: () => void;
}

export default function JoinGroupBuyModal({ groupBuy, onClose }: JoinGroupBuyModalProps) {
  const [quantity, setQuantity] = useState(1);
  const queryClient = useQueryClient();
  const tToasts = useTranslations('toasts');

  // Calculate pricing based on quantity
  const calculateTotal = (qty: number) => {
    const totalWithNew = (groupBuy.totalQuantity || 0) + qty;
    const applicableTier = [...groupBuy.priceBreaks]
      .sort((a, b) => b.minQuantity - a.minQuantity)
      .find(tier => totalWithNew >= tier.minQuantity) || groupBuy.priceBreaks[0];

    return {
      pricePerUnit: applicableTier.pricePerUnit,
      total: qty * applicableTier.pricePerUnit,
      savings: applicableTier.savings,
      tier: applicableTier,
    };
  };

  const currentCalc = calculateTotal(quantity);

  const joinMutation = useMutation({
    mutationFn: async (qty: number) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/groupbuys/${groupBuy.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: qty }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al unirse');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupbuys'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'participations'] });
      onClose();
    },
  });

  const handleJoin = () => {
    if (quantity < 1) {
      toast.error(tToasts('quantityMinimum'));
      return;
    }

    const spotsLeft = groupBuy.maxParticipants - groupBuy.currentParticipants;
    if (spotsLeft <= 0) {
      toast.error(tToasts('groupBuyFull'));
      return;
    }

    joinMutation.mutate(quantity);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Unirse a la compra
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Product info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-bold text-gray-900 mb-2">{groupBuy.offer?.title}</h3>
          {groupBuy.offer?.description && (
            <p className="text-sm text-gray-700 mb-2">{groupBuy.offer.description}</p>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>📦 {groupBuy.totalQuantity || 0} unidades ya pedidas</span>
            <span>·</span>
            <span>👥 {groupBuy.currentParticipants}/{groupBuy.maxParticipants} participantes</span>
          </div>
        </div>

        {/* Quantity selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ¿Cuántas unidades quieres?
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold"
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-center text-lg font-bold"
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Price calculation */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-sm text-blue-700">Precio por unidad</p>
              <p className="text-2xl font-bold text-blue-900">{currentCalc.pricePerUnit}€</p>
              {currentCalc.savings > 0 && (
                <p className="text-sm text-green-600 font-medium">
                  {currentCalc.savings}% de ahorro
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-700">Total</p>
              <p className="text-3xl font-bold text-blue-900">{currentCalc.total.toFixed(2)}€</p>
            </div>
          </div>

          {/* Show what tier this puts us in */}
          <div className="pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-700 mb-2">
              Con tu compra, el grupo llegará a {(groupBuy.totalQuantity || 0) + quantity} unidades
            </p>

            {/* Next tier preview */}
            {groupBuy.priceBreaks.map((tier: any, idx: number) => {
              const totalWithYou = (groupBuy.totalQuantity || 0) + quantity;
              const isCurrent = totalWithYou >= tier.minQuantity &&
                (!groupBuy.priceBreaks[idx + 1] || totalWithYou < groupBuy.priceBreaks[idx + 1].minQuantity);
              const isNext = totalWithYou < tier.minQuantity &&
                (!groupBuy.priceBreaks[idx - 1] || totalWithYou >= groupBuy.priceBreaks[idx - 1].minQuantity);

              if (!isCurrent && !isNext) return null;

              return (
                <div key={tier.id} className={`text-xs ${isCurrent ? 'text-blue-900 font-medium' : 'text-blue-600'}`}>
                  {isCurrent && <span>✓ Nivel actual: </span>}
                  {isNext && <span>Siguiente nivel: </span>}
                  {tier.pricePerUnit}€/ud · {tier.minQuantity}+ uds · {tier.savings}% ahorro
                  {isNext && ` (faltan ${tier.minQuantity - totalWithYou} uds)`}
                </div>
              );
            })}
          </div>
        </div>

        {/* Price breaks table */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Todos los descuentos disponibles:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-2 text-left text-gray-700">Cantidad</th>
                  <th className="px-3 py-2 text-right text-gray-700">Precio/ud</th>
                  <th className="px-3 py-2 text-right text-gray-700">Ahorro</th>
                </tr>
              </thead>
              <tbody>
                {groupBuy.priceBreaks.map((tier: any) => {
                  const isActive = currentCalc.tier.id === tier.id;
                  return (
                    <tr key={tier.id} className={isActive ? 'bg-blue-50 font-medium' : ''}>
                      <td className="px-3 py-2 border-t">
                        {isActive && '→ '}
                        {tier.minQuantity}+ unidades
                      </td>
                      <td className="px-3 py-2 border-t text-right">{tier.pricePerUnit}€</td>
                      <td className="px-3 py-2 border-t text-right text-green-600">
                        {tier.savings}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pickup info */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg text-sm">
          <p className="font-medium text-gray-900 mb-1">📍 Punto de recogida:</p>
          <p className="text-gray-700">{groupBuy.pickupAddress}</p>
        </div>

        {/* Error message */}
        {joinMutation.isError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {joinMutation.error.message}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={joinMutation.isPending}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleJoin}
            disabled={joinMutation.isPending}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {joinMutation.isPending ? 'Uniéndome...' : `Unirme · ${currentCalc.total.toFixed(2)}€`}
          </button>
        </div>

        {/* Info */}
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-xs text-yellow-800">
          <p className="font-medium mb-1">ℹ️ ¿Cómo funciona?</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Te unes con la cantidad que necesitas</li>
            <li>Cuando se alcanza el mínimo, la compra se activa</li>
            <li>Cuantas más personas se unan, mejor precio para todos</li>
            <li>Se te notificará cuando llegue el momento de recoger</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
