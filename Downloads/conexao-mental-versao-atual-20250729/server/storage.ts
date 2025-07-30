import { users, professionals, appointments, apiKeys, webhooks, apiLogs, type User, type InsertUser, type Professional, type InsertProfessional, type Appointment, type InsertAppointment, type ApiKey, type InsertApiKey, type Webhook, type InsertWebhook } from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  
  // Authentication methods
  authenticateUser(email: string, password: string): Promise<User | null>;
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  
  // Google authentication methods
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createOrUpdateGoogleUser(googleProfile: {
    google_id: string;
    email: string;
    full_name: string;
    role?: string;
  }): Promise<User>;
  
  // Professional email lookup
  getProfessionalByEmail(email: string): Promise<Professional | undefined>;
  
  // Professional methods
  getProfessional(id: string): Promise<Professional | undefined>;
  getProfessionalByUserId(userId: string): Promise<Professional | undefined>;
  createProfessional(professional: InsertProfessional): Promise<Professional>;
  updateProfessional(id: string, professional: Partial<Professional>): Promise<Professional | undefined>;
  getAllProfessionals(): Promise<Professional[]>;
  updateProfessionalStatus(id: string, status: string): Promise<Professional | undefined>;
  updateProfessionalWithUser(id: string, data: any): Promise<Professional | undefined>;
  deleteProfessional(id: string): Promise<boolean>;
  
  // Appointment methods
  getAppointment(id: string): Promise<Appointment | undefined>;
  getAppointmentsByPatient(patientId: string): Promise<Appointment[]>;
  getAppointmentsByProfessional(professionalId: string): Promise<Appointment[]>;
  getAllAppointments(): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment | undefined>;
  
  // Admin methods
  getAllUsers(): Promise<User[]>;
  
  // API Key methods
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  getApiKey(id: string): Promise<ApiKey | undefined>;
  getApiKeyByHash(keyHash: string): Promise<ApiKey | undefined>;
  getAllApiKeys(): Promise<ApiKey[]>;
  updateApiKey(id: string, apiKey: Partial<ApiKey>): Promise<ApiKey | undefined>;
  deleteApiKey(id: string): Promise<boolean>;
  updateApiKeyLastUsed(id: string): Promise<void>;
  
  // Webhook methods
  createWebhook(webhook: InsertWebhook): Promise<Webhook>;
  getWebhook(id: string): Promise<Webhook | undefined>;
  getAllWebhooks(): Promise<Webhook[]>;
  updateWebhook(id: string, webhook: Partial<Webhook>): Promise<Webhook | undefined>;
  deleteWebhook(id: string): Promise<boolean>;
  getActiveWebhooksByEvent(event: string): Promise<Webhook[]>;
  
  // API Logs methods
  createApiLog(log: any): Promise<void>;
  getApiLogs(limit?: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  constructor() {}

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0];
    } catch (error) {
      console.error('Database error in getUser:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email));
      return result[0];
    } catch (error) {
      console.error('Database error in getUserByEmail:', error);
      throw error;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, user: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set({
      ...user,
      updated_at: new Date(),
    }).where(eq(users.id, id)).returning();
    return result[0];
  }

  // Authentication methods
  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.password_hash) return null;
    
    const isValid = await this.verifyPassword(password, user.password_hash);
    if (!isValid) return null;
    
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.google_id, googleId));
    return result[0];
  }

  async createOrUpdateGoogleUser(googleProfile: {
    google_id: string;
    email: string;
    full_name: string;
    role?: string;
  }): Promise<User> {
    const existingUser = await this.getUserByGoogleId(googleProfile.google_id);
    
    if (existingUser) {
      // Update existing user
      return await this.updateUser(existingUser.id, {
        email: googleProfile.email,
        full_name: googleProfile.full_name,
        updated_at: new Date()
      }) as User;
    } else {
      // Create new user
      return await this.createUser({
        email: googleProfile.email,
        full_name: googleProfile.full_name,
        google_id: googleProfile.google_id,
        role: googleProfile.role || 'patient'
      });
    }
  }

  async getProfessionalByEmail(email: string): Promise<Professional | undefined> {
    const result = await db.select().from(professionals).where(eq(professionals.email, email));
    return result[0];
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Professional methods
  async getProfessional(id: string): Promise<Professional | undefined> {
    const result = await db.select().from(professionals).where(eq(professionals.id, id));
    return result[0];
  }

  async getProfessionalByUserId(userId: string): Promise<Professional | undefined> {
    const result = await db.select().from(professionals).where(eq(professionals.user_id, userId));
    return result[0];
  }

  async createProfessional(professional: InsertProfessional): Promise<Professional> {
    const result = await db.insert(professionals).values(professional).returning();
    return result[0];
  }

  async updateProfessional(id: string, professional: Partial<Professional>): Promise<Professional | undefined> {
    const result = await db.update(professionals).set({
      ...professional,
      updated_at: new Date(),
    }).where(eq(professionals.id, id)).returning();
    return result[0];
  }

  async deleteProfessional(id: string): Promise<boolean> {
    const result = await db.delete(professionals).where(eq(professionals.id, id)).returning();
    return result.length > 0;
  }

  async getAllProfessionals(): Promise<any[]> {
    try {
      const result = await db
        .select({
          id: professionals.id,
          user_id: professionals.user_id,
          name: users.full_name,
          email: professionals.email,
          available_hours: professionals.available_hours,
          specialty: professionals.specialties,
          crp: professionals.crp,
          bio: professionals.bio,
          phone: professionals.phone,
          cpf: professionals.cpf,
          gender: professionals.gender,
          therapeutic_approach: professionals.therapeutic_approach,
          experience: professionals.experience,
          address: professionals.address,
          curriculum_file: professionals.curriculum_file,
          company_name: professionals.company_name,
          company_cnpj: professionals.company_cnpj,
          company_phone: professionals.company_phone,
          company_email: professionals.company_email,
          company_website: professionals.company_website,
          google_calendar_email: professionals.google_calendar_email,
          approved: professionals.approved,
          status: professionals.status,
          created_at: professionals.created_at,
          updated_at: professionals.updated_at,
        })
        .from(professionals)
        .leftJoin(users, eq(professionals.user_id, users.id));

      // Transform the result to match frontend expectations
      return result.map(prof => ({
        id: prof.id,
        user_id: prof.user_id,
        name: prof.name,
        email: prof.email,
        available_hours: prof.available_hours,
        specialty: Array.isArray(prof.specialty) && prof.specialty.length > 0 
          ? prof.specialty[0] 
          : 'Especialista em Saúde Mental',
        crp: prof.crp || '',
        bio: prof.bio || '',
        phone: prof.phone || '',
        cpf: prof.cpf || '',
        gender: prof.gender || '',
        therapeutic_approach: prof.therapeutic_approach || '',
        experience: prof.experience || '',
        address: prof.address || '',
        curriculum_file: prof.curriculum_file || '',
        company_name: prof.company_name || '',
        company_cnpj: prof.company_cnpj || '',
        company_phone: prof.company_phone || '',
        company_email: prof.company_email || '',
        company_website: prof.company_website || '',
        google_calendar_email: prof.google_calendar_email || '',
        description: prof.description || 'Profissional especializado em atendimento de saúde mental.',
        approved: prof.approved,
        status: prof.status,
        rating: 4.8,
        available: prof.approved && prof.status === 'approved'
      }));
    } catch (error) {
      console.error('Database error in getAllProfessionals:', error);
      throw error;
    }
  }

  async updateProfessionalStatus(id: string, status: string): Promise<Professional | undefined> {
    const result = await db.update(professionals).set({
      status: status,
      updated_at: new Date(),
    }).where(eq(professionals.id, id)).returning();
    return result[0];
  }

  async updateProfessionalWithUser(id: string, data: any): Promise<Professional | undefined> {
    // First, get the professional to find the user_id
    const professional = await this.getProfessional(id);
    if (!professional) {
      return undefined;
    }

    // Update user data if provided
    if (data.name || data.email) {
      await db.update(users).set({
        full_name: data.name,
        email: data.email,
        updated_at: new Date(),
      }).where(eq(users.id, professional.user_id));
    }

    // Update professional data
    const professionalData: any = {};
    if (data.specialty) professionalData.specialties = [data.specialty];
    if (data.crp) professionalData.crp = data.crp;
    if (data.approved !== undefined) professionalData.approved = data.approved;
    if (data.status) professionalData.status = data.status;

    if (Object.keys(professionalData).length > 0) {
      professionalData.updated_at = new Date();
      const result = await db.update(professionals).set(professionalData).where(eq(professionals.id, id)).returning();
      return result[0];
    }

    return professional;
  }

  // Appointment methods
  async getAppointment(id: string): Promise<Appointment | undefined> {
    const result = await db.select().from(appointments).where(eq(appointments.id, id));
    return result[0];
  }

  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.patient_id, patientId));
  }

  async getAppointmentsByProfessional(professionalId: string): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.professional_id, professionalId));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const result = await db.insert(appointments).values(appointment).returning();
    return result[0];
  }

  async updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment | undefined> {
    const result = await db.update(appointments).set({
      ...appointment,
      updated_at: new Date(),
    }).where(eq(appointments.id, id)).returning();
    return result[0];
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments);
  }

  // Admin methods
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Professional agendas with appointment summaries
  async getProfessionalAgendas() {
    const professionalsData = await this.getAllProfessionals();
    const appointmentsData = await this.getAllAppointments();
    const usersData = await this.getAllUsers();
    
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
    
    return professionalsData.map(professional => {
      const professionalAppointments = appointmentsData.filter(a => a.professional_id === professional.id);
      const user = usersData.find(u => u.id === professional.user_id);
      
      // Contar agendamentos de hoje
      const appointmentsToday = professionalAppointments.filter(a => {
        const appointmentDate = new Date(a.scheduled_at).toISOString().split('T')[0];
        return appointmentDate === today;
      }).length;
      
      // Contar agendamentos desta semana
      const appointmentsThisWeek = professionalAppointments.filter(a => {
        const appointmentDate = new Date(a.scheduled_at);
        return appointmentDate >= thisWeek;
      }).length;
      
      // Encontrar próximo agendamento
      const nextAppointment = professionalAppointments
        .filter(a => {
          const appointmentDate = new Date(a.scheduled_at).toISOString().split('T')[0];
          return appointmentDate >= today && a.status !== 'cancelled';
        })
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())[0];
      
      // Determinar especialidade correta
      let specialtyDisplay = 'Não informado';
      if (professional.specialties && Array.isArray(professional.specialties) && professional.specialties.length > 0) {
        const firstSpecialty = professional.specialties[0];
        switch (firstSpecialty) {
          case 'psicologo':
            specialtyDisplay = 'Psicólogo';
            break;
          case 'psicanalista':
            specialtyDisplay = 'Psicanalista';
            break;
          case 'terapeuta':
            specialtyDisplay = 'Terapeuta';
            break;
          case 'psicoterapeuta':
            specialtyDisplay = 'Psicoterapeuta';
            break;
          default:
            specialtyDisplay = firstSpecialty.charAt(0).toUpperCase() + firstSpecialty.slice(1);
        }
      }
      
      return {
        id: professional.id,
        name: user?.full_name || 'Profissional',
        email: user?.email || '',
        specialty: specialtyDisplay,
        approved: professional.approved,
        status: professional.status || 'pending',
        crp: professional.crp || '',
        appointmentsToday,
        appointmentsThisWeek,
        totalAppointments: professionalAppointments.length,
        nextAppointment: nextAppointment ? {
          date: new Date(nextAppointment.scheduled_at).toISOString().split('T')[0],
          time: new Date(nextAppointment.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          patient: 'Paciente'
        } : null,
        lastActive: professional.updated_at || professional.created_at,
        rating: 0,
        totalConsultations: professionalAppointments.filter(a => a.status === 'completed').length
      };
    });
  }

  // Métodos para pagamentos
  async updateAppointmentPaymentStatus(externalReference: string, status: string) {
    if (this.isMemoryStorage()) {
      const appointments = this.memStorage.appointments || [];
      const appointmentIndex = appointments.findIndex((a: any) => a.payment_reference === externalReference);
      
      if (appointmentIndex !== -1) {
        appointments[appointmentIndex].payment_status = status;
        this.memStorage.appointments = appointments;
        return true;
      }
      return false;
    }

    try {
      const result = await this.db
        .update(appointments)
        .set({ 
          payment_status: status,
          updated_at: new Date()
        })
        .where(eq(appointments.payment_reference, externalReference))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error("Update appointment payment status error:", error);
      return false;
    }
  }

  async createAppointmentWithPayment(appointmentData: any) {
    if (this.isMemoryStorage()) {
      const appointments = this.memStorage.appointments || [];
      const newAppointment = {
        id: String(Date.now()),
        ...appointmentData,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      appointments.push(newAppointment);
      this.memStorage.appointments = appointments;
      return newAppointment;
    }

    try {
      const [result] = await this.db
        .insert(appointments)
        .values({
          ...appointmentData,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning();
      
      return result;
    } catch (error) {
      console.error("Create appointment with payment error:", error);
      throw error;
    }
  }

  // API Key methods
  async createApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    try {
      const result = await db.insert(apiKeys).values(apiKey).returning();
      return result[0];
    } catch (error) {
      console.error("Create API Key error:", error);
      throw error;
    }
  }

  async getApiKey(id: string): Promise<ApiKey | undefined> {
    try {
      const result = await db.select().from(apiKeys).where(eq(apiKeys.id, id));
      return result[0];
    } catch (error) {
      console.error("Get API Key error:", error);
      throw error;
    }
  }

  async getApiKeyByHash(keyHash: string): Promise<ApiKey | undefined> {
    try {
      const result = await db.select().from(apiKeys).where(eq(apiKeys.key_hash, keyHash));
      return result[0];
    } catch (error) {
      console.error("Get API Key by hash error:", error);
      throw error;
    }
  }

  async getAllApiKeys(): Promise<ApiKey[]> {
    try {
      return await db.select().from(apiKeys);
    } catch (error) {
      console.error("Get all API Keys error:", error);
      throw error;
    }
  }

  async updateApiKey(id: string, apiKey: Partial<ApiKey>): Promise<ApiKey | undefined> {
    try {
      const result = await db.update(apiKeys).set({
        ...apiKey,
        updated_at: new Date(),
      }).where(eq(apiKeys.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error("Update API Key error:", error);
      throw error;
    }
  }

  async deleteApiKey(id: string): Promise<boolean> {
    try {
      const result = await db.delete(apiKeys).where(eq(apiKeys.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error("Delete API Key error:", error);
      throw error;
    }
  }

  async updateApiKeyLastUsed(id: string): Promise<void> {
    try {
      await db.update(apiKeys).set({
        last_used: new Date(),
        updated_at: new Date(),
      }).where(eq(apiKeys.id, id));
    } catch (error) {
      console.error("Update API Key last used error:", error);
    }
  }

  // Webhook methods
  async createWebhook(webhook: InsertWebhook): Promise<Webhook> {
    try {
      const result = await db.insert(webhooks).values(webhook).returning();
      return result[0];
    } catch (error) {
      console.error("Create Webhook error:", error);
      throw error;
    }
  }

  async getWebhook(id: string): Promise<Webhook | undefined> {
    try {
      const result = await db.select().from(webhooks).where(eq(webhooks.id, id));
      return result[0];
    } catch (error) {
      console.error("Get Webhook error:", error);
      throw error;
    }
  }

  async getAllWebhooks(): Promise<Webhook[]> {
    try {
      return await db.select().from(webhooks);
    } catch (error) {
      console.error("Get all Webhooks error:", error);
      throw error;
    }
  }

  async updateWebhook(id: string, webhook: Partial<Webhook>): Promise<Webhook | undefined> {
    try {
      const result = await db.update(webhooks).set({
        ...webhook,
        updated_at: new Date(),
      }).where(eq(webhooks.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error("Update Webhook error:", error);
      throw error;
    }
  }

  async deleteWebhook(id: string): Promise<boolean> {
    try {
      const result = await db.delete(webhooks).where(eq(webhooks.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error("Delete Webhook error:", error);
      throw error;
    }
  }

  async getActiveWebhooksByEvent(event: string): Promise<Webhook[]> {
    try {
      const result = await db.select().from(webhooks).where(
        and(
          eq(webhooks.active, true),
          sql`${event} = ANY(${webhooks.events})`
        )
      );
      return result;
    } catch (error) {
      console.error("Get active webhooks by event error:", error);
      return [];
    }
  }

  // API Logs methods
  async createApiLog(log: any): Promise<void> {
    try {
      await db.insert(apiLogs).values(log);
    } catch (error) {
      console.error("Create API Log error:", error);
    }
  }

  async getApiLogs(limit: number = 100): Promise<any[]> {
    try {
      const result = await db.select().from(apiLogs)
        .orderBy(sql`${apiLogs.created_at} DESC`)
        .limit(limit);
      return result;
    } catch (error) {
      console.error("Get API Logs error:", error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
