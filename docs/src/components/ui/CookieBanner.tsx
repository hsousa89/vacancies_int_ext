import { useEffect, useState } from 'react';
import ReactGA from 'react-ga4';
import { Button } from './Button';

const MEASUREMENT_ID = "G-BTV1HXYCP3";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('ga_cookie_consent');
    if (consent === 'granted') {
      // If they already accepted in a previous session, initialize GA4 immediately
      ReactGA.initialize(MEASUREMENT_ID);
    } else if (consent === null) {
      // If they haven't answered yet, show the banner
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('ga_cookie_consent', 'granted');
    ReactGA.initialize(MEASUREMENT_ID);
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('ga_cookie_consent', 'denied');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white border border-slate-200 shadow-xl rounded-xl p-4 z-50 animate-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-xl">cookie</span>
        <div>
          <p className="text-sm text-slate-600 leading-tight mb-3">
            Usamos cookies analíticos para entender como a plataforma é utilizada e melhorar a sua experiência.
          </p>
          <div className="flex gap-2">
            <Button variant="primary" className="flex-1 text-xs py-1.5" onClick={handleAccept}>
              Aceitar
            </Button>
            <Button variant="outline" className="flex-1 text-xs py-1.5" onClick={handleDecline}>
              Recusar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}