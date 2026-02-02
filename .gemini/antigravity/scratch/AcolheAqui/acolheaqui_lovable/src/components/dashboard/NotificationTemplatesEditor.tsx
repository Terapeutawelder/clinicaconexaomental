import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Mail, Info, RotateCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NotificationTemplatesEditorProps {
  templates: {
    clientConfirmation: string;
    clientReminder: string;
    professionalNotification: string;
    emailConfirmation: string;
  };
  onTemplatesChange: (templates: {
    clientConfirmation: string;
    clientReminder: string;
    professionalNotification: string;
    emailConfirmation: string;
  }) => void;
}

const DEFAULT_TEMPLATES = {
  clientConfirmation: `✅ *Agendamento Confirmado!*

Olá, {client_name}!

Seu agendamento foi realizado com sucesso.

📋 *Detalhes:*
👤 Profissional: {professional_name}
📌 Serviço: {service_name}
📅 Data: {date}
🕐 Horário: {time}
💰 Valor: {price}

Caso precise remarcar ou cancelar, entre em contato diretamente com o profissional.`,

  clientReminder: `⏰ *Lembrete de Consulta*

Olá, {client_name}!

Este é um lembrete da sua consulta agendada para *amanhã*:

📅 *Data:* {date}
🕐 *Horário:* {time}
👤 *Profissional:* {professional_name}

Por favor, confirme sua presença ou entre em contato caso precise reagendar.

Até breve! 💜`,

  professionalNotification: `📅 *Novo Agendamento!*

Você tem um novo agendamento:

👤 *Cliente:* {client_name}
📱 *Telefone:* {client_phone}
📧 *E-mail:* {client_email}
📌 *Serviço:* {service_name}
📅 *Data:* {date}
🕐 *Horário:* {time}
💰 *Valor:* {price}

📝 *Observações:* {notes}`,

  emailConfirmation: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #2A9D8F; margin-bottom: 20px;">Agendamento Confirmado! ✅</h1>
  <p>Olá, <strong>{client_name}</strong>!</p>
  <p>Seu agendamento foi realizado com sucesso.</p>
  
  <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
    <h3 style="margin: 0 0 15px 0; color: #374151;">Detalhes do Agendamento</h3>
    <p style="margin: 5px 0;"><strong>Profissional:</strong> {professional_name}</p>
    <p style="margin: 5px 0;"><strong>Serviço:</strong> {service_name}</p>
    <p style="margin: 5px 0;"><strong>Data:</strong> {date}</p>
    <p style="margin: 5px 0;"><strong>Horário:</strong> {time}</p>
    <p style="margin: 5px 0;"><strong>Valor:</strong> {price}</p>
  </div>
  
  <p style="color: #6b7280; font-size: 14px;">
    Caso precise remarcar ou cancelar, entre em contato diretamente com o profissional.
  </p>
  
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
  <p style="color: #9ca3af; font-size: 12px; text-align: center;">
    Este e-mail foi enviado automaticamente pelo sistema AcolheAqui.
  </p>
</div>`,
};

const VARIABLES_INFO = {
  clientConfirmation: [
    { name: "{client_name}", desc: "Nome do cliente" },
    { name: "{professional_name}", desc: "Nome do profissional (com Dr./Dra.)" },
    { name: "{service_name}", desc: "Nome do serviço" },
    { name: "{date}", desc: "Data do agendamento (dd/mm/aaaa)" },
    { name: "{time}", desc: "Horário do agendamento" },
    { name: "{price}", desc: "Valor formatado (R$)" },
  ],
  clientReminder: [
    { name: "{client_name}", desc: "Nome do cliente" },
    { name: "{professional_name}", desc: "Nome do profissional (com Dr./Dra.)" },
    { name: "{date}", desc: "Data do agendamento (dd/mm/aaaa)" },
    { name: "{time}", desc: "Horário do agendamento" },
  ],
  professionalNotification: [
    { name: "{client_name}", desc: "Nome do cliente" },
    { name: "{client_phone}", desc: "Telefone do cliente" },
    { name: "{client_email}", desc: "E-mail do cliente" },
    { name: "{service_name}", desc: "Nome do serviço" },
    { name: "{date}", desc: "Data do agendamento (dd/mm/aaaa)" },
    { name: "{time}", desc: "Horário do agendamento" },
    { name: "{price}", desc: "Valor formatado (R$)" },
    { name: "{notes}", desc: "Observações do cliente" },
  ],
  emailConfirmation: [
    { name: "{client_name}", desc: "Nome do cliente" },
    { name: "{professional_name}", desc: "Nome do profissional (com Dr./Dra.)" },
    { name: "{service_name}", desc: "Nome do serviço" },
    { name: "{date}", desc: "Data do agendamento (dd/mm/aaaa)" },
    { name: "{time}", desc: "Horário do agendamento" },
    { name: "{price}", desc: "Valor formatado (R$)" },
  ],
};

export function NotificationTemplatesEditor({ templates, onTemplatesChange }: NotificationTemplatesEditorProps) {
  const [activeTab, setActiveTab] = useState("client-confirmation");

  const handleTemplateChange = (key: keyof typeof templates, value: string) => {
    onTemplatesChange({
      ...templates,
      [key]: value,
    });
  };

  const handleResetTemplate = (key: keyof typeof templates) => {
    const defaultKey = key === "clientConfirmation" ? "clientConfirmation" :
                       key === "clientReminder" ? "clientReminder" :
                       key === "professionalNotification" ? "professionalNotification" :
                       "emailConfirmation";
    handleTemplateChange(key, DEFAULT_TEMPLATES[defaultKey]);
  };

  const renderVariablesBadges = (variablesKey: keyof typeof VARIABLES_INFO) => (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {VARIABLES_INFO[variablesKey].map((variable) => (
        <TooltipProvider key={variable.name}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className="cursor-help text-xs font-mono bg-muted/50"
              >
                {variable.name}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{variable.desc}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Templates de Mensagens
        </CardTitle>
        <CardDescription>
          Personalize as mensagens enviadas aos clientes e a você. Use as variáveis disponíveis para inserir dados dinâmicos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="client-confirmation" className="text-xs">
              <MessageSquare className="h-3 w-3 mr-1" />
              Confirmação
            </TabsTrigger>
            <TabsTrigger value="client-reminder" className="text-xs">
              <MessageSquare className="h-3 w-3 mr-1" />
              Lembrete
            </TabsTrigger>
            <TabsTrigger value="professional-notification" className="text-xs">
              <MessageSquare className="h-3 w-3 mr-1" />
              Aviso Pro
            </TabsTrigger>
            <TabsTrigger value="email-confirmation" className="text-xs">
              <Mail className="h-3 w-3 mr-1" />
              E-mail
            </TabsTrigger>
          </TabsList>

          <TabsContent value="client-confirmation" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Mensagem de Confirmação (WhatsApp)</label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Enviada ao cliente após confirmar o agendamento</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleResetTemplate("clientConfirmation")}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Restaurar
                </Button>
              </div>
              <Textarea
                value={templates.clientConfirmation || DEFAULT_TEMPLATES.clientConfirmation}
                onChange={(e) => handleTemplateChange("clientConfirmation", e.target.value)}
                rows={12}
                className="font-mono text-sm"
                placeholder="Digite sua mensagem personalizada..."
              />
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Variáveis disponíveis:</span>
              </div>
              {renderVariablesBadges("clientConfirmation")}
            </div>
          </TabsContent>

          <TabsContent value="client-reminder" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Mensagem de Lembrete (WhatsApp)</label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Enviada ao cliente 24h antes da consulta</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleResetTemplate("clientReminder")}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Restaurar
                </Button>
              </div>
              <Textarea
                value={templates.clientReminder || DEFAULT_TEMPLATES.clientReminder}
                onChange={(e) => handleTemplateChange("clientReminder", e.target.value)}
                rows={12}
                className="font-mono text-sm"
                placeholder="Digite sua mensagem personalizada..."
              />
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Variáveis disponíveis:</span>
              </div>
              {renderVariablesBadges("clientReminder")}
            </div>
          </TabsContent>

          <TabsContent value="professional-notification" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Notificação para Você (WhatsApp)</label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Enviada a você quando um cliente agenda</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleResetTemplate("professionalNotification")}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Restaurar
                </Button>
              </div>
              <Textarea
                value={templates.professionalNotification || DEFAULT_TEMPLATES.professionalNotification}
                onChange={(e) => handleTemplateChange("professionalNotification", e.target.value)}
                rows={12}
                className="font-mono text-sm"
                placeholder="Digite sua mensagem personalizada..."
              />
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Variáveis disponíveis:</span>
              </div>
              {renderVariablesBadges("professionalNotification")}
            </div>
          </TabsContent>

          <TabsContent value="email-confirmation" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">E-mail de Confirmação (HTML)</label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Enviado ao cliente por e-mail após confirmar</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleResetTemplate("emailConfirmation")}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Restaurar
                </Button>
              </div>
              <Textarea
                value={templates.emailConfirmation || DEFAULT_TEMPLATES.emailConfirmation}
                onChange={(e) => handleTemplateChange("emailConfirmation", e.target.value)}
                rows={15}
                className="font-mono text-sm"
                placeholder="Digite seu template HTML personalizado..."
              />
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Variáveis disponíveis:</span>
              </div>
              {renderVariablesBadges("emailConfirmation")}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export { DEFAULT_TEMPLATES };
