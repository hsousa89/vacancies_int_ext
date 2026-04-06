import { useUserLocation } from '../../hooks/useUserLocation';
import { Button } from './Button';

export function LocationBanner() {
  const { userLocation, locationLabel, locationSource, isLocating, locationError, requestLocation, clearLocation } = useUserLocation();

  // If a location is currently set (either GPS or Manual)
  if (userLocation) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 animate-in fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined">{locationSource === 'gps' ? 'my_location' : 'push_pin'}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-900">
              Ponto de partida ativo
            </p>
            <p className="text-xs text-emerald-700 mt-0.5 font-medium">
              {locationLabel}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={clearLocation} className="w-full sm:w-auto text-xs py-2 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200">
          Desativar Localização
        </Button>
      </div>
    );
  }

  // Default state asking for location
  return (
    <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined">location_on</span>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">Ver distâncias até às escolas?</p>
          <p className="text-xs text-slate-600 mt-0.5 max-w-lg">
            {locationError ? <span className="text-rose-600">{locationError}</span> : "Ative o GPS ou clique no ícone (📍) de uma escola para usá-la como ponto de partida."}
          </p>
        </div>
      </div>
      <Button variant="outline" onClick={requestLocation} disabled={isLocating} className="w-full sm:w-auto text-xs py-2">
        {isLocating ? 'A obter...' : 'Permitir GPS'}
      </Button>
    </div>
  );
}