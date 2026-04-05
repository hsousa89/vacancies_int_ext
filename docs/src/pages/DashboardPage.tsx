import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVacancies } from '../hooks/useVacancies';

export function Dashboard() {
  const { flatResults } = useVacancies();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const zones = flatResults.filter(v => v.type === 'Zone');
    const schools = flatResults.filter(v => v.type === 'School');

    // --- ZONE CALCULATIONS ---
    const qzpCounts = zones.reduce((acc, v) => {
      acc[v.qzp] = (acc[v.qzp] || 0) + v.count;
      return acc;
    }, {} as Record<string, number>);
    const sortedQzps = Object.entries(qzpCounts).sort((a, b) => b[1] - a[1]);

    const zoneSubjectCounts = zones.reduce((acc, v) => {
      acc[v.subjectGroup] = (acc[v.subjectGroup] || 0) + v.count;
      return acc;
    }, {} as Record<string, number>);
    const sortedZoneSubjects = Object.entries(zoneSubjectCounts).sort((a, b) => b[1] - a[1]);

    // --- SCHOOL CALCULATIONS ---
    const totalSchoolNeeds = schools.filter(v => v.count > 0).reduce((sum, v) => sum + v.count, 0);
    const totalSchoolSurplus = schools.filter(v => v.count < 0).reduce((sum, v) => sum + v.count, 0);
    const totalSchoolBalance = totalSchoolNeeds + totalSchoolSurplus;

    // School Leaderboard (By Net Total per School)
    const schoolTotalsMap = schools.reduce((acc, v) => {
      acc[v.school!] = (acc[v.school!] || 0) + v.count;
      return acc;
    }, {} as Record<string, number>);
    const sortedSchools = Object.entries(schoolTotalsMap).sort((a, b) => b[1] - a[1]);

    // Subject Leaderboard (School level)
    const schoolSubjectCounts = schools.reduce((acc, v) => {
      acc[v.subjectGroup] = (acc[v.subjectGroup] || 0) + v.count;
      return acc;
    }, {} as Record<string, number>);
    const sortedSchoolSubjects = Object.entries(schoolSubjectCounts).sort((a, b) => b[1] - a[1]);

    return {
      totalZoneVacancies: zones.reduce((sum, v) => sum + v.count, 0),
      totalSchoolNeeds,
      totalSchoolSurplus,
      totalSchoolBalance,
      // Zone Insights
      topQzp: { name: sortedQzps[0]?.[0], count: sortedQzps[0]?.[1] },
      bottomQzp: { name: sortedQzps[sortedQzps.length - 1]?.[0], count: sortedQzps[sortedQzps.length - 1]?.[1] },
      topSubZone: { name: sortedZoneSubjects[0]?.[0], count: sortedZoneSubjects[0]?.[1] },
      bottomSubZone: { name: sortedZoneSubjects[sortedZoneSubjects.length - 1]?.[0], count: sortedZoneSubjects[sortedZoneSubjects.length - 1]?.[1] },
      // School Subject Insights
      topSubSchool: { name: sortedSchoolSubjects[0]?.[0], count: sortedSchoolSubjects[0]?.[1] },
      bottomSubSchool: { name: sortedSchoolSubjects[sortedSchoolSubjects.length - 1]?.[0], count: sortedSchoolSubjects[sortedSchoolSubjects.length - 1]?.[1] },
      // Specific School Insights
      topSchool: { name: sortedSchools[sortedSchools.length - 1]?.[0], count: sortedSchools[sortedSchools.length - 1]?.[1] },
      bottomSchool: { name: sortedSchools[0]?.[0], count: sortedSchools[0]?.[1] },
      activeSchools: new Set(schools.map(s => s.school)).size
    };
  }, [flatResults]);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-12 px-4">
      {/* Header */}
      <section className="mb-8 pt-4">
        <p className="text-secondary font-label text-sm font-medium tracking-wide">PANORAMA NACIONAL 2026</p>
        <h2 className="text-3xl font-headline font-extrabold text-on-surface leading-tight">Insight Dashboard</h2>
      </section>

      {/* TOP ROW: Hero Emerald Card */}
      <div className="bg-emerald-600 p-8 rounded-2xl border border-emerald-500 flex flex-col md:flex-row justify-between items-center mb-6 relative overflow-hidden shadow-lg shadow-emerald-100">
        <div className="z-10 text-center md:text-left">
          <p className="text-emerald-100 font-label text-xs uppercase tracking-widest mb-1 font-bold">Vagas Diretas (Contratação QZP)</p>
          <p className="text-6xl font-headline font-extrabold text-white">+{stats.totalZoneVacancies}</p>
          <div className="mt-2 flex items-center gap-1.5 text-emerald-100/80 text-xs font-semibold bg-white/10 w-fit px-2 py-1 rounded-full">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>Reforço Nacional de Quadros</span>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* SECOND ROW: School Level Balance */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
          <p className="text-emerald-900/60 font-label text-[10px] uppercase tracking-widest font-bold mb-1">Necessidades Escolas (+)</p>
          <p className="text-3xl font-headline font-bold text-emerald-700">+{stats.totalSchoolNeeds}</p>
        </div>
        <div className="bg-rose-50 p-6 rounded-xl border border-rose-100">
          <p className="text-rose-900/60 font-label text-[10px] uppercase tracking-widest font-bold mb-1">Excedentes Escolas (-)</p>
          <p className="text-3xl font-headline font-bold text-rose-700">{stats.totalSchoolSurplus}</p>
        </div>
        <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-900/60 font-label text-[10px] uppercase tracking-widest font-bold mb-1">Balanço Líquido Escolar (=)</p>
          <p className="text-3xl font-headline font-bold text-slate-800">{stats.totalSchoolBalance > 0 ? '+' : ''}{stats.totalSchoolBalance}</p>
        </div>
      </section>

      {/* ATTENTION POINTS: The Complete Grid */}
      <section className="space-y-4 mb-12">
        <h3 className="text-xl font-headline font-bold text-on-surface tracking-tight px-1">Análise Comparativa</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* ZONE GEOGRAPHY */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <span className="text-[9px] font-bold uppercase text-slate-400 block mb-1">QZP: Maior Oferta</span>
            <p className="text-sm font-bold text-slate-900 mb-1">{stats.topQzp.name}</p>
            <div className="text-blue-600 font-bold text-xs">+{stats.topQzp.count} vagas</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <span className="text-[9px] font-bold uppercase text-slate-400 block mb-1">QZP: Menor Oferta</span>
            <p className="text-sm font-bold text-slate-900 mb-1">{stats.bottomQzp.name}</p>
            <div className="text-slate-400 font-bold text-xs">+{stats.bottomQzp.count} vagas</div>
          </div>

          {/* ZONE SUBJECTS */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <span className="text-[9px] font-bold uppercase text-teal-600 block mb-1">Grupo Maior Procura (QZP)</span>
            <p className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">{stats.topSubZone.name}</p>
            <div className="text-teal-600 font-bold text-xs">+{stats.topSubZone.count} vagas</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <span className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Grupo Menor Procura (QZP)</span>
            <p className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">{stats.bottomSubZone.name}</p>
            <div className="text-slate-400 font-bold text-xs">+{stats.bottomSubZone.count} vagas</div>
          </div>

          {/* SCHOOL SUBJECTS */}
          <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 shadow-sm">
            <span className="text-[9px] font-bold uppercase text-emerald-700/60 block mb-1">Grupo Maior Procura (QA/ENA)</span>
            <p className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">{stats.bottomSubSchool.name}</p>
            <div className="text-emerald-700 font-bold text-xs">{stats.bottomSubSchool.count} vagas</div>
          </div>
          <div className="bg-rose-50/40 p-4 rounded-xl border border-rose-100 shadow-sm">
            <span className="text-[9px] font-bold uppercase text-rose-700/60 block mb-1">Grupo Maior Excedente (QA/ENA)</span>
            <p className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">{stats.topSubSchool.name}</p>
            <div className="text-rose-700 font-bold text-xs">+{stats.topSubSchool.count} vagas</div>
          </div>

          {/* SPECIFIC SCHOOLS */}
          <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 shadow-sm">
            <span className="text-[9px] font-bold uppercase text-emerald-700/60 block mb-1">Escola: Top Vagas</span>
            <p className="text-[11px] font-bold text-slate-900 mb-1 line-clamp-2 leading-tight">{stats.topSchool.name}</p>
            <div className="text-emerald-700 font-bold text-xs">+{stats.topSchool.count} total</div>
          </div>
          <div className="bg-rose-50/40 p-4 rounded-xl border border-rose-100 shadow-sm">
            <span className="text-[9px] font-bold uppercase text-rose-700/60 block mb-1">Escola: Top Excedente</span>
            <p className="text-[11px] font-bold text-slate-900 mb-1 line-clamp-2 leading-tight">{stats.bottomSchool.name}</p>
            <div className="text-rose-700 font-bold text-xs">{stats.bottomSchool.count} total</div>
          </div>
        </div>
      </section>

      {/* QUICK ACTION: Bottom Slate Section */}
      <section className="bg-slate-900 text-white p-8 rounded-2xl relative overflow-hidden shadow-xl mb-12">
        <div className="relative z-10">
          <h3 className="text-xl font-headline font-bold mb-2">Exploração Detalhada</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-sm">Consulte as vagas por escola, concelho ou grupo de recrutamento com filtros avançados.</p>
          <button 
            onClick={() => navigate('/query')}
            className="bg-primary text-white px-6 py-3 rounded-full font-label font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            Iniciar Pesquisa
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 flex items-center justify-center pointer-events-none">
          <span className="material-symbols-outlined text-[140px]">manage_search</span>
        </div>
      </section>

      {/* FOOTNOTE */}
      <footer className="pt-6 border-t border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 opacity-50">
          <div className="flex items-center gap-2 text-slate-900">
            <span className="material-symbols-outlined text-sm">inventory_2</span>
            <p className="text-[11px] font-bold tracking-widest uppercase">
              Dados: <a href="https://diariodarepublica.pt/dr/detalhe/portaria/136-2026-1080123526" target="_blank" rel="noopener noreferrer">Portaria n.º 136/2026/1, de 31 de março</a>
            </p>
          </div>
          <p className="text-[10px] font-medium italic">• {stats.activeSchools} Agrupamentos Analisados</p>
        </div>
      </footer>
    </div>
  );
}