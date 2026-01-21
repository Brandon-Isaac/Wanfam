import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const NotificationList = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, typeFilter, notifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications', {
        params: { limit: 100 }
      });
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...notifications];

    // Apply read/unread filter
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter);
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconMap: { [key: string]: { icon: string; color: string; bgColor: string } } = {
      task: { icon: 'fa-tasks', color: 'text-blue-600', bgColor: 'bg-blue-50' },
      treatment: { icon: 'fa-briefcase-medical', color: 'text-green-600', bgColor: 'bg-green-50' },
      health_record: { icon: 'fa-heartbeat', color: 'text-red-600', bgColor: 'bg-red-50' },
      animal_registration: { icon: 'fa-cow', color: 'text-green-600', bgColor: 'bg-green-50' },
      loan_approval: { icon: 'fa-check-circle', color: 'text-green-600', bgColor: 'bg-green-50' },
      loan_request: { icon: 'fa-file-invoice-dollar', color: 'text-blue-600', bgColor: 'bg-blue-50' },
      loan_rejection: { icon: 'fa-times-circle', color: 'text-red-600', bgColor: 'bg-red-50' },
      revenue: { icon: 'fa-money-bill-wave', color: 'text-green-600', bgColor: 'bg-green-50' },
      expense: { icon: 'fa-receipt', color: 'text-orange-600', bgColor: 'bg-orange-50' },
      vaccination: { icon: 'fa-syringe', color: 'text-purple-600', bgColor: 'bg-purple-50' },
      checkup_reminder: { icon: 'fa-stethoscope', color: 'text-blue-600', bgColor: 'bg-blue-50' },
      warning: { icon: 'fa-exclamation-triangle', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
      alert: { icon: 'fa-exclamation-circle', color: 'text-red-600', bgColor: 'bg-red-50' },
      success: { icon: 'fa-check-circle', color: 'text-green-600', bgColor: 'bg-green-50' },
      info: { icon: 'fa-info-circle', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    };

    return iconMap[type] || iconMap.info;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const notificationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'task', label: 'Tasks' },
    { value: 'treatment', label: 'Treatments' },
    { value: 'health_record', label: 'Health Records' },
    { value: 'animal_registration', label: 'Animal Registration' },
    { value: 'loan_approval', label: 'Loan Approvals' },
    { value: 'loan_request', label: 'Loan Requests' },
    { value: 'loan_rejection', label: 'Loan Rejections' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'expense', label: 'Expenses' },
    { value: 'vaccination', label: 'Vaccinations' },
    { value: 'checkup_reminder', label: 'Checkup Reminders' },
    { value: 'warning', label: 'Warnings' },
    { value: 'alert', label: 'Alerts' },
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Read/Unread Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      filter === 'all'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      filter === 'unread'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                  <button
                    onClick={() => setFilter('read')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      filter === 'read'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Read ({notifications.length - unreadCount})
                  </button>
                </div>
              </div>

              {/* Type Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {notificationTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-end">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 whitespace-nowrap"
                  >
                    <i className="fas fa-check-double mr-2"></i>
                    Mark all read
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notification List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <i className="fas fa-bell-slash text-5xl text-gray-300 mb-4"></i>
              <p className="text-lg font-medium text-gray-900 mb-2">No notifications found</p>
              <p className="text-sm text-gray-500">
                {filter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'You\'re all caught up!'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const { icon, color, bgColor } = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification._id}
                  className={`bg-white rounded-lg shadow-sm border ${
                    !notification.isRead ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                  } p-5 hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}>
                      <i className={`fas ${icon} ${color}`}></i>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-gray-500">
                              <i className="far fa-clock mr-1"></i>
                              {formatDateTime(notification.createdAt)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              notification.isRead
                                ? 'bg-gray-100 text-gray-600'
                                : 'bg-blue-100 text-blue-700 font-medium'
                            }`}>
                              {notification.isRead ? 'Read' : 'Unread'}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-4">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Empty State for Filtered Results */}
        {filteredNotifications.length === 0 && notifications.length > 0 && (
          <div className="text-center mt-6">
            <button
              onClick={() => {
                setFilter('all');
                setTypeFilter('all');
              }}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;
