// Teste simples para verificar se a API está funcionando
const testAdminAPI = async () => {
  try {
    console.log('Testando API de admin...');
    
    const response = await fetch('/api/admin/professional-agendas', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Dados recebidos:', data);
    
  } catch (error) {
    console.error('Erro na API:', error);
  }
};

// Executar teste
testAdminAPI();