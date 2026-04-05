import { useMemo } from 'react';
import { useVacancies } from './useVacancies';

export function useDashboardStats() {
  const { flatResults } = useVacancies();

  return useMemo(() => {
    const zones = flatResults.filter(v => v.type === 'Zone');
    const schools = flatResults.filter(v => v.type === 'School');

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
      topQzp: { name: sortedQzps[0]?.[0], count: sortedQzps[0]?.[1] },
      bottomQzp: { name: sortedQzps[sortedQzps.length - 1]?.[0], count: sortedQzps[sortedQzps.length - 1]?.[1] },

      // Group Analysis (Zone level)
      topSubjectZone: { name: sortedZoneSubjects[0]?.[0], count: sortedZoneSubjects[0]?.[1] },
      bottomSubjectZone: { name: sortedZoneSubjects[sortedZoneSubjects.length - 1]?.[0], count: sortedZoneSubjects[sortedZoneSubjects.length - 1]?.[1] },

      // Group Analysis (School level)
      schoolSubjectMostVacancies: { name: sortedSchoolSubjects[0]?.[0], count: sortedSchoolSubjects[0]?.[1] },
      schoolSubjectMostSurplus: { name: sortedSchoolSubjects[sortedSchoolSubjects.length - 1]?.[0], count: sortedSchoolSubjects[sortedSchoolSubjects.length - 1]?.[1] },

      // Specific School Leaders
      schoolMostVacancies: { name: sortedSchools[0]?.[0], count: sortedSchools[0]?.[1] },
      schoolMostSurplus: { name: sortedSchools[sortedSchools.length - 1]?.[0], count: sortedSchools[sortedSchools.length - 1]?.[1] },
    };
  }, [flatResults]);
}