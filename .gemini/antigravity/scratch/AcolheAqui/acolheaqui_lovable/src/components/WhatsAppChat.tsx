import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const WhatsAppChat = () => {
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [showTyping, setShowTyping] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const messages = [
    {
      type: 'user',
      text: 'Olá! Vim do AcolheAqui e gostaria de saber mais sobre o seu atendimento.',
    },
    {
      type: 'therapist',
      text: 'Olá! Fico feliz em te ajudar. Como posso te acolher hoje?',
    },
    {
      type: 'user',
      text: 'Estou buscando terapia online. Você atende para ansiedade?',
    },
    {
      type: 'therapist',
      text: 'Sim! Trabalho com ansiedade e posso te ajudar. Vamos agendar uma primeira conversa?',
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const section = document.getElementById('whatsapp-chat-section');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let currentMessage = 0;
    const showNextMessage = () => {
      if (currentMessage >= messages.length) return;

      // Show typing indicator
      setShowTyping(true);

      // After typing animation, show message
      setTimeout(() => {
        setShowTyping(false);
        setVisibleMessages(prev => prev + 1);
        currentMessage++;
        
        // Schedule next message
        if (currentMessage < messages.length) {
          setTimeout(showNextMessage, 800);
        }
      }, 1200);
    };

    // Start first message after initial delay
    const timer = setTimeout(showNextMessage, 500);

    return () => clearTimeout(timer);
  }, [isVisible]);

  return (
    <section 
      id="whatsapp-chat-section"
      className="py-10 sm:py-16 md:py-24 bg-gradient-to-br from-secondary/50 to-muted/30"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16">
          {/* Content - Left side */}
          <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
            {/* WhatsApp badge */}
            <div className="flex items-center gap-2 justify-center lg:justify-start mb-4 sm:mb-6">
              <svg 
                viewBox="0 0 24 24" 
                className="w-5 h-5 sm:w-6 sm:h-6 text-[#25D366]"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="text-foreground font-medium text-sm sm:text-base">Agendar pelo WhatsApp</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
              Converse com o(a)<br className="hidden sm:block" />
              psicoterapeuta pelo<br className="hidden sm:block" />
              <span className="text-[#25D366]">WhatsApp</span>
            </h2>
            
            <p className="text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto lg:mx-0 text-sm sm:text-base md:text-lg">
              Um primeiro contato simples e direto para entender como ele pode te acolher.
            </p>
            
            <Link to="/psicoterapeutas">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-lg rounded-xl group w-full sm:w-auto"
              >
                Buscar psicoterapeutas
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          
          {/* WhatsApp mockup - Right side */}
          <div className="flex-1 flex justify-center order-1 lg:order-2">
            <div className="relative">
              {/* Phone frame */}
              <div className="w-[240px] sm:w-[280px] md:w-[320px] bg-card rounded-[1.5rem] sm:rounded-[2rem] p-1.5 sm:p-2 shadow-2xl border border-border">
                {/* Screen */}
                <div className="bg-[#ece5dd] rounded-[1.2rem] sm:rounded-[1.5rem] overflow-hidden">
                  {/* Chat header */}
                  <div className="bg-[#075E54] px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                      <span className="text-white font-bold text-sm sm:text-lg">P</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-xs sm:text-sm">Psicólogo(a)</p>
                      <p className="text-white/80 text-[10px] sm:text-xs">online</p>
                    </div>
                  </div>
                  
                  {/* Chat background */}
                  <div 
                    className="h-[280px] sm:h-[380px] md:h-[420px] p-2 sm:p-3 space-y-2 overflow-hidden flex flex-col"
                    style={{ backgroundColor: '#ece5dd' }}
                  >
                    {messages.slice(0, visibleMessages).map((message, index) => (
                      <div 
                        key={index}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                      >
                        <div 
                          className={`${
                            message.type === 'user' 
                              ? 'bg-[#DCF8C6] rounded-lg rounded-tr-sm' 
                              : 'bg-white rounded-lg rounded-tl-sm'
                          } px-2 sm:px-3 py-1.5 sm:py-2 max-w-[85%] shadow-sm`}
                        >
                          <p className="text-gray-800 text-xs sm:text-sm">{message.text}</p>
                          <div className={`flex items-center ${message.type === 'user' ? 'justify-end' : 'justify-end'} gap-1 mt-0.5 sm:mt-1`}>
                            <span className="text-gray-500 text-[10px]">12:34</span>
                            {message.type === 'user' && (
                              <>
                                <Check size={12} className="text-blue-500" />
                                <Check size={12} className="text-blue-500 -ml-2" />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Typing indicator */}
                    {showTyping && visibleMessages < messages.length && (
                      <div className="flex justify-start animate-fade-in">
                        <div className="bg-white rounded-lg rounded-tl-sm px-3 sm:px-4 py-2 sm:py-3 shadow-sm">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Subtle glow effect using design system */}
              <div className="absolute -inset-4 bg-primary/10 rounded-[3rem] blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatsAppChat;
