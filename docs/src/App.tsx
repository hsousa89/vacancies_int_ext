import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { PreferencesProvider } from './hooks/usePreferences';
import { LocationProvider } from './hooks/useUserLocation';
import { VacancyProvider } from './hooks/useVacancies';
import { Dashboard } from './pages/DashboardPage';
import { FaqsPage } from './pages/FaqsPage';
import { PreferencesPage } from './pages/PreferencesPage';
import { QueryPage } from './pages/QueryPage';
import { Results } from './pages/Results';

export default function App() {
  return (
    <VacancyProvider>
      <PreferencesProvider>
        <LocationProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/query" element={<QueryPage />} />
              <Route path="/results" element={<Results />} />
              <Route path="/preferences" element={<PreferencesPage />} />
              <Route path="/faqs" element={<FaqsPage />} />
            </Route>
          </Routes>
        </LocationProvider>
      </PreferencesProvider>
    </VacancyProvider>
  );
}