// src/hooks/useVacancies.ts
import vacancyDataRaw from '../data/vacancies2026.json';
import type { VacancyDatabase } from '../types';

// Cast the raw JSON to our TypeScript interface
const db = vacancyDataRaw as unknown as VacancyDatabase;

export function useVacancies() {
  // 1. Get a list of all unique subjects to populate your filter buttons dynamically
  const getAvailableSubjects = () => {
    // We can just look at QZP.01's zone_vacancies to get all subject keys
    const firstQZP = Object.values(db)[0];
    if (!firstQZP) return [];
    
    return Object.keys(firstQZP.zone_vacancies).map(subject => {
      // e.g., "500 - Matemática" -> { id: "500 - Matemática", code: "500", name: "Matemática" }
      const [code, ...nameParts] = subject.split(' - ');
      return {
        id: subject,
        code: code.trim(),
        name: nameParts.join(' - ').trim()
      };
    });
  };

  // 2. Query Macro (Zone) Vacancies
  const getZoneVacancies = (selectedSubjects: string[]) => {
    const results: Array<{ qzp: string; totals: Record<string, number> }> = [];
    
    for (const [qzp, data] of Object.entries(db)) {
      const totals: Record<string, number> = {};
      selectedSubjects.forEach(sub => {
        totals[sub] = data.zone_vacancies[sub] || 0;
      });
      results.push({ qzp, totals });
    }
    return results;
  };

  // 3. Query Micro (School) Vacancies
  const getSchoolVacancies = (selectedSubjects: string[]) => {
    const results: Array<{ qzp: string; municipality: string; school: string; vacancies: Record<string, number> }> = [];
    
    for (const [qzp, data] of Object.entries(db)) {
      for (const [muniOrZone, muniData] of Object.entries(data)) {
        if (muniOrZone === 'zone_vacancies') continue;
        
        // Iterate through schools in the municipality
        const schools = muniData as Record<string, Record<string, number>>;
        for (const [schoolName, subjects] of Object.entries(schools)) {
          
          const relevantVacancies: Record<string, number> = {};
          let hasAnyMatch = false;

          selectedSubjects.forEach(sub => {
            const count = subjects[sub] || 0;
            relevantVacancies[sub] = count;
            if (count !== 0) hasAnyMatch = true; 
          });

          // Only return schools that actually have non-zero values for the selected subjects
          if (hasAnyMatch) {
            results.push({
              qzp,
              municipality: muniOrZone,
              school: schoolName,
              vacancies: relevantVacancies
            });
          }
        }
      }
    }
    return results;
  };

  return {
    getAvailableSubjects,
    getZoneVacancies,
    getSchoolVacancies
  };
}