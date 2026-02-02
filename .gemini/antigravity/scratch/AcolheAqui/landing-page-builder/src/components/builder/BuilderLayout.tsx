import { useState } from "react"
import { Sidebar } from "./Sidebar"
import { Canvas } from "./Canvas"
import { AIGeneratorDialog } from "./AIGeneratorDialog"
import { Button } from "@/components/ui/button"
import { Sparkles, Download } from "lucide-react"
import { useBuilderStore } from "@/lib/store"
import { generateLandingPage } from "@/lib/ai"

export function BuilderLayout() {
    const [isAIDialogOpen, setIsAIDialogOpen] = useState(false)
    const addSection = useBuilderStore((state) => state.addSection)

    // Direct access to store methods for bulk update would be better, but loop is fine for now
    // Actually, I should probably clear the store or ask. 
    // Let's create a bulk add or setSections in store? 
    // For now I'll just append.

    const handleGenerate = async (prompt: string) => {
        const generatedSections = await generateLandingPage(prompt)
        generatedSections.forEach(s => {
            addSection(s.type, s.content)
        })
    }

    // Waiting to refactor store.ts first
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-background">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-14 border-b flex items-center px-6 justify-between bg-card z-10 relative shadow-sm">
                    <span className="font-bold flex items-center gap-2">
                        <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">LP</span>
                        Construtor IA
                    </span>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsAIDialogOpen(true)}>
                            <Sparkles className="w-4 h-4 mr-2 text-primary" />
                            Gerar com IA
                        </Button>
                        <Button>
                            <Download className="w-4 h-4 mr-2" />
                            Exportar
                        </Button>
                    </div>
                </header>
                <Canvas />
                <AIGeneratorDialog
                    isOpen={isAIDialogOpen}
                    onClose={() => setIsAIDialogOpen(false)}
                    onGenerate={handleGenerate}
                />
            </main>
        </div>
    )
}
