import react, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/Api';
import { useAuth } from './AuthContext';

interface FarmContextType {
    selectedFarm: any;
    selectFarm: (farm: any) => void;
    farmId: any;
    clearSelectedFarmId: () => void;
    setFarmId: (id: any) => void;
    setSelectedFarm: (farm: any) => void;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const useFarm = () => {
    const context = useContext(FarmContext);
    if (!context) {
        throw new Error('useFarm must be used within a FarmProvider');
    }
    return context;
};

export const FarmProvider = ({ children }: { children: React.ReactNode }) => {
    const [selectedFarm, setSelectedFarm] = useState(null);
    const [selectedFarmId, setSelectedFarmId] = useState(null);
    const [farm, setFarm] = useState(null);
    const [farmId, setFarmId] = useState(null);

    useEffect(() => {
        //load from local storage
        const savedFarm = localStorage.getItem('selectedFarm');
        const savedFarmId = localStorage.getItem('selectedFarmId');

        if (savedFarm) {
            setSelectedFarm(JSON.parse(savedFarm));
        }

        if (savedFarmId && savedFarmId !== 'undefined') {
            setSelectedFarmId(JSON.parse(savedFarmId));
        }
    }, []);
    const selectFarm = (farm: any) => {
        setSelectedFarm(farm);
        setSelectedFarmId(farm._id);

        localStorage.setItem('selectedFarm', JSON.stringify(farm));
        localStorage.setItem('selectedFarmId', JSON.stringify(farm._id));

    }

    const clearSelectedFarmId = () => {
        setFarmId(null);
        setSelectedFarm(null);

        localStorage.removeItem('selectedFarmId');
        localStorage.removeItem('selectedFarm');

    }
    return (
        <FarmContext.Provider value={{ selectedFarm, selectFarm, farmId, clearSelectedFarmId, setFarmId, setSelectedFarm }}>
            {children}
        </FarmContext.Provider>
    );
};
