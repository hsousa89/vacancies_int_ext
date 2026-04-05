import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';

export function AppLayout() {
  return (
    <div className="pb-24">
      <TopBar />

      {/* Main Content Area (Pages inject here) */}
      <main className="px-6 py-8">
        <Outlet /> 
      </main>

      <BottomNav />
    </div>
  );
}