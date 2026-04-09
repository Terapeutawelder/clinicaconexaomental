# CLAUDE.md

Este arquivo fornece orientações ao Claude Code (claude.ai/code) ao trabalhar com código neste repositório.

## Visão Geral

AcolheAqui é uma plataforma web para conectar usuários com profissionais de saúde mental. É um marketplace para psicoterapeutas, coaches e outros especialistas. A aplicação é construída com React, TypeScript e Supabase.

## Arquitetura de Alto Nível

### Estrutura Principal do Projeto

```
/src
  /components       - Componentes React reutilizáveis
  /pages           - Páginas/rotas principais
  /hooks           - Custom hooks React
  /lib             - Utilitários e helpers
  /integrations    - Integrações com serviços externos
  /assets          - Imagens e recursos estáticos
```

**Padrão de Roteamento:**
- Usa React Router v6 para navegação
- Rotas definidas em `App.tsx` com padrão file-based organizado
- Página não encontrada (NotFound) como fallback para rotas inválidas

### Principais Páginas

- **Index** - Landing page principal com seções de marketing
- **Profissionais** - Listagem de profissionais disponíveis
- **Psicoterapeutas** - Listagem específica de psicoterapeutas
- **ProfessionalProfile** - Perfil individual de profissional
- **Auth** - Página de autenticação
- **Dashboard** - Painel do usuário logado
- **CadastroPro/CadastroPremium** - Formulários de registro com diferentes planos

### Stack Tecnológico Principal

**Frontend:**
- **Vite** - Build tool rápido (servidor dev na porta 8080)
- **React 18.3+** - UI library
- **TypeScript** - Type safety
- **shadcn-ui** - Componentes de UI baseados em Radix UI
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Roteamento
- **React Hook Form + Zod** - Validação de formulários e dados
- **TanStack React Query** - Cache e sincronização de dados do servidor
- **Lucide React** - Ícones SVG
- **Date-fns** - Manipulação de datas
- **Sonner** - Toasts/notificações
- **Vaul** - Drawer component

**Backend/Dados:**
- **Supabase** - PostgreSQL + Auth + Realtime (no subprojeto acolheaqui_lovable)

**Linting:**
- ESLint com TypeScript plugin
- Regra customizada: `@typescript-eslint/no-unused-vars` desligada
- React Refresh verificação habilitada (warn)

### Subprojetos

O repositório contém múltiplos projetos:

1. **acolheaqui_lovable** (PRINCIPAL) - Versão mais recente com Supabase
   - Inclui migrations em `/supabase`
   - Usa Bun como package manager alternativo
   - Contém dashboard e sistema de automações

2. **landing-page-builder** - Builder de landing pages
3. **saas-platform** - Plataforma SaaS auxiliar
4. **AcolheAqui-Temp** - Versão anterior/temporária

## Comandos Comuns

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento (localhost:8080)
npm run build        # Build para produção
npm run build:dev    # Build com flags de desenvolvimento
npm run lint         # Rodar ESLint em todos os arquivos .ts/.tsx
npm run preview      # Preview local do build

# Subprojeto acolheaqui_lovable
cd acolheaqui_lovable
npm run dev          # Dev server
npm run build        # Build produção
```

### Rodar um Teste Específico

Este projeto não possui suite de testes unitários configurada. Para testar funcionalidades específicas:
- Use `npm run dev` para rodar a aplicação em desenvolvimento
- Inspecione componentes usando o inspector do navegador
- Verifique a lógica em TypeScript antes de rodar

## Padrões de Código

### Componentes

**Estrutura típica de componente:**
```tsx
import { Button } from "@/components/ui/button";

export const ComponentName = ({ prop }: Props) => {
  return (
    <div>
      {/* JSX aqui */}
    </div>
  );
};
```

**Alias de import:**
- Use `@/` para importar de `/src`
- Exemplo: `import { Button } from "@/components/ui/button"`

### Validação de Formulário

Padrão com React Hook Form + Zod:
```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Email inválido"),
  // mais campos...
});

const form = useForm({ resolver: zodResolver(schema) });
```

### Queries e Estado

Use TanStack React Query (React Query) para dados do servidor:
- Instância QueryClient criada em `App.tsx`
- Provider: `QueryClientProvider`
- Custom hooks devem usar `useQuery`, `useMutation` quando apropriado

### Estilo

- **Tailwind CSS** é o padrão primário
- **CSS Modules** ou `index.css` para estilos globais
- shadcn-ui para componentes pré-estilizados

## Estrutura de Dados (Supabase)

No subprojeto `acolheaqui_lovable`, o Supabase é usado com:
- PostgreSQL como banco de dados
- Migrations em `/supabase`
- Autenticação integrada
- Realtime para atualizações em tempo real

Para trabalhar com dados, consulte as migrations para entender o schema.

## Considerações de Desenvolvimento

**TypeScript:**
- `skipLibCheck: true` - Desativa verificação de tipos em node_modules
- `noUnusedParameters: false` - Permite parâmetros não usados
- `noUnusedLocals: false` - Permite variáveis locais não usadas
- `noImplicitAny: false` - Não força anotação explícita de tipos
- `strictNullChecks: false` - Mais flexível com null/undefined

**ESLint:**
- `no-unused-vars` foi desligado intencionalmente
- `react-refresh/only-export-components` usa warn com allowConstantExport
- Siga as recomendações de hooks React

## Integração com Lovable

Este projeto é sincronizado com [Lovable](https://lovable.dev), uma plataforma para editar o código visualmente. As mudanças feitas em Lovable são automaticamente commitadas neste repositório. A ferramenta `lovable-tagger` é usada durante o desenvolvimento.

## Convenções Git

- Mensagens de commit devem ser claras e em português ou inglês
- Commits recentes incluem features e fixes
- Use branches apropriadas para features/fixes antes de merge na main

## Verificação Rápida

Ao começar a trabalhar:
1. Confirme o Node.js/npm está instalado
2. Rode `npm install` se necessário
3. Execute `npm run lint` para verificar código
4. Use `npm run dev` para testar mudanças

Para editar CSS globais ou adicionar novos componentes, siga os padrões Tailwind + shadcn-ui já estabelecidos.
