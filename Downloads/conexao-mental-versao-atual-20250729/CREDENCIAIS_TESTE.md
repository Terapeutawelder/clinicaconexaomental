# Credenciais para Teste da Plataforma Conexão Mental

## Sistema de Login Funcionando ✅

### ADMINISTRADOR
- **Email:** admin@conexaomental.com
- **Senha:** Admin@2025
- **Papel:** Administrador do sistema
- **Área:** /admin e /admin/professionals

### PROFISSIONAL 1
- **Email:** joao.silva@test.com
- **Senha:** 123456
- **Papel:** Profissional (Aprovado)
- **Área:** /agenda-profissional

### PROFISSIONAL 2
- **Email:** terapeutawelder@gmail.com
- **Senha:** 123456
- **Papel:** Profissional (Aprovado)
- **Área:** /agenda-profissional

### PACIENTE
- **Email:** test@example.com
- **Senha:** 123456
- **Papel:** Paciente
- **Área:** Área do paciente

## Problemas Identificados e Corrigidos

1. **Profissional sem registro completo**: O usuário `terapeutawelder@gmail.com` estava na tabela `users` mas não na tabela `professionals`. Foi corrigido criando o registro profissional.

2. **Senhas incorretas**: Algumas senhas estavam com hash incorreto. Foram resetadas para `123456` em todos os casos de teste.

3. **Sistema de aprovação**: Todos os profissionais foram aprovados para permitir acesso às áreas protegidas.

## Como Usar

1. Acesse a página de login correspondente ao seu papel
2. Use as credenciais acima
3. Será redirecionado para a área apropriada

## Funcionalidades Testadas

- ✅ Login de administrador
- ✅ Login de profissional aprovado
- ✅ Login de paciente
- ✅ Sistema de aprovação profissional
- ✅ Autenticação com JWT
- ✅ Proteção de rotas por papel
- ✅ Botão Google desabilitado temporariamente
- ✅ **Redirecionamento automático baseado no papel do usuário**

## Redirecionamento Automático

Após o login bem-sucedido, o sistema agora redireciona automaticamente para:

- **Administrador** → `/admin` (Painel administrativo)
- **Profissional** → `/agenda-profissional` (Agenda profissional)
- **Paciente** → `/` (Página inicial)

### Funcionalidades Adicionais

- Se o usuário já estiver logado, ao tentar acessar qualquer página de login, será redirecionado automaticamente para sua área correspondente
- Verificação em tempo real do papel do usuário
- Contexto de autenticação atualizado instantaneamente após login