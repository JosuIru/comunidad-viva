import { useState, useEffect, useRef } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useSocket } from '@/hooks/useSocket';

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender: User;
  receiver: User;
}

export default function ChatPage() {
  const router = useRouter();
  const { userId } = router.query;
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  // WebSocket connection for real-time messages
  const { isConnected, on, off } = useSocket();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUserId(JSON.parse(user).id);
    }
  }, []);

  // Fetch messages with the user
  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ['messages', userId],
    queryFn: async () => {
      const response = await api.get(`/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!token && !!userId,
  });

  // Listen for new messages via WebSocket
  useEffect(() => {
    if (!isConnected || !userId) return;

    const handleNewMessage = (notification: any) => {
      if (notification.type === 'new_message') {
        const newMessage = notification.data;

        // Only update if the message is from the current conversation
        if (newMessage.senderId === userId || newMessage.receiverId === userId) {
          queryClient.invalidateQueries({ queryKey: ['messages', userId] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      }
    };

    on('notification', handleNewMessage);

    return () => {
      off('notification', handleNewMessage);
    };
  }, [isConnected, userId, on, off, queryClient]);

  // Fetch user info
  const { data: otherUser } = useQuery<{ data: User }>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await api.get(`/users/${userId}`);
      return response;
    },
    enabled: !!userId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await api.post(
        `/messages/${userId}`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages', userId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al enviar mensaje');
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessageMutation.mutate(message.trim());
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
    }
  };

  // Group messages by date
  const groupedMessages = messages?.reduce((groups: { [key: string]: Message[] }, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {}) || {};

  if (!token) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800">Debes iniciar sesión para ver tus mensajes</p>
            <Link href="/auth/login" className="text-green-600 hover:underline mt-2 inline-block">
              Ir a login
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Chat - Truk</title>
      </Head>

      <Layout>
        <div className="h-screen flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              <Link href="/messages" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>

              {otherUser?.data && (
                <>
                  {otherUser.data.avatar ? (
                    <img
                      src={otherUser.data.avatar}
                      alt={otherUser.data.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 font-semibold">
                        {otherUser.data.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="font-semibold text-gray-900">{otherUser.data.name}</h2>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-green-600"></div>
                  <p className="mt-4 text-gray-600">Cargando mensajes...</p>
                </div>
              ) : Object.keys(groupedMessages).length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No hay mensajes todavía</p>
                  <p className="text-sm text-gray-500 mt-2">Envía el primer mensaje para comenzar la conversación</p>
                </div>
              ) : (
                Object.keys(groupedMessages).map((dateKey) => (
                  <div key={dateKey}>
                    {/* Date separator */}
                    <div className="flex items-center justify-center my-4">
                      <div className="bg-white px-3 py-1 rounded-full text-xs text-gray-600 shadow-sm">
                        {formatDate(groupedMessages[dateKey][0].createdAt)}
                      </div>
                    </div>

                    {/* Messages for this date */}
                    {groupedMessages[dateKey].map((msg) => {
                      const isOwn = msg.senderId === currentUserId;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
                        >
                          <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`rounded-lg px-4 py-2 ${
                                isOwn
                                  ? 'bg-green-600 text-white'
                                  : 'bg-white text-gray-900 border border-gray-200'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                            </div>
                            <div className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                              {formatTime(msg.createdAt)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="bg-white border-t border-gray-200 px-4 py-4">
            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={sendMessageMutation.isPending}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sendMessageMutation.isPending ? (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export const getStaticProps = async (context: any) => getI18nProps(context);
