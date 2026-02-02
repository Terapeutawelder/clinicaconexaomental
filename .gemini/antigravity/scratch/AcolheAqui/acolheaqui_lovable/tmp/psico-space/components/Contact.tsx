import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from "lucide-react";

const contactInfo = [
  {
    icon: MapPin,
    title: "Endereço",
    content: "Av. Paulista, 1000 - Sala 512\nSão Paulo, SP",
  },
  {
    icon: Phone,
    title: "Telefone",
    content: "(11) 99999-9999",
  },
  {
    icon: Mail,
    title: "E-mail",
    content: "contato@dramaria.com.br",
  },
  {
    icon: Clock,
    title: "Horário",
    content: "Seg - Sex: 08h às 19h",
  },
];

const Contact = () => {
  return (
    <section id="contato" className="py-10 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-teal-light/30 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Info */}
          <div className="opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <span className="inline-block px-4 py-1.5 bg-teal-light border border-teal/20 text-teal-dark font-semibold text-sm rounded-full mb-4">
              Fale Conosco
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-6 text-charcoal">
              Entre em <span className="text-teal">Contato</span>
            </h2>
            <p className="text-slate text-lg mb-10 leading-relaxed font-medium">
              Tem alguma dúvida ou gostaria de agendar uma primeira conversa? 
              Estou aqui para ajudar você a dar o primeiro passo.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {contactInfo.map((info) => (
                <Card 
                  key={info.title} 
                  className="border border-border bg-card shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 group"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <info.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-charcoal mb-1">{info.title}</h4>
                        <p className="text-sm text-slate whitespace-pre-line font-medium">
                          {info.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Card className="border border-border shadow-2xl overflow-hidden">
              {/* Gradient top border */}
              <div className="h-1.5 bg-gradient-to-r from-teal via-teal-dark to-teal" />
              
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-serif text-2xl text-charcoal">Envie uma Mensagem</h3>
                </div>
                
                <form className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-charcoal mb-2 block">
                        Nome
                      </label>
                      <Input 
                        placeholder="Seu nome" 
                        className="bg-secondary border-border focus:border-teal focus:ring-teal/20 rounded-xl font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-charcoal mb-2 block">
                        E-mail
                      </label>
                      <Input 
                        type="email" 
                        placeholder="seu@email.com"
                        className="bg-secondary border-border focus:border-teal focus:ring-teal/20 rounded-xl font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-charcoal mb-2 block">
                      Telefone
                    </label>
                    <Input 
                      placeholder="(11) 99999-9999"
                      className="bg-secondary border-border focus:border-teal focus:ring-teal/20 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-charcoal mb-2 block">
                      Mensagem
                    </label>
                    <Textarea 
                      placeholder="Como posso ajudar você?"
                      rows={4}
                      className="bg-secondary border-border focus:border-teal focus:ring-teal/20 resize-none rounded-xl font-medium"
                    />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-teal to-teal-dark hover:from-teal-dark hover:to-teal text-white py-6 text-lg shadow-xl hover:shadow-2xl hover:shadow-teal/25 transition-all duration-300 hover:-translate-y-1 rounded-xl font-bold">
                    <Send className="w-5 h-5 mr-2" />
                    Enviar Mensagem
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
