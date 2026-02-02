import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, ChevronRight, Award, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProfessionalWithRating {
  id: string;
  full_name: string | null;
  specialty: string | null;
  avatar_url: string | null;
  bio: string | null;
  user_slug: string | null;
  crp: string | null;
  specialties: string[] | null;
  average_rating: number;
  total_reviews: number;
  is_verified: boolean;
}

const ProfessionalsShowcase = memo(() => {
  const { data: professionals, isLoading } = useQuery({
    queryKey: ["top-professionals"],
    queryFn: async () => {
      // First get professionals with verification status (using secure public view)
      const { data: profiles, error: profilesError } = await supabase
        .from("public_professional_profiles")
        .select("id, full_name, specialty, avatar_url, bio, crp, is_verified, user_slug")
        .not("avatar_url", "is", null)
        .not("full_name", "is", null)
        .limit(20);

      if (profilesError) throw profilesError;
      if (!profiles || profiles.length === 0) return [];

      // Get testimonials for these professionals
      const professionalIds = profiles.map(p => p.id).filter(Boolean) as string[];
      
      const { data: testimonials, error: testimonialsError } = await supabase
        .from("testimonials")
        .select("professional_id, rating")
        .in("professional_id", professionalIds)
        .eq("is_approved", true);

      if (testimonialsError) throw testimonialsError;

      // Calculate average ratings
      const ratingsMap = new Map<string, { total: number; count: number }>();
      
      testimonials?.forEach(t => {
        const current = ratingsMap.get(t.professional_id) || { total: 0, count: 0 };
        ratingsMap.set(t.professional_id, {
          total: current.total + t.rating,
          count: current.count + 1
        });
      });

      // Combine data and sort by rating
      const professionalsWithRatings: ProfessionalWithRating[] = profiles
        .map(profile => {
          const ratingData = ratingsMap.get(profile.id || "") || { total: 0, count: 0 };
          return {
            id: profile.id || "",
            full_name: profile.full_name,
            specialty: profile.specialty,
            avatar_url: profile.avatar_url,
            bio: profile.bio,
            user_slug: profile.user_slug,
            crp: profile.crp,
            specialties: null,
            average_rating: ratingData.count > 0 ? ratingData.total / ratingData.count : 0,
            total_reviews: ratingData.count,
            is_verified: profile.is_verified || false
          };
        })
        .sort((a, b) => {
          // Sort by rating first, then by review count
          if (b.average_rating !== a.average_rating) {
            return b.average_rating - a.average_rating;
          }
          return b.total_reviews - a.total_reviews;
        })
        .slice(0, 6);

      return professionalsWithRatings;
    },
    staleTime: 5 * 60 * 1000,
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={`${
              star <= Math.round(rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 w-64 bg-muted rounded animate-pulse mx-auto mb-4" />
            <div className="h-4 w-96 bg-muted rounded animate-pulse mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-5 w-32 bg-muted rounded mb-2" />
                    <div className="h-4 w-24 bg-muted rounded" />
                  </div>
                </div>
                <div className="h-3 w-full bg-muted rounded mb-2" />
                <div className="h-3 w-3/4 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!professionals || professionals.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Award size={16} />
            Profissionais em Destaque
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 max-w-3xl mx-auto leading-tight">
            Encontre na AcolheAqui Psicoterapeutas disponíveis para Realizar a sua Terapia Online
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Conheça os psicoterapeutas mais bem avaliados da nossa plataforma
          </p>
        </div>

        {/* Professionals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {professionals.map((professional, index) => (
            <Link
              key={professional.id}
              to={`/psicoterapeutas`}
              className="group"
            >
              <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 h-full">
                {/* Top Badge for top 3 */}
                {index < 3 && (
                  <div className="flex justify-end mb-2">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        index === 0 
                          ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/30" 
                          : index === 1 
                          ? "bg-slate-400/20 text-slate-600 border-slate-400/30"
                          : "bg-amber-600/20 text-amber-700 border-amber-600/30"
                      }`}
                    >
                      #{index + 1} Mais Avaliado
                    </Badge>
                  </div>
                )}

                {/* Profile Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
                      <AvatarImage 
                        src={professional.avatar_url || undefined} 
                        alt={professional.full_name || "Profissional"} 
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(professional.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Verified Badge on Avatar */}
                    {professional.is_verified && (
                      <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5 shadow-lg">
                        <BadgeCheck size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <TooltipProvider>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-foreground text-base sm:text-lg truncate group-hover:text-primary transition-colors">
                          {professional.full_name}
                        </h3>
                        {professional.is_verified && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <BadgeCheck size={18} className="text-primary fill-primary/20 flex-shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Profissional Verificado</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TooltipProvider>
                    <p className="text-sm text-muted-foreground truncate">
                      {professional.specialty || "Psicoterapeuta"}
                    </p>
                    {professional.crp && (
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        <span className="font-medium">Registro:</span> {professional.crp}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  {renderStars(professional.average_rating)}
                  <span className="text-sm font-medium text-foreground">
                    {professional.average_rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({professional.total_reviews} {professional.total_reviews === 1 ? "avaliação" : "avaliações"})
                  </span>
                </div>

                {/* Bio Preview */}
                {professional.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {professional.bio}
                  </p>
                )}

                {/* CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <span className="text-xs text-primary font-medium group-hover:underline">
                    Ver perfil completo
                  </span>
                  <ChevronRight size={16} className="text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-8 sm:mt-10">
          <Link to="/psicoterapeutas">
            <Button size="lg" className="group">
              Ver todos os profissionais
              <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
});

ProfessionalsShowcase.displayName = "ProfessionalsShowcase";

export default ProfessionalsShowcase;
