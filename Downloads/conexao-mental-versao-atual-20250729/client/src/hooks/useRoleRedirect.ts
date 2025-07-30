import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useRoleRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Redirecionar baseado no papel do usuário
      switch (user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'professional':
          navigate('/agenda-profissional');
          break;
        case 'patient':
          navigate('/'); // Ou página específica do paciente
          break;
        default:
          navigate('/');
      }
    }
  }, [user, loading, navigate]);

  return { user, loading };
};