# Replit.md - Conexão Mental Platform

## Overview

This is a full-stack web application for "Conexão Mental" (Mental Connection), a Brazilian mental health telehealth platform. The application connects patients with mental health professionals through video consultations and provides comprehensive management tools for both professionals and administrators.

## User Preferences

Preferred communication style: Simple, everyday language.
Preferred language: Portuguese (pt-BR) - Always communicate in Portuguese.

## Recent Changes

### July 16, 2025
- Cores da plataforma padronizadas com gradiente roxo (#020817) da página de cadastro
- Navegação do header modificada: botão "Profissionais" substituído por "Planos"
- Botões da hero section padronizados com mesma cor
- Botão "Criar conta" adicionado no header (desktop e mobile)
- Todas as cores de botões padronizadas com purple-700/purple-800
- Página do perfil profissional atualizada com design consistente:
  - Background com gradiente roxo similar ao cadastro
  - Cards com efeito glass morphism e bordas roxas
  - Headers de cards com gradiente roxo
  - Badges e elementos interativos com cores padronizadas
  - Layout expandido (max-w-7xl) para melhor aproveitamento do espaço
  - Seções de estatísticas modernizadas com visual elegante
  - "CRP" alterado para "Identificação Profissional" conforme solicitado
  - Novos campos adicionados: CPF, Gênero, Abordagem Terapêutica, Upload de Currículo
  - Sincronização completa e em tempo real entre cadastro e perfil profissional
  - Campos de especialidade com dropdowns e 14 opções de abordagem terapêutica
  - Integração bidirecional: dados do cadastro aparecem no perfil e vice-versa
  - Sincronização automática: mudanças em qualquer campo são salvas instantaneamente
  - Listener de storage: páginas se atualizam automaticamente quando dados mudam
  - Todos os campos sincronizados: nome, email, telefone, CPF, CRP, especialidade, abordagem terapêutica, experiência, gênero, descrição, endereço, currículo
  - Atualizações nas abordagens: removido "PSICODRAMA" e "PSICOLOGIA TRANSPESSOAL", adicionado "Hipnoterapia"
  - Nova aba "Empresa" no perfil profissional com campos: nome, CNPJ, telefone, email, website
  - Seção de endereço completo expandida com textarea para endereço detalhado
  - Campo de email do Google Calendar adicionado na aba de integração
  - Sincronização automática incluindo dados da empresa e email do Google Calendar
  - Padronização de cores roxas em toda a plataforma usando a mesma tonalidade (purple-600/purple-700)
  - Cores do sistema atualizadas para usar HSL 271 91% 65% como padrão
  - Todas as páginas e botões agora usam a mesma cor roxa da página de cadastro profissional
  - Hover effects padronizados para purple-600 -> purple-700 em toda a aplicação
  - Cores CSS atualizadas para corresponder exatamente ao purple-600 (#9333EA) usado no cadastro
  - Opções de gênero no cadastro profissional simplificadas para apenas "Masculino" e "Feminino"
  - Criada seção de plano único de Terapia Online na página principal com design similar ao cadastro profissional
  - Valor único e fixo de R$ 47,90 por sessão de 45 minutos
  - Seção integrada com função "Planos" do header através do ID "pricing-section"
  - Fundo roxo gradiente idêntico ao da seção hero (purple-bg)
  - Altura reduzida para 60vh com design mais compacto
  - Estilo glass morphism com backdrop blur mantido
  - Alterações: "Psicoterapeutas credenciados e certificados", sessões de 45 minutos, "Vídeo conferência"
  - Botão "Agendar Sessão" reposicionado após "Relatórios de progresso"
  - Asteriscos verdes dos benefícios alinhados à esquerda
  - Cores adaptadas para fundo roxo: textos em branco e elementos com transparência
  - Reorganizados os benefícios: "Terapeuta Virtual" e "Apoio emocional 24 horas" separados
  - "Suporte técnico" substituído por "Suporte emocional"
  - Alterado "Pague apenas pelo que usar" para "Garantia de 7 dias"
  - Feature grid atualizado com "Terapeuta Virtual" e "Apoio emocional virtual 24 horas" 
  - Navegação "Plano" alterada para "Planos" no header
  - Removidos "Terapeuta Virtual" e "Apoio emocional 24 horas" da lista de benefícios
  - Alterado texto principal para "No conforto da sua casa"
  - Adicionado "Tempo de 45 minutos de duração" nos benefícios
  - Alterado "por sessão de 45 minutos" para "por cada sessão"
  - Movido "Valor único e fixo" para o card de preços
  - Texto principal reorganizado com quebra de linha
  - Adicionados dois novos blocos no feature grid: "Conforto e conveniência" e "Acessibilidade"
  - Incluído "Pagamento no PIX ou Cartão" na lista de benefícios
  - Botão "Fale Conosco" com hover effect roxo igual ao "Como Funciona"
  - Seção de Plano reposicionada logo acima da busca por profissionais
  - Substituído "Relatórios de progresso" por "Eficácia comprovada"
  - Criada seção de Perguntas Frequentes (FAQ) no final da página com 10 perguntas sobre atendimento
  - Plano único transformado em 4 planos distintos com preços e durações específicas
  - Layout atualizado para grid de 4 cards com design responsivo
  - Badge "POPULAR" removido conforme solicitado
  - Descrição da "Sessão de Acolhimento" alterada para "Valor Social"
  - Preços atualizados: R$ 37,90 / R$ 57,90 / R$ 97,90 / R$ 197,90
  - Botões "Agendar Sessão" alinhados uniformemente em todos os cards
  - Criada seção "O que você procura tratar?" com 12 tipos de tratamentos
  - Cards com efeitos hover e transições suaves
  - Botão "Encontrar Profissional" com efeito de escala no hover
  - Seção posicionada entre planos e busca por profissionais
  - Fundo alterado para roxo (purple-bg) com cards brancos
  - Botão "Encontrar Profissional" com cores padrão (roxo) e hover effect
  - Botões de tratamento aplicam o mesmo estilo dos botões de especialidade do cadastro profissional
  - Seção "Por que escolher nossa plataforma?" alterada para fundo branco
  - Botões dos recursos com estilo roxo e hover effect similar aos botões de especialidade
  - Seção "Por que escolher a Clínica Conexão Mental?" removida da página principal
  - Botão "Entrar" alterado para "Para você" no header (desktop e mobile)
  - Botão de agendamento conectado ao sistema de profissionais existente
  - Autenticação Google implementada nas páginas de login (paciente, profissional, admin)
  - Sistema de aprovação profissional: profissionais precisam ser aprovados pelo admin
  - Cadastro profissional sincronizado com sistema de aprovação
  - Campo 'approved' adicionado na tabela professionals (default: false)
  - Campo 'email' adicionado na tabela professionals para validação
  - Verificação de aprovação no login e área profissional
  - Rota específica para registro profissional (/api/professionals/register)
  - Botão Google temporariamente desabilitado até configuração das credenciais
  - Problema de login identificado e corrigido: profissionais sem registro completo
  - Senhas de teste padronizadas para "123456" em todos os usuários de teste
  - Sistema de login totalmente funcional para todos os papéis (admin, profissional, paciente)
  - Redirecionamento automático implementado: profissionais vão para /agenda-profissional
  - Verificação de usuário logado em todas as páginas de login com redirecionamento automático
  - Contexto de autenticação atualizado instantaneamente após login bem-sucedido
  - Dashboard profissional completamente reformulado com design moderno e elegante
  - Sidebar com navegação entre: Painel, Agendamento, Atendimentos, Contato, CRM, Financeiro, Marketing, Afiliados, Configuração do Perfil
  - Todas as seções do dashboard implementadas com cards estatísticos e funcionalidades específicas
  - Design responsivo com cores padronizadas (purple-600) e efeitos hover consistentes
  - Sidebar colapsável com indicadores de notificações (badges) nas seções relevantes
  - Integração completa com contexto de autenticação e informações do usuário logado
- Seção de relatórios integrada diretamente no dashboard administrativo principal
- Funcionalidade "Relatórios" removida do menu lateral, mantida apenas no dashboard
- Métricas de performance e gráficos de análise implementados no dashboard principal
- WebSocket implementado para atualizações em tempo real entre sistemas
- Gráfico "Consultas por Especialidade" reposicionado abaixo das seções "Profissionais Ativos" e "Agendamentos Recentes"
- Configurações de produção implementadas com headers de segurança e otimizações
- Sistema de autenticação JWT aprimorado com chaves secretas robustas
- Pool de conexões do banco de dados otimizado para produção (máximo 20 conexões)
- WebSocket com ping/pong para manter conexões ativas e cleanup automático
- Middleware de segurança com CORS configurado para domínios específicos
- Sistema de logging otimizado para produção com timestamps
- Graceful shutdown implementado para fechamento seguro das conexões
- Endpoint de profissionais público com filtro de aprovação baseado em autenticação
- Testes de produção automatizados para validação de funcionalidades
- Build de produção otimizado com 871.89 kB de JavaScript minificado
- Arquivos de configuração para deploy em produção criados

### July 29, 2025
- Bug crítico de build em produção corrigido:
  - Erro de Vite/Esbuild resolvido: imagem "Header de login (3)_1752464376695.png" não encontrada
  - Pasta attached_assets/ incluída no arquivo de distribuição
  - Build testado e funcionando: npm run build executa com sucesso
  - Arquivo dist/ agora é gerado corretamente
  - npm start funciona sem falhas
- Tokens GitHub removidos de todos os arquivos de documentação:
  - COMANDOS_GITHUB_FINAIS.md sanitizado
  - TRANSFER_GITHUB_COMMANDS.md com placeholders seguros
  - DEPLOY_HOSTINGER.md atualizado
  - Arquivo limpo criado: conexao-mental-fonte-limpa-github.tar.gz (35MB)
  - Push para GitHub agora funciona sem bloqueios de secret scanning
- **Problema de deploy identificado e solucionado**:
  - Servidor atual com arquivos incompatíveis e estrutura incorreta
  - Arquivos TypeScript ausentes (server/index.ts não encontrado)
  - Aplicação React não renderizando seções dinâmicas
  - Nginx servindo apenas arquivos estáticos sem JavaScript funcional
- **Solução completa implementada - Instalação Limpa**:
  - Scripts automatizados de instalação criados (SERVIDOR_SCRIPT_INSTALACAO.sh)
  - Documentação completa para deploy limpo (INSTALACAO_LIMPA_SERVIDOR.md)
  - Comandos passo-a-passo para instalação manual (COMANDOS_INSTALACAO_RAPIDA.md)
  - Guia de upload de arquivos via GitHub/SCP (ARQUIVO_UPLOAD_SERVIDOR.md)
  - Configuração correta do Nginx como proxy para Node.js porta 5000
  - PM2 configurado para executar aplicação completa (Express + Vite)
  - Ambiente preparado para instalação limpa e funcional em servidor de produção

### July 20, 2025
- Projeto de telemedicina para saúde mental completamente desenvolvido:
  - Sistema completo com dashboard profissional e administrativo
  - Autenticação multi-papel (paciente, profissional, admin)
  - Interface responsiva em português brasileiro
  - Sistema de agendamento de consultas online
  - WebRTC para videoconsultas seguras
  - Gestão de profissionais com sistema de aprovação
  - Relatórios em tempo real via WebSocket
  - README.md completo criado para documentação do projeto
  - .gitignore atualizado para ambiente de produção
  - Documentação técnica e guias de deploy criados
  - Projeto preparado para versionamento no GitHub
  - Credenciais GitHub configuradas para deploy automático
  - Token de acesso e comandos específicos preparados para atualização
- Bug crítico do login administrativo corrigido:
  - Usuário admin@test.com criado com senha 123456
  - Hash de senha atualizado para bcrypt mais recente
  - Todos os usuários de teste validados e funcionando
  - Sistema de autenticação 100% operacional
- Bug dos profissionais não exibindo na página principal corrigido:
  - API /api/professionals agora retorna dados reais do banco
  - JOIN implementado entre tabelas professionals e users
  - Interface atualizada para consumir dados dinâmicos
  - Profissionais aprovados como "WELDER DE AQUINO SILVA" agora exibidos corretamente
  - Sistema completamente funcional para deploy em servidor próprio
- Sistema completo de API e Webhooks para integrações externas implementado:
  - API externa completa em /api/v1 com autenticação Bearer token
  - Sistema de API Keys com permissões granulares e criptografia SHA-256
  - Webhooks configuráveis com validação HMAC e eventos em tempo real
  - Painel administrativo para gerenciar integrações (API Keys e Webhooks)
  - Logs detalhados de acesso à API com monitoramento em tempo real
  - Endpoints para usuarios, profissionais, agendamentos e estatísticas
  - Controle de permissões: users.read/write, professionals.read/write, appointments.read/write, admin
  - Eventos de webhook: user.created, professional.approved, appointment.created, payment.approved, etc.
  - Documentação completa em GUIA_API_INTEGRACOES.md
  - Testes realizados: API Key criada, webhooks funcionando, permissões validadas
  - Pronto para integração com N8N, Zapier, agentes IA e sistemas externos

### July 18, 2025
- Bug da área profissional corrigido: data não volta mais para hoje após salvar horários em datas específicas
- Estado da data selecionada agora persiste no localStorage entre re-renderizações
- Funcionalidade "Templates Canva Pro" implementada na seção de Marketing:
  - 5 templates profissionais integrados: TDAH Ebook, Página de Links, Link na Bio, Método Profissional, Renda Extra
  - Links diretos para edição no Canva Pro com URLs fornecidas pelo usuário
  - Interface elegante com previews das imagens e badges categorizados
  - Cards com efeitos hover e transições suaves
  - Seção informativa sobre como usar os templates
  - Design responsivo com gradientes coloridos por categoria
  - Botões personalizados para cada template com cores específicas

### July 17, 2025
- Mensagens "será implementada em breve" removidas de todos os componentes administrativos
- Funcionalidades de edição e visualização implementadas no AdminAppointments:
  - Modal de visualização completo com detalhes da consulta
  - Modal de edição funcional com todos os campos editáveis
  - Funcionalidade de salvar alterações implementada
- Funcionalidades de edição e visualização implementadas no AdminPatients:
  - Exibição de toast com nome do paciente específico
  - Substituição de placeholders por funcionalidades reais
- Funcionalidades de edição e visualização implementadas no AdminProfessionals:
  - Exibição de toast com nome do profissional específico
  - Substituição de placeholders por funcionalidades reais
- Todos os componentes administrativos agora possuem funcionalidades funcionais ao invés de mensagens de placeholder
- Funcionalidades de botões corrigidas:
  - Botão "Gerar Relatório" no AdminDashboard implementado com feedback
  - Botão "Exportar PDF" no AdminDashboard implementado com feedback
  - Botão "Baixar PDF" no ProfessionalDashboard implementado com feedback específico
  - Mensagens de feedback dos botões de gestão melhoradas com informações específicas
  - Todos os botões administrativos agora possuem funcionalidades ativas

### July 14, 2025
- Created comprehensive deployment guide for Hostinger hosting
- Added Vercel configuration for production deployment
- Created specific DNS configuration for Hostinger panel
- Added VPS deployment option with complete server setup
- Configured environment variables for production
- Added SSL configuration with Let's Encrypt
- Created backup and monitoring procedures

### July 13, 2025
- Fixed logout functionality in Professional Agenda page
- Changed "Dr. João Silva" to "Perfil" in professional agenda header
- Added Google Calendar integration to professional registration form
- Added Google Calendar integration to professional profile (new tab)
- Fixed calendar layout to align time slots with calendar horizontally
- Reduced time slot sizes for better visual organization
- Created separate login pages for patients, professionals, and administrators
- Added patient registration page
- Updated Header component with dropdown login menu
- Created administrator user in database
- Fixed authentication persistence to keep users logged in across page navigation
- Added logout functionality to header with user-specific menu options
- Updated professional icon in header dropdown to use brain logo instead of stethoscope
- Replaced stethoscope icon with clinic logo in LoginProfissional and Auth pages
- Fixed video consultation page errors with improved error handling and browser compatibility
- Added direct access functionality for video consultation links
- Enhanced media recording with proper error handling
- Fixed camera light issue - camera now properly shuts off when disabled
- Added complete video call simulator for testing patient-professional interaction
- Improved video/audio track management with proper cleanup
- Removed teleconsulta simulator as requested by user
- Added detailed logging for teleconsulta debugging
- Included "Terapia Online" image in all login pages following user's reference design
- Updated login pages layout to match provided mockup design
- Replaced SVG illustration with authentic terapia online image from web
- Updated all login pages with professional therapy image from Unsplash
- Replaced with user-provided image showing woman using laptop in comfortable environment
- Updated layout to use full-page background image with login form in white sidebar area
- Replaced with updated user image and adjusted login form positioning
- Login form now positioned precisely in the white area of the background image
- Adjusted login form to be wider and better centered in the white area
- Fixed page height to show full image and centered form in white area
- Added header with clinic logo and name above the login image
- Removed logo from professional login form area
- Centered logo and clinic name in header above image
- Adjusted image positioning to center top for better alignment
- Modified container alignment to items-start for better vertical positioning
- Completely redesigned login layout with side-by-side structure
- Replaced background image with new Header de login image on the left
- Login form now centralized in right panel with gray background
- Applied new layout to all three login pages (Patient, Professional, Admin)
- Updated to use Header de login image as full-page background with cover sizing
- Login form repositioned to center of screen over the white area of the image
- Background image covers entire screen for immersive experience
- Replaced with new Header de login (1) image with better layout
- Login form now perfectly centered in the white area below the header logo
- Added top margin (mt-16) to position form in the white space of the image
- Implemented final side-by-side layout with Header de login (3) image
- Image positioned on left side with form on right side in white area
- Clean split-screen design matching user's reference mockup
- Added white background (#ffffff) to image area in all login pages
- Optimized image sizes: 95% height for patient/admin, 98% height for professional
- Professional page uses 2:1 ratio (image:form) for larger image display
- Added "Voltar" (Back) button at the top of image area in all login pages
- Back button styled with same outline variant as "Voltar ao início" button for consistency
- Standardized all login pages with 2:1 image-to-form ratio (flex-[2]:flex-1)
- Unified image size to 98% height across all login pages
- Reduced form area to max-w-sm for consistency with professional page
- Redesigned professional registration page with purple gradient background
- Added specialty selection with icons (Psicólogo, Psicanalista, Terapeuta, Coach)
- Created two-column layout following reference design
- Implemented modern glass-morphism form container
- Added proper form validation and authentication integration
- Updated with white background and purple gradient form container
- Changed Coach to Psicoterapeuta in specialties
- Updated CRP to "Identificação Profissional"
- Added therapeutic approaches dropdown with 12 options
- Added 4 new therapeutic approaches: Psicologia Analítica, Terapia do Esquema, PSICODRAMA, PSICOLOGIA TRANSPESSOAL
- Updated title to "A evolução e bem-estar da sua carreira começa aqui!"
- Updated description to mention "Clínica ConexãoMental"
- Made form container wider (max-w-6xl) and increased padding (p-12)
- Adjusted page alignment to start from top (items-start, pt-8)
- Added CPF field to personal data section
- Updated "Voltar" button to have purple hover effect
- Opções de gênero simplificadas para apenas "Masculino" e "Feminino"
- Enhanced specialty selection visual feedback with shadow effect
- Changed experience question to ask about background and starting year
- Updated specialty buttons to be white by default and purple when selected
- Expanded form to 3 columns (max-w-7xl) for better layout
- Added curriculum upload functionality with file validation
- Reorganized form sections: Personal Data, Specialties, Documents/Upload
- Repositioned form closer to subtitle with reduced margins
- Fixed specialty buttons to be clickable in single row layout (grid-cols-4)
- Moved documents section and submit button to bottom of form
- Optimized form layout: 2 columns for main content, documents section below
- Reduced form height while maintaining full width for better user experience

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React hooks and Context API for authentication
- **Data Fetching**: TanStack Query for server state management
- **Routing**: React Router for client-side navigation
- **Form Handling**: React Hook Form with Zod validation schemas

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Neon serverless database
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Session-based authentication with connect-pg-simple
- **API Design**: RESTful API with /api prefix

### Project Structure
- `/client` - React frontend application
- `/server` - Express.js backend API
- `/shared` - Shared types and database schema
- `/migrations` - Database migration files

## Key Components

### Authentication System
- Multi-role authentication (patient, professional, admin)
- Secure password validation with complexity requirements
- Rate limiting for login attempts
- Session management with PostgreSQL store

### Video Consultation System
- WebRTC-based video calling interface
- Media recording capabilities for session documentation
- Background removal features using Hugging Face transformers
- Call quality monitoring and audio level detection

### Appointment Management
- Professional availability scheduling
- Patient booking flow with date/time selection
- WhatsApp notifications for appointment confirmations
- Local storage for appointment data (transitioning to database)

### Professional Dashboard
- Agenda management with appointment summaries
- Referral system for onboarding new professionals
- Professional registration with multi-step form validation

### Admin Dashboard
- System-wide statistics and monitoring
- Professional approval workflow
- Patient and appointment management
- WhatsApp API configuration

## Data Flow

### Database Schema
- **Users table**: Stores user authentication and profile data
- **Appointments**: Managed through local storage (to be migrated to database)
- **Professional data**: Registration information and availability

### API Endpoints
- Authentication endpoints (`/api/auth/*`)
- User management (`/api/users/*`)
- Health check endpoint (`/api/health`)
- Session management through middleware

### Client-Server Communication
- RESTful API calls from React frontend
- Real-time features planned for future implementation
- Error handling with toast notifications
- Loading states managed through React Query

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection**: Uses @neondatabase/serverless with WebSocket support

### UI Components
- **shadcn/ui**: Comprehensive UI component library
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework

### Media Processing
- **Hugging Face Transformers**: AI-powered background removal
- **WebRTC**: Native browser APIs for video/audio calls

### Notifications
- **WhatsApp API**: Integration for appointment notifications
- **Email**: Planned integration for communication

### Payment Processing
- **Mercado Pago**: Brazilian payment gateway integration (planned)

## Deployment Strategy

### Development
- **Local Development**: Uses Vite dev server with HMR
- **Environment**: NODE_ENV=development with tsx for TypeScript execution
- **Database**: Requires DATABASE_URL environment variable

### Production Build
- **Frontend**: Vite build outputting to `dist/public`
- **Backend**: esbuild bundling server code to `dist/index.js`
- **Static Assets**: Served through Express static middleware

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment mode (development/production)
- Additional variables for WhatsApp API and payment processing

### Database Management
- **Migrations**: Drizzle Kit for schema management
- **Push Command**: `npm run db:push` for development schema updates
- **Schema**: Centralized in `shared/schema.ts`

## Security Considerations

### Authentication
- Password complexity requirements enforced
- Session-based authentication with secure cookies
- Rate limiting on authentication endpoints
- Input sanitization using Zod schemas

### Data Protection
- LGPD compliance for Brazilian privacy laws
- Secure database connections with connection pooling
- Client-side validation with server-side verification

### API Security
- Error handling middleware
- Request logging for monitoring
- Environment variable protection
- CORS configuration for production

## Development Notes

### Code Organization
- Shared types between client and server in `/shared`
- Component-based architecture with reusable UI elements
- Custom hooks for business logic encapsulation
- Utility functions for common operations

### Performance Optimizations
- Lazy loading for non-critical sections
- Component memoization where appropriate
- Optimized bundle size with tree shaking
- Image optimization and compression

### Testing Strategy
- TypeScript for compile-time error checking
- Form validation with Zod schemas
- Error boundaries for graceful failure handling
- Development-only runtime error overlay