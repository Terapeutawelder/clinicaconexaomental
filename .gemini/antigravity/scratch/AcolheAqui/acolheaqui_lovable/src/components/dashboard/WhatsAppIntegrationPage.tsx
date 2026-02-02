import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageCircle, 
  Save, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Bell,
  Clock,
  Smartphone,
  QrCode,
  RefreshCw,
  Wifi,
  WifiOff,
  Send,
  Calendar,
  Shield,
  ExternalLink,
  FileText
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { NotificationTemplatesEditor, DEFAULT_TEMPLATES } from "./NotificationTemplatesEditor";

interface WhatsAppIntegrationPageProps {
  profileId: string;
}

interface WhatsAppSettings {
  id?: string;
  evolution_api_url: string;
  evolution_api_key: string;
  evolution_instance_name: string;
  whatsapp_number: string;
  is_active: boolean;
  reminder_enabled: boolean;
  reminder_hours_before: number;
  confirmation_enabled: boolean;
  whatsapp_api_type: "evolution" | "official";
  official_phone_number_id: string;
  official_access_token: string;
  official_business_account_id: string;
  template_client_confirmation: string;
  template_client_reminder: string;
  template_professional_notification: string;
  template_email_confirmation: string;
}

interface NotificationStats {
  total_sent: number;
  confirmations_sent: number;
  reminders_sent: number;
}

const WhatsAppIntegrationPage = ({ profileId }: WhatsAppIntegrationPageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "connected" | "disconnected" | "connecting">("unknown");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("Olá! Esta é uma mensagem de teste do PsiAgenda.");
const [activeTab, setActiveTab] = useState("connection");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  
  // Official API field validation states
  const [officialFieldsTouched, setOfficialFieldsTouched] = useState({
    phone_number_id: false,
    access_token: false,
    business_account_id: false,
  });

  // API Key global da Evolution (pode ser hardcoded ou de env)
  const EVOLUTION_GLOBAL_API_KEY = "5911E93E8961B67FC4C1CBED11683";
  const EVOLUTION_DEFAULT_URL = "https://evo.agenteluzia.online";

  const [settings, setSettings] = useState<WhatsAppSettings>({
    evolution_api_url: EVOLUTION_DEFAULT_URL,
    evolution_api_key: EVOLUTION_GLOBAL_API_KEY,
    evolution_instance_name: `user_${profileId.substring(0, 8)}`,
    whatsapp_number: "",
    is_active: false,
    reminder_enabled: true,
    reminder_hours_before: 24,
    confirmation_enabled: true,
    whatsapp_api_type: "evolution",
    official_phone_number_id: "",
    official_access_token: "",
    official_business_account_id: "",
    template_client_confirmation: "",
    template_client_reminder: "",
    template_professional_notification: "",
    template_email_confirmation: "",
  });

  const [stats, setStats] = useState<NotificationStats>({
    total_sent: 0,
    confirmations_sent: 0,
    reminders_sent: 0,
  });

  useEffect(() => {
    fetchSettings();
    fetchStats();
  }, [profileId]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("whatsapp_settings")
        .select("*")
        .eq("professional_id", profileId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const autoInstanceName = `user_${profileId.substring(0, 8)}`;
        const savedNumber = (data as any).whatsapp_number || "";
        setWhatsappNumber(savedNumber);
        setSettings({
          id: data.id,
          evolution_api_url: data.evolution_api_url || EVOLUTION_DEFAULT_URL,
          evolution_api_key: data.evolution_api_key || EVOLUTION_GLOBAL_API_KEY,
          evolution_instance_name: data.evolution_instance_name || autoInstanceName,
          whatsapp_number: savedNumber,
          is_active: data.is_active || false,
          reminder_enabled: data.reminder_enabled ?? true,
          reminder_hours_before: data.reminder_hours_before || 24,
          confirmation_enabled: data.confirmation_enabled ?? true,
          whatsapp_api_type: ((data as any).whatsapp_api_type as "evolution" | "official") || "evolution",
          official_phone_number_id: (data as any).official_phone_number_id || "",
          official_access_token: (data as any).official_access_token || "",
          official_business_account_id: (data as any).official_business_account_id || "",
          template_client_confirmation: (data as any).template_client_confirmation || "",
          template_client_reminder: (data as any).template_client_reminder || "",
          template_professional_notification: (data as any).template_professional_notification || "",
          template_email_confirmation: (data as any).template_email_confirmation || "",
        });
        
        if (data.is_active) {
          // Automatically verify the actual connection status
          setTimeout(() => checkActualConnectionStatus(
            data.evolution_api_url || EVOLUTION_DEFAULT_URL,
            data.evolution_api_key || EVOLUTION_GLOBAL_API_KEY,
            data.evolution_instance_name || autoInstanceName
          ), 500);
        }
      } else {
        // No saved settings - auto-check if instance already exists
        setTimeout(() => checkActualConnectionStatus(
          EVOLUTION_DEFAULT_URL,
          EVOLUTION_GLOBAL_API_KEY,
          `user_${profileId.substring(0, 8)}`
        ), 500);
      }
    } catch (error) {
      console.error("Error fetching WhatsApp settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("professional_id", profileId)
        .gte("created_at", startOfMonth.toISOString());

      setStats({
        total_sent: (count || 0) * 2,
        confirmations_sent: count || 0,
        reminders_sent: count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleInputChange = (field: keyof WhatsAppSettings, value: string | boolean | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  // Official API field validation functions
  const validatePhoneNumberId = (value: string): { valid: boolean; message: string } => {
    if (!value.trim()) return { valid: false, message: "Campo obrigatório" };
    if (!/^\d{10,20}$/.test(value.trim())) {
      return { valid: false, message: "Deve conter apenas números (10-20 dígitos)" };
    }
    return { valid: true, message: "Formato válido" };
  };

  const validateAccessToken = (value: string): { valid: boolean; message: string } => {
    if (!value.trim()) return { valid: false, message: "Campo obrigatório" };
    if (value.trim().length < 50) {
      return { valid: false, message: "Token muito curto (mínimo 50 caracteres)" };
    }
    if (!/^[A-Za-z0-9_-]+$/.test(value.trim())) {
      return { valid: false, message: "Token contém caracteres inválidos" };
    }
    return { valid: true, message: "Formato válido" };
  };

  const validateBusinessAccountId = (value: string): { valid: boolean; message: string } => {
    if (!value.trim()) return { valid: false, message: "Campo obrigatório" };
    if (!/^\d{10,20}$/.test(value.trim())) {
      return { valid: false, message: "Deve conter apenas números (10-20 dígitos)" };
    }
    return { valid: true, message: "Formato válido" };
  };

  const handleOfficialFieldChange = (field: keyof WhatsAppSettings, value: string) => {
    handleInputChange(field, value);
    // Mark field as touched when user types
    if (field === "official_phone_number_id") {
      setOfficialFieldsTouched(prev => ({ ...prev, phone_number_id: true }));
    } else if (field === "official_access_token") {
      setOfficialFieldsTouched(prev => ({ ...prev, access_token: true }));
    } else if (field === "official_business_account_id") {
      setOfficialFieldsTouched(prev => ({ ...prev, business_account_id: true }));
    }
  };

  const phoneNumberIdValidation = validatePhoneNumberId(settings.official_phone_number_id);
  const accessTokenValidation = validateAccessToken(settings.official_access_token);
  const businessAccountIdValidation = validateBusinessAccountId(settings.official_business_account_id);

  const isOfficialApiFormValid = 
    phoneNumberIdValidation.valid && 
    accessTokenValidation.valid && 
    businessAccountIdValidation.valid;

  const getFieldBorderClass = (touched: boolean, valid: boolean): string => {
    if (!touched) return "border-border";
    return valid ? "border-green-500 focus:border-green-500" : "border-destructive focus:border-destructive";
  };

  // Normalize API URL by removing trailing slash
  const normalizeApiUrl = (url: string) => url.replace(/\/+$/, '');

  // Format phone number to international format (Brazil)
  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, "");
    if (!cleaned) return "";
    return cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
  };

  // Check actual connection status on load
  const checkActualConnectionStatus = async (apiUrl: string, apiKey: string, instanceName: string) => {
    try {
      const normalizedUrl = normalizeApiUrl(apiUrl);
      const response = await fetch(`${normalizedUrl}/instance/fetchInstances`, {
        method: "GET",
        headers: { "apikey": apiKey },
      });

      if (response.ok) {
        const instances = await response.json();
        const instanceList = Array.isArray(instances) ? instances : (instances.instances || []);
        
        const instance = instanceList.find((inst: any) => {
          const name = inst.instance?.instanceName || inst.instanceName || inst.name;
          return name === instanceName;
        });

        if (instance) {
          const status = instance?.instance?.status || instance?.status || instance?.state;
          if (status === "open" || status === "connected") {
            setConnectionStatus("connected");
            setSettings(prev => ({ ...prev, is_active: true }));
          } else {
            setConnectionStatus("disconnected");
          }
        } else {
          setConnectionStatus("disconnected");
        }
      }
    } catch (error) {
      console.error("Error checking connection status:", error);
    }
  };

  // handleSave needs to be defined BEFORE it's used in generateQRCode/startConnectionPolling
  const handleSave = useCallback(async () => {
    setIsSaving(true);

    try {
      const payload = {
        professional_id: profileId,
        evolution_api_url: settings.evolution_api_url,
        evolution_api_key: settings.evolution_api_key,
        evolution_instance_name: settings.evolution_instance_name,
        is_active: settings.is_active,
        reminder_enabled: settings.reminder_enabled,
        reminder_hours_before: settings.reminder_hours_before,
        confirmation_enabled: settings.confirmation_enabled,
        whatsapp_api_type: settings.whatsapp_api_type,
        official_phone_number_id: settings.official_phone_number_id,
        official_access_token: settings.official_access_token,
        official_business_account_id: settings.official_business_account_id,
        template_client_confirmation: settings.template_client_confirmation || null,
        template_client_reminder: settings.template_client_reminder || null,
        template_professional_notification: settings.template_professional_notification || null,
        template_email_confirmation: settings.template_email_confirmation || null,
      };

      if (settings.id) {
        const { error } = await supabase
          .from("whatsapp_settings")
          .update(payload)
          .eq("id", settings.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("whatsapp_settings")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setSettings(prev => ({ ...prev, id: data.id }));
      }

      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Error saving WhatsApp settings:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  }, [profileId, settings]);

  const generateQRCode = async () => {
    // Validate WhatsApp number
    const formattedNumber = formatPhoneNumber(whatsappNumber);
    if (!formattedNumber || formattedNumber.length < 12) {
      toast.error("Informe um número de WhatsApp válido com DDD");
      return;
    }

    // Auto-fill with defaults
    const apiUrl = EVOLUTION_DEFAULT_URL;
    const apiKey = EVOLUTION_GLOBAL_API_KEY;
    const instanceName = `user_${profileId.substring(0, 8)}`;

    // Update settings with auto-filled values
    setSettings(prev => ({
      ...prev,
      evolution_api_url: apiUrl,
      evolution_api_key: apiKey,
      evolution_instance_name: instanceName,
      whatsapp_number: formattedNumber,
    }));

    setIsGeneratingQR(true);
    setConnectionStatus("connecting");
    setQrCode(null);

    const normalizedApiUrl = normalizeApiUrl(apiUrl);
    const trimmedInstanceName = instanceName.trim();

    try {
      // First, check if instance exists
      console.log("Fetching instances from:", `${normalizedApiUrl}/instance/fetchInstances`);
      const checkResponse = await fetch(`${normalizedApiUrl}/instance/fetchInstances`, {
        method: "GET",
        headers: {
          "apikey": apiKey,
        },
      });

      if (checkResponse.ok) {
        const instances = await checkResponse.json();
        console.log("Instances found:", instances);
        
        // Handle both array format and object with instances array
        const instanceList = Array.isArray(instances) ? instances : (instances.instances || []);
        
        const instanceExists = instanceList.some((inst: any) => {
          const name = inst.instance?.instanceName || inst.instanceName || inst.name;
          console.log("Checking instance:", name, "against:", trimmedInstanceName);
          return name === trimmedInstanceName;
        });

        // Check if instance is already connected
        const connectedInstance = instanceList.find((inst: any) => {
          const name = inst.instance?.instanceName || inst.instanceName || inst.name;
          const status = inst.instance?.status || inst.status || inst.state;
          return name === trimmedInstanceName && (status === "open" || status === "connected");
        });

        if (connectedInstance) {
          setConnectionStatus("connected");
          setSettings(prev => ({ ...prev, is_active: true, whatsapp_number: formattedNumber }));
          toast.success("WhatsApp já está conectado!");
          handleSave();
          return;
        }

        // If instance doesn't exist, create it automatically
        if (!instanceExists) {
          console.log("Creating instance automatically:", trimmedInstanceName);
          toast.info("Criando instância automaticamente...");
          
          const createResponse = await fetch(`${normalizedApiUrl}/instance/create`, {
            method: "POST",
            headers: {
              "apikey": apiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              instanceName: trimmedInstanceName,
              token: crypto.randomUUID(),
              qrcode: true,
              integration: "WHATSAPP-BAILEYS",
            }),
          });

          const createData = await createResponse.json();
          console.log("Instance create response:", createData);

          if (!createResponse.ok && !createData.error?.includes("already")) {
            throw new Error(createData.message || "Erro ao criar instância");
          }
        }

        // Get QR Code
        console.log("Getting QR Code for:", trimmedInstanceName);
        const qrResponse = await fetch(
          `${normalizedApiUrl}/instance/connect/${trimmedInstanceName}`,
          {
            method: "GET",
            headers: {
              "apikey": apiKey,
            },
          }
        );

        if (qrResponse.ok) {
          const qrData = await qrResponse.json();
          console.log("QR Code response:", qrData);
          
          if (qrData.base64) {
            setQrCode(qrData.base64);
            setConnectionStatus("connecting");
            toast.info("Escaneie o QR Code com seu WhatsApp");
            
            // Start polling for connection status
            startConnectionPolling(normalizedApiUrl, apiKey, trimmedInstanceName);
          } else if (qrData.instance?.state === "open" || qrData.state === "open") {
            setConnectionStatus("connected");
            setSettings(prev => ({ ...prev, is_active: true }));
            toast.success("WhatsApp conectado com sucesso!");
            handleSave();
          }
        } else {
          const errData = await qrResponse.json().catch(() => ({}));
          console.error("QR Code error:", errData);
          throw new Error(errData.message || "Erro ao gerar QR Code");
        }
      } else {
        throw new Error("Erro ao verificar instâncias");
      }
    } catch (error) {
      console.error("Error generating QR:", error);
      setConnectionStatus("disconnected");
      toast.error("Erro ao gerar QR Code. Verifique sua conexão.");
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const disconnectWhatsApp = async () => {
    setIsDisconnecting(true);
    
    const apiUrl = EVOLUTION_DEFAULT_URL;
    const apiKey = EVOLUTION_GLOBAL_API_KEY;
    const instanceName = settings.evolution_instance_name || `user_${profileId.substring(0, 8)}`;
    const normalizedApiUrl = normalizeApiUrl(apiUrl);

    try {
      // Logout from WhatsApp (disconnect session)
      console.log("Disconnecting instance:", instanceName);
      const logoutResponse = await fetch(`${normalizedApiUrl}/instance/logout/${instanceName}`, {
        method: "DELETE",
        headers: {
          "apikey": apiKey,
        },
      });

      if (logoutResponse.ok || logoutResponse.status === 404) {
        // Also delete the instance
        await fetch(`${normalizedApiUrl}/instance/delete/${instanceName}`, {
          method: "DELETE",
          headers: {
            "apikey": apiKey,
          },
        });

        setConnectionStatus("disconnected");
        setQrCode(null);
        setSettings(prev => ({ ...prev, is_active: false }));
        
        // Update database
        if (settings.id) {
          await supabase
            .from("whatsapp_settings")
            .update({ is_active: false })
            .eq("id", settings.id);
        }
        
        toast.success("WhatsApp desconectado com sucesso!");
      } else {
        throw new Error("Erro ao desconectar");
      }
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast.error("Erro ao desconectar WhatsApp");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const startConnectionPolling = useCallback((apiUrl: string, apiKey: string, instanceName: string) => {
    let attempts = 0;
    const maxAttempts = 90; // 3 minutes (2s intervals)

    const pollInterval = setInterval(async () => {
      attempts++;
      
      if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
        setQrCode(null);
        setConnectionStatus("disconnected");
        toast.error("Tempo esgotado. Tente gerar o QR Code novamente.");
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/instance/fetchInstances`, {
          method: "GET",
          headers: {
            "apikey": apiKey,
          },
        });

        if (response.ok) {
          const instances = await response.json();
          const instanceList = Array.isArray(instances) ? instances : (instances.instances || []);
          
          const instance = instanceList.find((inst: any) => {
            const name = inst.instance?.instanceName || inst.instanceName || inst.name;
            return name === instanceName;
          });

          const status = instance?.instance?.status || instance?.status || instance?.state;
          console.log("Polling status:", status, "for instance:", instanceName);
          
          if (status === "open" || status === "connected") {
            clearInterval(pollInterval);
            setConnectionStatus("connected");
            setQrCode(null);
            setSettings(prev => ({ ...prev, is_active: true }));
            toast.success("WhatsApp conectado com sucesso!");
            
            // Auto-save settings
            handleSave();
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000);

    // Cleanup on unmount
    return () => clearInterval(pollInterval);
  }, [handleSave]);

  const testConnection = async () => {
    if (settings.whatsapp_api_type === "evolution") {
      if (!settings.evolution_api_url || !settings.evolution_api_key || !settings.evolution_instance_name) {
        toast.error("Preencha todos os campos de conexão");
        return;
      }
    } else {
      if (!settings.official_phone_number_id || !settings.official_access_token) {
        toast.error("Preencha Phone Number ID e Access Token");
        return;
      }
    }

    setIsTesting(true);
    setConnectionStatus("unknown");

    try {
      if (settings.whatsapp_api_type === "evolution") {
        const apiUrl = normalizeApiUrl(settings.evolution_api_url);
        const instanceName = settings.evolution_instance_name.trim();
        
        console.log("Testing connection to:", `${apiUrl}/instance/fetchInstances`);
        console.log("Looking for instance:", instanceName);
        
        const response = await fetch(`${apiUrl}/instance/fetchInstances`, {
          method: "GET",
          headers: {
            "apikey": settings.evolution_api_key,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("API Response:", data);
          
          // Handle both array format and object with instances array
          const instanceList = Array.isArray(data) ? data : (data.instances || []);
          console.log("Instance list:", instanceList);
          
          const instance = instanceList.find((inst: any) => {
            const name = inst.instance?.instanceName || inst.instanceName || inst.name;
            console.log("Comparing:", name, "with:", instanceName);
            return name === instanceName;
          });
          
          console.log("Found instance:", instance);
          
          if (instance) {
            let status = instance?.instance?.status || instance?.status || instance?.state;
            console.log("Instance status:", status);

            // Fallback: some Evolution versions expose a separate connectionState endpoint
            if (!status) {
              try {
                const stateRes = await fetch(`${apiUrl}/instance/connectionState/${instanceName}`, {
                  method: "GET",
                  headers: { apikey: settings.evolution_api_key },
                });

                if (stateRes.ok) {
                  const stateData = await stateRes.json();
                  status = stateData?.instance?.state || stateData?.state || stateData?.status;
                  console.log("Fallback connectionState:", stateData, "->", status);
                }
              } catch (e) {
                console.warn("Fallback connectionState failed:", e);
              }
            }

            if (status === "open" || status === "connected") {
              setConnectionStatus("connected");
              toast.success("WhatsApp conectado e funcionando!");
            } else if (!status) {
              setConnectionStatus("unknown");
              toast.info("Instância encontrada, mas a API não retornou o status. Use o envio de teste para validar.");
            } else {
              setConnectionStatus("disconnected");
              toast.warning(`Instância existe mas não está conectada (status: ${status}). Escaneie o QR Code.`);
            }
          } else {
            setConnectionStatus("disconnected");
            toast.error(`Instância "${instanceName}" não encontrada. Verifique o nome ou gere um novo QR Code.`);
          }
        } else {
          const errorText = await response.text();
          console.error("API Error:", response.status, errorText);
          setConnectionStatus("disconnected");
          toast.error("Erro na conexão. Verifique a URL e a chave API.");
        }
      } else {
        // Test Official API
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${settings.official_phone_number_id}`,
          {
            headers: {
              "Authorization": `Bearer ${settings.official_access_token}`,
            },
          }
        );

        if (response.ok) {
          setConnectionStatus("connected");
          toast.success("API Oficial conectada com sucesso!");
        } else {
          setConnectionStatus("disconnected");
          toast.error("Erro na conexão. Verifique suas credenciais.");
        }
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      setConnectionStatus("disconnected");
      toast.error("Erro ao conectar. Verifique os dados informados.");
    } finally {
      setIsTesting(false);
    }
  };

  const sendTestMessage = async () => {
    // Use global defaults
    const apiUrl = EVOLUTION_DEFAULT_URL;
    const apiKey = EVOLUTION_GLOBAL_API_KEY;
    const instanceName = settings.evolution_instance_name || `user_${profileId.substring(0, 8)}`;

    // Use testPhone if provided, otherwise use the connected whatsapp number
    const phoneToUse = testPhone || whatsappNumber || settings.whatsapp_number;
    const formattedPhone = formatPhoneNumber(phoneToUse);
    
    if (!formattedPhone || formattedPhone.length < 12) {
      toast.error("Informe um número válido para teste");
      return;
    }

    setIsSendingTest(true);
    console.log("Sending test message to:", formattedPhone);
    console.log("Using instance:", instanceName);
    console.log("API URL:", apiUrl);

    try {
      const normalizedApiUrl = normalizeApiUrl(apiUrl);

      // First check if instance is connected
      console.log("Checking instance status before sending...");
      const checkResponse = await fetch(`${normalizedApiUrl}/instance/fetchInstances`, {
        method: "GET",
        headers: { "apikey": apiKey },
      });

      if (checkResponse.ok) {
        const instances = await checkResponse.json();
        const instanceList = Array.isArray(instances) ? instances : (instances.instances || []);
        
        const instance = instanceList.find((inst: any) => {
          const name = inst.instance?.instanceName || inst.instanceName || inst.name;
          return name === instanceName;
        });

        if (!instance) {
          console.error("Instance not found:", instanceName);
          toast.error("Instância não encontrada. Gere o QR Code primeiro.");
          setConnectionStatus("disconnected");
          return;
        }

        const status = instance?.instance?.status || instance?.status || instance?.state;
        console.log("Instance status:", status);

        if (status !== "open" && status !== "connected") {
          toast.error(`WhatsApp não está conectado (status: ${status}). Escaneie o QR Code primeiro.`);
          setConnectionStatus("disconnected");
          return;
        }
      }

      // Send the test message
      console.log("Sending message to:", `${normalizedApiUrl}/message/sendText/${instanceName}`);
      const res = await fetch(`${normalizedApiUrl}/message/sendText/${instanceName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": apiKey,
        },
        body: JSON.stringify({
          number: formattedPhone,
          text: (testMessage || "").trim() || "✅ Mensagem de teste do AcolheAqui - Sua conexão está funcionando!",
        }),
      });

      let payload: any = null;
      try {
        payload = await res.json();
      } catch {
        // ignore
      }

      console.log("Send response:", res.status, payload);

      if (!res.ok) {
        console.error("Test send failed:", res.status, payload);
        const errorMsg = payload?.message || payload?.error || `HTTP ${res.status}`;
        toast.error(`Falha ao enviar: ${errorMsg}`);
        return;
      }

      console.log("Test send success:", payload);
      toast.success("✅ Mensagem enviada! Verifique seu WhatsApp.");
      setConnectionStatus("connected");
    } catch (e) {
      console.error("Test send error:", e);
      toast.error("Erro de conexão ao enviar mensagem de teste");
    } finally {
      setIsSendingTest(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Connection Status Banner */}
      <div className={`rounded-xl p-4 flex items-center gap-3 ${
        connectionStatus === "connected" 
          ? "bg-green-500/10 border border-green-500/20" 
          : connectionStatus === "connecting"
          ? "bg-yellow-500/10 border border-yellow-500/20"
          : connectionStatus === "disconnected"
          ? "bg-red-500/10 border border-red-500/20"
          : "bg-muted/50 border border-border"
      }`}>
        {connectionStatus === "connected" ? (
          <>
            <Wifi className="h-5 w-5 text-green-500" />
            <div className="flex-1">
              <span className="text-green-400 font-medium">WhatsApp conectado e funcionando</span>
              <p className="text-green-400/70 text-sm">Notificações automáticas estão ativas</p>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Online</Badge>
          </>
        ) : connectionStatus === "connecting" ? (
          <>
            <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
            <div className="flex-1">
              <span className="text-yellow-400 font-medium">Aguardando conexão...</span>
              <p className="text-yellow-400/70 text-sm">Escaneie o QR Code com seu WhatsApp</p>
            </div>
          </>
        ) : connectionStatus === "disconnected" ? (
          <>
            <WifiOff className="h-5 w-5 text-red-500" />
            <div className="flex-1">
              <span className="text-red-400 font-medium">WhatsApp desconectado</span>
              <p className="text-red-400/70 text-sm">Configure e conecte para ativar notificações</p>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <span className="text-foreground font-medium">Status desconhecido</span>
              <p className="text-muted-foreground text-sm">Configure sua conexão abaixo</p>
            </div>
          </>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6 bg-muted/50">
          <TabsTrigger value="connection" className="gap-2">
            <QrCode className="w-4 h-4" />
            Conexão
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <Send className="w-4 h-4" />
            Estatísticas
          </TabsTrigger>
        </TabsList>

        {/* Connection Tab */}
        <TabsContent value="connection" className="space-y-6">
          {/* API Type Selection */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Smartphone className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-foreground">Tipo de Conexão</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Escolha como conectar seu WhatsApp
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={settings.whatsapp_api_type} onValueChange={(value) => handleInputChange("whatsapp_api_type", value)}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="evolution" className="gap-2">
                    <QrCode className="w-4 h-4" />
                    Via QR Code
                  </TabsTrigger>
                  <TabsTrigger value="official" className="gap-2">
                    <Smartphone className="w-4 h-4" />
                    API Oficial
                    <Badge variant="secondary" className="ml-1 text-xs">Meta</Badge>
                  </TabsTrigger>
                </TabsList>

                {/* Evolution API - QR Code Connection */}
                <TabsContent value="evolution" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* QR Code Area */}
                    <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-muted/30 border border-border min-h-[300px]">
                      {qrCode ? (
                        <div className="space-y-4 text-center">
                          <img 
                            src={qrCode} 
                            alt="QR Code WhatsApp" 
                            className="w-64 h-64 rounded-lg border border-border"
                          />
                          <p className="text-sm text-muted-foreground">
                            Escaneie com seu WhatsApp
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={generateQRCode}
                            className="gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Gerar novo QR
                          </Button>
                        </div>
                      ) : connectionStatus === "connected" ? (
                        <div className="text-center space-y-4">
                          <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                          </div>
                          <div>
                            <p className="text-foreground font-medium">WhatsApp Conectado</p>
                            <p className="text-sm text-muted-foreground">
                              Seu WhatsApp está pronto para enviar notificações
                            </p>
                            {settings.whatsapp_number && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Número: {settings.whatsapp_number}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={disconnectWhatsApp}
                            disabled={isDisconnecting}
                            className="gap-2"
                          >
                            {isDisconnecting ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Desconectando...
                              </>
                            ) : (
                              <>
                                <WifiOff className="w-4 h-4" />
                                Desconectar WhatsApp
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center space-y-4">
                          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto">
                            <QrCode className="w-12 h-12 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-foreground font-medium">Conectar WhatsApp</p>
                            <p className="text-sm text-muted-foreground mb-4">
                              Informe seu número e escaneie o QR Code
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Configuration Form - Simplified */}
                    <div className="space-y-4">
                      {connectionStatus !== "connected" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="whatsapp-number" className="text-foreground">
                              Número do WhatsApp
                            </Label>
                            <Input
                              id="whatsapp-number"
                              value={whatsappNumber}
                              onChange={(e) => setWhatsappNumber(e.target.value)}
                              placeholder="Ex: (11) 91234-5678"
                              className="bg-background border-border"
                            />
                            <p className="text-xs text-muted-foreground">
                              Informe o número com DDD que será conectado
                            </p>
                          </div>

                          <Button
                            onClick={generateQRCode}
                            disabled={isGeneratingQR || !whatsappNumber}
                            className="w-full gap-2"
                          >
                            {isGeneratingQR ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Gerando QR Code...
                              </>
                            ) : (
                              <>
                                <QrCode className="w-4 h-4" />
                                Gerar QR Code
                              </>
                            )}
                          </Button>
                        </>
                      )}

                      {/* Test message section - always visible when connected or has instance */}
                      {(connectionStatus === "connected" || settings.evolution_instance_name) && (
                        <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
                          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Send className="h-4 w-4" />
                            Testar conexão com mensagem
                          </div>
                          
                          <p className="text-xs text-muted-foreground">
                            Envie uma mensagem de teste para validar se a conexão está funcionando
                          </p>

                          <div className="space-y-2">
                            <Label htmlFor="test-phone" className="text-foreground">Número para teste (com DDD)</Label>
                            <Input
                              id="test-phone"
                              value={testPhone}
                              onChange={(e) => setTestPhone(e.target.value)}
                              placeholder={whatsappNumber || "Ex: (11) 91234-5678"}
                              className="bg-background border-border"
                            />
                            <p className="text-xs text-muted-foreground">
                              Deixe em branco para enviar ao número conectado
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="test-message" className="text-foreground">Mensagem (opcional)</Label>
                            <Input
                              id="test-message"
                              value={testMessage}
                              onChange={(e) => setTestMessage(e.target.value)}
                              placeholder="Mensagem de teste padrão"
                              className="bg-background border-border"
                            />
                          </div>

                          <Button
                            onClick={sendTestMessage}
                            disabled={isSendingTest}
                            className="w-full gap-2 bg-green-600 hover:bg-green-700"
                          >
                            {isSendingTest ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Enviando mensagem...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4" />
                                📱 Enviar mensagem de teste
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Official WhatsApp API Config */}
                <TabsContent value="official" className="space-y-4">
                  {/* Info Box - Vantagens */}
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-green-400">API Oficial do WhatsApp Business</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>✅ <strong>Mais segura</strong> - Conexão direta com servidores do Meta</li>
                          <li>✅ <strong>Sem risco de banimento</strong> - Uso aprovado oficialmente</li>
                          <li>✅ <strong>Selo verificado</strong> - Conta verificada pelo WhatsApp</li>
                          <li>✅ <strong>Maior estabilidade</strong> - SLA garantido pelo Meta</li>
                          <li>✅ <strong>Templates aprovados</strong> - Mensagens pré-aprovadas</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Info Box - Custos */}
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-yellow-400">Custos da API Oficial</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>💰 <strong>Primeiras 1.000 conversas/mês:</strong> Gratuitas</li>
                          <li>💰 <strong>Conversas de serviço:</strong> ~R$ 0,25 por conversa</li>
                          <li>💰 <strong>Conversas de marketing:</strong> ~R$ 0,60 por conversa</li>
                          <li>💰 <strong>Conversas de autenticação:</strong> ~R$ 0,30 por conversa</li>
                        </ul>
                        <p className="text-xs text-muted-foreground mt-2">
                          * Preços aproximados, podem variar por região. Consulte a <a href="https://developers.facebook.com/docs/whatsapp/pricing" target="_blank" rel="noopener noreferrer" className="underline text-yellow-400">tabela oficial</a>.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Info Box - Como configurar */}
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-start gap-3">
                      <ExternalLink className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-blue-400">Como obter as credenciais</p>
                        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                          <li>Acesse o <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="underline text-blue-400">Meta Business Suite</a></li>
                          <li>Crie ou selecione uma conta Meta Business verificada</li>
                          <li>Vá em <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="underline text-blue-400">Meta for Developers</a> e crie um app</li>
                          <li>Adicione o produto "WhatsApp" ao seu app</li>
                          <li>Configure um número de telefone comercial</li>
                          <li>Gere um token de acesso permanente</li>
                        </ol>
                        <p className="text-xs text-muted-foreground mt-2">
                          📖 <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" rel="noopener noreferrer" className="underline text-blue-400">Guia completo de configuração</a>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="official-phone-id" className="text-foreground flex items-center gap-2">
                      Phone Number ID
                      {officialFieldsTouched.phone_number_id && (
                        phoneNumberIdValidation.valid ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )
                      )}
                    </Label>
                    <Input
                      id="official-phone-id"
                      value={settings.official_phone_number_id}
                      onChange={(e) => handleOfficialFieldChange("official_phone_number_id", e.target.value)}
                      onBlur={() => setOfficialFieldsTouched(prev => ({ ...prev, phone_number_id: true }))}
                      placeholder="Ex: 123456789012345"
                      className={`bg-background ${getFieldBorderClass(officialFieldsTouched.phone_number_id, phoneNumberIdValidation.valid)}`}
                    />
                    {officialFieldsTouched.phone_number_id && !phoneNumberIdValidation.valid ? (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {phoneNumberIdValidation.message}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Encontre em: Meta for Developers → Seu App → WhatsApp → Configuração da API
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="official-token" className="text-foreground flex items-center gap-2">
                      Access Token
                      {officialFieldsTouched.access_token && (
                        accessTokenValidation.valid ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )
                      )}
                    </Label>
                    <Input
                      id="official-token"
                      type="password"
                      value={settings.official_access_token}
                      onChange={(e) => handleOfficialFieldChange("official_access_token", e.target.value)}
                      onBlur={() => setOfficialFieldsTouched(prev => ({ ...prev, access_token: true }))}
                      placeholder="Seu token de acesso permanente"
                      className={`bg-background ${getFieldBorderClass(officialFieldsTouched.access_token, accessTokenValidation.valid)}`}
                    />
                    {officialFieldsTouched.access_token && !accessTokenValidation.valid ? (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {accessTokenValidation.message}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Gere um token permanente em: Configuração da API → Tokens de acesso
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="official-business-id" className="text-foreground flex items-center gap-2">
                      Business Account ID
                      {officialFieldsTouched.business_account_id && (
                        businessAccountIdValidation.valid ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )
                      )}
                    </Label>
                    <Input
                      id="official-business-id"
                      value={settings.official_business_account_id}
                      onChange={(e) => handleOfficialFieldChange("official_business_account_id", e.target.value)}
                      onBlur={() => setOfficialFieldsTouched(prev => ({ ...prev, business_account_id: true }))}
                      placeholder="Ex: 987654321098765"
                      className={`bg-background ${getFieldBorderClass(officialFieldsTouched.business_account_id, businessAccountIdValidation.valid)}`}
                    />
                    {officialFieldsTouched.business_account_id && !businessAccountIdValidation.valid ? (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {businessAccountIdValidation.message}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Encontre em: Meta Business Suite → Configurações → Informações da conta
                      </p>
                    )}
                  </div>

                  {/* Validation Summary */}
                  {(officialFieldsTouched.phone_number_id || officialFieldsTouched.access_token || officialFieldsTouched.business_account_id) && !isOfficialApiFormValid && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Preencha todos os campos corretamente para testar a conexão
                      </p>
                    </div>
                  )}

                  {isOfficialApiFormValid && (
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-sm text-green-500 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Todos os campos estão válidos. Você pode testar a conexão.
                      </p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    onClick={testConnection}
                    disabled={isTesting || !isOfficialApiFormValid}
                    className="w-full gap-2"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <Wifi className="h-4 w-4" />
                        Testar Conexão
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Bell className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground">Notificações Automáticas</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Configure quais notificações serão enviadas
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="is-active" className="text-foreground">Ativar</Label>
                  <Switch
                    id="is-active"
                    checked={settings.is_active}
                    onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Confirmation */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${settings.confirmation_enabled ? "bg-green-500/10" : "bg-muted"}`}>
                    <Calendar className={`h-5 w-5 ${settings.confirmation_enabled ? "text-green-500" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Confirmação de Agendamento</p>
                    <p className="text-sm text-muted-foreground">Enviar mensagem quando um novo agendamento for criado</p>
                  </div>
                </div>
                <Switch
                  checked={settings.confirmation_enabled}
                  onCheckedChange={(checked) => handleInputChange("confirmation_enabled", checked)}
                />
              </div>

              {/* Reminder */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${settings.reminder_enabled ? "bg-yellow-500/10" : "bg-muted"}`}>
                      <Clock className={`h-5 w-5 ${settings.reminder_enabled ? "text-yellow-500" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">Lembrete de Consulta</p>
                      <p className="text-sm text-muted-foreground">Enviar lembrete antes da consulta</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.reminder_enabled}
                    onCheckedChange={(checked) => handleInputChange("reminder_enabled", checked)}
                  />
                </div>

                {settings.reminder_enabled && (
                  <div className="ml-12 space-y-2">
                    <Label className="text-foreground">Enviar lembrete</Label>
                    <Select
                      value={String(settings.reminder_hours_before)}
                      onValueChange={(value) => handleInputChange("reminder_hours_before", parseInt(value))}
                    >
                      <SelectTrigger className="w-48 bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hora antes</SelectItem>
                        <SelectItem value="2">2 horas antes</SelectItem>
                        <SelectItem value="6">6 horas antes</SelectItem>
                        <SelectItem value="12">12 horas antes</SelectItem>
                        <SelectItem value="24">24 horas antes</SelectItem>
                        <SelectItem value="48">48 horas antes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Email notification info */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">E-mail de Confirmação</p>
                    <p className="text-sm text-muted-foreground">Enviado para o cliente após agendamento</p>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Sempre Ativo</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <NotificationTemplatesEditor
            templates={{
              clientConfirmation: settings.template_client_confirmation || DEFAULT_TEMPLATES.clientConfirmation,
              clientReminder: settings.template_client_reminder || DEFAULT_TEMPLATES.clientReminder,
              professionalNotification: settings.template_professional_notification || DEFAULT_TEMPLATES.professionalNotification,
              emailConfirmation: settings.template_email_confirmation || DEFAULT_TEMPLATES.emailConfirmation,
            }}
            onTemplatesChange={(templates) => {
              setSettings(prev => ({
                ...prev,
                template_client_confirmation: templates.clientConfirmation,
                template_client_reminder: templates.clientReminder,
                template_professional_notification: templates.professionalNotification,
                template_email_confirmation: templates.emailConfirmation,
              }));
            }}
          />
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Send className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-muted-foreground text-sm">Total Enviadas</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{stats.total_sent}</p>
                <p className="text-muted-foreground text-xs mt-1">este mês</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="text-muted-foreground text-sm">Confirmações</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{stats.confirmations_sent}</p>
                <p className="text-muted-foreground text-xs mt-1">novos agendamentos</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-500" />
                  </div>
                  <span className="text-muted-foreground text-sm">Lembretes</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{stats.reminders_sent}</p>
                <p className="text-muted-foreground text-xs mt-1">enviados antes das consultas</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default WhatsAppIntegrationPage;
