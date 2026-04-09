import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { CookieBanner } from './components/ui/CookieBanner';
import { usePageTracking } from './hooks/usePageTracking';
import { PreferencesProvider } from './hooks/usePreferences';
import { LocationProvider } from './hooks/useUserLocation';
import { VacancyProvider } from './hooks/useVacancies';
import { Dashboard } from './pages/DashboardPage';
import { FaqsPage } from './pages/FaqsPage';
import { PreferencesPage } from './pages/PreferencesPage';
import { QueryPage } from './pages/QueryPage';
import { Results } from './pages/Results';

// 1. Create the tracker component right here
function RouteTracker({ children }: { children: React.ReactNode }) {
  usePageTracking();
  return <>{children}</>;
}

export default function App() {
  return (
    <VacancyProvider>
      <PreferencesProvider>
        <LocationProvider>
          {/* 2. Wrap your Routes and add the Banner inside the RouteTracker */}
          <RouteTracker>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/query" element={<QueryPage />} />
                <Route path="/results" element={<Results />} />
                <Route path="/preferences" element={<PreferencesPage />} />
                <Route path="/faqs" element={<FaqsPage />} />
              </Route>
            </Routes>
            <CookieBanner />
          </RouteTracker>
        </LocationProvider>
      </PreferencesProvider>
    </VacancyProvider>
  );
}