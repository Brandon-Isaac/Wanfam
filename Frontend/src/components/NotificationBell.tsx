import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/Api';

interface Notification {
  _id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    // Listen for custom refresh events
    const handleRefresh = () => fetchNotifications();
    window.addEventListener('refreshNotifications', handleRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshNotifications', handleRefresh);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications', {
        params: { limit: 10 }
      });
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      // Silently handle notification fetch errors
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      // Silently handle mark as read errors
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      await api.put('/notifications/read-all');
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      // Silently handle mark all as read errors
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconMap: { [key: string]: { icon: string; color: string } } = {
      task: { icon: 'fa-tasks', color: 'text-blue-600' },
      treatment: { icon: 'fa-briefcase-medical', color: 'text-green-600' },
      health_record: { icon: 'fa-heartbeat', color: 'text-red-600' },
      animal_registration: { icon: 'fa-cow', color: 'text-green-600' },
      loan_approval: { icon: 'fa-check-circle', color: 'text-green-600' },
      loan_request: { icon: 'fa-file-invoice-dollar', color: 'text-blue-600' },
      loan_rejection: { icon: 'fa-times-circle', color: 'text-red-600' },
      revenue: { icon: 'fa-money-bill-wave', color: 'text-green-600' },
      expense: { icon: 'fa-receipt', color: 'text-orange-600' },
      vaccination: { icon: 'fa-syringe', color: 'text-purple-600' },
      checkup_reminder: { icon: 'fa-stethoscope', color: 'text-blue-600' },
      warning: { icon: 'fa-exclamation-triangle', color: 'text-yellow-600' },
      alert: { icon: 'fa-exclamation-circle', color: 'text-red-600' },
      success: { icon: 'fa-check-circle', color: 'text-green-600' },
      info: { icon: 'fa-info-circle', color: 'text-blue-600' },
    };

    return iconMap[type] || iconMap.info;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-full"
      >
        <i className="fas fa-bell text-xl"></i>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="text-xs text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Marking...' : 'Mark all read'}
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <i className="fas fa-bell-slash text-4xl text-gray-300 mb-2"></i>
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const { icon, color } = getNotificationIcon(notification.type);
                  return (
                    <div
                      key={notification._id}
                      onClick={() => !notification.isRead && markAsRead(notification._id)}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 ${color} mt-1`}>
                          <i className={`fas ${icon}`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 text-center">
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
