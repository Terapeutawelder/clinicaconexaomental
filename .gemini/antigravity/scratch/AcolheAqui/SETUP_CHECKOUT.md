# Guia Completo: Configuração do Sistema de Checkout

## 🎯 Objetivo
Fazer o sistema completo de checkout (interface Starfy) funcionar dentro do dashboard AcolheAqui.

## 📋 Pré-requisitos

### 1. Instalar XAMPP
- Download: https://www.apachefriends.org/download.html
- Instale na pasta padrão: `C:\xampp`
- Durante a instalação, marque: **Apache** e **MySQL**

### 2. Iniciar Serviços
1. Abra o **XAMPP Control Panel**
2. Clique em **Start** no Apache
3. Clique em **Start** no MySQL
4. Aguarde até ambos ficarem com fundo verde

## 🔧 Configuração do Banco de Dados

### Opção 1: Script Automático (Recomendado)

1. Abra o PowerShell como Administrador
2. Navegue até a pasta do checkout:
   ```powershell
   cd "C:\Users\Welder de Aquino\.gemini\antigravity\scratch\AcolheAqui\public\checkout-system"
   ```
3. Execute o script de configuração:
   ```powershell
   .\setup_database.bat
   ```

### Opção 2: Manual via phpMyAdmin

1. Abra o navegador em: http://localhost/phpmyadmin
2. Clique em **Novo** (New) na barra lateral
3. Nome do banco: `acolheaqui_checkout`
4. Codificação: `utf8mb4_general_ci`
5. Clique em **Criar**
6. Selecione o banco criado
7. Clique na aba **Importar** (Import)
8. Escolha o arquivo: `banco de dados.sql`
9. Clique em **Executar** (Go)

## ✅ Verificação

### Teste a Conexão
1. Abra: http://localhost:8000/config.php
2. Se não aparecer erro, está funcionando!

### Teste o Login
1. Acesse: http://localhost:8081/dashboard
2. Clique em "Checkout Personalizado"
3. Deve carregar a interface completa da Starfy

## 🔐 Credenciais Padrão

**Banco de Dados:**
- Host: `localhost`
- Usuário: `root`
- Senha: *(vazio)*
- Banco: `acolheaqui_checkout`

**Admin do Sistema:**
- Email: `admin@gmail.com`
- Senha: `admin123`

## 🚨 Problemas Comuns

### "Erro de Conexão com o Banco de Dados"
**Solução:**
1. Verifique se o MySQL está rodando no XAMPP
2. Confirme que o banco `acolheaqui_checkout` existe
3. Verifique as credenciais em `config.php`

### "Página em Branco"
**Solução:**
1. Verifique os logs do PHP em: `C:\xampp\apache\logs\error.log`
2. Certifique-se de que o servidor PHP está rodando na porta 8000

### "Access Denied for user 'root'"
**Solução:**
Se você definiu uma senha para o MySQL:
1. Edite `config.php`
2. Altere a linha: `define('DB_PASS', 'SUA_SENHA_AQUI');`

## 📁 Estrutura de Arquivos

```
public/checkout-system/
├── config.php              # Configurações do banco
├── login_bridge.php        # Ponte de autenticação
├── index.php              # Dashboard principal
├── dashboard.php          # Conteúdo do dashboard
├── produtos.php           # Gestão de produtos
├── vendas.php             # Relatório de vendas
├── banco de dados.sql     # Estrutura do banco
└── setup_database.bat     # Script de instalação
```

## 🎨 Funcionalidades Disponíveis

Após a configuração, você terá acesso a:
- ✅ Editor visual de checkout
- ✅ Gestão de produtos
- ✅ Relatórios de vendas
- ✅ Integrações de pagamento
- ✅ Área de membros
- ✅ Tracking de conversões
- ✅ Webhooks e notificações

---

**Dúvidas?** Verifique se todos os serviços estão rodando:
- React (porta 8081): ✅
- PHP (porta 8000): ✅
- MySQL (porta 3306): ✅
