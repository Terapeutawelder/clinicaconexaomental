import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Play, Download, Trash2, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Recording {
  id: string;
  patient: string;
  professional: string;
  date: string;
  time: string;
  duration: string;
  size: number;
  blobUrl: string;
}

const AdminRecordings = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Carregar gravações de todos os profissionais
    const allRecordings: Recording[] = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('professional_recordings_')) {
        const recordings = JSON.parse(localStorage.getItem(key) || '[]');
        allRecordings.push(...recordings);
      }
    });
    
    setRecordings(allRecordings);
  }, []);

  const filteredRecordings = recordings.filter(recording =>
    recording.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recording.professional.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recording.date.includes(searchTerm)
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = (recording: Recording) => {
    const link = document.createElement('a');
    link.href = recording.blobUrl;
    link.download = `consulta_${recording.patient}_${recording.date}_${recording.time}.webm`;
    link.click();
    
    toast({
      title: "Download iniciado",
      description: "A gravação está sendo baixada.",
    });
  };

  const handleDelete = (recordingId: string) => {
    const recordingToDelete = recordings.find(r => r.id === recordingId);
    if (!recordingToDelete) return;
    
    // Encontrar a chave correta no localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('professional_recordings_')) {
        const professionalRecordings = JSON.parse(localStorage.getItem(key) || '[]');
        const updatedRecordings = professionalRecordings.filter((r: Recording) => r.id !== recordingId);
        if (professionalRecordings.length !== updatedRecordings.length) {
          localStorage.setItem(key, JSON.stringify(updatedRecordings));
        }
      }
    });
    
    // Atualizar estado local
    setRecordings(recordings.filter(r => r.id !== recordingId));
    
    toast({
      title: "Gravação excluída",
      description: "A gravação foi removida permanentemente.",
    });
  };

  const handlePlay = (recording: Recording) => {
    window.open(recording.blobUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Gravações de Consultas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por paciente, profissional ou data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecordings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm ? "Nenhuma gravação encontrada." : "Nenhuma gravação disponível."}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecordings.map((recording) => (
                    <TableRow key={recording.id}>
                      <TableCell className="font-medium">{recording.patient}</TableCell>
                      <TableCell>{recording.professional}</TableCell>
                      <TableCell>{recording.date}</TableCell>
                      <TableCell>{recording.time}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{recording.duration}</Badge>
                      </TableCell>
                      <TableCell>{formatFileSize(recording.size)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePlay(recording)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(recording)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(recording.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Total: {filteredRecordings.length} gravação(ões)
            </span>
            <span>
              Espaço usado: {formatFileSize(filteredRecordings.reduce((acc, r) => acc + r.size, 0))}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRecordings;