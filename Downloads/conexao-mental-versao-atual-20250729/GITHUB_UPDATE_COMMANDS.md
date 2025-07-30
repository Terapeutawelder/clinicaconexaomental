# Comandos para Atualizar o GitHub

Execute os seguintes comandos no terminal do Replit para atualizar o repositório GitHub:

## 1. Corrigir problema do Git lock
```bash
rm -f .git/index.lock
```

## 2. Adicionar os novos arquivos
```bash
git add README.md .gitignore
```

## 3. Fazer commit das mudanças
```bash
git commit -m "Integração completa Mercado Pago com SDK nativo

✅ Implementação do SDK global do Mercado Pago
✅ Brick de pagamento com cartão em português
✅ PIX funcionando com QR codes
✅ Credenciais de teste integradas
✅ Correção de loops infinitos de requisições
✅ Sistema de pagamento totalmente funcional
✅ README.md completo com documentação
✅ .gitignore atualizado para produção"
```

## 4. Fazer push para GitHub
```bash
git push origin main
```

## Observações:
- Se pedir autenticação, você pode precisar configurar um token do GitHub
- O repositório atual está em: https://github.com/Terapeutawelder/mental-connect-schedule-56
- Já existem 207 commits locais prontos para serem enviados

## Caso precise configurar token do GitHub:
1. Vá em GitHub → Settings → Developer settings → Personal access tokens
2. Gere um token com permissões de repositório
3. Use o token como senha quando solicitar autenticação

## Status atual:
- Branch: main
- Commits ahead: 207
- Arquivos novos: README.md
- Arquivos modificados: .gitignore