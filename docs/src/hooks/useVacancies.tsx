import { createContext, useContext, useState, type ReactNode } from 'react';
import vacanciesData from '../data/vacancies2026.json';

// 1. Define exactly what a single card will display
export interface Vacancy {
  id: string;
  qzp: string;
  type: 'Zone' | 'School';
  concelho?: string;
  school?: string;
  subjectGroup: string;
  count: number;
}

// 2. Flatten the deeply nested JSON into a simple array
function flattenData(data: any): Vacancy[] {
  const flatList: Vacancy[] = [];
  let idCounter = 0;

  // Loop through QZPs (QZP.01, QZP.02, etc.)
  for (const [qzp, qzpData] of Object.entries(data)) {
    for (const [locationKey, locationData] of Object.entries(qzpData as any)) {
      
      // Handle Zone-wide vacancies (QZP level)
      if (locationKey === 'zone_vacancies') {
        for (const [subjectGroup, count] of Object.entries(locationData as any)) {
          if (count !== 0) { // Ignore 0 counts to keep the UI clean
            flatList.push({
              id: `v-${idCounter++}`,
              qzp,
              type: 'Zone',
              subjectGroup,
              count: count as number
            });
          }
        }
      } 
      // Handle School-specific vacancies
      else {
        const concelho = locationKey;
        for (const [school, schoolData] of Object.entries(locationData as any)) {
          for (const [subjectGroup, count] of Object.entries(schoolData as any)) {
            if (count !== 0) { // Ignore 0 counts
              flatList.push({
                id: `v-${idCounter++}`,
                qzp,
                type: 'School',
                concelho,
                school,
                subjectGroup,
                count: count as number
              });
            }
          }
        }
      }
    }
  }
  return flatList;
}

// Flatten the data exactly once when the app starts
const ALL_VACANCIES = flattenData(vacanciesData);

// 3. Update the Context Type to expect our new flat array
interface VacancyContextType {
  allVacancies: Vacancy[];
  filteredVacancies: Vacancy[];
  setFilteredVacancies: React.Dispatch<React.SetStateAction<Vacancy[]>>;
}

const VacancyContext = createContext<VacancyContextType | undefined>(undefined);

export function VacancyProvider({ children }: { children: ReactNode }) {
  const [filteredVacancies, setFilteredVacancies] = useState<Vacancy[]>(ALL_VACANCIES);

  const value = {
    allVacancies: ALL_VACANCIES,
    filteredVacancies,
    setFilteredVacancies,
  };

  return (
    <VacancyContext.Provider value={value}>
      {children}
    </VacancyContext.Provider>
  );
}

export function useVacancies() {
  const context = useContext(VacancyContext);
  if (context === undefined) {
    throw new Error('useVacancies must be used within a VacancyProvider');
  }
  return context;
}