import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Award,
  Edit,
  Save,
  X,
  Camera,
  Star,
  BookOpen,
  Briefcase
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import GoogleCalendarIntegration from "@/components/GoogleCalendarIntegration";

interface ProfessionalData {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  specialty: string;
  therapeuticApproach: string;
  description: string;
  experience: string;
  rating: number;
  totalConsultations: number;
  address: string;
  crp: string;
  gender: string;
  availability: {
    days: string[];
    hours: string[];
  };
  education: string[];
  certifications: string[];
  image: string;
  curriculum?: File | null;
  // Novas funcionalidades
  company: {
    name: string;
    cnpj: string;
    phone: string;
    email: string;
    website: string;
  };
  googleCalendarEmail: string;
}

interface ProfessionalProfileProps {
  children: React.ReactNode;
}

const ProfessionalProfile = ({ children }: ProfessionalProfileProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  
  const [professionalData, setProfessionalData] = useState<ProfessionalData>({
    id: "1",
    name: "Dr. João Silva",
    email: "joao.silva@conexaomental.com",
    phone: "(11) 99999-0000",
    cpf: "000.000.000-00",
    specialty: "psicologo",
    therapeuticApproach: "Terapia Cognitivo-Comportamental",
    description: "Especialista em terapia cognitivo-comportamental com mais de 10 anos de experiência. Atendo adolescentes e adultos, com foco em ansiedade, depressão e transtornos do humor.",
    experience: "10+ anos",
    rating: 4.9,
    totalConsultations: 1250,
    address: "São Paulo, SP",
    crp: "CRP 06/123456",
    gender: "masculino",
    availability: {
      days: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
      hours: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]
    },
    education: [
      "Mestrado em Psicologia Clínica - USP",
      "Graduação em Psicologia - PUC-SP",
      "Especialização em TCC - CETCC"
    ],
    certifications: [
      "Certificação em Terapia Cognitivo-Comportamental",
      "Formação em Mindfulness",
      "Certificação em Terapia Online"
    ],
    image: "/images/professional1.jpg",
    curriculum: null,
    company: {
      name: "Clínica ConexãoMental",
      cnpj: "54.423.733/0001-68",
      phone: "(11) 3456-7890",
      email: "contato@clinicaconexaomental.online",
      website: "https://clinicaconexaomental.online"
    },
    googleCalendarEmail: ""
  });

  const [editData, setEditData] = useState<ProfessionalData>(professionalData);

  useEffect(() => {
    // Carregar dados do localStorage se disponíveis
    const loadDataFromStorage = () => {
      const savedData = localStorage.getItem('professionalProfileData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          const updatedData = {
            ...professionalData,
            ...parsedData
          };
          setProfessionalData(updatedData);
          setEditData(updatedData);
        } catch (error) {
          console.error('Erro ao carregar dados do perfil:', error);
        }
      } else {
        setEditData(professionalData);
      }
    };

    // Carregar dados iniciais
    loadDataFromStorage();

    // Listener para mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'professionalProfileData') {
        loadDataFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Função para sincronizar dados automaticamente
  const syncDataToLocalStorage = (data: ProfessionalData) => {
    const professionalDataToSave = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      cpf: data.cpf,
      crp: data.crp,
      specialty: data.specialty,
      therapeuticApproach: data.therapeuticApproach,
      experience: data.experience,
      gender: data.gender,
      description: data.description,
      address: data.address,
      education: data.education,
      certifications: data.certifications,
      availability: data.availability,
      curriculum: data.curriculum,
      rating: data.rating,
      totalConsultations: data.totalConsultations,
      image: data.image,
      company: data.company,
      googleCalendarEmail: data.googleCalendarEmail
    };
    
    localStorage.setItem('professionalProfileData', JSON.stringify(professionalDataToSave));
  };

  const handleSave = () => {
    setProfessionalData(editData);
    
    // Sincronizar dados com localStorage
    syncDataToLocalStorage(editData);
    
    setIsEditing(false);
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso.",
    });
  };

  const handleCancel = () => {
    setEditData(professionalData);
    setIsEditing(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditData({ ...editData, image: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addEducation = () => {
    setEditData({
      ...editData,
      education: [...editData.education, ""]
    });
  };

  const updateEducation = (index: number, value: string) => {
    const newEducation = [...editData.education];
    newEducation[index] = value;
    setEditData({ ...editData, education: newEducation });
  };

  const removeEducation = (index: number) => {
    const newEducation = editData.education.filter((_, i) => i !== index);
    setEditData({ ...editData, education: newEducation });
  };

  const addCertification = () => {
    setEditData({
      ...editData,
      certifications: [...editData.certifications, ""]
    });
  };

  const updateCertification = (index: number, value: string) => {
    const newCertifications = [...editData.certifications];
    newCertifications[index] = value;
    setEditData({ ...editData, certifications: newCertifications });
  };

  const removeCertification = (index: number) => {
    const newCertifications = editData.certifications.filter((_, i) => i !== index);
    setEditData({ ...editData, certifications: newCertifications });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-purple-50 to-indigo-50">
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {professionalData.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <span className="text-2xl font-bold gradient-text">Perfil Profissional</span>
                <p className="text-purple-600 font-medium">{professionalData.name}</p>
              </div>
            </DialogTitle>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel} className="border-purple-200 text-purple-700 hover:bg-purple-600 hover:text-white">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => setIsEditing(true)} className="bg-purple-600 hover:bg-purple-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm border-purple-200">
            <TabsTrigger value="info" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">Informações</TabsTrigger>
            <TabsTrigger value="company" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">Empresa</TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">Formação</TabsTrigger>
            <TabsTrigger value="availability" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">Disponibilidade</TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">Google Calendar</TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">Estatísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                <CardTitle className="text-xl">Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-r from-purple-200 to-purple-300 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
                      {editData.image ? (
                        <img src={editData.image} alt="Perfil" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-10 w-10 text-purple-700" />
                      )}
                    </div>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-purple-700 text-white rounded-full p-2 cursor-pointer hover:bg-purple-800 transition-colors shadow-md">
                        <Camera className="h-4 w-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{professionalData.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({professionalData.totalConsultations} consultas)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) => {
                        const newData = { ...editData, name: e.target.value };
                        setEditData(newData);
                        if (isEditing) syncDataToLocalStorage(newData);
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => {
                        const newData = { ...editData, email: e.target.value };
                        setEditData(newData);
                        if (isEditing) syncDataToLocalStorage(newData);
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={editData.phone}
                      onChange={(e) => {
                        const newData = { ...editData, phone: e.target.value };
                        setEditData(newData);
                        if (isEditing) syncDataToLocalStorage(newData);
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={editData.cpf}
                      onChange={(e) => {
                        const newData = { ...editData, cpf: e.target.value };
                        setEditData(newData);
                        if (isEditing) syncDataToLocalStorage(newData);
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="crp">Identificação Profissional</Label>
                    <Input
                      id="crp"
                      value={editData.crp}
                      onChange={(e) => {
                        const newData = { ...editData, crp: e.target.value };
                        setEditData(newData);
                        if (isEditing) syncDataToLocalStorage(newData);
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gênero</Label>
                    <Select value={editData.gender} onValueChange={(value) => {
                      const newData = { ...editData, gender: value };
                      setEditData(newData);
                      if (isEditing) syncDataToLocalStorage(newData);
                    }} disabled={!isEditing}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o gênero" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                        <SelectItem value="lgbt">LGBT</SelectItem>
                        <SelectItem value="homossexual">Homossexual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="specialty">Especialidade</Label>
                    <Select value={editData.specialty} onValueChange={(value) => {
                      const newData = { ...editData, specialty: value };
                      setEditData(newData);
                      if (isEditing) syncDataToLocalStorage(newData);
                    }} disabled={!isEditing}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a especialidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="psicologo">Psicólogo</SelectItem>
                        <SelectItem value="psicanalista">Psicanalista</SelectItem>
                        <SelectItem value="terapeuta">Terapeuta</SelectItem>
                        <SelectItem value="psicoterapeuta">Psicoterapeuta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="therapeuticApproach">Abordagem Terapêutica</Label>
                    <Select value={editData.therapeuticApproach} onValueChange={(value) => {
                      const newData = { ...editData, therapeuticApproach: value };
                      setEditData(newData);
                      if (isEditing) syncDataToLocalStorage(newData);
                    }} disabled={!isEditing}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a abordagem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Terapia Cognitivo-Comportamental">Terapia Cognitivo-Comportamental</SelectItem>
                        <SelectItem value="Psicanálise">Psicanálise</SelectItem>
                        <SelectItem value="Terapia Humanista">Terapia Humanista</SelectItem>
                        <SelectItem value="Gestalt-Terapia">Gestalt-Terapia</SelectItem>
                        <SelectItem value="Terapia Sistêmica">Terapia Sistêmica</SelectItem>
                        <SelectItem value="Terapia Integrativa">Terapia Integrativa</SelectItem>
                        <SelectItem value="Terapia Comportamental">Terapia Comportamental</SelectItem>
                        <SelectItem value="Terapia Familiar">Terapia Familiar</SelectItem>
                        <SelectItem value="Terapia de Casal">Terapia de Casal</SelectItem>
                        <SelectItem value="Terapia Breve">Terapia Breve</SelectItem>
                        <SelectItem value="Terapia Focada em Emoções">Terapia Focada em Emoções</SelectItem>
                        <SelectItem value="Terapia Narrativa">Terapia Narrativa</SelectItem>
                        <SelectItem value="Psicologia Analítica">Psicologia Analítica</SelectItem>
                        <SelectItem value="Terapia do Esquema">Terapia do Esquema</SelectItem>
                        <SelectItem value="Hipnoterapia">Hipnoterapia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="address">Localização</Label>
                    <Input
                      id="address"
                      value={editData.address}
                      onChange={(e) => {
                        const newData = { ...editData, address: e.target.value };
                        setEditData(newData);
                        if (isEditing) syncDataToLocalStorage(newData);
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição Profissional</Label>
                  <Textarea
                    id="description"
                    value={editData.description}
                    onChange={(e) => {
                      const newData = { ...editData, description: e.target.value };
                      setEditData(newData);
                      if (isEditing) syncDataToLocalStorage(newData);
                    }}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
                
                {isEditing && (
                  <div>
                    <Label htmlFor="curriculum">Currículo (PDF)</Label>
                    <Input
                      id="curriculum"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const newData = { ...editData, curriculum: file };
                          setEditData(newData);
                          if (isEditing) syncDataToLocalStorage(newData);
                        }
                      }}
                      className="cursor-pointer"
                    />
                    {editData.curriculum && (
                      <p className="text-sm text-purple-600 mt-2">
                        Arquivo selecionado: {editData.curriculum.name}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center space-x-2">
                  <Briefcase className="h-5 w-5" />
                  <span>Informações da Empresa</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Nome da Empresa</Label>
                    <Input
                      id="companyName"
                      value={editData.company.name}
                      onChange={(e) => {
                        const newData = { ...editData, company: { ...editData.company, name: e.target.value } };
                        setEditData(newData);
                        if (isEditing) syncDataToLocalStorage(newData);
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyCnpj">CNPJ</Label>
                    <Input
                      id="companyCnpj"
                      value={editData.company.cnpj}
                      onChange={(e) => {
                        const newData = { ...editData, company: { ...editData.company, cnpj: e.target.value } };
                        setEditData(newData);
                        if (isEditing) syncDataToLocalStorage(newData);
                      }}
                      disabled={!isEditing}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyPhone">Telefone da Empresa</Label>
                    <Input
                      id="companyPhone"
                      value={editData.company.phone}
                      onChange={(e) => {
                        const newData = { ...editData, company: { ...editData.company, phone: e.target.value } };
                        setEditData(newData);
                        if (isEditing) syncDataToLocalStorage(newData);
                      }}
                      disabled={!isEditing}
                      placeholder="(11) 0000-0000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyEmail">Email da Empresa</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={editData.company.email}
                      onChange={(e) => {
                        const newData = { ...editData, company: { ...editData.company, email: e.target.value } };
                        setEditData(newData);
                        if (isEditing) syncDataToLocalStorage(newData);
                      }}
                      disabled={!isEditing}
                      placeholder="contato@empresa.com"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="companyWebsite">Website</Label>
                    <Input
                      id="companyWebsite"
                      value={editData.company.website}
                      onChange={(e) => {
                        const newData = { ...editData, company: { ...editData.company, website: e.target.value } };
                        setEditData(newData);
                        if (isEditing) syncDataToLocalStorage(newData);
                      }}
                      disabled={!isEditing}
                      placeholder="https://www.empresa.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Endereço Completo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="fullAddress">Endereço Completo</Label>
                    <Textarea
                      id="fullAddress"
                      value={editData.address}
                      onChange={(e) => {
                        const newData = { ...editData, address: e.target.value };
                        setEditData(newData);
                        if (isEditing) syncDataToLocalStorage(newData);
                      }}
                      disabled={!isEditing}
                      placeholder="Rua, número, complemento, bairro, cidade, estado, CEP"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <BookOpen className="h-6 w-6" />
                    <span>Formação Acadêmica</span>
                  </CardTitle>
                  {isEditing && (
                    <Button variant="outline" size="sm" onClick={addEducation} className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                      Adicionar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editData.education.map((edu, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={edu}
                      onChange={(e) => updateEducation(index, e.target.value)}
                      disabled={!isEditing}
                      placeholder="Digite a formação acadêmica"
                    />
                    {isEditing && (
                      <Button variant="ghost" size="sm" onClick={() => removeEducation(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <Award className="h-6 w-6" />
                    <span>Certificações</span>
                  </CardTitle>
                  {isEditing && (
                    <Button variant="outline" size="sm" onClick={addCertification} className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                      Adicionar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={cert}
                      onChange={(e) => updateCertification(index, e.target.value)}
                      disabled={!isEditing}
                      placeholder="Digite a certificação"
                    />
                    {isEditing && (
                      <Button variant="ghost" size="sm" onClick={() => removeCertification(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <Calendar className="h-6 w-6" />
                  <span>Disponibilidade</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Dias da Semana</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((day) => (
                      <Badge
                        key={day}
                        variant={editData.availability.days.includes(day) ? "default" : "outline"}
                        className={`cursor-pointer transition-colors ${
                          editData.availability.days.includes(day) 
                            ? "bg-purple-600 text-white hover:bg-purple-700" 
                            : "border-purple-200 text-purple-700 hover:bg-purple-600 hover:text-white"
                        }`}
                        onClick={() => {
                          if (isEditing) {
                            const newDays = editData.availability.days.includes(day)
                              ? editData.availability.days.filter(d => d !== day)
                              : [...editData.availability.days, day];
                            setEditData({
                              ...editData,
                              availability: { ...editData.availability, days: newDays }
                            });
                          }
                        }}
                      >
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Horários Disponíveis</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {Array.from({ length: 12 }, (_, i) => {
                      const hour = (i + 8).toString().padStart(2, '0') + ':00';
                      return (
                        <Badge
                          key={hour}
                          variant={editData.availability.hours.includes(hour) ? "default" : "outline"}
                          className={`cursor-pointer justify-center transition-colors ${
                            editData.availability.hours.includes(hour) 
                              ? "bg-purple-600 text-white hover:bg-purple-700" 
                              : "border-purple-200 text-purple-700 hover:bg-purple-600 hover:text-white"
                          }`}
                          onClick={() => {
                            if (isEditing) {
                              const newHours = editData.availability.hours.includes(hour)
                                ? editData.availability.hours.filter(h => h !== hour)
                                : [...editData.availability.hours, hour];
                              setEditData({
                                ...editData,
                                availability: { ...editData.availability, hours: newHours }
                              });
                            }
                          }}
                        >
                          {hour}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Integração Google Calendar</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div>
                  <Label htmlFor="googleCalendarEmail">Email do Google Calendar</Label>
                  <Input
                    id="googleCalendarEmail"
                    type="email"
                    value={editData.googleCalendarEmail}
                    onChange={(e) => {
                      const newData = { ...editData, googleCalendarEmail: e.target.value };
                      setEditData(newData);
                      if (isEditing) syncDataToLocalStorage(newData);
                    }}
                    disabled={!isEditing}
                    placeholder="seuemail@gmail.com"
                  />
                  <p className="text-sm text-purple-600 mt-2">
                    Insira o email da conta Google que será usada para integração com o Google Calendar
                  </p>
                </div>
                
                <div className="mt-6">
                  <GoogleCalendarIntegration />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-700 mb-2">{professionalData.totalConsultations}</div>
                    <div className="text-sm text-purple-600 font-medium">Consultas Realizadas</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-2">
                      <Star className="h-8 w-8 text-yellow-500 fill-current" />
                      <span className="text-4xl font-bold text-purple-700">{professionalData.rating}</span>
                    </div>
                    <div className="text-sm text-purple-600 font-medium">Avaliação Média</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-700 mb-2">{professionalData.experience}</div>
                    <div className="text-sm text-purple-600 font-medium">Experiência</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProfessionalProfile;