# Instalação do XAMPP - Passo a Passo

## 📥 Passo 1: Download do XAMPP

1. Abra seu navegador
2. Acesse: https://www.apachefriends.org/download.html
3. Baixe a versão **XAMPP para Windows** (versão mais recente)
4. Aguarde o download completar (aproximadamente 150 MB)

## 🔧 Passo 2: Instalação

1. **Execute o instalador** que você baixou
2. Se aparecer um aviso do Windows Defender, clique em **"Mais informações"** → **"Executar assim mesmo"**
3. Na tela de boas-vindas, clique em **"Next"**
4. **Selecione os componentes**:
   - ✅ Apache
   - ✅ MySQL
   - ✅ PHP
   - ✅ phpMyAdmin
   - ❌ Desmarque os outros (não são necessários)
5. Clique em **"Next"**
6. **Pasta de instalação**: deixe o padrão `C:\xampp` → **"Next"**
7. Desmarque "Learn more about Bitnami" → **"Next"**
8. Clique em **"Next"** para iniciar a instalação
9. Aguarde a instalação (pode levar alguns minutos)
10. Quando terminar, **marque** "Do you want to start the Control Panel now?" → **"Finish"**

## ▶️ Passo 3: Iniciar os Serviços

O **XAMPP Control Panel** deve abrir automaticamente. Se não abrir:
- Vá em `C:\xampp` e execute `xampp-control.exe`

No Control Panel:
1. Clique no botão **"Start"** ao lado de **Apache**
   - Aguarde até ficar com fundo verde
   - Se aparecer um erro de porta 80 ocupada, clique em **"Config"** → **"Apache (httpd.conf)"** e mude a porta para 8080
2. Clique no botão **"Start"** ao lado de **MySQL**
   - Aguarde até ficar com fundo verde

✅ **Pronto!** Ambos devem estar com fundo verde agora.

## 🗄️ Passo 4: Configurar o Banco de Dados

### Opção A: Via Script Automático (Mais Fácil)

1. Abra o **PowerShell** (não precisa ser como administrador)
2. Cole este comando e pressione Enter:
```powershell
cd "C:\Users\Welder de Aquino\.gemini\antigravity\scratch\AcolheAqui\public\checkout-system"
```
3. Agora execute o script:
```powershell
.\setup_database.bat
```
4. Aguarde a mensagem de sucesso!

### Opção B: Via phpMyAdmin (Manual)

1. Abra seu navegador
2. Acesse: http://localhost/phpmyadmin
3. No menu lateral esquerdo, clique em **"Novo"** (ou "New")
4. Em "Nome do banco de dados", digite: `acolheaqui_checkout`
5. Em "Agrupamento", selecione: `utf8mb4_general_ci`
6. Clique em **"Criar"**
7. Clique no banco `acolheaqui_checkout` que acabou de criar
8. Clique na aba **"Importar"** (ou "Import")
9. Clique em **"Escolher arquivo"**
10. Navegue até: `C:\Users\Welder de Aquino\.gemini\antigravity\scratch\AcolheAqui\public\checkout-system\banco de dados.sql`
11. Clique em **"Executar"** (ou "Go") no final da página
12. Aguarde a mensagem de sucesso!

## ✅ Passo 5: Testar

1. Acesse http://localhost:8081/dashboard no seu navegador
2. Faça login (ou crie uma conta se ainda não tiver)
3. Clique em **"Checkout Personalizado"** no menu lateral
4. Deve carregar a interface completa da Starfy! 🎉

## 🚨 Problemas?

### Apache não inicia (porta 80 ocupada)
**Solução:**
1. No XAMPP Control Panel, clique em **"Config"** ao lado de Apache
2. Selecione **"Apache (httpd.conf)"**
3. Procure por `Listen 80` e mude para `Listen 8080`
4. Salve e feche
5. Tente iniciar o Apache novamente

### MySQL não inicia (porta 3306 ocupada)
**Solução:**
1. Verifique se você já tem outro MySQL rodando
2. Abra o Gerenciador de Tarefas (Ctrl+Shift+Esc)
3. Procure por "mysqld" e finalize o processo
4. Tente iniciar o MySQL no XAMPP novamente

### Erro ao importar banco de dados
**Solução:**
1. Certifique-se de que o MySQL está rodando (verde no XAMPP)
2. Tente a Opção A (script automático) se usou a Opção B
3. Ou vice-versa

---

**Dica:** Mantenha o XAMPP Control Panel aberto enquanto estiver desenvolvendo. Você precisará do Apache e MySQL rodando sempre que for usar o checkout.
