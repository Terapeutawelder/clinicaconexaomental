import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface HeroProps {
    headline?: string
    subheadline?: string
    ctaText?: string
    imageUrl?: string
    onUpdate?: (data: Partial<HeroProps>) => void
    readOnly?: boolean
}

export function Hero({
    headline = "Transforme seu Negócio Hoje",
    subheadline = "O construtor de landing pages mais poderoso para negócios modernos.",
    ctaText = "Começar Agora",
    imageUrl = "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2670&auto=format&fit=crop",
    onUpdate,
    readOnly = false
}: HeroProps) {

    const handleContentChange = (field: keyof HeroProps, value: string) => {
        if (readOnly || !onUpdate) return
        onUpdate({ [field]: value })
    }

    return (
        <section className="relative py-20 px-6 md:px-12 bg-background overflow-hidden border-b">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-6 text-center md:text-left">
                    <h1
                        className={cn("text-4xl md:text-6xl font-bold tracking-tight text-primary outline-none", !readOnly && "hover:bg-muted/20 cursor-text rounded px-2 -ml-2")}
                        contentEditable={!readOnly}
                        suppressContentEditableWarning
                        onBlur={(e) => handleContentChange('headline', e.currentTarget.textContent || "")}
                    >
                        {headline}
                    </h1>
                    <p
                        className={cn("text-xl text-muted-foreground outline-none", !readOnly && "hover:bg-muted/20 cursor-text rounded px-2 -ml-2")}
                        contentEditable={!readOnly}
                        suppressContentEditableWarning
                        onBlur={(e) => handleContentChange('subheadline', e.currentTarget.textContent || "")}
                    >
                        {subheadline}
                    </p>
                    <div className="pt-4 flex justify-center md:justify-start">
                        <Button size="lg" className="text-lg px-8">
                            <span
                                contentEditable={!readOnly}
                                suppressContentEditableWarning
                                onBlur={(e) => handleContentChange('ctaText', e.currentTarget.textContent || "")}
                                className="outline-none"
                            >
                                {ctaText}
                            </span>
                        </Button>
                    </div>
                </div>
                <div className="flex-1 relative">
                    <div className="relative rounded-xl overflow-hidden shadow-2xl group">
                        <img
                            src={imageUrl}
                            alt="Hero"
                            className="w-full h-auto object-cover aspect-video"
                        />
                        {!readOnly && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="secondary" onClick={() => {
                                    const url = prompt("Digite a nova URL da imagem:", imageUrl)
                                    if (url) handleContentChange('imageUrl', url)
                                }}>Alterar Imagem</Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
