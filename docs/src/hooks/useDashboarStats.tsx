import { useMemo } from 'react';
import { useVacancies } from './useVacancies';

export function useDashboardStats(subjectFilter: string = 'all') {
  const { flatResults } = useVacancies();

  return useMemo(() => {
    // 1. Pre-filter the data if a specific subject is selected
    const dataToProcess = subjectFilter !== 'all' 
      ? flatResults.filter(v => v.subjectGroup === subjectFilter)
      : flatResults;

    const zones = dataToProcess.filter(v => v.type === 'Zone');
    const schools = dataToProcess.filter(v => v.type === 'School');

    // Helper to aggregate and sort (descending: highest positive to lowest negative)
    const getSortedAggregation = (data: typeof flatResults, key: 'school' | 'subjectGroup' | 'qzp') => {
      const map: Record<string, number> = {};
      data.forEach(v => {
        const identifier = v[key];
        if (identifier) map[identifier] = (map[identifier] || 0) + v.count;
      });
      return Object.entries(map).sort((a, b) => b[1] - a[1]);
    };

    const sortedSchools = getSortedAggregation(schools, 'school');
    const sortedSchoolSubjects = getSortedAggregation(schools, 'subjectGroup');
    const sortedQzps = getSortedAggregation(zones, 'qzp');
    const sortedZoneSubjects = getSortedAggregation(zones, 'subjectGroup');

    const totalSchoolNeeds = schools.filter(v => v.count > 0).reduce((sum, v) => sum + v.count, 0);
    const totalSchoolSurplus = schools.filter(v => v.count < 0).reduce((sum, v) => sum + v.count, 0);

    return {
      // Totals
      totalZoneVacancies: zones.reduce((sum, v) => sum + v.count, 0),
      totalSchoolNeeds,
      totalSchoolSurplus,
      totalSchoolBalance: totalSchoolNeeds + totalSchoolSurplus,
      activeSchools: new Set(schools.map(s => s.school)).size,

      // Geography (QZPs)
      topQzp: { name: sortedQzps[0]?.[0] || 'N/A', count: sortedQzps[0]?.[1] || 0 },
      bottomQzp: { name: sortedQzps[sortedQzps.length - 1]?.[0] || 'N/A', count: sortedQzps[sortedQzps.length - 1]?.[1] || 0 },

      // Schools (exposed for subject-specific views)
      topSchool: { name: sortedSchools[0]?.[0] || 'N/A', count: sortedSchools[0]?.[1] || 0 },
      bottomSchool: { name: sortedSchools[sortedSchools.length - 1]?.[0] || 'N/A', count: sortedSchools[sortedSchools.length - 1]?.[1] || 0 },

      // Group Analysis (Zone level)
      topSubjectZone: { name: sortedZoneSubjects[0]?.[0] || 'N/A', count: sortedZoneSubjects[0]?.[1] || 0 },
      bottomSubjectZone: { name: sortedZoneSubjects[sortedZoneSubjects.length - 1]?.[0] || 'N/A', count: sortedZoneSubjects[sortedZoneSubjects.length - 1]?.[1] || 0 },

      // Group Analysis (School level)
      schoolSubjectMostVacancies: { name: sortedSchoolSubjects[0]?.[0] || 'N/A', count: sortedSchoolSubjects[0]?.[1] || 0 },
      schoolSubjectMostSurplus: { name: sortedSchoolSubjects[sortedSchoolSubjects.length - 1]?.[0] || 'N/A', count: sortedSchoolSubjects[sortedSchoolSubjects.length - 1]?.[1] || 0 },
    };
  }, [flatResults, subjectFilter]);
}