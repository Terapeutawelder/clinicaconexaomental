interface AppointmentData {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  professionalId: string;
  date: string;
  time: string;
  status: "agendado" | "confirmado" | "realizado" | "cancelado";
  type: "consulta" | "retorno";
  accessLink: string;
  createdAt: string;
}

const STORAGE_KEY = 'conexao_mental_appointments';

export const saveAppointment = (appointmentData: Omit<AppointmentData, 'id' | 'createdAt'>) => {
  const appointments = getAppointments();
  const newAppointment: AppointmentData = {
    ...appointmentData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  
  appointments.push(newAppointment);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  return newAppointment;
};

export const getAppointments = (): AppointmentData[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getAppointmentsByProfessional = (professionalId: string): AppointmentData[] => {
  const appointments = getAppointments();
  return appointments.filter(apt => apt.professionalId === professionalId);
};