import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Brain, 
  Sparkles, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TranscriptEntry {
  id: string;
  speaker: "professional" | "patient";
  text: string;
  timestamp: Date;
  isFinal: boolean;
}

interface AIPsiAnalysisProps {
  transcripts: TranscriptEntry[];
  patientName?: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onAnalysisUpdate?: (analysis: string) => void;
}

const AIPsiAnalysis = ({ 
  transcripts, 
  patientName, 
  isVisible, 
  onToggleVisibility,
  onAnalysisUpdate
}: AIPsiAnalysisProps) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [lastAnalyzedCount, setLastAnalyzedCount] = useState(0);
  const analysisEndRef = useRef<HTMLDivElement>(null);
  const autoAnalyzeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-analyze when new transcripts arrive (with debounce)
  useEffect(() => {
    if (transcripts.length > 0 && transcripts.length !== lastAnalyzedCount) {
      // Clear existing timeout
      if (autoAnalyzeTimeoutRef.current) {
        clearTimeout(autoAnalyzeTimeoutRef.current);
      }

      // Set new timeout for auto-analysis (every 5 new transcript entries or 30 seconds)
      if (transcripts.length >= lastAnalyzedCount + 5) {
        autoAnalyzeTimeoutRef.current = setTimeout(() => {
          if (!isAnalyzing) {
            handleAnalyze();
          }
        }, 2000);
      }
    }

    return () => {
      if (autoAnalyzeTimeoutRef.current) {
        clearTimeout(autoAnalyzeTimeoutRef.current);
      }
    };
  }, [transcripts.length, lastAnalyzedCount, isAnalyzing]);

  const handleAnalyze = useCallback(async () => {
    if (transcripts.length === 0) {
      toast.info("Aguardando transcrições para análise");
      return;
    }

    setIsAnalyzing(true);
    setAnalysis("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-psi-analysis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            transcripts: transcripts.map(t => ({
              speaker: t.speaker,
              text: t.text,
              timestamp: t.timestamp.toISOString(),
            })),
            patientName,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro na análise");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullAnalysis = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullAnalysis += content;
              setAnalysis(fullAnalysis);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      setLastAnalyzedCount(transcripts.length);
      
      // Notify parent about the analysis update
      if (onAnalysisUpdate && fullAnalysis) {
        onAnalysisUpdate(fullAnalysis);
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao analisar transcrição");
    } finally {
      setIsAnalyzing(false);
    }
  }, [transcripts, patientName, onAnalysisUpdate]);

  // Auto-scroll analysis
  useEffect(() => {
    analysisEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [analysis]);

  if (!isVisible) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={onToggleVisibility}
        className="fixed bottom-24 right-6 z-50 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50"
      >
        <Brain className="h-4 w-4 mr-2 text-purple-500" />
        <Eye className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-24 right-6 z-50 w-96 max-h-[60vh] flex flex-col bg-gradient-to-br from-card via-card to-purple-950/20 border border-purple-500/30 rounded-xl shadow-2xl shadow-purple-500/10 overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-1">
                IA Psi
                <Sparkles className="h-3 w-3 text-purple-400" />
              </h3>
              <p className="text-xs text-muted-foreground">Análise em tempo real</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs bg-purple-500/10 border-purple-500/30">
              Apenas você vê
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={onToggleVisibility}
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Analysis content */}
          <ScrollArea className="flex-1 p-4 max-h-80">
            {analysis ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div 
                  className="text-sm whitespace-pre-wrap leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: analysis
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-400">$1</strong>')
                      .replace(/🧠|💭|💡|⚠️/g, '<span class="text-lg">$&</span>')
                      .replace(/\n/g, '<br/>')
                  }}
                />
                <div ref={analysisEndRef} />
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {transcripts.length === 0 ? (
                  <>
                    <Brain className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Inicie a transcrição para receber análises</p>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Clique em "Analisar" para obter insights</p>
                  </>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="p-3 border-t border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {transcripts.length} transcrições
                {lastAnalyzedCount > 0 && ` • ${lastAnalyzedCount} analisadas`}
              </span>
              <Button
                size="sm"
                onClick={handleAnalyze}
                disabled={isAnalyzing || transcripts.length === 0}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Analisar
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIPsiAnalysis;
