import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PagamentoPendente = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isChecking, setIsChecking] = useState(false);
  const [checkCount, setCheckCount] = useState(0);
  const { toast } = useToast();
  
  const paymentId = searchParams.get('payment_id');
  const externalRef = searchParams.get('external_reference');

  const checkPaymentStatus = async () => {
    if (!paymentId) return;
    
    setIsChecking(true);
    
    try {
      const response = await fetch(`/api/payments/${paymentId}`);
      const paymentDetails = await response.json();
      
      if (response.ok) {
        switch (paymentDetails.status) {
          case 'approved':
            toast({
              title: "Pagamento confirmado!",
              description: "Redirecionando para página de sucesso..."
            });
            setTimeout(() => {
              navigate(`/pagamento/sucesso?payment_id=${paymentId}&external_reference=${externalRef}`);
            }, 2000);
            break;
          case 'rejected':
            toast({
              variant: "destructive",
              title: "Pagamento rejeitado",
              description: "Redirecionando para página de erro..."
            });
            setTimeout(() => {
              navigate(`/pagamento/erro?payment_id=${paymentId}&status_detail=${paymentDetails.status_detail}`);
            }, 2000);
            break;
          case 'pending':
            toast({
              title: "Ainda pendente",
              description: "O pagamento ainda está sendo processado."
            });
            setCheckCount(prev => prev + 1);
            break;
        }
      }
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      toast({
        variant: "destructive",
        title: "Erro de verificação",
        description: "Não foi possível verificar o status do pagamento."
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Verificar automaticamente a cada 30 segundos
    if (paymentId && checkCount < 10) { // Máximo 10 verificações (5 minutos)
      const interval = setInterval(checkPaymentStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [paymentId, checkCount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl text-yellow-800">
            Pagamento Pendente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-gray-600">
            <p className="mb-4">
              Seu pagamento está sendo processado. Isso pode levar alguns minutos.
            </p>
            <p className="text-sm">
              Você será notificado assim que o pagamento for confirmado.
            </p>
          </div>

          {paymentId && (
            <div className="bg-gray-50 p-4 rounded-lg text-left">
              <h3 className="font-semibold mb-2">Detalhes do Pagamento</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>ID do Pagamento:</span>
                  <span className="font-mono">{paymentId}</span>
                </div>
                {externalRef && (
                  <div className="flex justify-between">
                    <span>Referência:</span>
                    <span className="font-mono">{externalRef}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-yellow-600 font-semibold">Pendente</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {checkCount > 0 && (
              <div className="text-sm text-gray-500">
                Verificações realizadas: {checkCount}/10
              </div>
            )}

            <div className="text-left bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Possíveis motivos da pendência
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• PIX: Aguardando confirmação bancária</li>
                <li>• Boleto: Aguardando compensação</li>
                <li>• Cartão: Análise antifraude</li>
                <li>• Débito: Processamento bancário</li>
              </ul>
            </div>

            <div className="text-left bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Não se preocupe
              </h4>
              <p className="text-sm text-green-700">
                Sua consulta está reservada. Assim que o pagamento for confirmado, 
                você receberá um e-mail com todos os detalhes.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex-1"
            >
              Voltar ao Início
            </Button>
            <Button
              onClick={checkPaymentStatus}
              disabled={isChecking}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isChecking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Verificar Status
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PagamentoPendente;