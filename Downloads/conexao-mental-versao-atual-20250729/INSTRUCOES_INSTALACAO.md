# 🏥 Conexão Mental - Plataforma de Telemedicina

## 📋 Sobre o Projeto

Sistema completo de telemedicina para saúde mental desenvolvido em React/TypeScript com backend Node.js. Inclui:

- **Sistema multi-papel**: Pacientes, Profissionais e Administradores
- **Agendamento online** com calendário interativo
- **Videoconsultas** via WebRTC
- **Pagamentos** integrados com Mercado Pago
- **Dashboard profissional** completo
- **Painel administrativo** com relatórios
- **API externa** para integrações (N8N, Zapier, etc.)
- **Sistema de aprovação** de profissionais
- **Notificações** em tempo real via WebSocket

## 🚀 Instalação Rápida

### 1. Pré-requisitos
```bash
# Node.js 18 ou superior
node --version

# npm ou yarn
npm --version
```

### 2. Instalação
```bash
# Extrair arquivos
tar -xzf conexao-mental-fonte-completa.tar.gz
cd conexao-mental

# Instalar dependências
npm install

# Configurar banco de dados PostgreSQL
# Criar arquivo .env com as credenciais do banco
cp .env.example .env
```

### 3. Configuração do Banco (.env)
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/conexao_mental"
MERCADO_PAGO_ACCESS_TOKEN="seu_token_aqui"
MERCADO_PAGO_PUBLIC_KEY="sua_chave_publica_aqui"
```

### 4. Executar o Projeto
```bash
# Aplicar migrações do banco
npm run db:push

# Iniciar servidor (desenvolvimento)
npm run dev

# Acesse: http://localhost:5000
```

## 👥 Usuários de Teste

### Administrador
- **Email**: admin@conexaomental.com
- **Senha**: 123456

### Profissional 
- **Email**: terapeutawelder@gmail.com
- **Senha**: 123456

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Banco**: PostgreSQL, Drizzle ORM
- **Autenticação**: JWT, Sessions
- **Pagamentos**: Mercado Pago
- **Real-time**: WebSocket
- **Build**: Vite

## 📁 Estrutura do Projeto

```
├── client/          # Frontend React
├── server/          # Backend Node.js
├── shared/          # Tipos compartilhados
├── package.json     # Dependências
├── vite.config.ts   # Configuração Vite
└── README.md        # Documentação
```

## 🌐 Deploy para Produção

### Opção 1: Servidor VPS
```bash
# Build para produção
npm run build

# Iniciar servidor
npm start
```

### Opção 2: Vercel/Netlify
- Configurar variáveis de ambiente
- Deploy automático via Git

## 📊 Funcionalidades Principais

### Para Pacientes
- ✅ Cadastro e login
- ✅ Busca de profissionais 
- ✅ Agendamento de consultas
- ✅ Videoconsultas
- ✅ Pagamentos via PIX/Cartão

### Para Profissionais  
- ✅ Dashboard completo
- ✅ Gestão de agenda
- ✅ Relatórios financeiros
- ✅ CRM de pacientes
- ✅ Marketing e templates

### Para Administradores
- ✅ Painel de controle
- ✅ Aprovação de profissionais
- ✅ Relatórios do sistema
- ✅ Gestão de usuários
- ✅ API Keys e Webhooks

## 🔗 API Externa

Endpoints disponíveis em `/api/v1`:
- GET /api/v1/users
- GET /api/v1/professionals  
- GET /api/v1/appointments
- POST /api/v1/webhooks

Documentação completa em `GUIA_API_INTEGRACOES.md`

## 📞 Suporte

Para dúvidas sobre implementação ou customização:
- Email: suporte@conexaomental.com
- WhatsApp: (11) 99999-9999

---
**Desenvolvido com ❤️ para revolucionar a telemedicina no Brasil**