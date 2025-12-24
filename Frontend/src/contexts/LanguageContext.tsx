import react, { createContext, useState, ReactNode } from 'react';
// import { useAuth } from './AuthContext';
// import { useFarm } from './FarmContext';
// import api from '../utils/Api';

interface LanguageContextType {
    language: 'English'|'Swahili';
    setLanguage: (language: 'English'|'Swahili') => void;
}
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
    const context = react.useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<'English'|'Swahili'>(localStorage.getItem('language') === 'Swahili' ? 'Swahili' : 'English');
    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};
export default LanguageContext;