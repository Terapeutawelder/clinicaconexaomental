# Guia de Integração API - Conexão Mental

## Visão Geral

A plataforma Conexão Mental oferece uma API completa para integração com agentes de IA, ferramentas de automação como N8N, Zapier e outros sistemas externos.

## Endpoints Principais

### Base URL
```
https://seu-dominio.com/api/v1
```

### Status da API
```bash
GET /api/v1/status
```
Retorna informações sobre a API e endpoints disponíveis.

## Autenticação

Todas as rotas protegidas requerem uma API Key no header:

```bash
Authorization: Bearer SUA_API_KEY
```

### Como Obter uma API Key

1. Acesse o painel administrativo da plataforma
2. Navegue até "Integrações" no menu lateral
3. Clique em "Nova API Key"
4. Configure as permissões necessárias
5. Copie e guarde a chave gerada (será exibida apenas uma vez)

### Permissões Disponíveis

- `users.read` - Visualizar usuários
- `users.write` - Criar/editar usuários
- `professionals.read` - Visualizar profissionais
- `professionals.write` - Gerenciar profissionais
- `appointments.read` - Visualizar agendamentos
- `appointments.write` - Criar/editar agendamentos
- `admin` - Acesso administrativo total

## Endpoints da API

### Usuários

#### Listar Usuários
```bash
GET /api/v1/users
Authorization: Bearer SUA_API_KEY
```

**Permissão necessária:** `users.read`

**Resposta:**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "usuario@email.com",
      "full_name": "Nome Completo",
      "role": "patient|professional|admin",
      "created_at": "2025-01-01T10:00:00.000Z"
    }
  ],
  "total": 10,
  "page": 1,
  "per_page": 10
}
```

#### Criar Usuário
```bash
POST /api/v1/users
Authorization: Bearer SUA_API_KEY
Content-Type: application/json

{
  "email": "novo@email.com",
  "full_name": "Nome Completo",
  "password": "senha123",
  "role": "patient"
}
```

**Permissão necessária:** `users.write`

### Profissionais

#### Listar Profissionais
```bash
GET /api/v1/professionals
Authorization: Bearer SUA_API_KEY
```

**Permissão necessária:** `professionals.read`

#### Aprovar/Rejeitar Profissional
```bash
PATCH /api/v1/professionals/{id}/status
Authorization: Bearer SUA_API_KEY
Content-Type: application/json

{
  "status": "approved",
  "approved": true
}
```

**Permissão necessária:** `professionals.write`

### Agendamentos

#### Listar Agendamentos
```bash
GET /api/v1/appointments
Authorization: Bearer SUA_API_KEY
```

**Permissão necessária:** `appointments.read`

#### Criar Agendamento
```bash
POST /api/v1/appointments
Authorization: Bearer SUA_API_KEY
Content-Type: application/json

{
  "patient_id": "uuid",
  "professional_id": "uuid",
  "scheduled_at": "2025-01-01T10:00:00.000Z",
  "duration_minutes": 50,
  "status": "scheduled",
  "notes": "Observações opcionais"
}
```

**Permissão necessária:** `appointments.write`

#### Atualizar Status do Agendamento
```bash
PATCH /api/v1/appointments/{id}/status
Authorization: Bearer SUA_API_KEY
Content-Type: application/json

{
  "status": "confirmed|cancelled|completed"
}
```

### Estatísticas (Admin)

#### Obter Estatísticas do Sistema
```bash
GET /api/v1/admin/stats
Authorization: Bearer SUA_API_KEY
```

**Permissão necessária:** `admin`

**Resposta:**
```json
{
  "stats": {
    "users": {
      "total": 100,
      "patients": 85,
      "professionals": 12,
      "admins": 3
    },
    "professionals": {
      "total": 12,
      "approved": 10,
      "pending": 2
    },
    "appointments": {
      "total": 250,
      "scheduled": 15,
      "completed": 200,
      "cancelled": 35
    }
  }
}
```

## Webhooks

### Configuração de Webhooks

Webhooks permitem receber notificações em tempo real quando eventos ocorrem na plataforma.

#### Como Configurar

1. Acesse o painel administrativo
2. Navegue até "Integrações" → "Webhooks"
3. Clique em "Novo Webhook"
4. Configure a URL do seu endpoint
5. Selecione os eventos desejados
6. Opcionalmente, configure um secret para validação

#### Eventos Disponíveis

- `user.created` - Usuário criado
- `user.updated` - Usuário atualizado
- `professional.created` - Profissional cadastrado
- `professional.approved` - Profissional aprovado
- `professional.rejected` - Profissional rejeitado
- `appointment.created` - Agendamento criado
- `appointment.confirmed` - Agendamento confirmado
- `appointment.cancelled` - Agendamento cancelado
- `appointment.completed` - Agendamento concluído
- `payment.approved` - Pagamento aprovado
- `payment.rejected` - Pagamento rejeitado

#### Formato do Payload

```json
{
  "event": "appointment.created",
  "data": {
    "appointment_id": "uuid",
    "patient_id": "uuid",
    "professional_id": "uuid",
    "scheduled_at": "2025-01-01T10:00:00.000Z",
    "status": "scheduled"
  },
  "timestamp": "2025-01-01T10:00:00.000Z",
  "source": "appointment"
}
```

#### Headers Enviados

- `Content-Type: application/json`
- `X-Webhook-Signature: sha256=...` (se secret configurado)
- `X-Webhook-Event: nome_do_evento`
- `X-Webhook-Source: ConexaoMental`
- `User-Agent: ConexaoMental-Webhooks/1.0`

### Validação de Assinatura

Se você configurou um secret para o webhook, pode validar a assinatura:

```javascript
const crypto = require('crypto');

function validateSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## Exemplos de Integração

### N8N Workflow

1. **Trigger:** Webhook configurado para `appointment.created`
2. **Processamento:** Extrair dados do agendamento
3. **Ação:** Enviar notificação por email/SMS

### Zapier Integration

1. **Trigger:** Webhook para `professional.approved`
2. **Ação:** Criar usuário no sistema de CRM
3. **Ação:** Enviar email de boas-vindas

### Chatbot/IA Agent

```bash
# Buscar agendamentos do dia
GET /api/v1/appointments?date=today
Authorization: Bearer SUA_API_KEY

# Criar agendamento via chat
POST /api/v1/appointments
Authorization: Bearer SUA_API_KEY
{
  "patient_id": "uuid-do-paciente",
  "professional_id": "uuid-do-profissional",
  "scheduled_at": "2025-01-01T14:00:00.000Z"
}
```

## Monitoramento e Logs

### Logs de API

O painel administrativo inclui uma seção de logs onde você pode:

- Monitorar todas as chamadas à API
- Ver tempos de resposta
- Identificar erros e problemas
- Acompanhar uso por API Key

### Rate Limiting

- Limite padrão: 1000 requests por hora por API Key
- Para limites maiores, entre em contato com o administrador

## Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - API Key não fornecida ou inválida
- `403` - Permissão insuficiente
- `404` - Recurso não encontrado
- `429` - Rate limit excedido
- `500` - Erro interno do servidor

## Suporte

Para dúvidas sobre a integração:

1. Consulte a documentação completa em `/api/v1/status`
2. Verifique os logs de API no painel administrativo
3. Teste webhooks usando a função de teste do painel
4. Entre em contato com o administrador da plataforma

## Exemplos Completos

### Script Python - Criar Agendamento

```python
import requests
import json

API_KEY = "sua-api-key-aqui"
BASE_URL = "https://seu-dominio.com/api/v1"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Criar agendamento
appointment_data = {
    "patient_id": "uuid-do-paciente",
    "professional_id": "uuid-do-profissional",
    "scheduled_at": "2025-01-01T14:00:00.000Z",
    "duration_minutes": 50,
    "status": "scheduled"
}

response = requests.post(
    f"{BASE_URL}/appointments",
    headers=headers,
    json=appointment_data
)

if response.status_code == 201:
    print("Agendamento criado:", response.json())
else:
    print("Erro:", response.text)
```

### Node.js - Webhook Handler

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const event = req.headers['x-webhook-event'];
  const payload = JSON.stringify(req.body);
  
  // Validar assinatura (se secret configurado)
  const secret = process.env.WEBHOOK_SECRET;
  if (secret && !validateSignature(payload, signature, secret)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Processar evento
  console.log(`Evento recebido: ${event}`, req.body);
  
  switch (event) {
    case 'appointment.created':
      // Enviar notificação
      break;
    case 'professional.approved':
      // Criar no CRM
      break;
  }
  
  res.status(200).send('OK');
});

function validateSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  return signature === expectedSignature;
}

app.listen(3000, () => {
  console.log('Webhook handler running on port 3000');
});
```