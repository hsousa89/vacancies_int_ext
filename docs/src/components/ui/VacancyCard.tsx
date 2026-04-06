import { usePreferences } from '../../hooks/usePreferences';
import type { Vacancy } from '../../hooks/useVacancies';

interface VacancyCardProps {
  vacancy: Vacancy;
  municipalitiesList: string;
}

export function VacancyCard({ vacancy, municipalitiesList }: VacancyCardProps) {
  // Extract school code and name cleanly
  const schoolCode = vacancy.school?.split(' - ')[0];
  // Re-join the rest in case the school name naturally has hyphens in it
  const schoolName = vacancy.school?.split(' - ').slice(1).join(' - ') || vacancy.school;
  const concelhoName = vacancy.concelho?.split(' (')[0];
  const { preferences, togglePreference } = usePreferences();
  const isBookmarked = preferences.some(p => p.id === vacancy.id);

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
          
          <button 
            onClick={() => togglePreference(vacancy)}
            className={`p-1.5 rounded-md transition-colors ${isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
          </button>
        </div>
      </div>
      <div className="mb-3">
        <h3 className="font-bold text-slate-900 leading-tight mb-1.5 text-lg">
          {vacancy.type === 'Zone' 
            ? '📍 Vagas de Quadro de Zona Pedagógica' 
            : `🏫 ${schoolName}`
          }
        </h3>
        
        {/* School Code & Municipality */}
        {vacancy.type === 'School' && (
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span className="font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
              Cód: {schoolCode}
            </span>
            <span>• {concelhoName}</span>
          </p>
        )}
      </div>
      
      {/* Subject Group is now a secondary badge at the bottom */}
      <div className="mt-auto pt-3 border-t border-slate-100">
        <p className="text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 inline-block px-2 py-1 rounded-md">
          {vacancy.subjectGroup}
        </p>
      </div>

    </div>
  );
}