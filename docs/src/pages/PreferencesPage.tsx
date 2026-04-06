import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../hooks/usePreferences';

export function PreferencesPage() {
  const { preferences, reorderPreferences, removePreference } = usePreferences();
  const navigate = useNavigate();

  const moveUp = (index: number) => {
    if (index > 0) reorderPreferences(index, index - 1);
  };

  const moveDown = (index: number) => {
    if (index < preferences.length - 1) reorderPreferences(index, index + 1);
  };

  if (preferences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6 text-amber-500">
          <span className="material-symbols-outlined text-5xl">bookmarks</span>
        </div>
        <h2 className="text-2xl font-headline font-bold text-slate-900 mb-2">Lista Vazia</h2>
        <p className="text-slate-500 mb-8 max-w-sm">
          Ainda não selecionou nenhuma preferência. Utilize a pesquisa para encontrar e guardar as vagas do seu interesse.
        </p>
        <button 
          onClick={() => navigate('/query')}
          className="bg-primary text-white px-6 py-3 rounded-full font-label font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined text-sm">search</span>
          Ir para Pesquisa
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="mb-6">
        <p className="text-amber-600 font-label text-sm font-bold tracking-wide uppercase flex items-center gap-1.5 mb-1">
          <span className="material-symbols-outlined text-[16px]">bookmarks</span>
          As Minhas Escolhas
        </p>
        <h2 className="text-3xl font-headline font-extrabold text-slate-900 leading-tight">Ordem de Preferência</h2>
        <p className="text-slate-500 text-sm mt-1">Organize as suas escolhas por ordem de prioridade. ({preferences.length} selecionadas)</p>
      </div>

      <div className="flex flex-col gap-3 mb-10">
        {preferences.map((vacancy, index) => {
          const schoolName = vacancy.school?.split(' - ').slice(1).join(' - ') || vacancy.school;
          const isFirst = index === 0;
          const isLast = index === preferences.length - 1;

          return (
            <div key={vacancy.id} className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-sm flex items-center gap-3 sm:gap-4 transition-all hover:shadow-md hover:border-amber-200 group">
              
              {/* Order Badge */}
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center font-bold text-lg border border-amber-200">
                {index + 1}
              </div>

              {/* Data payload */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase">{vacancy.qzp}</span>
                  <span className="text-[10px] font-bold text-slate-500 border border-slate-200 px-2 py-0.5 rounded truncate">
                    {vacancy.subjectGroup.split(' - ')[0]}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                  {vacancy.type === 'Zone' ? 'Quadro de Zona Pedagógica' : schoolName}
                </h4>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 sm:gap-2 opacity-100 sm:opacity-40 sm:group-hover:opacity-100 transition-opacity">
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveUp(index)} disabled={isFirst} className="p-1 rounded bg-slate-50 text-slate-500 hover:bg-amber-50 hover:text-amber-600 disabled:opacity-30">
                    <span className="material-symbols-outlined text-[16px] block">arrow_drop_up</span>
                  </button>
                  <button onClick={() => moveDown(index)} disabled={isLast} className="p-1 rounded bg-slate-50 text-slate-500 hover:bg-amber-50 hover:text-amber-600 disabled:opacity-30">
                    <span className="material-symbols-outlined text-[16px] block">arrow_drop_down</span>
                  </button>
                </div>
                
                <button 
                  onClick={() => removePreference(vacancy.id)}
                  className="p-2.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors ml-1"
                  title="Remover"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col items-center border-t border-slate-200 pt-8 pb-10">
        <p className="text-slate-500 text-sm mb-4 text-center">Precisa de adicionar mais opções à sua lista?</p>
        <button 
          onClick={() => navigate('/query')}
          className="bg-white border border-slate-300 text-slate-700 px-6 py-2.5 rounded-full font-label font-bold text-sm flex items-center gap-2 hover:bg-slate-50 hover:text-primary transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Continuar a Pesquisar
        </button>
      </div>
    </div>
  );
}