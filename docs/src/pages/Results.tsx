import { useVacancies } from '../hooks/useVacancies';

export function Results() {
  const { filteredVacancies } = useVacancies();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-headline font-bold text-slate-900">
        Resultados
      </h2>
      <p className="text-slate-500 mb-4">
        Encontradas {filteredVacancies.length} vagas correspondentes.
      </p>

      <div className="flex flex-col gap-4">
        {filteredVacancies.map((vacancy) => (
          <div key={vacancy.id} className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
            
            {/* Top row: QZP badge and Vacancy Count */}
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                {vacancy.qzp}
              </span>
              <span className={`text-sm font-bold px-2 py-1 rounded-md ${
                  vacancy.count > 0 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'bg-rose-50 text-rose-700'
                }`}
              >
                {vacancy.count > 0 ? '+' : ''}{vacancy.count} Vagas
              </span>
            </div>
            
            {/* Subject / Group */}
            <h3 className="font-semibold text-slate-900 leading-tight mb-2">
              {vacancy.subjectGroup}
            </h3>
            
            {/* Location / School Info */}
            <p className="text-sm text-slate-500">
              {vacancy.type === 'Zone' 
                ? '📍 Vagas de Quadro de Zona Pedagógica (Geral)' 
                : `🏫 ${vacancy.school?.split(' - ')[1] || vacancy.school} • ${vacancy.concelho?.split(' (')[0]}`
              }
            </p>

          </div>
        ))}
      </div>
    </div>
  );
}