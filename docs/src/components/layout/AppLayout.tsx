// src/components/layout/AppLayout.tsx
import { Link, Outlet, useLocation } from 'react-router-dom';

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="pb-24">
      {/* TopBar */}
      <header className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center px-6 py-4 w-full">
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-slate-100 transition-colors">
              <span className="material-symbols-outlined text-slate-500">menu</span>
            </button>
            <h1 className="font-headline font-extrabold tracking-tight text-xl text-slate-900">
              Precision Editorial
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content Area (Pages inject here) */}
      <main className="px-6 py-8">
        <Outlet /> 
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md flex justify-around items-center pt-2 pb-6 px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <NavItem to="/" icon="dashboard" label="Dashboard" currentPath={location.pathname} />
        <NavItem to="/query" icon="travel_explore" label="Query" currentPath={location.pathname} />
        <NavItem to="/results" icon="table_chart" label="Results" currentPath={location.pathname} />
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label, currentPath }: { to: string, icon: string, label: string, currentPath: string }) {
  const isActive = currentPath === to;
  return (
    <Link to={to} className={`flex flex-col items-center justify-center px-5 py-1.5 transition-all ${isActive ? 'bg-primary/10 text-primary rounded-2xl transform scale-105' : 'text-slate-500 hover:text-primary'}`}>
      <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
      <span className="font-body text-[11px] font-medium uppercase tracking-wider mt-1">{label}</span>
    </Link>
  );
}