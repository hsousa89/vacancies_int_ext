import faqsData from '../data/faqs.json';

export function FaqsPage() {
  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-300 pb-10">
      
      {/* Header */}
      <div className="mb-8 pt-4">
        <p className="text-primary font-label text-sm font-bold tracking-wide uppercase flex items-center gap-1.5 mb-1">
          <span className="material-symbols-outlined text-[16px]">help</span>
          Apoio
        </p>
        <h2 className="text-3xl font-headline font-extrabold text-slate-900 leading-tight">Perguntas Frequentes</h2>
        <p className="text-slate-500 text-sm mt-2">
          Informações úteis sobre os procedimentos concursais e a plataforma SIGRHE.
        </p>
      </div>

      {/* FAQs Accordion List */}
      <div className="flex flex-col gap-3 mb-16">
        {faqsData.map((faq, index) => (
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
              <p className="mb-3">{faq.answer}</p>
              
              {/* Render small label pills if they exist */}
              {faq.labels && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {faq.labels.split(',').map((label, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {label.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </details>
        ))}
      </div>

    </div>
  );
}