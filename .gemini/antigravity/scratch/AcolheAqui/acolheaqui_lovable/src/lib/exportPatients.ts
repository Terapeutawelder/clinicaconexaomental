import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Patient {
  name: string;
  email: string | null;
  phone: string | null;
  totalAppointments: number;
  completedAppointments: number;
  totalSpent: number;
  lastAppointment: string | null;
  status: "active" | "inactive" | "new";
}

const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case "active":
      return "Ativo";
    case "inactive":
      return "Inativo";
    case "new":
      return "Novo";
    default:
      return status;
  }
};

const escapeCSV = (value: string | null | undefined): string => {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  // Escape quotes and wrap in quotes if contains comma, newline or quote
  if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

export const exportPatientsToCSV = (patients: Patient[], filename?: string): void => {
  // CSV Headers
  const headers = [
    "Nome",
    "Email",
    "Telefone",
    "Status",
    "Total Agendamentos",
    "Sessões Realizadas",
    "Total Investido",
    "Última Sessão",
    "Taxa de Presença (%)",
  ];

  // Generate CSV rows
  const rows = patients.map((patient) => {
    const attendanceRate =
      patient.totalAppointments > 0
        ? Math.round((patient.completedAppointments / patient.totalAppointments) * 100)
        : 0;

    return [
      escapeCSV(patient.name),
      escapeCSV(patient.email),
      escapeCSV(patient.phone),
      escapeCSV(getStatusLabel(patient.status)),
      patient.totalAppointments.toString(),
      patient.completedAppointments.toString(),
      formatCurrency(patient.totalSpent),
      patient.lastAppointment
        ? format(new Date(patient.lastAppointment), "dd/MM/yyyy", { locale: ptBR })
        : "",
      `${attendanceRate}%`,
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  // Add BOM for Excel UTF-8 compatibility
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

  // Create download link
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  const defaultFilename = `pacientes_${format(new Date(), "yyyy-MM-dd_HH-mm")}.csv`;
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename || defaultFilename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportPatientsToExcel = (patients: Patient[], filename?: string): void => {
  // For Excel, we'll create a more structured CSV that Excel can open nicely
  // With proper formatting and UTF-8 BOM
  
  const headers = [
    "Nome",
    "Email", 
    "Telefone",
    "Status",
    "Total Agendamentos",
    "Sessões Realizadas",
    "Total Investido (R$)",
    "Última Sessão",
    "Taxa de Presença (%)",
  ];

  // Generate rows with tab separation for better Excel compatibility
  const rows = patients.map((patient) => {
    const attendanceRate =
      patient.totalAppointments > 0
        ? Math.round((patient.completedAppointments / patient.totalAppointments) * 100)
        : 0;

    return [
      patient.name || "",
      patient.email || "",
      patient.phone || "",
      getStatusLabel(patient.status),
      patient.totalAppointments.toString(),
      patient.completedAppointments.toString(),
      (patient.totalSpent / 100).toFixed(2).replace(".", ","), // Brazilian format
      patient.lastAppointment
        ? format(new Date(patient.lastAppointment), "dd/MM/yyyy", { locale: ptBR })
        : "",
      attendanceRate.toString(),
    ];
  });

  // Create TSV content (Excel handles tabs better than commas for non-English locales)
  const tsvContent = [
    headers.join("\t"),
    ...rows.map((row) => row.join("\t")),
  ].join("\n");

  // Add BOM for Excel UTF-8 compatibility
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + tsvContent], { type: "application/vnd.ms-excel;charset=utf-8;" });

  // Create download link
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  const defaultFilename = `pacientes_${format(new Date(), "yyyy-MM-dd_HH-mm")}.xls`;
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename || defaultFilename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
