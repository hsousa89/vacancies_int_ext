import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { MultiSelectInput, type TokenOption } from '../components/ui/MultiSelectInput';
import { StatCard } from '../components/ui/StatCard';
import { useDashboardStats } from '../hooks/useDashboarStats';
import { useVacancies } from '../hooks/useVacancies';
import { parseSchool, parseSubject } from '../utils/formatters';

export function Dashboard() {
  const navigate = useNavigate();
  const { flatResults } = useVacancies();
  
  // State 
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [inputValue, setInputValue] = useState('');
  
  const stats = useDashboardStats(selectedSubject);

  // Parse subjects for the tokenizer
  const availableSubjects = useMemo(() => {
    const map = new Map<string, { id: string, code: string, name: string }>();
    flatResults.forEach(v => {
      if (!map.has(v.subjectGroup)) {
        const { code, name } = parseSubject(v.subjectGroup);
        map.set(v.subjectGroup, {
          id: v.subjectGroup,
          code,
          name
        });
      }
    });
    return Array.from(map.values());
  }, [flatResults]);

  // Calculate autocomplete suggestions based on what the user is typing
  const filteredSubjects = useMemo(() => {
    if (!inputValue.trim()) return [];
    const query = inputValue.toLowerCase().trim();
    
    return availableSubjects.filter(sub => 
      sub.code.toLowerCase().includes(query) || 
      sub.name.toLowerCase().includes(query)
    );
  }, [inputValue, availableSubjects]);

  // Handle Tokenizer matching logic
  const handleTokenize = (text: string) => {
    const query = text.toLowerCase().trim();
    if (!query) return;

    let match = availableSubjects.find(s => s.code.toLowerCase() === query);
    if (!match) match = availableSubjects.find(s => s.name.toLowerCase() === query);
    
    if (!match) {
      const partials = availableSubjects.filter(s => 
        s.code.toLowerCase().includes(query) || s.name.toLowerCase().includes(query)
      );
      if (partials.length === 1) match = partials[0];
    }

    if (match) {
      setSelectedSubject(match.id);
      setInputValue(''); 
    }
  };

  const handleRemove = () => {
    setSelectedSubject('all');
  };

  // Convert the single string into the TokenOption format the component expects
  const selectedOptions: TokenOption[] = useMemo(() => {
    if (selectedSubject === 'all') return [];
    const sub = availableSubjects.find(s => s.id === selectedSubject);
    return sub ? [{ id: selectedSubject, label: `GR ${sub.code}` }] : [];
  }, [selectedSubject, availableSubjects]);

  const getSchoolName = (rawName: string) => rawName === 'N/A' ? 'N/A' : parseSchool(rawName).name;

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-12 px-4">
      
      {/* HEADER & FILTER */}
      <div className="mb-6 pt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-primary font-label text-sm font-bold tracking-wide uppercase flex items-center gap-1.5 mb-1">
            <span className="material-symbols-outlined text-[16px]">bar_chart</span>
            Panorama Nacional 2026
          </p>
          <h2 className="text-3xl font-headline font-extrabold text-slate-900 leading-tight">Painel de Informações</h2>
          <p className="text-slate-500 text-sm mt-1">Análise detalhada das necessidades e excedentes do sistema educativo.</p>
        </div>

        {/* FILTER WITH AUTOCOMPLETE DROPDOWN */}
        <div className="flex flex-col gap-1.5 md:w-96 flex-shrink-0 relative">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {selectedSubject === 'all' ? 'Filtro Global (Todos os Grupos)' : 'Filtro Ativo'}
          </label>
          
          <MultiSelectInput 
            selectedOptions={selectedOptions}
            inputValue={inputValue}
            onInputChange={setInputValue}
            onRemove={handleRemove}
            onTokenize={handleTokenize}
            placeholder="Pesquisar código (110) ou nome..."
            maxItems={1}
          />

          {/* THE AUTOCOMPLETE MENU */}
          {inputValue.trim().length > 0 && selectedSubject === 'all' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
              {filteredSubjects.length > 0 ? (
                <ul className="py-1 flex flex-col">
                  {filteredSubjects.map(sub => (
                    <li 
                      key={sub.id}
                      // When they click a suggestion, we set it and clear the input!
                      onClick={() => {
                        setSelectedSubject(sub.id);
                        setInputValue('');
                      }}
                      className="px-3 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center gap-2.5 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <span className="text-xs font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                        GR {sub.code}
                      </span>
                      <span className="text-sm text-slate-700 font-medium truncate">
                        {sub.name}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-4 text-sm text-slate-500 text-center flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-slate-300 text-2xl">search_off</span>
                  <span>Nenhum grupo encontrado.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* HERO CARD - QZP (New Entries) */}
      <div className="bg-emerald-600 p-8 rounded-2xl border border-emerald-50 flex flex-col md:flex-row justify-between items-center mb-6 relative overflow-hidden shadow-lg shadow-emerald-100">
        <div className="z-10 text-center md:text-left">
          <p className="text-emerald-100 font-label text-xs uppercase tracking-widest mb-1 font-bold">
            Vagas Quadro de Zona Pedagógica {selectedSubject === 'all' ? '' : `(GR ${selectedSubject.split(' - ')[0]})`}
          </p>
          <div className="flex items-end justify-center md:justify-start gap-2 text-white">
            <p className="text-6xl font-headline font-extrabold text-white">
              {stats.totalZoneVacancies > 0 ? '+' : ''}{stats.totalZoneVacancies}
            </p>
          </div>
          <div className="mt-2 flex items-center justify-center md:justify-start gap-1.5 text-emerald-100/80 text-xs font-semibold bg-white/10 w-fit px-2 py-1 rounded-full mx-auto md:mx-0">
            <span className="material-symbols-outlined text-sm">school</span>
            <span>Entradas na Carreira</span>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* SCHOOL TOTALS GRID (Internal Mobility) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
          <p className="text-emerald-900/60 font-label text-[10px] uppercase tracking-widest font-bold mb-1">Vagas Abertas em Agrupamentos</p>
          <p className="text-3xl font-headline font-bold text-emerald-700">+{stats.totalSchoolNeeds}</p>
        </div>
        <div className="bg-rose-50 p-6 rounded-xl border border-rose-100">
          <p className="text-rose-900/60 font-label text-[10px] uppercase tracking-widest font-bold mb-1">Vagas Extintas em Agrupamentos</p>
          <p className="text-3xl font-headline font-bold text-rose-700">{stats.totalSchoolSurplus}</p>
        </div>
        <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-900/60 font-label text-[10px] uppercase tracking-widest font-bold mb-1">Balanço Líquido de Vagas em Agrupamentos</p>
          <p className="text-3xl font-headline font-bold text-slate-800">{stats.totalSchoolBalance > 0 ? '+' : ''}{stats.totalSchoolBalance}</p>
        </div>
      </section>

      {/* DYNAMIC INSIGHTS GRID */}
      <section className="space-y-4 mb-12">
        <h3 className="text-xl font-headline font-bold text-on-surface tracking-tight px-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">travel_explore</span>
          Análise Comparativa
        </h3>
        
        {/* MAGIC GRID: Becomes 3 columns for 6 items, or 4 columns for 4 items */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${selectedSubject === 'all' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4`}>
          
          {/* 1. GEOGRAPHY (Always visible) */}
          <StatCard 
            label="QZP: Maior Oferta" 
            value={stats.topQzp.name} 
            sub={stats.topQzp.count > 0 ? `+${stats.topQzp.count} vagas` : `${stats.topQzp.count} vagas`} 
            color="text-blue-600" 
          />
          <StatCard 
            label="QZP: Menor Oferta" 
            value={stats.bottomQzp.name} 
            sub={stats.bottomQzp.count > 0 ? `+${stats.bottomQzp.count} vagas` : `${stats.bottomQzp.count} vagas`} 
            color="text-slate-500" 
          />

          {/* 2. SUBJECTS (Only visible when "All" is selected) */}
          {selectedSubject === 'all' && (
            <>
              <StatCard 
                label="Grupo: Maior Procura (Escola)" 
                value={stats.schoolSubjectMostVacancies.name} 
                sub={stats.schoolSubjectMostVacancies.count > 0 ? `+${stats.schoolSubjectMostVacancies.count} vagas` : `${stats.schoolSubjectMostVacancies.count} vagas`} 
                color="text-emerald-700" 
                bgColor="bg-emerald-50/40" 
              />
              <StatCard 
                label="Grupo: Maior Excedente (Escola)" 
                value={stats.schoolSubjectMostSurplus.name} 
                sub={`${stats.schoolSubjectMostSurplus.count} vagas`} 
                color="text-rose-700" 
                bgColor="bg-rose-50/40" 
              />
            </>
          )}

          {/* 3. SCHOOLS (Always visible) */}
          <StatCard 
            label="Escola: Maior Oferta" 
            value={getSchoolName(stats.topSchool.name)} 
            sub={stats.topSchool.count > 0 ? `+${stats.topSchool.count} vagas` : `${stats.topSchool.count} vagas`} 
            color="text-emerald-700" 
            bgColor="bg-emerald-50/40" 
            isSmallText 
          />
          <StatCard 
            label="Escola: Menor Oferta" 
            value={getSchoolName(stats.bottomSchool.name)} 
            sub={`${stats.bottomSchool.count} vagas`} 
            color="text-rose-700" 
            bgColor="bg-rose-50/40" 
            isSmallText 
          />

        </div>
      </section>

      {/* EXPLORE FOOTER */}
      <section className="bg-slate-900 text-white p-8 rounded-2xl relative overflow-hidden shadow-xl mb-12">
        <div className="relative z-10">
          <h3 className="text-xl font-headline font-bold mb-2">Exploração Detalhada</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-sm">Consulte as vagas por escola, concelho ou grupo de recrutamento.</p>
          <Button variant="primary" icon="arrow_forward" onClick={() => navigate('/query')}>
            Iniciar Pesquisa
          </Button>
        </div>
      </section>

      <footer className="pt-6 border-t border-slate-200 flex justify-between items-center opacity-50 text-[11px] font-bold uppercase">
        <p className="text-[11px] font-bold tracking-widest uppercase">
          Dados: <a href="https://diariodarepublica.pt/dr/detalhe/portaria/136-2026-1080123526" target="_blank" rel="noopener noreferrer">Portaria n.º 136/2026/1</a>
        </p>
        <p className="text-[10px] font-medium italic">• {stats.activeSchools} Agrupamentos Analisados</p>
      </footer>
    </div>
  );
}
