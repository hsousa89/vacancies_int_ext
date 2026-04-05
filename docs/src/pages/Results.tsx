import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useVacancies } from '../hooks/useVacancies';

export function Results() {
  const { flatResults } = useVacancies();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL State
  const scope = searchParams.get('scope') || 'zone';
  const selectedSubjects = searchParams.getAll('subject');

  // Local Filter States
  const [selectedVacancyTypes, setSelectedVacancyTypes] = useState<string[]>([]); // NEW!
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedConcelhos, setSelectedConcelhos] = useState<string[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);

  // Local Search States
  const [concelhoQuery, setConcelhoQuery] = useState('');
  const [schoolQuery, setSchoolQuery] = useState('');

  // Get baseline results based on URL
  const baseResults = useMemo(() => {
    return flatResults.filter((vacancy) => {
      const matchesScope = 
        (scope === 'zone' && vacancy.type === 'Zone') || 
        (scope === 'school' && vacancy.type === 'School');
      
      const matchesSubject = selectedSubjects.length === 0 || selectedSubjects.includes(vacancy.subjectGroup);

      return matchesScope && matchesSubject;
    });
  }, [flatResults, scope, selectedSubjects]);

  // Extract unique options for filter menus
  const availableZones = useMemo(() => Array.from(new Set(baseResults.map(v => v.qzp))).sort(), [baseResults]);
  const availableConcelhos = useMemo(() => Array.from(new Set(baseResults.map(v => v.concelho).filter(Boolean) as string[])).sort(), [baseResults]);
  const availableSchools = useMemo(() => Array.from(new Set(baseResults.map(v => v.school).filter(Boolean) as string[])).sort(), [baseResults]);

  // Map out which Municipalities belong to which QZP for the badges
  const qzpMunicipalityMap = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    flatResults.forEach(v => {
      if (!map[v.qzp]) map[v.qzp] = new Set();
      if (v.concelho) map[v.qzp].add(v.concelho.split(' (')[0]); 
    });
    return map;
  }, [flatResults]);

  // Apply search text to checkbox lists
  const filteredConcelhos = availableConcelhos.filter(c => c.toLowerCase().includes(concelhoQuery.toLowerCase()));
  const filteredSchools = availableSchools.filter(s => s.toLowerCase().includes(schoolQuery.toLowerCase()));

  // Apply final filters to display cards
  const displayResults = useMemo(() => {
    return baseResults.filter(v => {
      // 1. Vacancy Type Check (Positive, Negative, Zero)
      let matchVacancy = true;
      if (selectedVacancyTypes.length > 0) {
        const type = v.count > 0 ? 'positive' : v.count < 0 ? 'negative' : 'zero';
        matchVacancy = selectedVacancyTypes.includes(type);
      }

      // 2. Geography Checks
      const matchZone = selectedZones.length === 0 || selectedZones.includes(v.qzp);
      const matchConcelho = selectedConcelhos.length === 0 || (v.concelho && selectedConcelhos.includes(v.concelho));
      const matchSchool = selectedSchools.length === 0 || (v.school && selectedSchools.includes(v.school));
      
      return matchVacancy && matchZone && matchConcelho && matchSchool;
    });
  }, [baseResults, selectedVacancyTypes, selectedZones, selectedConcelhos, selectedSchools]);

  // Helpers
  const toggleSelection = (setter: React.Dispatch<React.SetStateAction<string[]>>, current: string[], value: string) => {
    if (current.includes(value)) setter(current.filter(item => item !== value));
    else setter([...current, value]);
  };

  const clearFilters = () => {
    setSelectedVacancyTypes([]);
    setSelectedZones([]);
    setSelectedConcelhos([]);
    setSelectedSchools([]);
    setConcelhoQuery('');
    setSchoolQuery('');
  };

  // Calculate total active filters for the notification badge
  const activeFiltersCount = selectedVacancyTypes.length + selectedZones.length + selectedConcelhos.length + selectedSchools.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-headline font-bold text-slate-900">
            Resultados
          </h2>
          <p className="text-slate-500">
            Encontrados {displayResults.length} registos correspondentes.
          </p>
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
              Filtros Avançados {activeFiltersCount > 0 && 
                <span className="bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              }
            </span>
            <span className="material-symbols-outlined transition-transform group-open:rotate-180 text-slate-400">expand_more</span>
          </summary>
          
          <div className="p-4 border-t border-slate-100 flex flex-col gap-6">
            
            {/* NEW: Vacancy Type Filter */}
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-2">Disponibilidade</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'positive', label: 'Com vagas (+)', activeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
                  { id: 'zero', label: 'Sem vagas (0)', activeClass: 'bg-slate-200 text-slate-800 border-slate-300' },
                  { id: 'negative', label: 'Negativas (-)', activeClass: 'bg-rose-100 text-rose-800 border-rose-200' }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => toggleSelection(setSelectedVacancyTypes, selectedVacancyTypes, type.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      selectedVacancyTypes.includes(type.id) 
                        ? type.activeClass 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Existing: Zones */}
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-2">Zonas (QZP)</h4>
              <div className="flex flex-wrap gap-2">
                {availableZones.map(zone => (
                  <button
                    key={zone}
                    onClick={() => toggleSelection(setSelectedZones, selectedZones, zone)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      selectedZones.includes(zone) ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {zone}
                  </button>
                ))}
              </div>
            </div>

            {scope === 'school' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-bold text-slate-700">Concelhos</h4>
                  <input type="text" placeholder="Pesquisar concelho..." value={concelhoQuery} onChange={(e) => setConcelhoQuery(e.target.value)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <div className="max-h-48 overflow-y-auto bg-slate-50 border border-slate-200 rounded-lg p-2 flex flex-col gap-1">
                    {filteredConcelhos.length > 0 ? filteredConcelhos.map(concelho => (
                      <label key={concelho} className="flex items-center gap-2 text-sm text-slate-700 p-1.5 hover:bg-slate-200 rounded cursor-pointer">
                        <input type="checkbox" checked={selectedConcelhos.includes(concelho)} onChange={() => toggleSelection(setSelectedConcelhos, selectedConcelhos, concelho)} className="rounded border-slate-300 w-4 h-4" />
                        {concelho}
                      </label>
                    )) : <p className="text-sm text-slate-400 p-2">Nenhum concelho encontrado.</p>}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-bold text-slate-700">Escolas</h4>
                  <input type="text" placeholder="Pesquisar escola..." value={schoolQuery} onChange={(e) => setSchoolQuery(e.target.value)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <div className="max-h-48 overflow-y-auto bg-slate-50 border border-slate-200 rounded-lg p-2 flex flex-col gap-1">
                    {filteredSchools.length > 0 ? filteredSchools.map(school => (
                      <label key={school} className="flex items-center gap-2 text-sm text-slate-700 p-1.5 hover:bg-slate-200 rounded cursor-pointer">
                        <input type="checkbox" checked={selectedSchools.includes(school)} onChange={() => toggleSelection(setSelectedSchools, selectedSchools, school)} className="rounded border-slate-300 w-4 h-4 flex-shrink-0" />
                        <span className="truncate" title={school}>{school}</span>
                      </label>
                    )) : <p className="text-sm text-slate-400 p-2">Nenhuma escola encontrada.</p>}
                  </div>
                </div>
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
        {displayResults.map((vacancy) => {
          const municipalitiesList = Array.from(qzpMunicipalityMap[vacancy.qzp] || []).join(', ');

          return (
            <div key={vacancy.id} className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
              
              <div className="flex justify-between items-start gap-2 mb-3">
                <div className="flex-1 flex flex-col bg-blue-50 px-2.5 py-1.5 rounded-md min-w-0" title={`${vacancy.qzp}: ${municipalitiesList}`}>
                  <span className="text-xs font-bold text-blue-800">{vacancy.qzp}</span>
                  <span className="text-[10px] text-blue-600/80 truncate">
                    {municipalitiesList || 'Sem concelhos'}
                  </span>
                </div>

                <span className={`text-sm font-bold px-2.5 py-1.5 rounded-md whitespace-nowrap flex-shrink-0 ${
                    vacancy.count > 0 ? 'bg-emerald-50 text-emerald-700' : 
                    vacancy.count < 0 ? 'bg-rose-50 text-rose-700' : 
                    'bg-slate-100 text-slate-600'
                  }`}
                >
                  {vacancy.count > 0 ? '+' : ''}{vacancy.count} Vagas
                </span>
              </div>
              
              <h3 className="font-semibold text-slate-900 leading-tight mb-2 mt-1">
                {vacancy.subjectGroup}
              </h3>
              
              <p className="text-sm text-slate-500">
                {vacancy.type === 'Zone' 
                  ? '📍 Vagas de Quadro de Zona Pedagógica' 
                  : `🏫 ${vacancy.school?.split(' - ')[1] || vacancy.school} • ${vacancy.concelho?.split(' (')[0]}`
                }
              </p>

            </div>
          );
        })}
      </div>
    </div>
  );
}