import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Vacancy } from './useVacancies';

interface PreferencesContextType {
  preferences: Vacancy[];
  togglePreference: (vacancy: Vacancy) => void;
  reorderPreferences: (startIndex: number, endIndex: number) => void;
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

  const reorderPreferences = (startIndex: number, endIndex: number) => {
    setPreferences(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  const removePreference = (id: string) => {
    setPreferences(prev => prev.filter(p => p.id !== id));
  };

  return (
    <PreferencesContext.Provider value={{ preferences, togglePreference, reorderPreferences, removePreference }}>
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