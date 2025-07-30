# 🚀 CONFIGURAÇÃO FINAL DO SERVIDOR COMPLETO

## PROBLEMA ATUAL:
- PM2 executando apenas frontend (Vite porta 8080) ❌
- Backend não está rodando (porta 5000) ❌  
- Site não atualizado porque falta servidor Express ❌

## SOLUÇÃO - EXECUTAR SERVIDOR COMPLETO:

### 1. Parar processo atual:
```bash
pm2 delete conexaomental
```

### 2. Verificar se tsx está disponível:
```bash
npx tsx --version
```

### 3. Executar servidor completo (frontend + backend):
```bash
pm2 start "npx tsx server/index.ts" --name "conexaomental" --cwd /var/www/conexaomental
```

### 4. Verificar logs:
```bash
pm2 logs conexaomental --lines 15
```

### 5. Testar backend:
```bash
curl -I http://localhost:5000
```

### 6. Testar se site está atualizado:
```bash
curl -s http://localhost:5000 | grep -i "planos\|faq\|procura tratar"
```

## RESULTADO ESPERADO:
- Servidor Express rodando na porta 5000 ✅
- Frontend + Backend integrados ✅
- Site com seções: Planos, FAQ, "O que você procura tratar?" ✅