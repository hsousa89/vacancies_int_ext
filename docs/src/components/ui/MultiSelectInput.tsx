import { type KeyboardEvent } from 'react';

export interface TokenOption {
  id: string;
  label: string;
}

interface MultiSelectInputProps {
  selectedOptions: TokenOption[];
  inputValue: string;
  onInputChange: (val: string) => void;
  onRemove: (id: string) => void;
  onTokenize: (val: string) => void;
  placeholder?: string;
  maxItems?: number;
}

export function MultiSelectInput({
  selectedOptions,
  inputValue,
  onInputChange,
  onRemove,
  onTokenize,
  placeholder = "Pesquisar ou adicionar...",
  maxItems
}: MultiSelectInputProps) {
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
      e.preventDefault();
      if (inputValue.trim()) {
        onTokenize(inputValue.trim());
      }
    } else if (e.key === 'Backspace' && inputValue === '' && selectedOptions.length > 0) {
      onRemove(selectedOptions[selectedOptions.length - 1].id);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(',') || val.includes(';')) {
      const parts = val.split(/[,;]/);
      const toTokenize = parts.slice(0, -1);
      const remaining = parts[parts.length - 1];

      toTokenize.forEach(t => {
        if (t.trim()) onTokenize(t.trim());
      });
      onInputChange(remaining);
    } else {
      onInputChange(val);
    }
  };

  // Check if we have reached the limit
  const isLimitReached = maxItems !== undefined && selectedOptions.length >= maxItems;

  return (
    <div className={`flex flex-wrap items-center gap-2 p-2 border border-slate-200 rounded-xl bg-white shadow-sm transition-all min-h-[52px] ${!isLimitReached ? 'focus-within:ring-2 focus-within:ring-primary focus-within:border-primary cursor-text' : ''}`}>
      <span className="material-symbols-outlined text-slate-400 ml-2">search</span>
      
      {/* Render the "Chips" */}
      {selectedOptions.map(opt => (
        <span 
          key={opt.id} 
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-primary/10 text-primary rounded-md border border-primary/20 animate-in zoom-in-95 duration-200"
        >
          {opt.label}
          <button 
            onClick={() => onRemove(opt.id)} 
            className="text-primary hover:text-rose-600 transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </span>
      ))}
      
      {/* Conditionally render the input field only if limit is not reached */}
      {!isLimitReached && (
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={selectedOptions.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[150px] bg-transparent outline-none text-sm text-slate-800 placeholder-slate-400 p-1"
        />
      )}
    </div>
  );
}