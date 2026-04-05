import type { Vacancy } from '../hooks/useVacancies';

interface VacancyCardProps {
  vacancy: Vacancy;
  municipalitiesList: string;
}

export function VacancyCard({ vacancy, municipalitiesList }: VacancyCardProps) {
  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
      
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
}