# 🔧 CORREÇÃO DO SCRIPT PM2

## PROBLEMA IDENTIFICADO:
- PM2 configurado corretamente ✅
- Tentando executar "npm start" mas script não existe
- Precisa usar "npm run dev" ou criar script "start"

## COMANDOS PARA CORRIGIR:

### 1. Parar processo atual:
```bash
pm2 delete conexaomental
```

### 2. Iniciar com script correto:
```bash
pm2 start "npm run dev" --name "conexaomental" --cwd /var/www/conexaomental
```

### 3. Verificar logs:
```bash
pm2 logs conexaomental --lines 5
```

### 4. Criar arquivo .env:
```bash
cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://username:password@localhost:5432/conexaomental
DOMAIN=https://clinicaconexaomental.online
SESSION_SECRET=sua_chave_secreta_muito_longa_e_segura_123456789
EOF
```

### 5. Reiniciar com .env:
```bash
pm2 restart conexaomental
```