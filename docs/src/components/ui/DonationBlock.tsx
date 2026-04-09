import ReactGA from 'react-ga4';

interface DonationBlockProps {
  onClose?: () => void;
}

export function DonationBlock({ onClose }: DonationBlockProps) {
  
  // Create the tracking function
  const handleDonationClick = () => {
    // Only track if GA4 is initialized (meaning the user accepted the cookie banner)
    if (ReactGA.isInitialized) {
      ReactGA.event({
        category: "Engagement",
        action: "Clicked Ko-fi Button",
        label: "TopBar Modal" // Helps you know exactly where they clicked it
      });
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center relative shadow-2xl">
      
      {/* Close Button */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          title="Fechar"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      )}

      <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4 mt-2">
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>favorite</span>
      </div>
      
      <h3 className="text-lg font-bold text-slate-800 mb-2">Gosta desta ferramenta?</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
        O Profs PT é um projeto desenvolvido de forma independente, gratuito e sem publicidade. 
        Se esta plataforma o ajudou e quer apoiar a manutenção dos servidores, pode pagar-me um café.
      </p>
      
      <a 
        href="https://ko-fi.com/profspt" 
        target="_blank" 
        rel="noopener noreferrer"
        onClick={handleDonationClick}
        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 hover:scale-105 transition-all shadow-md"
      >
        <span className="material-symbols-outlined text-[18px]">local_cafe</span>
        Pagar um café no Ko-fi
      </a>
    </div>
  );
}