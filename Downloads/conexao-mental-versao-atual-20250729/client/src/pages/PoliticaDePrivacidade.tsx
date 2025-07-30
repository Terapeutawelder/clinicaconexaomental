
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";

const PoliticaDePrivacidade = () => {
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
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold gradient-text">Política de Privacidade</h1>
          </div>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Política de Privacidade e Proteção de Dados</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <div className="space-y-6 text-sm leading-relaxed">
              <section>
                <h3 className="text-lg font-semibold mb-3">1. INFORMAÇÕES GERAIS</h3>
                <p>
                  Esta Política de Privacidade descreve como a Clínica Conexão Mental coleta,
                  usa, armazena e protege suas informações pessoais, em conformidade com a 
                  Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">2. DADOS COLETADOS</h3>
                <p>Coletamos os seguintes tipos de informações:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Dados de identificação:</strong> nome, CPF, email, telefone</li>
                  <li><strong>Dados de saúde:</strong> informações relacionadas ao atendimento psicológico</li>
                  <li><strong>Dados de navegação:</strong> logs de acesso, cookies, endereço IP</li>
                  <li><strong>Dados de pagamento:</strong> informações de transações financeiras</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">3. FINALIDADE DO TRATAMENTO</h3>
                <p>Utilizamos seus dados para:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Prestação de serviços de saúde mental</li>
                  <li>Agendamento e gestão de consultas</li>
                  <li>Processamento de pagamentos</li>
                  <li>Comunicação sobre serviços</li>
                  <li>Cumprimento de obrigações legais</li>
                  <li>Melhoria da qualidade dos serviços</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">4. COMPARTILHAMENTO DE DADOS</h3>
                <p>
                  Seus dados pessoais não são vendidos, alugados ou transferidos para terceiros, 
                  exceto nos seguintes casos:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Com profissionais de saúde para prestação do atendimento</li>
                  <li>Com processadores de pagamento para transações financeiras</li>
                  <li>Quando exigido por lei ou ordem judicial</li>
                  <li>Para proteção de direitos, propriedade ou segurança</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">5. SEGURANÇA DOS DADOS</h3>
                <p>Implementamos medidas de segurança técnicas e organizacionais:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Criptografia de dados sensíveis</li>
                  <li>Controle de acesso restrito</li>
                  <li>Monitoramento de segurança 24/7</li>
                  <li>Backup regular dos dados</li>
                  <li>Treinamento regular da equipe</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">6. SEUS DIREITOS</h3>
                <p>Conforme a LGPD, você tem direito a:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Confirmação da existência de tratamento de dados</li>
                  <li>Acesso aos seus dados pessoais</li>
                  <li>Correção de dados incompletos ou incorretos</li>
                  <li>Eliminação de dados desnecessários</li>
                  <li>Portabilidade dos dados</li>
                  <li>Revogação do consentimento</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">7. RETENÇÃO DE DADOS</h3>
                <p>
                  Mantemos seus dados pelo tempo necessário para cumprir as finalidades 
                  para as quais foram coletados, respeitando os prazos legais aplicáveis.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">8. COOKIES</h3>
                <p>
                  Utilizamos cookies para melhorar sua experiência na plataforma. 
                  Você pode gerenciar suas preferências de cookies nas configurações do navegador.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">9. ALTERAÇÕES NESTA POLÍTICA</h3>
                <p>
                  Esta política pode ser atualizada periodicamente. Notificaremos sobre 
                  mudanças significativas através da plataforma ou por email.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">10. CONTATO</h3>
                <p>
                  Para exercer seus direitos ou esclarecer dúvidas sobre esta política, 
                  entre em contato através do email: contato@conexaomental.online
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

export default PoliticaDePrivacidade;
