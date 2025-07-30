
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Brain, Users, Heart, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProfessionalRegistration = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    cpf: "",
    crp: "",
    specialty: "",
    therapeuticApproach: "",
    experience: "",
    gender: "",
    description: "",
    address: "",
    curriculum: null as File | null,
    acceptTerms: false
  });

  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");

  const specialties = [
    { id: "psicologo", name: "Psicólogo", icon: Brain },
    { id: "psicanalista", name: "Psicanalista", icon: Users },
    { id: "terapeuta", name: "Terapeuta", icon: Heart },
    { id: "psicoterapeuta", name: "Psicoterapeuta", icon: Trophy }
  ];

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      toast({
        title: "Código de indicação detectado!",
        description: `Você foi indicado com o código: ${refCode}`,
      });
    }

    // Carregar dados do perfil profissional se disponíveis
    const savedProfileData = localStorage.getItem('professionalProfileData');
    if (savedProfileData) {
      try {
        const parsedData = JSON.parse(savedProfileData);
        setFormData(prev => ({
          ...prev,
          name: parsedData.name || prev.name,
          email: parsedData.email || prev.email,
          phone: parsedData.phone || prev.phone,
          cpf: parsedData.cpf || prev.cpf,
          crp: parsedData.crp || prev.crp,
          specialty: parsedData.specialty || prev.specialty,
          therapeuticApproach: parsedData.therapeuticApproach || prev.therapeuticApproach,
          experience: parsedData.experience || prev.experience,
          gender: parsedData.gender || prev.gender,
          description: parsedData.description || prev.description,
          address: parsedData.address || prev.address,
          curriculum: parsedData.curriculum || prev.curriculum
        }));
        
        if (parsedData.specialty) {
          setSelectedSpecialty(parsedData.specialty);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do perfil profissional:', error);
      }
    }

    // Listener para mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'professionalProfileData') {
        const savedData = localStorage.getItem('professionalProfileData');
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            setFormData(prev => ({
              ...prev,
              name: parsedData.name || prev.name,
              email: parsedData.email || prev.email,
              phone: parsedData.phone || prev.phone,
              cpf: parsedData.cpf || prev.cpf,
              crp: parsedData.crp || prev.crp,
              specialty: parsedData.specialty || prev.specialty,
              therapeuticApproach: parsedData.therapeuticApproach || prev.therapeuticApproach,
              experience: parsedData.experience || prev.experience,
              gender: parsedData.gender || prev.gender,
              description: parsedData.description || prev.description,
              address: parsedData.address || prev.address,
              curriculum: parsedData.curriculum || prev.curriculum
            }));
            
            if (parsedData.specialty) {
              setSelectedSpecialty(parsedData.specialty);
            }
          } catch (error) {
            console.error('Erro ao sincronizar dados:', error);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location, toast]);

  // Função para sincronizar dados com localStorage
  const syncDataToLocalStorage = (data: typeof formData) => {
    const professionalDataForProfile = {
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
      curriculum: data.curriculum,
      availability: {
        days: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
        hours: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]
      },
      education: [],
      certifications: [],
      rating: 4.9,
      totalConsultations: 0,
      image: "/images/professional1.jpg",
      company: {
        name: "Clínica ConexãoMental",
        cnpj: "54.423.733/0001-68",
        phone: "(11) 3456-7890",
        email: "contato@clinicaconexaomental.online",
        website: "https://clinicaconexaomental.online"
      },
      googleCalendarEmail: ""
    };
    
    localStorage.setItem('professionalProfileData', JSON.stringify(professionalDataForProfile));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    setFormData(newFormData);
    
    // Sincronizar automaticamente com localStorage
    syncDataToLocalStorage(newFormData);
  };

  const handleSpecialtySelect = (specialtyId: string) => {
    setSelectedSpecialty(specialtyId);
    const newFormData = {
      ...formData,
      specialty: specialtyId
    };
    setFormData(newFormData);
    
    // Sincronizar automaticamente com localStorage
    syncDataToLocalStorage(newFormData);
  };

  const handleCurriculumUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFormData = {
        ...formData,
        curriculum: file
      };
      setFormData(newFormData);
      
      // Sincronizar automaticamente com localStorage
      syncDataToLocalStorage(newFormData);
    }
  };

  // Função para lidar com mudanças em campos de Select
  const handleSelectChange = (name: string, value: string) => {
    const newFormData = {
      ...formData,
      [name]: value
    };
    setFormData(newFormData);
    
    // Sincronizar automaticamente com localStorage
    syncDataToLocalStorage(newFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!selectedSpecialty) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma especialidade.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Limpar possíveis tokens antigos
      localStorage.removeItem('auth_token');
      
      // Validações básicas
      if (!formData.name || !formData.email || !formData.password || !selectedSpecialty) {
        throw new Error("Por favor, preencha todos os campos obrigatórios");
      }

      // Normalizar email
      const normalizedEmail = formData.email.toLowerCase().trim();
      
      console.log("Iniciando cadastro com dados:", { 
        name: formData.name, 
        email: normalizedEmail, 
        specialty: selectedSpecialty 
      });
      
      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        throw new Error("Por favor, insira um email válido");
      }

      // Validar senha (mínimo 6 caracteres)
      if (formData.password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres");
      }

      if (!formData.acceptTerms) {
        throw new Error("Você deve concordar com os termos e condições");
      }

      // Usar a nova rota específica para registro profissional
      const response = await fetch('/api/professionals/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: normalizedEmail,
          password: formData.password,
          specialty: selectedSpecialty,
          crp: formData.crp,
          therapeuticApproach: formData.therapeuticApproach,
          experience: formData.experience,
          description: formData.description,
          phone: formData.phone,
          cpf: formData.cpf,
          gender: formData.gender,
          address: formData.address
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao realizar cadastro");
      }

      // Salvar dados no localStorage para sincronizar com perfil
      const professionalDataForProfile = {
        name: formData.name,
        email: normalizedEmail,
        phone: formData.phone,
        cpf: formData.cpf,
        crp: formData.crp,
        specialty: selectedSpecialty,
        experience: formData.experience,
        gender: formData.gender,
        curriculum: formData.curriculum,
        description: `Especialista em ${selectedSpecialty} com experiência desde ${formData.experience}.`,
        address: "A definir",
        therapeuticApproach: "A definir",
        availability: {
          days: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
          hours: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]
        },
        education: [],
        certifications: []
      };
      
      localStorage.setItem('professionalProfileData', JSON.stringify(professionalDataForProfile));

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Aguarde a aprovação do administrador para acessar a área profissional",
      });

      // Redirecionar para página de login com mensagem
      navigate('/login-profissional?message=cadastro_realizado');
    } catch (error: any) {
      console.error("Erro detalhado no cadastro:", error);
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-start justify-center p-4 pt-2">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-2">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="absolute top-4 left-4 text-gray-600 hover:bg-purple-600 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            A evolução e bem-estar da<br />
            sua carreira <span className="text-purple-600">começa aqui!</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Não deixe para depois. Preencha o formulário abaixo para começar sua experiência com a Clínica ConexãoMental.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 rounded-2xl p-4 shadow-2xl w-full max-w-full mx-auto">
          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Seção de Dados Pessoais e Especialidades */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Sobre Você */}
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-white mb-3">Sobre você</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-white mb-2 block">Nome</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Seu nome completo"
                      className="bg-white/90 border-0 h-10 text-gray-900 placeholder:text-gray-500"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-white mb-2 block">E-mail</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="seu@email.com"
                      className="bg-white/90 border-0 h-10 text-gray-900 placeholder:text-gray-500"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-white mb-2 block">Senha</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Sua senha"
                      className="bg-white/90 border-0 h-10 text-gray-900 placeholder:text-gray-500"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="cpf" className="text-white mb-2 block">CPF</Label>
                    <Input
                      id="cpf"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleInputChange}
                      placeholder="000.000.000-00"
                      className="bg-white/90 border-0 h-10 text-gray-900 placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-white mb-2 block">Celular</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(11) 99999-9999"
                      className="bg-white/90 border-0 h-10 text-gray-900 placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="crp" className="text-white mb-2 block">Identificação Profissional</Label>
                    <Input
                      id="crp"
                      name="crp"
                      value={formData.crp}
                      onChange={handleInputChange}
                      placeholder="CRP, CRM, ou outro registro"
                      className="bg-white/90 border-0 h-10 text-gray-900 placeholder:text-gray-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="gender" className="text-white mb-2 block">Gênero</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
                      <SelectTrigger className="bg-white/90 border-0 h-10 text-gray-900">
                        <SelectValue placeholder="Selecione seu gênero" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Sua Especialidade */}
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-white mb-3">Sua especialidade</h2>
                
                {/* Specialty Icons em linha única */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {specialties.map((specialty) => {
                    const Icon = specialty.icon;
                    return (
                      <button
                        key={specialty.id}
                        type="button"
                        onClick={() => handleSpecialtySelect(specialty.id)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedSpecialty === specialty.id
                            ? 'border-purple-400 bg-purple-600 text-white shadow-lg'
                            : 'border-white/30 bg-white text-gray-700 hover:bg-purple-600 hover:text-white hover:border-purple-400'
                        }`}
                      >
                        <Icon className="h-6 w-6 mx-auto mb-1" />
                        <div className="text-xs font-medium">{specialty.name}</div>
                      </button>
                    );
                  })}
                </div>

                <div>
                  <Label htmlFor="therapeuticApproach" className="text-white mb-2 block">Abordagem Terapêutica</Label>
                  <Select value={formData.therapeuticApproach} onValueChange={(value) => handleSelectChange('therapeuticApproach', value)}>
                    <SelectTrigger className="bg-white/90 border-0 h-10 text-gray-900">
                      <SelectValue placeholder="Selecione sua abordagem" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="terapia_cognitiva_comportamental">Terapia Cognitiva Comportamental</SelectItem>
                      <SelectItem value="psicanalise">Psicanálise</SelectItem>
                      <SelectItem value="hipnoterapia">Hipnoterapia</SelectItem>
                      <SelectItem value="psicologia_clinica">Psicologia Clínica</SelectItem>
                      <SelectItem value="psicologia_infantil">Psicologia Infantil</SelectItem>
                      <SelectItem value="terapia_de_casal">Terapia de Casal</SelectItem>
                      <SelectItem value="trg">TRG</SelectItem>
                      <SelectItem value="terapia_infantil">Terapia Infantil</SelectItem>
                      <SelectItem value="psicologia_analitica">Psicologia Analítica</SelectItem>
                      <SelectItem value="terapia_do_esquema">Terapia do Esquema</SelectItem>
                      <SelectItem value="hipnoterapia">Hipnoterapia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="experience" className="text-white mb-2 block">Fale mais sobre você, ano em que começou atender e sobre suas experiências</Label>
                  <Textarea
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="Descreva sua experiência profissional, ano em que começou atender e conte mais sobre você..."
                    className="bg-white/90 border-0 min-h-[150px] text-gray-900 placeholder:text-gray-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Seção de Finalização - Parte Inferior */}
            <div className="grid md:grid-cols-2 gap-4 mt-1">
              {/* Seção de Upload do Currículo - Lado Esquerdo */}
              <div className="flex flex-col items-center justify-center">
                <h2 className="text-xl font-bold text-white mb-2 text-center">Envie o seu currículo aqui!</h2>
                
                <div className="mb-2">
                  <svg className="w-8 h-8 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l5 5 5-5M12 12v10" />
                  </svg>
                  
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <Input
                        id="curriculum"
                        name="curriculum"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleCurriculumUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="bg-white hover:bg-purple-600 hover:text-white transition-all duration-300 px-6 py-3 rounded-lg text-gray-700 font-medium text-sm cursor-pointer text-center">
                        Escolher ficheiro
                      </div>
                    </div>
                    {formData.curriculum && (
                      <div className="mt-2 text-white text-sm text-center">
                        ✓ Arquivo selecionado: {formData.curriculum.name}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-white/70 text-sm mt-2 text-center">
                    Formatos aceitos: PDF, DOC, DOCX (máx. 5MB)
                  </p>
                </div>
              </div>

              {/* Seção de Termos e Cadastro - Lado Direito */}
              <div className="flex flex-col justify-end">
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, acceptTerms: checked as boolean }))}
                  />
                  <Label htmlFor="acceptTerms" className="text-white text-sm">
                    Li e concordo com os <a href="/terms" target="_blank" className="text-purple-300 underline hover:text-purple-200">Termos e Condições</a> e <a href="/privacy" target="_blank" className="text-purple-300 underline hover:text-purple-200">Política de Privacidade</a>
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium h-12 rounded-lg text-lg"
                >
                  {isSubmitting ? "Cadastrando..." : "Quero me cadastrar"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalRegistration;
