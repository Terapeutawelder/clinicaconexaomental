# 🔧 COMANDOS PARA ATUALIZAR O SERVIDOR

## SITUAÇÃO ATUAL:
- Projeto em: `/var/www/conexaomental` ✅
- Git configurado: SIM ✅
- Problema: Arquivos locais diferentes do repositório

## COMANDOS PARA EXECUTAR:

### 1. Fazer backup do .env:
```bash
cd /var/www/conexaomental
cp .env ~/.env-backup-$(date +%Y%m%d)
```

### 2. Reset completo do Git:
```bash
git fetch origin
git reset --hard origin/main
```

### 3. Restaurar configurações:
```bash
cp ~/.env-backup-$(date +%Y%m%d) .env
```

### 4. Instalar dependências:
```bash
npm install
```

### 5. Build do projeto:
```bash
npm run build
```

### 6. Reiniciar PM2:
```bash
pm2 restart conexaomental
```

### 7. Verificar se funcionou:
```bash
pm2 list
curl -I https://clinicaconexaomental.online/
```

## RESULTADO ESPERADO:
- Site com seção de Planos (4 cards)
- Seção "O que você procura tratar?"
- FAQ no final da página