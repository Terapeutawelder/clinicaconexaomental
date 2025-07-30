# 🚀 COMANDOS FINAIS PARA CORRIGIR O SERVIDOR

## PROBLEMA ATUAL:
- Arquivo .env criado ✅  
- Build realizado ✅
- PM2 ainda executando npm start incorretamente

## COMANDOS PARA EXECUTAR:

### 1. Parar processo atual:
```bash
pm2 delete conexaomental
```

### 2. Executar diretamente o arquivo JavaScript compilado:
```bash
pm2 start dist/index.js --name "conexaomental" --cwd /var/www/conexaomental
```

### 3. Verificar se funcionou:
```bash
pm2 logs conexaomental --lines 5
```

### 4. Testar o site:
```bash
curl -I http://localhost:3000
curl -I https://clinicaconexaomental.online
```

### 5. Se tudo estiver OK, salvar configuração PM2:
```bash
pm2 save
pm2 startup
```

## EXPLICAÇÃO:
- O PM2 vai executar diretamente o arquivo `dist/index.js` ao invés de tentar usar npm
- Isso evita problemas com scripts npm em produção
- O arquivo .env já está criado com as configurações necessárias