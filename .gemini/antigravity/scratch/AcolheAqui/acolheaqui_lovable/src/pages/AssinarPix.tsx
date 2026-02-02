import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import { Copy, Check, ArrowLeft, Loader2, QrCode, Clock } from "lucide-react";

const AssinarPix = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const pixCode = searchParams.get("code") || "";
  const pixCopyPaste = searchParams.get("copy") || "";

  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes

  useEffect(() => {
    if (!pixCode && !pixCopyPaste) {
      navigate("/assinar");
      return;
    }

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
  }, [pixCode, pixCopyPaste, navigate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCopyPaste);
    setCopied(true);
    toast({
      title: "Código copiado!",
      description: "Cole no seu aplicativo do banco.",
    });
    setTimeout(() => setCopied(false), 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!pixCode && !pixCopyPaste) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/assinar")}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft size={20} />
            </Button>
            <Logo size="sm" variant="light" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-md mx-auto">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <QrCode className="w-8 h-8 text-green-400" />
              </div>
              <CardTitle className="text-white text-2xl">Pague com PIX</CardTitle>
              <p className="text-slate-400 mt-2">
                Escaneie o QR Code ou copie o código
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timer */}
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <Clock size={18} />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>

              {/* QR Code */}
              {pixCode && (
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-xl">
                    <img
                      src={`data:image/png;base64,${pixCode}`}
                      alt="QR Code PIX"
                      className="w-48 h-48"
                    />
                  </div>
                </div>
              )}

              {/* Copy code */}
              {pixCopyPaste && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-400 text-center">
                    Ou copie o código abaixo:
                  </p>
                  <div className="relative">
                    <Input
                      value={pixCopyPaste}
                      readOnly
                      className="pr-20 bg-slate-700/50 border-slate-600 text-white font-mono text-xs"
                    />
                    <Button
                      size="sm"
                      onClick={handleCopy}
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </Button>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="space-y-3 pt-4 border-t border-slate-700">
                <p className="text-sm font-medium text-white">Como pagar:</p>
                <ol className="space-y-2 text-sm text-slate-400">
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">
                      1
                    </span>
                    Abra o app do seu banco
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">
                      2
                    </span>
                    Escolha pagar com PIX
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">
                      3
                    </span>
                    Escaneie o QR Code ou cole o código
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">
                      4
                    </span>
                    Confirme o pagamento
                  </li>
                </ol>
              </div>

              <p className="text-xs text-slate-500 text-center">
                Após o pagamento, sua assinatura será ativada automaticamente.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AssinarPix;
