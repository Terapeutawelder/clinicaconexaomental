import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Edit, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";

interface AutomationCardProps {
    id: string;
    name: string;
    isActive: boolean;
    isConfigured: boolean;
    lastUpdated: string;
    onToggle: (id: string, active: boolean) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

const AutomationCard = ({
    id,
    name,
    isActive,
    isConfigured,
    lastUpdated,
    onToggle,
    onEdit,
    onDelete
}: AutomationCardProps) => {
    return (
        <Card className="bg-[hsl(215,40%,12%)] border-white/10 hover:border-white/20 transition-all">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-white text-lg">{name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                {isActive ? 'Ativo' : 'Não configurado'}
                            </span>
                        </div>
                    </div>
                    <Switch
                        checked={isActive}
                        onCheckedChange={(checked) => onToggle(id, checked)}
                        className="data-[state=checked]:bg-purple-600"
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-white/50">
                        <Clock className="w-4 h-4" />
                        <span>Atualizado em {lastUpdated}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(id)}
                            className="text-white/70 hover:text-white hover:bg-white/10"
                        >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(id)}
                            className="text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

interface AutomacoesPageProps {
    profileId: string;
}

const AutomacoesPage = ({ profileId }: AutomacoesPageProps) => {
    const navigate = useNavigate();
    const [automations, setAutomations] = useState([
        {
            id: "1",
            name: "Teste",
            isActive: true,
            isConfigured: false,
            lastUpdated: "31/01/2026 às 10:58"
        }
    ]);

    const handleToggle = (id: string, active: boolean) => {
        setAutomations(prev =>
            prev.map(auto =>
                auto.id === id ? { ...auto, isActive: active } : auto
            )
        );
        toast.success(active ? "Automação ativada" : "Automação desativada");
    };

    const handleEdit = (id: string) => {
        toast.info("Abrindo editor de automação...");
        // Implementar navegação para editor
    };

    const handleDelete = (id: string) => {
        setAutomations(prev => prev.filter(auto => auto.id !== id));
        toast.success("Automação removida");
    };

    const handleBack = () => {
        navigate("/dashboard?tab=overview");
    };

    const handleNewAutomation = () => {
        toast.info("Criando nova automação...");
        // Implementar criação de nova automação
    };

    return (
        <div className="space-y-6">
            {/* Header com botão voltar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBack}
                        className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Automações</h2>
                        <p className="text-white/50 text-sm">Gerencie seus fluxos de automação</p>
                    </div>
                </div>
                <Button
                    onClick={handleNewAutomation}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                    + Nova Automação
                </Button>
            </div>

            {/* Lista de automações */}
            <div className="grid gap-4">
                {automations.length === 0 ? (
                    <Card className="bg-[hsl(215,40%,12%)] border-white/10">
                        <CardContent className="py-12 text-center">
                            <p className="text-white/50">Nenhuma automação criada ainda.</p>
                            <Button
                                onClick={handleNewAutomation}
                                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                Criar primeira automação
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    automations.map((automation) => (
                        <AutomationCard
                            key={automation.id}
                            {...automation}
                            onToggle={handleToggle}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default AutomacoesPage;
