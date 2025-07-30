// Script de teste para verificar o comportamento dos botões
// Simula o comportamento dos botões no dashboard profissional

console.log('=== TESTE DE COMPORTAMENTO DOS BOTÕES ===');

// Simular estado inicial
let agendaSubTab = 'availability';
let customTimeSlots = {};
let selectedDateForSettings = new Date();

// Simular função formatDateKey
function formatDateKey(date) {
  return date.toISOString().split('T')[0];
}

// Simular função getSelectedDateTimeSlots
function getSelectedDateTimeSlots() {
  const dateKey = formatDateKey(selectedDateForSettings);
  return customTimeSlots[dateKey] || [];
}

// Simular função addCustomTimeSlot
function addCustomTimeSlot(timeSlot) {
  console.log('addCustomTimeSlot chamado com:', timeSlot);
  const dateKey = formatDateKey(selectedDateForSettings);
  console.log('dateKey:', dateKey);
  const currentSlots = customTimeSlots[dateKey] || [];
  console.log('currentSlots:', currentSlots);
  
  if (!currentSlots.includes(timeSlot)) {
    console.log('Adicionando horário:', timeSlot);
    customTimeSlots[dateKey] = [...currentSlots, timeSlot].sort();
    console.log('Novo estado customTimeSlots:', customTimeSlots);
  } else {
    console.log('Horário já existe:', timeSlot);
  }
}

// Simular função getNextAvailableHour
function getNextAvailableHour() {
  const currentSlots = getSelectedDateTimeSlots();
  if (currentSlots.length === 0) return '09:00';
  
  const lastSlot = currentSlots[currentSlots.length - 1];
  const [hours, minutes] = lastSlot.split(':').map(Number);
  const nextHour = hours + 1;
  
  if (nextHour > 17) return '09:00';
  
  return `${nextHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Simular clique no botão "Adicionar Horário"
console.log('\n--- TESTE: Clique no botão "Adicionar Horário" ---');
console.log('Botão Adicionar Horário clicado');
const nextHour = getSelectedDateTimeSlots().length > 0 ? getNextAvailableHour() : '09:00';
console.log('Próximo horário:', nextHour);
addCustomTimeSlot(nextHour);
console.log('Horário adicionado e editando:', nextHour);

// Simular clique no botão "Salvar"
console.log('\n--- TESTE: Clique no botão "Salvar" ---');
console.log('Botão Salvar clicado');
const currentTimeSlots = customTimeSlots;
console.log('Salvando no localStorage:', JSON.stringify(currentTimeSlots));
console.log('Salvo com sucesso - permanecendo na mesma tela');

// Verificar estado final
console.log('\n--- ESTADO FINAL ---');
console.log('agendaSubTab:', agendaSubTab);
console.log('customTimeSlots:', customTimeSlots);
console.log('Horários para hoje:', getSelectedDateTimeSlots());

console.log('\n=== TESTE CONCLUÍDO ===');