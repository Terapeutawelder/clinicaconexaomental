import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Palette, 
  Type, 
  Image as ImageIcon, 
  Eye, 
  Copy, 
  Check,
  ExternalLink,
  Sparkles,
  ShoppingCart,
  Shield,
  Gift,
  User,
  Save,
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
  Layout,
  Play,
  MessageCircle,
  Link as LinkIcon,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { SalesPageConfig } from "./SalesPagePreview";
import SalesPageImageEditor from "./SalesPageImageEditor";

interface SalesPageEditorSidebarProps {
  config: SalesPageConfig;
  onConfigChange: (config: SalesPageConfig) => void;
  salesPageUrl: string;
  onPreview: () => void;
  onSaveNow?: () => Promise<void>;
  isSaving?: boolean;
  onBack: () => void;
  serviceName: string;
  professionalId: string;
}

const colorPresets = [
  // Dark backgrounds
  { name: "Roxo", primary: "262 83% 58%", secondary: "262 50% 95%", accent: "42 87% 55%", background: "220 20% 4%" },
  { name: "Teal", primary: "166 76% 45%", secondary: "166 50% 95%", accent: "42 87% 55%", background: "180 20% 4%" },
  { name: "Azul", primary: "210 80% 50%", secondary: "210 50% 95%", accent: "42 87% 55%", background: "215 25% 4%" },
  { name: "Verde", primary: "145 65% 40%", secondary: "145 50% 95%", accent: "42 87% 55%", background: "145 20% 4%" },
  { name: "Rosa", primary: "330 70% 55%", secondary: "330 50% 95%", accent: "42 87% 55%", background: "330 15% 4%" },
  { name: "Laranja", primary: "25 95% 55%", secondary: "25 50% 95%", accent: "42 87% 55%", background: "25 15% 4%" },
  // Light backgrounds (white)
  { name: "Roxo Claro", primary: "262 83% 50%", secondary: "262 50% 95%", accent: "42 87% 45%", background: "0 0% 100%" },
  { name: "Azul Claro", primary: "210 80% 45%", secondary: "210 50% 95%", accent: "42 87% 45%", background: "0 0% 100%" },
  { name: "Teal Claro", primary: "166 76% 38%", secondary: "166 50% 95%", accent: "42 87% 45%", background: "0 0% 100%" },
  { name: "Verde Claro", primary: "145 65% 35%", secondary: "145 50% 95%", accent: "42 87% 45%", background: "0 0% 98%" },
  { name: "Rosa Claro", primary: "330 70% 50%", secondary: "330 50% 95%", accent: "42 87% 45%", background: "0 0% 100%" },
  { name: "Laranja Claro", primary: "25 95% 50%", secondary: "25 50% 95%", accent: "42 87% 45%", background: "0 0% 100%" },
];

// Templates with different LAYOUTS (not just colors)
const templatePresets = [
  { 
    id: "classic", 
    name: "Clássico", 
    description: "Hero lateral com vídeo, módulos em accordion",
    icon: "split",
    layout: {
      style: 'classic' as const,
      heroFullWidth: false,
      showStats: true,
      benefitsStyle: 'grid' as const,
      modulesStyle: 'accordion' as const,
      ctaStyle: 'floating' as const,
      showFloatingBadge: true,
    }
  },
  { 
    id: "centered", 
    name: "Centralizado", 
    description: "Hero centralizado, foco no conteúdo",
    icon: "center",
    layout: {
      style: 'centered' as const,
      heroFullWidth: true,
      showStats: true,
      benefitsStyle: 'icons' as const,
      modulesStyle: 'cards' as const,
      ctaStyle: 'inline' as const,
      showFloatingBadge: false,
    }
  },
  { 
    id: "landing", 
    name: "Landing Premium", 
    description: "Hero fullscreen, chat animado, seções impactantes",
    icon: "landing",
    layout: {
      style: 'landing' as const,
      heroFullWidth: true,
      showStats: true,
      benefitsStyle: 'cards' as const,
      modulesStyle: 'cards' as const,
      ctaStyle: 'sticky' as const,
      showFloatingBadge: true,
    }
  },
  { 
    id: "bold", 
    name: "Impactante", 
    description: "Títulos grandes, CTAs destacados",
    icon: "bold",
    layout: {
      style: 'bold' as const,
      heroFullWidth: true,
      showStats: true,
      benefitsStyle: 'cards' as const,
      modulesStyle: 'cards' as const,
      ctaStyle: 'sticky' as const,
      showFloatingBadge: true,
    }
  },
  { 
    id: "cards", 
    name: "Cards Modernos", 
    description: "Layout em cards flutuantes",
    icon: "cards",
    layout: {
      style: 'cards' as const,
      heroFullWidth: false,
      showStats: true,
      benefitsStyle: 'cards' as const,
      modulesStyle: 'cards' as const,
      ctaStyle: 'floating' as const,
      showFloatingBadge: true,
    }
  },
  { 
    id: "split", 
    name: "Split Screen", 
    description: "Tela dividida, imagem fixa lateral",
    icon: "split",
    layout: {
      style: 'split' as const,
      heroFullWidth: false,
      showStats: false,
      benefitsStyle: 'list' as const,
      modulesStyle: 'accordion' as const,
      ctaStyle: 'sticky' as const,
      showFloatingBadge: false,
    }
  },
  { 
    id: "form", 
    name: "Formulário", 
    description: "Hero com gradiente vibrante e formulário de captura",
    icon: "form",
    layout: {
      style: 'form' as const,
      heroFullWidth: true,
      showStats: true,
      benefitsStyle: 'list' as const,
      modulesStyle: 'cards' as const,
      ctaStyle: 'sticky' as const,
      showFloatingBadge: false,
    }
  },
];

const SalesPageEditorSidebar = ({ 
  config, 
  onConfigChange, 
  salesPageUrl, 
  onPreview, 
  onSaveNow, 
  isSaving, 
  onBack,
  serviceName,
  professionalId,
}: SalesPageEditorSidebarProps) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("cores");

  const copyLink = () => {
    navigator.clipboard.writeText(salesPageUrl);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const updateColors = (preset: typeof colorPresets[0]) => {
    onConfigChange({
      ...config,
      colors: {
        primary: preset.primary,
        secondary: preset.secondary,
        accent: preset.accent,
        background: preset.background,
      },
    });
  };

  const updateHero = (field: keyof typeof config.hero, value: any) => {
    onConfigChange({
      ...config,
      hero: { ...config.hero, [field]: value },
    });
  };

  const updateContent = (field: keyof typeof config.content, value: string) => {
    onConfigChange({
      ...config,
      content: { ...config.content, [field]: value },
    });
  };

  const updateCta = (field: keyof typeof config.cta, value: string) => {
    onConfigChange({
      ...config,
      cta: { ...config.cta, [field]: value },
    });
  };

  const updateBenefits = (field: keyof typeof config.benefits, value: any) => {
    onConfigChange({
      ...config,
      benefits: { ...config.benefits, [field]: value },
    });
  };

  const updateGuarantee = (field: keyof typeof config.guarantee, value: any) => {
    onConfigChange({
      ...config,
      guarantee: { ...config.guarantee, [field]: value },
    });
  };

  const updateInstructor = (field: keyof typeof config.instructor, value: any) => {
    onConfigChange({
      ...config,
      instructor: { ...config.instructor, [field]: value },
    });
  };

  const addBenefitItem = () => {
    if (config.benefits.items.length >= 8) {
      toast.error("Máximo de 8 benefícios");
      return;
    }
    updateBenefits("items", [...config.benefits.items, "Novo benefício"]);
  };

  const removeBenefitItem = (index: number) => {
    const newItems = config.benefits.items.filter((_, i) => i !== index);
    updateBenefits("items", newItems);
  };

  const updateBenefitItem = (index: number, value: string) => {
    const newItems = [...config.benefits.items];
    newItems[index] = value;
    updateBenefits("items", newItems);
  };

  const applyTemplate = (template: typeof templatePresets[0]) => {
    onConfigChange({
      ...config,
      layout: template.layout,
      template: template.id,
    });
    toast.success(`Template "${template.name}" aplicado!`);
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={onBack} className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-foreground truncate">Editor de Página de Vendas</h2>
            <p className="text-xs text-muted-foreground truncate">{serviceName}</p>
          </div>
          <Button size="sm" variant="outline" onClick={onPreview} className="gap-1.5 shrink-0">
            <Eye className="h-3.5 w-3.5" />
            Ver
          </Button>
        </div>

        {/* URL */}
        <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg">
          <ExternalLink className="h-4 w-4 text-primary shrink-0" />
          <p className="text-xs font-mono text-muted-foreground truncate flex-1">{salesPageUrl}</p>
          <Button size="sm" variant="ghost" onClick={copyLink} className="h-7 w-7 p-0">
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-4 mx-4 mt-4">
          <TabsTrigger value="templates" className="text-xs gap-1">
            <Layout className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="cores" className="text-xs gap-1">
            <Palette className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Cores</span>
          </TabsTrigger>
          <TabsTrigger value="imagens" className="text-xs gap-1">
            <ImageIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Imagens</span>
          </TabsTrigger>
          <TabsTrigger value="textos" className="text-xs gap-1">
            <Type className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Textos</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="templates" className="mt-0 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layout className="h-4 w-4 text-primary" />
                  Escolha um Layout
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Templates com estruturas e estilos diferentes
                </p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3">
                {templatePresets.map((template) => {
                  const isSelected = config.template === template.id;
                  return (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      className={`relative rounded-lg border-2 overflow-hidden transition-all hover:scale-[1.01] ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {/* Mini Preview - Layout Visual */}
                      <div className="aspect-[16/9] p-3 bg-muted/30 flex items-center justify-center">
                        {/* Different layout visualizations */}
                        {template.layout.style === 'classic' && (
                          <div className="w-full h-full flex gap-2">
                            <div className="flex-1 space-y-1.5">
                              <div className="h-2 w-3/4 rounded bg-primary/60" />
                              <div className="h-1.5 w-full rounded bg-muted-foreground/30" />
                              <div className="h-1.5 w-2/3 rounded bg-muted-foreground/20" />
                              <div className="h-3 w-12 rounded bg-primary mt-2" />
                            </div>
                            <div className="w-1/3 rounded bg-muted-foreground/20 flex items-center justify-center">
                              <Play className="w-4 h-4 text-muted-foreground/50" />
                            </div>
                          </div>
                        )}
                        {template.layout.style === 'centered' && (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
                            <div className="h-2 w-1/2 rounded bg-primary/60" />
                            <div className="h-1.5 w-3/4 rounded bg-muted-foreground/30" />
                            <div className="h-1.5 w-1/2 rounded bg-muted-foreground/20" />
                            <div className="h-3 w-16 rounded bg-primary mt-1" />
                          </div>
                        )}
                        {template.layout.style === 'landing' && (
                          <div className="w-full h-full relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/40 to-transparent" />
                            <div className="absolute bottom-2 left-2 right-2 space-y-1">
                              <div className="h-2.5 w-3/4 rounded bg-white/80" />
                              <div className="h-1.5 w-1/2 rounded bg-white/50" />
                              <div className="h-3 w-16 rounded bg-primary mt-1" />
                            </div>
                          </div>
                        )}
                        {template.layout.style === 'bold' && (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                            <div className="h-4 w-3/4 rounded bg-primary/70" />
                            <div className="h-1.5 w-1/2 rounded bg-muted-foreground/30" />
                            <div className="h-4 w-24 rounded bg-primary mt-1" />
                            <div className="flex gap-1 mt-1">
                              <div className="h-2 w-2 rounded-full bg-accent/60" />
                              <div className="h-2 w-2 rounded-full bg-accent/60" />
                              <div className="h-2 w-2 rounded-full bg-accent/60" />
                            </div>
                          </div>
                        )}
                        {template.layout.style === 'cards' && (
                          <div className="w-full h-full grid grid-cols-3 gap-1.5 p-1">
                            <div className="col-span-2 rounded bg-muted-foreground/20 p-1.5">
                              <div className="h-1.5 w-2/3 rounded bg-primary/60 mb-1" />
                              <div className="h-1 w-full rounded bg-muted-foreground/20" />
                            </div>
                            <div className="rounded bg-primary/30 flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            </div>
                            <div className="rounded bg-muted-foreground/15" />
                            <div className="rounded bg-muted-foreground/15" />
                            <div className="rounded bg-muted-foreground/15" />
                          </div>
                        )}
                        {template.layout.style === 'split' && (
                          <div className="w-full h-full flex">
                            <div className="w-1/2 bg-muted-foreground/20 flex items-center justify-center">
                              <div className="w-6 h-6 rounded bg-muted-foreground/30" />
                            </div>
                            <div className="w-1/2 p-2 flex flex-col justify-center gap-1">
                              <div className="h-1.5 w-full rounded bg-primary/60" />
                              <div className="h-1 w-3/4 rounded bg-muted-foreground/30" />
                              <div className="h-2.5 w-12 rounded bg-primary mt-1" />
                            </div>
                          </div>
                        )}
                        {template.layout.style === 'form' && (
                          <div className="w-full h-full flex relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-accent/40 to-primary/30" />
                            <div className="w-1/2 p-2 flex flex-col justify-center gap-1 relative z-10">
                              <div className="h-2 w-3/4 rounded bg-white/80" />
                              <div className="h-1 w-1/2 rounded bg-white/50" />
                              <div className="flex gap-1 mt-1">
                                <div className="h-1 w-1 rounded-full bg-white/60" />
                                <div className="h-1 w-1 rounded-full bg-white/60" />
                              </div>
                            </div>
                            <div className="w-1/2 p-1.5 flex items-center justify-center relative z-10">
                              <div className="w-full h-full rounded bg-background/90 p-1.5">
                                <div className="h-1 w-2/3 mx-auto rounded bg-muted-foreground/30 mb-1" />
                                <div className="h-1.5 w-full rounded bg-muted-foreground/20 mb-0.5" />
                                <div className="h-1.5 w-full rounded bg-muted-foreground/20 mb-0.5" />
                                <div className="h-2 w-full rounded bg-primary/60 mt-1" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Label */}
                      <div className="p-3 bg-muted/50 text-left flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{template.name}</p>
                          <p className="text-xs text-muted-foreground">{template.description}</p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Imagens Tab */}
          <TabsContent value="imagens" className="mt-0">
            <SalesPageImageEditor
              config={config}
              onConfigChange={onConfigChange}
              onSaveNow={onSaveNow}
              isSaving={isSaving}
              professionalId={professionalId}
            />
          </TabsContent>

          {/* Cores Tab */}
          <TabsContent value="cores" className="mt-0 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  Paleta de Cores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Temas Prontos</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => updateColors(preset)}
                        className={`p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                          config.colors.primary === preset.primary
                            ? "border-primary shadow-md"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex gap-1 mb-1">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: `hsl(${preset.primary})` }}
                          />
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: `hsl(${preset.background})` }}
                          />
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: `hsl(${preset.accent})` }}
                          />
                        </div>
                        <span className="text-[10px] font-medium">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <Label className="text-xs text-muted-foreground mb-2 block">Cores Atuais</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg border"
                        style={{ backgroundColor: `hsl(${config.colors.primary})` }}
                      />
                      <span className="text-xs">Principal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg border"
                        style={{ backgroundColor: `hsl(${config.colors.background})` }}
                      />
                      <span className="text-xs">Fundo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg border"
                        style={{ backgroundColor: `hsl(${config.colors.accent})` }}
                      />
                      <span className="text-xs">Destaque</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Textos Tab */}
          <TabsContent value="textos" className="mt-0 space-y-4">
            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={onSaveNow}
                disabled={isSaving}
                size="sm"
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar
                  </>
                )}
              </Button>
            </div>

            <Accordion type="multiple" defaultValue={["hero"]} className="space-y-2">
              {/* Hero Section */}
              <AccordionItem value="hero" className="border rounded-lg px-3">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Seção Principal (Hero)
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <div>
                    <Label className="text-xs">Badge</Label>
                    <Input
                      value={config.hero.badge}
                      onChange={(e) => updateHero("badge", e.target.value)}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Título (deixe vazio para usar nome do produto)</Label>
                    <Textarea
                      value={config.hero.title}
                      onChange={(e) => updateHero("title", e.target.value)}
                      className="text-sm mt-1 min-h-[60px]"
                      placeholder="Título personalizado..."
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Subtítulo (deixe vazio para usar descrição)</Label>
                    <Textarea
                      value={config.hero.subtitle}
                      onChange={(e) => updateHero("subtitle", e.target.value)}
                      className="text-sm mt-1 min-h-[60px]"
                      placeholder="Subtítulo personalizado..."
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Texto do Botão</Label>
                    <Input
                      value={config.hero.ctaText}
                      onChange={(e) => updateHero("ctaText", e.target.value)}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Label className="text-xs">Mostrar área de vídeo/imagem</Label>
                    <Switch
                      checked={config.hero.showVideo}
                      onCheckedChange={(checked) => updateHero("showVideo", checked)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Benefits Section */}
              <AccordionItem value="benefits" className="border rounded-lg px-3">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-primary" />
                    Benefícios
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Exibir seção de benefícios</Label>
                    <Switch
                      checked={config.benefits.enabled}
                      onCheckedChange={(checked) => updateBenefits("enabled", checked)}
                    />
                  </div>
                  {config.benefits.enabled && (
                    <>
                      <div>
                        <Label className="text-xs">Título</Label>
                        <Input
                          value={config.benefits.title}
                          onChange={(e) => updateBenefits("title", e.target.value)}
                          className="h-8 text-sm mt-1"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs">Itens</Label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={addBenefitItem}
                            className="h-6 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Adicionar
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {config.benefits.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Input
                                value={item}
                                onChange={(e) => updateBenefitItem(i, e.target.value)}
                                className="h-7 text-xs flex-1"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeBenefitItem(i)}
                                className="h-7 w-7 p-0 text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Content Section */}
              <AccordionItem value="content" className="border rounded-lg px-3">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                    Seção de Conteúdo
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <div>
                    <Label className="text-xs">Título</Label>
                    <Input
                      value={config.content.sectionTitle}
                      onChange={(e) => updateContent("sectionTitle", e.target.value)}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Subtítulo</Label>
                    <Textarea
                      value={config.content.sectionSubtitle}
                      onChange={(e) => updateContent("sectionSubtitle", e.target.value)}
                      className="text-sm mt-1 min-h-[60px]"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* CTA Section */}
              <AccordionItem value="cta" className="border rounded-lg px-3">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                    Card de Compra
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <div>
                    <Label className="text-xs">Texto Principal</Label>
                    <Input
                      value={config.cta.mainText}
                      onChange={(e) => updateCta("mainText", e.target.value)}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Subtexto</Label>
                    <Input
                      value={config.cta.subText}
                      onChange={(e) => updateCta("subText", e.target.value)}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Texto do Botão</Label>
                    <Input
                      value={config.cta.buttonText}
                      onChange={(e) => updateCta("buttonText", e.target.value)}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Texto de Urgência</Label>
                    <Input
                      value={config.cta.urgencyText}
                      onChange={(e) => updateCta("urgencyText", e.target.value)}
                      className="h-8 text-sm mt-1"
                      placeholder="Ex: Vagas limitadas"
                    />
                  </div>

                  {/* Redirect Configuration - Only show for Form layout */}
                  {config.layout?.style === 'form' && (
                    <>
                      <div className="pt-3 border-t border-border">
                        <Label className="text-xs font-semibold flex items-center gap-2 mb-2">
                          <LinkIcon className="h-3.5 w-3.5 text-primary" />
                          Redirecionamento do Formulário
                        </Label>
                        <Select
                          value={config.cta.redirectType || 'checkout'}
                          onValueChange={(value: 'checkout' | 'whatsapp' | 'url') => updateCta("redirectType", value)}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Selecione o destino" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border z-50">
                            <SelectItem value="checkout">
                              <span className="flex items-center gap-2">
                                <ShoppingCart className="h-3.5 w-3.5" />
                                Checkout
                              </span>
                            </SelectItem>
                            <SelectItem value="whatsapp">
                              <span className="flex items-center gap-2">
                                <MessageCircle className="h-3.5 w-3.5" />
                                Grupo do WhatsApp
                              </span>
                            </SelectItem>
                            <SelectItem value="url">
                              <span className="flex items-center gap-2">
                                <ExternalLink className="h-3.5 w-3.5" />
                                Link Externo (URL)
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {(config.cta.redirectType === 'whatsapp' || config.cta.redirectType === 'url') && (
                        <div>
                          <Label className="text-xs">
                            {config.cta.redirectType === 'whatsapp' ? 'Link do Grupo WhatsApp' : 'URL de Destino'}
                          </Label>
                          <Input
                            value={config.cta.redirectUrl || ''}
                            onChange={(e) => updateCta("redirectUrl", e.target.value)}
                            className="h-8 text-sm mt-1"
                            placeholder={
                              config.cta.redirectType === 'whatsapp' 
                                ? "https://chat.whatsapp.com/..."
                                : "https://..."
                            }
                          />
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {config.cta.redirectType === 'whatsapp' 
                              ? "Cole o link de convite do seu grupo"
                              : "Digite a URL completa com https://"}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Guarantee Section */}
              <AccordionItem value="guarantee" className="border rounded-lg px-3">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Garantia
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Exibir garantia</Label>
                    <Switch
                      checked={config.guarantee.enabled}
                      onCheckedChange={(checked) => updateGuarantee("enabled", checked)}
                    />
                  </div>
                  {config.guarantee.enabled && (
                    <>
                      <div>
                        <Label className="text-xs">Título</Label>
                        <Input
                          value={config.guarantee.title}
                          onChange={(e) => updateGuarantee("title", e.target.value)}
                          className="h-8 text-sm mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Descrição</Label>
                        <Textarea
                          value={config.guarantee.description}
                          onChange={(e) => updateGuarantee("description", e.target.value)}
                          className="text-sm mt-1 min-h-[60px]"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Dias de Garantia</Label>
                        <Input
                          type="number"
                          value={config.guarantee.days}
                          onChange={(e) => updateGuarantee("days", parseInt(e.target.value) || 7)}
                          className="h-8 text-sm mt-1"
                        />
                      </div>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Instructor Section */}
              <AccordionItem value="instructor" className="border rounded-lg px-3">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Instrutor
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Exibir seção do instrutor</Label>
                    <Switch
                      checked={config.instructor.showSection}
                      onCheckedChange={(checked) => updateInstructor("showSection", checked)}
                    />
                  </div>
                  {config.instructor.showSection && (
                    <div>
                      <Label className="text-xs">Título da Seção</Label>
                      <Input
                        value={config.instructor.title}
                        onChange={(e) => updateInstructor("title", e.target.value)}
                        className="h-8 text-sm mt-1"
                      />
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SalesPageEditorSidebar;
