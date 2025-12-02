import react, { createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useFarm } from './FarmContext';
import { NotificationProvider } from './NotificationContext';
import { LanguageProvider } from './LanguageContext';
import { UIProvider } from './UIContext';
import { AuthProvider } from './AuthContext';
import { FarmProvider } from './FarmContext';

export const AppProvider = ({ children }: { children: ReactNode }) => {
    return (
        <AuthProvider>
            <FarmProvider>
                <NotificationProvider>
                    <LanguageProvider>
                        <UIProvider>
                            {children}
                        </UIProvider>
                    </LanguageProvider>
                </NotificationProvider>
            </FarmProvider>
        </AuthProvider>
    );
};
export default AppProvider;