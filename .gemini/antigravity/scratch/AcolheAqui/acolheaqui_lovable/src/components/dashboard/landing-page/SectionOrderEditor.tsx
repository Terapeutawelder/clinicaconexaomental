import { useEffect, useRef } from "react";
import Sortable from "sortablejs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { 
  GripVertical, 
  Layers, 
  Sparkles, 
  Layout, 
  MessageSquare, 
  HelpCircle, 
  Phone,
  Calendar
} from "lucide-react";
import { LandingPageConfig } from "./LandingPagePreview";
import { cn } from "@/lib/utils";

interface SectionOrderEditorProps {
  config: LandingPageConfig;
  onConfigChange: (config: LandingPageConfig) => void;
}

export type SectionId = "services" | "about" | "schedule" | "testimonials" | "faq" | "contact";

export const defaultSectionOrder: SectionId[] = ["services", "about", "schedule", "testimonials", "faq", "contact"];

const sectionInfo: Record<SectionId, { label: string; icon: React.ElementType; showKey?: keyof NonNullable<LandingPageConfig["layout"]> }> = {
  services: { label: "Serviços", icon: Layout, showKey: "showServices" },
  about: { label: "Sobre Mim", icon: Sparkles, showKey: "showAbout" },
  schedule: { label: "Agenda Online", icon: Calendar },
  testimonials: { label: "Depoimentos", icon: MessageSquare, showKey: "showTestimonials" },
  faq: { label: "FAQ", icon: HelpCircle, showKey: "showFaq" },
  contact: { label: "Contato", icon: Phone, showKey: "showContact" },
};

const SectionOrderEditor = ({ config, onConfigChange }: SectionOrderEditorProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const sortableRef = useRef<Sortable | null>(null);

  // Get current order from config or use default
  const currentOrder = config.layout?.sectionOrder || defaultSectionOrder;

  useEffect(() => {
    if (!listRef.current) return;

    // Destroy existing sortable
    if (sortableRef.current) {
      sortableRef.current.destroy();
    }

    // Create new sortable
    sortableRef.current = Sortable.create(listRef.current, {
      animation: 200,
      handle: ".drag-handle",
      ghostClass: "opacity-50",
      chosenClass: "bg-primary/10",
      dragClass: "shadow-lg",
      onEnd: (evt) => {
        if (evt.oldIndex === undefined || evt.newIndex === undefined) return;
        
        const newOrder = [...currentOrder];
        const [movedItem] = newOrder.splice(evt.oldIndex, 1);
        newOrder.splice(evt.newIndex, 0, movedItem);
        
        onConfigChange({
          ...config,
          layout: {
            ...config.layout,
            sectionOrder: newOrder,
          },
        });
      },
    });

    return () => {
      if (sortableRef.current) {
        sortableRef.current.destroy();
      }
    };
  }, [currentOrder, config, onConfigChange]);

  const toggleSectionVisibility = (sectionId: SectionId) => {
    const info = sectionInfo[sectionId];
    if (!info.showKey) return; // Schedule is always visible

    const currentValue = config.layout?.[info.showKey] !== false;
    
    onConfigChange({
      ...config,
      layout: {
        ...config.layout,
        [info.showKey]: !currentValue,
      },
    });
  };

  const isSectionVisible = (sectionId: SectionId): boolean => {
    const info = sectionInfo[sectionId];
    if (!info.showKey) return true; // Schedule is always visible
    return config.layout?.[info.showKey] !== false;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          Ordem das Seções
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4">
          Arraste para reordenar e use os toggles para mostrar/ocultar seções
        </p>
        
        <div ref={listRef} className="space-y-2">
          {currentOrder.map((sectionId) => {
            const info = sectionInfo[sectionId];
            const Icon = info.icon;
            const isVisible = isSectionVisible(sectionId);
            const hasToggle = !!info.showKey;

            return (
              <div
                key={sectionId}
                data-id={sectionId}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border border-border bg-card transition-all",
                  !isVisible && "opacity-50"
                )}
              >
                <div className="drag-handle cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                  isVisible ? "bg-primary/10" : "bg-muted"
                )}>
                  <Icon className={cn(
                    "h-4 w-4 transition-colors",
                    isVisible ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                
                <span className={cn(
                  "flex-1 text-sm font-medium transition-colors",
                  !isVisible && "text-muted-foreground"
                )}>
                  {info.label}
                </span>

                {hasToggle ? (
                  <Switch
                    checked={isVisible}
                    onCheckedChange={() => toggleSectionVisibility(sectionId)}
                  />
                ) : (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    Sempre visível
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-muted-foreground mt-4 text-center">
          Hero e Footer são fixos e não podem ser reordenados
        </p>
      </CardContent>
    </Card>
  );
};

export default SectionOrderEditor;
