import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
          <p className="text-gray-600">Última atualização: 15 de julho de 2025</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Identificação do Controlador</h2>
            <p className="text-gray-700">
              A Clínica ConexãoMental, inscrita no CNPJ 54.423.733/0001-68, é a controladora dos dados pessoais 
              coletados através da plataforma, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Dados Coletados</h2>
            <h3 className="text-lg font-medium text-gray-800 mb-2">2.1 Dados Pessoais</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
              <li>Nome completo</li>
              <li>E-mail</li>
              <li>Telefone</li>
              <li>CPF</li>
              <li>Data de nascimento</li>
              <li>Endereço</li>
            </ul>
            
            <h3 className="text-lg font-medium text-gray-800 mb-2">2.2 Dados Profissionais (para profissionais)</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
              <li>Registro profissional (CRP, CRM, etc.)</li>
              <li>Especialização</li>
              <li>Experiência profissional</li>
              <li>Currículo</li>
              <li>Documentos de formação</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mb-2">2.3 Dados de Navegação</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Endereço IP</li>
              <li>Cookies e tecnologias similares</li>
              <li>Logs de acesso</li>
              <li>Informações do dispositivo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Finalidade do Tratamento</h2>
            <p className="text-gray-700 mb-3">Os dados pessoais são tratados para as seguintes finalidades:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Prestação de serviços de psicoterapia online</li>
              <li>Agendamento e gerenciamento de sessões terapêuticas</li>
              <li>Comunicação com usuários</li>
              <li>Melhoria da plataforma e experiência do usuário</li>
              <li>Cumprimento de obrigações legais</li>
              <li>Verificação de identidade e credenciais profissionais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Base Legal</h2>
            <p className="text-gray-700">
              O tratamento dos dados pessoais é baseado nas seguintes hipóteses legais previstas no art. 7º da LGPD:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
              <li>Consentimento do titular</li>
              <li>Execução de contrato</li>
              <li>Cumprimento de obrigação legal</li>
              <li>Proteção da vida ou incolumidade física</li>
              <li>Legítimo interesse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Compartilhamento de Dados</h2>
            <p className="text-gray-700">
              Seus dados podem ser compartilhados apenas nas seguintes situações:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
              <li>Com profissionais de saúde para prestação do serviço</li>
              <li>Com prestadores de serviço necessários para operação da plataforma</li>
              <li>Para cumprimento de obrigações legais</li>
              <li>Com autoridades competentes quando exigido por lei</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Segurança dos Dados</h2>
            <p className="text-gray-700">
              Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados contra acessos 
              não autorizados, alteração, divulgação ou destruição. Utilizamos criptografia, controles de acesso 
              e monitoramento contínuo para garantir a segurança das informações.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Retenção de Dados</h2>
            <p className="text-gray-700">
              Os dados pessoais serão mantidos pelo tempo necessário para cumprimento das finalidades descritas 
              nesta política, respeitando os prazos legais aplicáveis. Dados de psicoterapia seguem as normas específicas 
              do Conselho Federal de Psicologia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Direitos do Titular</h2>
            <p className="text-gray-700 mb-3">Você tem os seguintes direitos sobre seus dados pessoais:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Confirmação da existência de tratamento</li>
              <li>Acesso aos dados</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados</li>
              <li>Anonimização, bloqueio ou eliminação de dados</li>
              <li>Portabilidade dos dados</li>
              <li>Eliminação dos dados tratados com consentimento</li>
              <li>Informação sobre compartilhamento</li>
              <li>Revogação do consentimento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Cookies</h2>
            <p className="text-gray-700">
              Utilizamos cookies para melhorar sua experiência na plataforma. Você pode gerenciar suas preferências 
              de cookies através das configurações do seu navegador. Alguns cookies são essenciais para o funcionamento 
              da plataforma e não podem ser desabilitados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Alterações na Política</h2>
            <p className="text-gray-700">
              Esta política pode ser atualizada periodicamente. Mudanças significativas serão comunicadas através 
              da plataforma ou por e-mail. A data da última atualização sempre será indicada no início desta política.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contato e Exercício de Direitos</h2>
            <p className="text-gray-700">
              Para exercer seus direitos, esclarecer dúvidas sobre esta política ou reportar incidentes de segurança, 
              entre em contato através dos canais disponíveis na plataforma ou pelo e-mail oficial da Clínica ConexãoMental.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Encarregado de Proteção de Dados (DPO)</h2>
            <p className="text-gray-700">
              A Clínica ConexãoMental mantém um Encarregado de Proteção de Dados responsável por garantir o cumprimento 
              da LGPD e atender às solicitações dos titulares de dados. O contato pode ser feito através dos canais 
              oficiais da empresa.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}