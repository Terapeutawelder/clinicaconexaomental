import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, QrCode, Clock, CheckCircle, Copy, Loader2, Shield, X } from "lucide-react";
import { toast } from "sonner";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional: {
    name: string;
    photo: string;
    price: number;
  };
  sessionInfo: {
    date: Date;
    time: string;
    duration: string;
    packageName: string;
  };
  onPaymentSuccess: () => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  professional,
  sessionInfo,
  onPaymentSuccess,
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixGenerated, setPixGenerated] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
    cpf: "",
  });

  // Timer countdown
  useEffect(() => {
    if (!isOpen || !pixGenerated) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, pixGenerated]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(date);
  };

  const handleGeneratePix = () => {
    setIsProcessing(true);
    // Simulate PIX generation
    setTimeout(() => {
      setIsProcessing(false);
      setPixGenerated(true);
      setTimeLeft(900);
    }, 1500);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText("00020126580014br.gov.bcb.pix0136exemplo-pix-code-aqui");
    toast.success("Código PIX copiado!");
  };

  const handleCardPayment = () => {
    if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv || !cardData.cpf) {
      toast.error("Preencha todos os campos do cartão");
      return;
    }
    
    setIsProcessing(true);
    // Simulate card processing
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Pagamento aprovado!");
      onPaymentSuccess();
    }, 2000);
  };

  const handleConfirmPixPayment = () => {
    setIsProcessing(true);
    // Simulate payment confirmation check
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Pagamento confirmado!");
      onPaymentSuccess();
    }, 1500);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-background border-border">
        <div className="flex flex-col md:flex-row">
          {/* Left side - Order Summary */}
          <div className="bg-muted/50 p-6 md:w-2/5 border-b md:border-b-0 md:border-r border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg text-foreground">Resumo do pedido</h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={professional.photo}
                  alt={professional.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-foreground">{professional.name}</p>
                  <p className="text-sm text-muted-foreground">Psicoterapeuta</p>
                </div>
              </div>

              <div className="bg-background rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pacote</span>
                  <span className="font-medium text-foreground">{sessionInfo.packageName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duração</span>
                  <span className="font-medium text-foreground">{sessionInfo.duration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Data</span>
                  <span className="font-medium text-foreground capitalize">
                    {formatDate(sessionInfo.date)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Horário</span>
                  <span className="font-medium text-foreground">{sessionInfo.time}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(professional.price)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background rounded-lg p-3">
                <Shield className="h-4 w-4 text-primary" />
                <span>Pagamento 100% seguro</span>
              </div>
            </div>
          </div>

          {/* Right side - Payment Methods */}
          <div className="p-6 md:w-3/5">
            <h3 className="font-semibold text-lg mb-4 text-foreground">Forma de pagamento</h3>

            <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "pix" | "card")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="pix" className="flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  PIX
                </TabsTrigger>
                <TabsTrigger value="card" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Cartão
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pix" className="space-y-4">
                {!pixGenerated ? (
                  <div className="text-center space-y-4">
                    <div className="bg-muted/50 rounded-lg p-6">
                      <QrCode className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Clique no botão abaixo para gerar o código PIX
                      </p>
                      <Button
                        onClick={handleGeneratePix}
                        disabled={isProcessing}
                        className="w-full"
                        size="lg"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Gerando PIX...
                          </>
                        ) : (
                          <>
                            <QrCode className="h-4 w-4 mr-2" />
                            Gerar código PIX
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-orange-500 bg-orange-500/10 rounded-lg p-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Expira em {formatTime(timeLeft)}
                      </span>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 flex flex-col items-center">
                      {/* Simulated QR Code */}
                      <div className="w-48 h-48 bg-white rounded-lg p-2 mb-4">
                        <div className="w-full h-full bg-gradient-to-br from-foreground/80 to-foreground/60 rounded grid grid-cols-8 gap-0.5 p-2">
                          {Array.from({ length: 64 }).map((_, i) => (
                            <div
                              key={i}
                              className={`${Math.random() > 0.5 ? "bg-white" : "bg-transparent"} rounded-sm`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground text-center mb-3">
                        Escaneie o QR Code ou copie o código abaixo
                      </p>

                      <Button
                        variant="outline"
                        onClick={handleCopyPix}
                        className="w-full"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar código PIX
                      </Button>
                    </div>

                    <Button
                      onClick={handleConfirmPixPayment}
                      disabled={isProcessing}
                      className="w-full"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verificando pagamento...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Já fiz o pagamento
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="card" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Número do cartão</Label>
                    <Input
                      id="cardNumber"
                      placeholder="0000 0000 0000 0000"
                      value={cardData.number}
                      onChange={(e) =>
                        setCardData({ ...cardData, number: formatCardNumber(e.target.value) })
                      }
                      maxLength={19}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardName">Nome no cartão</Label>
                    <Input
                      id="cardName"
                      placeholder="Nome como está no cartão"
                      value={cardData.name}
                      onChange={(e) =>
                        setCardData({ ...cardData, name: e.target.value.toUpperCase() })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Validade</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/AA"
                        value={cardData.expiry}
                        onChange={(e) =>
                          setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })
                        }
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="000"
                        value={cardData.cvv}
                        onChange={(e) =>
                          setCardData({
                            ...cardData,
                            cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                          })
                        }
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cpf">CPF do titular</Label>
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00"
                      value={cardData.cpf}
                      onChange={(e) => setCardData({ ...cardData, cpf: e.target.value })}
                    />
                  </div>

                  <Button
                    onClick={handleCardPayment}
                    disabled={isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processando pagamento...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pagar {formatPrice(professional.price)}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Parcelamento em até 12x disponível
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
