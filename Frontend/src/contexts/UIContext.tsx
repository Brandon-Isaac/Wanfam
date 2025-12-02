import react, { createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useFarm } from './FarmContext';

interface UIContextType {
    sidebarOpen: boolean;
    toggleSidebar: () => void;
    closeSidebar: () => void;
    openSidebar: () => void;
    isMobile: boolean;
    setIsMobile: (isMobile: boolean) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    alert: { type: 'success' | 'error' | 'info'; message: string } | null;
    setAlert: (alert: { type: 'success' | 'error' | 'info'; message: string } | null) => void;
    confirm: { message: string; onConfirm: () => void; onCancel?: () => void } | null;
    setConfirm: (confirm: { message: string; onConfirm: () => void; onCancel?: () => void } | null) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
    const context = react.useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};
export const UIProvider = ({ children }: { children: ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>(localStorage.getItem('theme') === 'dark' ? 'dark' : 'light');
    const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
    const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void; onCancel?: () => void } | null>(null);
    const { user } = useAuth();
    const { selectedFarm } = useFarm();
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const closeSidebar = () => setSidebarOpen(false);
    const openSidebar = () => setSidebarOpen(true);
    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
    return (
        <UIContext.Provider value={{ sidebarOpen, toggleSidebar, closeSidebar, openSidebar, isMobile, setIsMobile, loading, setLoading, theme, toggleTheme, alert, setAlert, confirm, setConfirm }}>
            {children}
        </UIContext.Provider>
    );
}

export default UIContext;