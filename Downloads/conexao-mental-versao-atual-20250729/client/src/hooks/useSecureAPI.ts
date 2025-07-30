import { useToast } from '@/hooks/use-toast';

/**
 * Secure API operations hook with error handling and improved type safety
 */
export const useSecureAPI = () => {
  const { toast } = useToast();

  const getAuthToken = () => localStorage.getItem('auth_token');

  /**
   * Safely execute an API request with error handling
   */
  const safeRequest = async <T>(
    url: string,
    options: RequestInit = {},
    operation: string = 'operação'
  ): Promise<T | null> => {
    try {
      const token = getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro de comunicação' }));
        console.error(`API error in ${operation}:`, errorData);
        toast({
          title: "Erro de Conexão",
          description: `Falha ao executar ${operation}. Tente novamente.`,
          variant: "destructive",
        });
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`Unexpected error in ${operation}:`, error);
      toast({
        title: "Erro Inesperado",
        description: `Ocorreu um erro inesperado durante ${operation}.`,
        variant: "destructive",
      });
      return null;
    }
  };

  /**
   * Safely execute a GET request
   */
  const safeGet = async <T>(
    url: string,
    operation: string = 'buscar dados'
  ): Promise<T | null> => {
    return safeRequest<T>(url, { method: 'GET' }, operation);
  };

  /**
   * Safely execute a POST request
   */
  const safePost = async <T>(
    url: string,
    data: any,
    operation: string = 'enviar dados'
  ): Promise<T | null> => {
    return safeRequest<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    }, operation);
  };

  /**
   * Safely execute a PUT request
   */
  const safePut = async <T>(
    url: string,
    data: any,
    operation: string = 'atualizar dados'
  ): Promise<T | null> => {
    return safeRequest<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, operation);
  };

  /**
   * Safely execute a DELETE request
   */
  const safeDelete = async <T>(
    url: string,
    operation: string = 'deletar dados'
  ): Promise<T | null> => {
    return safeRequest<T>(url, { method: 'DELETE' }, operation);
  };

  return {
    safeRequest,
    safeGet,
    safePost,
    safePut,
    safeDelete,
  };
};