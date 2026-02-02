import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardList,
  Save,
  Plus,
  X,
  AlertCircle,
  Heart,
  Brain,
  Target,
  FileText,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PatientRecordTabProps {
  patientEmail: string | null;
  patientName: string;
  professionalId: string;
}

interface PatientRecord {
  id?: string;
  chief_complaint: string;
  diagnosis: string;
  treatment_plan: string;
  medications: string[];
  allergies: string;
  medical_history: string;
  risk_level: "low" | "medium" | "high";
}

const PatientRecordTab = ({
  patientEmail,
  patientName,
  professionalId,
}: PatientRecordTabProps) => {
  const [record, setRecord] = useState<PatientRecord>({
    chief_complaint: "",
    diagnosis: "",
    treatment_plan: "",
    medications: [],
    allergies: "",
    medical_history: "",
    risk_level: "low",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newMedication, setNewMedication] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Load record from database
  useEffect(() => {
    const loadRecord = async () => {
      if (!patientEmail) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("patient_records")
          .select("*")
          .eq("professional_id", professionalId)
          .eq("patient_email", patientEmail)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setRecord({
            id: data.id,
            chief_complaint: data.chief_complaint || "",
            diagnosis: data.diagnosis || "",
            treatment_plan: data.treatment_plan || "",
            medications: (data.medications as string[]) || [],
            allergies: data.allergies || "",
            medical_history: data.medical_history || "",
            risk_level: (data.risk_level as "low" | "medium" | "high") || "low",
          });
        }
      } catch (error) {
        console.error("Error loading patient record:", error);
        toast.error("Erro ao carregar prontuário");
      } finally {
        setIsLoading(false);
      }
    };

    loadRecord();
  }, [patientEmail, professionalId]);

  const handleSave = async () => {
    if (!patientEmail) {
      toast.error("Email do paciente não disponível");
      return;
    }

    setIsSaving(true);
    try {
      const recordData = {
        professional_id: professionalId,
        patient_email: patientEmail,
        patient_name: patientName,
        chief_complaint: record.chief_complaint,
        diagnosis: record.diagnosis,
        treatment_plan: record.treatment_plan,
        medications: record.medications,
        allergies: record.allergies,
        medical_history: record.medical_history,
        risk_level: record.risk_level,
      };

      if (record.id) {
        // Update existing record
        const { error } = await supabase
          .from("patient_records")
          .update(recordData)
          .eq("id", record.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from("patient_records")
          .insert(recordData)
          .select()
          .single();

        if (error) throw error;
        setRecord((prev) => ({ ...prev, id: data.id }));
      }

      toast.success("Prontuário salvo com sucesso");
      setHasChanges(false);
    } catch (error: any) {
      console.error("Error saving record:", error);
      toast.error("Erro ao salvar prontuário");
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof PatientRecord, value: any) => {
    setRecord((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const addMedication = () => {
    if (newMedication.trim()) {
      updateField("medications", [...record.medications, newMedication.trim()]);
      setNewMedication("");
    }
  };

  const removeMedication = (index: number) => {
    updateField(
      "medications",
      record.medications.filter((_, i) => i !== index)
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando prontuário...</span>
      </div>
    );
  }

  if (!patientEmail) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Email do paciente não disponível para criar prontuário.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Save Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Prontuário do Paciente</h3>
          {hasChanges && (
            <Badge variant="outline" className="text-yellow-500 border-yellow-500/20">
              Alterações não salvas
            </Badge>
          )}
        </div>
        <Button onClick={handleSave} disabled={isSaving} size="sm">
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-1" />
          )}
          {isSaving ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      {/* Risk Level */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Nível de Risco
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={record.risk_level}
            onValueChange={(value: "low" | "medium" | "high") =>
              updateField("risk_level", value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Baixo
                </span>
              </SelectItem>
              <SelectItem value="medium">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  Médio
                </span>
              </SelectItem>
              <SelectItem value="high">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Alto
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Chief Complaint & Diagnosis */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Queixa Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={record.chief_complaint}
              onChange={(e) => updateField("chief_complaint", e.target.value)}
              placeholder="Descreva a queixa principal do paciente..."
              rows={3}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Hipótese Diagnóstica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={record.diagnosis}
              onChange={(e) => updateField("diagnosis", e.target.value)}
              placeholder="CID ou descrição diagnóstica..."
              rows={3}
            />
          </CardContent>
        </Card>
      </div>

      {/* Treatment Plan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4" />
            Plano Terapêutico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={record.treatment_plan}
            onChange={(e) => updateField("treatment_plan", e.target.value)}
            placeholder="Descreva o plano de tratamento, objetivos e estratégias..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Medications & Allergies */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Medicações em Uso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                placeholder="Nome da medicação..."
                onKeyDown={(e) => e.key === "Enter" && addMedication()}
              />
              <Button size="icon" variant="outline" onClick={addMedication}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {record.medications.map((med, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  {med}
                  <button
                    onClick={() => removeMedication(i)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {record.medications.length === 0 && (
                <span className="text-sm text-muted-foreground italic">
                  Nenhuma medicação registrada
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Alergias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={record.allergies}
              onChange={(e) => updateField("allergies", e.target.value)}
              placeholder="Liste as alergias conhecidas..."
              rows={3}
            />
          </CardContent>
        </Card>
      </div>

      {/* Medical History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Histórico Médico</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={record.medical_history}
            onChange={(e) => updateField("medical_history", e.target.value)}
            placeholder="Histórico de doenças, cirurgias, internações, histórico familiar..."
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientRecordTab;
