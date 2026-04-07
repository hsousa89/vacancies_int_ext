import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { TokenOption } from '../components/ui/MultiSelectInput';
import { useVacancies } from './useVacancies';

export function useQueryLogic() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getAvailableSubjects } = useVacancies();
  
  const searchScope = (searchParams.get('scope') as 'zone' | 'school') || 'zone';
  const selectedSubjects = searchParams.getAll('subject');
  const allSubjects = getAvailableSubjects(searchScope);

  const [inputValue, setInputValue] = useState('');

  const setScope = (scope: 'zone' | 'school') => {
    searchParams.set('scope', scope);
    setSearchParams(searchParams);
  };

  const updateUrlParams = (newSet: Set<string>) => {
    searchParams.delete('subject');
    newSet.forEach(sub => searchParams.append('subject', sub));
    setSearchParams(searchParams);
  };

  const toggleSubject = (subjectId: string) => {
    const current = new Set(selectedSubjects);
    if (current.has(subjectId)) {
      current.delete(subjectId);
    } else {
      current.add(subjectId);
      // Clear the input text whenever a user clicks a pill to add it
      setInputValue(''); 
    }
    updateUrlParams(current);
  };

  const removeSubject = (subjectId: string) => {
    const current = new Set(selectedSubjects);
    current.delete(subjectId);
    updateUrlParams(current);
  };

  const handleTokenize = (text: string) => {
    const query = text.toLowerCase().trim();
    if (!query) return;

    let match = allSubjects.find(s => s.code.toLowerCase() === query);
    if (!match) match = allSubjects.find(s => s.name.toLowerCase() === query);
    
    if (!match) {
      const partials = allSubjects.filter(s => 
        s.code.toLowerCase().includes(query) || s.name.toLowerCase().includes(query)
      );
      if (partials.length === 1) match = partials[0];
    }

    if (match) {
      const current = new Set(selectedSubjects);
      current.add(match.id);
      updateUrlParams(current);
      setInputValue(''); 
    }
  };

  const filteredSubjects = useMemo(() => {
    if (!inputValue.trim()) return allSubjects;
    const query = inputValue.toLowerCase().trim();
    return allSubjects.filter(sub => 
      sub.code.toLowerCase().includes(query) || 
      sub.name.toLowerCase().includes(query)
    );
  }, [allSubjects, inputValue]);

  const selectedOptions: TokenOption[] = useMemo(() => {
    return selectedSubjects.map(id => {
      const sub = allSubjects.find(s => s.id === id);
      return { id, label: sub ? `GR ${sub.code}` : id };
    });
  }, [selectedSubjects, allSubjects]);

  const handleRunQuery = () => {
    navigate(`/results?${searchParams.toString()}`);
  };

  return {
    searchScope, setScope,
    selectedSubjects, toggleSubject, removeSubject,
    inputValue, setInputValue, handleTokenize,
    filteredSubjects, selectedOptions,
    handleRunQuery
  };
}