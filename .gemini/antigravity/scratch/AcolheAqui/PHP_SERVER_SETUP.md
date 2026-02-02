# Configuração do Servidor PHP para o Checkout Personalizado

## Problema Identificado

O sistema de **Checkout Personalizado** é desenvolvido em PHP e não pode ser executado diretamente pelo Vite (servidor de desenvolvimento React). Quando você acessa a página no dashboard, o navegador exibe o código PHP bruto ao invés de executá-lo.

## Solução: Servidor PHP Separado

Você precisa rodar um servidor PHP em paralelo ao Vite para que os arquivos PHP sejam processados corretamente.

### Opção 1: Usando PHP Built-in Server (Desenvolvimento Local)

1. **Abra um novo terminal** (mantenha o `npm run dev` rodando no terminal atual)

2. **Navegue até a pasta do checkout:**
   ```powershell
   cd "C:\Users\Welder de Aquino\.gemini\antigravity\scratch\AcolheAqui\public\checkout-system"
   ```

3. **Inicie o servidor PHP na porta 8000:**
   ```powershell
   php -S localhost:8000
   ```

4. **Atualize o `CustomCheckoutManager.tsx`** para apontar para o servidor PHP:
   - Abra: `src/components/dashboard/CustomCheckoutManager.tsx`
   - Mude a linha do `bridgeUrl` para:
     ```typescript
     const bridgeUrl = `http://localhost:8000/login_bridge.php?email=${encodeURIComponent(userEmail)}&token=acolheaqui_secret_123`;
     ```

5. **Acesse o dashboard** em `http://localhost:8081/dashboard` e clique em "Checkout Personalizado"

### Opção 2: Usando XAMPP/WAMP (Recomendado para Produção Local)

1. **Instale o XAMPP** (https://www.apachefriends.org/)

2. **Copie a pasta `checkout-system`** para:
   ```
   C:\xampp\htdocs\checkout-system
   ```

3. **Configure o banco de dados** em `config.php`:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_USER', 'root');
   define('DB_PASS', '');
   define('DB_NAME', 'acolheaqui_checkout');
   ```

4. **Importe o banco de dados:**
   - Acesse `http://localhost/phpmyadmin`
   - Crie um banco chamado `acolheaqui_checkout`
   - Importe o arquivo `banco de dados.sql`

5. **Atualize o `CustomCheckoutManager.tsx`:**
   ```typescript
   const bridgeUrl = `http://localhost/checkout-system/login_bridge.php?email=${encodeURIComponent(userEmail)}&token=acolheaqui_secret_123`;
   ```

## Próximos Passos para Produção

Quando você for fazer o deploy em produção (Hostinger, por exemplo):

1. Faça upload da pasta `public/checkout-system` para o servidor
2. Configure as credenciais do banco de dados em `config.php`
3. Atualize o `CustomCheckoutManager.tsx` com a URL de produção:
   ```typescript
   const bridgeUrl = `https://seudominio.com.br/checkout-system/login_bridge.php?email=${encodeURIComponent(userEmail)}&token=acolheaqui_secret_123`;
   ```

## Segurança

> **IMPORTANTE**: O token `acolheaqui_secret_123` é apenas para desenvolvimento. Em produção, você deve:
> - Usar variáveis de ambiente
> - Implementar JWT (JSON Web Tokens)
> - Validar a origem das requisições

---

**Resumo**: O checkout PHP precisa rodar em um servidor PHP separado (porta 8000 ou via XAMPP) enquanto o React roda no Vite (porta 8081).
