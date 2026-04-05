// src/pages/QueryPage.tsx
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useVacancies } from '../hooks/useVacancies';

export function QueryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getAvailableSubjects } = useVacancies();
  
  // URL State
  const searchScope = searchParams.get('scope') || 'zone';
  const selectedSubjects = searchParams.getAll('subject');

  // Load subjects dynamically from your JSON
  const allSubjects = getAvailableSubjects();

  const setScope = (scope: 'zone' | 'school') => {
    searchParams.set('scope', scope);
    setSearchParams(searchParams);
  };

  const toggleSubject = (subjectId: string) => {
    const current = new Set(selectedSubjects);
    if (current.has(subjectId)) current.delete(subjectId);
    else current.add(subjectId);
    
    searchParams.delete('subject');
    current.forEach(sub => searchParams.append('subject', sub));
    setSearchParams(searchParams);
  };

  const handleRunQuery = () => {
    // Navigate to results page, preserving the search parameters
    navigate(`/results?${searchParams.toString()}`);
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8">
        <h2 className="font-headline text-3xl font-extrabold tracking-tight">Placement Query</h2>
        <p className="text-secondary font-medium mt-1">Define your search scope and targets.</p>
      </div>

      <div className="mb-8 bg-surface-container-lowest p-2 rounded-xl flex gap-2 shadow-sm border border-surface-container-high">
        <button 
          onClick={() => setScope('zone')}
          className={`flex-1 py-3 rounded-lg font-headline font-bold text-sm transition-all ${searchScope === 'zone' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
        >
          Zone Aggregates (Macro)
        </button>
        <button 
          onClick={() => setScope('school')}
          className={`flex-1 py-3 rounded-lg font-headline font-bold text-sm transition-all ${searchScope === 'school' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
        >
          School Tenders (Micro)
        </button>
      </div>

      <div className="mb-6">
        <h3 className="font-headline text-lg font-bold mb-3">Target Subjects</h3>
        <div className="flex flex-wrap gap-2">
          {allSubjects.map(sub => (
            <button
              key={sub.id}
              onClick={() => toggleSubject(sub.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-2 transition-colors ${
                selectedSubjects.includes(sub.id) 
                  ? 'bg-primary-fixed text-on-primary-fixed border-transparent' 
                  : 'bg-surface-container-lowest text-on-surface-variant border-surface-container-high hover:border-primary/50'
              }`}
            >
              <span className="opacity-60 text-xs font-bold mr-1">{sub.code}</span>
              {sub.name}
              {selectedSubjects.includes(sub.id) && <span className="material-symbols-outlined text-[16px]">check</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Action Button to Run Query */}
      {selectedSubjects.length > 0 && (
        <div className="fixed bottom-24 right-6 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <button 
            onClick={handleRunQuery}
            className="h-14 px-6 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transform hover:scale-105 transition-all font-bold"
          >
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>manage_search</span>
            Run Query
          </button>
        </div>
      )}
    </div>
  );
}