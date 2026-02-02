/**
 * Generates an ICS (iCalendar) file content for an appointment
 */

interface AppointmentData {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  meetLink?: string;
  organizerName?: string;
  organizerEmail?: string;
}

const formatICSDate = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
};

const escapeICSText = (text: string): string => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
};

const generateUID = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}@acolheaqui.com`;
};

export const generateICSContent = (appointment: AppointmentData): string => {
  const now = new Date();
  
  let description = appointment.description;
  if (appointment.meetLink) {
    description += `\\n\\n🔗 Link da Sessão: ${appointment.meetLink}`;
  }
  
  const location = appointment.meetLink || appointment.location || '';
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AcolheAqui//Agendamento//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${generateUID()}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(appointment.startDate)}`,
    `DTEND:${formatICSDate(appointment.endDate)}`,
    `SUMMARY:${escapeICSText(appointment.title)}`,
    `DESCRIPTION:${escapeICSText(description)}`,
    location ? `LOCATION:${escapeICSText(location)}` : '',
    appointment.meetLink ? `URL:${appointment.meetLink}` : '',
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Lembrete: ${escapeICSText(appointment.title)} em 1 hora`,
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Lembrete: ${escapeICSText(appointment.title)} em 15 minutos`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(line => line !== '').join('\r\n');

  return icsContent;
};

export const downloadICSFile = (appointment: AppointmentData, filename?: string): void => {
  const icsContent = generateICSContent(appointment);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'agendamento.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const createAppointmentICS = (
  serviceName: string,
  professionalName: string,
  date: Date,
  time: string,
  durationMinutes: number,
  meetLink?: string | null
): void => {
  // Parse time string (e.g., "14:00")
  const [hours, minutes] = time.split(':').map(Number);
  
  // Create start date with the correct time
  const startDate = new Date(date);
  startDate.setHours(hours, minutes, 0, 0);
  
  // Create end date
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + durationMinutes);
  
  const appointment: AppointmentData = {
    title: `${serviceName} - ${professionalName}`,
    description: `Sessão de ${serviceName} com ${professionalName}.\n\nDuração: ${durationMinutes} minutos`,
    startDate,
    endDate,
    meetLink: meetLink || undefined,
    organizerName: professionalName,
  };
  
  const safeFilename = `agendamento-${serviceName.toLowerCase().replace(/\s+/g, '-')}.ics`;
  
  downloadICSFile(appointment, safeFilename);
};
