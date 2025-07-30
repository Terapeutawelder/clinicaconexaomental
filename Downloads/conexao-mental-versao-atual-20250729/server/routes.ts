import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import jwt from "jsonwebtoken";
import passport from "./googleAuth";
import session from "express-session";
import { WebSocketServer, WebSocket } from "ws";
import { 
  processCardPayment, 
  createPaymentPreference, 
  getPaymentDetails,
  type PaymentData,
  type PreferenceData 
} from "./mercadoPago";
import { setupApiRoutes } from "./routes/apiRoutes";
import { setupAdminIntegrationRoutes } from "./routes/adminIntegrationRoutes";

const JWT_SECRET = process.env.JWT_SECRET || "ConexaoMental@2025#ProdSecretKey";

// Middleware que funciona com JWT ou sessão
const authenticate = async (req: any, res: any, next: any) => {
  try {
    // Primeiro, tenta JWT
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          const user = await storage.getUser(decoded.userId);
          
          if (user) {
            req.user = user;
            return next();
          }
        } catch (error) {
          console.error('JWT verification failed:', error);
        }
      }
    }

    // Se JWT falhar, tenta sessão
    if (req.session && req.session.user) {
      const user = await storage.getUser(req.session.user.id);
      if (user) {
        req.user = user;
        return next();
      }
    }

    // Se nenhum método funcionar, retorna erro
    return res.status(401).json({ error: "Authentication required" });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: "Authentication failed" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Add database connection error handling middleware
  app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
      if (res.statusCode >= 500) {
        console.error(`Server error ${res.statusCode} at ${req.method} ${req.path}:`, data);
      }
      return originalSend.call(this, data);
    };
    next();
  });

  // Security middleware for production
  if (process.env.NODE_ENV === "production") {
    app.use((req, res, next) => {
      // Security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // CORS configuration for production
      const allowedOrigins = [
        'https://clinicaconexaomental.online',
        'https://www.clinicaconexaomental.online'
      ];
      
      const origin = req.headers.origin;
      if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
      
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      
      next();
    });
  }

  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || "ConexaoMental@SessionSecret2025",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax"
    }
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0"
    });
  });

  // Endpoint para fornecer a chave pública do Mercado Pago
  app.get("/api/config/mercadopago-public-key", (req, res) => {
    const publicKey = process.env.MERCADO_PAGO_PUBLIC_KEY;
    if (!publicKey) {
      return res.status(500).json({ error: "Chave pública não configurada" });
    }
    res.json({ publicKey });
  });

  // Google OAuth routes (only if credentials are configured)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.get("/api/auth/google", passport.authenticate("google", {
      scope: ["profile", "email"]
    }));

    app.get("/api/auth/google/callback", 
      passport.authenticate("google", { failureRedirect: "/login" }),
      async (req, res) => {
        try {
          const user = req.user as any;
          // Generate JWT token for consistency with existing auth
          const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "24h" });
          
          // Redirect to appropriate page based on user role
          const redirectUrl = user.role === 'professional' ? '/agenda-profissional' : '/';
          res.redirect(`${redirectUrl}?token=${token}`);
        } catch (error) {
          console.error("Google callback error:", error);
          res.redirect("/login?error=auth_failed");
        }
      }
    );
  } else {
    // Fallback route when Google OAuth is not configured
    app.get("/api/auth/google", (req, res) => {
      res.status(503).json({ error: "Google OAuth not configured", message: "Use traditional login" });
    });
  }

  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, full_name, role } = req.body;
      
      console.log("Signup attempt with email:", email);
      
      // Validate input
      if (!email || !password || !full_name) {
        console.log("Missing required fields");
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();
      console.log("Normalized email:", normalizedEmail);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(normalizedEmail);
      console.log("Existing user found:", existingUser ? "Yes" : "No");
      if (existingUser) {
        console.log("User already exists for email:", normalizedEmail);
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password
      const password_hash = await storage.hashPassword(password);

      // Create user
      const userData = {
        email: normalizedEmail,
        full_name,
        password_hash,
        role: role || 'patient',
      };

      console.log("Creating user with data:", { email: normalizedEmail, full_name, role });
      const user = await storage.createUser(userData);
      console.log("User created successfully:", user.id);

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

      // Return user data without password hash
      const { password_hash: _, ...safeUser } = user;
      res.status(201).json({ user: safeUser, token });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Login endpoint (alias for signin)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      // Authenticate user
      const user = await storage.authenticateUser(email.toLowerCase(), password);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check if user is trying to access professional area
      if (user.role === 'professional') {
        const professional = await storage.getProfessionalByEmail(user.email);
        if (!professional) {
          return res.status(403).json({ error: "Profissional não encontrado no sistema" });
        }
        if (!professional.approved) {
          return res.status(403).json({ error: "Aguardando aprovação do administrador para acessar a área profissional" });
        }
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

      // Return user data without password hash
      const { password_hash: _, ...safeUser } = user;
      res.json({ user: safeUser, token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      // Authenticate user
      const user = await storage.authenticateUser(email.toLowerCase(), password);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check if user is trying to access professional area
      if (user.role === 'professional') {
        const professional = await storage.getProfessionalByEmail(user.email);
        if (!professional) {
          return res.status(403).json({ error: "Profissional não encontrado no sistema" });
        }
        if (!professional.approved) {
          return res.status(403).json({ error: "Aguardando aprovação do administrador para acessar a área profissional" });
        }
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

      // Return user data without password hash
      const { password_hash: _, ...safeUser } = user;
      res.json({ user: safeUser, token });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticate, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Check if user is professional and needs approval verification
      if (user.role === 'professional') {
        const professional = await storage.getProfessionalByEmail(user.email);
        if (!professional || !professional.approved) {
          return res.status(403).json({ error: "Profissional não aprovado pelo administrador" });
        }
      }

      const { password_hash: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Check if user exists
      const user = await storage.getUserByEmail(email.toLowerCase());
      if (!user) {
        // Don't reveal if user exists or not for security
        return res.json({ message: "If an account with this email exists, a reset link will be sent." });
      }

      // For now, just return success - in a real app, you'd send an email
      // TODO: Implement actual email sending functionality
      res.json({ message: "If an account with this email exists, a reset link will be sent." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Professional routes - public endpoint (only returns approved professionals)
  app.get("/api/professionals", async (req, res) => {
    try {
      const professionals = await storage.getAllProfessionals();
      
      // If user is not authenticated or not an admin, only return approved professionals
      const authHeader = req.headers.authorization;
      let isAdmin = false;
      
      if (authHeader) {
        try {
          const token = authHeader.split(' ')[1];
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          const user = await storage.getUser(decoded.userId);
          isAdmin = user && user.role === 'admin';
        } catch (error) {
          // Token invalid, treat as public request
        }
      }
      
      // Filter professionals based on authentication
      const filteredProfessionals = isAdmin 
        ? professionals 
        : professionals.filter(p => p.approved);
      
      res.json(filteredProfessionals);
    } catch (error) {
      console.error("Get professionals error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Professional registration route
  app.post("/api/professionals/register", async (req, res) => {
    try {
      const { 
        name, 
        email, 
        password, 
        specialty, 
        crp, 
        therapeuticApproach,
        therapeutic_approach, 
        experience, 
        description,
        phone,
        cpf,
        gender,
        address
      } = req.body;

      // Validate required fields
      if (!name || !email || !password || !specialty) {
        return res.status(400).json({ error: "Campos obrigatórios não preenchidos" });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(400).json({ error: "Email já está em uso" });
      }

      // Hash password
      const hashedPassword = await storage.hashPassword(password);

      // Create user with professional role
      const user = await storage.createUser({
        email: normalizedEmail,
        password_hash: hashedPassword,
        full_name: name,
        role: 'professional'
      });

      // Create professional profile (not approved by default)
      const professional = await storage.createProfessional({
        user_id: user.id,
        email: normalizedEmail,
        crp: crp || '',
        specialties: [specialty],
        bio: description || '',
        phone: phone || '',
        cpf: cpf || '',
        gender: gender || '',
        therapeutic_approach: therapeutic_approach || therapeuticApproach || '',
        experience: experience || '',
        address: address || '',
        approved: false // Requires admin approval
      });

      res.status(201).json({ 
        message: "Cadastro realizado com sucesso! Aguarde a aprovação do administrador.",
        user: { 
          id: user.id, 
          email: user.email, 
          full_name: user.full_name, 
          role: user.role 
        },
        professional: {
          id: professional.id,
          approved: professional.approved
        }
      });
    } catch (error) {
      console.error("Professional registration error:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/professionals", authenticate, async (req: any, res) => {
    try {
      if (req.user.role !== 'professional' && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied" });
      }

      const professionalData = {
        ...req.body,
        user_id: req.user.id,
      };

      const professional = await storage.createProfessional(professionalData);
      res.status(201).json(professional);
    } catch (error) {
      console.error("Create professional error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Approve professional
  app.patch("/api/professionals/:id/approve", authenticate, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Only admins can approve professionals" });
      }

      const professional = await storage.updateProfessional(req.params.id, { approved: true });
      if (!professional) {
        return res.status(404).json({ error: "Professional not found" });
      }

      res.json({ message: "Professional approved successfully", professional });
    } catch (error) {
      console.error("Approve professional error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Reject professional
  app.patch("/api/professionals/:id/reject", authenticate, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Only admins can reject professionals" });
      }

      const professional = await storage.updateProfessional(req.params.id, { approved: false });
      if (!professional) {
        return res.status(404).json({ error: "Professional not found" });
      }

      res.json({ message: "Professional rejected successfully", professional });
    } catch (error) {
      console.error("Reject professional error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin statistics endpoint
  app.get("/api/admin/stats", authenticate, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied" });
      }

      const professionals = await storage.getAllProfessionals();
      const appointments = await storage.getAllAppointments();
      const users = await storage.getAllUsers();

      const stats = {
        professionals: {
          total: professionals.length,
          approved: professionals.filter(p => p.approved).length,
          pending: professionals.filter(p => !p.approved).length,
          active: professionals.filter(p => p.approved && p.last_active_at && 
            new Date(p.last_active_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
        },
        patients: {
          total: users.filter(u => u.role === 'patient').length,
          active: users.filter(u => u.role === 'patient' && u.last_login_at && 
            new Date(u.last_login_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
        },
        appointments: {
          total: appointments.length,
          today: appointments.filter(a => {
            const today = new Date().toISOString().split('T')[0];
            return a.date === today;
          }).length,
          thisMonth: appointments.filter(a => {
            const thisMonth = new Date().toISOString().slice(0, 7);
            return a.date && a.date.startsWith(thisMonth);
          }).length,
          confirmed: appointments.filter(a => a.status === 'confirmed').length,
          completed: appointments.filter(a => a.status === 'completed').length
        },
        revenue: {
          thisMonth: appointments.filter(a => {
            const thisMonth = new Date().toISOString().slice(0, 7);
            return a.date && a.date.startsWith(thisMonth) && a.status === 'completed';
          }).reduce((sum, a) => sum + (a.price || 0), 0),
          lastMonth: appointments.filter(a => {
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            const lastMonthStr = lastMonth.toISOString().slice(0, 7);
            return a.date && a.date.startsWith(lastMonthStr) && a.status === 'completed';
          }).reduce((sum, a) => sum + (a.price || 0), 0)
        }
      };

      res.json(stats);
    } catch (error) {
      console.error("Get admin stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Professional activity tracking
  app.post("/api/professionals/activity", authenticate, async (req: any, res) => {
    try {
      if (req.user.role !== 'professional') {
        return res.status(403).json({ error: "Access denied" });
      }

      const professional = await storage.getProfessionalByUserId(req.user.id);
      if (!professional) {
        return res.status(404).json({ error: "Professional not found" });
      }

      await storage.updateProfessional(professional.id, {
        last_active_at: new Date().toISOString()
      });

      res.json({ message: "Activity tracked" });
    } catch (error) {
      console.error("Track activity error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Professional dashboard stats
  app.get("/api/professionals/dashboard-stats", authenticate, async (req: any, res) => {
    try {
      if (req.user.role !== 'professional') {
        return res.status(403).json({ error: "Access denied" });
      }

      const professional = await storage.getProfessionalByUserId(req.user.id);
      if (!professional) {
        return res.status(404).json({ error: "Professional not found" });
      }

      const appointments = await storage.getAppointmentsByProfessional(professional.id);
      const today = new Date().toISOString().split('T')[0];
      
      const stats = {
        appointments: {
          total: appointments.length,
          today: appointments.filter(a => a.date === today).length,
          thisWeek: appointments.filter(a => {
            const appointmentDate = new Date(a.date);
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            return appointmentDate >= weekStart;
          }).length,
          thisMonth: appointments.filter(a => {
            const thisMonth = new Date().toISOString().slice(0, 7);
            return a.date && a.date.startsWith(thisMonth);
          }).length,
          confirmed: appointments.filter(a => a.status === 'confirmed').length,
          completed: appointments.filter(a => a.status === 'completed').length,
          pending: appointments.filter(a => a.status === 'pending').length
        },
        revenue: {
          thisMonth: appointments.filter(a => {
            const thisMonth = new Date().toISOString().slice(0, 7);
            return a.date && a.date.startsWith(thisMonth) && a.status === 'completed';
          }).reduce((sum, a) => sum + (a.price || 0), 0),
          lastMonth: appointments.filter(a => {
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            const lastMonthStr = lastMonth.toISOString().slice(0, 7);
            return a.date && a.date.startsWith(lastMonthStr) && a.status === 'completed';
          }).reduce((sum, a) => sum + (a.price || 0), 0)
        },
        rating: professional.rating || 0,
        totalConsultations: appointments.filter(a => a.status === 'completed').length,
        availableHours: professional.available_hours || 0
      };

      res.json(stats);
    } catch (error) {
      console.error("Get professional dashboard stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin professional agendas endpoint
  app.get("/api/admin/professional-agendas", async (req, res) => {
    try {
      const agendas = await storage.getProfessionalAgendas();
      res.json(agendas);
    } catch (error) {
      console.error("Error fetching professional agendas:", error);
      res.status(500).json({ error: "Failed to fetch professional agendas" });
    }
  });

  // Admin appointments endpoint
  app.get("/api/admin/appointments", async (req, res) => {
    try {
      const appointments = await storage.getAllAppointments();
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  // Rota específica para agendamentos do profissional (calendário)
  app.get("/api/professionals/calendar-appointments", authenticate, async (req: any, res) => {
    try {
      if (req.user.role !== 'professional') {
        return res.status(403).json({ error: "Access denied" });
      }

      // Buscar profissional diretamente pelo user_id
      const professional = await storage.getProfessionalByUserId(req.user.id);
      console.log('Profissional encontrado para user_id:', req.user.id, professional?.id);
      
      if (!professional) {
        return res.status(404).json({ error: "Professional profile not found" });
      }

      const appointments = await storage.getAppointmentsByProfessional(professional.id);
      const users = await storage.getAllUsers();

      // Formatar agendamentos para o calendário
      const calendarAppointments = appointments.map(appointment => {
        const patient = users.find(u => u.id === appointment.patient_id);
        const appointmentDate = new Date(appointment.scheduled_at);
        
        return {
          id: appointment.id,
          patientName: patient?.full_name || 'Paciente',
          patientPhone: patient?.phone || '',
          patientEmail: patient?.email || '',
          date: appointmentDate.toLocaleDateString('pt-BR'),
          time: appointmentDate.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          status: appointment.status === 'scheduled' ? 'agendado' as const :
                  appointment.status === 'confirmed' ? 'confirmado' as const :
                  appointment.status === 'completed' ? 'realizado' as const :
                  appointment.status === 'cancelled' ? 'cancelado' as const :
                  'agendado' as const,
          type: appointment.plan_type === 'retorno' ? 'retorno' as const : 'consulta' as const
        };
      });

      res.json(calendarAppointments);
    } catch (error) {
      console.error("Get calendar appointments error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Rota para criar novo agendamento (página principal)
  app.post("/api/appointments/create", authenticate, async (req: any, res) => {
    try {
      const { professional_id, scheduled_at, duration_minutes, plan_type, notes } = req.body;

      // Validar se é um paciente ou admin
      if (req.user.role !== 'patient' && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Only patients can book appointments" });
      }

      // Verificar se o profissional existe e está aprovado
      const professionals = await storage.getAllProfessionals();
      const professional = professionals.find(p => p.id === professional_id);
      
      if (!professional || !professional.approved) {
        return res.status(404).json({ error: "Professional not found or not approved" });
      }

      const newAppointment = await storage.createAppointment({
        patient_id: req.user.id,
        professional_id,
        scheduled_at: new Date(scheduled_at),
        duration_minutes: duration_minutes || 60,
        status: 'scheduled',
        notes,
        plan_type: plan_type || 'consulta'
      });

      res.json({ 
        success: true, 
        appointment: newAppointment,
        message: "Agendamento criado com sucesso!"
      });
    } catch (error) {
      console.error("Create appointment error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Rota para estatísticas administrativas detalhadas
  app.get("/api/admin/detailed-stats", authenticate, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied" });
      }

      const appointments = await storage.getAllAppointments();
      const professionals = await storage.getAllProfessionals();
      const users = await storage.getAllUsers();

      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

      // Estatísticas de agendamentos
      const appointmentsToday = appointments.filter(a => {
        const appointmentDate = new Date(a.scheduled_at);
        return appointmentDate.toDateString() === today.toDateString();
      }).length;

      const appointmentsThisMonth = appointments.filter(a => {
        const appointmentDate = new Date(a.scheduled_at);
        return appointmentDate >= startOfMonth && appointmentDate <= today;
      }).length;

      // Receita
      const revenueThisMonth = appointments
        .filter(a => {
          const appointmentDate = new Date(a.scheduled_at);
          return appointmentDate >= startOfMonth && appointmentDate <= today && a.payment_status === 'approved';
        })
        .reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);

      const revenueLastMonth = appointments
        .filter(a => {
          const appointmentDate = new Date(a.scheduled_at);
          return appointmentDate >= lastMonth && appointmentDate <= endOfLastMonth && a.payment_status === 'approved';
        })
        .reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);

      // Pacientes
      const patients = users.filter(u => u.role === 'patient');
      const activePatients = appointments
        .filter(a => {
          const appointmentDate = new Date(a.scheduled_at);
          return appointmentDate >= startOfMonth;
        })
        .map(a => a.patient_id)
        .filter((id, index, arr) => arr.indexOf(id) === index).length;

      const stats = {
        professionals: {
          total: professionals.length,
          approved: professionals.filter(p => p.approved).length,
          pending: professionals.filter(p => !p.approved).length
        },
        appointments: {
          today: appointmentsToday,
          thisMonth: appointmentsThisMonth,
          confirmed: appointments.filter(a => a.status === 'confirmed').length,
          scheduled: appointments.filter(a => a.status === 'scheduled').length
        },
        revenue: {
          thisMonth: revenueThisMonth,
          lastMonth: revenueLastMonth
        },
        patients: {
          total: patients.length,
          active: activePatients
        }
      };

      res.json(stats);
    } catch (error) {
      console.error("Get detailed stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Rota para salvar horários de disponibilidade do profissional
  app.post("/api/professionals/availability", authenticate, async (req: any, res) => {
    try {
      if (req.user.role !== 'professional') {
        return res.status(403).json({ error: "Access denied" });
      }

      // Buscar profissional diretamente pelo user_id
      const professional = await storage.getProfessionalByUserId(req.user.id);
      
      if (!professional) {
        return res.status(404).json({ error: "Professional profile not found" });
      }

      const { availability } = req.body;
      
      // Atualizar a disponibilidade do profissional
      await storage.updateProfessional(professional.id, {
        available_hours: availability
      });

      res.json({ 
        success: true, 
        message: "Horários de disponibilidade salvos com sucesso!" 
      });
    } catch (error) {
      console.error("Save availability error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Rota para buscar horários de disponibilidade do profissional
  app.get("/api/professionals/availability", authenticate, async (req: any, res) => {
    try {
      if (req.user.role !== 'professional') {
        return res.status(403).json({ error: "Access denied" });
      }

      // Buscar profissional diretamente pelo user_id
      const professional = await storage.getProfessionalByUserId(req.user.id);
      
      if (!professional) {
        return res.status(404).json({ error: "Professional profile not found" });
      }

      res.json({ 
        availability: professional.available_hours || {},
        customTimeSlots: professional.available_hours?.customTimeSlots || {},
        professional_id: professional.id 
      });
    } catch (error) {
      console.error("Get availability error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Rota pública para buscar horários de disponibilidade por ID do profissional
  app.get("/api/professionals/:id/availability", async (req, res) => {
    try {
      const professionalId = req.params.id;
      const professionals = await storage.getAllProfessionals();
      const professional = professionals.find(p => p.id === professionalId);
      
      if (!professional) {
        return res.status(404).json({ error: "Professional not found" });
      }

      res.json({ 
        availability: professional.available_hours || {},
        customTimeSlots: professional.available_hours?.customTimeSlots || {},
        professional_id: professional.id 
      });
    } catch (error) {
      console.error("Get professional availability error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", authenticate, async (req: any, res) => {
    try {
      let appointments;
      
      if (req.user.role === 'patient') {
        appointments = await storage.getAppointmentsByPatient(req.user.id);
      } else if (req.user.role === 'professional') {
        const professional = await storage.getProfessionalByUserId(req.user.id);
        if (professional) {
          appointments = await storage.getAppointmentsByProfessional(professional.id);
        } else {
          appointments = [];
        }
      } else if (req.user.role === 'admin') {
        // Admin can see all appointments
        appointments = await storage.getAllAppointments();
      } else {
        appointments = [];
      }

      res.json(appointments);
    } catch (error) {
      console.error("Get appointments error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin route to get all appointments with professional details
  app.get("/api/admin/appointments", authenticate, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied" });
      }

      const appointments = await storage.getAllAppointments();
      const professionals = await storage.getAllProfessionals();
      const users = await storage.getAllUsers();

      const appointmentsWithDetails = appointments.map(appointment => {
        const professional = professionals.find(p => p.id === appointment.professionalId);
        const professionalUser = professional ? users.find(u => u.id === professional.userId) : null;
        const patientUser = users.find(u => u.id === appointment.patientId);
        
        return {
          ...appointment,
          professional: professional ? {
            ...professional,
            name: professionalUser?.full_name || 'Profissional',
            email: professionalUser?.email || ''
          } : null,
          patient: patientUser ? {
            id: patientUser.id,
            name: patientUser.full_name || 'Paciente',
            email: patientUser.email || ''
          } : null
        };
      });

      res.json(appointmentsWithDetails);
    } catch (error) {
      console.error("Get admin appointments error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin route to get professional agendas
  app.get("/api/admin/professional-agendas", authenticate, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied" });
      }

      const agendas = await storage.getProfessionalAgendas();
      res.json(agendas);
    } catch (error) {
      console.error("Get professional agendas error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin route to approve professional
  app.post("/api/admin/professionals/:id/approve", authenticate, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied" });
      }

      const { id } = req.params;
      const updatedProfessional = await storage.updateProfessional(id, { approved: true });
      
      if (!updatedProfessional) {
        return res.status(404).json({ error: "Professional not found" });
      }

      res.json({ message: "Professional approved successfully", professional: updatedProfessional });
    } catch (error) {
      console.error("Approve professional error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin route to suspend professional
  app.post("/api/admin/professionals/:id/suspend", authenticate, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied" });
      }

      const { id } = req.params;
      const updatedProfessional = await storage.updateProfessional(id, { approved: false });
      
      if (!updatedProfessional) {
        return res.status(404).json({ error: "Professional not found" });
      }

      res.json({ message: "Professional suspended successfully", professional: updatedProfessional });
    } catch (error) {
      console.error("Suspend professional error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin route to delete professional
  app.delete("/api/admin/professionals/:id", authenticate, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied" });
      }

      const { id } = req.params;
      const success = await storage.deleteProfessional(id);
      
      if (!success) {
        return res.status(404).json({ error: "Professional not found" });
      }

      res.json({ message: "Professional deleted successfully" });
    } catch (error) {
      console.error("Delete professional error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin route to update professional
  app.put("/api/admin/professionals/:id", authenticate, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied" });
      }

      const { id } = req.params;
      const { name, email, specialty, crp, approved } = req.body;

      // Validate required fields
      if (!name || !email || !specialty) {
        return res.status(400).json({ error: "Nome, email e especialidade são obrigatórios" });
      }

      const updateData = {
        name,
        email,
        specialty,
        crp: crp || null,
        approved: approved || false,
      };

      const updatedProfessional = await storage.updateProfessionalWithUser(id, updateData);
      
      if (!updatedProfessional) {
        return res.status(404).json({ error: "Professional not found" });
      }

      res.json({ message: "Professional updated successfully", professional: updatedProfessional });
    } catch (error) {
      console.error("Update professional error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin route to update professional status
  app.put("/api/admin/professionals/:id/status", authenticate, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied" });
      }

      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      const validStatuses = ['pending', 'approved', 'rejected', 'suspended'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Status inválido" });
      }

      const updatedProfessional = await storage.updateProfessionalStatus(id, status);
      
      if (!updatedProfessional) {
        return res.status(404).json({ error: "Professional not found" });
      }

      res.json({ message: "Status atualizado com sucesso", professional: updatedProfessional });
    } catch (error) {
      console.error("Update professional status error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/appointments", authenticate, async (req: any, res) => {
    try {
      const appointmentData = {
        ...req.body,
        patient_id: req.user.id,
      };

      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Create appointment error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Mercado Pago Routes

  // Processar pagamento com cartão
  app.post("/api/payments/process", async (req, res) => {
    try {
      const paymentData: PaymentData = req.body;
      
      // Validar dados obrigatórios
      if (!paymentData.token || !paymentData.transaction_amount || !paymentData.payer?.email) {
        return res.status(400).json({ 
          error: "Dados obrigatórios não fornecidos",
          required: ["token", "transaction_amount", "payer.email"] 
        });
      }

      const result = await processCardPayment(paymentData);
      
      // Salvar informações do pagamento no banco (opcional)
      if (result.id && req.body.appointmentData) {
        try {
          const appointmentData = {
            ...req.body.appointmentData,
            payment_id: result.id,
            payment_status: result.status,
            payment_method: result.payment_method_id,
            amount: result.transaction_amount
          };
          
          await storage.createAppointment(appointmentData);
        } catch (dbError) {
          console.error("Erro ao salvar consulta após pagamento:", dbError);
          // Não falha o pagamento por erro de DB
        }
      }

      res.json({
        id: result.id,
        status: result.status,
        status_detail: result.status_detail,
        payment_method: result.payment_method_id,
        transaction_amount: result.transaction_amount,
        date_approved: result.date_approved,
        date_created: result.date_created
      });
    } catch (error: any) {
      console.error("Erro ao processar pagamento:", error);
      res.status(500).json({ 
        error: "Erro ao processar pagamento",
        message: error.message || "Erro interno do servidor"
      });
    }
  });

  // Criar preferência de pagamento (PIX, boleto, etc.)
  app.post("/api/payments/preference", async (req, res) => {
    try {
      const preferenceData: PreferenceData = req.body;
      
      // Validar dados obrigatórios
      if (!preferenceData.items || preferenceData.items.length === 0) {
        return res.status(400).json({ 
          error: "Items são obrigatórios para criar preferência" 
        });
      }

      // Configurar URLs de retorno obrigatórias para o auto_return
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL || `https://${req.get('host')}`
        : `http://${req.get('host')}`;

      // Configurar URLs de callback (opcional para PIX)
      preferenceData.back_urls = {
        success: `${baseUrl}/pagamento/sucesso`,
        failure: `${baseUrl}/pagamento/erro`, 
        pending: `${baseUrl}/pagamento/pendente`
      };
      
      // Remover auto_return temporariamente para testar PIX
      // preferenceData.auto_return = 'approved';
      
      // Adicionar notification_url para receber webhooks
      preferenceData.notification_url = `${baseUrl}/api/payments/webhook`;

      console.log('URLs configuradas para preferência:', {
        baseUrl,
        back_urls: preferenceData.back_urls,
        auto_return: preferenceData.auto_return,
        notification_url: preferenceData.notification_url
      });

      const result = await createPaymentPreference(preferenceData);

      res.json({
        id: result.id,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point,
        collector_id: result.collector_id,
        client_id: result.client_id,
        date_created: result.date_created
      });
    } catch (error: any) {
      console.error("Erro ao criar preferência:", error);
      res.status(500).json({ 
        error: "Erro ao criar preferência de pagamento",
        message: error.message || "Erro interno do servidor"
      });
    }
  });

  // Webhook para receber notificações do Mercado Pago
  app.post("/api/payments/webhook", async (req, res) => {
    try {
      const { type, data } = req.body;
      
      console.log("Webhook Mercado Pago recebido:", { type, data });

      if (type === 'payment') {
        const paymentId = data.id;
        
        // Buscar detalhes do pagamento
        const paymentDetails = await getPaymentDetails(paymentId);
        
        // Atualizar status do agendamento no banco
        if (paymentDetails.external_reference) {
          try {
            await storage.updateAppointmentPaymentStatus(
              paymentDetails.external_reference, 
              paymentDetails.status
            );
          } catch (dbError) {
            console.error("Erro ao atualizar status do pagamento no banco:", dbError);
          }
        }

        // Log para debug
        console.log(`Pagamento ${paymentId} atualizado para status: ${paymentDetails.status}`);
      }

      // Retornar 200 para confirmar recebimento
      res.status(200).send('OK');
    } catch (error) {
      console.error("Erro no webhook:", error);
      res.status(500).json({ error: "Erro ao processar webhook" });
    }
  });

  // Consultar status de pagamento
  app.get("/api/payments/:paymentId", async (req, res) => {
    try {
      const { paymentId } = req.params;
      const paymentDetails = await getPaymentDetails(paymentId);
      
      res.json({
        id: paymentDetails.id,
        status: paymentDetails.status,
        status_detail: paymentDetails.status_detail,
        payment_method: paymentDetails.payment_method_id,
        transaction_amount: paymentDetails.transaction_amount,
        date_approved: paymentDetails.date_approved,
        date_created: paymentDetails.date_created,
        external_reference: paymentDetails.external_reference
      });
    } catch (error: any) {
      console.error("Erro ao consultar pagamento:", error);
      res.status(500).json({ 
        error: "Erro ao consultar pagamento",
        message: error.message || "Erro interno do servidor"
      });
    }
  });

  const httpServer = createServer(app);

  // WebSocket para sincronização em tempo real
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Armazenar conexões WebSocket por tipo de usuário
  const connections = {
    admin: new Set(),
    professional: new Set(),
    patient: new Set()
  };

  wss.on('connection', (ws, req) => {
    console.log('Nova conexão WebSocket');
    
    // Configurar timeout para conexões WebSocket
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'auth') {
          // Autenticar usuário via WebSocket
          const token = data.token;
          try {
            const decoded = jwt.verify(token, JWT_SECRET) as any;
            ws.userId = decoded.userId;
            ws.userRole = data.role;
            
            // Adicionar à conexão apropriada
            if (connections[data.role]) {
              connections[data.role].add(ws);
            }
            
            ws.send(JSON.stringify({ type: 'auth_success', message: 'Authenticated' }));
          } catch (error) {
            ws.send(JSON.stringify({ type: 'auth_error', message: 'Invalid token' }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      // Remover conexão de todas as listas
      Object.values(connections).forEach(set => set.delete(ws));
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Ping/Pong para manter conexões WebSocket ativas
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        ws.terminate();
        return;
      }
      
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000); // 30 segundos

  wss.on('close', () => {
    clearInterval(interval);
  });

  // Função para broadcast para admins
  const broadcastToAdmins = (data) => {
    connections.admin.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });
  };

  // Função para broadcast para profissionais
  const broadcastToProfessionals = (data) => {
    connections.professional.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });
  };

  // Modificar endpoints para enviar atualizações em tempo real
  const originalApprove = app._router.stack.find(layer => 
    layer.route && layer.route.path === '/api/professionals/:id/approve'
  );
  
  // Interceptar aprovação de profissional para notificar em tempo real
  app.patch("/api/professionals/:id/approve", authenticate, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Only admins can approve professionals" });
      }

      const professional = await storage.updateProfessional(req.params.id, { approved: true });
      if (!professional) {
        return res.status(404).json({ error: "Professional not found" });
      }

      // Notificar todas as conexões admin em tempo real
      broadcastToAdmins({
        type: 'professional_approved',
        data: professional
      });

      res.json({ message: "Professional approved successfully", professional });
    } catch (error) {
      console.error("Approve professional error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Interceptar registro de profissional para notificar admins
  app.post("/api/professionals/register", async (req, res) => {
    try {
      const { 
        name, 
        email, 
        password, 
        specialty, 
        crp, 
        therapeuticApproach, 
        experience, 
        description,
        phone,
        cpf,
        gender,
        address
      } = req.body;

      // Validate required fields
      if (!name || !email || !password || !specialty) {
        return res.status(400).json({ error: "Campos obrigatórios não preenchidos" });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(400).json({ error: "Email já está em uso" });
      }

      // Hash password
      const hashedPassword = await storage.hashPassword(password);

      // Create user with professional role
      const user = await storage.createUser({
        email: normalizedEmail,
        password_hash: hashedPassword,
        full_name: name,
        role: 'professional'
      });

      // Create professional profile (not approved by default)
      const professional = await storage.createProfessional({
        user_id: user.id,
        email: normalizedEmail,
        crp: crp || '',
        specialties: [specialty],
        bio: description || '',
        approved: false // Requires admin approval
      });

      // Notificar admins sobre novo profissional
      broadcastToAdmins({
        type: 'new_professional_registration',
        data: {
          professional,
          user: { 
            id: user.id, 
            email: user.email, 
            full_name: user.full_name, 
            role: user.role 
          }
        }
      });

      res.status(201).json({ 
        message: "Cadastro realizado com sucesso! Aguarde a aprovação do administrador.",
        user: { 
          id: user.id, 
          email: user.email, 
          full_name: user.full_name, 
          role: user.role 
        },
        professional: {
          id: professional.id,
          approved: professional.approved
        }
      });
    } catch (error) {
      console.error("Professional registration error:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Configurar rotas da API externa para integrações
  setupApiRoutes(app);
  
  // Configurar rotas de administração de integrações
  setupAdminIntegrationRoutes(app, authenticate);
  
  console.log(`🔌 API externa disponível em /api/v1`);
  console.log(`⚙️ Admin integrações disponível em /api/admin`);

  return httpServer;
}
