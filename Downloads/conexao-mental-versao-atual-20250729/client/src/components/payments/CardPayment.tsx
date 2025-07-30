import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Shield, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Instância global do Mercado Pago será criada quando necessário
declare global {
  interface Window {
    MercadoPago: any;
    mp: any;
  }
}

// Chave pública fixa do Mercado Pago (conforme fornecida pelo usuário)
const MP_PUBLIC_KEY = "APP_USR-76d2072e-2c20-49db-9c16-5915392a01d3";

// Função para inicializar Mercado Pago usando o SDK global
const initializeMercadoPago = async (amount: number, description: string, appointmentData: any, onSuccess?: (data: any) => void, onError?: (error: any) => void, onPending?: (data: any) => void) => {
  try {
    // Verificar se o SDK foi carregado
    if (!window.MercadoPago) {
      console.error('SDK do Mercado Pago não carregado');
      return false;
    }

    // Inicializar usando o SDK global com chave fixa
    window.mp = new window.MercadoPago(MP_PUBLIC_KEY);
    console.log('Mercado Pago inicializado com sucesso via SDK global');
    
    // Criar o Brick de pagamento com cartão
    const bricksBuilder = window.mp.bricks();
    const settings = {
      initialization: {
        amount: amount,
      },
      customization: {
        visual: {
          style: {
            theme: 'default'
          }
        },
        paymentMethods: {
          maxInstallments: 12,
          minInstallments: 1
        }
      },
      callbacks: {
        onReady: () => {
          console.log('Brick de pagamento carregado');
        },
        onSubmit: async (cardFormData: any) => {
          console.log('Dados do cartão:', cardFormData);
          return new Promise((resolve, reject) => {
            const paymentData = {
              ...cardFormData,
              description,
              appointmentData
            };

            fetch("/api/payments/process", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(paymentData),
            })
            .then(resp => resp.json())
            .then((response) => {
              if (response.error) {
                onError?.(response);
                reject(response);
              } else {
                switch (response.status) {
                  case 'approved':
                    onSuccess?.(response);
                    break;
                  case 'pending':
                    onPending?.(response);
                    break;
                  default:
                    onError?.(response);
                }
                resolve(response);
              }
            })
            .catch((error) => {
              console.error("Erro no pagamento:", error);
              onError?.(error);
              reject(error);
            });
          });
        },
        onError: (error: any) => {
          console.error('Erro no brick de pagamento:', error);
          onError?.(error);
        }
      }
    };

    try {
      await bricksBuilder.create('cardPayment', 'cardPaymentBrick_container', settings);
      return true;
    } catch (error) {
      console.error('Erro ao criar brick de pagamento:', error);
      return false;
    }
  } catch (error) {
    console.error('Erro ao inicializar Mercado Pago:', error);
    return false;
  }
};

interface CardPaymentComponentProps {
  amount: number;
  description: string;
  appointmentData?: any;
  onSuccess?: (paymentData: any) => void;
  onError?: (error: any) => void;
  onPending?: (paymentData: any) => void;
}

const CardPaymentComponent: React.FC<CardPaymentComponentProps> = ({
  amount,
  description,
  appointmentData,
  onSuccess,
  onError,
  onPending
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [mpInitialized, setMpInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Aguardar o SDK ser carregado antes de inicializar (apenas uma vez)
    if (!mpInitialized) {
      const checkSDKAndInitialize = async () => {
        // Aguardar um pouco para o SDK ser carregado
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const success = await initializeMercadoPago(amount, description, appointmentData, onSuccess, onError, onPending);
        setMpInitialized(success);
        
        if (!success) {
          toast({
            title: "Erro de Configuração",
            description: "Não foi possível inicializar o sistema de pagamento",
            variant: "destructive",
          });
        }
      };

      checkSDKAndInitialize();
    }
  }, []);  // Dependências removidas para evitar loop infinito

  // Configurações removidas pois agora são definidas na inicialização do Brick

  // Callbacks movidos para dentro da inicialização do Brick

  if (!mpInitialized) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Carregando...</CardTitle>
          <CardDescription>
            Inicializando sistema de pagamento...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Informações do pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pagamento Seguro
          </CardTitle>
          <CardDescription>
            Todos os dados são criptografados e protegidos pelo Mercado Pago
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Valor da consulta:</span>
            <Badge variant="secondary" className="text-lg font-bold">
              R$ {amount.toFixed(2).replace('.', ',')}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Descrição:</span>
            <span className="text-gray-600">{description}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Shield className="h-4 w-4" />
              <span>Seguro</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Clock className="h-4 w-4" />
              <span>Processamento rápido</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-purple-600">
              <CheckCircle className="h-4 w-4" />
              <span>Confirmação imediata</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Componente de pagamento do Mercado Pago */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Cartão</CardTitle>
          <CardDescription>
            Insira as informações do seu cartão de crédito ou débito
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-2">Processando pagamento...</span>
            </div>
          ) : (
            <div id="cardPaymentBrick_container"></div>
          )}
        </CardContent>
      </Card>

      {/* Métodos de pagamento aceitos */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">Aceitamos os principais cartões:</p>
            <div className="flex justify-center gap-4 opacity-70">
              <img src="https://http2.mlstatic.com/storage/logos-api-admin/51b446b0-571c-11e7-9a5d-2bf86ea5db15-m.svg" alt="Visa" className="h-8" />
              <img src="https://http2.mlstatic.com/storage/logos-api-admin/aa2b8f70-5c85-11e7-ad8d-3b375bca5235-m.svg" alt="Mastercard" className="h-8" />
              <img src="https://http2.mlstatic.com/storage/logos-api-admin/ce454480-445f-11e8-9bf7-69b9a01b6c99-m.svg" alt="American Express" className="h-8" />
              <img src="https://http2.mlstatic.com/storage/logos-api-admin/8d7a1c90-445f-11e8-bdbd-c7f2b9f4e162-m.svg" alt="Elo" className="h-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CardPaymentComponent;