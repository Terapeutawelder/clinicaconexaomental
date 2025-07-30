# Changelog - Conexão Mental

Todas as mudanças importantes do projeto serão documentadas neste arquivo.

## [1.0.0] - 2025-07-20

### ✅ Adicionado
- Sistema completo de telemedicina para saúde mental
- Dashboard profissional com gestão completa de agenda
- Dashboard administrativo com relatórios em tempo real
- Sistema de autenticação multi-papel (paciente/profissional/admin)
- Interface responsiva em português brasileiro
- Pagamentos integrados via Mercado Pago (PIX e cartão)
- Videoconsultas WebRTC com gravação opcional
- Sistema de aprovação de profissionais pelo admin
- Templates Canva Pro integrados para marketing
- WebSocket para atualizações em tempo real
- Base de dados PostgreSQL com Drizzle ORM
- Sistema de webhooks para confirmação de pagamentos

### 🔧 Funcionalidades Principais

#### Para Pacientes
- Cadastro e login seguro
- Busca de profissionais por especialidade
- Agendamento de consultas online
- Acesso às videochamadas
- Histórico de consultas
- Pagamentos via PIX e cartão

#### Para Profissionais
- Dashboard completo de gestão
- Agenda de atendimentos
- Controle financeiro integrado
- Ferramentas de marketing
- Templates Canva Pro
- Sistema de aprovação
- Gestão de horários disponíveis

#### Para Administradores
- Painel administrativo completo
- Gestão de profissionais e pacientes
- Relatórios em tempo real
- Aprovação de novos profissionais
- Monitoramento de pagamentos
- Estatísticas do sistema

### 🐛 Correções
- **Login administrativo:** Criado usuário admin@test.com com senha 123456
- **Exibição de profissionais:** Corrigida API para retornar dados reais do banco
- **Autenticação:** Hash de senhas atualizado para bcrypt mais seguro
- **Interface:** Ajustada para consumir dados dinâmicos da API

### 🔒 Segurança
- Autenticação JWT com expiração de 24h
- Senhas hasheadas com bcrypt (12 rounds)
- Validação de dados com Zod schemas
- Headers de segurança configurados
- CORS restrito para produção
- Rate limiting em endpoints críticos

### 📱 Usuários de Teste
- **Admin:** admin@test.com / 123456
- **Profissional:** terapeutawelder@gmail.com / 123456
- **Paciente:** patient@test.com / 123456

### 💳 Planos de Preços
- **Sessão de Acolhimento:** R$ 37,90
- **Psicoterapia Individual:** R$ 57,90
- **Terapia de Casal:** R$ 97,90
- **Hipnoterapia:** R$ 197,90

### 🛠️ Stack Tecnológico
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express.js + TypeScript
- **Database:** PostgreSQL + Drizzle ORM
- **Pagamentos:** Mercado Pago SDK
- **Deploy:** Pronto para VPS/Hostinger/Vercel

### 📦 Deploy
- Guias completos de deploy em `DEPLOY_HOSTINGER.md`
- Configuração de produção em `PRODUCTION_GUIDE.md`
- Scripts de build e start configurados
- Variáveis de ambiente documentadas
- SSL e domain setup incluídos

### 🎯 Próximas Funcionalidades (Roadmap)
- [ ] Notificações push
- [ ] Aplicativo mobile (React Native)
- [ ] Integração com calendários externos (Google Calendar)
- [ ] Sistema de avaliações e feedback
- [ ] Chat em tempo real
- [ ] Prescrições digitais
- [ ] Relatórios avançados
- [ ] Integração com WhatsApp Business

---

## Como ler este changelog

- **✅ Adicionado** para novas funcionalidades
- **🔧 Modificado** para mudanças em funcionalidades existentes
- **🐛 Corrigido** para correções de bugs
- **🔒 Segurança** para melhorias de segurança
- **❌ Removido** para funcionalidades removidas
- **⚠️ Deprecated** para funcionalidades que serão removidas