# 🔄 ATUALIZAÇÃO SEGURA DO SERVIDOR - Passo a Passo

## 📋 PREPARAÇÃO

### 1. Baixar arquivo atualizado
- Arquivo: `conexao-mental-versao-atual-YYYYMMDD.tar.gz`
- Transferir para seu servidor via SCP, FTP ou upload direto

### 2. Conectar ao servidor
```bash
ssh usuario@clinicaconexaomental.online
```

## 🛑 PARAR SERVIDOR ATUAL

### Opção A - PM2 (se usar PM2):
```bash
pm2 stop all
pm2 list  # Verificar se parou
```

### Opção B - SystemD (se usar como serviço):
```bash
sudo systemctl stop conexaomental
sudo systemctl status conexaomental  # Verificar se parou
```

### Opção C - Processo manual:
```bash
pkill -f "node.*server"
ps aux | grep node  # Verificar se parou
```

## 💾 FAZER BACKUP COMPLETO

```bash
# Ir para diretório web
cd /var/www/

# Backup da instalação atual (IMPORTANTE!)
cp -r clinicaconexaomental clinicaconexaomental-backup-$(date +%Y%m%d)
ls -la | grep backup  # Verificar backup criado

# Backup específico do .env
cp clinicaconexaomental/.env ./env-backup-$(date +%Y%m%d)
```

## 🗂️ INSTALAR NOVA VERSÃO

### 1. Remover versão atual:
```bash
rm -rf clinicaconexaomental
```

### 2. Extrair nova versão:
```bash
# Se arquivo está na pasta do usuário
tar -xzf ~/conexao-mental-versao-atual-YYYYMMDD.tar.gz

# Renomear pasta extraída
mv mental-connect-schedule-56 clinicaconexaomental
# ou se extraiu com nome diferente:
mv [nome-da-pasta-extraida] clinicaconexaomental

cd clinicaconexaomental
```

### 3. Restaurar configurações:
```bash
# Copiar .env do backup
cp ../env-backup-$(date +%Y%m%d) .env

# Verificar se .env foi copiado
cat .env | head -5
```

## 📦 INSTALAR E CONFIGURAR

### 1. Instalar dependências:
```bash
npm install
```

### 2. Verificar se attached_assets existe:
```bash
ls -la attached_assets/
# Deve mostrar as imagens, incluindo "Header de login (3)_1752464376695.png"
```

### 3. Fazer build:
```bash
npm run build
```

### 4. Verificar se build funcionou:
```bash
ls -la dist/
ls -la dist/public/
# Deve mostrar arquivos HTML, CSS, JS e assets
```

## 🔧 CONFIGURAR BANCO DE DADOS

### Se necessário, fazer push do schema:
```bash
npm run db:push
```

## 🚀 INICIAR SERVIDOR ATUALIZADO

### Opção A - PM2:
```bash
pm2 start ecosystem.config.js
# ou se não tem ecosystem.config.js:
pm2 start "npm start" --name "conexaomental"
pm2 save
```

### Opção B - SystemD:
```bash
sudo systemctl start conexaomental
sudo systemctl status conexaomental
```

### Opção C - Teste manual primeiro:
```bash
npm start
# Se funcionar, parar com Ctrl+C e usar PM2 ou SystemD
```

## 🌐 REINICIAR NGINX (se usar)

```bash
sudo nginx -t  # Testar configuração
sudo systemctl reload nginx
```

## ✅ VERIFICAÇÃO FINAL

### 1. Testar site:
```bash
curl -I https://clinicaconexaomental.online/
# Deve retornar 200 OK
```

### 2. Verificar logs:
```bash
# PM2:
pm2 logs

# SystemD:
sudo journalctl -u conexaomental -f

# Manual:
tail -f logs/app.log  # se tiver arquivo de log
```

### 3. Testar funcionalidades:
- Abrir https://clinicaconexaomental.online/
- Verificar se tem seção de Planos (4 cards)
- Verificar seção "O que você procura tratar?"
- Verificar FAQ no final da página
- Testar login profissional: terapeutawelder@gmail.com / 123456

## 🆘 EM CASO DE ERRO

### Voltar para versão anterior:
```bash
# Parar servidor atual
pm2 stop all  # ou sudo systemctl stop conexaomental

# Restaurar backup
rm -rf clinicaconexaomental
mv clinicaconexaomental-backup-$(date +%Y%m%d) clinicaconexaomental
cd clinicaconexaomental

# Iniciar versão anterior
pm2 start "npm start" --name "conexaomental"
```

### Verificar logs de erro:
```bash
# Ver últimos erros
npm run build 2>&1 | tee build-errors.log
cat build-errors.log

# Ver logs do servidor
pm2 logs --lines 50
```

## 📞 SUPORTE

Se algum passo falhar, anote:
1. Qual comando deu erro
2. Mensagem de erro completa
3. Resultado do comando `npm --version` e `node --version`

## 🎯 RESULTADO ESPERADO

Após a atualização, o site deve ter:
- ✅ Seção de Planos com 4 opções de preço
- ✅ Seção "O que você procura tratar?" com 12 tipos
- ✅ FAQ completo no final da página
- ✅ Profissionais carregados do banco de dados real
- ✅ Design atualizado com cores padronizadas
- ✅ Todas as funcionalidades anteriores mantidas

**Tempo estimado: 15-30 minutos**