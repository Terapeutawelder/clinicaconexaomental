import jsPDF from "jspdf";

interface CertificateData {
  studentName: string;
  moduleTitle: string;
  professionalName: string;
  completionDate: Date;
  totalLessons: number;
  totalDurationHours: number;
}

export function generateCertificatePDF(data: CertificateData): void {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background gradient effect using rectangles
  doc.setFillColor(17, 24, 39); // gray-900
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Decorative border
  doc.setDrawColor(99, 102, 241); // primary
  doc.setLineWidth(2);
  doc.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 5, 5, "S");

  // Inner border
  doc.setDrawColor(147, 51, 234); // purple
  doc.setLineWidth(0.5);
  doc.roundedRect(15, 15, pageWidth - 30, pageHeight - 30, 3, 3, "S");

  // Corner decorations
  const cornerSize = 20;
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(1);
  
  // Top left
  doc.line(20, 25, 20 + cornerSize, 25);
  doc.line(25, 20, 25, 20 + cornerSize);
  
  // Top right
  doc.line(pageWidth - 20, 25, pageWidth - 20 - cornerSize, 25);
  doc.line(pageWidth - 25, 20, pageWidth - 25, 20 + cornerSize);
  
  // Bottom left
  doc.line(20, pageHeight - 25, 20 + cornerSize, pageHeight - 25);
  doc.line(25, pageHeight - 20, 25, pageHeight - 20 - cornerSize);
  
  // Bottom right
  doc.line(pageWidth - 20, pageHeight - 25, pageWidth - 20 - cornerSize, pageHeight - 25);
  doc.line(pageWidth - 25, pageHeight - 20, pageWidth - 25, pageHeight - 20 - cornerSize);

  let yPosition = 45;

  // Certificate title
  doc.setTextColor(99, 102, 241);
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("CERTIFICADO DE CONCLUSÃO", pageWidth / 2, yPosition, { align: "center" });

  yPosition += 20;

  // Main heading
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("Certificamos que", pageWidth / 2, yPosition, { align: "center" });

  yPosition += 20;

  // Student name
  doc.setTextColor(147, 51, 234);
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.text(data.studentName, pageWidth / 2, yPosition, { align: "center" });

  // Underline for name
  const nameWidth = doc.getTextWidth(data.studentName);
  doc.setDrawColor(147, 51, 234);
  doc.setLineWidth(0.5);
  doc.line((pageWidth - nameWidth) / 2, yPosition + 2, (pageWidth + nameWidth) / 2, yPosition + 2);

  yPosition += 18;

  // Completion text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text("concluiu com êxito o módulo", pageWidth / 2, yPosition, { align: "center" });

  yPosition += 15;

  // Module title
  doc.setTextColor(99, 102, 241);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  
  // Wrap long module titles
  const maxModuleWidth = pageWidth - 80;
  const moduleLines = doc.splitTextToSize(data.moduleTitle, maxModuleWidth);
  moduleLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;
  });

  yPosition += 5;

  // Course details
  doc.setTextColor(156, 163, 175); // gray-400
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  
  const detailsText = `${data.totalLessons} aulas • ${data.totalDurationHours.toFixed(1)} horas de conteúdo`;
  doc.text(detailsText, pageWidth / 2, yPosition, { align: "center" });

  yPosition += 20;

  // Completion date and professional
  const formattedDate = data.completionDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(`Concluído em ${formattedDate}`, pageWidth / 2, yPosition, { align: "center" });

  yPosition += 10;

  doc.setTextColor(156, 163, 175);
  doc.setFontSize(11);
  doc.text(`Instrutor: ${data.professionalName}`, pageWidth / 2, yPosition, { align: "center" });

  // Footer with signature line
  const footerY = pageHeight - 40;

  // Signature line
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.3);
  doc.line(pageWidth / 2 - 50, footerY, pageWidth / 2 + 50, footerY);

  doc.setTextColor(156, 163, 175);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(data.professionalName, pageWidth / 2, footerY + 6, { align: "center" });
  doc.setFontSize(8);
  doc.text("Instrutor / Responsável", pageWidth / 2, footerY + 11, { align: "center" });

  // Certificate ID
  const certificateId = `CERT-${Date.now().toString(36).toUpperCase()}`;
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(8);
  doc.text(`ID: ${certificateId}`, pageWidth - 25, pageHeight - 15, { align: "right" });

  // Save the PDF
  const sanitizedModuleTitle = data.moduleTitle.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
  const fileName = `certificado_${sanitizedModuleTitle}_${data.studentName.replace(/\s+/g, "_")}.pdf`;
  doc.save(fileName);
}
