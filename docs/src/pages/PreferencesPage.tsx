import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { usePreferences } from '../hooks/usePreferences';
import { useVacancies } from '../hooks/useVacancies';
import { parseConcelho, parseSchool, parseSubject } from '../utils/formatters';

// Local component to handle the typing input state individually per row
function PreferenceItem({ vacancy, index, total, onMoveUp, onMoveDown, onMoveExact, onRemove }: any) {
  const { code: schoolCode, name: schoolName } = parseSchool(vacancy.school);
  const concelhoName = parseConcelho(vacancy.concelho);
  const { code: subjectCode, name: subjectName } = parseSubject(vacancy.subjectGroup);
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const { qzpMunicipalityMap } = useVacancies();
  const municipalList = qzpMunicipalityMap[vacancy.qzp];
  

  // Local state for the editable badge
  const [inputValue, setInputValue] = useState((index + 1).toString());

  // Keep input in sync if ordered externally
  useEffect(() => {
    setInputValue((index + 1).toString());
  }, [index]);

  const handleCommit = () => {
    const newPos = parseInt(inputValue, 10);
    if (!isNaN(newPos) && newPos !== index + 1) {
      onMoveExact(vacancy.id, newPos);
    } else {
      setInputValue((index + 1).toString()); // reset if invalid
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-sm flex items-center gap-3 sm:gap-4 transition-all hover:shadow-md hover:border-primary/40 group">
      
      {/* EDITABLE ORDER BADGE */}
      <div className="relative group/badge flex-shrink-0">
        <input 
          type="number" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={(e) => e.key === 'Enter' && handleCommit()}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/70 text-on-primary rounded-lg flex items-center justify-center font-bold text-center text-lg border border-primary/40 outline-none focus:ring-2 focus:ring-primary focus:bg-white focus:text-primary transition-all hide-arrows cursor-text"
          title="Escreva o número para reordenar rapidamente"
          />
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover/badge:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
          Editar Ordem
        </span>
      </div>

      {/* Data payload */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase">{vacancy.qzp}</span>
          <span className="text-[10px] font-bold text-slate-500 border border-slate-200 px-2 py-0.5 rounded truncate">
            GR {subjectCode ? subjectCode : subjectName || 'Sem Disciplina Específica'}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${vacancy.count > 0 ? 'text-emerald-700 bg-emerald-50' : vacancy.count < 0 ? 'text-rose-700 bg-rose-50' : 'text-slate-600 bg-slate-100'}`}>
            {vacancy.count > 0 ? '+' : ''}{vacancy.count}
          </span>
        </div>
        <h4 className="font-bold text-slate-900 m-2 text-sm sm:text-base leading-tight truncate">
                  {vacancy.type === 'Zone' ? 'Quadro de Zona Pedagógica' : schoolName}
                </h4>
                {vacancy.type === 'Zone' && (
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <span className="font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                      {municipalList}
                    </span>
                  </p>
                )}
                {vacancy.type === 'School' && (
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <span className="font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                      Cód: {schoolCode}
                    </span>
                    <span>• {concelhoName}</span>
                  </p>
                )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 sm:gap-2 opacity-100 sm:opacity-40 sm:group-hover:opacity-100 transition-opacity">
        <div className="flex flex-col gap-1">
          <button onClick={() => onMoveUp(index)} disabled={isFirst} className="p-1 rounded bg-slate-50 text-slate-500 hover:bg-primary/20 hover:text-primary disabled:opacity-30">
            <span className="material-symbols-outlined text-[16px] block">arrow_drop_up</span>
          </button>
          <button onClick={() => onMoveDown(index)} disabled={isLast} className="p-1 rounded bg-slate-50 text-slate-500 hover:bg-primary/20 hover:text-primary disabled:opacity-30">
            <span className="material-symbols-outlined text-[16px] block">arrow_drop_down</span>
          </button>
        </div>
        
        <button onClick={() => onRemove(vacancy.id)} className="p-2.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors ml-1" title="Remover">
          <span className="material-symbols-outlined text-[20px]">delete</span>
        </button>
      </div>
    </div>
  );
}

export function PreferencesPage() {
  const { preferences, reorderPreferences, removePreference, moveToPosition, sortPreferences } = usePreferences();
  const navigate = useNavigate();

  if (preferences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6 text-primary/200">
          <span className="material-symbols-outlined text-5xl">bookmarks</span>
        </div>
        <h2 className="text-2xl font-headline font-bold text-slate-900 mb-2">Lista Vazia</h2>
        <p className="text-slate-500 mb-8 max-w-sm">
          Ainda não selecionou nenhuma preferência. Utilize a pesquisa para encontrar e guardar as vagas do seu interesse.
        </p>
        <Button variant="primary" icon="search" onClick={() => navigate('/query')}>
          Ir para Pesquisa
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="mb-6 pt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-primary font-label text-sm font-bold tracking-wide uppercase flex items-center gap-1.5 mb-1">
            <span className="material-symbols-outlined text-[16px]">bookmarks</span>
            As Minhas Escolhas
          </p>
          <h2 className="text-3xl font-headline font-extrabold text-slate-900 leading-tight">Ordem de Preferência</h2>
          <p className="text-slate-500 text-sm mt-1">Organize arrastando ou <strong>escrevendo a posição na etiqueta amarela</strong>.</p>
        </div>

        {/* AUTOMATIC SORTING BUTTONS */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200 w-fit">
          <button onClick={() => sortPreferences('type')} title="Agrupar por Tipo (QZP / Escola)" className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white rounded shadow-sm transition-all flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">category</span> Tipo
          </button>
          <button onClick={() => sortPreferences('vacancies-desc')} title="Ordenar Vagas (Maior para Menor)" className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white rounded shadow-sm transition-all flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">arrow_downward</span> Vagas
          </button>
          <button onClick={() => sortPreferences('vacancies-asc')} title="Ordenar Vagas (Menor para Maior)" className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white rounded shadow-sm transition-all flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">arrow_upward</span> Vagas
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-10">
        {preferences.map((vacancy, index) => (
          <PreferenceItem 
            key={vacancy.id}
            vacancy={vacancy}
            index={index}
            total={preferences.length}
            onMoveUp={(i: number) => reorderPreferences(i, i - 1)}
            onMoveDown={(i: number) => reorderPreferences(i, i + 1)}
            onMoveExact={moveToPosition}
            onRemove={removePreference}
          />
        ))}
      </div>

      <div className="flex flex-col items-center border-t border-slate-200 pt-8 pb-10">
        <p className="text-slate-500 text-sm mb-4 text-center">Precisa de adicionar mais opções à sua lista?</p>
        <Button variant="outline" icon="add_circle" onClick={() => navigate('/query')}>
          Continuar a Pesquisar
        </Button>
      </div>
      
      {/* Hide arrows on number input globally for this page */}
      <style>{`
        .hide-arrows::-webkit-outer-spin-button,
        .hide-arrows::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .hide-arrows {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}