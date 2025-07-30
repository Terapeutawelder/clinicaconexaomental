
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ScrollText } from "lucide-react";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";

const TermosDeUso = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <ScrollText className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold gradient-text">Termos de Uso</h1>
          </div>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Termos e Condições de Uso da Plataforma</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <div className="space-y-6 text-sm leading-relaxed">
              <section>
                <h3 className="text-lg font-semibold mb-3">1. ACEITAÇÃO DOS TERMOS</h3>
                <p>
                  Ao acessar e usar a plataforma Clínica Conexão Mental, você concorda em cumprir e 
                  ficar vinculado aos termos e condições de uso descritos neste documento.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">2. DESCRIÇÃO DO SERVIÇO</h3>
                <p>
                  A Clínica Conexão Mental é uma plataforma digital que conecta pacientes a profissionais 
                  de saúde mental qualificados para consultas online e presenciais.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">3. CADASTRO E CONTA DE USUÁRIO</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>É necessário fornecer informações verdadeiras e atualizadas</li>
                  <li>Você é responsável por manter a confidencialidade de sua conta</li>
                  <li>Notifique-nos imediatamente sobre uso não autorizado de sua conta</li>
                  <li>Somos reservados o direito de suspender contas que violem os termos</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">4. USO ACEITÁVEL</h3>
                <p>Você concorda em NÃO usar a plataforma para:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Atividades ilegais ou não autorizadas</li>
                  <li>Transmitir conteúdo ofensivo, difamatório ou prejudicial</li>
                  <li>Interferir no funcionamento da plataforma</li>
                  <li>Tentar acessar contas de outros usuários</li>
                  <li>Usar a plataforma para fins que não sejam os pretendidos</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">5. PRIVACIDADE E PROTEÇÃO DE DADOS</h3>
                <p>
                  Respeitamos sua privacidade e protegemos seus dados pessoais conforme nossa 
                  Política de Privacidade e a Lei Geral de Proteção de Dados (LGPD).
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">6. PAGAMENTOS E CANCELAMENTOS</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Os pagamentos são processados de forma segura através da plataforma</li>
                  <li>Cancelamentos devem seguir a política estabelecida</li>
                  <li>Reembolsos serão processados conforme nossa política de reembolso</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">7. LIMITAÇÃO DE RESPONSABILIDADE</h3>
                <p>
                  A Clínica Conexão Mental atua como intermediária entre pacientes e profissionais. 
                  Não nos responsabilizamos pelo conteúdo das consultas ou resultados dos tratamentos.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">8. ALTERAÇÕES DOS TERMOS</h3>
                <p>
                  Reservamos o direito de modificar estes termos a qualquer momento. 
                  As alterações serão comunicadas através da plataforma.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">9. CONTATO</h3>
                <p>
                  Para dúvidas sobre estes termos, entre em contato através do email: 
                  contato@conexaomental.online
                </p>
              </section>

              <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>Última atualização: Janeiro de 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermosDeUso;
