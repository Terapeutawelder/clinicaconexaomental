# Comandos para Transferir Projeto para GitHub

## 📋 Pré-requisitos
- Ter Git instalado na máquina
- Ter acesso ao GitHub com token configurado
- **Token GitHub:** `SEU_TOKEN_GITHUB_AQUI`
- **Email:** `terapeutawelder@gmail.com`
- **Repositório:** `https://github.com/Terapeutawelder/mental-connect-schedule-56`

## 🚀 Comandos Sequenciais

### 1. Configurar Git (primeira vez)
```bash
git config --global user.name "Welder de Aquino Silva"
git config --global user.email "terapeutawelder@gmail.com"
```

### 2. Baixar arquivos do Replit
1. **Opção A - Download direto:**
   - Ir em Files → Download as ZIP
   - Extrair o arquivo `projeto-completo.zip`

2. **Opção B - Seleção manual:**
   - Baixar apenas os arquivos essenciais (sem node_modules)
   - Ver lista em `ONDE_BAIXAR_ARQUIVOS.md`

### 3. Inicializar repositório local
```bash
cd mental-connect-schedule-56
git init
git remote add origin https://github.com/Terapeutawelder/mental-connect-schedule-56.git
```

### 4. Configurar autenticação com token
```bash
git remote set-url origin https://SEU_TOKEN_GITHUB@github.com/USERNAME/REPOSITORY_NAME.git
```

### 5. Preparar arquivos para commit
```bash
git add .
git commit -m "🚀 Deploy inicial: Plataforma de telemedicina completa

✅ Sistema completo de agendamento online
✅ Dashboard profissional e administrativo  
✅ Pagamentos Mercado Pago (PIX/Cartão)
✅ Videoconsultas WebRTC integradas
✅ Autenticação multi-papel (paciente/profissional/admin)
✅ Interface responsiva em português
✅ Base de dados PostgreSQL configurada
✅ Pronto para deploy em servidor próprio"
```

### 6. Enviar para GitHub
```bash
git branch -M main
git push -u origin main
```

## 🔧 Comandos de Atualização (uso futuro)
```bash
# Fazer mudanças no código
git add .
git commit -m "📝 Descrição da atualização"
git push origin main
```

## 📁 Estrutura de Arquivos Importantes

### Essenciais para funcionar:
```
├── client/          # Frontend React
├── server/          # Backend Node.js
├── shared/          # Schemas compartilhados
├── package.json     # Dependências
├── vite.config.ts   # Configuração build
├── drizzle.config.ts # Configuração DB
├── tsconfig.json    # TypeScript
├── tailwind.config.ts # Estilos
├── README.md        # Documentação
├── .env.example     # Variáveis exemplo
└── .gitignore       # Arquivos ignorados
```

### Para deploy:
```
├── DEPLOY_HOSTINGER.md    # Guia deploy servidor
├── PRODUCTION_GUIDE.md    # Guia produção
├── start-production.js    # Script produção
├── vercel.json           # Config Vercel
└── .replit              # Config Replit (opcional)
```

## ⚠️ Importante

1. **Não incluir no Git:**
   - `node_modules/`
   - `.env` (apenas `.env.example`)
   - `dist/`
   - Arquivos de log

2. **Credenciais necessárias no servidor:**
   - `DATABASE_URL` (PostgreSQL/Neon)
   - `MERCADO_PAGO_ACCESS_TOKEN`
   - `MERCADO_PAGO_PUBLIC_KEY`

3. **Após deploy no servidor:**
   ```bash
   npm install
   npm run build
   npm run db:push
   npm start
   ```

## 🚨 Em caso de erro

### Erro de autenticação:
```bash
git remote set-url origin https://SEU_TOKEN_GITHUB@github.com/USERNAME/REPOSITORY_NAME.git
```

### Erro de token expirado:
1. Ir em GitHub → Settings → Developer settings → Personal access tokens
2. Gerar novo token com permissões de repositório
3. Substituir no comando remote set-url

### Repositório já existe:
```bash
git pull origin main --allow-unrelated-histories
git push origin main
```

## ✅ Verificação Final

Após executar os comandos, verificar:
1. Arquivos aparecem no GitHub
2. README.md está sendo exibido corretamente
3. Estrutura de pastas está completa
4. Arquivo `.env.example` está presente
5. Documentação de deploy está disponível

**Status:** ✅ Projeto pronto para transferência e deploy!