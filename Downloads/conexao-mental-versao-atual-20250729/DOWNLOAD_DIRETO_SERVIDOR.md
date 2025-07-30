# 📥 DOWNLOAD DIRETO NO SERVIDOR

## 🔗 Link para download:
```
https://clinicaconexaomental.online/download-temp.tar.gz
```

## 📋 COMANDOS PARA EXECUTAR NO SEU SERVIDOR:

### 1. Conexão SSH:
```bash
ssh seu_usuario@clinicaconexaomental.online
```

### 2. Parar servidor:
```bash
pm2 stop all
```

### 3. Ir para diretório:
```bash
cd /var/www/
```

### 4. Fazer backup:
```bash
cp -r clinicaconexaomental clinica-backup
cp clinicaconexaomental/.env ./env-backup.txt
```

### 5. Baixar arquivo atualizado:
```bash
wget https://clinicaconexaomental.online/download-temp.tar.gz
```

### 6. Remover versão antiga:
```bash
rm -rf clinicaconexaomental
```

### 7. Extrair nova versão:
```bash
tar -xzf download-temp.tar.gz
mv mental-connect-schedule-56 clinicaconexaomental
```

### 8. Restaurar configurações:
```bash
cd clinicaconexaomental
cp ../env-backup.txt .env
```

### 9. Instalar e buildar:
```bash
npm install
npm run build
```

### 10. Iniciar servidor:
```bash
pm2 start "npm start" --name "conexaomental"
```

### 11. Verificar:
```bash
pm2 list
curl -I https://clinicaconexaomental.online/
```

## 🗑️ Limpeza (após confirmar que funcionou):
```bash
rm /var/www/download-temp.tar.gz
```

## 🆘 Se der erro, restaurar backup:
```bash
pm2 stop all
rm -rf clinicaconexaomental
mv clinica-backup clinicaconexaomental
cd clinicaconexaomental
pm2 start "npm start" --name "conexaomental"
```