import { Link, useLocation } from 'react-router-dom';

function NavItem({ to, icon, label, currentPath }: { to: string, icon: string, label: string, currentPath: string }) {
  const isActive = currentPath === to;
  
  return (
    <Link 
      to={to} 
      className={`flex flex-col items-center justify-center flex-1 sm:flex-none sm:px-6 py-2 mx-1 sm:mx-2 transition-all ${
        isActive 
          ? 'bg-primary/10 text-primary rounded-2xl transform scale-105' 
          : 'text-slate-500 hover:text-primary'
      }`}
    >
      <span 
        className="material-symbols-outlined text-[22px] sm:text-[24px]" 
        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
      >
        {icon}
      </span>
      <span className="font-body text-[9px] sm:text-[11px] font-medium uppercase tracking-wider mt-1 text-center line-clamp-1">
        {label}
      </span>
    </Link>
  );
}

export function BottomNav() {
  const location = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {/* We use a max-w-md container so the items stay clustered in the middle on desktop screens, 
        and flex-1 on the items ensures they shrink perfectly on small mobiles without overflowing.
      */}
      <div className="max-w-md mx-auto flex justify-between items-center pt-2 pb-6 px-2 sm:px-4">
        <NavItem to="/" icon="dashboard" label="Painel" currentPath={location.pathname} />
        <NavItem to="/query" icon="travel_explore" label="Pesquisa" currentPath={location.pathname} />
        <NavItem to="/results" icon="table_chart" label="Resultados" currentPath={location.pathname} />
        <NavItem to="/preferences" icon="bookmarks" label="Preferências" currentPath={location.pathname} />
      </div>
    </nav>
  );
}