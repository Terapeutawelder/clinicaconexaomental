import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, RefreshCw, HelpCircle, ArrowLeft } from "lucide-react";

const PagamentoErro = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const paymentId = searchParams.get('payment_id');
  const statusDetail = searchParams.get('status_detail');

  const getErrorMessage = (detail: string | null) => {
    switch (detail) {
      case 'cc_rejected_insufficient_amount':
        return 'Saldo insuficiente no cartão';
      case 'cc_rejected_bad_filled_security_code':
        return 'Código de segurança inválido';
      case 'cc_rejected_bad_filled_date':
        return 'Data de vencimento inválida';
      case 'cc_rejected_bad_filled_card_number':
        return 'Número do cartão inválido';
      case 'cc_rejected_high_risk':
        return 'Pagamento rejeitado por segurança';
      default:
        return 'Ocorreu um erro no processamento do pagamento';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-800">
            Pagamento Não Aprovado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-gray-600">
            <p className="mb-4">
              {getErrorMessage(statusDetail)}
            </p>
            <p className="text-sm">
              Por favor, verifique os dados e tente novamente ou escolha outro método de pagamento.
            </p>
          </div>

          {paymentId && (
            <div className="bg-gray-50 p-4 rounded-lg text-left">
              <h3 className="font-semibold mb-2">Detalhes do Erro</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>ID da Tentativa:</span>
                  <span className="font-mono">{paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-red-600 font-semibold">Rejeitado</span>
                </div>
                {statusDetail && (
                  <div className="flex justify-between">
                    <span>Detalhes:</span>
                    <span className="text-red-600">{getErrorMessage(statusDetail)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="text-left bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                O que fazer agora?
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Verifique os dados do cartão</li>
                <li>• Confirme se há saldo disponível</li>
                <li>• Tente outro cartão ou PIX</li>
                <li>• Entre em contato com seu banco</li>
              </ul>
            </div>

            <div className="text-left bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Suporte</h4>
              <p className="text-sm text-yellow-700">
                Precisa de ajuda? Entre em contato:
              </p>
              <p className="text-sm text-yellow-700 font-semibold">
                WhatsApp: (11) 99999-9999
              </p>
              <p className="text-sm text-yellow-700 font-semibold">
                Email: suporte@conexaomental.com.br
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PagamentoErro;