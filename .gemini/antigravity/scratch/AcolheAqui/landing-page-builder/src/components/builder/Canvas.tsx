import { useBuilderStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { Hero } from "@/components/generated/Hero"

export function Canvas() {
    const { sections, removeSection, updateSection } = useBuilderStore()

    if (sections.length === 0) {
        return (
            <div className="flex-1 h-full flex items-center justify-center bg-muted/30">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">Sua página está vazia</p>
                    <p className="text-sm text-muted-foreground/50">Selecione um componente na barra lateral para começar</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 h-full overflow-y-auto bg-muted/30 p-8">
            <div className="max-w-5xl mx-auto bg-background min-h-[800px] shadow-sm border rounded-lg overflow-hidden flex flex-col">
                {sections.map((section) => (
                    <div key={section.id} className="relative group border-b last:border-0 hover:border-primary/20 transition-colors">
                        <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Button variant="destructive" size="icon" onClick={() => removeSection(section.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Actual Component Rendering */}
                        {section.type === 'hero' && (
                            <Hero
                                {...section.content}
                                onUpdate={(data) => updateSection(section.id, data)}
                            />
                        )}

                        {section.type !== 'hero' && (
                            <div className="text-center py-12 border-2 border-dashed rounded-lg m-8">
                                <p className="font-medium capitalize text-muted-foreground">Seção {section.type} (Em Breve)</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
