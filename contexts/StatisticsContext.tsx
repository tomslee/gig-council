// StatisticsContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { StatisticsByDate } from '@/types/types';

interface StatisticsContextType {
    currentStatistics: StatisticsByDate;
    setCurrentStatistics: (stats: StatisticsByDate) => void;
}

const StatisticsContext = createContext<StatisticsContextType | undefined>(undefined);

export function StatisticsProvider({ children }: { children: React.ReactNode }) {
    const [currentStatistics, setCurrentStatistics] = useState<StatisticsByDate | null>(null);

    return (
        <StatisticsContext.Provider value={{ currentStatistics, setCurrentStatistics }}>
            {children}
        </StatisticsContext.Provider>
    );
}

export function useStatistics() {
    const context = useContext(StatisticsContext);
    if (!context) {
        throw new Error('useStatistics must be used within StatisticsProvider');
    }
    return context;
}