
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";

const Contrato = () => {
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
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold gradient-text">Contrato de Prestação de Serviços</h1>
          </div>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Contrato de Prestação de Serviços Profissionais</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <div className="space-y-6 text-sm leading-relaxed">
              <section>
                <h3 className="text-lg font-semibold mb-3">1. PARTES CONTRATANTES</h3>
                <p>
                  <strong>CONTRATANTE:</strong> Clínica Conexão Mental, pessoa jurídica de direito privado, 
                  inscrita no CNPJ sob o nº 54.423.733/0001-68, com sede na Avenida Nossa Senhora da Penha, 2598, 
                  Santa Luzia, Vitória/ES, CEP 29045-402.
                </p>
                <p>
                  <strong>CONTRATADO:</strong> Profissional de saúde mental devidamente registrado em seu 
                  conselho profissional competente.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">2. OBJETO DO CONTRATO</h3>
                <p>
                  O presente contrato tem por objeto a prestação de serviços profissionais de saúde mental 
                  através da plataforma digital da Clínica Conexão Mental, incluindo consultas online e presenciais.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">3. OBRIGAÇÕES DO CONTRATADO</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Manter registro profissional ativo e em dia</li>
                  <li>Prestar atendimento com qualidade e ética profissional</li>
                  <li>Manter sigilo profissional conforme código de ética</li>
                  <li>Cumprir horários agendados pontualmente</li>
                  <li>Manter dados pessoais e profissionais atualizados na plataforma</li>
                  <li>Seguir as diretrizes e políticas da plataforma</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">4. OBRIGAÇÕES DA CONTRATANTE</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fornecer plataforma tecnológica adequada</li>
                  <li>Processar pagamentos conforme acordado</li>
                  <li>Manter dados dos profissionais seguros</li>
                  <li>Fornecer suporte técnico quando necessário</li>
                  <li>Divulgar os serviços dos profissionais cadastrados</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">5. REMUNERAÇÃO</h3>
                <p>
                  A remuneração será estabelecida conforme tabela de preços definida pelo profissional, 
                  com repasse conforme percentual acordado na plataforma.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">6. RESCISÃO</h3>
                <p>
                  O presente contrato poderá ser rescindido por qualquer das partes, mediante comunicação 
                  prévia de 30 (trinta) dias.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">7. DISPOSIÇÕES FINAIS</h3>
                <p>
                  Este contrato é regido pelas leis brasileiras e quaisquer disputas serão resolvidas 
                  no foro da comarca de Vitória/ES.
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

export default Contrato;
