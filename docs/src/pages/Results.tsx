import { useCallback } from 'react'; // NEW
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { LocationBanner } from '../components/ui/LocationBanner';
import { SearchableFilter } from '../components/ui/SearchableFilter';
import { VacancyCard } from '../components/ui/VacancyCard';
import { usePreferences } from '../hooks/usePreferences';
import { useResultsFilters } from '../hooks/useResultsFilters';
import { useUserLocation } from '../hooks/useUserLocation';
import type { Vacancy } from '../hooks/useVacancies'; // NEW
import { useVacancies } from '../hooks/useVacancies';

export function Results() {
  const navigate = useNavigate();
  const { flatResults, qzpMunicipalityMap, getSchoolMetadata } = useVacancies(); // NEW: Extracted getSchoolMetadata
  const { preferences, toggleMultiplePreferences } = usePreferences();
  const { userLocation, calculateDistance } = useUserLocation();

  // NEW: Create a pure callback to calculate distance for the filter hook
  const getDistance = useCallback((vacancy: Vacancy) => {
    if (vacancy.type !== 'School' || !userLocation) return null;
    const meta = getSchoolMetadata(vacancy.concelho, vacancy.school);
    if (!meta?.school_latitude || !meta?.school_longitude) return null;
    return calculateDistance(meta.school_latitude, meta.school_longitude);
  }, [userLocation, getSchoolMetadata, calculateDistance]);

  // NEW: Pass the callback into the hook
  const filters = useResultsFilters(flatResults, getDistance);

  const isAllSaved = filters.displayResults.length > 0 && 
    filters.displayResults.every(v => preferences.some(p => p.id === v.id));

  // UI color logic based on the calculated stats
  let badgeColorClass = filters.highlight 
    ? 'bg-slate-300 text-slate-900 scale-110 shadow-sm decoration-slate-400' 
    : 'bg-slate-100 text-slate-600 scale-100 decoration-slate-300';
    
  if (filters.totalVacancies > 0) {
    badgeColorClass = filters.highlight 
      ? 'bg-emerald-200 text-emerald-900 scale-110 shadow-sm decoration-emerald-400' 
      : 'bg-emerald-50 text-emerald-700 scale-100 decoration-emerald-400';
  } else if (filters.totalVacancies < 0) {
    badgeColorClass = filters.highlight 
      ? 'bg-rose-200 text-rose-900 scale-110 shadow-sm decoration-rose-400' 
      : 'bg-rose-50 text-rose-700 scale-100 decoration-rose-400';
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="mb-6 pt-4 flex items-start justify-between">
        <div>
          <p className="text-blue-600 font-label text-sm font-bold tracking-wide uppercase flex items-center gap-1.5 mb-1">
            <span className="material-symbols-outlined text-[16px]">list_alt</span>
            Lista de Vagas
          </p>
          <h2 className="text-3xl font-headline font-extrabold text-slate-900 leading-tight">Resultados da Pesquisa</h2>
          
          <div className="text-slate-500 text-sm flex items-center flex-wrap gap-1.5 mt-1">
            Encontradas
            <span 
              key={`${filters.displayResults.length}-${filters.totalVacancies}`} 
              className={`inline-flex items-center justify-center px-2 py-0.5 rounded font-bold text-sm transition-all duration-300 animate-in zoom-in-75 underline decoration-2 underline-offset-2 ${badgeColorClass}`}
            >
              {filters.totalVacancies > 0 ? '+' : ''}{filters.totalVacancies} vagas
            </span>
            em {filters.displayResults.length} registos correspondentes.
          </div>
        </div>
        {filters.displayResults.length > 0 && (
          <Button 
            variant={isAllSaved ? "secondary" : "outline"} 
            icon={isAllSaved ? "bookmark_remove" : "bookmark_add"} 
            onClick={() => toggleMultiplePreferences(filters.displayResults)}
          >
            {isAllSaved ? 'Remover Resultados' : 'Guardar Resultados'}
          </Button>
        )}
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors mt-2">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </div>

      {filters.selectedSubjects.length === 0 && (
        <div className="p-6 bg-blue-50 text-blue-800 rounded-xl border border-blue-100 text-center">
          <span className="material-symbols-outlined text-4xl mb-2 opacity-50">info</span>
          <p className="font-medium">Nenhum grupo de recrutamento selecionado.</p>
        </div>
      )}

      {/* FILTER ACCORDION */}
      {filters.selectedSubjects.length > 0 && filters.baseResultsCount > 0 && (
        <details className="bg-white rounded-xl border border-slate-200 shadow-sm mb-2 group">
          <summary className="p-4 font-semibold text-slate-800 cursor-pointer flex justify-between items-center list-none">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined">filter_list</span>
              Filtros Avançados {filters.activeFiltersCount > 0 && <span className="bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full">{filters.activeFiltersCount}</span>}
            </span>
            <span className="material-symbols-outlined transition-transform group-open:rotate-180 text-slate-400">expand_more</span>
          </summary>
          
          <div className="p-4 border-t border-slate-100 flex flex-col gap-6">
            
            {/* NEW: DISTANCE SLIDER (Only for schools) */}
            {filters.scope === 'school' && (
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">share_location</span>
                    Raio de Distância
                  </h4>
                  {filters.maxDistance && (
                    <span className="text-xs font-bold bg-primary text-white px-2 py-0.5 rounded-md">
                      Até {filters.maxDistance} km
                    </span>
                  )}
                </div>

                {!userLocation ? (
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-amber-500">warning</span>
                    Ative a localização no banner abaixo para filtrar por distância.
                  </p>
                ) : (
                  <div className="flex flex-col gap-1 mt-3 px-1">
                    <input
                      type="range"
                      min="5"
                      max="200"
                      step="5"
                      value={filters.maxDistance || 200}
                      onChange={(e) => filters.setMaxDistance(Number(e.target.value))}
                      className="w-full accent-primary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1 mt-1">
                      <span>5 km</span>
                      <span>50 km</span>
                      <span>100 km</span>
                      <span>200 km</span>
                    </div>
                    {filters.maxDistance && (
                      <div className="flex justify-end mt-2">
                         <button 
                           onClick={() => filters.setMaxDistance(null)} 
                           className="text-xs text-rose-500 font-medium hover:text-rose-600 underline"
                         >
                           Remover limite
                         </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-2">Disponibilidade</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'positive', label: 'Com vagas (+)', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
                  { id: 'zero', label: 'Sem vagas (0)', cls: 'bg-slate-200 text-slate-800 border-slate-300' },
                  { id: 'negative', label: 'Negativas (-)', cls: 'bg-rose-100 text-rose-800 border-rose-200' }
                ].map(type => (
                  <button key={type.id} onClick={() => filters.toggleVacancyType(type.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filters.selectedVacancyTypes.includes(type.id) ? type.cls : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-2">Zonas (QZP)</h4>
              <div className="flex flex-wrap gap-2">
                {filters.availableZones.map(zone => (
                  <button key={zone} onClick={() => filters.toggleZone(zone)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filters.selectedZones.includes(zone) ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'}`}>
                    {zone}
                  </button>
                ))}
              </div>
            </div>

            {filters.scope === 'school' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SearchableFilter title="Concelhos" placeholder="Pesquisar concelho..." query={filters.concelhoQuery} onQueryChange={filters.setConcelhoQuery} items={filters.filteredConcelhos} selectedItems={filters.selectedConcelhos} onToggle={filters.toggleConcelho} emptyMessage="Nenhum concelho encontrado." />
                <SearchableFilter title="Escolas" placeholder="Pesquisar escola..." query={filters.schoolQuery} onQueryChange={filters.setSchoolQuery} items={filters.filteredSchools} selectedItems={filters.selectedSchools} onToggle={filters.toggleSchool} emptyMessage="Nenhuma escola encontrada." />
              </div>
            )}

            {filters.activeFiltersCount > 0 && (
              <div className="flex justify-end pt-2">
                <button onClick={filters.clearFilters} className="text-sm text-rose-600 font-medium hover:text-rose-700 underline">Limpar todos os filtros</button>
              </div>
            )}
          </div>
        </details>
      )}

      {/* GEOLOCATION BANNER */}
      {filters.scope === 'school' && filters.displayResults.length > 0 && (
        <LocationBanner />
      )}

      {/* MODULARIZED RESULTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
        {filters.displayResults.map((vacancy) => (
          <VacancyCard 
            key={vacancy.id} 
            vacancy={vacancy} 
            municipalitiesList={qzpMunicipalityMap[vacancy.qzp] || 'Sem concelhos'} 
            calculateDistance={calculateDistance}
          />
        ))}
      </div>
    
    </div>
  );
}