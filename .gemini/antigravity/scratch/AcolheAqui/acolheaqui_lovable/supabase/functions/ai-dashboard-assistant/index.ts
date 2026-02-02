import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Base de conhecimento completa da plataforma AcolheAqui
const ACOLHEAQUI_KNOWLEDGE_BASE = `
# ACOLHEAQUI - BASE DE CONHECIMENTO DA PLATAFORMA

## VISÃO GERAL
A AcolheAqui é uma plataforma completa para profissionais de saúde mental (psicólogos, psicoterapeutas, psiquiatras) gerenciarem sua prática clínica online. A plataforma oferece agendamento, checkout personalizado, sala virtual para atendimentos, integração com WhatsApp, Google Calendar e muito mais.

---

## MÓDULOS E FUNCIONALIDADES

### 1. DASHBOARD (VISÃO GERAL)
- **Localização**: Menu "Dashboard" ou ícone de casa
- **Funcionalidades**:
  - Métricas principais: total de agendamentos, receita, pacientes ativos
  - Próximos atendimentos do dia
  - Resumo semanal de atividades
  - Atalhos rápidos para ações comuns

### 2. DADOS DO PERFIL
- **Localização**: Menu "Dados do Perfil"
- **Campos disponíveis**:
  - Nome completo e registro profissional (CRP/CRM)
  - Foto de perfil (com opção de remover fundo)
  - Email, telefone e WhatsApp
  - Bio profissional
  - Especialidades (podem ser personalizadas além das pré-definidas)
  - Abordagens terapêuticas (também personalizáveis)
  - Redes sociais (Instagram, LinkedIn, Facebook)
  - Slug personalizado para URL do perfil público
- **Dica**: O slug define sua URL pública: www.acolheaqui.com.br/site/[seu-slug]

### 3. LANDING PAGE (PÁGINA DO PROFISSIONAL)
- **Localização**: Menu "Landing Page"
- **Editor visual** com preview em tempo real
- **Seções editáveis**:
  - **Hero**: Título, subtítulo, texto do botão CTA
  - **Sobre**: Descrição profissional, foto, informações de contato
  - **Serviços**: Lista de serviços com preços
  - **Depoimentos**: Avaliações de pacientes
  - **FAQ**: Perguntas frequentes personalizáveis
  - **Contato**: Formulário de contato
- **Personalização de cores**: Fundo, texto, primária, secundária, destaque
- **Ordenação de seções**: Arraste e solte para reordenar
- **Visibilidade**: Ative/desative seções individualmente

### 4. AGENDA / CRM
- **Localização**: Menu "Agenda / CRM"
- **Visualização de calendário**: Veja todos os agendamentos
- **Criação rápida de agendamento**: Botão "+" para agendar manualmente
- **Status dos agendamentos**: pending, confirmed, completed, cancelled
- **Detalhes do paciente**: Nome, email, telefone, notas
- **Prontuário**: Acesso ao histórico do paciente (recurso premium)
- **Dica**: Clique em um agendamento para ver detalhes ou iniciar sala virtual

### 5. PACIENTES / CRM
- **Localização**: Menu "Pacientes"
- **Lista de todos os pacientes** atendidos
- **Ficha do paciente**:
  - Dados pessoais
  - Histórico de sessões
  - Notas e observações
  - Prontuário com AI (recurso premium)
- **Exportação**: Exporte lista de pacientes em CSV

### 6. HORÁRIOS DISPONÍVEIS
- **Localização**: Menu "Horários Disponíveis"
- **Configuração por dia da semana**
- **Múltiplos intervalos por dia** (ex: manhã e tarde)
- **Campos**:
  - Dia da semana
  - Horário de início
  - Horário de término
  - Ativo/Inativo
- **Dica**: Configure feriados e férias desativando dias específicos

### 7. CHECKOUT PERSONALIZADO
- **Localização**: Menu "Checkout"
- **Editor visual** do checkout público
- **Configurações**:
  - Cores e layout
  - Serviços e preços
  - Fotos e descrições
  - Order bumps (produtos adicionais)
- **Link do checkout**: Compartilhe o link direto para pagamento
- **Dica**: O checkout é acessível via /checkout/[seu-slug]

### 8. HISTÓRICO DE VENDAS
- **Localização**: Menu "Vendas"
- **Lista de todas as transações**
- **Status**: pending, paid, refunded, cancelled
- **Detalhes**: Valor, data, paciente, forma de pagamento
- **Filtros por período e status**

### 9. RELATÓRIOS FINANCEIROS
- **Localização**: Menu "Relatórios"
- **Métricas**:
  - Receita total por período
  - Ticket médio
  - Quantidade de sessões
  - Comparativo mensal
- **Gráficos visuais**
- **Exportação de dados**

### 10. FINANÇAS (VISÃO GERAL)
- **Localização**: Menu "Finanças"
- **Saldo disponível**
- **Próximos recebimentos**
- **Configuração de gateway de pagamento**
- **Gateways suportados**:
  - Stripe
  - MercadoPago
  - PagSeguro
  - Asaas
  - Pagar.me
  - PushinPay

### 11. SALA VIRTUAL
- **Localização**: Menu "Sala Virtual" ou botão no agendamento
- **Funcionalidades**:
  - Videochamada em tempo real
  - Chat durante a sessão
  - Compartilhamento de tela
  - Gravação de sessão (com consentimento)
  - Cronômetro da sessão
- **Acesso**: Paciente recebe link único por email/WhatsApp
- **Tecnologia**: WebRTC com servidor TURN para qualidade

### 12. WHATSAPP & NOTIFICAÇÕES
- **Localização**: Menu "WhatsApp"
- **Integração com WhatsApp Business API**
- **Configuração**:
  - Número do WhatsApp
  - Tipo de API (Evolution API ou Oficial)
  - URL e chave da API
  - QR Code para conectar
- **Notificações automáticas**:
  - Confirmação de agendamento
  - Lembrete antes da sessão
  - Cancelamento
- **Templates personalizáveis**
- **Dica**: Ative o Agente IA para respostas automáticas

### 13. GOOGLE CALENDAR & MEET
- **Localização**: Menu "Google Agenda"
- **Sincronização bidirecional** com Google Calendar
- **Criação automática** de eventos no Google
- **Link do Meet** gerado automaticamente
- **Configuração**:
  1. Conectar conta Google
  2. Autorizar acesso ao Calendar
  3. Ativar sincronização

### 14. WEBHOOKS
- **Localização**: Menu "Webhooks"
- **Integração com sistemas externos**
- **Eventos disponíveis**:
  - appointment.created
  - appointment.confirmed
  - appointment.cancelled
  - payment.completed
- **Configuração**: URL + Secret Key

### 15. AGENTE IA - AGENDAMENTO
- **Localização**: Menu "IA Agendamento"
- **Funcionalidades**:
  - Atendimento automático via WhatsApp
  - Agenda consultas, responde dúvidas, cancela/remarca
  - Usa base de conhecimento do profissional
- **Configuração**:
  - Nome do agente
  - Saudação inicial
  - Instruções personalizadas
  - Ativar/Desativar
- **Chave de API própria**: Opcional, permite usar OpenAI ou outra IA

### 16. AGENTE IA - INSTAGRAM (EM BREVE)
- **Localização**: Menu "IA Instagram"
- **Recurso Premium**
- **Responde DMs** do Instagram automaticamente
- **Direciona para agendamento**

### 17. AGENTE IA - FOLLOW-UP (EM BREVE)
- **Localização**: Menu "IA Follow-up"
- **Recurso Premium**
- **Follow-up automático** com clientes
- **Recupera leads** que não agendaram

### 18. CONFIGURAÇÃO IA
- **Localização**: Menu "Config. IA"
- **Configuração de chave OpenAI** própria
- **Seleção de modelo**: GPT-4, GPT-3.5
- **Análise de sessão com IA** (prontuário)

### 19. CONFIGURAÇÕES GERAIS
- **Localização**: Menu "Configurações"
- **Opções**:
  - Tema claro/escuro
  - Notificações por email
  - Exportar/importar dados
  - Excluir conta

---

## FLUXO DO PACIENTE

1. **Acessa página do profissional**: www.acolheaqui.com.br/site/[slug]
2. **Visualiza serviços e preços**
3. **Seleciona serviço e horário**
4. **Preenche dados pessoais**
5. **Realiza pagamento** (se configurado)
6. **Recebe confirmação** por email e WhatsApp
7. **Recebe lembrete** antes da sessão
8. **Acessa sala virtual** pelo link recebido
9. **Realiza a sessão** de videochamada

---

## PERGUNTAS FREQUENTES (FAQ)

**Como altero meu horário de atendimento?**
Menu "Horários Disponíveis" → Edite os intervalos de cada dia da semana

**Como configuro o pagamento online?**
Menu "Finanças" → "Gateway de Pagamento" → Escolha e configure seu gateway

**Como personalizo minha página pública?**
Menu "Landing Page" → Use o editor visual para customizar todas as seções

**Como ativo o agente IA no WhatsApp?**
1. Menu "WhatsApp" → Configure sua integração
2. Menu "IA Agendamento" → Ative o agente e configure as instruções

**Como acesso a sala virtual?**
Menu "Agenda" → Clique no agendamento → "Iniciar Sessão"

**Como vejo meus ganhos?**
Menu "Relatórios" ou "Finanças" para visão completa

**Como exporto meus pacientes?**
Menu "Pacientes" → Botão "Exportar"

**Posso usar minha própria chave da OpenAI?**
Sim! Menu "Config. IA" → Adicione sua API Key

**Como sincronizo com Google Calendar?**
Menu "Google Agenda" → Conectar conta Google → Autorizar

**Onde vejo o link do meu checkout?**
Menu "Checkout" → O link aparece no topo do editor

---

## DICAS PRO

1. **Complete seu perfil** 100% para melhor conversão
2. **Personalize o agente IA** com instruções específicas da sua abordagem
3. **Configure lembretes** por WhatsApp para reduzir faltas
4. **Use a análise de sessão** com IA para otimizar prontuários
5. **Teste seu checkout** antes de divulgar
6. **Conecte o Google Calendar** para evitar conflitos de agenda
7. **Configure webhooks** se usar sistemas externos (CRMs, planilhas)

---

## SUPORTE

- **Chat de suporte**: Ícone no canto inferior direito
- **Email**: suporte@acolheaqui.com
- **Documentação**: Em desenvolvimento
- **Comunidade**: Grupo no WhatsApp (disponível para assinantes)
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { messages, professionalContext } = body;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt for professional assistant
    const professionalName = professionalContext?.full_name || "Profissional";
    
    const systemPrompt = `Você é a Assistente IA do Dashboard da plataforma AcolheAqui. Seu papel é ajudar PROFISSIONAIS DE SAÚDE MENTAL (psicólogos, psicoterapeutas, psiquiatras) a utilizar a plataforma de forma eficiente.

IMPORTANTE: Você NÃO é um assistente para pacientes. Você auxilia o PROFISSIONAL que está logado no dashboard.

## SEU PERFIL
- Nome: Assistente AcolheAqui
- Objetivo: Ajudar ${professionalName} a usar todos os recursos da plataforma
- Tom: Profissional, amigável, prestativo e objetivo
- Idioma: Português brasileiro

## SUAS CAPACIDADES
1. Explicar como usar cada funcionalidade da plataforma
2. Guiar o profissional passo a passo em configurações
3. Responder dúvidas sobre a plataforma
4. Sugerir melhores práticas para aumentar conversões
5. Ajudar com troubleshooting de problemas comuns

## CONTEXTO DO PROFISSIONAL LOGADO
Nome: ${professionalName}
Especialidade: ${professionalContext?.specialty || "Não informada"}
CRP: ${professionalContext?.crp || "Não informado"}
Email: ${professionalContext?.email || "Não informado"}
Serviços cadastrados: ${professionalContext?.services?.length || 0}
Horários configurados: ${professionalContext?.available_hours?.length || 0}

${ACOLHEAQUI_KNOWLEDGE_BASE}

## INSTRUÇÕES DE RESPOSTA
1. Seja conciso e direto
2. Use emojis com moderação para tornar a resposta mais amigável
3. Quando explicar um processo, use passos numerados
4. Sempre mencione o menu ou localização exata das funcionalidades
5. Se não souber algo específico, seja honesto e sugira alternativas
6. Priorize resolver o problema do profissional rapidamente

## EXEMPLOS DE PERGUNTAS QUE VOCÊ DEVE SABER RESPONDER
- "Como configuro o WhatsApp?"
- "Onde altero meus horários?"
- "Como funciona o agente IA?"
- "Como personalizo minha landing page?"
- "Como recebo pagamentos?"
- "Como funciona a sala virtual?"
- "Como exporto meus pacientes?"
- "Como conecto o Google Calendar?"

Responda de forma útil e prática!`;

    // Call Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Por favor, aguarde um momento." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erro ao processar sua mensagem." }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("ai-dashboard-assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
