import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import vacanciesData from '../data/vacancies2026.json';

// Types
export interface Vacancy {
  id: string;
  qzp: string;
  type: 'Zone' | 'School';
  concelho?: string;
  school?: string;
  subjectGroup: string;
  count: number;
}

export interface SubjectOption {
  id: string;
  code: string;
  name: string;
  totalVacancies: number;
  isDisabled: boolean;
}

// Flatten the JSON tree into a list of cards
function flattenData(data: any): Vacancy[] {
  const flatList: Vacancy[] = [];
  let idCounter = 0;

  try {
    for (const [qzp, qzpData] of Object.entries(data || {})) {
      if (!qzpData || typeof qzpData !== 'object') continue;

      for (const [locationKey, locationData] of Object.entries(qzpData)) {
        if (!locationData || typeof locationData !== 'object') continue;

        if (locationKey === 'zone_vacancies') {
          for (const [subjectGroup, count] of Object.entries(locationData)) {
            if (typeof count === 'number') {
              flatList.push({ id: `v-${idCounter++}`, qzp, type: 'Zone', subjectGroup, count });
            }
          }
        } else {
          const concelho = locationKey;
          for (const [school, schoolData] of Object.entries(locationData)) {
            if (schoolData && typeof schoolData === 'object') {
              for (const [subjectGroup, count] of Object.entries(schoolData)) {
                if (typeof count === 'number') {
                  flatList.push({ id: `v-${idCounter++}`, qzp, type: 'School', concelho, school, subjectGroup, count });
                }
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Error flattening data", err);
  }
  
  return flatList;
}

// Context Setup
interface VacancyContextType {
  allVacancies: any;
  filteredVacancies: any;
  setFilteredVacancies: React.Dispatch<React.SetStateAction<any>>;
  flatResults: Vacancy[];
  qzpMunicipalityMap: Record<string, string>;
  getAvailableSubjects: (scope: 'zone' | 'school') => SubjectOption[];
}

const VacancyContext = createContext<VacancyContextType | undefined>(undefined);

export function VacancyProvider({ children }: { children: ReactNode }) {
  const [filteredVacancies, setFilteredVacancies] = useState<any>(vacanciesData);
  const flatResults = useMemo(() => flattenData(filteredVacancies), [filteredVacancies]);
  const qzpMunicipalityMap = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    flatResults.forEach(v => {
      if (!map[v.qzp]) map[v.qzp] = new Set();
      if (v.concelho) map[v.qzp].add(v.concelho.split(' (')[0]); 
    });

    // Convert Sets to pre-formatted strings for easy UI consumption
    const stringMap: Record<string, string> = {};
    for (const key in map) {
      stringMap[key] = Array.from(map[key]).join(', ');
    }
    return stringMap;
  }, [flatResults]);

  const getAvailableSubjects = (scope: 'zone' | 'school'): SubjectOption[] => {
    const subjectTotals = new Map<string, number>();

    for (const qzpData of Object.values(vacanciesData as any)) {
      if (!qzpData || typeof qzpData !== 'object') continue;

      for (const [locationKey, locationData] of Object.entries(qzpData as any)) {
        if (!locationData || typeof locationData !== 'object') continue;

        if (locationKey === 'zone_vacancies') {
          // ONLY count these if the user is looking for 'zone' vacancies
          if (scope === 'zone') {
            for (const [subjectGroup, count] of Object.entries(locationData as any)) {
              const currentTotal = subjectTotals.get(subjectGroup) || 0;
              subjectTotals.set(subjectGroup, currentTotal + (count as number));
            }
          }
        } 
        else {
          // ONLY count these if the user is looking for 'school' vacancies
          if (scope === 'school') {
            for (const schoolData of Object.values(locationData as any)) {
              if (!schoolData || typeof schoolData !== 'object') continue;
              for (const [subjectGroup, count] of Object.entries(schoolData as any)) {
                const currentTotal = subjectTotals.get(subjectGroup) || 0;
                subjectTotals.set(subjectGroup, currentTotal + (count as number));
              }
            }
          }
        }
      }
    }

    return Array.from(subjectTotals.entries()).sort().map(([subjectString, total]) => {
      const [code, ...rest] = subjectString.split(' - ');
      return {
        id: subjectString,
        code: code ? code.trim() : '?',
        name: rest.length > 0 ? rest.join(' - ').trim() : subjectString,
        totalVacancies: total,
        isDisabled: scope === 'zone' ? total <= 0 : total === 0
      };
    });
  };

  const value = {
    allVacancies: vacanciesData,
    filteredVacancies,
    setFilteredVacancies,
    flatResults,
    qzpMunicipalityMap,
    getAvailableSubjects,
  };

  return (
    <VacancyContext.Provider value={value}>
      {children}
    </VacancyContext.Provider>
  );
}

export const useVacancies = () => {
  const context = useContext(VacancyContext);
  if (context === undefined) {
    throw new Error('useVacancies must be used within a VacancyProvider');
  }
  return context;
}