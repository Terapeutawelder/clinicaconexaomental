import { type Section } from "./store"

export async function generateLandingPage(prompt: string): Promise<Pick<Section, 'type' | 'content'>[]> {
    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const p = prompt.toLowerCase()

    const baseSections: Pick<Section, 'type' | 'content'>[] = [
        {
            type: 'hero',
            content: {
                headline: "Transforme sua Visão em Realidade",
                subheadline: "Nós ajudamos você a construir o futuro com tecnologia de ponta.",
                ctaText: "Começar a Construir",
            }
        },
        { type: 'features', content: {} },
        { type: 'testimonials', content: {} },
        { type: 'pricing', content: {} },
        { type: 'faq', content: {} },
        { type: 'footer', content: {} }
    ]

    if (p.includes('fitness') || p.includes('gym') || p.includes('treino') || p.includes('academia')) {
        baseSections[0].content = {
            headline: "Conquiste o Corpo dos Seus Sonhos",
            subheadline: "Junte-se à melhor comunidade fitness e transforme sua vida hoje.",
            ctaText: "Matricule-se Agora",
            imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2670&auto=format&fit=crop"
        }
    } else if (p.includes('course') || p.includes('curso') || p.includes('aula') || p.includes('ensino')) {
        baseSections[0].content = {
            headline: "Domine uma Nova Habilidade Hoje",
            subheadline: "Cursos abrangentes ensinados por especialistas do setor.",
            ctaText: "Inscreva-se Gratuitamente",
            imageUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=2674&auto=format&fit=crop"
        }
    } else if (p.includes('marketing') || p.includes('agencia') || p.includes('negocio') || p.includes('vendas')) {
        baseSections[0].content = {
            headline: "Escale seu Negócio Mais Rápido",
            subheadline: "Estratégias de marketing baseadas em dados que trazem resultados reais.",
            ctaText: "Agendar Consultoria",
            imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
        }
    }

    return baseSections
}
