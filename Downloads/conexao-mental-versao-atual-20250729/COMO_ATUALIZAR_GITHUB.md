# 📋 COMO ATUALIZAR O GITHUB - PASSO A PASSO

## 🔍 ONDE ENCONTRAR O TERMINAL NO REPLIT:

### Opção 1: Aba Shell
1. **Olhe na parte inferior da tela do Replit**
2. **Você verá várias abas**: Console, Shell, etc.
3. **Clique na aba "Shell"** 
4. **Essa é o terminal onde você vai digitar os comandos**

### Opção 2: Menu Tools
1. **No menu superior**, clique em "Tools"
2. **Selecione "Shell"**
3. **O terminal vai abrir na parte inferior**

## 💻 COMANDOS PARA COPIAR E COLAR:

### 1º Comando - Corrigir problema do Git:
```bash
rm -f .git/index.lock
```

### 2º Comando - Adicionar arquivos:
```bash
git add README.md .gitignore GITHUB_UPDATE_COMMANDS.md replit.md
```

### 3º Comando - Fazer commit:
```bash
git commit -m "Sistema Mercado Pago funcional - Pagamento PIX e Cartão integrados"
```

### 4º Comando - Enviar para GitHub:
```bash
git push origin main
```

## 🔑 SE PEDIR SENHA/LOGIN:

### Usuário: 
```
Terapeutawelder
```

### Senha: 
**NÃO use sua senha normal do GitHub!**
Use um **Personal Access Token**:

1. **Abra uma nova aba** e vá para: https://github.com/settings/tokens
2. **Clique em "Generate new token"**
3. **Marque a opção "repo"** (para acesso ao repositório)
4. **Copie o token gerado** (ex: ghp_xxxxxxxxxxxx)
5. **Use esse token como senha** no terminal

## 📍 SEU REPOSITÓRIO:
https://github.com/Terapeutawelder/mental-connect-schedule-56

## ⚠️ IMPORTANTE:
- **Cole um comando por vez** no terminal
- **Pressione ENTER** após cada comando
- **Aguarde** cada comando terminar antes do próximo
- **Se der erro**, me avise qual foi a mensagem

## ✅ RESULTADO ESPERADO:
Após executar todos os comandos, seu código estará atualizado no GitHub com:
- Sistema de pagamento Mercado Pago funcional
- Documentação completa
- Todas as melhorias recentes