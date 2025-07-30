
import { useState } from "react";
const logo = "/lovable-uploads/1c4653a3-9aa5-49a8-8b1a-7e182d51255e.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { LogIn, User, Shield, UserPlus, KeyRound } from "lucide-react";

const Login = () => {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [professionalEmail, setProfessionalEmail] = useState("");
  const [professionalPassword, setProfessionalPassword] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Admin login:", { email: adminEmail, password: adminPassword });
    
    // Simular autenticação do administrador
    if (adminEmail && adminPassword) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo, administrador.",
      });
      // Redirecionar para o painel administrativo
      navigate("/admin");
    } else {
      toast({
        title: "Erro no login",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
    }
  };

  const handleProfessionalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Professional login:", { email: professionalEmail, password: professionalPassword });
    
    // Simular autenticação do profissional
    if (professionalEmail && professionalPassword) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo, profissional.",
      });
      // Redirecionar para a agenda do profissional
      navigate("/agenda-profissional");
    } else {
      toast({
        title: "Erro no login",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Forgot password for:", forgotPasswordEmail);
    
    if (forgotPasswordEmail) {
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      setForgotPasswordEmail("");
      setShowForgotPassword(false);
    } else {
      toast({
        title: "Erro",
        description: "Por favor, insira seu email.",
        variant: "destructive",
      });
    }
  };

  const handleSignUp = () => {
    navigate("/cadastro-profissional");
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
          <div className="text-center mb-4 flex flex-col items-center">
            <img src={logo} alt="Clínica Conexão Mental" className="w-20 h-20" />
            <h1 className="text-3xl font-bold gradient-text">Clínica Conexão Mental</h1>
          </div>
          <p className="text-muted-foreground text-center">Recuperar senha</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <KeyRound className="h-5 w-5" />
                Esqueceu a senha?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Enviar link de recuperação
                </Button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-sm"
                >
                  Voltar ao login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-center mb-4 flex flex-col items-center">
            <img src={logo} alt="Clínica Conexão Mental" className="w-20 h-20" />
            <h1 className="text-3xl font-bold gradient-text">Clínica Conexão Mental</h1>
          </div>
          <p className="text-muted-foreground text-center">Entre em sua conta</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="professional" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="professional" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profissional
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Administrador
                </TabsTrigger>
              </TabsList>

              <TabsContent value="professional">
                <form onSubmit={handleProfessionalLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="professional-email">Email</Label>
                    <Input
                      id="professional-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={professionalEmail}
                      onChange={(e) => setProfessionalEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="professional-password">Senha</Label>
                    <Input
                      id="professional-password"
                      type="password"
                      placeholder="••••••••"
                      value={professionalPassword}
                      onChange={(e) => setProfessionalPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar como Profissional
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@email.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Senha</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Shield className="mr-2 h-4 w-4" />
                    Acessar Painel Admin
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate("/cadastro-profissional")}
                  className="flex-1"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Cadastre-se
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowForgotPassword(true)}
                  className="flex-1"
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  Esqueceu a senha?
                </Button>
              </div>
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="w-full text-sm"
              >
                Voltar ao início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;

