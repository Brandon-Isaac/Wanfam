import react, { createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useFarm } from './FarmContext';
import api from '../utils/Api';

interface NotificationContextType {
    notifications: any[];
    fetchNotifications: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    unreadCount: number;
}
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = react.useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const { user } = useAuth();
    const { selectedFarm } = useFarm();
    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        if (user && selectedFarm) {
            fetchNotifications();
        }   
    }, [user, selectedFarm]);

    const fetchNotifications = async () => {
        try {
            const response = await api.get(`/notifications?farmId=${selectedFarm.id}`);
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };  
    const markAsRead = async (notificationId: string) => {
        try {
            await api.post(`/notifications/${notificationId}/read`);    
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };
    return (
        <NotificationContext.Provider value={{ notifications, fetchNotifications, markAsRead, unreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
}
export default NotificationContext;
