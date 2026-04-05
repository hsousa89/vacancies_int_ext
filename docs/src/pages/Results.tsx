import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SearchableFilter } from '../components/ui/SearchableFilter';
import { VacancyCard } from '../components/ui/VacancyCard';
import { useVacancies } from '../hooks/useVacancies';

export function Results() {
  const { flatResults } = useVacancies();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL State
  const scope = searchParams.get('scope') || 'zone';
  const selectedSubjects = searchParams.getAll('subject');

  // Local Filter States
  const [selectedVacancyTypes, setSelectedVacancyTypes] = useState<string[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedConcelhos, setSelectedConcelhos] = useState<string[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);

  // Local Search States
  const [concelhoQuery, setConcelhoQuery] = useState('');
  const [schoolQuery, setSchoolQuery] = useState('');

  // 1. Get baseline results
  const baseResults = useMemo(() => {
    return flatResults.filter((vacancy) => {
      const matchesScope = (scope === 'zone' && vacancy.type === 'Zone') || (scope === 'school' && vacancy.type === 'School');
      const matchesSubject = selectedSubjects.length === 0 || selectedSubjects.includes(vacancy.subjectGroup);
      return matchesScope && matchesSubject;
    });
  }, [flatResults, scope, selectedSubjects]);

  // 2. Extract options for menus
  const availableZones = useMemo(() => Array.from(new Set(baseResults.map(v => v.qzp))).sort(), [baseResults]);
  const availableConcelhos = useMemo(() => Array.from(new Set(baseResults.map(v => v.concelho).filter(Boolean) as string[])).sort(), [baseResults]);
  const availableSchools = useMemo(() => Array.from(new Set(baseResults.map(v => v.school).filter(Boolean) as string[])).sort(), [baseResults]);

  // 3. Map Municipalities to QZPs
  const qzpMunicipalityMap = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    flatResults.forEach(v => {
      if (!map[v.qzp]) map[v.qzp] = new Set();
      if (v.concelho) map[v.qzp].add(v.concelho.split(' (')[0]); 
    });
    return map;
  }, [flatResults]);

  // Apply search text
  const filteredConcelhos = availableConcelhos.filter(c => c.toLowerCase().includes(concelhoQuery.toLowerCase()));
  const filteredSchools = availableSchools.filter(s => s.toLowerCase().includes(schoolQuery.toLowerCase()));

  // 4. Final display results (WITH ADDITIVE "OR" LOGIC)
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

  // Total Vacancies & Animation
  const totalVacancies = useMemo(() => {
    return displayResults.reduce((sum, v) => sum + v.count, 0);
  }, [displayResults]);

  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    setHighlight(true);
    const timer = setTimeout(() => setHighlight(false), 400); 
    return () => clearTimeout(timer);
  }, [displayResults.length, totalVacancies]);

  // --- NEW: DYNAMIC COLOR LOGIC FOR THE BADGE ---
  let badgeColorClass = '';
  if (totalVacancies > 0) {
    badgeColorClass = highlight 
      ? 'bg-emerald-200 text-emerald-900 scale-110 shadow-sm decoration-emerald-400' 
      : 'bg-emerald-50 text-emerald-700 scale-100 decoration-emerald-400';
  } else if (totalVacancies < 0) {
    badgeColorClass = highlight 
      ? 'bg-rose-200 text-rose-900 scale-110 shadow-sm decoration-rose-400' 
      : 'bg-rose-50 text-rose-700 scale-100 decoration-rose-400';
  } else {
    badgeColorClass = highlight 
      ? 'bg-slate-300 text-slate-900 scale-110 shadow-sm decoration-slate-400' 
      : 'bg-slate-100 text-slate-600 scale-100 decoration-slate-300';
  }

  // Helpers
  const toggleState = (setter: React.Dispatch<React.SetStateAction<string[]>>, current: string[], value: string) => {
    setter(current.includes(value) ? current.filter(i => i !== value) : [...current, value]);
  };

  const clearFilters = () => {
    setSelectedVacancyTypes([]); setSelectedZones([]); setSelectedConcelhos([]); setSelectedSchools([]);
    setConcelhoQuery(''); setSchoolQuery('');
  };

  const activeFiltersCount = selectedVacancyTypes.length + selectedZones.length + selectedConcelhos.length + selectedSchools.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-headline font-bold text-slate-900">Resultados</h2>
          
          <div className="text-slate-500 flex items-center flex-wrap gap-1.5 mt-1">
            Encontradas
            <span 
              key={`${displayResults.length}-${totalVacancies}`} 
              className={`inline-flex items-center justify-center px-2 py-0.5 rounded font-bold text-sm transition-all duration-300 animate-in zoom-in-75 underline decoration-2 underline-offset-2 ${badgeColorClass}`}
            >
              {totalVacancies > 0 ? '+' : ''}{totalVacancies} vagas
            </span>
            em {displayResults.length} registos.
          </div>
        </div>
        
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </div>

      {selectedSubjects.length === 0 && (
        <div className="p-6 bg-blue-50 text-blue-800 rounded-xl border border-blue-100 text-center">
          <span className="material-symbols-outlined text-4xl mb-2 opacity-50">info</span>
          <p className="font-medium">Nenhum grupo de recrutamento selecionado.</p>
        </div>
      )}

      {/* FILTER ACCORDION */}
      {selectedSubjects.length > 0 && baseResults.length > 0 && (
        <details className="bg-white rounded-xl border border-slate-200 shadow-sm mb-2 group">
          <summary className="p-4 font-semibold text-slate-800 cursor-pointer flex justify-between items-center list-none">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined">filter_list</span>
              Filtros Avançados {activeFiltersCount > 0 && <span className="bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full">{activeFiltersCount}</span>}
            </span>
            <span className="material-symbols-outlined transition-transform group-open:rotate-180 text-slate-400">expand_more</span>
          </summary>
          
          <div className="p-4 border-t border-slate-100 flex flex-col gap-6">
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-2">Disponibilidade</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'positive', label: 'Com vagas (+)', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
                  { id: 'zero', label: 'Sem vagas (0)', cls: 'bg-slate-200 text-slate-800 border-slate-300' },
                  { id: 'negative', label: 'Negativas (-)', cls: 'bg-rose-100 text-rose-800 border-rose-200' }
                ].map(type => (
                  <button key={type.id} onClick={() => toggleState(setSelectedVacancyTypes, selectedVacancyTypes, type.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedVacancyTypes.includes(type.id) ? type.cls : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-2">Zonas (QZP)</h4>
              <div className="flex flex-wrap gap-2">
                {availableZones.map(zone => (
                  <button key={zone} onClick={() => toggleState(setSelectedZones, selectedZones, zone)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedZones.includes(zone) ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'}`}>
                    {zone}
                  </button>
                ))}
              </div>
            </div>

            {scope === 'school' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SearchableFilter title="Concelhos" placeholder="Pesquisar concelho..." query={concelhoQuery} onQueryChange={setConcelhoQuery} items={filteredConcelhos} selectedItems={selectedConcelhos} onToggle={(item) => toggleState(setSelectedConcelhos, selectedConcelhos, item)} emptyMessage="Nenhum concelho encontrado." />
                <SearchableFilter title="Escolas" placeholder="Pesquisar escola..." query={schoolQuery} onQueryChange={setSchoolQuery} items={filteredSchools} selectedItems={selectedSchools} onToggle={(item) => toggleState(setSelectedSchools, selectedSchools, item)} emptyMessage="Nenhuma escola encontrada." />
              </div>
            )}

            {activeFiltersCount > 0 && (
              <div className="flex justify-end pt-2">
                <button onClick={clearFilters} className="text-sm text-rose-600 font-medium hover:text-rose-700 underline">Limpar todos os filtros</button>
              </div>
            )}
          </div>
        </details>
      )}

      {/* RESULTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
        {displayResults.map((vacancy) => (
          <VacancyCard 
            key={vacancy.id} 
            vacancy={vacancy} 
            municipalitiesList={Array.from(qzpMunicipalityMap[vacancy.qzp] || []).join(', ')} 
          />
        ))}
      </div>
    </div>
  );
}