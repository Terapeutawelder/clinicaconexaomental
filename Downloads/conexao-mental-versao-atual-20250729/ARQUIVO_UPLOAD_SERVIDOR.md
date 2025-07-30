# Como Fazer Upload dos Arquivos para o Servidor

## Opção 1: Upload direto via Replit (Recomendado)

### Baixar arquivo do Replit
1. No Replit, abra o terminal
2. Execute: `tar -czf conexao-mental-completo.tar.gz --exclude=node_modules --exclude=.git client server shared *.json *.ts *.js *.md .env.example components.json drizzle.config.ts postcss.config.js tailwind.config.ts vite.config.ts`
3. Baixe o arquivo `conexao-mental-completo.tar.gz`

### Upload para o servidor
```bash
# No seu servidor
cd /var/www
sudo rm -rf conexaomental clinicaconexaomental*
pm2 delete all

# Upload do arquivo (use SCP, SFTP ou painel do hosting)
# wget URL_DO_ARQUIVO ou scp local:arquivo.tar.gz root@servidor:/var/www/

# Extrair
sudo tar -xzf conexao-mental-completo.tar.gz
sudo mv conexao-mental-* conexaomental  # se necessário
cd conexaomental
sudo chown -R $USER:$USER .
```

## Opção 2: Via GitHub

### Push para GitHub
```bash
# No Replit
git add .
git commit -m "Versão completa e funcional"
git push origin main
```

### Clone no servidor
```bash
# No servidor
cd /var/www
sudo rm -rf conexaomental
sudo git clone https://github.com/SEU_USUARIO/SEU_REPO.git conexaomental
cd conexaomental
sudo chown -R $USER:$USER .
```

## Após upload - Comandos de instalação

```bash
# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
nano .env
# Adicione:
# DATABASE_URL=sua_url_do_banco
# MERCADO_PAGO_ACCESS_TOKEN=sua_chave
# MERCADO_PAGO_PUBLIC_KEY=sua_chave_publica

# Build
npm run build

# Configurar Nginx
sudo tee /etc/nginx/sites-available/conexaomental > /dev/null <<'EOF'
server {
    listen 80;
    server_name clinicaconexaomental.online www.clinicaconexaomental.online;
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/conexaomental /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Iniciar aplicação
pm2 start npm --name "conexaomental" -- start
pm2 startup
pm2 save

# Testar
curl http://localhost:5000
curl https://clinicaconexaomental.online
```

## Verificações finais

```bash
pm2 status
pm2 logs conexaomental --lines 20
curl -s https://clinicaconexaomental.online | grep -i "planos\|faq"
```

Deve retornar conteúdo das seções de Planos e FAQ se estiver funcionando corretamente.

## Credenciais de teste

- **Admin**: admin@test.com / 123456
- **Profissional**: terapeutawelder@gmail.com / 123456
- **Dashboard Admin**: https://clinicaconexaomental.online/admin