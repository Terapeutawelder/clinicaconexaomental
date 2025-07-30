# 🚀 DEPLOY NO SEU SERVIDOR

## 📋 MÉTODO DEFINITIVO PARA SEU SERVIDOR

### **1. CLONE LOCAL E TRANSFERÊNCIA COMPLETA:**

#### **No seu computador:**
```bash
# Clone o repositório vazio
git clone https://github.com/Terapeutawelder/mental-connect-schedule-56.git
cd mental-connect-schedule-56

# Configure Git
git config user.name "Terapeutawelder"
git config user.email "terapeutawelder@gmail.com"
```

#### **TRANSFERIR ARQUIVOS DO REPLIT:**
1. **Abra o Replit em outra aba**
2. **Selecione TODOS os arquivos** (Ctrl+A no painel esquerdo)
3. **Copie e cole** na pasta local clonada
4. **Ou use wget/curl** para baixar arquivos específicos

### **2. PUSH COMPLETO:**
```bash
# Adicione todos os arquivos
git add .

# Commit
git commit -m "Sistema completo de telemedicina - Conexão Mental

✅ Frontend React com TypeScript
✅ Backend Node.js + Express
✅ Banco PostgreSQL + Drizzle ORM
✅ Sistema de autenticação
✅ Dashboard profissional e admin
✅ Videoconsultas WebRTC
✅ Mercado Pago integrado
✅ Interface responsiva PT-BR
✅ Pronto para produção"

# Push usando token
git remote set-url origin https://USERNAME:SEU_TOKEN_GITHUB@github.com/USERNAME/REPOSITORY_NAME.git
git push origin main --force
```

### **3. NO SEU SERVIDOR:**
```bash
# Clone o repositório
git clone https://github.com/Terapeutawelder/mental-connect-schedule-56.git
cd mental-connect-schedule-56

# Instale Node.js (se não tiver)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Configure banco de dados
npm run db:push

# Inicie em produção
npm run build
npm start
```

## 🔧 **VARIÁVEIS DE AMBIENTE (.env):**
```
DATABASE_URL=sua_conexao_postgresql
MERCADO_PAGO_ACCESS_TOKEN=seu_token
MERCADO_PAGO_PUBLIC_KEY=sua_chave
SESSION_SECRET=sua_chave_secreta
NODE_ENV=production
PORT=3000
```

## ✅ **RESULTADO:**
Servidor rodando em: `http://seu-servidor:3000`

**Este método transfere os 192 arquivos de uma vez!**