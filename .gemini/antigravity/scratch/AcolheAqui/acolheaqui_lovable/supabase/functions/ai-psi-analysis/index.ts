import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcripts, patientName } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Format transcripts for analysis
    const formattedTranscripts = transcripts.map((t: any) => {
      const speaker = t.speaker === "professional" ? "Profissional" : "Paciente";
      return `[${speaker}]: ${t.text}`;
    }).join("\n");

    const systemPrompt = `Você é a IA Psi, uma inteligência artificial especializada em neurociência, psicanálise e psicologia clínica. Seu papel é auxiliar profissionais de saúde mental durante sessões terapêuticas.

IMPORTANTE: Esta análise é CONFIDENCIAL e visível APENAS para o profissional.

Sua função é analisar as transcrições da sessão em tempo real e fornecer:

1. **COMPORTAMENTO DO PACIENTE** 🧠
   - Identifique padrões de comunicação (evitação, projeção, racionalização)
   - Note mudanças no tom ou ritmo da fala
   - Observe resistências ou defesas psicológicas

2. **PADRÕES EMOCIONAIS** 💭
   - Identifique emoções predominantes (ansiedade, tristeza, raiva, medo)
   - Note incongruências entre discurso e emoção
   - Observe transferências ou contra-transferências

3. **SUGESTÕES DE ABORDAGEM** 💡
   - Técnicas terapêuticas recomendadas para o momento
   - Perguntas que podem aprofundar a exploração
   - Intervenções baseadas em evidências

4. **ALERTAS** ⚠️
   - Sinais de risco que precisam de atenção
   - Temas sensíveis que podem necessitar de cuidado especial

Seja conciso, direto e profissional. Foque em insights acionáveis.
O paciente é: ${patientName || "Não identificado"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Analise a seguinte transcrição da sessão terapêutica:\n\n${formattedTranscripts}\n\nForneça sua análise psicológica para auxiliar o profissional.` 
          }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro na análise de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI Psi analysis error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
