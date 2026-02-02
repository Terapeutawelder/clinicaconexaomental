import jsPDF from "jspdf";

interface TranscriptEntry {
  id: string;
  speaker: "professional" | "patient";
  text: string;
  timestamp: string;
  isFinal: boolean;
}

interface SessionData {
  clientName: string;
  appointmentDate: string;
  appointmentTime?: string;
  durationMinutes?: number;
  transcription?: TranscriptEntry[] | null;
  aiPsiAnalysis?: string | null;
  professionalName?: string;
}

export function generateSessionPDF(session: SessionData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let yPosition = margin;

  const addNewPageIfNeeded = (heightNeeded: number) => {
    if (yPosition + heightNeeded > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Header
  doc.setFillColor(99, 102, 241); // Primary color
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Sessão", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Prontuário Psicológico", pageWidth / 2, 30, { align: "center" });

  yPosition = 55;

  // Session Info Box
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, yPosition, maxWidth, 35, 3, 3, "F");

  doc.setTextColor(55, 65, 81);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Paciente:", margin + 5, yPosition + 10);
  doc.setFont("helvetica", "normal");
  doc.text(session.clientName, margin + 35, yPosition + 10);

  doc.setFont("helvetica", "bold");
  doc.text("Data:", margin + 5, yPosition + 20);
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(session.appointmentDate), margin + 25, yPosition + 20);

  if (session.appointmentTime) {
    doc.setFont("helvetica", "bold");
    doc.text("Horário:", margin + 100, yPosition + 20);
    doc.setFont("helvetica", "normal");
    doc.text(session.appointmentTime, margin + 125, yPosition + 20);
  }

  if (session.durationMinutes) {
    doc.setFont("helvetica", "bold");
    doc.text("Duração:", margin + 5, yPosition + 30);
    doc.setFont("helvetica", "normal");
    doc.text(`${session.durationMinutes} minutos`, margin + 35, yPosition + 30);
  }

  yPosition += 45;

  // AI Psi Analysis Section
  if (session.aiPsiAnalysis) {
    addNewPageIfNeeded(30);

    // Section Header
    doc.setFillColor(147, 51, 234); // Purple
    doc.roundedRect(margin, yPosition, maxWidth, 10, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("🧠 Análise IA Psi - Neurociência & Psicologia", margin + 5, yPosition + 7);

    yPosition += 15;

    // Clean markdown formatting
    const cleanText = session.aiPsiAnalysis
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/🧠|💭|💡|⚠️/g, "•");

    doc.setTextColor(55, 65, 81);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const analysisLines = doc.splitTextToSize(cleanText, maxWidth - 10);

    for (const line of analysisLines) {
      addNewPageIfNeeded(6);
      doc.text(line, margin + 5, yPosition);
      yPosition += 5;
    }

    yPosition += 10;
  }

  // Transcription Section
  if (session.transcription && session.transcription.length > 0) {
    addNewPageIfNeeded(30);

    // Section Header
    doc.setFillColor(59, 130, 246); // Blue
    doc.roundedRect(margin, yPosition, maxWidth, 10, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`📝 Transcrição da Sessão (${session.transcription.length} mensagens)`, margin + 5, yPosition + 7);

    yPosition += 15;

    doc.setTextColor(55, 65, 81);
    doc.setFontSize(9);

    for (const entry of session.transcription) {
      const time = new Date(entry.timestamp).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const speakerLabel = entry.speaker === "professional" ? "Profissional" : "Paciente";

      const entryText = `[${time}] ${speakerLabel}: ${entry.text}`;
      const entryLines = doc.splitTextToSize(entryText, maxWidth - 10);

      for (const line of entryLines) {
        addNewPageIfNeeded(5);
        doc.setFont("helvetica", entry.speaker === "professional" ? "bold" : "normal");
        doc.text(line, margin + 5, yPosition);
        yPosition += 4.5;
      }

      yPosition += 2;
    }
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.setFont("helvetica", "normal");
    
    const footerText = `Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")} - Documento confidencial`;
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" });
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: "right" });
  }

  // Save the PDF
  const fileName = `relatorio_sessao_${session.clientName.replace(/\s+/g, "_")}_${session.appointmentDate}.pdf`;
  doc.save(fileName);
}
