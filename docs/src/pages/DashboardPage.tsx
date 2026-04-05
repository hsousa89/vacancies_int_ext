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
    const topSubjectZone = Object.entries(zoneSubjectCounts).sort((a, b) => b[1] - a[1])[0];

    // --- SCHOOL CALCULATIONS ---
    const totalSchoolNeeds = schools.filter(v => v.count > 0).reduce((sum, v) => sum + v.count, 0);
    const totalSchoolSurplus = schools.filter(v => v.count < 0).reduce((sum, v) => sum + v.count, 0);
    const totalSchoolBalance = totalSchoolNeeds + totalSchoolSurplus;

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
      // Zone comparison
      topQzp: { name: sortedQzps[0]?.[0], count: sortedQzps[0]?.[1] },
      bottomQzp: { name: sortedQzps[sortedQzps.length - 1]?.[0], count: sortedQzps[sortedQzps.length - 1]?.[1] },
      topSubjectZone: { name: topSubjectZone?.[0], count: topSubjectZone?.[1] },
      // School comparison (Subject level)
      topSurplusSubject: { name: sortedSchoolSubjects[0]?.[0], count: sortedSchoolSubjects[0]?.[1] },
      topDeficitSubject: { name: sortedSchoolSubjects[sortedSchoolSubjects.length - 1]?.[0], count: sortedSchoolSubjects[sortedSchoolSubjects.length - 1]?.[1] },
      activeSchools: new Set(schools.map(s => s.school)).size
    };
  }, [flatResults]);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <section className="mb-8">
        <p className="text-secondary font-label text-sm font-medium tracking-wide">PANORAMA NACIONAL 2026</p>
        <h2 className="text-3xl font-headline font-extrabold text-on-surface leading-tight">Painel de Insights</h2>
      </section>

      {/* TOP ROW: QZP National Vacancies */}
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-center mb-6 relative overflow-hidden shadow-xl">
        <div className="z-10 text-center md:text-left">
          <p className="text-slate-400 font-label text-xs uppercase tracking-widest mb-1">Vagas Diretas (Hiring QZP)</p>
          <p className="text-6xl font-headline font-extrabold text-white">+{stats.totalZoneVacancies}</p>
        </div>
        <div className="z-10 mt-6 md:mt-0">
          <button 
            onClick={() => navigate('/query?scope=zone')}
            className="bg-primary text-white px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-primary-container transition-all"
          >
            Explorar por QZP
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
      </div>

      {/* SECOND ROW: School Level Balance (3 Columns) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
          <p className="text-emerald-900/60 font-label text-[10px] uppercase tracking-widest font-bold mb-1">Necessidades (+)</p>
          <p className="text-3xl font-headline font-bold text-emerald-700">+{stats.totalSchoolNeeds}</p>
          <p className="text-xs text-emerald-600/80 mt-1">Vagas em falta nas escolas</p>
        </div>
        <div className="bg-rose-50 p-6 rounded-xl border border-rose-100">
          <p className="text-rose-900/60 font-label text-[10px] uppercase tracking-widest font-bold mb-1">Excedentes (-)</p>
          <p className="text-3xl font-headline font-bold text-rose-700">{stats.totalSchoolSurplus}</p>
          <p className="text-xs text-rose-600/80 mt-1">Professores em sobre-número</p>
        </div>
        <div className="bg-slate-100 p-6 rounded-xl border border-slate-200">
          <p className="text-slate-900/60 font-label text-[10px] uppercase tracking-widest font-bold mb-1">Balanço Líquido (=)</p>
          <p className="text-3xl font-headline font-bold text-slate-800">{stats.totalSchoolBalance > 0 ? '+' : ''}{stats.totalSchoolBalance}</p>
          <p className="text-xs text-slate-500 mt-1">Saldo final do reordenamento</p>
        </div>
      </section>

      {/* ATTENTION POINTS: Multi-column grid */}
      <section className="space-y-6">
        <div className="flex justify-between items-end px-1">
          <h3 className="text-xl font-headline font-bold text-on-surface tracking-tight">Análise Comparativa</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Zone: Max */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-blue-600">vertical_align_top</span>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">QZP com Mais Vagas</span>
            </div>
            <p className="text-lg font-bold text-slate-900 mb-1">{stats.topQzp.name}</p>
            <div className="text-blue-600 font-bold text-sm">+{stats.topQzp.count} lugares</div>
          </div>

          {/* Zone: Min */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-slate-400">vertical_align_bottom</span>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">QZP com Menos Vagas</span>
            </div>
            <p className="text-lg font-bold text-slate-900 mb-1">{stats.bottomQzp.name}</p>
            <div className="text-slate-500 font-bold text-sm">+{stats.bottomQzp.count} lugares</div>
          </div>

          {/* Zone: Subject Top */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-teal-600">groups</span>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">Grupo Líder (QZP)</span>
            </div>
            <p className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">{stats.topSubjectZone.name}</p>
            <div className="text-teal-600 font-bold text-sm">+{stats.topSubjectZone.count} contratados</div>
          </div>

          {/* School: Subject Max (Surplus) */}
          <div className="bg-emerald-50/30 p-5 rounded-xl border border-emerald-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-emerald-600">trending_up</span>
              <span className="text-[10px] font-bold uppercase text-emerald-700/50 tracking-tighter">Maior Procura (Escola)</span>
            </div>
            <p className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">{stats.topSurplusSubject.name}</p>
            <div className="text-emerald-700 font-bold text-sm">+{stats.topSurplusSubject.count} vagas</div>
          </div>

          {/* School: Subject Min (Deficit) */}
          <div className="bg-rose-50/30 p-5 rounded-xl border border-rose-100 shadow-sm lg:col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-rose-600">trending_down</span>
              <span className="text-[10px] font-bold uppercase text-rose-700/50 tracking-tighter">Maior Carência (Escola)</span>
            </div>
            <p className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">{stats.topDeficitSubject.name}</p>
            <div className="text-rose-700 font-bold text-sm">{stats.topDeficitSubject.count} vagas</div>
          </div>
        </div>
      </section>

      {/* FOOTNOTE */}
      <footer className="mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="material-symbols-outlined text-sm">database</span>
          <p className="text-[11px] font-medium tracking-wide uppercase">
            Dados: <a href="https://diariodarepublica.pt/dr/detalhe/portaria/136-2026-1080123526" target="_blank" rel="noopener noreferrer">Portaria n.º 136/2026/1, de 31 de março</a> • {stats.activeSchools} Agrupamentos Analisados
          </p>
        </div>
        <p className="text-[10px] text-slate-400 text-center md:text-right">
          Os dados apresentados são simulações baseadas na estrutura de QZP e QA/ENA.
        </p>
      </footer>
    </div>
  );
}