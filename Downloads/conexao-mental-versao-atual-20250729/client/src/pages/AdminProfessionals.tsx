import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Users, Clock, UserCheck } from "lucide-react";

interface Professional {
  id: string;
  user_id: string;
  email: string;
  crp: string;
  specialties: string[];
  bio: string;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

const AdminProfessionals = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: professionals, isLoading } = useQuery({
    queryKey: ['/api/professionals'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const approveProfessional = useMutation({
    mutationFn: async (professionalId: string) => {
      const response = await fetch(`/api/professionals/${professionalId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao aprovar profissional');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profissional aprovado!",
        description: "O profissional pode agora acessar a área profissional.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/professionals'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const rejectProfessional = useMutation({
    mutationFn: async (professionalId: string) => {
      const response = await fetch(`/api/professionals/${professionalId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao rejeitar profissional');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profissional rejeitado",
        description: "O profissional foi rejeitado e não pode acessar a área profissional.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/professionals'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const pendingProfessionals = professionals?.filter((p: Professional) => !p.approved) || [];
  const approvedProfessionals = professionals?.filter((p: Professional) => p.approved) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">Carregando profissionais...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Profissionais</h1>
          <p className="text-gray-600">Aprove ou rejeite profissionais que solicitaram acesso à plataforma</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Aguardando Aprovação</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingProfessionals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Profissionais Aprovados</p>
                  <p className="text-2xl font-bold text-gray-900">{approvedProfessionals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Profissionais</p>
                  <p className="text-2xl font-bold text-gray-900">{professionals?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profissionais Pendentes */}
        {pendingProfessionals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Aguardando Aprovação</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingProfessionals.map((professional: Professional) => (
                <Card key={professional.id} className="border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{professional.email}</CardTitle>
                        <p className="text-sm text-gray-600">CRP: {professional.crp}</p>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Pendente
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Especialidades:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {professional.specialties.map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {professional.bio && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Biografia:</p>
                          <p className="text-sm text-gray-600 mt-1">{professional.bio}</p>
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-3">
                        <Button
                          size="sm"
                          onClick={() => approveProfessional.mutate(professional.id)}
                          disabled={approveProfessional.isPending}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectProfessional.mutate(professional.id)}
                          disabled={rejectProfessional.isPending}
                          className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Profissionais Aprovados */}
        {approvedProfessionals.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Profissionais Aprovados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {approvedProfessionals.map((professional: Professional) => (
                <Card key={professional.id} className="border-green-200 bg-green-50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{professional.email}</CardTitle>
                        <p className="text-sm text-gray-600">CRP: {professional.crp}</p>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Aprovado
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Especialidades:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {professional.specialties.map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {professional.bio && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Biografia:</p>
                          <p className="text-sm text-gray-600 mt-1">{professional.bio}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {professionals?.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum profissional cadastrado</h3>
            <p className="text-gray-500">Aguarde profissionais se cadastrarem na plataforma</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfessionals;