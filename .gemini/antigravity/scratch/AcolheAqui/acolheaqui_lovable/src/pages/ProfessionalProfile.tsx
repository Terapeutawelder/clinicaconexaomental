import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useParams, Link } from "react-router-dom";
import { formatProfessionalName } from "@/lib/formatProfessionalName";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  Clock, 
  MessageCircle, 
  Loader2,
  Heart,
  Calendar,
  Sparkles,
  Brain,
  Users,
  Star,
  Package,
  Check,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  GraduationCap,
  Award,
  Menu,
  X,
  Send,
  Instagram,
  Linkedin,
  Facebook,
  Youtube,
  Quote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ScheduleModal from "@/components/profile/ScheduleModal";
import CheckoutOverlay from "@/components/profile/CheckoutOverlay";
import { useContactForm } from "@/hooks/useContactForm";

interface Profile {
  id: string;
  full_name: string;
  gender: 'male' | 'female' | 'other';
  specialty: string;
  crp: string;
  bio: string;
  avatar_url: string;
  phone: string;
  email: string;
  resume_url: string;
  instagram_url: string;
  linkedin_url: string;
  facebook_url: string;
  youtube_url: string;
  tiktok_url: string;
  twitter_url: string;
  specialties: string[];
  approaches: string[];
  is_demo?: boolean;
}

interface AvailableHour {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface SessionPackage {
  sessions: number;
  discount_percent: number;
  price_cents: number;
}

interface ProductConfig {
  is_package?: boolean;
  package_sessions?: number;
  package_discount_percent?: number;
  session_packages?: SessionPackage[];
  image_url?: string;
}

interface CheckoutConfig {
  accentColor?: string;
  sideBanners?: string[];
  videoSettings?: {
    autoplay?: boolean;
    loop?: boolean;
  };
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  is_active: boolean;
  product_config: ProductConfig | null;
  checkout_config: CheckoutConfig | null;
}

interface GatewayConfig {
  accessToken: string;
  gateway: string;
}

interface Testimonial {
  id: string;
  client_name: string;
  content: string;
  rating: number;
  is_featured: boolean;
}

interface LandingPageFooterConfig {
  description?: string;
  copyright?: string;
}

interface LandingPageColorsConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

interface LandingPageConfig {
  colors?: LandingPageColorsConfig;
  images?: {
    aboutPhoto?: string;
    heroBanner?: string;
  };
  hero?: {
    badge?: string;
    title?: string;
    subtitle?: string;
    ctaText?: string;
  };
  about?: {
    title?: string;
    subtitle?: string;
  };
  services?: {
    title?: string;
    subtitle?: string;
  };
  testimonials?: {
    title?: string;
    subtitle?: string;
  };
  faq?: {
    title?: string;
    subtitle?: string;
    items?: { question: string; answer: string }[];
  };
  contact?: {
    title?: string;
    subtitle?: string;
    address?: string;
    phone?: string;
    email?: string;
    hours?: string;
  };
  footer?: LandingPageFooterConfig;
}

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

/**
 * Expects "H S% L%" (e.g. "168 45% 35%") and returns a new HSL string with adjusted lightness.
 */
const adjustHslLightness = (hsl: string, deltaL: number) => {
  const parts = (hsl || "").trim().split(/\s+/);
  if (parts.length !== 3) return hsl;

  const h = parts[0];
  const s = parseFloat(String(parts[1]).replace("%", ""));
  const l = parseFloat(String(parts[2]).replace("%", ""));
  if (!Number.isFinite(s) || !Number.isFinite(l)) return hsl;

  const nextL = clamp(l + deltaL);
  return `${h} ${s}% ${nextL}%`;
};

const ProfessionalProfile = () => {
  const params = useParams<{ id?: string; slug?: string }>();
  const id = params.id || params.slug;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [availableHours, setAvailableHours] = useState<AvailableHour[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [gatewayConfig, setGatewayConfig] = useState<GatewayConfig | null>(null);
  const [landingConfig, setLandingConfig] = useState<LandingPageConfig | null>(null);
  const footerConfig = landingConfig?.footer || null;
  const landingColors = landingConfig?.colors || null;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Inline schedule selection states
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? 1 : 1 - day; // Start on Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    return monday;
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  
  // Refs for auto-scroll between booking steps
  const dateSelectionRef = useRef<HTMLDivElement>(null);
  const timeSelectionRef = useRef<HTMLDivElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);
  
  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);
  
  // Contact form state - initialized after profile is loaded
  const [profileId, setProfileId] = useState<string>("");
  const contactForm = useContactForm({ professionalId: profileId });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (id) {
      fetchProfile(id);
    }
  }, [id]);

  const fetchProfile = async (profileIdOrSlug: string) => {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileIdOrSlug);
      
      let profileData = null;
      let profileError = null;

      if (isUUID) {
        const result = await supabase
          .from("public_professional_profiles")
          .select("id, full_name, specialty, specialties, approaches, crp, bio, avatar_url, is_verified, user_slug, gender")
          .eq("id", profileIdOrSlug)
          .maybeSingle();
        profileData = result.data;
        profileError = result.error;
      }

      if (!profileData && !profileError) {
        const result = await supabase
          .from("public_professional_profiles")
          .select("id, full_name, specialty, specialties, approaches, crp, bio, avatar_url, is_verified, user_slug, gender")
          .eq("user_slug", profileIdOrSlug)
          .maybeSingle();
        profileData = result.data;
        profileError = result.error;
      }

      if (profileError) throw profileError;

      if (!profileData) {
        setNotFound(true);
        return;
      }

      const actualProfileId = profileData.id;

      // Set profile immediately and fetch all other data in parallel
      setProfile({
        id: profileData.id,
        full_name: profileData.full_name || "Profissional",
        gender: ((profileData as any).gender as 'male' | 'female') || "female",
        specialty: profileData.specialty || "",
        crp: profileData.crp || "",
        bio: profileData.bio || "",
        avatar_url: profileData.avatar_url || "",
        phone: "", // Not exposed in public view for privacy
        email: "", // Not exposed in public view for privacy
        resume_url: "", // Not exposed in public view for privacy
        instagram_url: "", // Social links not exposed in public view
        linkedin_url: "",
        facebook_url: "",
        youtube_url: "",
        tiktok_url: "",
        twitter_url: "",
        specialties: (profileData as any).specialties || [],
        approaches: (profileData as any).approaches || [],
        is_demo: false,
      });
      setProfileId(actualProfileId);

      // Fetch all related data in parallel for faster loading
      const [hoursResult, servicesResult, testimonialsResult, gatewayResult, landingConfigResult] = await Promise.all([
        supabase
          .from("available_hours")
          .select("day_of_week, start_time, end_time, is_active")
          .eq("professional_id", actualProfileId)
          .eq("is_active", true)
          .order("day_of_week"),
        supabase
          .from("services")
          .select("id, name, description, duration_minutes, price_cents, is_active, product_config, checkout_config")
          .eq("professional_id", actualProfileId)
          .eq("is_active", true)
          .order("price_cents", { ascending: true }),
        supabase
          .from("testimonials")
          .select("id, client_name, content, rating, is_featured")
          .eq("professional_id", actualProfileId)
          .eq("is_approved", true)
          .order("is_featured", { ascending: false })
          .limit(6),
        supabase
          .from("payment_gateways")
          .select("card_api_key, card_gateway")
          .eq("professional_id", actualProfileId)
          .eq("is_active", true)
          .maybeSingle(),
        supabase
          .from("landing_page_config")
          .select("config")
          .eq("professional_id", actualProfileId)
          .maybeSingle()
      ]);

      // Process hours data
      if (!hoursResult.error && hoursResult.data) {
        setAvailableHours(hoursResult.data);
      }

      // Process services data
      if (!servicesResult.error && servicesResult.data) {
        const typedServices: Service[] = servicesResult.data.map((s) => ({
          id: s.id as string,
          name: s.name as string,
          description: s.description as string | null,
          duration_minutes: s.duration_minutes as number,
          price_cents: s.price_cents as number,
          is_active: s.is_active as boolean,
          product_config: s.product_config as ProductConfig | null,
          checkout_config: s.checkout_config as CheckoutConfig | null,
        }));
        setServices(typedServices);
        if (typedServices.length > 0) {
          setSelectedService(typedServices[0]);
        }
      }

      // Process testimonials data
      if (!testimonialsResult.error && testimonialsResult.data) {
        setTestimonials(testimonialsResult.data.map(t => ({
          id: t.id,
          client_name: t.client_name,
          content: t.content,
          rating: t.rating,
          is_featured: t.is_featured || false,
        })));
      }

      // Process gateway config
      if (!gatewayResult.error && gatewayResult.data?.card_api_key && gatewayResult.data?.card_gateway) {
        const data = gatewayResult.data;
        const gateway = String(data.card_gateway);
        const raw = String(data.card_api_key);
        let token = raw;

        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            const tokenKeyByGateway: Record<string, string> = {
              mercadopago: "accessToken",
              pushinpay: "apiKey",
              pagarme: "apiKey",
              pagseguro: "token",
              stripe: "secretKey",
              asaas: "accessToken",
            };
            const tokenKey = tokenKeyByGateway[gateway];
            if (tokenKey && typeof (parsed as any)[tokenKey] === "string" && (parsed as any)[tokenKey].trim()) {
              token = (parsed as any)[tokenKey];
            }
          }
        } catch {
          // ignore
        }

        if (raw.includes("|")) {
          const parts = raw.split("|");
          if (gateway === "mercadopago" || gateway === "stripe" || gateway === "pagseguro") {
            token = parts[1] || parts[0] || raw;
          } else {
            token = parts[0] || raw;
          }
        }

        setGatewayConfig({
          accessToken: token,
          gateway,
        });
      }

      // Process landing page config
      if (!landingConfigResult.error && landingConfigResult.data?.config) {
        setLandingConfig(landingConfigResult.data.config as LandingPageConfig);
      } else {
        setLandingConfig(null);
      }

    } catch (error) {
      console.error("Error fetching profile:", error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  // Week navigation helpers
  // Check if we can go to previous week
  const canGoToPreviousWeek = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate Monday of current week
    const currentMonday = new Date(today);
    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    currentMonday.setDate(today.getDate() + diffToMonday);
    
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    
    return newStart >= currentMonday;
  };

  const goToPreviousWeek = () => {
    if (!canGoToPreviousWeek()) return;
    
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    
    setCurrentWeekStart(newStart);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  // Get week days (Mon-Fri)
  const getWeekDays = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      return date;
    });
  };

  // Get available times for a specific date based on available_hours from DB
  const getAvailableTimesForDate = (date: Date): string[] => {
    const dayOfWeek = date.getDay();
    const hoursForDay = availableHours.filter(h => h.day_of_week === dayOfWeek && h.is_active);
    const times: string[] = [];
    
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const currentHour = today.getHours();
    const currentMinutes = today.getMinutes();
    
    hoursForDay.forEach(h => {
      const [startH, startM] = h.start_time.split(':').map(Number);
      const [endH, endM] = h.end_time.split(':').map(Number);
      let current = startH * 60 + startM;
      const end = endH * 60 + endM;
      
      while (current < end) {
        const hours = Math.floor(current / 60);
        const minutes = current % 60;
        
        // Skip past times if today
        if (isToday && (hours < currentHour || (hours === currentHour && minutes <= currentMinutes))) {
          current += 60;
          continue;
        }
        
        const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        // Check if slot is already booked
        const dateStr = date.toISOString().split('T')[0];
        const slotKey = `${dateStr}_${timeStr}`;
        if (!bookedSlots.includes(slotKey)) {
          times.push(timeStr);
        }
        
        current += 60;
      }
    });
    
    return times.sort();
  };

  // Check if a date has available hours
  const isDateAvailable = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    
    return getAvailableTimesForDate(date).length > 0;
  };

  // Format date for display
  const formatDateDisplay = (date: Date) => {
    const days = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    return days[date.getDay()];
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const formatFullDate = (date: Date) => {
    const days = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    return `${days[date.getDay()]}, ${date.getDate()} de ${date.toLocaleDateString('pt-BR', { month: 'long' })}`;
  };

  // Fetch booked appointments for date range
  const fetchBookedSlots = async (profId: string, startDate: Date, endDate: Date) => {
    try {
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("appointments")
        .select("appointment_date, appointment_time")
        .eq("professional_id", profId)
        .gte("appointment_date", startStr)
        .lte("appointment_date", endStr)
        .in("status", ["pending", "confirmed"]);
      
      if (error) throw error;
      
      const slots = (data || []).map(a => `${a.appointment_date}_${a.appointment_time}`);
      setBookedSlots(slots);
    } catch (error) {
      console.error("Error fetching booked slots:", error);
    }
  };

  // Fetch booked slots when week changes
  useEffect(() => {
    if (profile?.id) {
      const endDate = new Date(currentWeekStart);
      endDate.setDate(endDate.getDate() + 6);
      fetchBookedSlots(profile.id, currentWeekStart, endDate);
    }
  }, [currentWeekStart, profile?.id]);

  // Scroll helper for auto-scrolling between booking steps
  const scrollToRef = (ref: React.RefObject<HTMLDivElement>, delay: number = 100) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, delay);
  };

  // Find the next available date with time slots
  const findNextAvailableDate = (): { date: Date; weekStart: Date } | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Search up to 8 weeks ahead
    for (let week = 0; week < 8; week++) {
      for (let day = 0; day < 7; day++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + (week * 7) + day);
        
        // Skip past dates
        if (checkDate < today) continue;
        
        // Check if this date has available hours
        const dayOfWeek = checkDate.getDay();
        const hoursForDay = availableHours.filter(h => h.day_of_week === dayOfWeek && h.is_active);
        
        if (hoursForDay.length > 0) {
          // Check if there are any available time slots (not just configured hours)
          const times = getAvailableTimesForDate(checkDate);
          if (times.length > 0) {
            // Calculate the week start (Monday) for this date
            const weekStartDate = new Date(checkDate);
            const dayIndex = checkDate.getDay();
            const diff = dayIndex === 0 ? -6 : 1 - dayIndex; // Adjust to Monday
            weekStartDate.setDate(checkDate.getDate() + diff);
            
            return { date: checkDate, weekStart: weekStartDate };
          }
        }
      }
    }
    
    return null;
  };

  // Handle plan selection with auto-scroll to date and auto-navigation to next available
  const handlePlanSelect = (service: Service) => {
    setSelectedService(service);
    setSelectedTime(null);
    
    // Find and navigate to the next available date
    const nextAvailable = findNextAvailableDate();
    
    if (nextAvailable) {
      // Update week to show the available date
      setCurrentWeekStart(nextAvailable.weekStart);
      // Pre-select the available date
      setSelectedDate(nextAvailable.date);
      // Scroll to time selection since date is already selected
      scrollToRef(timeSelectionRef, 200);
    } else {
      setSelectedDate(null);
      scrollToRef(dateSelectionRef, 150);
    }
  };

  // Handle date selection with auto-scroll to time
  const handleDateSelect = (day: Date) => {
    setSelectedDate(day);
    setSelectedTime(null);
    scrollToRef(timeSelectionRef, 150);
  };

  // Handle time selection with auto-scroll to confirmation
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    scrollToRef(confirmationRef, 150);
  };

  // Handle confirm booking - goes directly to checkout
  const handleConfirmInlineBooking = () => {
    if (selectedService && selectedDate && selectedTime) {
      setScheduledDate(selectedDate);
      setScheduledTime(selectedTime);
      setShowCheckoutModal(true);
    }
  };

  const handleScheduleClick = (service: Service) => {
    setSelectedService(service);
    setShowScheduleModal(true);
  };

  const handleScheduleConfirm = (date: Date, time: string) => {
    setScheduledDate(date);
    setScheduledTime(time);
    setShowScheduleModal(false);
    setShowCheckoutModal(true);
  };

  const formatPrice = (priceCents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(priceCents / 100);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Calculate average rating
  const averageRating = testimonials.length > 0 
    ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length 
    : 5.0;

  // Default services for display
  const defaultServiceCards = [
    { icon: Brain, title: "Terapia Individual", description: "Sessões personalizadas para trabalhar questões emocionais, comportamentais e de desenvolvimento pessoal." },
    { icon: Users, title: "Terapia de Casal", description: "Apoio para casais que desejam melhorar a comunicação e fortalecer o relacionamento." },
    { icon: Heart, title: "Ansiedade e Depressão", description: "Tratamento especializado para transtornos de ansiedade e depressão com abordagem humanizada." },
    { icon: Sparkles, title: "Autoconhecimento", description: "Processo terapêutico focado em desenvolver maior consciência de si mesmo e seu potencial." },
  ];

  // FAQ items - use config if available, otherwise default
  const defaultFaqItems = [
    { question: "Como funciona a terapia online?", answer: "As sessões são realizadas por videochamada em uma plataforma segura e privada. Você pode participar do conforto da sua casa, precisando apenas de uma conexão estável de internet e um local reservado." },
    { question: "Qual a duração de cada sessão?", answer: "As sessões têm duração de 50 minutos a 1 hora, dependendo do tipo de atendimento escolhido. O tempo é adequado para trabalharmos as questões de forma profunda e produtiva." },
    { question: "Com que frequência devo fazer terapia?", answer: "Geralmente recomendamos sessões semanais no início do processo terapêutico. Conforme sua evolução, podemos ajustar a frequência para quinzenal ou mensal." },
    { question: "A terapia online é tão eficaz quanto a presencial?", answer: "Sim, diversas pesquisas científicas demonstram que a terapia online tem a mesma eficácia que a presencial para a maioria dos casos, com a vantagem da praticidade e flexibilidade." },
    { question: "Como funciona o sigilo profissional?", answer: "O sigilo é garantido pelo Código de Ética do psicólogo. Todas as informações compartilhadas nas sessões são estritamente confidenciais e protegidas por lei." },
    { question: "Posso cancelar ou remarcar uma sessão?", answer: "Sim, você pode cancelar ou remarcar com até 24 horas de antecedência. Cancelamentos fora desse prazo podem estar sujeitos a cobrança conforme nossa política." },
  ];
  const faqItems = landingConfig?.faq?.items?.length ? landingConfig.faq.items : defaultFaqItems;

  const navLinks = [
    { label: "Início", id: "inicio" },
    { label: "Serviços", id: "servicos" },
    { label: "Sobre", id: "sobre" },
    { label: "Agenda", id: "agenda" },
    { label: "Contato", id: "contato" },
  ];

  const themeVars = useMemo(() => {
    if (!landingColors) return undefined;

    const teal = landingColors.primary;
    const tealLight = landingColors.secondary;
    const tealDark = adjustHslLightness(teal, -10);
    const gold = landingColors.accent;
    const goldLight = adjustHslLightness(gold, 40);
    const cream = landingColors.background;
    const sand = adjustHslLightness(cream, -7);
    const sandDark = adjustHslLightness(cream, -20);

    return {
      "--teal": teal,
      "--teal-light": tealLight,
      "--teal-dark": tealDark,
      "--gold": gold,
      "--gold-light": goldLight,
      "--cream": cream,
      "--sand": sand,
      "--sand-dark": sandDark,

      // Keep gradient tokens in sync for any CSS that relies on them
      "--gradient-primary": `linear-gradient(135deg, hsl(${teal}), hsl(${tealDark}))`,
      "--gradient-accent": `linear-gradient(135deg, hsl(${gold}), hsl(${adjustHslLightness(gold, -10)}))`,
      "--gradient-warm": `linear-gradient(135deg, hsl(${teal}), hsl(${gold}))`,
      "--gradient-hero": `linear-gradient(180deg, hsl(${cream}) 0%, hsl(${tealLight}) 100%)`,
    } as CSSProperties;
  }, [landingColors]);

  const contactInfo = [
    { icon: MapPin, title: "Endereço", content: landingConfig?.contact?.address || "São Paulo, SP" },
    { icon: Phone, title: "Telefone", content: landingConfig?.contact?.phone || profile?.phone || "(11) 99999-9999" },
    { icon: Mail, title: "E-mail", content: landingConfig?.contact?.email || profile?.email || "contato@exemplo.com.br" },
    { icon: Clock, title: "Horário", content: landingConfig?.contact?.hours || "Seg - Sex: 08h às 19h" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream preview-light-theme flex items-center justify-center" style={themeVars}>
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-teal" />
          <p className="text-slate">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-cream preview-light-theme flex flex-col items-center justify-center p-4" style={themeVars}>
        <div className="bg-card rounded-2xl border border-border p-12 text-center max-w-md shadow-lg">
          <div className="w-20 h-20 rounded-full bg-teal-light flex items-center justify-center mx-auto mb-6">
            <User className="h-10 w-10 text-teal" />
          </div>
          <h1 className="text-2xl font-bold text-charcoal mb-3">Profissional não encontrado</h1>
          <p className="text-slate mb-8">O perfil que você está procurando não existe ou não está disponível.</p>
          <Link to="/psicoterapeutas">
            <Button size="lg" className="w-full bg-gradient-to-r from-teal to-teal-dark hover:from-teal-dark hover:to-teal text-white">
              Ver todos os profissionais
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream preview-light-theme" style={themeVars}>
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-cream/95 backdrop-blur-xl shadow-lg shadow-charcoal/5 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between">
            {/* Logo + Name + Social Icons Below */}
            <div className="flex flex-col">
              <a href="#inicio" className="flex items-center gap-2 group">
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-teal/30 transition-all duration-300 group-hover:scale-105">
                  <Heart className="w-5 h-5 text-white" />
                  <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-gold" />
                </div>
                <span className="font-serif text-xl text-charcoal">{profile ? formatProfessionalName(profile.full_name, profile.gender) : "Profissional"}</span>
              </a>
              
              {/* Social Media Icons Below Name */}
              {(profile?.instagram_url || profile?.linkedin_url || profile?.facebook_url || profile?.youtube_url || profile?.tiktok_url || profile?.twitter_url) && (
                <div className="hidden sm:flex items-center gap-1.5 ml-[52px] mt-1">
                  {profile?.instagram_url && (
                    <a 
                      href={profile.instagram_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-6 h-6 rounded-full bg-teal-light/50 hover:bg-teal-light border border-teal/10 flex items-center justify-center text-slate hover:text-teal transition-all duration-300 hover:scale-110"
                      title="Instagram"
                    >
                      <Instagram className="w-3 h-3" />
                    </a>
                  )}
                  {profile?.linkedin_url && (
                    <a 
                      href={profile.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-6 h-6 rounded-full bg-teal-light/50 hover:bg-teal-light border border-teal/10 flex items-center justify-center text-slate hover:text-teal transition-all duration-300 hover:scale-110"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-3 h-3" />
                    </a>
                  )}
                  {profile?.facebook_url && (
                    <a 
                      href={profile.facebook_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-6 h-6 rounded-full bg-teal-light/50 hover:bg-teal-light border border-teal/10 flex items-center justify-center text-slate hover:text-teal transition-all duration-300 hover:scale-110"
                      title="Facebook"
                    >
                      <Facebook className="w-3 h-3" />
                    </a>
                  )}
                  {profile?.youtube_url && (
                    <a 
                      href={profile.youtube_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-6 h-6 rounded-full bg-teal-light/50 hover:bg-teal-light border border-teal/10 flex items-center justify-center text-slate hover:text-teal transition-all duration-300 hover:scale-110"
                      title="YouTube"
                    >
                      <Youtube className="w-3 h-3" />
                    </a>
                  )}
                  {profile?.tiktok_url && (
                    <a 
                      href={profile.tiktok_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-6 h-6 rounded-full bg-teal-light/50 hover:bg-teal-light border border-teal/10 flex items-center justify-center text-slate hover:text-teal transition-all duration-300 hover:scale-110"
                      title="TikTok"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                    </a>
                  )}
                  {profile?.twitter_url && (
                    <a 
                      href={profile.twitter_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-6 h-6 rounded-full bg-teal-light/50 hover:bg-teal-light border border-teal/10 flex items-center justify-center text-slate hover:text-teal transition-all duration-300 hover:scale-110"
                      title="X (Twitter)"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.id)}
                  className="relative text-slate hover:text-teal transition-colors duration-300 text-sm font-semibold group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal group-hover:w-full transition-all duration-300" />
                </button>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Button 
                onClick={() => scrollToSection("agenda")}
                className="bg-gradient-to-r from-teal to-teal-dark hover:from-teal-dark hover:to-teal text-white shadow-lg hover:shadow-xl hover:shadow-teal/25 transition-all duration-300 hover:-translate-y-0.5 font-semibold"
              >
                Agendar Consulta
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-charcoal rounded-lg hover:bg-teal-light transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </nav>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-cream/98 backdrop-blur-xl border-b border-border shadow-xl animate-fade-in">
              <div className="container mx-auto px-4 py-6 space-y-4">
                {navLinks.map((link, index) => (
                  <button
                    key={link.label}
                    onClick={() => scrollToSection(link.id)}
                    className="block w-full text-left text-charcoal hover:text-teal transition-colors duration-200 py-2 text-lg font-semibold opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {link.label}
                  </button>
                ))}
                <Button 
                  onClick={() => scrollToSection("agenda")}
                  className="w-full bg-gradient-to-r from-teal to-teal-dark text-white mt-4 shadow-lg font-semibold"
                >
                  Agendar Consulta
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section 
        id="inicio"
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-cream via-teal-light/40 to-cream"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal/15 to-gold/10 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-br from-sand/40 to-teal/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-br from-gold/10 to-teal/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }} />
          
          {/* Floating shapes */}
          <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-teal rounded-full animate-pulse-glow opacity-60" />
          <div className="absolute top-2/3 left-1/3 w-3 h-3 bg-gold rounded-full animate-pulse-glow opacity-50" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-1/3 right-1/3 w-5 h-5 bg-teal-dark rounded-full animate-pulse-glow opacity-40" style={{ animationDelay: "2s" }} />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-teal-light border border-teal/20 px-5 py-2.5 rounded-full mb-8 opacity-0 animate-fade-in shadow-lg">
              <Sparkles className="w-4 h-4 text-teal" />
              <span className="text-sm font-semibold text-charcoal">{landingConfig?.hero?.badge || "Cuidando da sua saúde mental"}</span>
              <Heart className="w-4 h-4 text-teal" />
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight mb-6 opacity-0 animate-fade-in-up text-charcoal" style={{ animationDelay: "0.2s" }}>
              {landingConfig?.hero?.title || (
                <>
                  Encontre o equilíbrio e a{" "}
                  <span className="bg-gradient-to-r from-teal to-teal-dark bg-clip-text text-transparent">paz interior</span>{" "}
                  que você merece
                </>
              )}
            </h1>
            
            <p className="text-lg md:text-xl text-slate max-w-2xl mx-auto mb-10 opacity-0 animate-fade-in-up font-medium leading-relaxed" style={{ animationDelay: "0.4s" }}>
              {landingConfig?.hero?.subtitle || "A psicoterapia é um caminho de autoconhecimento e transformação. Juntos, vamos construir uma vida mais leve e significativa."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-teal to-teal-dark hover:from-teal-dark hover:to-teal text-white shadow-xl hover:shadow-2xl hover:shadow-teal/25 transition-all duration-500 hover:-translate-y-1"
                onClick={() => scrollToSection("agenda")}
              >
                <Calendar className="w-5 h-5 mr-2" />
                {landingConfig?.hero?.ctaText || "Agendar Consulta"}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 border-2 border-charcoal/20 text-charcoal hover:bg-charcoal hover:text-white hover:border-charcoal transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                onClick={() => scrollToSection("sobre")}
              >
                Saiba Mais
              </Button>
            </div>

          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in" style={{ animationDelay: "1s" }}>
          <div className="w-7 h-11 border-2 border-teal/40 rounded-full flex justify-center p-1">
            <div className="w-2 h-3 bg-gradient-to-b from-teal to-teal-dark rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicos" className="py-20 bg-sand/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block px-4 py-1.5 bg-teal-light border border-teal/20 text-teal font-semibold text-sm rounded-full mb-4">
              Nossos Serviços
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-4 text-charcoal">
              {landingConfig?.services?.title || "Como Posso Ajudar"}
            </h2>
            <p className="text-slate text-lg font-medium">
              {landingConfig?.services?.subtitle || "Ofereco diferentes modalidades de atendimento para atender às suas necessidades específicas"}
            </p>
          </div>

          {/* Áreas de Atendimento - Dynamic from profile specialties */}
          {profile?.specialties && profile.specialties.length > 0 && (
            <div className="max-w-5xl mx-auto mb-12">
              <h3 className="font-serif text-xl text-center mb-6 text-charcoal flex items-center justify-center gap-2">
                <Brain className="w-5 h-5 text-teal" />
                Áreas de Atendimento
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {profile.specialties.map((specialty, index) => (
                  <Card 
                    key={index}
                    className="group bg-white rounded-xl border border-teal/20 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fade-in-up overflow-hidden"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 mx-auto rounded-full bg-teal-light/60 group-hover:bg-teal flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-110">
                        <Heart className="w-5 h-5 text-teal group-hover:text-white transition-colors duration-300" />
                      </div>
                      <span className="text-sm font-medium text-charcoal group-hover:text-teal transition-colors duration-300">
                        {specialty}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {defaultServiceCards.map((service, index) => (
              <Card 
                key={service.title} 
                className="group bg-white rounded-2xl border border-slate/10 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 opacity-0 animate-fade-in-up overflow-hidden"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <CardContent className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-light/60 mb-6 group-hover:scale-110 group-hover:bg-teal transition-all duration-500">
                    <service.icon className="w-7 h-7 text-teal group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h3 className="font-serif text-lg mb-3 text-charcoal group-hover:text-teal transition-colors duration-300">{service.title}</h3>
                  <p className="text-slate text-sm leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-16 bg-cream relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-light/40 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            {/* Image */}
            <div className="relative max-w-md mx-auto lg:mx-0">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center">
                    <span className="text-6xl font-bold text-white">
                      {getInitials(profile?.full_name || "P")}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-teal/30 to-transparent" />
              </div>
              
              {/* Experience badge */}
              <div className="absolute -bottom-6 -left-6 bg-card p-5 rounded-2xl shadow-2xl border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-teal-light flex items-center justify-center">
                    <Star className="w-5 h-5 text-teal" />
                  </div>
                  <span className="text-3xl font-bold text-teal">10+</span>
                </div>
                <p className="text-sm text-slate font-medium">Anos de<br/>experiência</p>
              </div>
              
              {/* Rating badge */}
              <div className="absolute -top-4 -right-4 bg-card rounded-2xl shadow-2xl p-4 border border-border">
                <div className="flex items-center gap-1">
                  <Star className="w-6 h-6 fill-gold text-gold" />
                  <span className="text-2xl font-bold text-charcoal">{averageRating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="text-center lg:text-left">
              <span className="inline-block px-4 py-1.5 bg-teal-light border border-teal/20 text-teal-dark font-semibold text-sm rounded-full mb-4">
                Sobre Mim
              </span>
              
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-6 text-charcoal">
                {profile ? formatProfessionalName(profile.full_name, profile.gender) : "Dra. Maria Silva"}
              </h2>
              
              <p className="text-slate text-lg leading-relaxed mb-6 font-medium">
                {profile?.bio || "Sou psicóloga clínica com especialização em Terapia Cognitivo-Comportamental e Psicoterapia Humanista. Minha abordagem é integrativa, combinando diferentes técnicas para atender às necessidades únicas de cada pessoa."}
              </p>
              
              <p className="text-slate leading-relaxed mb-8 font-medium">
                Acredito que cada indivíduo possui recursos internos para superar desafios e alcançar uma vida mais plena. Meu papel é criar um espaço seguro e acolhedor para que essa transformação aconteça.
              </p>

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-light flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-teal" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal">Formação Acadêmica</h4>
                    <p className="text-slate text-sm">{profile?.specialty || "Mestrado em Psicologia Clínica - USP"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-light flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-teal" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal">Registro Profissional</h4>
                    <p className="text-slate text-sm">{profile?.crp || "CRP 06/123456"}</p>
                  </div>
                </div>
              </div>

              {/* Approaches */}
              {profile?.approaches && profile.approaches.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-semibold text-charcoal mb-3 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-teal" />
                    Abordagens Terapêuticas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.approaches.map((approach, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1.5 bg-gold-light text-charcoal text-sm font-medium rounded-full border border-gold/30"
                      >
                        {approach}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section 
        id="agenda" 
        className="py-20 relative overflow-hidden bg-gradient-to-br from-teal/90 via-teal to-teal/90"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-40 h-40 border border-white/20 rounded-full" />
          <div className="absolute bottom-20 right-20 w-60 h-60 border border-white/20 rounded-full" />
          <div className="absolute top-1/2 left-1/4 w-20 h-20 border border-white/20 rounded-full" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge className="bg-white/20 backdrop-blur-sm border border-white/30 text-white mb-4 px-4 py-2">
              <CalendarDays className="w-4 h-4 mr-2" />
              <span className="font-semibold">Agenda Online</span>
            </Badge>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-4">
              Agende Sua Consulta
            </h2>
            <p className="text-white/90 text-lg font-medium">
              Escolha seu plano, dia e horário para iniciar sua jornada de autoconhecimento
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-none shadow-2xl bg-white overflow-hidden">
              <div className="h-2 rounded-t-lg bg-gradient-to-r from-teal via-teal-dark to-teal" />
              
              <CardContent className="p-8 space-y-6">
                {/* Step 1 - Plan selection */}
                <div>
                  <h3 className="font-serif text-xl flex items-center gap-3 text-charcoal mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    1. Escolha o Plano
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {services.map((service) => {
                      const isPackage = service.product_config?.is_package;
                      const packageSessions = service.product_config?.package_sessions;
                      const isSelected = selectedService?.id === service.id;

                      return (
                        <button
                          key={service.id}
                          onClick={() => handlePlanSelect(service)}
                          className={`p-4 rounded-xl text-left transition-all duration-300 border-2 ${
                            isSelected 
                              ? "bg-gradient-to-br from-teal to-teal-dark text-white border-transparent"
                              : "bg-teal-light/30 border-teal/20 text-charcoal hover:border-teal/40"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-xs uppercase tracking-wider font-bold ${isSelected ? 'opacity-80' : 'text-teal'}`}>
                              {service.duration_minutes} min • {isPackage && packageSessions ? `${packageSessions}x` : "1x"}
                            </span>
                            {isPackage && (
                              <Badge className="bg-gold text-charcoal text-[10px] px-1.5 py-0.5 font-semibold">
                                Economia
                              </Badge>
                            )}
                          </div>
                          <h4 className="text-sm font-bold leading-tight mb-1">{service.name}</h4>
                          <p className={`text-xs mb-2 ${isSelected ? 'text-white/80' : 'text-slate'}`}>
                            {isPackage && packageSessions 
                              ? `${packageSessions} sessões de ${service.duration_minutes} minutos`
                              : `1 sessão de ${service.duration_minutes} minutos`
                            }
                          </p>
                          <div className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-teal'}`}>
                            {formatPrice(service.price_cents)}
                          </div>
                        </button>
                      );
                    })}

                    {services.length === 0 && (
                      <div className="col-span-4 text-center py-8 text-slate">
                        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">Nenhum serviço disponível no momento.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 2 - Date selection */}
                {selectedService && (
                  <div ref={dateSelectionRef} className="pt-6 border-t border-teal/10 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-serif text-lg flex items-center gap-3 text-charcoal">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        2. Selecione a Data
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={goToPreviousWeek}
                          disabled={!canGoToPreviousWeek()}
                          className="h-8 w-8 rounded-xl border-teal/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Semana anterior</span>
                          ‹
                        </Button>
                        <span className="text-sm font-bold min-w-[120px] text-center capitalize px-3 py-1.5 rounded-xl bg-teal-light text-charcoal">
                          {formatMonthYear(currentWeekStart)}
                        </span>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={goToNextWeek}
                          className="h-8 w-8 rounded-xl border-teal/30"
                        >
                          <span className="sr-only">Próxima semana</span>
                          ›
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-3">
                      {getWeekDays().map((day) => {
                        const isAvailable = isDateAvailable(day);
                        const isSelected = selectedDate?.toDateString() === day.toDateString();
                        
                        return (
                          <button
                            key={day.toISOString()}
                            onClick={() => {
                              if (isAvailable) {
                                handleDateSelect(day);
                              }
                            }}
                            disabled={!isAvailable}
                            className={`p-4 rounded-xl text-center transition-all duration-500 border-2 ${
                              isSelected
                                ? "bg-gradient-to-br from-teal to-teal-dark text-white border-transparent scale-105"
                                : isAvailable
                                  ? "bg-teal-light/50 border-teal/20 text-charcoal hover:border-teal/40"
                                  : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                            }`}
                          >
                            <div className="text-xs uppercase tracking-wider font-bold opacity-80">
                              {formatDateDisplay(day)}
                            </div>
                            <div className="text-2xl font-serif mt-1">
                              {day.getDate()}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 3 - Time slots */}
                {selectedService && selectedDate && (
                  <div ref={timeSelectionRef} className="space-y-4 animate-fade-in pt-4">
                    <div className="flex items-center gap-2 font-semibold text-charcoal">
                      <Clock className="w-4 h-4 text-teal" />
                      <span>3. Horários disponíveis para {selectedDate.getDate()} de {selectedDate.toLocaleDateString('pt-BR', { month: 'long' })}</span>
                    </div>
                    {(() => {
                      const times = getAvailableTimesForDate(selectedDate);
                      if (times.length === 0) {
                        return (
                          <div className="text-center py-6 text-slate">
                            <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
                            <p className="font-medium">Nenhum horário disponível para esta data.</p>
                          </div>
                        );
                      }
                      return (
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                          {times.map((time) => (
                            <button
                              key={time}
                              onClick={() => handleTimeSelect(time)}
                              className={`p-3 rounded-xl text-center transition-all duration-300 font-bold text-sm ${
                                selectedTime === time 
                                  ? "bg-gold text-white shadow-lg shadow-gold/40"
                                  : "bg-white border-2 border-teal/20 text-charcoal hover:border-teal/40"
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Confirmation bar */}
                {selectedService && selectedDate && selectedTime && (
                  <div ref={confirmationRef} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-teal-light via-gold/10 to-teal-light border-2 border-teal/20 animate-fade-in">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center shadow-lg">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-charcoal">Consulta selecionada</p>
                        <p className="text-sm text-slate font-medium">
                          {selectedService.name} • {formatFullDate(selectedDate)} às {selectedTime}
                        </p>
                        <p className="font-bold text-lg text-teal mt-1">
                          {formatPrice(selectedService.price_cents)}
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleConfirmInlineBooking}
                      className="bg-gradient-to-r from-teal to-teal-dark hover:from-teal-dark hover:to-teal text-white px-6 py-5 shadow-xl shadow-teal/30 transition-all duration-300 hover:-translate-y-1 font-bold"
                    >
                      Confirmar Agendamento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-secondary relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-teal/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-gold/5 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block px-4 py-1.5 bg-teal-light border border-teal/20 text-teal-dark font-semibold text-sm rounded-full mb-4">
                Depoimentos
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-4 text-charcoal">
                {landingConfig?.testimonials?.title || "O Que Dizem Nossos Pacientes"}
              </h2>
              <p className="text-slate text-lg font-medium">
                {landingConfig?.testimonials?.subtitle || "Histórias reais de transformação e superação"}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <Card 
                  key={testimonial.id}
                  className="bg-card border border-border shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 opacity-0 animate-fade-in-up relative overflow-hidden group"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {/* Quote decoration */}
                  <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                    <Quote className="w-16 h-16 text-teal" />
                  </div>
                  
                  <CardContent className="p-8 relative z-10">
                    {/* Rating */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                      ))}
                    </div>
                    
                    {/* Content */}
                    <p className="text-slate font-medium leading-relaxed mb-6 italic">
                      "{testimonial.content}"
                    </p>
                    
                    {/* Author */}
                    <div className="flex items-center gap-4 pt-4 border-t border-border">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {getInitials(testimonial.client_name)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-charcoal">{testimonial.client_name}</h4>
                        <p className="text-sm text-slate">Paciente</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block px-4 py-1.5 bg-teal-light border border-teal/20 text-teal-dark font-semibold text-sm rounded-full mb-4">
              Dúvidas Frequentes
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-4 text-charcoal">
              {landingConfig?.faq?.title || "Perguntas Frequentes"}
            </h2>
            <p className="text-slate text-lg font-medium">
              {landingConfig?.faq?.subtitle || "Tire suas dúvidas sobre psicoterapia e nosso atendimento"}
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              {faqItems.map((item, i) => (
                <AccordionItem 
                  key={i} 
                  value={`faq-${i}`} 
                  className="bg-white border border-gray-200 rounded-xl px-5 shadow-sm hover:shadow-md data-[state=open]:shadow-md data-[state=open]:bg-teal-light/30 transition-all duration-300"
                >
                  <AccordionTrigger className="text-left font-semibold text-charcoal hover:no-underline hover:text-teal py-4 transition-colors duration-300">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate pb-4 leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-16 bg-cream relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-teal/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Info */}
            <div>
              <span className="inline-block px-4 py-1.5 bg-teal-light border border-teal/20 text-teal font-semibold text-sm rounded-full mb-4">
                Fale Conosco
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-4 text-charcoal">
                {landingConfig?.contact?.title || "Entre em Contato"}
              </h2>
              <p className="text-slate text-lg mb-8 max-w-md">
                {landingConfig?.contact?.subtitle || "Tem alguma dúvida ou gostaria de agendar uma primeira conversa? Estou aqui para ajudar você a dar o primeiro passo."}
              </p>

              {/* Contact Info Grid 2x2 */}
              <div className="grid sm:grid-cols-2 gap-4">
                {contactInfo.map((info, index) => (
                  <div 
                    key={info.title}
                    className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-teal flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-charcoal mb-1">{info.title}</h4>
                        <p className="text-slate text-sm">{info.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="bg-white border-2 border-teal/30 rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-serif text-xl text-charcoal">Envie uma Mensagem</h3>
              </div>
              
              <form 
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  contactForm.submitForm();
                }}
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact-name" className="text-charcoal font-medium">Nome</Label>
                    <Input 
                      id="contact-name" 
                      placeholder="Seu nome" 
                      className={`mt-2 bg-gray-50 border-gray-200 focus:border-teal focus:bg-white ${contactForm.errors.name ? 'border-red-500' : ''}`}
                      value={contactForm.formData.name}
                      onChange={(e) => contactForm.updateField('name', e.target.value)}
                      disabled={contactForm.isSubmitting}
                    />
                    {contactForm.errors.name && (
                      <p className="text-red-500 text-sm mt-1">{contactForm.errors.name}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="contact-email" className="text-charcoal font-medium">E-mail</Label>
                    <Input 
                      id="contact-email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      className={`mt-2 bg-gray-50 border-gray-200 focus:border-teal focus:bg-white ${contactForm.errors.email ? 'border-red-500' : ''}`}
                      value={contactForm.formData.email}
                      onChange={(e) => contactForm.updateField('email', e.target.value)}
                      disabled={contactForm.isSubmitting}
                    />
                    {contactForm.errors.email && (
                      <p className="text-red-500 text-sm mt-1">{contactForm.errors.email}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="contact-phone" className="text-charcoal font-medium">Telefone</Label>
                  <Input 
                    id="contact-phone" 
                    placeholder="(11) 99999-9999" 
                    className="mt-2 bg-gray-50 border-gray-200 focus:border-teal focus:bg-white"
                    value={contactForm.formData.phone}
                    onChange={(e) => contactForm.updateField('phone', e.target.value)}
                    disabled={contactForm.isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="contact-message" className="text-charcoal font-medium">Mensagem</Label>
                  <Textarea 
                    id="contact-message" 
                    placeholder="Como posso ajudar você?" 
                    className={`mt-2 min-h-[100px] bg-gray-50 border-gray-200 focus:border-teal focus:bg-white ${contactForm.errors.message ? 'border-red-500' : ''}`}
                    value={contactForm.formData.message}
                    onChange={(e) => contactForm.updateField('message', e.target.value)}
                    disabled={contactForm.isSubmitting}
                  />
                  {contactForm.errors.message && (
                    <p className="text-red-500 text-sm mt-1">{contactForm.errors.message}</p>
                  )}
                </div>
                <Button 
                  type="submit"
                  disabled={contactForm.isSubmitting}
                  className="w-full bg-teal hover:bg-teal-dark text-white shadow-lg hover:shadow-xl transition-all duration-300 py-6 text-base font-semibold disabled:opacity-50"
                >
                  {contactForm.isSubmitting ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 mr-2" />
                  )}
                  {contactForm.isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-white relative overflow-hidden">
        {/* Top gradient line */}
        <div className="h-1 bg-gradient-to-r from-teal via-gold to-teal" />
        
        {/* Background decorations */}
        <div className="absolute top-20 right-10 w-40 h-40 bg-teal/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-gold/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4 group">
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <Heart className="w-5 h-5 text-white" />
                  <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-gold" />
                </div>
                <span className="font-serif text-xl">
                  {profile ? formatProfessionalName(profile.full_name, profile.gender) : "Dra. Maria Silva"}
                </span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed font-medium">
                {footerConfig?.description ? (
                  <>{footerConfig.description}</>
                ) : profile?.bio ? (
                  <>{profile.bio.length > 150 ? profile.bio.substring(0, 150) + '...' : profile.bio}</>
                ) : profile?.specialty ? (
                  <>Especialista em {profile.specialty}. Atendimento humanizado e personalizado.</>
                ) : (
                  <>Atendimento humanizado e personalizado em saúde mental.</>
                )}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-gradient-to-r from-teal to-gold" />
                Links Rápidos
              </h4>
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="block text-white/70 hover:text-teal transition-colors text-sm font-medium hover:translate-x-1 transform duration-200"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-gradient-to-r from-gold to-teal" />
                Redes Sociais
              </h4>
              <div className="flex items-center gap-3">
                {profile?.instagram_url && (
                  <a 
                    href={profile.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-white/10 hover:bg-gradient-to-br hover:from-teal hover:to-teal-dark flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-teal/30"
                    title="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {profile?.facebook_url && (
                  <a 
                    href={profile.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-white/10 hover:bg-gradient-to-br hover:from-teal hover:to-teal-dark flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-teal/30"
                    title="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {profile?.linkedin_url && (
                  <a 
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-white/10 hover:bg-gradient-to-br hover:from-teal hover:to-teal-dark flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-teal/30"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {profile?.youtube_url && (
                  <a 
                    href={profile.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-white/10 hover:bg-gradient-to-br hover:from-teal hover:to-teal-dark flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-teal/30"
                    title="YouTube"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
                {profile?.tiktok_url && (
                  <a 
                    href={profile.tiktok_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-white/10 hover:bg-gradient-to-br hover:from-teal hover:to-teal-dark flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-teal/30"
                    title="TikTok"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </a>
                )}
                {profile?.twitter_url && (
                  <a 
                    href={profile.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-white/10 hover:bg-gradient-to-br hover:from-teal hover:to-teal-dark flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-teal/30"
                    title="X (Twitter)"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/50 text-sm font-medium">
              © {new Date().getFullYear()} {profile ? formatProfessionalName(profile.full_name, profile.gender) : "Dra. Maria Silva"}. {footerConfig?.copyright || "Todos os direitos reservados."}
            </p>
            {profile?.crp && (
              <p className="text-white/50 text-sm flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-teal to-gold" />
                {profile.crp}
              </p>
            )}
          </div>
        </div>
      </footer>

      {/* WhatsApp Button */}
      {profile?.phone && (
        <a
          href={`https://wa.me/55${profile.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá! Gostaria de agendar uma consulta.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-6 py-4 rounded-full text-white font-semibold shadow-xl hover:scale-105 transition-all duration-300"
          style={{ backgroundColor: "#25D366" }}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="hidden sm:inline">Agende pelo WhatsApp</span>
        </a>
      )}

      {/* Schedule Modal */}
      {selectedService && (
        <ScheduleModal
          open={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onConfirm={handleScheduleConfirm}
          availableHours={availableHours}
          service={selectedService}
          accentColor="#2A9D8F"
        />
      )}

      {/* Checkout Overlay */}
      {selectedService && scheduledDate && scheduledTime && profile && (
        <CheckoutOverlay
          open={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          service={selectedService}
          profile={{ id: profile.id, full_name: profile.full_name, gender: profile.gender, avatar_url: profile.avatar_url, is_demo: profile.is_demo }}
          selectedDate={scheduledDate}
          selectedTime={scheduledTime}
          accentColor="#2A9D8F"
          gatewayConfig={gatewayConfig}
        />
      )}
    </div>
  );
};

export default ProfessionalProfile;
