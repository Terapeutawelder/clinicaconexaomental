import { useState } from "react";
import {
  Users,
  Search,
  Plus,
  MoreVertical,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { type MemberWithProgress } from "@/hooks/useMemberAccess";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface MembersListTabProps {
  members: MemberWithProgress[];
  loading: boolean;
  onAddMember: (email: string, expiresAt?: Date) => Promise<any>;
  onUpdateMember: (memberId: string, updates: { isActive?: boolean; expiresAt?: string | null }) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
}

const MembersListTab = ({
  members,
  loading,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
}: MembersListTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberHasExpiry, setNewMemberHasExpiry] = useState(false);
  const [newMemberExpiryDate, setNewMemberExpiryDate] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [deletingMember, setDeletingMember] = useState<MemberWithProgress | null>(null);

  const filteredMembers = members.filter(
    (m) =>
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;

    setAddingMember(true);
    const expiryDate = newMemberHasExpiry && newMemberExpiryDate
      ? new Date(newMemberExpiryDate)
      : undefined;

    const result = await onAddMember(newMemberEmail.trim(), expiryDate);
    setAddingMember(false);

    if (result) {
      setIsAddModalOpen(false);
      setNewMemberEmail("");
      setNewMemberHasExpiry(false);
      setNewMemberExpiryDate("");
    }
  };

  const getProgressPercentage = (member: MemberWithProgress) => {
    if (member.totalLessons === 0) return 0;
    return Math.round((member.completedLessons / member.totalLessons) * 100);
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Lista de Membros</CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Buscar membro..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Membro
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                <Users className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Nenhum membro ainda
              </h3>
              <p className="text-gray-500 max-w-md mb-4">
                Adicione membros para que eles possam acessar seus conteúdos exclusivos.
              </p>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar primeiro membro
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 transition-colors"
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={member.avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {getInitials(member.fullName, member.email)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white truncate">
                        {member.fullName || "Sem nome"}
                      </h4>
                      {member.isActive ? (
                        <Badge className="bg-green-500/20 text-green-400 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-400 text-xs">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inativo
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Desde {format(new Date(member.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      {member.lastAccessAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Último acesso{" "}
                          {formatDistanceToNow(new Date(member.lastAccessAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-white mb-1">
                        {member.completedLessons}/{member.totalLessons} aulas
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={getProgressPercentage(member)}
                          className="w-24 h-2 bg-gray-700"
                        />
                        <span className="text-xs text-gray-400">
                          {getProgressPercentage(member)}%
                        </span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-white"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-gray-900 border-gray-800"
                      >
                        {member.isActive ? (
                          <DropdownMenuItem
                            onClick={() =>
                              onUpdateMember(member.id, { isActive: false })
                            }
                            className="text-yellow-400 focus:text-yellow-400 focus:bg-yellow-500/10"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Desativar acesso
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() =>
                              onUpdateMember(member.id, { isActive: true })
                            }
                            className="text-green-400 focus:text-green-400 focus:bg-green-500/10"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reativar acesso
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-gray-800" />
                        <DropdownMenuItem
                          onClick={() => setDeletingMember(member)}
                          className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover membro
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Member Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Adicionar Membro</DialogTitle>
            <DialogDescription className="text-gray-400">
              Adicione um usuário à sua área de membros pelo email cadastrado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email do usuário</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@email.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="expiry">Definir data de expiração</Label>
                <p className="text-xs text-gray-500">
                  O acesso será revogado automaticamente após esta data.
                </p>
              </div>
              <Switch
                id="expiry"
                checked={newMemberHasExpiry}
                onCheckedChange={setNewMemberHasExpiry}
              />
            </div>
            {newMemberHasExpiry && (
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Data de expiração</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={newMemberExpiryDate}
                  onChange={(e) => setNewMemberExpiryDate(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddMember}
              disabled={!newMemberEmail.trim() || addingMember}
              className="bg-primary hover:bg-primary/90"
            >
              {addingMember ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Adicionando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Membro
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingMember}
        onClose={() => setDeletingMember(null)}
        onConfirm={async () => {
          if (deletingMember) {
            await onRemoveMember(deletingMember.id);
            setDeletingMember(null);
          }
        }}
        title="Remover membro"
        description="O membro perderá acesso a todos os conteúdos exclusivos. O progresso será mantido caso você adicione-o novamente."
        itemName={deletingMember?.fullName || deletingMember?.email}
      />
    </>
  );
};

export default MembersListTab;
