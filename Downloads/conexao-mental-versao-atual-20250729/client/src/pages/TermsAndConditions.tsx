import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsAndConditions() {
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
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Termos e Condições</h1>
          <p className="text-gray-600">Última atualização: 15 de julho de 2025</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Identificação da Empresa</h2>
            <p className="text-gray-700">
              A Clínica ConexãoMental é uma empresa legalmente constituída, inscrita no CNPJ sob o número 54.423.733/0001-68, 
              dedicada à prestação de serviços de saúde mental através de Terapia Online.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Aceitação dos Termos</h2>
            <p className="text-gray-700">
              Ao acessar e utilizar a plataforma ConexãoMental, você concorda em cumprir e estar sujeito aos seguintes 
              termos e condições de uso. Se você não concordar com algum destes termos, não deve usar nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Serviços Oferecidos</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Psicoterapia Online através de videochamadas</li>
              <li>Agendamento de sessões terapêuticas online</li>
              <li>Plataforma de conexão entre pacientes e profissionais de saúde mental</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Cadastro de Usuários</h2>
            <p className="text-gray-700">
              Para utilizar nossos serviços, é necessário criar uma conta fornecendo informações precisas e atualizadas. 
              Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades 
              realizadas em sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Profissionais Credenciados</h2>
            <p className="text-gray-700">
              Todos os profissionais da nossa plataforma possuem formação adequada e registro nos órgãos competentes. 
              A Clínica ConexãoMental verifica as credenciais de cada profissional antes de sua aprovação na plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Responsabilidades do Usuário</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Fornecer informações verdadeiras e precisas</li>
              <li>Manter suas credenciais de acesso seguras</li>
              <li>Utilizar a plataforma de forma ética e responsável</li>
              <li>Respeitar os profissionais e outros usuários</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Privacidade e Confidencialidade</h2>
            <p className="text-gray-700">
              Respeitamos sua privacidade e seguimos rigorosamente as normas da LGPD (Lei Geral de Proteção de Dados). 
              Todas as informações pessoais e dados médicos são tratados com absoluta confidencialidade e segurança.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Limitação de Responsabilidade</h2>
            <p className="text-gray-700">
              A Clínica ConexãoMental atua como intermediária entre pacientes e profissionais de saúde mental 
              na modalidade de Terapia Online. Não nos responsabilizamos por diagnósticos, tratamentos ou 
              resultados específicos, que são de responsabilidade exclusiva do profissional escolhido.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Cancelamento e Reembolso</h2>
            <p className="text-gray-700">
              Sessões de Terapia Online podem ser canceladas até 24 horas antes do horário agendado. Reembolsos seguem nossa política 
              específica disponível na plataforma e estão sujeitos aos termos contratuais estabelecidos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Alterações nos Termos</h2>
            <p className="text-gray-700">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. Usuários serão notificados 
              sobre mudanças significativas e a continuidade do uso da plataforma implicará na aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contato</h2>
            <p className="text-gray-700">
              Para questões relacionadas a estes termos, entre em contato conosco através dos canais disponíveis 
              na plataforma ou pelo e-mail oficial da Clínica ConexãoMental.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}