import WhatsAppButton from "./WhatsAppButton";

const CTASection = () => {
  return (
    <section className="py-20 px-4 bg-card">
      <div className="container mx-auto max-w-3xl text-center">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6">
          Entre no grupo do WhatsApp e receba as informações completas sobre como participar.
        </h2>
        
        <p className="text-lg text-muted-foreground mb-10">
          Se você é um profissional que quer{" "}
          <span className="font-semibold text-foreground">
            crescer na sua área
          </span>
          , essa plataforma foi pensada para você.
        </p>

        <WhatsAppButton />
      </div>
    </section>
  );
};

export default CTASection;
