#!/bin/bash
# Script de instalação do Supabase auto-hospedado
# Para a VPS Digital Ocean: 209.97.155.223
# Subdomínio: db.conexaomental.online

set -e

echo "=== FASE 1: Instalando Docker ==="
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo "Docker instalado com sucesso!"
else
    echo "Docker já está instalado: $(docker --version)"
fi

echo ""
echo "=== FASE 2: Clonando repositório Supabase ==="
if [ -d "/opt/supabase" ]; then
    echo "Supabase já clonado. Atualizando..."
    cd /opt/supabase && git pull
else
    git clone --depth 1 https://github.com/supabase/supabase /opt/supabase
fi

cd /opt/supabase/docker
cp .env.example .env 2>/dev/null || true

echo ""
echo "=== FASE 3: Gerando senhas e chaves seguras ==="

# Gera senha Postgres
POSTGRES_PASS=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 24)

# Gera JWT Secret
JWT_SECRET=$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 40)

# Gera ANON_KEY (JWT RS256 simplificado - será gerado pelo Supabase)
DASHBOARD_PASS=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 16)

echo ""
echo "=== FASE 4: Configurando .env ==="
sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${POSTGRES_PASS}|" .env
sed -i "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" .env
sed -i "s|DASHBOARD_PASSWORD=.*|DASHBOARD_PASSWORD=${DASHBOARD_PASS}|" .env
sed -i "s|SITE_URL=.*|SITE_URL=https://db.conexaomental.online|" .env
sed -i "s|API_EXTERNAL_URL=.*|API_EXTERNAL_URL=https://db.conexaomental.online|" .env
sed -i "s|SUPABASE_PUBLIC_URL=.*|SUPABASE_PUBLIC_URL=https://db.conexaomental.online|" .env

echo "Credenciais geradas:"
echo "POSTGRES_PASSWORD: ${POSTGRES_PASS}"
echo "JWT_SECRET: ${JWT_SECRET}"
echo "DASHBOARD_PASSWORD: ${DASHBOARD_PASS}"
echo ""
echo "SALVE ESSAS CREDENCIAIS AGORA!"
echo ""

echo "=== FASE 5: Iniciando serviços Supabase ==="
docker compose pull
docker compose up -d

echo ""
echo "=== STATUS DOS CONTAINERS ==="
docker compose ps

echo ""
echo "=== FASE 6: Instalando Nginx ==="
apt-get update -q
apt-get install -y nginx certbot python3-certbot-nginx

echo ""
echo "=== FASE 7: Configurando Nginx Reverse Proxy ==="
cat > /etc/nginx/sites-available/supabase << 'EOF'
server {
    listen 80;
    server_name db.conexaomental.online;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 600;
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
    }
}
EOF

ln -sf /etc/nginx/sites-available/supabase /etc/nginx/sites-enabled/supabase
nginx -t && systemctl reload nginx

echo ""
echo "=== FASE 8: Configurando SSL (HTTPS) ==="
echo "Aguardando DNS propagar para obter certificado SSL..."
certbot --nginx -d db.conexaomental.online --non-interactive --agree-tos -m contato@conexaomental.online

echo ""
echo "=== INSTALAÇÃO CONCLUÍDA ==="
echo "Supabase Studio: https://db.conexaomental.online"
echo "API URL: https://db.conexaomental.online"
echo ""
echo "Próximo passo: acesse o Studio e rode a migration SQL!"
