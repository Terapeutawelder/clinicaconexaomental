import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, QrCode, Copy, Clock, CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PIXPaymentComponentProps {
  amount: number;
  description: string;
  appointmentData?: any;
  onSuccess?: (paymentData: any) => void;
  onError?: (error: any) => void;
  onPending?: (paymentData: any) => void;
}

const PIXPaymentComponent: React.FC<PIXPaymentComponentProps> = ({
  amount,
  description,
  appointmentData,
  onSuccess,
  onError,
  onPending
}) => {
  const [pixData, setPixData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const [checkingPayment, setCheckingPayment] = useState(false);
  const { toast } = useToast();

  const generatePIX = async () => {
    setIsLoading(true);
    
    try {
      const preferenceData = {
        items: [
          {
            title: description,
            quantity: 1,
            unit_price: amount,
            currency_id: 'BRL'
          }
        ],
        payment_methods: {
          excluded_payment_types: [
            { id: 'credit_card' },
            { id: 'debit_card' },
            { id: 'ticket' }
          ],
          installments: 1
        },
        external_reference: `appointment_${Date.now()}`,
        statement_descriptor: 'CONEXAO MENTAL'
      };

      const response = await fetch('/api/payments/preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferenceData)
      });

      const data = await response.json();
      
      if (response.ok) {
        setPixData(data);
        setPaymentStatus('pending');
        toast({
          title: "PIX gerado com sucesso!",
          description: "Escaneie o QR Code ou copie o código PIX para pagar."
        });
      } else {
        throw new Error(data.message || 'Erro ao gerar PIX');
      }
    } catch (error: any) {
      console.error('Erro ao gerar PIX:', error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar PIX",
        description: error.message || "Não foi possível gerar o PIX. Tente novamente."
      });
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyPixCode = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      toast({
        title: "Código PIX copiado!",
        description: "Cole o código no seu app bancário para pagar."
      });
    }
  };

  const checkPaymentStatus = async () => {
    if (!pixData?.id) return;
    
    setCheckingPayment(true);
    
    try {
      const response = await fetch(`/api/payments/${pixData.id}`);
      const paymentDetails = await response.json();
      
      if (response.ok) {
        setPaymentStatus(paymentDetails.status);
        
        switch (paymentDetails.status) {
          case 'approved':
            toast({
              title: "Pagamento confirmado!",
              description: "Sua consulta foi agendada com sucesso."
            });
            onSuccess?.(paymentDetails);
            break;
          case 'pending':
            toast({
              title: "Pagamento pendente",
              description: "Ainda aguardando a confirmação do PIX."
            });
            onPending?.(paymentDetails);
            break;
          case 'rejected':
            toast({
              variant: "destructive",
              title: "Pagamento rejeitado",
              description: "O PIX foi rejeitado. Tente gerar um novo."
            });
            onError?.(paymentDetails);
            break;
        }
      } else {
        throw new Error('Erro ao consultar status');
      }
    } catch (error: any) {
      console.error('Erro ao verificar pagamento:', error);
      toast({
        variant: "destructive",
        title: "Erro de verificação",
        description: "Não foi possível verificar o status do pagamento."
      });
    } finally {
      setCheckingPayment(false);
    }
  };

  const getStatusBadge = () => {
    switch (paymentStatus) {
      case 'approved':
        return <Badge className="bg-green-600">Pago</Badge>;
      case 'pending':
        return <Badge variant="secondary">Aguardando</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">Não iniciado</Badge>;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Informações do pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Pagamento via PIX
          </CardTitle>
          <CardDescription>
            Pagamento instantâneo e seguro através do PIX
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
            <span className="font-medium">Status:</span>
            {getStatusBadge()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Instantâneo</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Clock className="h-4 w-4" />
              <span>Disponível 24h</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-purple-600">
              <Wallet className="h-4 w-4" />
              <span>Sem taxas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gerar PIX */}
      {!pixData && (
        <Card>
          <CardHeader>
            <CardTitle>Gerar Código PIX</CardTitle>
            <CardDescription>
              Clique para gerar o código PIX para pagamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={generatePIX} 
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Gerando PIX...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Gerar PIX
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Código PIX gerado */}
      {pixData && (
        <Card>
          <CardHeader>
            <CardTitle>PIX Gerado com Sucesso!</CardTitle>
            <CardDescription>
              Escaneie o QR Code ou copie o código PIX para fazer o pagamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code mockup - em produção seria gerado pelo Mercado Pago */}
            <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 text-center">
              <QrCode className="h-32 w-32 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-600">
                QR Code para pagamento PIX
              </p>
            </div>

            {/* Código PIX (simulado) */}
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Código PIX:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyPixCode}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copiar
                  </Button>
                </div>
                <code className="text-xs break-all text-gray-700">
                  {pixData.id || `00020126580014br.gov.bcb.pix01368e9d8f9c-a1b2-3c4d-5e6f-7g8h9i0j1k2l5204000053039865802BR5925CONEXAO MENTAL LTDA6009Sao Paulo62070503***6304XXXX`}
                </code>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">Instruções:</p>
                    <ol className="list-decimal list-inside text-yellow-700 mt-2 space-y-1">
                      <li>Abra o app do seu banco</li>
                      <li>Escolha a opção PIX</li>
                      <li>Escaneie o QR Code ou cole o código</li>
                      <li>Confirme o pagamento</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={checkPaymentStatus}
                  disabled={checkingPayment}
                  variant="outline"
                  className="flex-1"
                >
                  {checkingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Verificando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Verificar Status
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => {
                    setPixData(null);
                    setPaymentStatus('pending');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Gerar Novo PIX
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações adicionais */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">PIX disponível em todos os bancos:</p>
            <div className="flex justify-center gap-4 opacity-70 text-xs">
              <span>Banco do Brasil</span>
              <span>Bradesco</span>
              <span>Itaú</span>
              <span>Santander</span>
              <span>Caixa</span>
              <span>Nubank</span>
              <span>+300 bancos</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PIXPaymentComponent;