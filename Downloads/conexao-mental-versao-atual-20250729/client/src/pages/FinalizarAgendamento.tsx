import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, Calendar, Clock, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PaymentFlow from '@/components/payments/PaymentFlow';

const FinalizarAgendamento = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1); // 1: Dados, 2: Pagamento
  const [patientData, setPatientData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    notes: ''
  });

  // Extrair dados da URL
  const professionalId = searchParams.get('professional') || '1';
  const selectedDate = searchParams.get('date') || '';
  const selectedTime = searchParams.get('time') || '';
  const planType = searchParams.get('plan') || 'psicoterapia';

  // Dados do plano selecionado
  const planData = {
    'acolhimento': {
      name: 'Sessão de Acolhimento',
      price: 37.90,
      duration: '25 minutos',
      description: 'Primeira consulta de acolhimento'
    },
    'psicoterapia': {
      name: 'Sessão de Psicoterapia',
      price: 57.90,
      duration: '45 minutos',
      description: 'Sessão completa de psicoterapia'
    },
    'casal': {
      name: 'Terapia de Casal',
      price: 97.90,
      duration: '60 minutos',
      description: 'Sessão especializada para casais'
    },
    'hipnoterapia': {
      name: 'Sessão de Hipnoterapia',
      price: 197.90,
      duration: '60 minutos',
      description: 'Sessão com técnicas de hipnoterapia'
    }
  };

  const currentPlan = planData[planType as keyof typeof planData] || planData.psicoterapia;

  const handleInputChange = (field: string, value: string) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    // Validar dados obrigatórios
    if (!patientData.name || !patientData.email || !patientData.phone) {
      toast({
        variant: "destructive",
        title: "Dados obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios."
      });
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(patientData.email)) {
      toast({
        variant: "destructive",
        title: "Email inválido",
        description: "Por favor, insira um email válido."
      });
      return;
    }

    setCurrentStep(2);
  };

  const handlePaymentSuccess = (paymentData: any) => {
    toast({
      title: "Consulta agendada com sucesso!",
      description: "Você receberá um e-mail de confirmação em breve."
    });
    
    // Redirecionar para página de sucesso
    navigate(`/pagamento/sucesso?payment_id=${paymentData.id}&external_reference=${paymentData.external_reference || ''}`);
  };

  const handlePaymentError = (error: any) => {
    console.error('Erro no pagamento:', error);
    toast({
      variant: "destructive",
      title: "Erro no pagamento",
      description: "Ocorreu um erro ao processar o pagamento. Tente novamente."
    });
  };

  const appointmentData = {
    professionalId,
    date: selectedDate,
    time: selectedTime,
    planType,
    patientData,
    amount: currentPlan.price
  };

  if (currentStep === 2) {
    return (
      <PaymentFlow
        amount={currentPlan.price}
        description={currentPlan.description}
        planName={currentPlan.name}
        planDuration={currentPlan.duration}
        appointmentData={appointmentData}
        onBack={() => setCurrentStep(1)}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Finalizar Agendamento</h1>
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
                1
              </div>
              <span className="font-medium text-purple-600">Dados Pessoais</span>
            </div>
            <div className="w-16 h-px bg-gray-300"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                2
              </div>
              <span className="text-gray-500">Pagamento</span>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-8">
          {/* Resumo da consulta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Resumo da Consulta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Plano:</span>
                    <span>{currentPlan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Data:</span>
                    <span>{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Horário:</span>
                    <span>{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Duração:</span>
                    <span>{currentPlan.duration}</span>
                  </div>
                </div>
                
                <div className="md:text-right">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 mb-1">Valor total</p>
                    <p className="text-2xl font-bold text-purple-800">
                      R$ {currentPlan.price.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulário de dados pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados Pessoais
              </CardTitle>
              <CardDescription>
                Preencha seus dados para finalizar o agendamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome completo"
                    value={patientData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Idade</Label>
                  <Select value={patientData.age} onValueChange={(value) => handleInputChange('age', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione sua idade" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 80 }, (_, i) => i + 18).map(age => (
                        <SelectItem key={age} value={age.toString()}>
                          {age} anos
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={patientData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={patientData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Conte um pouco sobre o que te trouxe até aqui ou qualquer informação relevante para o profissional..."
                  rows={4}
                  value={patientData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Antes da sua consulta:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Escolha um local privado e silencioso</li>
                  <li>• Teste sua conexão de internet e câmera</li>
                  <li>• Tenha um copo d'água por perto</li>
                  <li>• Deixe papel e caneta à disposição</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleNextStep}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              Continuar para Pagamento
              <CreditCard className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalizarAgendamento;