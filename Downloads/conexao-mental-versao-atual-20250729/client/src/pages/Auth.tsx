import { useState, useEffect } from "react";
const logo = "/lovable-uploads/1c4653a3-9aa5-49a8-8b1a-7e182d51255e.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { LogIn, User, Shield, UserPlus, KeyRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { signInSchema, signUpSchema, resetPasswordSchema, sanitizeInput } from "@/lib/validationSchemas";
import type { SignInFormData, SignUpFormData, ResetPasswordFormData } from "@/lib/validationSchemas";
import ServerStatus from "@/components/ServerStatus";

const Auth = () => {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, resetPassword, user, loading } = useAuth();

  // Login form
  const loginForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  // Signup form
  const signupForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
      role: "patient"
    }
  });

  // Reset password form
  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: ""
    }
  });


  useEffect(() => {
    if (user && !loading) {
      // Redirect based on user role
      switch (user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'professional':
          navigate('/agenda-profissional');
          break;
        case 'patient':
          navigate('/');
          break;
        default:
          navigate('/');
      }
    }
  }, [user, loading, navigate]);

  const handleLogin = async (data: SignInFormData) => {
    try {
      // Sanitize inputs
      const sanitizedData = {
        email: sanitizeInput(data.email.toLowerCase()),
        password: data.password
      };

      const { error } = await signIn(sanitizedData.email, sanitizedData.password);
      
      if (error) {
        // Better error messages for common cases
        let errorMessage = error.message;
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos. Verifique seus dados e tente novamente.';
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = 'Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.';
        } else if (error.message?.includes('Too many requests')) {
          errorMessage = 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.';
        }
        
        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      // Sanitize inputs
      const sanitizedData = {
        email: sanitizeInput(data.email.toLowerCase()),
        password: data.password,
        full_name: sanitizeInput(data.full_name),
        role: data.role
      };

      const { error } = await signUp(sanitizedData.email, sanitizedData.password, {
        full_name: sanitizedData.full_name,
        role: sanitizedData.role
      });
      
      if (error) {
        // Better error messages for common cases
        let errorMessage = error.message;
        if (error.message?.includes('User already registered')) {
          errorMessage = 'Este email já está cadastrado. Tente fazer login ou recuperar sua senha.';
        } else if (error.message?.includes('Password should be at least')) {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
        } else if (error.message?.includes('Invalid email')) {
          errorMessage = 'Por favor, insira um email válido.';
        } else if (error.message?.includes('Database error')) {
          errorMessage = 'Erro temporário no servidor. Tente novamente em alguns minutos.';
        }
        
        toast({
          title: "Erro no cadastro",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Verifique seu email para confirmar sua conta.",
        });
        signupForm.reset();
      }
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = async (data: ResetPasswordFormData) => {
    try {
      const sanitizedEmail = sanitizeInput(data.email.toLowerCase());
      const { error } = await resetPassword(sanitizedEmail);
      
      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada para redefinir sua senha.",
        });
        resetForm.reset();
        setShowForgotPassword(false);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

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
              <form onSubmit={resetForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="seu@email.com"
                    {...resetForm.register("email")}
                  />
                  {resetForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{resetForm.formState.errors.email.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={resetForm.formState.isSubmitting}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  {resetForm.formState.isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
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
          <div className="text-center mb-4">
            <img src={logo} alt="Clínica Conexão Mental" className="w-20 h-20 mx-auto mb-1" />
            <h1 className="text-3xl font-bold gradient-text">Clínica Conexão Mental</h1>
          </div>
          <p className="text-muted-foreground text-center">Acesse sua conta ou cadastre-se</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-between">
              Autenticação
              <ServerStatus />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Cadastrar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      {...loginForm.register("email")}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      {...loginForm.register("password")}
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>
                    <LogIn className="mr-2 h-4 w-4" />
                    {loginForm.formState.isSubmitting ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={signupForm.handleSubmit(handleSignUp)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome Completo</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Seu nome completo"
                      {...signupForm.register("full_name")}
                    />
                    {signupForm.formState.errors.full_name && (
                      <p className="text-sm text-destructive">{signupForm.formState.errors.full_name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      {...signupForm.register("email")}
                    />
                    {signupForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{signupForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      {...signupForm.register("password")}
                    />
                    {signupForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{signupForm.formState.errors.password.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Senha deve conter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-role">Tipo de usuário</Label>
                    <Select onValueChange={(value) => signupForm.setValue("role", value as "patient" | "professional")} defaultValue="patient">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Paciente
                          </div>
                        </SelectItem>
                        <SelectItem value="professional">
                          <div className="flex items-center gap-2">
                            <img src={logo} alt="Logo Clínica" className="h-4 w-4" />
                            Profissional
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {signupForm.formState.errors.role && (
                      <p className="text-sm text-destructive">{signupForm.formState.errors.role.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={signupForm.formState.isSubmitting}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {signupForm.formState.isSubmitting ? "Cadastrando..." : "Cadastrar"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 space-y-3">
              <Button
                variant="ghost"
                onClick={() => setShowForgotPassword(true)}
                className="w-full"
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Esqueceu a senha?
              </Button>
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

export default Auth;