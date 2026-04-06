import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parseConcelho } from '../utils/formatters';
import type { Vacancy } from './useVacancies';

export function useResultsFilters(flatResults: Vacancy[]) {
  const [searchParams] = useSearchParams();
  const scope = searchParams.get('scope') || 'zone';
  const selectedSubjects = searchParams.getAll('subject');

  // Local Filter States
  const [selectedVacancyTypes, setSelectedVacancyTypes] = useState<string[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedConcelhos, setSelectedConcelhos] = useState<string[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);

  // Search Queries
  const [concelhoQuery, setConcelhoQuery] = useState('');
  const [schoolQuery, setSchoolQuery] = useState('');

  // 1. Baseline filtering
  const baseResults = useMemo(() => {
    return flatResults.filter((vacancy) => {
      const matchesScope = (scope === 'zone' && vacancy.type === 'Zone') || (scope === 'school' && vacancy.type === 'School');
      const matchesSubject = selectedSubjects.length === 0 || selectedSubjects.includes(vacancy.subjectGroup);
      return matchesScope && matchesSubject;
    });
  }, [flatResults, scope, selectedSubjects]);

  // 2. Options for dropdowns
  const availableZones = useMemo(() => Array.from(new Set(baseResults.map(v => v.qzp))).sort(), [baseResults]);
  const availableConcelhos = useMemo(() => Array.from(new Set(baseResults.map(v => parseConcelho(v.concelho)).filter(Boolean))).sort(), [baseResults]);
  const availableSchools = useMemo(() => Array.from(new Set(baseResults.map(v => v.school).filter(Boolean) as string[])).sort(), [baseResults]);

  const filteredConcelhos = availableConcelhos.filter(c => c.toLowerCase().includes(concelhoQuery.toLowerCase()));
  const filteredSchools = availableSchools.filter(s => s.toLowerCase().includes(schoolQuery.toLowerCase()));

  // 3. Final Display Results (Additive OR Logic)
  const displayResults = useMemo(() => {
    return baseResults.filter(v => {
      let matchVacancy = true;
      if (selectedVacancyTypes.length > 0) {
        const type = v.count > 0 ? 'positive' : v.count < 0 ? 'negative' : 'zero';
        matchVacancy = selectedVacancyTypes.includes(type);
      }

      const hasGeoFilters = selectedZones.length > 0 || selectedConcelhos.length > 0 || selectedSchools.length > 0;
      let matchGeo = true;
      
      if (hasGeoFilters) {
        const inZone = selectedZones.includes(v.qzp);
        const inConcelho = v.concelho ? selectedConcelhos.includes(v.concelho) : false;
        const inSchool = v.school ? selectedSchools.includes(v.school) : false;
        matchGeo = inZone || inConcelho || inSchool;
      }
      return matchVacancy && matchGeo;
    });
  }, [baseResults, selectedVacancyTypes, selectedZones, selectedConcelhos, selectedSchools]);

  // Total Vacancies & Animation Highlight
  const totalVacancies = useMemo(() => displayResults.reduce((sum, v) => sum + v.count, 0), [displayResults]);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    setHighlight(true);
    const timer = setTimeout(() => setHighlight(false), 400); 
    return () => clearTimeout(timer);
  }, [displayResults.length, totalVacancies]);

  // Toggle Helpers
  const toggleList = (setter: any, list: string[], item: string) => setter(list.includes(item) ? list.filter((i: string) => i !== item) : [...list, item]);

  return {
    scope,
    selectedSubjects,
    displayResults,
    totalVacancies,
    highlight,
    activeFiltersCount: selectedVacancyTypes.length + selectedZones.length + selectedConcelhos.length + selectedSchools.length,
    
    // UI Filter Data
    availableZones,
    filteredConcelhos,
    filteredSchools,
    concelhoQuery, setConcelhoQuery,
    schoolQuery, setSchoolQuery,
    selectedVacancyTypes, selectedZones, selectedConcelhos, selectedSchools,
    baseResultsCount: baseResults.length,

    // Actions
    toggleVacancyType: (t: string) => toggleList(setSelectedVacancyTypes, selectedVacancyTypes, t),
    toggleZone: (z: string) => toggleList(setSelectedZones, selectedZones, z),
    toggleConcelho: (c: string) => toggleList(setSelectedConcelhos, selectedConcelhos, c),
    toggleSchool: (s: string) => toggleList(setSelectedSchools, selectedSchools, s),
    clearFilters: () => {
      setSelectedVacancyTypes([]); setSelectedZones([]); setSelectedConcelhos([]); setSelectedSchools([]);
      setConcelhoQuery(''); setSchoolQuery('');
    }
  };
}