# 📤 UPLOAD COMPLETO PARA GITHUB

## 🎯 PROJETO COMPLETO PARA SEU SERVIDOR

Como você quer instalar no seu servidor, precisa de TODOS os arquivos:

### 📋 ESTRUTURA COMPLETA:
```
conexao-mental/
├── client/          (Frontend React)
├── server/          (Backend Node.js)
├── shared/          (Código compartilhado)
├── package.json     (Dependências)
├── vite.config.ts   (Configuração Vite)
├── tsconfig.json    (TypeScript)
├── tailwind.config.ts
├── drizzle.config.ts
├── README.md
├── replit.md
└── .env.example
```

## 🔄 MÉTODO PARA UPLOAD COMPLETO:

### **OPÇÃO 1 - ZIP Download (Mais Fácil):**
1. **No Replit**, clique nos **3 pontos** ⋮ no canto superior
2. Selecione **"Download as zip"**
3. **Extraia o ZIP** no seu computador
4. **No GitHub**, delete repositório atual e crie novo
5. **Arraste toda a pasta** extraída para o GitHub

### **OPÇÃO 2 - Comandos Git (Se funcionar):**
```bash
cd /home/runner/workspace
rm -f .git/index.lock
git add .
git commit -m "Projeto completo - Sistema telemedicina"
git push origin main --force
```

### **OPÇÃO 3 - Upload Manual Seletivo:**
**Arquivos ESSENCIAIS para copiar:**
- `package.json` (dependências)
- `vite.config.ts` (configuração)
- `tsconfig.json` (TypeScript)
- `drizzle.config.ts` (banco)
- **Toda pasta `client/`** (frontend)
- **Toda pasta `server/`** (backend)
- **Toda pasta `shared/`** (tipos)

## ✅ DEPOIS DO UPLOAD:
No seu servidor:
```bash
npm install
npm run db:push
npm run dev
```

**Qual método você prefere? O ZIP é mais fácil!**