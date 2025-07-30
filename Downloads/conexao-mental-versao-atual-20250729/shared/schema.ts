import { pgTable, text, serial, integer, boolean, timestamp, uuid, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum
export const userRoleEnum = ['patient', 'professional', 'admin'] as const;

// Appointment status enum
export const appointmentStatusEnum = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const;

// Professional status enum
export const professionalStatusEnum = ['pending', 'approved', 'rejected', 'suspended'] as const;

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  full_name: text("full_name").notNull(),
  phone: text("phone"),
  password_hash: text("password_hash"),
  google_id: text("google_id"),
  role: text("role").notNull().default('patient'),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const professionals = pgTable("professionals", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull().unique(),
  crp: text("crp"), // CRP registration number
  specialties: text("specialties").array().default([]),
  bio: text("bio"),
  hourly_rate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  available_hours: jsonb("available_hours"),
  approved: boolean("approved").default(false),
  status: text("status").notNull().default('pending'), // pending, approved, rejected, suspended
  phone: text("phone"),
  cpf: text("cpf"),
  gender: text("gender"),
  therapeutic_approach: text("therapeutic_approach"),
  experience: text("experience"),
  address: text("address"),
  curriculum_file: text("curriculum_file"), // URL ou nome do arquivo do currículo
  company_name: text("company_name"),
  company_cnpj: text("company_cnpj"),
  company_phone: text("company_phone"),
  company_email: text("company_email"),
  company_website: text("company_website"),
  google_calendar_email: text("google_calendar_email"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  patient_id: uuid("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  professional_id: uuid("professional_id").notNull().references(() => professionals.id, { onDelete: "cascade" }),
  scheduled_at: timestamp("scheduled_at").notNull(),
  duration_minutes: integer("duration_minutes").notNull().default(60),
  status: text("status").notNull().default('scheduled'),
  notes: text("notes"),
  video_room_id: text("video_room_id"),
  // Campos de pagamento
  payment_id: text("payment_id"), // ID do pagamento do Mercado Pago
  payment_status: text("payment_status").default('pending'), // pending, approved, rejected, cancelled
  payment_method: text("payment_method"), // credit_card, debit_card, pix, boleto
  payment_reference: text("payment_reference"), // Referência externa para webhook
  amount: decimal("amount", { precision: 10, scale: 2 }), // Valor pago
  plan_type: text("plan_type"), // acolhimento, psicoterapia, casal, hipnoterapia
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  full_name: true,
  phone: true,
  password_hash: true,
  google_id: true,
  role: true,
});

export const insertProfessionalSchema = createInsertSchema(professionals).pick({
  user_id: true,
  email: true,
  crp: true,
  specialties: true,
  bio: true,
  hourly_rate: true,
  available_hours: true,
  approved: true,
  status: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  patient_id: true,
  professional_id: true,
  scheduled_at: true,
  duration_minutes: true,
  status: true,
  notes: true,
  video_room_id: true,
});

// API Keys table for external integrations
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(), // Nome descritivo da integração
  key_hash: text("key_hash").notNull().unique(), // Hash da chave API
  permissions: text("permissions").array().default([]), // Permissões específicas
  active: boolean("active").default(true),
  last_used: timestamp("last_used"),
  created_by: uuid("created_by").notNull().references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Webhooks table for external notifications
export const webhooks = pgTable("webhooks", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  events: text("events").array().default([]), // Eventos que disparam o webhook
  active: boolean("active").default(true),
  secret: text("secret"), // Secret para validação de assinatura
  created_by: uuid("created_by").notNull().references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// API Logs table for monitoring
export const apiLogs = pgTable("api_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  api_key_id: uuid("api_key_id").references(() => apiKeys.id),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  status_code: integer("status_code").notNull(),
  response_time: integer("response_time"), // em ms
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  request_body: jsonb("request_body"),
  response_body: jsonb("response_body"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  name: true,
  key_hash: true,
  permissions: true,
  active: true,
  created_by: true,
});

export const insertWebhookSchema = createInsertSchema(webhooks).pick({
  name: true,
  url: true,
  events: true,
  active: true,
  secret: true,
  created_by: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProfessional = z.infer<typeof insertProfessionalSchema>;
export type Professional = typeof professionals.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertWebhook = z.infer<typeof insertWebhookSchema>;
export type Webhook = typeof webhooks.$inferSelect;
export type ApiLog = typeof apiLogs.$inferSelect;
