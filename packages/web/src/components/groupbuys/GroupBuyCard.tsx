'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface GroupBuyCardProps {
  groupBuy: any;
  onJoin?: (groupBuyId: string) => void;
  onViewDetails?: (groupBuyId: string) => void;
}

export default function GroupBuyCard({ groupBuy, onJoin, onViewDetails }: GroupBuyCardProps) {
  const deadline = new Date(groupBuy.deadline);
  const timeLeft = formatDistanceToNow(deadline, { locale: es });
  const progressPercent = (groupBuy.currentParticipants / groupBuy.minParticipants) * 100;
  const isFull = groupBuy.currentParticipants >= groupBuy.maxParticipants;
  const isActive = groupBuy.currentParticipants >= groupBuy.minParticipants;

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {groupBuy.offer?.title}
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {groupBuy.offer?.user?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <span className="text-sm text-gray-600">{groupBuy.offer?.user?.name}</span>
            </div>
          </div>

          {/* Status badge */}
          {isActive && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              ¡Activa!
            </span>
          )}
          {isFull && (
            <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
              Llena
            </span>
          )}
        </div>

        {/* Description */}
        {groupBuy.offer?.description && (
          <p className="text-sm text-gray-700 mb-4 line-clamp-2">
            {groupBuy.offer.description}
          </p>
        )}

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">
              {groupBuy.currentParticipants} / {groupBuy.minParticipants} participantes mínimos
            </span>
            <span className="text-gray-900 font-medium">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isActive ? 'bg-green-600' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Máximo: {groupBuy.maxParticipants} personas
          </p>
        </div>

        {/* Current pricing tier */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Precio actual: {groupBuy.currentTier?.pricePerUnit}€/ud
              </p>
              {groupBuy.currentTier?.savings > 0 && (
                <p className="text-xs text-blue-700">
                  {groupBuy.currentTier.savings}% de ahorro
                </p>
              )}
            </div>
            {groupBuy.nextTier && (
              <div className="text-right">
                <p className="text-xs text-blue-700">Siguiente nivel:</p>
                <p className="text-sm font-bold text-blue-900">
                  {groupBuy.nextTier.pricePerUnit}€/ud
                </p>
                <p className="text-xs text-blue-600">
                  ({groupBuy.nextTier.minQuantity - groupBuy.totalQuantity} uds más)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Price breaks visualization */}
        {groupBuy.priceBreaks && groupBuy.priceBreaks.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-700 mb-2">
              Descuentos por volumen:
            </p>
            <div className="flex gap-2">
              {groupBuy.priceBreaks.map((tier: any, index: number) => {
                const isCurrentTier = groupBuy.currentTier?.id === tier.id;
                return (
                  <div
                    key={tier.id}
                    className={`flex-1 p-2 rounded text-center text-xs ${
                      isCurrentTier
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <p className="font-bold">{tier.pricePerUnit}€</p>
                    <p className="text-[10px] opacity-90">{tier.minQuantity}+ uds</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Location & deadline */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-4">
          <span className="flex items-center gap-1">
            <span>📦</span>
            {groupBuy.totalQuantity || 0} unidades pedidas
          </span>
          <span className="flex items-center gap-1">
            <span>📍</span>
            Recogida: {groupBuy.pickupAddress}
          </span>
          <span className="flex items-center gap-1">
            <span>⏰</span>
            Cierra en {timeLeft}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails?.(groupBuy.id)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Ver detalles
          </button>
          {!isFull && (
            <button
              onClick={() => onJoin?.(groupBuy.id)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Unirme
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
