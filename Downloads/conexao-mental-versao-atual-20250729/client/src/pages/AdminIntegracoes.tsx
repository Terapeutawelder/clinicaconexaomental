import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Key, Webhook, Settings, Trash2, Eye, Copy, Plus, Activity, Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface ApiKey {
  id: string;
  name: string;
  permissions: string[];
  active: boolean;
  last_used?: string;
  created_at: string;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
  created_at: string;
}

interface ApiLog {
  id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time: number;
  ip_address: string;
  created_at: string;
}

export default function AdminIntegracoes() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    permissions: [] as string[]
  });
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[],
    secret: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const { toast } = useToast();

  const availablePermissions = [
    { id: 'users.read', label: 'Visualizar Usuários' },
    { id: 'users.write', label: 'Criar/Editar Usuários' },
    { id: 'professionals.read', label: 'Visualizar Profissionais' },
    { id: 'professionals.write', label: 'Gerenciar Profissionais' },
    { id: 'appointments.read', label: 'Visualizar Agendamentos' },
    { id: 'appointments.write', label: 'Criar/Editar Agendamentos' },
    { id: 'admin', label: 'Acesso Administrativo Total' }
  ];

  const availableEvents = [
    { id: 'user.created', label: 'Usuário Criado' },
    { id: 'user.updated', label: 'Usuário Atualizado' },
    { id: 'professional.created', label: 'Profissional Cadastrado' },
    { id: 'professional.approved', label: 'Profissional Aprovado' },
    { id: 'professional.rejected', label: 'Profissional Rejeitado' },
    { id: 'appointment.created', label: 'Agendamento Criado' },
    { id: 'appointment.confirmed', label: 'Agendamento Confirmado' },
    { id: 'appointment.cancelled', label: 'Agendamento Cancelado' },
    { id: 'appointment.completed', label: 'Agendamento Concluído' },
    { id: 'payment.approved', label: 'Pagamento Aprovado' },
    { id: 'payment.rejected', label: 'Pagamento Rejeitado' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const [apiKeysRes, webhooksRes, logsRes] = await Promise.all([
        fetch('/api/admin/api-keys', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/webhooks', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/v1/admin/logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (apiKeysRes.ok) {
        const apiKeysData = await apiKeysRes.json();
        setApiKeys(apiKeysData.apiKeys || []);
      }

      if (webhooksRes.ok) {
        const webhooksData = await webhooksRes.json();
        setWebhooks(webhooksData.webhooks || []);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setApiLogs(logsData.logs || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createApiKey = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newApiKey)
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys([...apiKeys, data.apiKey]);
        setNewApiKey({ name: '', permissions: [] });
        setShowApiKey(data.key); // Mostrar a chave gerada
        toast({
          title: "API Key criada",
          description: "A nova API Key foi criada com sucesso. Copie e guarde em local seguro!"
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao criar API Key",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao criar API Key:', error);
      toast({
        title: "Erro",
        description: "Erro interno do servidor",
        variant: "destructive"
      });
    }
  };

  const createWebhook = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/admin/webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newWebhook)
      });

      if (response.ok) {
        const data = await response.json();
        setWebhooks([...webhooks, data.webhook]);
        setNewWebhook({ name: '', url: '', events: [], secret: '' });
        toast({
          title: "Webhook criado",
          description: "O novo webhook foi configurado com sucesso"
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao criar webhook",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao criar webhook:', error);
      toast({
        title: "Erro",
        description: "Erro interno do servidor",
        variant: "destructive"
      });
    }
  };

  const toggleApiKey = async (id: string, active: boolean) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/admin/api-keys/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active })
      });

      if (response.ok) {
        setApiKeys(apiKeys.map((key: ApiKey) => 
          key.id === id ? { ...key, active } : key
        ));
        toast({
          title: active ? "API Key ativada" : "API Key desativada",
          description: `A API Key foi ${active ? 'ativada' : 'desativada'} com sucesso`
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar API Key:', error);
    }
  };

  const deleteApiKey = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/admin/api-keys/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setApiKeys(apiKeys.filter((key: ApiKey) => key.id !== id));
        toast({
          title: "API Key excluída",
          description: "A API Key foi excluída permanentemente"
        });
      }
    } catch (error) {
      console.error('Erro ao excluir API Key:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência"
    });
  };

  const testWebhook = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      await fetch('/api/v1/admin/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          event: 'system.test',
          data: { message: 'Teste de webhook', timestamp: new Date().toISOString() }
        })
      });

      toast({
        title: "Webhook testado",
        description: "Evento de teste enviado para todos os webhooks ativos"
      });
    } catch (error) {
      console.error('Erro ao testar webhook:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="h-8 w-8 text-purple-600" />
            Integrações Externas
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie API Keys e Webhooks para integração com agentes de IA, N8N e outras ferramentas
          </p>
        </div>

        <Tabs defaultValue="api-keys" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="api-keys" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Logs da API
            </TabsTrigger>
          </TabsList>

          {/* API Keys */}
          <TabsContent value="api-keys" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Nova API Key
                  </CardTitle>
                  <CardDescription>
                    Crie uma nova chave de API para integração externa
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="api-name">Nome da Integração</Label>
                    <Input
                      id="api-name"
                      placeholder="Ex: N8N Automação, ChatBot IA"
                      value={newApiKey.name}
                      onChange={(e) => setNewApiKey({...newApiKey, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label>Permissões</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {availablePermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={newApiKey.permissions.includes(permission.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewApiKey({
                                  ...newApiKey,
                                  permissions: [...newApiKey.permissions, permission.id]
                                });
                              } else {
                                setNewApiKey({
                                  ...newApiKey,
                                  permissions: newApiKey.permissions.filter(p => p !== permission.id)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={permission.id} className="text-sm">
                            {permission.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={createApiKey} 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={!newApiKey.name || newApiKey.permissions.length === 0}
                  >
                    Gerar API Key
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Como Usar</CardTitle>
                  <CardDescription>
                    Instruções para usar a API externa
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <strong>Endpoint Base:</strong>
                    <code className="block bg-gray-100 p-2 rounded mt-1">
                      https://seu-dominio.com/api/v1
                    </code>
                  </div>
                  
                  <div>
                    <strong>Autenticação:</strong>
                    <code className="block bg-gray-100 p-2 rounded mt-1">
                      Authorization: Bearer SUA_API_KEY
                    </code>
                  </div>

                  <div>
                    <strong>Endpoints Disponíveis:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                      <li>GET /api/v1/users - Listar usuários</li>
                      <li>GET /api/v1/professionals - Listar profissionais</li>
                      <li>GET /api/v1/appointments - Listar agendamentos</li>
                      <li>POST /api/v1/appointments - Criar agendamento</li>
                      <li>GET /api/v1/admin/stats - Estatísticas</li>
                    </ul>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open('/api/v1/status', '_blank')}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Ver Documentação Completa
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Lista de API Keys */}
            <Card>
              <CardHeader>
                <CardTitle>API Keys Ativas</CardTitle>
                <CardDescription>
                  Gerencie as chaves de API existentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {apiKeys.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Nenhuma API Key criada ainda
                  </p>
                ) : (
                  <div className="space-y-4">
                    {apiKeys.map((apiKey) => (
                      <div key={apiKey.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium">{apiKey.name}</h3>
                            <Badge variant={apiKey.active ? "default" : "secondary"}>
                              {apiKey.active ? "Ativa" : "Inativa"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Criada em: {new Date(apiKey.created_at).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-sm text-gray-500">
                            Último uso: {apiKey.last_used ? new Date(apiKey.last_used).toLocaleDateString('pt-BR') : 'Nunca'}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {apiKey.permissions?.map((permission) => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {availablePermissions.find(p => p.id === permission)?.label || permission}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={apiKey.active}
                            onCheckedChange={(checked) => toggleApiKey(apiKey.id, checked)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteApiKey(apiKey.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Modal para mostrar API Key gerada */}
            {showApiKey && (
              <Dialog open={!!showApiKey} onOpenChange={() => setShowApiKey(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>API Key Criada</DialogTitle>
                    <DialogDescription>
                      Copie e guarde esta chave em local seguro. Ela não será exibida novamente.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-100 rounded-lg">
                      <div className="flex items-center justify-between">
                        <code className="text-sm break-all">{showApiKey}</code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(showApiKey)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button onClick={() => setShowApiKey(null)} className="w-full">
                      Entendi, guardei a chave
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

          {/* Webhooks */}
          <TabsContent value="webhooks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Novo Webhook
                  </CardTitle>
                  <CardDescription>
                    Configure um webhook para receber notificações
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="webhook-name">Nome do Webhook</Label>
                    <Input
                      id="webhook-name"
                      placeholder="Ex: N8N Automação, Zapier"
                      value={newWebhook.name}
                      onChange={(e) => setNewWebhook({...newWebhook, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="webhook-url">URL do Webhook</Label>
                    <Input
                      id="webhook-url"
                      placeholder="https://seu-webhook.com/endpoint"
                      value={newWebhook.url}
                      onChange={(e) => setNewWebhook({...newWebhook, url: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="webhook-secret">Secret (Opcional)</Label>
                    <Input
                      id="webhook-secret"
                      placeholder="Chave secreta para validação"
                      value={newWebhook.secret}
                      onChange={(e) => setNewWebhook({...newWebhook, secret: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label>Eventos</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2 max-h-48 overflow-y-auto">
                      {availableEvents.map((event) => (
                        <div key={event.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={event.id}
                            checked={newWebhook.events.includes(event.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewWebhook({
                                  ...newWebhook,
                                  events: [...newWebhook.events, event.id]
                                });
                              } else {
                                setNewWebhook({
                                  ...newWebhook,
                                  events: newWebhook.events.filter(e => e !== event.id)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={event.id} className="text-sm">
                            {event.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={createWebhook} 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0}
                  >
                    Criar Webhook
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Teste de Webhook</CardTitle>
                  <CardDescription>
                    Teste seus webhooks com eventos simulados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Clique para enviar um evento de teste para todos os webhooks ativos.
                    Isso ajuda a verificar se a integração está funcionando corretamente.
                  </p>
                  
                  <Button 
                    onClick={testWebhook}
                    variant="outline" 
                    className="w-full"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Enviar Teste
                  </Button>

                  <div className="text-xs bg-gray-50 p-3 rounded">
                    <strong>Payload de teste:</strong>
                    <pre className="mt-1 text-xs">
{JSON.stringify({
  event: 'system.test',
  data: {
    message: 'Teste de webhook',
    timestamp: '2025-01-01T10:00:00.000Z'
  },
  timestamp: '2025-01-01T10:00:00.000Z',
  source: 'system'
}, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Webhooks */}
            <Card>
              <CardHeader>
                <CardTitle>Webhooks Configurados</CardTitle>
                <CardDescription>
                  Gerencie os webhooks existentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {webhooks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum webhook configurado ainda
                  </p>
                ) : (
                  <div className="space-y-4">
                    {webhooks.map((webhook) => (
                      <div key={webhook.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium">{webhook.name}</h3>
                              <Badge variant={webhook.active ? "default" : "secondary"}>
                                {webhook.active ? "Ativo" : "Inativo"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              URL: {webhook.url}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {webhook.events?.map((event) => (
                                <Badge key={event} variant="outline" className="text-xs">
                                  {availableEvents.find(e => e.id === event)?.label || event}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(webhook.url)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs da API */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Logs de Acesso à API</CardTitle>
                <CardDescription>
                  Monitore o uso das API Keys e diagnósticos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {apiLogs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum log de API ainda
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {apiLogs.map((log, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Badge variant={log.status_code < 400 ? "default" : "destructive"}>
                              {log.method} {log.status_code}
                            </Badge>
                            <span className="text-sm font-mono">{log.endpoint}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(log.created_at).toLocaleString('pt-BR')} - {log.response_time}ms
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {log.ip_address}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}