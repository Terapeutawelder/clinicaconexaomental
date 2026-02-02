import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Palette, 
  Type, 
  Image as ImageIcon, 
  Layout, 
  Eye, 
  Copy, 
  Check,
  ExternalLink,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Phone,
  Save,
  Loader2,
  PanelBottom
} from "lucide-react";
import { toast } from "sonner";
import { LandingPageConfig } from "./LandingPagePreview";
import ImageEditor from "./ImageEditor";

interface EditorSidebarProps {
  config: LandingPageConfig;
  onConfigChange: (config: LandingPageConfig) => void;
  profileUrl: string;
  onPreview: () => void;
  onSaveNow?: () => Promise<void>;
  isSaving?: boolean;
  profileId: string;
  currentAvatarUrl?: string;
}

const colorPresets = [
  { name: "Teal", primary: "166 76% 45%", secondary: "166 50% 95%", accent: "42 87% 55%" },
  { name: "Roxo", primary: "262 83% 58%", secondary: "262 50% 95%", accent: "42 87% 55%" },
  { name: "Azul", primary: "210 80% 50%", secondary: "210 50% 95%", accent: "42 87% 55%" },
  { name: "Verde", primary: "145 65% 40%", secondary: "145 50% 95%", accent: "42 87% 55%" },
  { name: "Rosa", primary: "330 70% 55%", secondary: "330 50% 95%", accent: "42 87% 55%" },
  { name: "Laranja", primary: "25 95% 55%", secondary: "25 50% 95%", accent: "42 87% 55%" },
];

const EditorSidebar = ({ config, onConfigChange, profileUrl, onPreview, onSaveNow, isSaving, profileId, currentAvatarUrl }: EditorSidebarProps) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("cores");

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const updateColors = (preset: typeof colorPresets[0]) => {
    onConfigChange({
      ...config,
      colors: {
        ...config.colors,
        primary: preset.primary,
        secondary: preset.secondary,
        accent: preset.accent,
      },
    });
  };

  const updateHero = (field: keyof typeof config.hero, value: string) => {
    onConfigChange({
      ...config,
      hero: { ...config.hero, [field]: value },
    });
  };

  const updateServices = (field: keyof typeof config.services, value: string) => {
    onConfigChange({
      ...config,
      services: { ...config.services, [field]: value },
    });
  };

  const updateTestimonials = (field: keyof typeof config.testimonials, value: string) => {
    onConfigChange({
      ...config,
      testimonials: { ...config.testimonials, [field]: value },
    });
  };

  const updateFaq = (field: keyof typeof config.faq, value: any) => {
    onConfigChange({
      ...config,
      faq: { ...config.faq, [field]: value },
    });
  };

  const updateContact = (field: keyof typeof config.contact, value: string) => {
    onConfigChange({
      ...config,
      contact: { ...config.contact, [field]: value },
    });
  };

  const updateFooter = (field: "description" | "copyright", value: string) => {
    const currentFooter = config.footer || { description: "", copyright: "Todos os direitos reservados." };
    onConfigChange({
      ...config,
      footer: { 
        ...currentFooter,
        [field]: value 
      },
    });
  };

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Editor de Landing Page</h2>
          <Button size="sm" variant="outline" onClick={onPreview} className="gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            Ver ao vivo
          </Button>
        </div>
        
        {/* URL */}
        <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg">
          <ExternalLink className="h-4 w-4 text-primary shrink-0" />
          <p className="text-xs font-mono text-muted-foreground truncate flex-1">{profileUrl}</p>
          <Button size="sm" variant="ghost" onClick={copyLink} className="h-7 w-7 p-0">
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-3 mx-4 mt-4">
          <TabsTrigger value="cores" className="text-xs gap-1.5">
            <Palette className="h-3.5 w-3.5" />
            Cores
          </TabsTrigger>
          <TabsTrigger value="textos" className="text-xs gap-1.5">
            <Type className="h-3.5 w-3.5" />
            Textos
          </TabsTrigger>
          <TabsTrigger value="imagens" className="text-xs gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" />
            Imagens
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4">
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
                            style={{ backgroundColor: `hsl(${preset.secondary})` }}
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
                        style={{ backgroundColor: `hsl(${config.colors.secondary})` }}
                      />
                      <span className="text-xs">Secundária</span>
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
                    Salvar Textos
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
                    <Label className="text-xs">Título</Label>
                    <Textarea 
                      value={config.hero.title}
                      onChange={(e) => updateHero("title", e.target.value)}
                      className="text-sm mt-1 min-h-[60px]"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Subtítulo</Label>
                    <Textarea 
                      value={config.hero.subtitle}
                      onChange={(e) => updateHero("subtitle", e.target.value)}
                      className="text-sm mt-1 min-h-[60px]"
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
                </AccordionContent>
              </AccordionItem>

              {/* Services Section */}
              <AccordionItem value="services" className="border rounded-lg px-3">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <Layout className="h-4 w-4 text-primary" />
                    Seção de Serviços
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <div>
                    <Label className="text-xs">Título</Label>
                    <Input 
                      value={config.services.title}
                      onChange={(e) => updateServices("title", e.target.value)}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Subtítulo</Label>
                    <Textarea 
                      value={config.services.subtitle}
                      onChange={(e) => updateServices("subtitle", e.target.value)}
                      className="text-sm mt-1 min-h-[60px]"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Testimonials Section */}
              <AccordionItem value="testimonials" className="border rounded-lg px-3">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Seção de Depoimentos
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <div>
                    <Label className="text-xs">Título</Label>
                    <Input 
                      value={config.testimonials.title}
                      onChange={(e) => updateTestimonials("title", e.target.value)}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Subtítulo</Label>
                    <Textarea 
                      value={config.testimonials.subtitle}
                      onChange={(e) => updateTestimonials("subtitle", e.target.value)}
                      className="text-sm mt-1 min-h-[60px]"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* FAQ Section */}
              <AccordionItem value="faq" className="border rounded-lg px-3">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    Seção de FAQ
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <div>
                    <Label className="text-xs">Título</Label>
                    <Input 
                      value={config.faq.title}
                      onChange={(e) => updateFaq("title", e.target.value)}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Subtítulo</Label>
                    <Textarea 
                      value={config.faq.subtitle}
                      onChange={(e) => updateFaq("subtitle", e.target.value)}
                      className="text-sm mt-1 min-h-[60px]"
                    />
                  </div>
                  <div className="pt-2 border-t">
                    <Label className="text-xs text-muted-foreground">Perguntas (edite individualmente)</Label>
                    <div className="space-y-2 mt-2">
                      {config.faq.items.map((item, i) => (
                        <div key={i} className="p-2 bg-muted/50 rounded-lg">
                          <Input 
                            value={item.question}
                            onChange={(e) => {
                              const newItems = [...config.faq.items];
                              newItems[i] = { ...newItems[i], question: e.target.value };
                              updateFaq("items", newItems);
                            }}
                            className="h-7 text-xs mb-1"
                            placeholder="Pergunta"
                          />
                          <Textarea 
                            value={item.answer}
                            onChange={(e) => {
                              const newItems = [...config.faq.items];
                              newItems[i] = { ...newItems[i], answer: e.target.value };
                              updateFaq("items", newItems);
                            }}
                            className="text-xs min-h-[40px]"
                            placeholder="Resposta"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Contact Section */}
              <AccordionItem value="contact" className="border rounded-lg px-3">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    Seção de Contato
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <div>
                    <Label className="text-xs">Título</Label>
                    <Input 
                      value={config.contact.title}
                      onChange={(e) => updateContact("title", e.target.value)}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Subtítulo</Label>
                    <Textarea 
                      value={config.contact.subtitle}
                      onChange={(e) => updateContact("subtitle", e.target.value)}
                      className="text-sm mt-1 min-h-[40px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Endereço</Label>
                      <Input 
                        value={config.contact.address}
                        onChange={(e) => updateContact("address", e.target.value)}
                        className="h-8 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Telefone</Label>
                      <Input 
                        value={config.contact.phone}
                        onChange={(e) => updateContact("phone", e.target.value)}
                        className="h-8 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">E-mail</Label>
                      <Input 
                        value={config.contact.email}
                        onChange={(e) => updateContact("email", e.target.value)}
                        className="h-8 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Horário</Label>
                      <Input 
                        value={config.contact.hours}
                        onChange={(e) => updateContact("hours", e.target.value)}
                        className="h-8 text-sm mt-1"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Footer Section */}
              <AccordionItem value="footer" className="border rounded-lg px-3">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <PanelBottom className="h-4 w-4 text-primary" />
                    Rodapé
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <div>
                    <Label className="text-xs">Descrição</Label>
                    <Textarea 
                      value={config.footer?.description || ""}
                      onChange={(e) => updateFooter("description", e.target.value)}
                      className="text-sm mt-1 min-h-[80px]"
                      placeholder="Descreva brevemente sua atuação profissional..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Texto que aparece abaixo do seu nome no rodapé
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs">Texto de Copyright</Label>
                    <Input 
                      value={config.footer?.copyright || "Todos os direitos reservados."}
                      onChange={(e) => updateFooter("copyright", e.target.value)}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          {/* Imagens Tab */}
          <TabsContent value="imagens" className="mt-0">
            <ImageEditor
              config={config}
              onConfigChange={onConfigChange}
              onSaveNow={onSaveNow}
              isSaving={isSaving}
              profileId={profileId}
              currentAvatarUrl={currentAvatarUrl}
            />
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
};

export default EditorSidebar;
