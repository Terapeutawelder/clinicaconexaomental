import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Wallet, ArrowLeft } from "lucide-react";
import CardPaymentComponent from './CardPayment';
import PIXPaymentComponent from './PIXPayment';

interface PaymentFlowProps {
  amount: number;
  description: string;
  planName: string;
  planDuration: string;
  appointmentData?: any;
  onBack: () => void;
  onPaymentSuccess?: (paymentData: any) => void;
  onPaymentError?: (error: any) => void;
}

const PaymentFlow: React.FC<PaymentFlowProps> = ({
  amount,
  description,
  planName,
  planDuration,
  appointmentData,
  onBack,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'pix'>('pix');
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const handlePaymentSuccess = (paymentData: any) => {
    setPaymentCompleted(true);
    onPaymentSuccess?.(paymentData);
  };

  const handlePaymentError = (error: any) => {
    console.error('Erro no pagamento:', error);
    onPaymentError?.(error);
  };

  const handlePaymentPending = (paymentData: any) => {
    console.log('Pagamento pendente:', paymentData);
    // Pode implementar lógica específica para pagamentos pendentes
  };

  if (paymentCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Pagamento Confirmado!
              </h2>
              <p className="text-gray-600 mb-4">
                Sua consulta foi agendada com sucesso.
              </p>
              <Badge className="bg-green-100 text-green-800 text-sm">
                Consulta confirmada
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg text-left">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Plano:</span>
                  <span>{planName}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Duração:</span>
                  <span>{planDuration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Valor:</span>
                  <span className="font-bold">R$ {amount.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
              
              <Button 
                onClick={() => window.location.href = '/'}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Finalizar Pagamento</h1>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                ✓
              </div>
              <span className="font-medium text-green-600">Data e Horário</span>
            </div>
            <div className="w-16 h-px bg-gray-300"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                2
              </div>
              <span className="font-medium text-purple-600">Pagamento</span>
            </div>
          </div>
        </div>

        {/* Resumo da consulta */}
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle>Resumo da Consulta</CardTitle>
            <CardDescription>
              Confirme os dados da sua consulta antes de prosseguir com o pagamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Plano selecionado:</span>
                  <span>{planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Duração:</span>
                  <span>{planDuration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Descrição:</span>
                  <span className="text-gray-600">{description}</span>
                </div>
              </div>
              
              <div className="md:text-right">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 mb-1">Valor total</p>
                  <p className="text-2xl font-bold text-purple-800">
                    R$ {amount.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seleção de método de pagamento */}
        <div className="max-w-4xl mx-auto">
          <Tabs value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as 'card' | 'pix')}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="pix" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                PIX - Instantâneo
              </TabsTrigger>
              <TabsTrigger value="card" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Cartão de Crédito/Débito
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pix">
              <PIXPaymentComponent
                amount={amount}
                description={`${planName} - ${description}`}
                appointmentData={appointmentData}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onPending={handlePaymentPending}
              />
            </TabsContent>

            <TabsContent value="card">
              <CardPaymentComponent
                amount={amount}
                description={`${planName} - ${description}`}
                appointmentData={appointmentData}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onPending={handlePaymentPending}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Informações de segurança */}
        <Card className="max-w-2xl mx-auto mt-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold mb-4">Pagamento 100% Seguro</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <span>Dados protegidos por SSL</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>Certificado PCI DSS</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span>Mercado Pago</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentFlow;