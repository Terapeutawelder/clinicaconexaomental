# 🔍 COMANDOS PARA LOCALIZAR E ATUALIZAR O PROJETO

## 1. ENCONTRAR O PROJETO ATUAL:

```bash
find / -name "package.json" -type f 2>/dev/null | grep -v node_modules | head -10
```

OU:

```bash
find /home -name "clinicaconexaomental" -type d 2>/dev/null
find /var -name "clinicaconexaomental" -type d 2>/dev/null
find /opt -name "clinicaconexaomental" -type d 2>/dev/null
```

## 2. VERIFICAR ONDE O PM2 ESTÁ EXECUTANDO:

```bash
pm2 list
pm2 show conexaomental
```

## 3. DEPOIS DE ENCONTRAR O CAMINHO CORRETO:

Se o projeto estiver em `/home/usuario/clinicaconexaomental`:
```bash
cd /home/usuario/clinicaconexaomental
```

Se estiver em `/opt/clinicaconexaomental`:
```bash
cd /opt/clinicaconexaomental
```

## 4. COMANDOS APÓS ENCONTRAR O DIRETÓRIO:

```bash
# Fazer backup do .env
cp .env ~/.env-backup

# Atualizar código
git pull origin main

# Se der erro, resetar
git reset --hard origin/main

# Restaurar .env
cp ~/.env-backup .env

# Instalar e buildar
npm install
npm run build

# Reiniciar PM2
pm2 restart conexaomental
```