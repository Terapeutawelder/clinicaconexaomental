import { useBuilderStore, type SectionType } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { LayoutTemplate, AlignVerticalJustifyCenter, MessageSquare, DollarSign, HelpCircle, FileText } from "lucide-react"

const SECTION_TYPES: { type: SectionType; label: string; icon: React.ElementType }[] = [
    { type: 'hero', label: 'Seção Hero', icon: LayoutTemplate },
    { type: 'features', label: 'Recursos', icon: AlignVerticalJustifyCenter },
    { type: 'testimonials', label: 'Depoimentos', icon: MessageSquare },
    { type: 'pricing', label: 'Preços', icon: DollarSign },
    { type: 'faq', label: 'Perguntas Frequentes', icon: HelpCircle },
    { type: 'footer', label: 'Rodapé', icon: FileText },
]

export function Sidebar() {
    const addSection = useBuilderStore((state) => state.addSection)

    return (
        <aside className="w-64 border-r bg-card h-full flex flex-col">
            <div className="p-4 border-b">
                <h2 className="font-semibold mb-1">Adicionar Seções</h2>
                <p className="text-xs text-muted-foreground">Clique para adicionar à sua página</p>
            </div>
            <div className="p-4 space-y-2 overflow-y-auto flex-1">
                {SECTION_TYPES.map((item) => (
                    <Button
                        key={item.type}
                        variant="outline"
                        className="w-full justify-start gap-2 h-auto py-3"
                        onClick={() => addSection(item.type)}
                    >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                    </Button>
                ))}
            </div>
        </aside>
    )
}
