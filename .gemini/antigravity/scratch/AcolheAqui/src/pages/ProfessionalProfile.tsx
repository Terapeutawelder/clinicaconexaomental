import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  Clock, 
  MessageCircle, 
  Award,
  Loader2,
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import BookingCalendar from "@/components/booking/BookingCalendar";

interface Profile {
  id: string;
  full_name: string;
  specialty: string;
  crp: string;
  bio: string;
  avatar_url: string;
  phone: string;
}

interface AvailableHour {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const dayNames = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const ProfessionalProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [availableHours, setAvailableHours] = useState<AvailableHour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProfile(id);
    }
  }, [id]);

  const fetchProfile = async (profileId: string) => {
    try {
      // Fetch profile - allow viewing if is_professional OR if it's the user's own profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        setNotFound(true);
        return;
      }

      setProfile({
        id: profileData.id,
        full_name: profileData.full_name || "Profissional",
        specialty: profileData.specialty || "",
        crp: profileData.crp || "",
        bio: profileData.bio || "",
        avatar_url: profileData.avatar_url || "",
        phone: profileData.phone || "",
      });

      // Fetch available hours
      const { data: hoursData, error: hoursError } = await supabase
        .from("available_hours")
        .select("*")
        .eq("professional_id", profileId)
        .eq("is_active", true)
        .order("day_of_week");

      if (hoursError) throw hoursError;

      setAvailableHours(hoursData || []);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppContact = () => {
    if (!profile?.phone) return;
    
    const cleanPhone = profile.phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Olá ${profile.full_name}! Encontrei seu perfil na Mindset e gostaria de agendar uma sessão.`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, "_blank");
  };

  const groupHoursByDay = () => {
    const grouped: Record<number, AvailableHour[]> = {};
    availableHours.forEach(hour => {
      if (!grouped[hour.day_of_week]) {
        grouped[hour.day_of_week] = [];
      }
      grouped[hour.day_of_week].push(hour);
    });
    return grouped;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[hsl(170,40%,96%)] to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[hsl(170,40%,96%)] to-white flex flex-col items-center justify-center p-4">
        <User className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Profissional não encontrado</h1>
        <p className="text-muted-foreground mb-6">O perfil que você está procurando não existe ou não está disponível.</p>
        <Link to="/psicoterapeutas">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ver todos os profissionais
          </Button>
        </Link>
      </div>
    );
  }

  const groupedHours = groupHoursByDay();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(170,40%,96%)] to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo size="sm" />
          </Link>
          <Link to="/psicoterapeutas">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ver outros profissionais
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-lg border border-border overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 h-32" />
          
          <div className="px-6 pb-6 -mt-16">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden flex-shrink-0">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 pt-4 sm:pt-8">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {profile?.full_name}
                </h1>
                
                {profile?.specialty && (
                  <p className="text-lg text-primary font-medium mb-2">
                    {profile.specialty}
                  </p>
                )}

                {profile?.crp && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award className="h-4 w-4" />
                    <span>CRP: {profile.crp}</span>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="w-full sm:w-auto pt-4 sm:pt-8">
                {profile?.phone && (
                  <Button 
                    size="lg" 
                    onClick={handleWhatsAppContact}
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Agendar via WhatsApp
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Bio & Booking */}
          <div className="lg:col-span-2 space-y-8">
            {profile?.bio && (
              <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Sobre mim</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Booking Calendar */}
            {profile && (
              <BookingCalendar
                professionalId={profile.id}
                professionalName={profile.full_name}
                professionalPhone={profile.phone}
                availableHours={availableHours}
              />
            )}

            {/* Features */}
            <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Atendimento</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-foreground">Atendimento Online</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-foreground">Agendamento Online</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-foreground">Pagamento facilitado</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-foreground">Sessões de 50 minutos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Available Hours */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Horários Disponíveis
              </h2>
              
              {Object.keys(groupedHours).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(groupedHours).map(([day, hours]) => (
                    <div key={day} className="border-b border-border pb-3 last:border-0 last:pb-0">
                      <p className="font-medium text-foreground mb-2">
                        {dayNames[parseInt(day)]}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {hours.map((hour, idx) => (
                          <span 
                            key={idx}
                            className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full"
                          >
                            {hour.start_time.slice(0, 5)} - {hour.end_time.slice(0, 5)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Entre em contato para verificar disponibilidade.
                </p>
              )}
            </div>

            {/* Contact Card */}
            {profile?.phone && (
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">Pronto para começar?</h3>
                <p className="text-white/80 text-sm mb-4">
                  Entre em contato e agende sua primeira sessão.
                </p>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={handleWhatsAppContact}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Falar no WhatsApp
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <Link to="/">
            <Logo size="sm" />
          </Link>
          <p className="text-muted-foreground text-sm mt-4">
            Encontre o profissional ideal para sua jornada de autoconhecimento.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ProfessionalProfile;
