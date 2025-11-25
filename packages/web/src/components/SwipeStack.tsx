import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { isValidImageSrc, handleImageError } from '@/lib/imageUtils';

interface User {
  id: string;
  name: string;
  avatar?: string;
  generosityScore: number;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  category: string;
  credits: number;
  images?: string[];
  user: User;
}

export default function SwipeStack() {
  const queryClient = useQueryClient();
  const t = useTranslations('swipe');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Get swipeable offers
  const { data: offers = [], isLoading } = useQuery<Offer[]>({
    queryKey: ['swipeable-offers'],
    queryFn: async () => {
      const { data } = await api.get('/viral/swipe/offers?limit=20');
      return data;
    },
  });

  // Get user matches
  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data } = await api.get('/viral/matches');
      return data;
    },
  });

  // Swipe mutation
  const swipeMutation = useMutation({
    mutationFn: async ({
      offerId,
      direction,
    }: {
      offerId: string;
      direction: 'LEFT' | 'RIGHT' | 'SUPER';
    }) => {
      const { data } = await api.post('/viral/swipe', { offerId, direction });
      return data;
    },
    onSuccess: (data) => {
      if (data.match) {
        toast.success(t('matchToast'), {
          icon: '💜',
          duration: 3000,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['swipeable-offers'] });
    },
  });

  const currentOffer = offers[currentIndex];

  const handleSwipe = (direction: 'LEFT' | 'RIGHT' | 'SUPER') => {
    if (!currentOffer) return;

    setSwipeDirection(direction);
    setIsDragging(false);

    // Animate card exit with larger offset
    const exitOffset = direction === 'RIGHT' ? 1000 : -1000;
    setDragOffset({ x: exitOffset, y: 0 });

    // Complete swipe after animation
    setTimeout(() => {
      swipeMutation.mutate({ offerId: currentOffer.id, direction });
      setCurrentIndex((prev) => prev + 1);
      setSwipeDirection(null);
      setDragOffset({ x: 0, y: 0 });
    }, 300);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const offsetX = e.clientX - dragStart.x;
    const offsetY = e.clientY - dragStart.y;

    setDragOffset({ x: offsetX, y: offsetY });

    // Show direction hint
    if (Math.abs(offsetX) > 50) {
      setSwipeDirection(offsetX > 0 ? 'RIGHT' : 'LEFT');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    if (Math.abs(dragOffset.x) > 100) {
      handleSwipe(dragOffset.x > 0 ? 'RIGHT' : 'LEFT');
    } else {
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentOffer) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <div className="text-8xl mb-6">🎉</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {t('allSeenTitle')}
        </h3>
        <p className="text-gray-600 mb-6">
          {t('allSeenDescription')}
        </p>
        {matches.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg">
            <p className="text-purple-900 font-semibold mb-2">
              {t('matchesInfo', { count: matches.length })}
            </p>
            <button
              onClick={() => window.location.href = '/matches'}
              className="text-purple-600 hover:text-purple-700 font-medium underline"
            >
              {t('viewMatches')}
            </button>
          </div>
        )}
      </div>
    );
  }

  const rotation = dragOffset.x * 0.1;
  const opacity = 1 - Math.abs(dragOffset.x) / 200;

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Card Stack */}
      <div className="relative h-[600px]">
        {/* Next cards preview */}
        {offers.slice(currentIndex + 1, currentIndex + 3).map((offer, index) => (
          <div
            key={offer.id}
            className="absolute inset-0 bg-white rounded-2xl shadow-lg"
            style={{
              transform: `scale(${1 - (index + 1) * 0.05}) translateY(${(index + 1) * 10}px)`,
              zIndex: -index - 1,
              opacity: 0.5 - index * 0.2,
            }}
          ></div>
        ))}

        {/* Current card */}
        <div
          ref={cardRef}
          className="absolute inset-0 bg-white rounded-2xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
          style={{
            transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y * 0.3}px) rotate(${rotation}deg)`,
            opacity: opacity,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-out',
            touchAction: 'none',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={(e) => {
            e.preventDefault();
            setIsDragging(true);
            setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
          }}
          onTouchMove={(e) => {
            if (!isDragging) return;
            e.preventDefault();
            const offsetX = e.touches[0].clientX - dragStart.x;
            const offsetY = e.touches[0].clientY - dragStart.y;
            setDragOffset({ x: offsetX, y: offsetY });
            if (Math.abs(offsetX) > 50) {
              setSwipeDirection(offsetX > 0 ? 'RIGHT' : 'LEFT');
            } else {
              setSwipeDirection(null);
            }
          }}
          onTouchEnd={handleMouseUp}
        >
          {/* Direction indicators */}
          {swipeDirection === 'RIGHT' && (
            <div className="absolute top-10 right-10 z-10 transform rotate-12">
              <div className="px-6 py-3 bg-green-500 text-white text-2xl font-bold rounded-lg shadow-lg">
                {t('directionRight')}
              </div>
            </div>
          )}
          {swipeDirection === 'LEFT' && (
            <div className="absolute top-10 left-10 z-10 transform -rotate-12">
              <div className="px-6 py-3 bg-red-500 text-white text-2xl font-bold rounded-lg shadow-lg">
                {t('directionLeft')}
              </div>
            </div>
          )}

          {/* Image */}
          <div className="h-2/3 bg-gradient-to-br from-blue-100 to-purple-100 relative">
            {currentOffer.images && currentOffer.images.length > 0 && isValidImageSrc(currentOffer.images[0]) ? (
              <img
                src={currentOffer.images[0]}
                alt={currentOffer.title}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                🛍️
              </div>
            )}

            {/* User avatar */}
            <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                {currentOffer.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{currentOffer.user.name}</p>
                <p className="text-sm text-gray-600">
                  ⭐ {currentOffer.user.generosityScore}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="h-1/3 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-2xl font-bold text-gray-900 flex-1">
                  {currentOffer.title}
                </h3>
                <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-sm ml-2">
                  {currentOffer.credits} ₡
                </div>
              </div>
              <p className="text-gray-600 mb-2">
                {currentOffer.description.substring(0, 100)}
                {currentOffer.description.length > 100 && '...'}
              </p>
              <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {currentOffer.category}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-6 mt-8">
        <button
          onClick={() => handleSwipe('LEFT')}
          className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-3xl hover:scale-110 transition-transform active:scale-95 border-2 border-red-200"
          title={t('passTitle')}
        >
          ✕
        </button>

        <button
          onClick={() => handleSwipe('SUPER')}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg flex items-center justify-center text-3xl hover:scale-110 transition-transform active:scale-95 text-white"
          title={t('superTitle')}
        >
          ⭐
        </button>

        <button
          onClick={() => handleSwipe('RIGHT')}
          className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-3xl hover:scale-110 transition-transform active:scale-95 border-2 border-green-200"
          title={t('likeTitle')}
        >
          ❤️
        </button>
      </div>

      {/* Counter */}
      <div className="text-center mt-6 text-gray-600">
        {t('counter', { current: currentIndex + 1, total: offers.length })}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 text-center">
          {t('hint')}
        </p>
      </div>
    </div>
  );
}
