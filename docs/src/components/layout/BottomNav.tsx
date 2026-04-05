import { Link, useLocation } from 'react-router-dom';

// We keep NavItem scoped to this file since it's only used by BottomNav
function NavItem({ to, icon, label, currentPath }: { to: string, icon: string, label: string, currentPath: string }) {
  const isActive = currentPath === to;
  
  return (
    <Link 
      to={to} 
      className={`flex flex-col items-center justify-center px-5 py-1.5 transition-all ${
        isActive 
          ? 'bg-primary/10 text-primary rounded-2xl transform scale-105' 
          : 'text-slate-500 hover:text-primary'
      }`}
    >
      <span 
        className="material-symbols-outlined" 
        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
      >
        {icon}
      </span>
      <span className="font-body text-[11px] font-medium uppercase tracking-wider mt-1">
        {label}
      </span>
    </Link>
  );
}

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md flex justify-around items-center pt-2 pb-6 px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <NavItem to="/" icon="dashboard" label="Dashboard" currentPath={location.pathname} />
      <NavItem to="/query" icon="travel_explore" label="Query" currentPath={location.pathname} />
      <NavItem to="/results" icon="table_chart" label="Results" currentPath={location.pathname} />
    </nav>
  );
}