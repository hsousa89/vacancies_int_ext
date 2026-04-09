import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DonationBlock } from '../ui/DonationBlock';

export function TopBar() {
  const location = useLocation();
  const [isDonationOpen, setIsDonationOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 w-full z-40 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100">
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
            
            {/* Donation Heart Button */}
            <button 
              onClick={() => setIsDonationOpen(true)}
              className="p-2 rounded-full transition-colors flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500"
              title="Apoiar o Projeto"
            >
              <span className="material-symbols-outlined text-[22px]">favorite</span>
            </button>

            {/* Existing FAQs Button */}
            <Link 
              to="/faqs" 
              className={`p-2 rounded-full transition-colors flex items-center justify-center ${
                location.pathname === '/faqs' 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Ajuda e Perguntas Frequentes"
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: location.pathname === '/faqs' ? '"FILL" 1' : '"FILL" 0' }}>
                help
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* MODAL WRAPPER */}
      {isDonationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Invisible backdrop to close when clicking outside */}
          <div 
            className="absolute inset-0" 
            onClick={() => setIsDonationOpen(false)} 
          />
          
          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-md animate-in zoom-in-95 duration-200">
            <DonationBlock onClose={() => setIsDonationOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}