import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

const TermosUso = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="py-6 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Logo size="sm" />
            </Link>
            <Link 
              to="/" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Termos de Uso
          </h1>

          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p className="text-foreground/80">
              Última atualização: Dezembro de 2024
            </p>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e utilizar a plataforma Mindset, você concorda com estes Termos de Uso. 
                Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">2. Descrição do Serviço</h2>
              <p>
                A Mindset é uma plataforma que conecta pessoas a profissionais de saúde mental qualificados, 
                oferecendo ferramentas de gestão para profissionais e acesso facilitado para clientes 
                que buscam atendimento psicológico.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">3. Cadastro e Conta</h2>
              <p>Para utilizar nossos serviços, você deve:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ter pelo menos 18 anos de idade</li>
                <li>Fornecer informações verdadeiras e completas no cadastro</li>
                <li>Manter a segurança de sua senha e conta</li>
                <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">4. Profissionais</h2>
              <p>Profissionais cadastrados na plataforma devem:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Possuir registro válido no conselho profissional competente (CRP, CRM, etc.)</li>
                <li>Manter suas informações profissionais atualizadas</li>
                <li>Seguir o código de ética de sua profissão</li>
                <li>Prestar serviços de qualidade aos clientes</li>
                <li>Respeitar a confidencialidade e sigilo profissional</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">5. Usuários/Clientes</h2>
              <p>Usuários que buscam atendimento devem:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fornecer informações precisas sobre si mesmos</li>
                <li>Respeitar os profissionais e seus horários</li>
                <li>Cumprir com os compromissos de agendamento</li>
                <li>Utilizar a plataforma de forma ética e respeitosa</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">6. Pagamentos e Cancelamentos</h2>
              <p>
                Os valores dos serviços são definidos pelos próprios profissionais ou pelos planos da plataforma. 
                Políticas de cancelamento e reembolso seguem as regras estabelecidas em cada caso específico.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">7. Propriedade Intelectual</h2>
              <p>
                Todo o conteúdo da plataforma, incluindo textos, imagens, logos e software, 
                é de propriedade da Mindset ou de seus licenciadores. É proibida a reprodução 
                sem autorização prévia.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">8. Limitação de Responsabilidade</h2>
              <p>
                A Mindset atua como intermediadora entre profissionais e clientes. 
                Não nos responsabilizamos por:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Qualidade dos atendimentos prestados pelos profissionais</li>
                <li>Resultados de tratamentos ou acompanhamentos</li>
                <li>Disputas entre profissionais e clientes</li>
                <li>Indisponibilidade temporária da plataforma</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">9. Conduta Proibida</h2>
              <p>É expressamente proibido:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Utilizar a plataforma para fins ilegais</li>
                <li>Compartilhar informações falsas ou enganosas</li>
                <li>Assediar ou discriminar outros usuários</li>
                <li>Tentar acessar contas de outros usuários</li>
                <li>Violar direitos de propriedade intelectual</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">10. Suspensão e Encerramento</h2>
              <p>
                Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos, 
                sem aviso prévio, a nosso exclusivo critério.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">11. Alterações nos Termos</h2>
              <p>
                Podemos modificar estes termos a qualquer momento. Alterações significativas 
                serão comunicadas através da plataforma. O uso continuado após as alterações 
                constitui aceitação dos novos termos.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">12. Lei Aplicável</h2>
              <p>
                Estes termos são regidos pelas leis da República Federativa do Brasil. 
                Qualquer disputa será resolvida no foro da comarca de São Paulo/SP.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">13. Contato</h2>
              <p>
                Para dúvidas sobre estes termos, entre em contato através do e-mail:{" "}
                <a href="mailto:contato@mindset.com.br" className="text-primary hover:underline">contato@mindset.com.br</a>
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 Mindset. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TermosUso;
