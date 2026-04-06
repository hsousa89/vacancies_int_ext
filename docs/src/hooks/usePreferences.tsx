import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Vacancy } from './useVacancies';

interface PreferencesContextType {
  preferences: Vacancy[];
  togglePreference: (vacancy: Vacancy) => void;
  addMultiplePreferences: (vacancies: Vacancy[]) => void;
  reorderPreferences: (startIndex: number, endIndex: number) => void;
  moveToPosition: (id: string, newPosition: number) => void;
  sortPreferences: (strategy: 'type' | 'vacancies-desc' | 'vacancies-asc') => void;
  removePreference: (id: string) => void;
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

  // 1. Bulk Add (Ignoring duplicates)
  const addMultiplePreferences = (vacancies: Vacancy[]) => {
    setPreferences(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const toAdd = vacancies.filter(v => !existingIds.has(v.id));
      return [...prev, ...toAdd];
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

  // 2. Move to explicitly typed position (1-based index)
  const moveToPosition = (id: string, targetPosition: number) => {
    setPreferences(prev => {
      const currentIndex = prev.findIndex(p => p.id === id);
      if (currentIndex === -1) return prev;

      // Convert from 1-based (user input) to 0-based array index, bounded safely
      const newIndex = Math.max(0, Math.min(targetPosition - 1, prev.length - 1));
      
      const result = Array.from(prev);
      const [removed] = result.splice(currentIndex, 1);
      result.splice(newIndex, 0, removed);
      return result;
    });
  };

  // 3. Automatic Sorting Scenarios
  const sortPreferences = (strategy: 'type' | 'vacancies-desc' | 'vacancies-asc') => {
    setPreferences(prev => {
      const sorted = [...prev];
      if (strategy === 'type') {
        // Sorts Zones first, then Schools
        sorted.sort((a, b) => b.type.localeCompare(a.type)); 
      } else if (strategy === 'vacancies-desc') {
        sorted.sort((a, b) => b.count - a.count);
      } else if (strategy === 'vacancies-asc') {
        sorted.sort((a, b) => a.count - b.count);
      }
      return sorted;
    });
  };

  const removePreference = (id: string) => {
    setPreferences(prev => prev.filter(p => p.id !== id));
  };

  const value = {
    preferences,
    togglePreference,
    addMultiplePreferences,
    reorderPreferences,
    moveToPosition,
    sortPreferences,
    removePreference
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