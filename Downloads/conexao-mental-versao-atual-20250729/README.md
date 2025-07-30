# Conexão Mental - Plataforma de Telemedicina

Uma plataforma completa de telemedicina para saúde mental, conectando pacientes a profissionais qualificados através de consultas online seguras.

## 🚀 Funcionalidades

### Para Pacientes
- ✅ Cadastro e login seguro
- ✅ Busca de profissionais por especialidade
- ✅ Agendamento de consultas online
- ✅ Videochamadas integradas
- ✅ Pagamentos via PIX e cartão (Mercado Pago)
- ✅ Histórico de consultas

### Para Profissionais
- ✅ Dashboard completo de gestão
- ✅ Agenda de atendimentos
- ✅ Sistema de aprovação pelo admin
- ✅ Controle financeiro
- ✅ Ferramentas de marketing
- ✅ Templates Canva Pro integrados

### Para Administradores
- ✅ Painel administrativo completo
- ✅ Gestão de profissionais e pacientes
- ✅ Relatórios em tempo real
- ✅ Sistema de aprovação de profissionais
- ✅ Monitoramento de pagamentos

## 🛠️ Tecnologias

### Frontend
- **React 18** com TypeScript
- **Vite** para build otimizado
- **Tailwind CSS** + shadcn/ui
- **TanStack Query** para estado do servidor
- **React Hook Form** + Zod para formulários

### Backend
- **Node.js** + Express.js
- **PostgreSQL** com Neon Database
- **Drizzle ORM** para database
- **JWT** para autenticação
- **WebSocket** para atualizações em tempo real

### Pagamentos
- **Mercado Pago** (PIX e cartão)
- Webhooks para confirmação automática

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL (ou Neon Database)
- Conta Mercado Pago para pagamentos

## 🚀 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/Terapeutawelder/mental-connect-schedule-56.git
cd mental-connect-schedule-56
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
DATABASE_URL=postgresql://user:password@host:port/database
MERCADO_PAGO_ACCESS_TOKEN=seu_access_token
MERCADO_PAGO_PUBLIC_KEY=sua_public_key
NODE_ENV=development
```

4. **Configure o banco de dados**
```bash
npm run db:push
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5000`

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run start` - Inicia servidor de produção
- `npm run db:push` - Aplica mudanças no schema do banco
- `npm run db:studio` - Abre Drizzle Studio

## 🌐 Deploy em Produção

### Opção 1: VPS/Servidor Próprio
1. Siga o guia em `DEPLOY_HOSTINGER.md`
2. Configure SSL com Let's Encrypt
3. Use PM2 para gerenciar processos

### Opção 2: Vercel/Railway
1. Configure as variáveis de ambiente
2. Conecte seu repositório GitHub
3. Deploy automático

## 📱 Usuários de Teste

### Administrador
- **Email:** admin@test.com
- **Senha:** 123456
- **Acesso:** Dashboard administrativo completo

### Profissional
- **Email:** terapeutawelder@gmail.com
- **Senha:** 123456
- **Status:** Aprovado e ativo
- **Acesso:** Dashboard profissional e agenda

### Paciente
- **Email:** patient@test.com
- **Senha:** 123456
- **Acesso:** Agendamento de consultas e área do paciente

## 💳 Configuração de Pagamentos

### Mercado Pago
1. Criar conta no [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Obter credenciais de teste e produção
3. Configurar webhook para confirmação automática

### Valores dos Planos
- **Sessão de Acolhimento:** R$ 37,90
- **Psicoterapia Individual:** R$ 57,90
- **Terapia de Casal:** R$ 97,90
- **Hipnoterapia:** R$ 197,90

## 🔒 Segurança

- ✅ Autenticação JWT com expiração
- ✅ Senhas hasheadas com bcrypt
- ✅ Validação de dados com Zod
- ✅ Headers de segurança configurados
- ✅ CORS restrito para produção

## 📊 Monitoramento

- Logs estruturados para debugging
- WebSocket para atualizações em tempo real
- Health check endpoint: `/api/health`
- Métricas de performance no dashboard admin

## 🤝 Contribuição

1. Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte técnico ou dúvidas:
- **Email:** terapeutawelder@gmail.com
- **GitHub Issues:** [Abrir issue](https://github.com/Terapeutawelder/mental-connect-schedule-56/issues)

## 🎯 Roadmap

- [ ] Notificações push
- [ ] Aplicativo mobile (React Native)
- [ ] Integração com calendários externos
- [ ] Sistema de avaliações
- [ ] Chat em tempo real
- [ ] Prescrições digitais

---

**Desenvolvido com ❤️ para conectar pessoas e promover saúde mental acessível**