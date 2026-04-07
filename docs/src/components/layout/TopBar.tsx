import { Link, useLocation } from 'react-router-dom';

export function TopBar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100">
      {/* max-w-4xl keeps the topbar aligned with the content width of your pages */}
      <div className="flex justify-between items-center px-4 sm:px-6 py-3 w-full max-w-4xl mx-auto">
        
        {/* Logo / Home Link */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-primary shadow-sm">
            <span className="material-symbols-outlined text-[20px]">home</span>
          </div>
          <h1 className="font-headline font-extrabold tracking-tight text-xl text-slate-900 hidden sm:block">
            Profs PT
          </h1>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          <Link 
            to="/faqs" 
            className={`p-2 rounded-full transition-colors flex items-center justify-center ${
              location.pathname === '/faqs' 
                ? 'bg-primary/10 text-primary' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Ajuda e Perguntas Frequentes"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: location.pathname === '/faqs' ? "'FILL' 1" : "'FILL' 0" }}>
              help
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}