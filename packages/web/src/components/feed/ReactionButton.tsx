'use client';

import { useState } from 'react';

interface ReactionButtonProps {
  postId: string;
  reactions: {
    id: string;
    type: string;
    user: { id: string; name: string };
  }[];
  currentUserId?: string;
  onReact: (type: string) => void;
  onRemove: () => void;
}

const REACTION_EMOJIS: Record<string, string> = {
  LIKE: '👍',
  LOVE: '❤️',
  CARE: '🤗',
  HAHA: '😄',
  WOW: '😮',
  SAD: '😢',
  ANGRY: '😠',
  SUPPORT: '💪',
};

export default function ReactionButton({
  postId,
  reactions,
  currentUserId,
  onReact,
  onRemove,
}: ReactionButtonProps) {
  const [showPicker, setShowPicker] = useState(false);

  const userReaction = reactions.find((r) => r.user.id === currentUserId);
  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleReaction = (type: string) => {
    if (userReaction?.type === type) {
      onRemove();
    } else {
      onReact(type);
    }
    setShowPicker(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
          userReaction
            ? 'bg-green-50 text-green-600 hover:bg-green-100'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        {userReaction ? (
          <span className="text-lg">{REACTION_EMOJIS[userReaction.type]}</span>
        ) : (
          <span className="text-lg">👍</span>
        )}
        {reactions.length > 0 && (
          <span className="text-sm font-medium">{reactions.length}</span>
        )}
      </button>

      {showPicker && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowPicker(false)}
          />
          <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex gap-1 z-20">
            {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                className={`text-2xl p-2 rounded hover:bg-gray-100 transition-transform hover:scale-125 ${
                  userReaction?.type === type ? 'bg-green-50' : ''
                }`}
                title={type.toLowerCase()}
              >
                {emoji}
                {reactionCounts[type] && (
                  <span className="text-xs text-gray-600 ml-1">
                    {reactionCounts[type]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
