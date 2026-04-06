import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { FilterOption } from '../components/ui/SearchableFilter';
import { parseConcelho, parseSchool } from '../utils/formatters';
import type { Vacancy } from './useVacancies';

export function useResultsFilters(
  flatResults: Vacancy[],
  getDistance?: (vacancy: Vacancy) => number | null
) {
  const [searchParams] = useSearchParams();
  const scope = searchParams.get('scope') || 'zone';
  const selectedSubjects = searchParams.getAll('subject');

  const [selectedVacancyTypes, setSelectedVacancyTypes] = useState<string[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  

  const [selectedConcelhos, setSelectedConcelhos] = useState<string[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [concelhoQuery, setConcelhoQuery] = useState('');
  const [schoolQuery, setSchoolQuery] = useState('');

  const baseResults = useMemo(() => {
    return flatResults.filter((vacancy) => {
      const matchesScope = (scope === 'zone' && vacancy.type === 'Zone') || (scope === 'school' && vacancy.type === 'School');
      const matchesSubject = selectedSubjects.length === 0 || selectedSubjects.includes(vacancy.subjectGroup);
      return matchesScope && matchesSubject;
    });
  }, [flatResults, scope, selectedSubjects]);

  const availableZones = useMemo(() => Array.from(new Set(baseResults.map(v => v.qzp))).sort(), [baseResults]);

  // Generate robust { id: code, label: name } arrays
  const availableConcelhos = useMemo<FilterOption[]>(() => {
    const map = new Map<string, string>();
    baseResults.forEach(v => {
      if (!v.concelho) return;
      const parsed = parseConcelho(v.concelho);
      if (parsed?.code && parsed?.name) map.set(parsed.code, parsed.name);
    });
    return Array.from(map.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [baseResults]);

  const availableSchools = useMemo<FilterOption[]>(() => {
    const map = new Map<string, string>();
    baseResults.forEach(v => {
      if (!v.school) return;
      const parsed = parseSchool(v.school);
      if (parsed?.code && parsed?.name) map.set(parsed.code, parsed.name);
    });
    return Array.from(map.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [baseResults]);

  // Filter based on the label, but keep the structure intact
  const filteredConcelhos = availableConcelhos.filter(c => c.label.toLowerCase().includes(concelhoQuery.toLowerCase()));
  const filteredSchools = availableSchools.filter(s => s.label.toLowerCase().includes(schoolQuery.toLowerCase()));

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
        
        const concelhoCode = v.concelho ? parseConcelho(v.concelho)?.code : null;
        const schoolCode = v.school ? parseSchool(v.school)?.code : null;
        
        const inConcelho = concelhoCode ? selectedConcelhos.includes(concelhoCode) : false;
        const inSchool = schoolCode ? selectedSchools.includes(schoolCode) : false;
        
        matchGeo = inZone || inConcelho || inSchool;
      }

      let matchDistance = true;
      if (maxDistance !== null && getDistance) {
        const dist = getDistance(v);
        matchDistance = dist !== null && dist <= maxDistance; 
      }

      return matchVacancy && matchGeo && matchDistance;
    });
  }, [baseResults, selectedVacancyTypes, selectedZones, selectedConcelhos, selectedSchools, maxDistance, getDistance]);

  const totalVacancies = useMemo(() => displayResults.reduce((sum, v) => sum + v.count, 0), [displayResults]);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    setHighlight(true);
    const timer = setTimeout(() => setHighlight(false), 400); 
    return () => clearTimeout(timer);
  }, [displayResults.length, totalVacancies]);

  const toggleList = (setter: any, list: string[], item: string) => setter(list.includes(item) ? list.filter((i: string) => i !== item) : [...list, item]);

  return {
    scope,
    selectedSubjects,
    displayResults,
    totalVacancies,
    highlight,
    activeFiltersCount: selectedVacancyTypes.length + selectedZones.length + selectedConcelhos.length + selectedSchools.length + (maxDistance !== null ? 1 : 0),
    
    availableZones,
    filteredConcelhos,
    filteredSchools,  
    
    concelhoQuery, setConcelhoQuery,
    schoolQuery, setSchoolQuery,
    selectedVacancyTypes, selectedZones, selectedConcelhos, selectedSchools,
    baseResultsCount: baseResults.length,
    
    maxDistance, setMaxDistance,

    toggleVacancyType: (t: string) => toggleList(setSelectedVacancyTypes, selectedVacancyTypes, t),
    toggleZone: (z: string) => toggleList(setSelectedZones, selectedZones, z),
    toggleConcelho: (c: string) => toggleList(setSelectedConcelhos, selectedConcelhos, c),
    toggleSchool: (s: string) => toggleList(setSelectedSchools, selectedSchools, s),
    clearFilters: () => {
      setSelectedVacancyTypes([]); setSelectedZones([]); setSelectedConcelhos([]); setSelectedSchools([]);
      setConcelhoQuery(''); setSchoolQuery(''); setMaxDistance(null);
    }
  };
}