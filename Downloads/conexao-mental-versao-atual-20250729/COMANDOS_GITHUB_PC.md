# Como Atualizar GitHub pelo CMD do PC

## 1. Baixar arquivos do Replit

### Opção A: Download direto
1. No Replit, clique nos 3 pontinhos (⋮) ao lado de qualquer arquivo
2. Escolha "Download as zip" 
3. Ou use o menu Files > Download as zip

### Opção B: Criar arquivo compactado
No terminal do Replit execute:
```bash
tar -czf conexao-mental-completo.tar.gz --exclude=node_modules --exclude=.git --exclude=dist client server shared *.json *.ts *.js *.md .env.example components.json drizzle.config.ts postcss.config.js tailwind.config.ts vite.config.ts
```
Depois baixe o arquivo `conexao-mental-completo.tar.gz`

## 2. No seu PC - Preparar pasta

1. **Abra o CMD** (Windows + R > digite "cmd" > Enter)
2. **Navegue para onde quer salvar:**
   ```cmd
   cd C:\Users\SeuNome\Desktop
   mkdir conexao-mental
   cd conexao-mental
   ```

3. **Extraia os arquivos baixados** na pasta conexao-mental

## 3. Configurar Git no PC

```cmd
git init
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
```

## 4. Adicionar e enviar arquivos

```cmd
git add .
git commit -m "Fix: Implementa instalacao limpa e corrige deploy em producao

- Scripts completos de instalacao para servidor
- Corrige estrutura de arquivos para deploy  
- Guias detalhados de instalacao limpa
- Resolve problemas de build e configuracao
- Documentacao completa para servidor
- Secoes de Planos, FAQ e tratamentos funcionando
- Sistema completo de APIs e integracoes
- Preparado para instalacao em servidor proprio"

git push -u origin main
```

## 5. Se pedir login do GitHub

O Git pode pedir suas credenciais:
- **Username**: seu usuário do GitHub
- **Password**: use um Personal Access Token (não a senha normal)

### Como criar Personal Access Token:
1. GitHub.com > Settings > Developer settings > Personal access tokens
2. Generate new token (classic)
3. Marque: repo, workflow, write:packages
4. Use esse token como senha

## 6. Verificar se funcionou

```cmd
git log --oneline -3
```

Deve mostrar seu commit mais recente.

## 7. Para futuras atualizações

Quando quiser atualizar novamente:
```cmd
cd C:\Users\SeuNome\Desktop\conexao-mental
git add .
git commit -m "Nova atualizacao"
git push origin main
```

## Problemas comuns:

### Se der erro de autenticação:
```cmd
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

### Se der erro de "repository already exists":
```cmd
git pull origin main
git push origin main
```

### Se quiser forçar o push:
```cmd
git push -f origin main
```

Depois que atualizar o GitHub pelo PC, no servidor você pode fazer:
```bash
cd /var/www
sudo git clone https://github.com/SEU_USUARIO/conexao-mental.git conexaomental
```