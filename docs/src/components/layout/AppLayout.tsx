import { Outlet } from 'react-router-dom';
import { VacancyProvider } from '../../hooks/useVacancies'; // Import the provider
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';

export function AppLayout() {
  return (
    <div className="pb-24">
      <TopBar />

      {/* Wrap the main content in the Provider */}
      <VacancyProvider>
        <main className="px-6 py-8">
          <Outlet /> 
        </main>
      </VacancyProvider>

      <BottomNav />
    </div>
  );
}