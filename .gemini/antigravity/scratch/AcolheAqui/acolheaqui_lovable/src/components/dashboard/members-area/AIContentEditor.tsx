import { useState } from "react";
import {
  Wand2,
  Sparkles,
  Languages,
  MessageSquare,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  Loader2,
  Zap,
  BookOpen,
  Heart,
  Briefcase,
  Smile,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  label?: string;
}

const TONES = [
  { id: "professional", label: "Profissional", icon: Briefcase, description: "Formal e corporativo" },
  { id: "friendly", label: "Amigável", icon: Smile, description: "Próximo e acolhedor" },
  { id: "inspiring", label: "Inspirador", icon: Target, description: "Motivacional e empolgante" },
  { id: "educational", label: "Educativo", icon: BookOpen, description: "Didático e claro" },
  { id: "empathetic", label: "Empático", icon: Heart, description: "Sensível e compreensivo" },
];

const LANGUAGES = [
  { id: "pt-BR", label: "Português (Brasil)", flag: "🇧🇷" },
  { id: "en", label: "Inglês", flag: "🇺🇸" },
  { id: "es", label: "Espanhol", flag: "🇪🇸" },
  { id: "fr", label: "Francês", flag: "🇫🇷" },
  { id: "it", label: "Italiano", flag: "🇮🇹" },
  { id: "de", label: "Alemão", flag: "🇩🇪" },
];

const AI_ACTIONS = [
  { id: "improve", label: "Aprimorar texto", icon: Wand2, description: "Melhora gramática e clareza" },
  { id: "expand", label: "Expandir conteúdo", icon: Sparkles, description: "Adiciona mais detalhes" },
  { id: "summarize", label: "Resumir", icon: RefreshCw, description: "Versão mais concisa" },
  { id: "simplify", label: "Simplificar", icon: Zap, description: "Linguagem mais simples" },
];

const AIContentEditor = ({
  value,
  onChange,
  placeholder = "Digite seu texto aqui...",
  minHeight = "150px",
  label,
}: AIContentEditorProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleAIAction = async (action: string, tone?: string, language?: string) => {
    if (!value.trim()) {
      toast({
        title: "Texto vazio",
        description: "Digite algum texto para usar o assistente de IA.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingAction(action);

    try {
      let prompt = "";
      
      switch (action) {
        case "improve":
          prompt = `Melhore o seguinte texto, corrigindo erros gramaticais, melhorando a clareza e o fluxo, mantendo o significado original. Responda apenas com o texto melhorado, sem explicações:\n\n${value}`;
          break;
        case "expand":
          prompt = `Expanda o seguinte texto, adicionando mais detalhes, exemplos e informações relevantes, mantendo o tom e estilo originais. Responda apenas com o texto expandido:\n\n${value}`;
          break;
        case "summarize":
          prompt = `Resuma o seguinte texto de forma concisa, mantendo os pontos principais. Responda apenas com o resumo:\n\n${value}`;
          break;
        case "simplify":
          prompt = `Simplifique o seguinte texto, usando linguagem mais simples e direta, acessível a qualquer leitor. Responda apenas com o texto simplificado:\n\n${value}`;
          break;
        case "tone":
          const toneDescriptions: Record<string, string> = {
            professional: "profissional e formal, adequado para ambiente corporativo",
            friendly: "amigável e próximo, como uma conversa entre amigos",
            inspiring: "inspirador e motivacional, que empolga o leitor",
            educational: "educativo e didático, fácil de entender e aprender",
            empathetic: "empático e acolhedor, demonstrando compreensão e sensibilidade",
          };
          prompt = `Reescreva o seguinte texto com um tom ${toneDescriptions[tone || "professional"]}. Mantenha o significado original. Responda apenas com o texto reescrito:\n\n${value}`;
          break;
        case "translate":
          const langNames: Record<string, string> = {
            "pt-BR": "português brasileiro",
            en: "inglês",
            es: "espanhol",
            fr: "francês",
            it: "italiano",
            de: "alemão",
          };
          prompt = `Traduza o seguinte texto para ${langNames[language || "en"]}. Mantenha o tom e estilo originais. Responda apenas com a tradução:\n\n${value}`;
          break;
      }

      const { data, error } = await supabase.functions.invoke("ai-content-writer", {
        body: { prompt },
      });

      if (error) throw error;

      if (data?.response) {
        onChange(data.response);
        toast({
          title: "Texto atualizado!",
          description: "O assistente de IA processou seu texto com sucesso.",
        });
      }
    } catch (error) {
      console.error("AI processing error:", error);
      toast({
        title: "Erro ao processar",
        description: "Não foi possível processar o texto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingAction(null);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="text-sm font-medium text-gray-300">{label}</label>
      )}

      {/* AI Toolbar */}
      <div className="flex items-center gap-2 flex-wrap p-3 bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-xl border border-gray-700/50 backdrop-blur-sm">
        <div className="flex items-center gap-1.5 text-primary mr-2">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">IA</span>
        </div>

        {/* Quick Actions */}
        {AI_ACTIONS.map((action) => (
          <Button
            key={action.id}
            size="sm"
            variant="ghost"
            onClick={() => handleAIAction(action.id)}
            disabled={isProcessing}
            className={cn(
              "h-8 px-3 text-gray-400 hover:text-white hover:bg-gray-700/50",
              processingAction === action.id && "bg-primary/20 text-primary"
            )}
          >
            {processingAction === action.id ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <action.icon className="w-3.5 h-3.5 mr-1.5" />
            )}
            {action.label}
          </Button>
        ))}

        <div className="h-6 w-px bg-gray-700 mx-1" />

        {/* Tone Selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              disabled={isProcessing}
              className="h-8 px-3 text-gray-400 hover:text-white hover:bg-gray-700/50"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              Tom
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2 bg-gray-900 border-gray-700" align="start">
            <div className="space-y-1">
              {TONES.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => handleAIAction("tone", tone.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <tone.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{tone.label}</p>
                    <p className="text-xs text-gray-500">{tone.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              disabled={isProcessing}
              className="h-8 px-3 text-gray-400 hover:text-white hover:bg-gray-700/50"
            >
              <Languages className="w-3.5 h-3.5 mr-1.5" />
              Traduzir
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-900 border-gray-700" align="start">
            <DropdownMenuLabel className="text-gray-400 text-xs">
              Traduzir para
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-700" />
            {LANGUAGES.map((lang) => (
              <DropdownMenuItem
                key={lang.id}
                onClick={() => handleAIAction("translate", undefined, lang.id)}
                className="text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer"
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1" />

        {/* Copy Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          disabled={!value}
          className="h-8 px-3 text-gray-400 hover:text-white hover:bg-gray-700/50"
        >
          {isCopied ? (
            <Check className="w-3.5 h-3.5 mr-1.5 text-green-500" />
          ) : (
            <Copy className="w-3.5 h-3.5 mr-1.5" />
          )}
          {isCopied ? "Copiado" : "Copiar"}
        </Button>
      </div>

      {/* Text Area */}
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 resize-none",
            "focus:border-primary/50 focus:ring-primary/20"
          )}
          style={{ minHeight }}
        />
        
        {isProcessing && (
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <div className="flex items-center gap-3 text-primary">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Processando com IA...</span>
            </div>
          </div>
        )}
      </div>

      {/* Character Count */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>
          Use o assistente de IA para aprimorar seu texto em segundos
        </span>
        <span>{value.length} caracteres</span>
      </div>
    </div>
  );
};

export default AIContentEditor;
