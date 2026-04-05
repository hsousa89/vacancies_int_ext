// src/App.tsx
import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { QueryPage } from './pages/QueryPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<div className="font-headline text-2xl">Dashboard Placeholder</div>} />
        <Route path="/query" element={<QueryPage />} />
        <Route path="/results" element={<div>Results Placeholder</div>} />
      </Route>
    </Routes>
  );
}