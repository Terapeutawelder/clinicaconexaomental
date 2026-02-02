import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera, Save, Loader2, User, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { z } from "zod";

interface ProfilePageProps {
  profileId: string;
  userId: string;
}

const profileSchema = z.object({
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  crp: z.string().max(20).optional().or(z.literal("")),
  specialty: z.string().max(100).optional().or(z.literal("")),
  bio: z.string().max(1000).optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
});

interface ProfileData {
  full_name: string;
  crp: string;
  specialty: string;
  bio: string;
  phone: string;
  avatar_url: string;
}

const ProfilePage = ({ profileId, userId }: ProfilePageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    crp: "",
    specialty: "",
    bio: "",
    phone: "",
    avatar_url: "",
  });

  useEffect(() => {
    fetchProfile();
  }, [profileId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          crp: data.crp || "",
          specialty: data.specialty || "",
          bio: data.bio || "",
          phone: data.phone || "",
          avatar_url: data.avatar_url || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Erro ao carregar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Add cache buster
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", profileId);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));
      toast.success("Foto atualizada com sucesso!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Erro ao fazer upload da foto");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    // Validate
    const result = profileSchema.safeParse(profile);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          crp: profile.crp || null,
          specialty: profile.specialty || null,
          bio: profile.bio || null,
          phone: profile.phone || null,
        })
        .eq("id", profileId);

      if (error) throw error;

      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Erro ao salvar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Public Profile Link */}
      <div className="rounded-2xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Seu Perfil Público</h3>
            <p className="text-sm text-white/60">
              Compartilhe este link para seus clientes agendarem sessões.
            </p>
          </div>
          <Link to={`/profissional/${profileId}`} target="_blank">
            <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver Perfil Público
            </Button>
          </Link>
        </div>
      </div>

      {/* Avatar Section */}
      <div className="rounded-2xl bg-[hsl(215,40%,12%)] border border-white/5 p-8">
        <h3 className="text-lg font-bold text-white mb-6">Foto de Perfil</h3>
        
        <div className="flex items-center gap-6">
          <div className="relative">
            <div 
              className="w-28 h-28 rounded-full bg-white/10 border-2 border-white/20 overflow-hidden cursor-pointer group"
              onClick={handleAvatarClick}
            >
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-white/40" />
                </div>
              )}
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
          
          <div>
            <p className="text-white font-medium mb-1">Clique para alterar</p>
            <p className="text-sm text-white/50">JPG, PNG ou GIF. Máximo 5MB.</p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="rounded-2xl bg-[hsl(215,40%,12%)] border border-white/5 p-8">
        <h3 className="text-lg font-bold text-white mb-6">Informações Profissionais</h3>
        
        <div className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-white/80">
              Nome Completo *
            </Label>
            <Input
              id="full_name"
              value={profile.full_name}
              onChange={(e) => handleInputChange("full_name", e.target.value)}
              placeholder="Seu nome completo"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary"
            />
            {errors.full_name && (
              <p className="text-sm text-red-400">{errors.full_name}</p>
            )}
          </div>

          {/* CRP and Specialty - Row */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="crp" className="text-white/80">
                CRP
              </Label>
              <Input
                id="crp"
                value={profile.crp}
                onChange={(e) => handleInputChange("crp", e.target.value)}
                placeholder="Ex: 06/123456"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary"
              />
              {errors.crp && (
                <p className="text-sm text-red-400">{errors.crp}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty" className="text-white/80">
                Especialidade
              </Label>
              <Input
                id="specialty"
                value={profile.specialty}
                onChange={(e) => handleInputChange("specialty", e.target.value)}
                placeholder="Ex: Terapia Cognitivo-Comportamental"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary"
              />
              {errors.specialty && (
                <p className="text-sm text-red-400">{errors.specialty}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white/80">
              Telefone / WhatsApp
            </Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Ex: (11) 99999-9999"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary"
            />
            {errors.phone && (
              <p className="text-sm text-red-400">{errors.phone}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-white/80">
              Bio / Apresentação
            </Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Fale um pouco sobre você, sua abordagem terapêutica e experiência..."
              rows={5}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary resize-none"
            />
            <p className="text-xs text-white/40">
              {profile.bio.length}/1000 caracteres
            </p>
            {errors.bio && (
              <p className="text-sm text-red-400">{errors.bio}</p>
            )}
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
