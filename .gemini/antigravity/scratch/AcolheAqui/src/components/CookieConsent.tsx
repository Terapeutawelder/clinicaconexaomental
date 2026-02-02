import { useState, useEffect } from "react";
import { X } from "lucide-react";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Show popup after a small delay
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleClose = () => {
    localStorage.setItem("cookie-consent", "dismissed");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in-up">
      <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1 pr-8">
            <h3 className="font-semibold text-foreground mb-2">
              🍪 Privacidade e Cookies
            </h3>
            <p className="text-sm text-muted-foreground">
              Utilizamos cookies para melhorar sua experiência em nosso site. Ao continuar navegando, você concorda com nossa{" "}
              <a href="/politica-de-privacidade" className="text-primary hover:underline">
                Política de Privacidade
              </a>{" "}
              e nossos{" "}
              <a href="/termos-de-uso" className="text-primary hover:underline">
                Termos de Uso
              </a>.
            </p>
          </div>

          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={handleAccept}
              className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all hover:scale-105"
            >
              Aceitar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
