import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

interface FeedbackWidgetProps {
  onSubmit: (feedback: { rating: number; comment: string; helpful: boolean }) => void;
  onSkip: () => void;
  title?: string;
  description?: string;
}

export default function FeedbackWidget({
  onSubmit,
  onSkip,
  title = '¿Cómo fue tu experiencia con el tour?',
  description = 'Tu opinión nos ayuda a mejorar la plataforma para todos'
}: FeedbackWidgetProps) {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0 || helpful === null) {
      return; // Require at least rating and helpful selection
    }

    onSubmit({ rating, comment, helpful });
    setSubmitted(true);

    // Close after showing thank you message
    setTimeout(() => {
      onSkip();
    }, 2000);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60"
        onClick={onSkip}
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            ¡Gracias por tu feedback!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Nos ayudará a mejorar la experiencia para todos
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60"
      onClick={onSkip}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💭</span>
              <h3 className="text-xl font-bold">{title}</h3>
            </div>
            <button
              onClick={onSkip}
              className="text-white/80 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="mt-2 text-blue-100 text-sm">{description}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Helpful Question */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              ¿Te resultó útil el tour? *
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setHelpful(true)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  helpful === true
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'border-gray-300 dark:border-gray-600 hover:border-green-400 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">👍</span>
                  <span className="text-sm font-medium">Sí, muy útil</span>
                </div>
              </button>
              <button
                onClick={() => setHelpful(false)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  helpful === false
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                    : 'border-gray-300 dark:border-gray-600 hover:border-orange-400 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">👎</span>
                  <span className="text-sm font-medium">No tanto</span>
                </div>
              </button>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              ¿Cómo calificarías tu experiencia? *
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-4xl transition-transform hover:scale-110"
                >
                  {(hoveredRating || rating) >= star ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                {rating === 1 && 'Necesitamos mejorar mucho 😞'}
                {rating === 2 && 'Podemos hacerlo mejor 😐'}
                {rating === 3 && 'Está bien 🙂'}
                {rating === 4 && 'Muy bueno 😊'}
                {rating === 5 && '¡Excelente! 🎉'}
              </p>
            )}
          </div>

          {/* Comment (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              ¿Algo más que quieras decirnos? (opcional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos qué te gustó o qué podríamos mejorar..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onSkip}
              className="flex-1 px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
            >
              Saltar
            </button>
            <Button
              onClick={handleSubmit}
              variant="primary"
              size="md"
              className="flex-1"
              disabled={rating === 0 || helpful === null}
            >
              Enviar Feedback
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
