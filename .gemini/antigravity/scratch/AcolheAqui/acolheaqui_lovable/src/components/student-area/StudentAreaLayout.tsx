import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import StudentSidebar from "./StudentSidebar";
import StudentBanner from "./StudentBanner";
import StudentHero from "./StudentHero";
import ModuleCarousel from "./ModuleCarousel";
import StudentModuleView from "./StudentModuleView";
import StudentCommunity from "./StudentCommunity";
import StudentEvents from "./StudentEvents";
import StudentCertificates from "./StudentCertificates";
import StudentCoursesSection from "./StudentCoursesSection";
import { useMemberProgress } from "@/hooks/useMemberProgress";

interface Professional {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  isPublished: boolean;
  lessonsCount: number;
}

interface StudentAreaLayoutProps {
  professional: Professional;
  isOwnerPreview?: boolean;
}

const StudentAreaLayout = ({ professional, isOwnerPreview = false }: StudentAreaLayoutProps) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [upcomingEvent, setUpcomingEvent] = useState<{ title: string; date: string } | null>(null);

  const { getCompletedLessons } = useMemberProgress(professional.id);
  const completedLessons = getCompletedLessons();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user name
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", user.id)
            .single();
          
          if (profile?.full_name) {
            setUserName(profile.full_name.split(" ")[0]);
          }
        }

        // Fetch modules with lesson count
        const { data: modulesData, error } = await supabase
          .from("member_modules")
          .select(`
            id,
            title,
            description,
            thumbnail_url,
            is_published,
            order_index
          `)
          .eq("professional_id", professional.id)
          .eq("is_published", true)
          .order("order_index", { ascending: true });

        if (error) throw error;

        // Get lesson counts for each module
        const modulesWithCounts = await Promise.all(
          (modulesData || []).map(async (module) => {
            const { count } = await supabase
              .from("member_lessons")
              .select("*", { count: "exact", head: true })
              .eq("module_id", module.id);

            return {
              id: module.id,
              title: module.title,
              description: module.description,
              thumbnailUrl: module.thumbnail_url,
              isPublished: module.is_published || false,
              lessonsCount: count || 0,
            };
          })
        );

        setModules(modulesWithCounts);

        // Fetch upcoming event
        const today = new Date().toISOString().split('T')[0];
        const { data: events } = await supabase
          .from("member_events")
          .select("title, event_date, event_time")
          .eq("professional_id", professional.id)
          .eq("is_published", true)
          .gte("event_date", today)
          .order("event_date", { ascending: true })
          .limit(1);

        if (events && events.length > 0) {
          const event = events[0];
          const eventDate = new Date(event.event_date);
          setUpcomingEvent({
            title: event.title,
            date: eventDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
          });
        }
      } catch (error) {
        console.error("Error fetching modules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [professional.id]);

  // Calculate overall progress
  const getTotalLessons = () => modules.reduce((acc, m) => acc + m.lessonsCount, 0);
  const getOverallProgress = () => {
    const total = getTotalLessons();
    if (total === 0) return 0;
    return Math.round((completedLessons.size / total) * 100);
  };

  // Find the first module with incomplete lessons for "Continue Watching"
  const getContinueWatching = () => {
    return modules.find((m) => m.lessonsCount > 0);
  };

  if (selectedModuleId) {
    return (
      <StudentModuleView
        moduleId={selectedModuleId}
        professionalId={professional.id}
        onBack={() => setSelectedModuleId(null)}
      />
    );
  }

  // Render section content based on activeSection
  const renderSectionContent = () => {
    switch (activeSection) {
      case "community":
        return (
          <StudentCommunity
            professionalId={professional.id}
            professionalName={professional.fullName}
          />
        );
      case "events":
        return <StudentEvents professionalId={professional.id} />;
      case "certificates":
        return (
          <StudentCertificates
            professionalId={professional.id}
            professionalName={professional.fullName}
          />
        );
      case "courses":
        return (
          <StudentCoursesSection
            modules={modules}
            onSelectModule={setSelectedModuleId}
            completedLessons={completedLessons}
          />
        );
      case "home":
      default:
        return (
          <div className="pb-12">
            {/* Hero Banner */}
            <div className="px-8 pt-8">
              <StudentBanner
                professionalId={professional.id}
                professionalName={professional.fullName}
                professionalAvatarUrl={professional.avatarUrl}
                userName={userName}
                upcomingEvent={upcomingEvent || undefined}
                onContinueLearning={() => {
                  const module = getContinueWatching();
                  if (module) setSelectedModuleId(module.id);
                }}
                onViewEvents={() => setActiveSection("events")}
                onJoinCommunity={() => setActiveSection("community")}
              />
            </div>

            {/* Hero Section (compact) */}
            <div className="px-8 py-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 bg-gray-900/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-800">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{getTotalLessons()}</p>
                    <p className="text-xs text-gray-400">Aulas</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-900/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-800">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{completedLessons.size}</p>
                    <p className="text-xs text-gray-400">Concluídas</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-900/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-800">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{getOverallProgress()}%</p>
                    <p className="text-xs text-gray-400">Progresso</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-900/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-800">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{modules.length}</p>
                    <p className="text-xs text-gray-400">Módulos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Module Carousels */}
            <div className="space-y-8 px-8">
              {modules.length > 0 ? (
                <>
                  {/* Continue Watching */}
                  {getContinueWatching() && (
                    <ModuleCarousel
                      title="Continuar Assistindo"
                      modules={[getContinueWatching()!]}
                      onSelectModule={setSelectedModuleId}
                      completedLessons={completedLessons}
                    />
                  )}

                  {/* All Modules */}
                  <ModuleCarousel
                    title="Todos os Módulos"
                    modules={modules}
                    onSelectModule={setSelectedModuleId}
                    completedLessons={completedLessons}
                  />
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-400 mb-2">
                    Nenhum conteúdo disponível
                  </h3>
                  <p className="text-sm text-gray-500">
                    Novos módulos serão adicionados em breve.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Owner Preview Banner */}
      {isOwnerPreview && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-primary/90 backdrop-blur-sm text-white text-center py-2 text-sm font-medium">
          👁️ Modo Visualização — Você está vendo como seus alunos verão
        </div>
      )}

      {/* Sidebar */}
      <StudentSidebar
        professional={professional}
        modules={modules}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSelectModule={(id) => {
          setSelectedModuleId(id);
          setActiveSection("courses");
        }}
        overallProgress={getOverallProgress()}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-72"} ${isOwnerPreview ? "mt-10" : ""}`}>
        {loading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin w-10 h-10 border-3 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          renderSectionContent()
        )}
      </main>
    </div>
  );
};

export default StudentAreaLayout;
