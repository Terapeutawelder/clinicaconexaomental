
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const specialties = [
  "Psicólogo Clínico",
  "Terapeuta Familiar",
  "Psicólogo Infantil",
  "Neuropsicólogo",
  "Terapeuta de Casal",
  "Psicólogo Organizacional",
  "Psicoterapeuta",
  "TRG"
];

interface ProfessionalData {
  registrationNumber: string;
  experience: string;
  description: string;
}

interface ProfessionalDataFormProps {
  formData: ProfessionalData;
  selectedSpecialties: string[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  addSpecialty: (specialty: string) => void;
  removeSpecialty: (specialty: string) => void;
}

const ProfessionalDataForm = ({
  formData,
  selectedSpecialties,
  onInputChange,
  addSpecialty,
  removeSpecialty,
}: ProfessionalDataFormProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="registrationNumber">Número de Registro *</Label>
          <Input
            id="registrationNumber"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={onInputChange}
            placeholder="CRP, CRM, etc."
            required
          />
        </div>
        <div>
          <Label htmlFor="experience">Tempo de Experiência</Label>
          <Input
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={onInputChange}
            placeholder="5 anos"
          />
        </div>
      </div>

      <div>
        <Label>Formação Profissional *</Label>
        <div className="mt-2 space-y-2">
          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty) => (
              <Button
                key={specialty}
                type="button"
                variant={selectedSpecialties.includes(specialty) ? "default" : "outline"}
                size="sm"
                onClick={() => 
                  selectedSpecialties.includes(specialty) 
                    ? removeSpecialty(specialty) 
                    : addSpecialty(specialty)
                }
              >
                {specialty}
              </Button>
            ))}
          </div>
          {selectedSpecialties.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedSpecialties.map((specialty) => (
                <Badge key={specialty} variant="secondary">
                  {specialty}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => removeSpecialty(specialty)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descrição Profissional</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onInputChange}
          placeholder="Descreva sua experiência e abordagem terapêutica..."
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
};

export default ProfessionalDataForm;
