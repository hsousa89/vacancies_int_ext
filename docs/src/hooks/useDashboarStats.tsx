import { useMemo } from 'react';
import { useVacancies } from './useVacancies';

export function useDashboardStats() {
  const { flatResults } = useVacancies();

  return useMemo(() => {
    // Segregate Data
    const zones = flatResults.filter(v => v.type === 'Zone');
    const schools = flatResults.filter(v => v.type === 'School');

    // Helper for subject aggregation
    const aggregateBySubject = (data: typeof zones) => {
      const map: Record<string, number> = {};
      data.forEach(v => {
        map[v.subjectGroup] = (map[v.subjectGroup] || 0) + v.count;
      });
      return Object.entries(map).sort((a, b) => b[1] - a[1]);
    };

    const zoneStats = {
      totalNet: zones.reduce((s, v) => s + v.count, 0),
      topSubjects: aggregateBySubject(zones).slice(0, 5),
      // At Zone level, usually there are no negatives in this dataset
    };

    const schoolStats = {
      totalNet: schools.reduce((s, v) => s + v.count, 0),
      grossVacancies: schools.filter(v => v.count > 0).reduce((s, v) => s + v.count, 0),
      grossSurplus: schools.filter(v => v.count < 0).reduce((s, v) => s + v.count, 0),
      topDeficits: aggregateBySubject(schools).reverse().slice(0, 5),
      topSurplus: aggregateBySubject(schools).slice(0, 5),
    };

    return { zoneStats, schoolStats };
  }, [flatResults]);
}