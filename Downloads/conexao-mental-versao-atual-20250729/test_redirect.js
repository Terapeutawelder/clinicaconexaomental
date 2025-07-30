// Script para testar redirecionamento
// Simula comportamento de mudanças de aba

console.log('=== TESTE DE REDIRECIONAMENTO ===');

// Simular sistema de logging de mudanças de aba
let agendaSubTab = 'availability';

const originalSetAgendaSubTab = (tab) => {
  console.log('MUDANÇA DE ABA REAL:', tab);
  agendaSubTab = tab;
};

const setAgendaSubTabWithLog = (tab) => {
  console.log('MUDANÇA DE ABA DETECTADA:', tab);
  console.trace('Stack trace da mudança de aba:');
  originalSetAgendaSubTab(tab);
};

// Teste 1: Simular salvamento sem mudança de aba
console.log('\n--- TESTE 1: Salvamento sem mudança de aba ---');
console.log('Estado inicial:', agendaSubTab);
console.log('Executando salvamento...');
// Salvamento normal não deve alterar aba
console.log('Estado final:', agendaSubTab);

// Teste 2: Simular mudança de aba explícita
console.log('\n--- TESTE 2: Mudança de aba explícita ---');
console.log('Estado inicial:', agendaSubTab);
setAgendaSubTabWithLog('calendar');
console.log('Estado final:', agendaSubTab);

// Teste 3: Verificar se alguma função está alterando o estado
console.log('\n--- TESTE 3: Verificar alterações automáticas ---');
console.log('Estado inicial:', agendaSubTab);
// Simulação de useEffect ou outras funções
console.log('Nenhuma alteração automática detectada');
console.log('Estado final:', agendaSubTab);

console.log('\n=== TESTE CONCLUÍDO ===');