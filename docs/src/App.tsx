// src/App.tsx
import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { VacancyProvider } from './hooks/useVacancies'; // Add this import
import { QueryPage } from './pages/QueryPage';
import { Results } from './pages/Results';

export default function App() {
  return (
    <VacancyProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<div className="font-headline text-2xl">Dashboard Placeholder</div>} />
          <Route path="/query" element={<QueryPage />} />
          <Route path="/results" element={<Results />} />
        </Route>
      </Routes>
    </VacancyProvider>
  );
}