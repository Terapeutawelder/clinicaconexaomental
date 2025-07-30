# 🔧 SOLUÇÃO ALTERNATIVA - Git Pull

## Como o download direto não funcionou, use o método Git Pull:

### **1. No seu servidor, execute:**

```bash
# Parar servidor
pm2 stop all

# Ir para a pasta do projeto
cd /var/www/clinicaconexaomental

# Fazer backup
cp .env ../.env-backup

# Fazer git pull
git pull origin main

# Se der conflito, force o pull:
git reset --hard origin/main

# Restaurar .env
cp ../.env-backup .env

# Instalar dependências
npm install

# Build
npm run build

# Iniciar
pm2 start "npm start" --name "conexaomental"
```

### **2. Se o git pull não funcionar, use este método:**

```bash
# Parar servidor
pm2 stop all

# Fazer backup completo
cd /var/www/
cp -r clinicaconexaomental clinica-backup
cp clinicaconexaomental/.env ./.env-backup

# Remover projeto atual
rm -rf clinicaconexaomental

# Clonar repositório atualizado
git clone https://github.com/Terapeutawelder/mental-connect-schedule-56.git clinicaconexaomental

# Entrar na pasta
cd clinicaconexaomental

# Restaurar configurações
cp ../.env-backup .env

# Instalar e buildar
npm install
npm run build

# Iniciar
pm2 start "npm start" --name "conexaomental"
```

### **3. Verificar se funcionou:**

```bash
pm2 list
curl -I https://clinicaconexaomental.online/
```

## 🎯 Resultado esperado:
- Site com seção de Planos (4 cards)
- Seção "O que você procura tratar?"
- FAQ no final da página