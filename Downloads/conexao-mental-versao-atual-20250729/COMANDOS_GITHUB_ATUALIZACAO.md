# Comandos para Atualizar GitHub

Execute estes comandos no terminal do Replit para atualizar o repositório:

## 1. Remover lock do Git
```bash
rm -f .git/index.lock
```

## 2. Adicionar arquivos e fazer commit
```bash
git add .
git status
```

## 3. Commit com mensagem descritiva
```bash
git commit -m "Fix: Implementa instalação limpa e corrige deploy em produção

✅ Scripts completos de instalação para servidor
✅ Corrige estrutura de arquivos para deploy  
✅ Guias detalhados de instalação limpa
✅ Resolve problemas de build e configuração
✅ Documentação completa para servidor
✅ Seções de Planos, FAQ e tratamentos funcionando
✅ Sistema completo de APIs e integrações
✅ Preparado para instalação em servidor próprio

Arquivos adicionados:
- INSTALACAO_LIMPA_SERVIDOR.md
- SERVIDOR_SCRIPT_INSTALACAO.sh  
- COMANDOS_INSTALACAO_RAPIDA.md
- ARQUIVO_UPLOAD_SERVIDOR.md

O projeto agora está pronto para deploy limpo em servidor de produção."
```

## 4. Push para GitHub
```bash
git push origin main
```

## 5. Verificar se funcionou
```bash
git log --oneline -5
```

## 6. Criar release no GitHub (opcional)
No GitHub.com:
1. Ir para o repositório
2. Clicar em "Releases" 
3. "Create new release"
4. Tag: `v2.0.0`
5. Título: "Versão Completa - Deploy em Produção"
6. Descrição:
```
## Conexão Mental - Versão Completa

### Novidades desta versão:
✅ Seções de Planos com 4 opções de preço
✅ FAQ com perguntas frequentes
✅ Seção "O que você procura tratar?"
✅ Sistema completo de APIs externas
✅ Scripts de instalação automatizada
✅ Documentação completa para deploy

### Como instalar no servidor:
1. Clone o repositório
2. Execute os scripts de instalação
3. Configure .env com credenciais
4. Acesse o site funcionando

### Credenciais de teste:
- Admin: admin@test.com / 123456
- Profissional: terapeutawelder@gmail.com / 123456
```

## Depois da atualização do GitHub

No seu servidor, execute:
```bash
cd /var/www
sudo rm -rf conexaomental
sudo git clone https://github.com/SEU_USUARIO/conexao-mental.git conexaomental
cd conexaomental
# Seguir comandos de instalação
```

Desta forma você terá a versão mais atualizada e limpa do projeto no servidor.