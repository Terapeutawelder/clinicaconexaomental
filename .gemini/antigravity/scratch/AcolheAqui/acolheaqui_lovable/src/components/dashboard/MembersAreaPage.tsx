import { useState, useEffect } from "react";
import {
  Users,
  Star,
  Plus,
  Settings,
  Video,
  FileText,
  Folder,
  Search,
  BarChart3,
  ExternalLink,
  Eye,
  Calendar,
  Palette,
  Copy,
  Check,
  ShoppingCart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ModuleViewPage from "./members-area/ModuleViewPage";
import ModuleCard from "./members-area/ModuleCard";
import ModuleFormModal from "./members-area/ModuleFormModal";
import DeleteConfirmModal from "./members-area/DeleteConfirmModal";
import MembersListTab from "./members-area/MembersListTab";
import AnalyticsTab from "./members-area/AnalyticsTab";
import EventsTab from "./members-area/EventsTab";
import BannerEditorTab from "./members-area/BannerEditorTab";
import SalesPageTab from "./members-area/SalesPageTab";
import { useMemberModules, type Module, type ThumbnailFocus } from "@/hooks/useMemberModules";
import { useMemberAccess } from "@/hooks/useMemberAccess";
import { useMemberEvents } from "@/hooks/useMemberEvents";
import { getCanonicalUrl } from "@/lib/getCanonicalUrl";

const MembersAreaPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("modules");
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [professionalSlug, setProfessionalSlug] = useState<string | null>(null);
  const [professionalName, setProfessionalName] = useState("");
  const [professionalAvatarUrl, setProfessionalAvatarUrl] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingModule, setDeletingModule] = useState<Module | null>(null);

  // Fetch professional ID and slug on mount
  useEffect(() => {
    const fetchProfessionalData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, user_slug, full_name, avatar_url")
          .eq("user_id", user.id)
          .single();
        if (profile) {
          setProfessionalId(profile.id);
          setProfessionalSlug(profile.user_slug);
          setProfessionalName(profile.full_name || "");
          setProfessionalAvatarUrl(profile.avatar_url);
        }
      }
    };
    fetchProfessionalData();
  }, []);

  const {
    modules,
    loading: modulesLoading,
    createModule,
    updateModule,
    deleteModule,
  } = useMemberModules(professionalId);

  const {
    members,
    stats: memberStats,
    loading: membersLoading,
    addMember,
    updateMemberAccess,
    removeMember,
  } = useMemberAccess(professionalId);

  const { events } = useMemberEvents(professionalId);
  const filteredModules = modules.filter((module) =>
    module.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate real stats from modules
  const realStats = {
    totalModules: modules.length,
    totalLessons: modules.reduce((acc, m) => acc + m.lessons.length, 0),
    publishedModules: modules.filter((m) => m.isPublished).length,
  };

  const handleOpenCreateModal = () => {
    setEditingModule(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (module: Module) => {
    setEditingModule(module);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (module: Module) => {
    setDeletingModule(module);
    setIsDeleteModalOpen(true);
  };

  const handleSaveModule = async (data: {
    title: string;
    description?: string;
    thumbnailUrl?: string;
    thumbnailFocus?: ThumbnailFocus;
    isPublished?: boolean;
  }) => {
    if (editingModule) {
      await updateModule(editingModule.id, data);
    } else {
      await createModule(data);
    }
  };

  const handleDeleteModule = async () => {
    if (deletingModule) {
      await deleteModule(deletingModule.id);
    }
  };

  const handleCopyLink = async () => {
    if (!professionalSlug) return;
    const url = getCanonicalUrl(`/area-membros/${professionalSlug}`);
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      toast({
        title: "Link copiado!",
        description: "O link da área de membros foi copiado para a área de transferência.",
      });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  // Show module view page if a module is selected
  if (selectedModuleId && professionalId) {
    return (
      <ModuleViewPage
        moduleId={selectedModuleId}
        professionalId={professionalId}
        onBack={() => setSelectedModuleId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Área de Membros
              </h1>
              <p className="text-gray-400">
                Gerencie seus módulos, aulas e conteúdos exclusivos
              </p>
            </div>
            <div className="flex items-center gap-3">
              {professionalSlug && (
                <>
                  <Button
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
                    onClick={handleCopyLink}
                  >
                    {linkCopied ? (
                      <Check className="w-4 h-4 mr-2 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    {linkCopied ? "Copiado!" : "Copiar Link"}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-primary/50 text-primary hover:text-white hover:bg-primary/20"
                    onClick={() => window.open(getCanonicalUrl(`/area-membros/${professionalSlug}`), "_blank")}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar como Aluno
                    <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={handleOpenCreateModal}
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Módulo
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {memberStats.totalMembers}
                    </p>
                    <p className="text-xs text-gray-500">Total Membros</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {memberStats.activeMembers}
                    </p>
                    <p className="text-xs text-gray-500">Ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Folder className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {realStats.totalModules}
                    </p>
                    <p className="text-xs text-gray-500">Módulos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Video className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {realStats.totalLessons}
                    </p>
                    <p className="text-xs text-gray-500">Aulas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {events.length}
                    </p>
                    <p className="text-xs text-gray-500">Eventos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {memberStats.averageProgress}%
                    </p>
                    <p className="text-xs text-gray-500">Progresso Médio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <TabsList className="bg-gray-900/50 border border-gray-800 flex-wrap">
              <TabsTrigger
                value="modules"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <Folder className="w-4 h-4 mr-2" />
                Módulos
              </TabsTrigger>
              <TabsTrigger
                value="sales"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Página de Vendas
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Eventos
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <Users className="w-4 h-4 mr-2" />
                Membros
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="banner"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <Palette className="w-4 h-4 mr-2" />
                Banner
              </TabsTrigger>
            </TabsList>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Buscar módulos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <TabsContent value="modules" className="mt-0">
            {modulesLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredModules.map((module, index) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    index={index}
                    onEdit={() => handleOpenEditModal(module)}
                    onDelete={() => handleOpenDeleteModal(module)}
                    onView={() => setSelectedModuleId(module.id)}
                  />
                ))}

                {/* Add New Module Card */}
                <div
                  className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-700 hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer group bg-gray-900/30 hover:bg-gray-900/50"
                  onClick={handleOpenCreateModal}
                >
                  <div className="w-16 h-16 rounded-full bg-gray-800 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <Plus className="w-8 h-8 text-gray-500 group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-gray-500 group-hover:text-gray-300 text-sm font-medium transition-colors">
                    Adicionar Módulo
                  </span>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sales" className="mt-0">
            <SalesPageTab professionalId={professionalId} />
          </TabsContent>

          <TabsContent value="events" className="mt-0">
            <EventsTab professionalId={professionalId} />
          </TabsContent>

          <TabsContent value="members" className="mt-0">
            <MembersListTab
              members={members}
              loading={membersLoading}
              onAddMember={addMember}
              onUpdateMember={updateMemberAccess}
              onRemoveMember={removeMember}
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <AnalyticsTab
              stats={memberStats}
              modules={modules}
              loading={membersLoading || modulesLoading}
            />
          </TabsContent>

          <TabsContent value="banner" className="mt-0">
            <BannerEditorTab
              professionalId={professionalId}
              professionalName={professionalName}
              professionalAvatarUrl={professionalAvatarUrl}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {professionalId && (
        <ModuleFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingModule(null);
          }}
          module={editingModule}
          professionalId={professionalId}
          onSave={handleSaveModule}
        />
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingModule(null);
        }}
        onConfirm={handleDeleteModule}
        title="Excluir módulo"
        description="Esta ação não pode ser desfeita. Todas as aulas do módulo também serão excluídas."
        itemName={deletingModule?.title}
      />
    </div>
  );
};

export default MembersAreaPage;
