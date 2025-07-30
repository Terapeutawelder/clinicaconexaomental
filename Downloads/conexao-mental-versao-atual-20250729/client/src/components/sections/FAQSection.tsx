import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQSection = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqs: FAQItem[] = [
    {
      question: "Como funciona o atendimento online?",
      answer: "O atendimento é realizado por videochamada através da nossa plataforma segura. Você pode acessar de qualquer lugar, no conforto da sua casa, usando computador, tablet ou smartphone com conexão à internet."
    },
    {
      question: "Os profissionais são credenciados?",
      answer: "Sim, todos os nossos psicoterapeutas são credenciados e certificados pelos órgãos competentes. Eles passam por um rigoroso processo de seleção e verificação de suas credenciais profissionais."
    },
    {
      question: "Quanto tempo dura cada sessão?",
      answer: "Cada sessão tem duração de 45 minutos, tempo padrão para sessões de psicoterapia que permite um atendimento completo e eficaz."
    },
    {
      question: "Como posso pagar pelas sessões?",
      answer: "Oferecemos pagamento via PIX ou cartão de crédito/débito. O pagamento é feito por sessão, sem mensalidade ou fidelidade, dando total flexibilidade para você."
    },
    {
      question: "O atendimento online é eficaz?",
      answer: "Sim, estudos científicos comprovam que a terapia online tem a mesma eficácia que a presencial. Nossa plataforma oferece todas as condições necessárias para um atendimento de qualidade."
    },
    {
      question: "Como é garantida a confidencialidade?",
      answer: "Utilizamos criptografia de ponta a ponta em todas as chamadas e seguimos rigorosamente as normas de sigilo profissional. Seus dados e conversas são totalmente protegidos."
    },
    {
      question: "Posso escolher o profissional?",
      answer: "Sim, você pode visualizar o perfil dos profissionais disponíveis, suas especialidades e experiências, e escolher aquele que melhor atende às suas necessidades."
    },
    {
      question: "Como faço para agendar uma sessão?",
      answer: "É muito simples! Basta criar sua conta, escolher o profissional desejado, selecionar um horário disponível e confirmar o agendamento. Você receberá todas as instruções por email."
    },
    {
      question: "E se eu não ficar satisfeito com o atendimento?",
      answer: "Oferecemos garantia de 7 dias. Se não ficar satisfeito com sua primeira sessão, você pode solicitar reembolso total ou trocar de profissional."
    },
    {
      question: "O que preciso para participar da sessão?",
      answer: "Você precisa apenas de um dispositivo com câmera e microfone (computador, tablet ou smartphone), conexão estável à internet e um ambiente privado e tranquilo."
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tire suas dúvidas sobre nosso atendimento de psicoterapia online
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  {openItems.includes(index) ? (
                    <ChevronUp className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  )}
                </button>
                
                {openItems.includes(index) && (
                  <div className="px-6 pb-4 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed pt-4">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Ainda tem dúvidas? Estamos aqui para ajudar!
          </p>
          <button 
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-8 py-3 rounded-lg transition-colors"
            onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
          >
            Fale Conosco pelo WhatsApp
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;