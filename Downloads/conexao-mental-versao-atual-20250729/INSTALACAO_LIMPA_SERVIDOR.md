# Instalação Limpa - Conexão Mental

## Passos para Instalação Completa

### 1. Remover instalação atual
```bash
sudo rm -rf /var/www/conexaomental
sudo rm -rf /var/www/clinicaconexaomental*
pm2 delete all
```

### 2. Baixar código atualizado
```bash
cd /var/www
sudo git clone https://github.com/SEU_USUARIO/conexao-mental.git conexaomental
sudo chown -R $USER:$USER /var/www/conexaomental
cd /var/www/conexaomental
```

### 3. Instalar dependências
```bash
npm install
```

### 4. Configurar ambiente
```bash
cp .env.example .env
nano .env
```

Adicionar:
```
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE
NODE_ENV=production
PORT=5000
```

### 5. Build do projeto
```bash
npm run build
```

### 6. Configurar Nginx
```bash
sudo nano /etc/nginx/sites-available/conexaomental
```

Conteúdo:
```nginx
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
```

### 7. Ativar site
```bash
sudo ln -s /etc/nginx/sites-available/conexaomental /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Iniciar aplicação
```bash
pm2 start npm --name "conexaomental" -- start
pm2 startup
pm2 save
```

### 9. Verificar funcionamento
```bash
curl http://localhost:5000
curl https://clinicaconexaomental.online
```

## Teste das Funcionalidades

Depois da instalação, verificar se aparecem:
- ✅ Seção de Planos (4 cards com preços)
- ✅ FAQ (perguntas frequentes)  
- ✅ "O que você procura tratar?" (12 tratamentos)
- ✅ Login/cadastro funcionando
- ✅ Dashboard administrativo
- ✅ Sistema de agendamento

## Arquivos Necessários

O projeto deve conter:
- `server/index.ts` - Servidor Express
- `client/` - Frontend React 
- `shared/` - Tipos compartilhados
- `package.json` - Dependências
- `.env` - Variáveis de ambiente
- `dist/` - Build de produção