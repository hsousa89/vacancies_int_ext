import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useDashboardStats } from '../hooks/useDashboarStats';

export function Dashboard() {
  const stats = useDashboardStats();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-12 px-4">
      <div className="mb-6 pt-4">
        <p className="text-primary font-label text-sm font-bold tracking-wide uppercase flex items-center gap-1.5 mb-1">
          <span className="material-symbols-outlined text-[16px]">bar_chart</span>
          Panorama Nacional 2026
        </p>
        <h2 className="text-3xl font-headline font-extrabold text-slate-900 leading-tight">Painel de Informações</h2>
        <p className="text-slate-500 text-sm mt-1">Análise detalhada do reordenamento e necessidades do sistema educativo.</p>
      </div>

      {/* Hero Card */}
      <div className="bg-emerald-600 p-8 rounded-2xl border border-emerald-50 flex flex-col md:flex-row justify-between items-center mb-6 relative overflow-hidden shadow-lg shadow-emerald-100">
        <div className="z-10 text-center md:text-left">
          <p className="text-emerald-100 font-label text-xs uppercase tracking-widest mb-1 font-bold">Vagas Diretas (Contratação QZP)</p>
          <p className="text-6xl font-headline font-extrabold text-white">{stats.totalZoneVacancies > 0 ? '+' : ''}{stats.totalZoneVacancies}</p>
          <div className="mt-2 flex items-center gap-1.5 text-emerald-100/80 text-xs font-semibold bg-white/10 w-fit px-2 py-1 rounded-full">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>Reforço Nacional de Quadros</span>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Totals Grid */}
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

      {/* Insights Grid */}
      <section className="space-y-4 mb-12">
        <h3 className="text-xl font-headline font-bold text-on-surface tracking-tight px-1">Análise Comparativa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Geography */}
          <StatCard label="QZP: Maior Oferta" value={stats.topQzp.name} sub={`${stats.topQzp.count} vagas`} color="text-blue-600" />
          <StatCard label="QZP: Menor Oferta" value={stats.bottomQzp.name} sub={`${stats.bottomQzp.count} vagas`} color="text-slate-400" />

          {/* School Subjects */}
          <StatCard label="Grupo Maior Procura (Escola)" value={stats.schoolSubjectMostVacancies.name} sub={`${stats.schoolSubjectMostVacancies.count} vagas`} color="text-emerald-700" bgColor="bg-emerald-50/40" />
          <StatCard label="Grupo Maior Excedente (Escola)" value={stats.schoolSubjectMostSurplus.name} sub={`${stats.schoolSubjectMostSurplus.count} vagas`} color="text-rose-700" bgColor="bg-rose-50/40" />

          {/* Specific Schools */}
          <StatCard label="Escola: Top Vagas" value={stats.schoolMostVacancies.name} sub={`${stats.schoolMostVacancies.count} total`} color="text-emerald-700" bgColor="bg-emerald-50/40" isSmallText />
          <StatCard label="Escola: Top Excedente" value={stats.schoolMostSurplus.name} sub={`${stats.schoolMostSurplus.count} total`} color="text-rose-700" bgColor="bg-rose-50/40" isSmallText />
        </div>
      </section>

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
          Dados: <a href="https://diariodarepublica.pt/dr/detalhe/portaria/136-2026-1080123526" target="_blank" rel="noopener noreferrer">Portaria n.º 136/2026/1, de 31 de março</a>
        </p>
        <p className="text-[10px] font-medium italic">• {stats.activeSchools} Agrupamentos Analisados</p>

      </footer>
    </div>
  );
}

// Small helper component to keep JSX DRY
function StatCard({ label, value, sub, color, bgColor = "bg-white", isSmallText = false }: any) {
  return (
    <div className={`${bgColor} p-4 rounded-xl border border-slate-100 shadow-sm`}>
      <span className="text-[9px] font-bold uppercase text-slate-400 block mb-1">{label}</span>
      <p className={`${isSmallText ? 'text-[11px]' : 'text-sm'} font-bold text-slate-900 mb-1 line-clamp-2 leading-tight`}>{value}</p>
      <div className={`${color} font-bold text-xs`}>{sub}</div>
    </div>
  );
}