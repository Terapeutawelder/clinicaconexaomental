import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

const PoliticaPrivacidade = () => {
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
            Política de Privacidade
          </h1>

          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p className="text-foreground/80">
              Última atualização: Dezembro de 2024
            </p>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">1. Introdução</h2>
              <p>
                A Mindset está comprometida em proteger a privacidade e os dados pessoais de nossos usuários. 
                Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações 
                quando você utiliza nossa plataforma.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">2. Informações que Coletamos</h2>
              <p>Podemos coletar os seguintes tipos de informações:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Informações de identificação pessoal:</strong> nome, e-mail, telefone, CPF/CNPJ.</li>
                <li><strong>Informações profissionais:</strong> registro profissional (CRP, CRM), especialidades, formação.</li>
                <li><strong>Dados de uso:</strong> páginas visitadas, tempo de navegação, interações na plataforma.</li>
                <li><strong>Informações de dispositivo:</strong> tipo de navegador, sistema operacional, endereço IP.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">3. Como Usamos Suas Informações</h2>
              <p>Utilizamos suas informações para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Processar cadastros e verificar credenciais profissionais</li>
                <li>Comunicar-nos com você sobre atualizações e novidades</li>
                <li>Personalizar sua experiência na plataforma</li>
                <li>Cumprir obrigações legais e regulatórias</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">4. Compartilhamento de Informações</h2>
              <p>
                Não vendemos ou alugamos suas informações pessoais a terceiros. Podemos compartilhar dados apenas:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Com prestadores de serviços que nos auxiliam na operação da plataforma</li>
                <li>Quando exigido por lei ou ordem judicial</li>
                <li>Para proteger nossos direitos e segurança</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">5. Cookies e Tecnologias Similares</h2>
              <p>
                Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o tráfego 
                e personalizar conteúdo. Você pode gerenciar suas preferências de cookies através das 
                configurações do seu navegador.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">6. Segurança dos Dados</h2>
              <p>
                Implementamos medidas técnicas e organizacionais apropriadas para proteger suas informações 
                contra acesso não autorizado, alteração, divulgação ou destruição.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">7. Seus Direitos (LGPD)</h2>
              <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos ou desatualizados</li>
                <li>Solicitar a exclusão de seus dados</li>
                <li>Revogar seu consentimento</li>
                <li>Solicitar a portabilidade de seus dados</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">8. Contato</h2>
              <p>
                Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato conosco 
                através do e-mail: <a href="mailto:privacidade@mindset.com.br" className="text-primary hover:underline">privacidade@mindset.com.br</a>
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">9. Alterações nesta Política</h2>
              <p>
                Podemos atualizar esta política periodicamente. Notificaremos sobre alterações significativas 
                através da plataforma ou por e-mail.
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

export default PoliticaPrivacidade;
