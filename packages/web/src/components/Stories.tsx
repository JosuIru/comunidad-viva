import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  avatar?: string;
  generosityScore: number;
}

interface Story {
  id: string;
  userId: string;
  type: 'OFFER' | 'TRANSACTION' | 'ACHIEVEMENT' | 'CUSTOM';
  content: string;
  media?: string;
  cta?: any;
  views: number;
  expiresAt: string;
  createdAt: string;
  user: User;
  reactions: { id: string; emoji: string; userId: string }[];
  viewers: { userId: string }[];
}

export default function Stories() {
  const queryClient = useQueryClient();
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUserId(user.id);
    }
  }, []);

  // Get active stories
  const { data: stories = [] } = useQuery<Story[]>({
    queryKey: ['stories'],
    queryFn: async () => {
      const { data } = await api.get('/viral/stories');
      return data;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // View story mutation
  const viewStoryMutation = useMutation({
    mutationFn: async (storyId: string) => {
      const { data } = await api.post(`/viral/stories/${storyId}/view`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });

  // React to story mutation
  const reactMutation = useMutation({
    mutationFn: async ({ storyId, emoji }: { storyId: string; emoji: string }) => {
      const { data } = await api.post(`/viral/stories/${storyId}/react`, { emoji });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      setShowEmojiPicker(false);
      toast.success('Reacción enviada!', { icon: '❤️' });
    },
  });

  const handleStoryClick = (index: number) => {
    setSelectedStoryIndex(index);
    const story = stories[index];
    if (story && !story.viewers.some((v) => v.userId === currentUserId)) {
      viewStoryMutation.mutate(story.id);
    }
  };

  const handlePrevStory = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex > 0) {
      setSelectedStoryIndex(selectedStoryIndex - 1);
      const story = stories[selectedStoryIndex - 1];
      if (story && !story.viewers.some((v) => v.userId === currentUserId)) {
        viewStoryMutation.mutate(story.id);
      }
    }
  };

  const handleNextStory = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex < stories.length - 1) {
      setSelectedStoryIndex(selectedStoryIndex + 1);
      const story = stories[selectedStoryIndex + 1];
      if (story && !story.viewers.some((v) => v.userId === currentUserId)) {
        viewStoryMutation.mutate(story.id);
      }
    } else {
      setSelectedStoryIndex(null);
    }
  };

  const handleReact = (emoji: string) => {
    if (selectedStoryIndex !== null) {
      const story = stories[selectedStoryIndex];
      reactMutation.mutate({ storyId: story.id, emoji });
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return hours > 0 ? `${hours}h` : 'Expira pronto';
  };

  const getStoryTypeColor = (type: string) => {
    switch (type) {
      case 'OFFER':
        return 'from-blue-500 to-purple-600';
      case 'TRANSACTION':
        return 'from-green-500 to-teal-600';
      case 'ACHIEVEMENT':
        return 'from-yellow-500 to-orange-600';
      default:
        return 'from-pink-500 to-red-600';
    }
  };

  if (stories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-6xl mb-3">📖</div>
        <p className="text-gray-600">No hay historias activas</p>
        <p className="text-sm text-gray-500 mt-2">
          Las historias duran 24 horas
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Stories List */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {stories.map((story, index) => {
          const hasViewed = story.viewers.some((v) => v.userId === currentUserId);
          return (
            <button
              key={story.id}
              onClick={() => handleStoryClick(index)}
              className="flex-shrink-0 relative group cursor-pointer"
            >
              {/* Avatar with gradient ring */}
              <div
                className={`w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr ${getStoryTypeColor(
                  story.type,
                )} ${hasViewed ? 'opacity-50' : ''}`}
              >
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  {story.user.avatar ? (
                    <img
                      src={story.user.avatar}
                      alt={story.user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                      {story.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Name and time */}
              <div className="mt-2 text-center">
                <p className="text-xs font-medium text-gray-900 truncate w-20">
                  {story.user.name}
                </p>
                <p className="text-xs text-gray-500">{getTimeRemaining(story.expiresAt)}</p>
              </div>

              {/* View count badge */}
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                👁 {story.views}
              </div>
            </button>
          );
        })}
      </div>

      {/* Story Viewer Modal */}
      {selectedStoryIndex !== null && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {/* Navigation Areas */}
          <div
            className="absolute inset-y-0 left-0 w-1/3 cursor-pointer"
            onClick={handlePrevStory}
          ></div>
          <div
            className="absolute inset-y-0 right-0 w-1/3 cursor-pointer"
            onClick={handleNextStory}
          ></div>

          {/* Close Button */}
          <button
            onClick={() => setSelectedStoryIndex(null)}
            className="absolute top-4 right-4 z-10 text-white text-2xl w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
          >
            ✕
          </button>

          {/* Story Content */}
          <div className="relative w-full max-w-lg h-full flex flex-col bg-black">
            {/* Progress bars */}
            <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
              {stories.map((_, index) => (
                <div
                  key={index}
                  className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
                >
                  {index < selectedStoryIndex && (
                    <div className="w-full h-full bg-white"></div>
                  )}
                  {index === selectedStoryIndex && (
                    <div
                      className="h-full bg-white animate-progress"
                      style={{ animation: 'progress 5s linear forwards' }}
                    ></div>
                  )}
                </div>
              ))}
            </div>

            {/* User info */}
            <div className="absolute top-6 left-0 right-0 p-4 z-10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                {stories[selectedStoryIndex].user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">
                  {stories[selectedStoryIndex].user.name}
                </p>
                <p className="text-white/80 text-xs">
                  {getTimeRemaining(stories[selectedStoryIndex].expiresAt)}
                </p>
              </div>
            </div>

            {/* Story content */}
            <div className="flex-1 flex items-center justify-center p-8 pt-20">
              {stories[selectedStoryIndex].media ? (
                <img
                  src={stories[selectedStoryIndex].media}
                  alt="Story"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <p className="text-white text-2xl font-bold mb-4">
                    {stories[selectedStoryIndex].content}
                  </p>
                  {stories[selectedStoryIndex].type === 'ACHIEVEMENT' && (
                    <div className="text-8xl mb-4">🏆</div>
                  )}
                  {stories[selectedStoryIndex].type === 'OFFER' && (
                    <div className="text-8xl mb-4">🛍️</div>
                  )}
                  {stories[selectedStoryIndex].type === 'TRANSACTION' && (
                    <div className="text-8xl mb-4">💸</div>
                  )}
                </div>
              )}
            </div>

            {/* Reactions */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center gap-2 mb-3">
                {stories[selectedStoryIndex].reactions
                  .slice(0, 5)
                  .map((reaction, i) => (
                    <span key={i} className="text-2xl">
                      {reaction.emoji}
                    </span>
                  ))}
                {stories[selectedStoryIndex].reactions.length > 5 && (
                  <span className="text-white text-sm">
                    +{stories[selectedStoryIndex].reactions.length - 5} más
                  </span>
                )}
              </div>

              {/* Emoji picker */}
              {showEmojiPicker ? (
                <div className="flex gap-2 justify-center mb-3">
                  {['❤️', '🔥', '😍', '👏', '😂', '😮', '🎉'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReact(emoji)}
                      className="text-3xl hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => setShowEmojiPicker(true)}
                  className="w-full bg-white/20 backdrop-blur text-white py-3 rounded-full font-medium hover:bg-white/30 transition-colors"
                >
                  💬 Reaccionar
                </button>
              )}
            </div>
          </div>

          <style jsx>{`
            @keyframes progress {
              from {
                width: 0%;
              }
              to {
                width: 100%;
              }
            }
            .animate-progress {
              animation: progress 5s linear forwards;
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
        </div>
      )}
    </>
  );
}
