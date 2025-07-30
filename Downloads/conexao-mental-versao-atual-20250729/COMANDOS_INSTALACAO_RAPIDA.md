# Comandos para Instalação Rápida

Execute estes comandos no seu servidor para instalação completa:

## 1. Download do script de instalação

```bash
cd ~
wget https://raw.githubusercontent.com/SEU_REPO/conexao-mental/main/SERVIDOR_SCRIPT_INSTALACAO.sh
chmod +x SERVIDOR_SCRIPT_INSTALACAO.sh
```

## 2. Executar instalação automática

```bash
sudo ./SERVIDOR_SCRIPT_INSTALACAO.sh
```

## 3. OU instalação manual passo a passo:

### Limpeza
```bash
sudo rm -rf /var/www/conexaomental /var/www/clinicaconexaomental*
pm2 delete all
```

### Download direto do Replit
```bash
cd /var/www
sudo mkdir conexaomental
cd conexaomental
sudo wget URL_DO_SEU_ARQUIVO_TAR_GZ -O projeto.tar.gz
sudo tar -xzf projeto.tar.gz
sudo chown -R $USER:$USER .
```

### Instalação
```bash
npm install
cp .env.example .env
nano .env  # Configure DATABASE_URL e chaves do Mercado Pago
npm run build
```

### Nginx
```bash
sudo tee /etc/nginx/sites-available/conexaomental > /dev/null <<'EOF'
server {
    listen 80;
    server_name clinicaconexaomental.online www.clinicaconexaomental.online;
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

sudo rm /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/conexaomental /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

### Iniciar
```bash
pm2 start npm --name "conexaomental" -- start
pm2 startup
pm2 save
```

### Testar
```bash
curl http://localhost:5000
curl https://clinicaconexaomental.online
pm2 logs conexaomental
```

## 4. Verificações após instalação

- ✅ Site carrega: `https://clinicaconexaomental.online`
- ✅ Seções aparecem: Planos, FAQ, "O que você procura tratar?"
- ✅ Login funciona: `/login-paciente`, `/login-profissional`, `/login-admin`
- ✅ Dashboard admin: `/admin` (admin@test.com / 123456)
- ✅ APIs funcionam: `/api/professionals`, `/api/v1/status`

## 5. Logs para debug

```bash
pm2 logs conexaomental --lines 50
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 6. Comandos úteis pós-instalação

```bash
pm2 restart conexaomental    # Reiniciar app
pm2 stop conexaomental       # Parar app  
pm2 delete conexaomental     # Remover app
npm run build                # Rebuild frontend
sudo systemctl reload nginx  # Recarregar Nginx
```