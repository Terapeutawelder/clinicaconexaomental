import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2, X } from "lucide-react"

interface AIGeneratorDialogProps {
    isOpen: boolean
    onClose: () => void
    onGenerate: (prompt: string) => void
}

export function AIGeneratorDialog({ isOpen, onClose, onGenerate }: AIGeneratorDialogProps) {
    const [prompt, setPrompt] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    if (!isOpen) return null

    const handleGenerate = async () => {
        if (!prompt.trim()) return
        setIsLoading(true)
        await onGenerate(prompt)
        setIsLoading(false)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-background w-full max-w-lg p-6 rounded-lg shadow-xl border animate-in zoom-in-95 duration-200 relative">
                <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose}>
                    <X className="w-4 h-4" />
                </Button>

                <div className="mb-6 text-center">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Gerar com IA</h2>
                    <p className="text-muted-foreground">Descreva seu negócio e nós criaremos uma landing page para você.</p>
                </div>

                <textarea
                    className="w-full h-32 p-4 rounded-md border bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all mb-4"
                    placeholder="Ex: Uma landing page para um estúdio de yoga oferecendo aulas online..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />

                <div className="flex gap-3 justify-end">
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()}>
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Gerando...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Gerar Página
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
