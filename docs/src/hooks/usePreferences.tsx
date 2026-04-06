import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Vacancy } from './useVacancies';

interface PreferencesContextType {
  preferences: Vacancy[];
  togglePreference: (vacancy: Vacancy) => void;
  toggleMultiplePreferences: (vacancies: Vacancy[]) => void;
  reorderPreferences: (startIndex: number, endIndex: number) => void;
  moveToPosition: (id: string, newPosition: number) => void;
  sortPreferences: (strategy: 'type-zone' | 'type-school' | 'vacancies-desc' | 'vacancies-asc') => void;
  setPreferencesOrder: (orderedVacancies: Vacancy[]) => void; // NEW
  removePreference: (id: string) => void;
  clearPreferences: () => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Vacancy[]>(() => {
    const saved = localStorage.getItem('user_vacancies_prefs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('user_vacancies_prefs', JSON.stringify(preferences));
  }, [preferences]);

  const togglePreference = (vacancy: Vacancy) => {
    setPreferences(prev => {
      const exists = prev.some(p => p.id === vacancy.id);
      if (exists) return prev.filter(p => p.id !== vacancy.id);
      return [...prev, vacancy];
    });
  };

  const toggleMultiplePreferences = (vacancies: Vacancy[]) => {
    setPreferences(prev => {
      const prevIds = new Set(prev.map(p => p.id));
      const inputIds = new Set(vacancies.map(v => v.id));
      
      const isAllSaved = vacancies.length > 0 && vacancies.every(v => prevIds.has(v.id));

      if (isAllSaved) {
        return prev.filter(p => !inputIds.has(p.id));
      } else {
        const toAdd = vacancies.filter(v => !prevIds.has(v.id));
        return [...prev, ...toAdd];
      }
    });
  };

  const reorderPreferences = (startIndex: number, endIndex: number) => {
    setPreferences(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  const moveToPosition = (id: string, targetPosition: number) => {
    setPreferences(prev => {
      const currentIndex = prev.findIndex(p => p.id === id);
      if (currentIndex === -1) return prev;
      const newIndex = Math.max(0, Math.min(targetPosition - 1, prev.length - 1));
      
      const result = Array.from(prev);
      const [removed] = result.splice(currentIndex, 1);
      result.splice(newIndex, 0, removed);
      return result;
    });
  };

  const sortPreferences = (strategy: 'type-zone' | 'type-school' | 'vacancies-desc' | 'vacancies-asc') => {
    setPreferences(prev => {
      const sorted = [...prev];
      if (strategy === 'type-zone') {
        sorted.sort((a, b) => b.type.localeCompare(a.type)); 
      } else if (strategy === 'type-school') {
        sorted.sort((a, b) => a.type.localeCompare(b.type)); 
      } else if (strategy === 'vacancies-desc') {
        sorted.sort((a, b) => b.count - a.count);
      } else if (strategy === 'vacancies-asc') {
        sorted.sort((a, b) => a.count - b.count);
      }
      return sorted;
    });
  };

  // Directly set the array order 
  const setPreferencesOrder = (orderedVacancies: Vacancy[]) => {
    setPreferences(orderedVacancies);
  };

  const removePreference = (id: string) => {
    setPreferences(prev => prev.filter(p => p.id !== id));
  };

  const clearPreferences = () => {
    setPreferences([]);
  };

  const value = {
    preferences,
    togglePreference,
    toggleMultiplePreferences,
    reorderPreferences,
    moveToPosition,
    sortPreferences,
    setPreferencesOrder,
    removePreference,
    clearPreferences
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};