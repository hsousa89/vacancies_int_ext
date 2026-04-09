import { useMemo } from 'react';
import { MultiSelectInput, type TokenOption } from '../components/ui/MultiSelectInput';
import { useFaqs } from '../hooks/useFaqs';

// NEW: Tiny utility to convert Markdown links [Text](URL) into styled React elements
function formatTextWithLinks(text: string) {
  // Regex looks for [text](url)
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // 1. Push normal text before the link
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // 2. Push the beautifully styled React link
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:text-emerald-700 underline underline-offset-2 font-bold transition-colors"
        onClick={(e) => e.stopPropagation()} // Prevents the accordion from toggling when clicking the link
      >
        {match[1]}
      </a>
    );
    lastIndex = regex.lastIndex;
  }
  
  // 3. Push any remaining normal text after the last link
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

export function FaqsPage() {
  const {
    allLabels, filteredFaqs,
    activeFilters, inputValue, setInputValue,
    handleTokenize, handleRemoveFilter,
    email, setEmail, isEmailValid,
    question, setQuestion,
    fileLink, setFileLink,
    submitStatus, handleSubmitQuestion
  } = useFaqs();

  const suggestedLabels = useMemo(() => {
    if (!inputValue.trim()) return [];
    const query = inputValue.toLowerCase().trim();
    return allLabels.filter(label => 
      label.toLowerCase().includes(query) && !activeFilters.includes(label)
    );
  }, [inputValue, allLabels, activeFilters]);

  const selectedOptions: TokenOption[] = useMemo(() => {
    return activeFilters.map(filter => {
      const isKnownLabel = allLabels.some(l => l.toLowerCase() === filter.toLowerCase());
      return {
        id: filter,
        label: isKnownLabel ? `🏷️ ${filter}` : `🔍 ${filter}`
      };
    });
  }, [activeFilters, allLabels]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-300 pb-10 px-4">
      
      {/* Header */}
      <div className="mb-6 pt-4">
        <p className="text-primary font-label text-sm font-bold tracking-wide uppercase flex items-center gap-1.5 mb-1">
          <span className="material-symbols-outlined text-[16px]">help</span>
          Apoio
        </p>
        <h2 className="text-3xl font-headline font-extrabold text-slate-900 leading-tight">Perguntas Frequentes</h2>
        <p className="text-slate-500 text-sm mt-2">
          Informações úteis sobre os procedimentos concursais e a plataforma SIGRHE.
        </p>
      </div>

      {/* Smart Search & Filter Input */}
      <div className="relative mb-8 z-20">
        <MultiSelectInput
          selectedOptions={selectedOptions}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onRemove={handleRemoveFilter}
          onTokenize={handleTokenize}
          placeholder="Pesquise por palavras (ex: recibo) ou categorias..."
        />

        {inputValue.trim().length > 0 && suggestedLabels.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            <ul className="py-1 flex flex-col">
              {suggestedLabels.map(label => (
                <li 
                  key={label}
                  onClick={() => handleTokenize(label)}
                  className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center gap-2.5 transition-colors border-b border-slate-50 last:border-0 text-sm font-bold text-slate-700"
                >
                  <span className="material-symbols-outlined text-[18px] text-slate-400">label</span>
                  {label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* FAQs Accordion List */}
      <div className="flex flex-col gap-3 mb-16 relative z-10">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <details 
              key={index} 
              className="group bg-white border border-slate-200 rounded-xl shadow-sm [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none text-slate-800 font-bold hover:text-primary transition-colors">
                <span className="pr-4 leading-tight">{faq.question}</span>
                <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform duration-300">
                  expand_more
                </span>
              </summary>
              
              <div className="p-4 pt-0 border-t border-slate-100 mt-2 text-slate-600 text-sm leading-relaxed">
                {/* NEW: Using the text formatter here! */}
                <p className="mb-3 whitespace-pre-line">{formatTextWithLinks(faq.answer)}</p>
                
                {faq.labels && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {faq.labels.split(',').map((label, idx) => (
                      <span 
                        key={idx} 
                        onClick={() => handleTokenize(label.trim())}
                        className="bg-slate-100 hover:bg-primary/10 hover:text-primary cursor-pointer text-slate-500 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors"
                      >
                        {label.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </details>
          ))
        ) : (
          <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Nenhuma pergunta encontrada com os termos indicados.
          </div>
        )}
      </div>

      {/* Submit Form omitted for brevity but stays exactly the same as before */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-white border border-slate-200 text-slate-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-2xl">contact_support</span>
          </div>
          <div>
            <h3 className="text-xl font-headline font-bold text-slate-900 mb-1">Não encontrou o que procurava?</h3>
            <p className="text-slate-600 text-sm">
              Envie-nos a sua dúvida. Iremos analisar e adicionar a resposta a esta página.
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmitQuestion} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Email (Opcional)</label>
              <input
                type="email"
                value={email}
                disabled={submitStatus === 'loading' || submitStatus === 'success'}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@exemplo.com"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 shadow-sm disabled:opacity-50 disabled:bg-slate-100 transition-colors
                  ${!isEmailValid ? 'border-rose-300 bg-rose-50 focus:ring-rose-200 text-rose-900' : 'border-slate-200 focus:ring-primary focus:border-primary'}
                `}
              />
              {!isEmailValid && <p className="text-rose-500 text-xs mt-1 ml-1 font-medium">Por favor insira um email válido.</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Link para ficheiro (Opcional)</label>
              <input
                type="url"
                value={fileLink}
                disabled={submitStatus === 'loading' || submitStatus === 'success'}
                onChange={(e) => setFileLink(e.target.value)}
                placeholder="Google Drive, WeTransfer, etc..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm disabled:opacity-50 disabled:bg-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Dúvida / Questão <span className="text-rose-500">*</span></label>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <textarea
                required
                value={question}
                disabled={submitStatus === 'loading' || submitStatus === 'success'}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Escreva a sua pergunta aqui de forma clara..."
                className="w-full sm:flex-1 px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm disabled:opacity-50 disabled:bg-slate-100 min-h-[80px] resize-y"
              />
              
              <button 
                type="submit" 
                disabled={submitStatus === 'loading' || submitStatus === 'success' || (email !== '' && !isEmailValid)}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 md:py-0 md:h-[80px] rounded-lg font-bold text-sm transition-all shadow-sm
                  ${submitStatus === 'idle' && (email === '' || isEmailValid) ? 'bg-primary text-white hover:bg-emerald-700 hover:shadow' : ''}
                  ${submitStatus === 'idle' && (email !== '' && !isEmailValid) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : ''}
                  ${submitStatus === 'loading' ? 'bg-slate-200 text-slate-500 cursor-wait' : ''}
                  ${submitStatus === 'success' ? 'bg-emerald-500 text-white' : ''}
                  ${submitStatus === 'error' ? 'bg-rose-500 text-white' : ''}
                `}
              >
                {submitStatus === 'idle' && <><span className="material-symbols-outlined text-[20px]">send</span> Enviar</>}
                {submitStatus === 'loading' && <span className="material-symbols-outlined text-[20px] animate-spin">autorenew</span>}
                {submitStatus === 'success' && <><span className="material-symbols-outlined text-[20px]">check_circle</span> Enviado!</>}
                {submitStatus === 'error' && <><span className="material-symbols-outlined text-[20px]">error</span> Erro</>}
              </button>
            </div>
          </div>
        </form>
      </div>

    </div>
  );
}