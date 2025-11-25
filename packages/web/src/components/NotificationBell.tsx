import { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import toast from 'react-hot-toast';

interface NotificationBellProps {
  userId: string | null;
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const { notifications, clearNotifications, isConnected } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (notifications.length > unreadCount) {
      const newNotifications = notifications.slice(unreadCount);
      
      newNotifications.forEach((notification) => {
        let message = '';
        switch (notification.type) {
          case 'new_message':
            message = `Nuevo mensaje de ${notification.data.sender.name}`;
            break;
          case 'new_offer':
            message = `Nueva oferta: ${notification.data.title}`;
            break;
          case 'new_event':
            message = `Nuevo evento: ${notification.data.title}`;
            break;
          default:
            message = 'Nueva notificación';
        }
        
        toast(message, {
          icon: '🔔',
          duration: 4000,
        });
      });
      
      setUnreadCount(notifications.length);
    }
  }, [notifications, unreadCount]);

  const handleClearAll = () => {
    clearNotifications();
    setUnreadCount(0);
    setIsOpen(false);
  };

  if (!userId) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 dark:bg-red-500 rounded-full">
            {notifications.length}
          </span>
        )}

        {isConnected && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 dark:bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>

          <div className="absolute right-0 z-20 w-80 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notificaciones</h3>
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                >
                  Limpiar todo
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <p className="text-sm">No hay notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.slice().reverse().map((notification, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {notification.type === 'new_message' && (
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400">💬</span>
                            </div>
                          )}
                          {notification.type === 'new_offer' && (
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                              <span className="text-green-600 dark:text-green-400">🛍️</span>
                            </div>
                          )}
                          {notification.type === 'new_event' && (
                            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 dark:text-orange-400">📅</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {notification.type === 'new_message' && (
                            <>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {notification.data.sender.name}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {notification.data.content}
                              </p>
                            </>
                          )}
                          {notification.type === 'new_offer' && (
                            <>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Nueva oferta</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{notification.data.title}</p>
                            </>
                          )}
                          {notification.type === 'new_event' && (
                            <>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Nuevo evento</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{notification.data.title}</p>
                            </>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {new Date(notification.timestamp).toLocaleString('es-ES')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
