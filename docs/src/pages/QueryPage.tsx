// src/pages/QueryPage.tsx
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useVacancies } from '../hooks/useVacancies';

export function QueryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getAvailableSubjects } = useVacancies();
  
  // 1. Define the scope first, enforcing it as 'zone' | 'school' for TypeScript
  const searchScope = (searchParams.get('scope') as 'zone' | 'school') || 'zone';
  const selectedSubjects = searchParams.getAll('subject');

  // 2. Pass the scope into the function!
  const allSubjects = getAvailableSubjects(searchScope);

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
        <h2 className="font-headline text-3xl font-extrabold tracking-tight">Procurar Vagas</h2>
        <p className="text-secondary font-medium mt-1">Defina o tipo de candidatura e o(s) Grupo(s) de Recrutamento que vai concorrer.</p>
      </div>

      <div className="mb-8 bg-surface-container-lowest p-2 rounded-xl flex gap-2 shadow-sm border border-surface-container-high">
        <button 
          onClick={() => setScope('zone')}
          className={`flex-1 py-3 rounded-lg font-headline font-bold text-sm transition-all ${searchScope === 'zone' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
        >
          Concurso Externo (Vagas QZP)
        </button>
        <button 
          onClick={() => setScope('school')}
          className={`flex-1 py-3 rounded-lg font-headline font-bold text-sm transition-all ${searchScope === 'school' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
        >
          Concurso Interno (Vagas QA/ENA)
        </button>
      </div>

      <div className="mb-6">
        <h3 className="font-headline text-lg font-bold mb-3">Target Subjects</h3>
        <div className="flex flex-wrap gap-2">
          {allSubjects.map((sub) => (
            <button
              key={sub.id}
              // Prevent clicking if it's disabled
              onClick={() => !sub.isDisabled && toggleSubject(sub.id)}
              disabled={sub.isDisabled}
              className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-2 transition-colors ${
                sub.isDisabled
                  ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60' // Disabled styling
                  : selectedSubjects.includes(sub.id) 
                  ? 'bg-primary-fixed text-on-primary-fixed border-transparent' // Selected styling
                  : 'bg-surface-container-lowest text-on-surface-variant border-surface-container-high hover:border-primary/50' // Default styling
              }`}
            >
              <span className={`text-xs font-bold mr-1 ${sub.isDisabled ? 'opacity-50' : 'opacity-60'}`}>
                {sub.code}
              </span>
              {sub.name}
              
              {/* Optional: Show the total vacancy count in parenthesis so they know WHY it's disabled */}
              <span className="text-xs ml-1 opacity-50">
                ({sub.totalVacancies})
              </span>

              {selectedSubjects.includes(sub.id) && !sub.isDisabled && (
                <span className="material-symbols-outlined text-[16px]">check</span>
              )}
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