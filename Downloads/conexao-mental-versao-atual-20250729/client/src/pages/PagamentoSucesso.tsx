import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, Clock, User } from "lucide-react";

const PagamentoSucesso = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const paymentId = searchParams.get('payment_id');
  const externalRef = searchParams.get('external_reference');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">
            Pagamento Aprovado!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-gray-600">
            <p className="mb-4">
              Seu pagamento foi processado com sucesso e sua consulta foi confirmada.
            </p>
            <p className="text-sm">
              Você receberá um e-mail de confirmação com todos os detalhes do agendamento.
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
                  <span className="text-green-600 font-semibold">Aprovado</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-left bg-blue-50 p-4 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-800">Próximos passos</h4>
                <p className="text-sm text-blue-700">
                  Aguarde o contato do profissional para confirmar detalhes da sessão
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-left bg-purple-50 p-4 rounded-lg">
              <User className="h-6 w-6 text-purple-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-purple-800">Suporte</h4>
                <p className="text-sm text-purple-700">
                  Dúvidas? Entre em contato pelo WhatsApp: (11) 99999-9999
                </p>
              </div>
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
              onClick={() => navigate('/minha-conta')}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              Minha Conta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PagamentoSucesso;