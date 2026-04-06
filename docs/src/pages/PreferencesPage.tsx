import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { LocationBanner } from '../components/ui/LocationBanner';
import { usePreferences } from '../hooks/usePreferences';
import { useUserLocation } from '../hooks/useUserLocation'; // NEW IMPORT
import { useVacancies } from '../hooks/useVacancies';
import { parseConcelho, parseSchool, parseSubject } from '../utils/formatters';

// Local component to handle the typing input state individually per row
function PreferenceItem({ vacancy, index, total, onMoveUp, onMoveDown, onMoveExact, onRemove }: any) {
  const { code: schoolCode, name: schoolName } = parseSchool(vacancy.school);
  // Assuming your formatter returns { name, code } for concelho now based on your snippet
  const { name: concelhoName } = parseConcelho(vacancy.concelho) || { name: vacancy.concelho };
  const { code: subjectCode, name: subjectName } = parseSubject(vacancy.subjectGroup);
  
  const isFirst = index === 0;
  const isLast = index === total - 1;

  // 1. Get our Global Hooks
  const { qzpMunicipalityMap, getSchoolMetadata } = useVacancies();
  const { calculateDistance, setManualLocation, userLocation } = useUserLocation();
  
  const municipalList = qzpMunicipalityMap[vacancy.qzp];

  // 2. Fetch Data & Calculate exactly like we do in VacancyCard
  const schoolMeta = vacancy.type === 'School' ? getSchoolMetadata(vacancy.concelho, vacancy.school) : null;
  const distanceKm = schoolMeta ? calculateDistance(schoolMeta.school_latitude, schoolMeta.school_longitude) : null;
  const isThisBase = userLocation?.lat === schoolMeta?.school_latitude && userLocation?.lon === schoolMeta?.school_longitude;

  const [inputValue, setInputValue] = useState((index + 1).toString());

  useEffect(() => {
    setInputValue((index + 1).toString());
  }, [index]);

  const handleCommit = () => {
    const newPos = parseInt(inputValue, 10);
    if (!isNaN(newPos) && newPos !== index + 1) {
      onMoveExact(vacancy.id, newPos);
    } else {
      setInputValue((index + 1).toString()); 
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
          className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-center text-lg border border-primary/20 outline-none focus:ring-2 focus:ring-primary focus:bg-white focus:text-primary transition-all hide-arrows cursor-text"
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

          {/* Interactive Icons placed cleanly on the top right line */}
          <div className="ml-auto flex items-center gap-1">
            {schoolMeta?.school_maps_place_url && (
              <a 
                href={schoolMeta.school_maps_place_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-400 hover:text-blue-600 transition-colors p-1" 
                title="Ver no Google Maps"
              >
                <span className="material-symbols-outlined text-[16px] block">map</span>
              </a>
            )}
            {schoolMeta?.school_latitude && schoolMeta?.school_longitude && (
               <button 
                 onClick={() => setManualLocation(schoolMeta.school_latitude!, schoolMeta.school_longitude!, schoolName)}
                 className={`p-1 transition-colors ${isThisBase ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-600'}`}
                 title={isThisBase ? "Este é o ponto de partida atual" : "Usar como ponto de partida"}
               >
                 <span className="material-symbols-outlined text-[16px] block" style={{ fontVariationSettings: isThisBase ? "'FILL' 1" : "'FILL' 0" }}>push_pin</span>
               </button>
            )}
          </div>
        </div>
        
        <h4 className="font-bold text-slate-900 my-1 text-sm sm:text-base leading-tight break-words pr-2">
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
          <div className="flex flex-col gap-1.5 mt-1">
            <p className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-1.5">
              <span className="font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                Cód: {schoolCode}
              </span>
              <span>• {concelhoName}</span>
              
              {/* Distance and Base Location Badges */}
              {distanceKm !== null && !isThisBase && (
                <span className="ml-1 flex items-center gap-1 text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/20">
                  <span className="material-symbols-outlined text-[12px]">directions_car</span>
                  <span className="font-bold">{distanceKm.toFixed(1)} km</span>
                </span>
              )}
              {isThisBase && (
                <span className="ml-1 flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                  <span className="material-symbols-outlined text-[12px]">push_pin</span>
                  Ponto de partida
                </span>
              )}
            </p>

            {/* Display School Observations (like TEIP) */}
            {schoolMeta?.school_observations && (
              <p>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
                  {schoolMeta.school_observations}
                </span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 sm:gap-2 opacity-100 sm:opacity-40 sm:group-hover:opacity-100 transition-opacity">
        <div className="flex flex-col gap-1">
          <button onClick={() => onMoveUp(index)} disabled={isFirst} className="p-1 rounded bg-slate-50 text-slate-500 hover:bg-primary/10 hover:text-primary disabled:opacity-30">
            <span className="material-symbols-outlined text-[16px] block">arrow_drop_up</span>
          </button>
          <button onClick={() => onMoveDown(index)} disabled={isLast} className="p-1 rounded bg-slate-50 text-slate-500 hover:bg-primary/10 hover:text-primary disabled:opacity-30">
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
  const { preferences, reorderPreferences, removePreference, moveToPosition, sortPreferences, clearPreferences } = usePreferences();
  const navigate = useNavigate();

  const [typeSortOrder, setTypeSortOrder] = useState<'zone' | 'school'>('zone');
  const [vacancySortOrder, setVacancySortOrder] = useState<'desc' | 'asc'>('desc');
  const [showClearWarning, setShowClearWarning] = useState(false);

  const handleTypeSort = () => {
    const nextOrder = typeSortOrder === 'zone' ? 'school' : 'zone';
    setTypeSortOrder(nextOrder);
    sortPreferences(`type-${nextOrder}`);
  };

  const handleVacancySort = () => {
    const nextOrder = vacancySortOrder === 'desc' ? 'asc' : 'desc';
    setVacancySortOrder(nextOrder);
    sortPreferences(`vacancies-${nextOrder}`);
  };

  const handleConfirmClear = () => {
    clearPreferences();
    setShowClearWarning(false);
  };

  if (preferences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
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
      <div className="mb-6 pt-4 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        
        <div className="flex-1 min-w-0 lg:pr-6">
          <p className="text-primary font-label text-sm font-bold tracking-wide uppercase flex items-center gap-1.5 mb-1">
            <span className="material-symbols-outlined text-[16px]">bookmarks</span>
            As Minhas Escolhas
          </p>
          <h2 className="text-3xl font-headline font-extrabold text-slate-900 leading-tight">Ordem de Preferência</h2>
          <p className="text-slate-500 text-sm mt-1">Organize por tipo, por vagas, usando as setas individuais ou <strong>escrevendo a posição na etiqueta</strong>.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
          <div className="flex flex-1 sm:flex-none items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button onClick={handleTypeSort} className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white rounded shadow-sm transition-all flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[14px]">
                {typeSortOrder === 'zone' ? 'location_on' : 'school'}
              </span> 
              Tipo {typeSortOrder === 'zone' ? '(QZP)' : '(Escolas)'}
            </button>
            <button onClick={handleVacancySort} className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white rounded shadow-sm transition-all flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[14px]">
                {vacancySortOrder === 'desc' ? 'arrow_downward' : 'arrow_upward'}
              </span> 
              Vagas {vacancySortOrder === 'desc' ? '(Maior)' : '(Menor)'}
            </button>
          </div>
          
          <button 
            onClick={() => setShowClearWarning(true)} 
            className="flex-1 sm:flex-none px-3 py-2 bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 text-xs font-bold"
          >
            <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
            Limpar Tudo
          </button>
        </div>
      </div>

      {/* PLUG AND PLAY LOCATION BANNER */}
      <LocationBanner />

      <div className="flex flex-col gap-3 mb-10 mt-2">
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
      
      {/* BOTTOM WARNING SHEET */}
      {showClearWarning && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[90] animate-in fade-in duration-300"
            onClick={() => setShowClearWarning(false)}
          />
          
          <div className="fixed bottom-0 left-0 w-full bg-white border-t border-rose-200 p-6 pb-10 sm:pb-6 shadow-[0_-15px_40px_-15px_rgba(225,29,72,0.15)] z-[100] animate-in slide-in-from-bottom-full duration-300">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-2xl">warning</span>
                </div>
                <div>
                  <h4 className="text-lg font-headline font-bold text-slate-900">Limpar Todas as Preferências?</h4>
                  <p className="text-slate-600 text-sm mt-1">
                    Esta ação irá apagar definitivamente as suas <strong>{preferences.length} escolhas</strong>. Não é possível reverter esta operação.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setShowClearWarning(false)}>
                  Cancelar
                </Button>
                <Button variant="danger" icon="delete_forever" className="flex-1 sm:flex-none" onClick={handleConfirmClear}>
                  Sim, Apagar Tudo
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
      
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