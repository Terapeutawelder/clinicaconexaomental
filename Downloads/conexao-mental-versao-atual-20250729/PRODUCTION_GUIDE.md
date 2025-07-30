# 📋 GUIA DE PRODUÇÃO - SERVIDOR PRÓPRIO

## 🎯 REQUISITOS DO SERVIDOR:

### **Mínimo necessário:**
- **Linux** (Ubuntu 20.04+ recomendado)
- **Node.js 18+**
- **PostgreSQL 14+**
- **2GB RAM** (mínimo)
- **20GB storage**
- **HTTPS/SSL** (Let's Encrypt)

### **Dependências do sistema:**
```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx postgresql postgresql-contrib
```

## 🚀 **PROCESSO DE INSTALAÇÃO:**

### **1. Clone e configure:**
```bash
git clone https://github.com/Terapeutawelder/mental-connect-schedule-56.git
cd mental-connect-schedule-56
npm install
```

### **2. Configure PostgreSQL:**
```bash
sudo -u postgres createdb conexao_mental
sudo -u postgres createuser seu_usuario --pwprompt
```

### **3. Configure .env:**
```bash
DATABASE_URL=postgresql://usuario:senha@localhost:5432/conexao_mental
MERCADO_PAGO_ACCESS_TOKEN=seu_token_producao
MERCADO_PAGO_PUBLIC_KEY=sua_chave_publica
SESSION_SECRET=chave_super_secreta_64_caracteres
NODE_ENV=production
PORT=5000
```

### **4. Build e deploy:**
```bash
npm run build
npm run db:push

# PM2 para manter rodando
npm install -g pm2
pm2 start dist/index.js --name "conexao-mental"
pm2 startup
pm2 save
```

### **5. Configure Nginx:**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **6. SSL com Let's Encrypt:**
```bash
sudo certbot --nginx -d seu-dominio.com
```

## 🔒 **SEGURANÇA:**
- Firewall configurado (portas 22, 80, 443)
- Backup automático do banco
- Logs monitorados
- Updates automáticos

## ✅ **MONITORAMENTO:**
```bash
pm2 status
pm2 logs
pm2 restart conexao-mental
```

**Sistema pronto para receber pacientes!**