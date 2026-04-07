import { Button } from '../components/ui/Button';
import { MultiSelectInput } from '../components/ui/MultiSelectInput';
import { useQueryLogic } from '../hooks/useQueryLogic';
import type { SubjectOption } from '../hooks/useVacancies';

export function QueryPage() {
  const logic = useQueryLogic();

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6 pt-4">
        <p className="text-primary font-label text-sm font-bold tracking-wide uppercase flex items-center gap-1.5 mb-1">
          <span className="material-symbols-outlined text-[16px]">travel_explore</span>
          Pesquisa Avançada
        </p>
        <h2 className="text-3xl font-headline font-extrabold text-slate-900 leading-tight">Configurar Pesquisa</h2>
        <p className="text-slate-500 text-sm mt-1">Selecione o tipo de vagas e os grupos de recrutamento.</p>
      </div>

      <div className="mb-8 bg-surface-container-lowest p-2 rounded-xl flex gap-2 shadow-sm border border-surface-container-high">
        <button 
          onClick={() => logic.setScope('zone')}
          className={`flex-1 px-6 py-2.5 rounded-lg text-sm font-bold ${logic.searchScope === 'zone' ? 'bg-white text-primary border border-primary/20 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Vagas QZP
        </button>
        <button 
          onClick={() => logic.setScope('school')}
          className={`flex-1 px-6 py-2.5 rounded-lg text-sm font-bold ${logic.searchScope === 'school' ? 'bg-white text-primary border border-primary/20 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Vagas de Escola
        </button>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">menu_book</span>
          Grupos de Recrutamento
        </h3>
        
        <div className="mb-4">
          <MultiSelectInput 
            selectedOptions={logic.selectedOptions}
            inputValue={logic.inputValue}
            onInputChange={logic.setInputValue}
            onRemove={logic.removeSubject}
            onTokenize={logic.handleTokenize}
            placeholder="Escreva um código (ex: 500) ou disciplina (ex: Mat)..."
          />
        </div>

        <div className="flex flex-wrap gap-2 max-h-[40vh] overflow-y-auto pb-4 pr-2 custom-scrollbar">
          {logic.filteredSubjects.length === 0 ? (
            <p className="text-sm text-slate-500 italic p-2">Nenhum grupo encontrado para "{logic.inputValue}".</p>
          ) : (
            logic.filteredSubjects.map((sub: SubjectOption) => (
              <button
                key={sub.id}
                onClick={() => logic.toggleSubject(sub.id)}
                disabled={sub.isDisabled}
                className={`px-3 py-2 rounded-xl text-left text-sm transition-all border flex items-center max-w-full ${
                  sub.isDisabled 
                    ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-500' 
                    : logic.selectedSubjects.includes(sub.id)
                    ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' 
                    : 'bg-white text-slate-700 border-slate-200 hover:border-primary/50' 
                }`}
              >
                <span className={`text-xs font-bold mr-1 ${sub.isDisabled ? 'opacity-50' : 'opacity-60'}`}>
                  {sub.code}
                </span>
                <span className="truncate">{sub.name}</span>
                
                <span className={`text-xs ml-1 whitespace-nowrap ${
                  sub.totalVacancies < 0 ? 'text-rose-400 font-bold opacity-50' : 
                  sub.totalVacancies === 0 ? 'text-slate-400 font-medium' : 
                  'text-emerald-900 font-bold opacity-50'
                }`}>
                  ({sub.totalVacancies > 0 ? '+' : ''}{sub.totalVacancies})
                </span>

                {logic.selectedSubjects.includes(sub.id) && !sub.isDisabled && (
                  <span className="material-symbols-outlined text-[16px] text-primary ml-1">check</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {logic.selectedSubjects.length > 0 && (
        <div className="fixed bottom-24 right-6 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <Button variant="gradient" icon="manage_search" onClick={logic.handleRunQuery} className="h-14 text-base shadow-2xl">
            Ver Resultados
          </Button>
        </div>
      )}
    </div>
  );
}