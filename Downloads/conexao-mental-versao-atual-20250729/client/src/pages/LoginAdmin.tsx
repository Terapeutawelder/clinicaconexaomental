import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, ArrowLeft, Eye, EyeOff, Settings, Shield, Database } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import headerLoginImage from "@assets/Header de login (3)_1752464376695.png";

const logo = "/lovable-uploads/1c4653a3-9aa5-49a8-8b1a-7e182d51255e.png";

const LoginAdmin = () => {
  const navigate = useNavigate();
  const { signIn, user, loading } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [resetEmail, setResetEmail] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // Verificar se o usuário já está logado e redirecionar
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'professional') {
        navigate('/agenda-profissional');
      } else {
        navigate('/');
      }
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const result = await signIn(formData.email, formData.password);
      
      if (result.error) {
        setErrors({ general: result.error.message });
        toast({
          title: "Erro no login",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao painel administrativo!",
        });
        // O redirecionamento será feito automaticamente pelo useEffect acima
      }
    } catch (error) {
      setErrors({ general: 'Erro inesperado durante o login' });
      toast({
        title: "Erro",
        description: "Erro inesperado durante o login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Implementar reset de senha
      toast({
        title: "Email enviado",
        description: "Verifique seu email para redefinir a senha",
      });
      setActiveTab('login');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar email de recuperação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Área da imagem à esquerda - expandida */}
      <div className="flex-[2] flex flex-col p-1" style={{ backgroundColor: '#ffffff' }}>
        {/* Botão Voltar */}
        <div className="flex justify-start p-2">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
        </div>
        
        {/* Área da imagem */}
        <div className="flex-1 flex items-center justify-center">
          <img 
            src={headerLoginImage} 
            alt="Clínica Conexão Mental" 
            className="w-full h-[98%] max-w-full object-contain"
          />
        </div>
      </div>
      
      {/* Área do formulário à direita - reduzida */}
      <div className="flex-1 flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-sm">
          <Card className="bg-white/98 backdrop-blur-sm shadow-lg border-0 max-h-[75vh] overflow-y-auto">
          <CardHeader className="text-center py-4">
            <div className="flex justify-center mb-3">
              <img src={logo} alt="Clínica Conexão Mental" className="w-14 h-14" />
            </div>
            <CardTitle className="text-xl font-bold gradient-text">
              Painel Administrativo
            </CardTitle>
            <CardDescription className="text-sm">
              Acesso restrito para administradores do sistema
            </CardDescription>
          </CardHeader>
        <CardContent className="py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="forgot">Esqueci a senha</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@conexaomental.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha de administrador"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {errors.general && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.general}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Ou
                    </span>
                  </div>
                </div>
                
                <GoogleAuthButton text="Entrar com Google" />
                
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setActiveTab('forgot')}
                    className="text-sm"
                  >
                    Esqueci minha senha
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="forgot" className="space-y-4">
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">E-mail</Label>
                  <Input
                    id="resetEmail"
                    name="resetEmail"
                    type="email"
                    placeholder="admin@conexaomental.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar link de recuperação"}
                </Button>
              </form>
              
              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => setActiveTab('login')}
                  className="text-sm"
                >
                  Voltar para o login
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Settings className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Controle total</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Shield className="h-3 w-3" />
                <span>Acesso seguro</span>
              </div>
              <div className="flex items-center space-x-2">
                <Database className="h-3 w-3" />
                <span>Gestão completa</span>
              </div>
            </div>
          </div>
        </CardContent>
        
        <div className="px-6 pb-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao início
          </Button>
        </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;