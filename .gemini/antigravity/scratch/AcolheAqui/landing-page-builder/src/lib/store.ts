import { create } from 'zustand'

export type SectionType = 'hero' | 'features' | 'testimonials' | 'pricing' | 'faq' | 'footer'

export interface Section {
    id: string
    type: SectionType
    content: any // Specific content structure based on type
}

interface BuilderState {
    sections: Section[]
    addSection: (type: SectionType, content?: any) => void
    setSections: (sections: Section[]) => void
    removeSection: (id: string) => void
    updateSection: (id: string, content: any) => void
    reorderSections: (startIndex: number, endIndex: number) => void
}

export const useBuilderStore = create<BuilderState>((set) => ({
    sections: [],
    setSections: (sections) => set({ sections }),
    addSection: (type, content = {}) =>
        set((state) => ({
            sections: [
                ...state.sections,
                {
                    id: crypto.randomUUID(),
                    type,
                    content,
                },
            ],
        })),
    removeSection: (id) =>
        set((state) => ({
            sections: state.sections.filter((s) => s.id !== id),
        })),
    updateSection: (id, content) =>
        set((state) => ({
            sections: state.sections.map((s) =>
                s.id === id ? { ...s, content: { ...s.content, ...content } } : s
            ),
        })),
    reorderSections: (startIndex, endIndex) =>
        set((state) => {
            const result = Array.from(state.sections)
            const [removed] = result.splice(startIndex, 1)
            result.splice(endIndex, 0, removed)
            return { sections: result }
        }),
}))
