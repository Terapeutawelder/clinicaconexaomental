import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import StudentAreaLayout from "@/components/student-area/StudentAreaLayout";

const StudentArea = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [professional, setProfessional] = useState<{
    id: string;
    fullName: string;
    avatarUrl: string | null;
  } | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Acesso negado",
            description: "Você precisa estar logado para acessar esta área.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        // Find professional by slug (using secure public view)
        const { data: profile, error: profileError } = await supabase
          .from("public_professional_profiles")
          .select("id, full_name, avatar_url")
          .eq("user_slug", slug)
          .single();

        if (profileError || !profile) {
          toast({
            title: "Profissional não encontrado",
            description: "Verifique o link e tente novamente.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        setProfessional({
          id: profile.id,
          fullName: profile.full_name || "Profissional",
          avatarUrl: profile.avatar_url,
        });

        // Check if user is the owner by checking their own profile
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .eq("is_professional", true)
          .maybeSingle();

        if (userProfile && userProfile.id === profile.id) {
          setIsOwner(true);
          setHasAccess(true);
          setLoading(false);
          return;
        }

        // Check if user has access to this professional's member area
        const { data: access, error: accessError } = await supabase
          .from("member_access")
          .select("*")
          .eq("user_id", user.id)
          .eq("professional_id", profile.id)
          .eq("is_active", true)
          .single();

        if (accessError || !access) {
          setHasAccess(false);
        } else {
          // Check if access is expired
          if (access.expires_at && new Date(access.expires_at) < new Date()) {
            setHasAccess(false);
          } else {
            setHasAccess(true);
          }
        }
      } catch (error) {
        console.error("Error checking access:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      checkAccess();
    }
  }, [slug, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!hasAccess || !professional) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m5-6a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Acesso Restrito</h1>
          <p className="text-gray-400 mb-6">
            Você não tem acesso a esta área de membros. Entre em contato com o profissional para obter acesso.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return <StudentAreaLayout professional={professional} isOwnerPreview={isOwner} />;
};

export default StudentArea;
