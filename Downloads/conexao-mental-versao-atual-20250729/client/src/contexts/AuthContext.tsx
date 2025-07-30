import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'patient' | 'professional' | 'admin';
  created_at: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: { full_name?: string; role?: string }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const API_BASE_URL = '/api';
  
  const checkServerHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Server health check failed:', error);
      return false;
    }
  };

  const getAuthToken = () => localStorage.getItem('auth_token');
  
  const setAuthToken = (token: string) => localStorage.setItem('auth_token', token);
  
  const removeAuthToken = () => localStorage.removeItem('auth_token');

  const fetchUserProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) return null;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          removeAuthToken();
        }
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // If there's a network error, remove token to avoid stuck state
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        removeAuthToken();
      }
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getAuthToken();
        if (token) {
          const userProfile = await fetchUserProfile();
          setUser(userProfile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        removeAuthToken();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signUp = async (email: string, password: string, userData?: { full_name?: string; role?: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          full_name: userData?.full_name || '',
          role: userData?.role || 'patient'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: { message: data.error || 'Erro durante o cadastro' } };
      }

      // Salvar token e atualizar estado do usuário
      setAuthToken(data.token);
      setUser(data.user);

      return { error: null };
    } catch (error) {
      console.error('SignUp error:', error);
      return { error: { message: 'Erro durante o cadastro' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: { message: data.error || 'Credenciais inválidas' } };
      }

      // Salvar token e atualizar estado do usuário
      setAuthToken(data.token);
      setUser(data.user);

      return { error: null };
    } catch (error) {
      console.error('SignIn error:', error);
      return { error: { message: 'Erro durante o login' } };
    }
  };

  const signOut = async () => {
    try {
      removeAuthToken();
      setUser(null);
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: "Ocorreu um erro ao fazer logout.",
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: { message: data.error || 'Erro ao enviar email de recuperação' } };
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected reset password error:', error);
      return { error: { message: 'Erro inesperado durante a recuperação de senha' } };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};