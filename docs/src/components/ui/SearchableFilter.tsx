export interface FilterOption {
  id: string;
  label: string;
}

interface SearchableFilterProps {
  title: string;
  placeholder: string;
  query: string;
  onQueryChange: (query: string) => void;
  items: FilterOption[]; // EXPECTS OBJECTS
  selectedItems: string[]; // Still stores the IDs (codes)
  onToggle: (id: string) => void; // Toggles based on ID
  emptyMessage: string;
}

export function SearchableFilter({
  title, placeholder, query, onQueryChange, items, selectedItems, onToggle, emptyMessage
}: SearchableFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-bold text-slate-700">{title}</h4>
      <input 
        type="text" 
        placeholder={placeholder}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="max-h-48 overflow-y-auto bg-slate-50 border border-slate-200 rounded-lg p-2 flex flex-col gap-1">
        {items.length > 0 ? (
          items.map(item => (
            <label key={item.id} className="flex items-center gap-2 text-sm text-slate-700 p-1.5 hover:bg-slate-200 rounded cursor-pointer">
              <input 
                type="checkbox" 
                checked={selectedItems.includes(item.id)} // Checks against ID
                onChange={() => onToggle(item.id)} // Passes ID
                className="rounded border-slate-300 w-4 h-4 text-primary focus:ring-primary" 
              />
              <span className="flex-1 leading-tight">{item.label}</span>
            </label>
          ))
        ) : (
          <p className="text-xs text-slate-400 text-center py-2">{emptyMessage}</p>
        )}
      </div>
    </div>
  );
}