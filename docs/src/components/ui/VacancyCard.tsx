import { usePreferences } from '../../hooks/usePreferences';
import { useUserLocation } from '../../hooks/useUserLocation';
import type { Vacancy } from '../../hooks/useVacancies';
import { useVacancies } from '../../hooks/useVacancies';
import { parseConcelho, parseSchool } from '../../utils/formatters';

interface VacancyCardProps {
  vacancy: Vacancy;
  municipalitiesList: string;
  calculateDistance?: (lat: number | null, lon: number | null) => number | null;
}

export function VacancyCard({ vacancy, municipalitiesList }: VacancyCardProps) {
  const { getSchoolMetadata } = useVacancies();
  const { code: schoolCode, name: schoolName } = parseSchool(vacancy.school);
  const concelhoName = parseConcelho(vacancy.concelho).name;
  const { preferences, togglePreference } = usePreferences();
  const { calculateDistance, setManualLocation, userLocation } = useUserLocation();
  const isBookmarked = preferences.some(p => p.id === vacancy.id);

  const schoolMeta = vacancy.type === 'School' ? getSchoolMetadata(vacancy.concelho, vacancy.school) : null;
  
  const distanceKm = schoolMeta && calculateDistance ? calculateDistance(schoolMeta.school_latitude, schoolMeta.school_longitude) : null;
  const isThisBase = userLocation?.lat === schoolMeta?.school_latitude && userLocation?.lon === schoolMeta?.school_longitude;


  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
      
      <div className="flex justify-between items-start gap-2 mb-3">
        <div className="flex-1 flex flex-col bg-blue-50 px-2.5 py-1.5 rounded-md min-w-0" title={`${vacancy.qzp}: ${municipalitiesList || ''}`}>
          <span className="text-xs font-bold text-blue-800">{vacancy.qzp}</span>
          <span className="text-[10px] text-blue-600/80 truncate">
            {municipalitiesList || 'Sem concelhos'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold px-2.5 py-1.5 rounded-md whitespace-nowrap flex-shrink-0 ${
              vacancy.count > 0 ? 'bg-emerald-50 text-emerald-700' : 
              vacancy.count < 0 ? 'bg-rose-50 text-rose-700' : 
              'bg-slate-100 text-slate-600'
            }`}
          >
            {vacancy.count > 0 ? '+' : ''}{vacancy.count} Vagas
          </span>
          {/* Bookmark Button with Tooltip */}
          <div className="relative group/bookmark flex items-center">
            <button 
              onClick={() => togglePreference(vacancy)}
              className={`p-1.5 rounded-md transition-colors ${isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
              aria-label={isBookmarked ? "Remover das Preferências" : "Guardar nas Preferências"}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
            </button>
            
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-800 text-white text-[10px] font-bold rounded-md opacity-0 group-hover/bookmark:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-sm">
              {isBookmarked ? "Remover das Preferências" : "Guardar nas Preferências"}
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></span>
            </span>
          </div>
        </div>
      </div>
      
      {/* School Name & Observations */}
      <div className="mb-3 flex-1">
        <h3 className="font-bold text-slate-900 leading-tight mb-2 text-base sm:text-lg">
          {vacancy.type === 'Zone' ? '📍 Vagas de Quadro de Zona Pedagógica' : `🏫 ${schoolName}`}
        </h3>
        
        {schoolMeta?.school_observations && (
          <span className="inline-block mb-2 text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
            {schoolMeta.school_observations}
          </span>
        )}
        
        {vacancy.type === 'School' && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <span className="font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">Cód: {schoolCode}</span>
              <span>• {concelhoName}</span>
            </p>

            {distanceKm !== null && !isThisBase && (
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-primary">directions_car</span>
                Aprox. <strong className="text-slate-700">{distanceKm.toFixed(1)} km</strong> de distância
              </p>
            )}
            {isThisBase && (
              <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">push_pin</span>
                A usar como ponto de partida
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer Area with new Pin Action */}
      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
        <p className="text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 inline-block px-2 py-1 rounded-md max-w-[70%] truncate">
          {vacancy.subjectGroup}
        </p>

        <div className="flex items-center gap-1">
          {/* NEW: Set as Base Location Button */}
          {schoolMeta?.school_latitude && schoolMeta?.school_longitude && (
            <button 
              onClick={() => setManualLocation(schoolMeta.school_latitude!, schoolMeta.school_longitude!, schoolName)}
              className={`flex items-center justify-center p-1.5 rounded-full transition-colors ${isThisBase ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'}`}
              title={isThisBase ? "Este é o ponto de partida atual" : "Usar como ponto de partida"}
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: isThisBase ? "'FILL' 1" : "'FILL' 0" }}>push_pin</span>
            </button>
          )}

          {/* Existing Google Maps Button */}
          {schoolMeta?.school_maps_place_url && (
            <a 
              href={schoolMeta.school_maps_place_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center p-1.5 rounded-full bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              title="Ver no Google Maps"
            >
              <span className="material-symbols-outlined text-[18px]">map</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}