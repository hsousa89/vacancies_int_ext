import { useVacancies, type Vacancy } from '../../hooks/useVacancies';
import { parseConcelho, parseSchool, parseSubject } from '../../utils/formatters';

interface ExportActionsProps {
  preferences: Vacancy[];
}

export function ExportActions({ preferences }: ExportActionsProps) {
  const { getSchoolMetadata } = useVacancies();

  if (preferences.length === 0) return null;

  // --- SHARE FUNCTIONALITY ---
  const handleShare = async () => {
    let shareText = "🎯 *As minhas preferências de colocação (2026/2027)*\n\n";
    
    preferences.forEach((p, idx) => {
      const isSchool = p.type === 'School';
      const { name: schoolName, code: schoolCode } = parseSchool(p.school);
      const subject = parseSubject(p.subjectGroup);
      const vacanciesCount = p.count > 0 ? `+${p.count}` : p.count;
      
      const location = isSchool ? `🏫 ${schoolName} (Cód: ${schoolCode})` : `🗺️ QZP ${p.qzp.replace('QZP.', '')}`;
      const meta = isSchool ? getSchoolMetadata(p.concelho, p.school) : null;

      shareText += `*${idx + 1}º* ${location}\n`;
      shareText += `📚 GR ${subject.code} - ${subject.name}\n`;
      shareText += `💼 ${vacanciesCount} vaga(s)\n`;
      
      if (meta?.school_observations) {
        shareText += `📌 Observações: ${meta.school_observations}\n`;
      }
      shareText += `\n`;
    });

    shareText += "Gerado via *Profs PT* 📱✨";

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'As minhas preferências (Profs PT)',
          text: shareText,
        });
      } catch (err) {
        console.log('Partilha cancelada ou falhou.', err);
      }
    } else {
      const waLink = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(waLink, '_blank');
    }
  };

  // --- EXPORT TO EXCEL (CSV) FUNCTIONALITY ---
  const handleExportExcel = () => {
    let csvContent = "Prioridade,Tipo,QZP,Concelho,Escola,Codigo_Escola,Grupo_Recrutamento,Vagas,Observacoes\n";

    preferences.forEach((p, index) => {
      const prioridade = index + 1;
      const tipo = p.type === 'School' ? 'Escola' : 'QZP';
      const qzp = p.qzp || '';
      const concelho = p.concelho ? `"${parseConcelho(p.concelho).name}"` : 'N/A';
      
      const { name: schoolName, code: schoolCode } = parseSchool(p.school);
      const escola = p.school ? `"${schoolName}"` : 'N/A';
      const codigoEscola = schoolCode || 'N/A';
      
      const { code: subCode, name: subName } = parseSubject(p.subjectGroup);
      const grupo = `"${subCode} - ${subName}"`;
      const vagas = p.count;

      const meta = p.type === 'School' ? getSchoolMetadata(p.concelho, p.school) : null;
      const obs = meta?.school_observations ? `"${meta.school_observations}"` : '';

      csvContent += `${prioridade},${tipo},${qzp},${concelho},${escola},${codigoEscola},${grupo},${vagas},${obs}\n`;
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "preferencias_profspt.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-1 lg:flex-none items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
      <button 
        onClick={handleShare} 
        className="flex-1 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-blue-700 hover:bg-white rounded shadow-sm transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
        title="Partilhar lista (WhatsApp, etc.)"
      >
        <span className="material-symbols-outlined text-[16px]">share</span>
        <span className="hidden md:inline">Partilhar</span>
      </button>
      
      <button 
        onClick={handleExportExcel} 
        className="flex-1 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-white rounded shadow-sm transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
        title="Exportar para Excel"
      >
        <span className="material-symbols-outlined text-[16px]">download</span>
        <span className="hidden md:inline">Exportar</span>
      </button>
    </div>
  );
}