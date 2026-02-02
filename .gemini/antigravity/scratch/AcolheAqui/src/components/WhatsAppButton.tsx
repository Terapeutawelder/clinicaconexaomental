import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  href?: string;
  className?: string;
}

const WhatsAppButton = ({ 
  href = "#", 
  className = "" 
}: WhatsAppButtonProps) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-whatsapp animate-pulse-glow ${className}`}
    >
      <MessageCircle size={24} fill="currentColor" />
      <span>ENTRAR NO GRUPO</span>
    </a>
  );
};

export default WhatsAppButton;
