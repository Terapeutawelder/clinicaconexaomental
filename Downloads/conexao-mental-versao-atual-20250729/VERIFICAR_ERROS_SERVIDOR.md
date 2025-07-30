# 🔍 COMANDOS PARA VERIFICAR ERROS

## Execute estes comandos para identificar o problema:

### 1. Ver logs detalhados do PM2:
```bash
pm2 logs conexaomental --lines 20
```

### 2. Verificar se o servidor está respondendo:
```bash
curl -I http://localhost:3000
```

### 3. Verificar arquivos de configuração:
```bash
ls -la | grep -E "\.(env|json|js|ts)$"
```

### 4. Ver conteúdo do package.json:
```bash
cat package.json | grep -A5 -B5 "scripts"
```

### 5. Verificar se o PostgreSQL está rodando:
```bash
systemctl status postgresql
```

### 6. Testar conexão com banco:
```bash
pg_isready
```

Execute o comando 1 primeiro e me envie a saída completa dos logs de erro.