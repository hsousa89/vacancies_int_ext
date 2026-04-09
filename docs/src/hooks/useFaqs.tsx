import { useMemo, useState } from 'react';
import faqsData from '../data/faqs.json';

export function useFaqs() {
  // --- SEARCH & FILTER STATES ---
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  // --- FORM STATES ---
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [fileLink, setFileLink] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Basic email validation regex
  const isEmailValid = email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 1. Extract all unique labels dynamically from the JSON
  const allLabels = useMemo(() => {
    const labels = new Set<string>();
    faqsData.forEach(faq => {
      if (faq.labels) {
        faq.labels.split(',').forEach(l => labels.add(l.trim()));
      }
    });
    return Array.from(labels).sort();
  }, []);

  // 2. Universal Search Logic (Labels + Free Text)
  const filteredFaqs = useMemo(() => {
    if (activeFilters.length === 0) return faqsData;

    return faqsData.filter(faq => {
      // Create a giant searchable string out of the Q&A
      const searchableText = `${faq.question} ${faq.answer}`.toLowerCase();
      const faqLabels = faq.labels ? faq.labels.split(',').map(l => l.trim().toLowerCase()) : [];

      // For an FAQ to show up, it must match ALL active tokens
      return activeFilters.every(filter => {
        const query = filter.toLowerCase();
        // It's a match if the token is an exact label OR if it exists inside the text
        return faqLabels.includes(query) || searchableText.includes(query);
      });
    });
  }, [activeFilters]);

  // 3. MultiSelect Tokenizer Handlers
  const handleTokenize = (text: string) => {
    const query = text.trim();
    if (!query) return;
    
    // Prevent adding the exact same token twice
    if (!activeFilters.includes(query)) {
      setActiveFilters(prev => [...prev, query]);
    }
    setInputValue('');
  };

  const handleRemoveFilter = (id: string) => {
    setActiveFilters(prev => prev.filter(f => f !== id));
  };

  // 4. Handle Google Forms silent submission
  const handleSubmitQuestion = async (e: React.FormEvent<HTMLFormElement>) => { // <-- Fixed TS Warning Here!
    e.preventDefault();
    if (!question.trim()) return;
    if (email !== '' && !isEmailValid) return; 

    setSubmitStatus('loading');

    // TODO: Paste your Google Form URL here
    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdZ3wdIsyoUUPO7rnhclD-A6Pvyou_lBE4kkYuoq7U4wdkWkA/formResponse";
    
    const formData = new FormData();
    formData.append('entry.1832605808', email);       // Email
    formData.append('entry.1630106028', question);    // Question
    formData.append('entry.676149961', fileLink);     // File Link

    try {
      await fetch(FORM_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
      });

      setSubmitStatus('success');
      setEmail('');
      setQuestion('');
      setFileLink('');
      setTimeout(() => setSubmitStatus('idle'), 3000);
      
    } catch (error) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  return {
    // Search Data
    allLabels,
    filteredFaqs,
    activeFilters,
    inputValue, setInputValue,
    handleTokenize, handleRemoveFilter,
    
    // Form Data
    email, setEmail, isEmailValid,
    question, setQuestion,
    fileLink, setFileLink,
    submitStatus, handleSubmitQuestion
  };
}