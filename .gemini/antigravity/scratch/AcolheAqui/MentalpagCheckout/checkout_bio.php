<?php
// checkout_bio.php - Novo Checkout com Bio e Agenda
require 'config.php';

// 1. Obter Hash do Produto
$checkout_hash = $_GET['p'] ?? null;
if (!$checkout_hash) {
    die("Serviço não encontrado.");
}

// 2. Buscar Produto e Dados do Produtor (Usuario)
$stmt = $pdo->prepare("
    SELECT p.*, u.nome as produtor_nome, u.id as usuario_id, 
           u.registro_profissional, u.abordagens, u.biografia, u.foto_perfil,
           u.instagram_url, u.facebook_url, u.youtube_url
    FROM produtos p
    JOIN usuarios u ON p.usuario_id = u.id
    WHERE p.checkout_hash = ?
");
$stmt->execute([$checkout_hash]);
$produto = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$produto) {
    die("Serviço inválido ou indisponível.");
}

$preco_formatado = number_format($produto['preco'], 2, ',', '.');
?>
<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agendar com <?php echo htmlspecialchars($produto['produtor_nome']); ?> - Mentalpag</title>

    <!-- Tailwind CSS & Fonts -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        emerald: { 50: '#ecfdf5', 100: '#d1fae5', 500: '#10b981', 600: '#059669', 700: '#047857' },
                        slate: { 850: '#172033' }
                    },
                    fontFamily: {
                        sans: ['Plus Jakarta Sans', 'sans-serif'],
                    }
                }
            }
        }
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>

    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            min-height: 100vh;
        }

        .glass-panel {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
        }

        .selected-date {
            background-color: #10b981;
            color: white;
            border-color: #10b981;
            box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
        }

        .selected-time {
            background-color: #10b981;
            color: white;
            border-color: #10b981;
            ring: 2px solid #059669;
        }

        /* Scrollbar fina */
        ::-webkit-scrollbar {
            width: 5px;
        }

        ::-webkit-scrollbar-track {
            background: transparent;
        }

        ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
    </style>
</head>

<body class="flex items-center justify-center p-4 lg:p-8">

    <div
        class="max-w-6xl w-full glass-panel rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[650px]">

        <!-- SIDEBAR ESQUERDA: Bio & Agenda (7 cols now) -->
        <div class="lg:col-span-7 bg-white/50 border-r border-emerald-100/50 p-6 lg:p-8 flex flex-col relative">

            <!-- Branding Mentalpag (Discreto) -->
            <div class="absolute top-6 left-6 opacity-30">
                <img src="assets/logo.png" alt="Mentalpag" class="h-6 grayscale">
            </div>

            <!-- 1. Perfil do Infoprodutor (Centralizado Otimizado) -->
            <div class="text-center mt-6 mb-6">
                <div class="relative w-20 h-20 mx-auto mb-3">
                    <img src="<?php echo $produto['foto_perfil'] ?: 'https://ui-avatars.com/api/?name=' . urlencode($produto['produtor_nome']) . '&background=10b981&color=fff'; ?>"
                        class="w-full h-full rounded-full object-cover border-4 border-white shadow-md">
                    <div class="absolute bottom-0 right-0 bg-emerald-500 text-white rounded-full p-1 border-2 border-white shadow-sm"
                        title="Verificado">
                        <i data-lucide="check" class="w-2.5 h-2.5"></i>
                    </div>
                </div>

                <h1 class="text-lg font-bold text-slate-900 leading-tight">
                    <?php echo htmlspecialchars($produto['produtor_nome']); ?>
                </h1>

                <?php if ($produto['registro_profissional']): ?>
                    <p class="text-xs font-bold text-emerald-600 uppercase tracking-wide mt-1">
                        <?php echo htmlspecialchars($produto['registro_profissional']); ?>
                    </p>
                <?php endif; ?>

                <!-- Redes Sociais -->
                <div class="flex justify-center gap-3 mt-3 mb-4">
                    <?php if (!empty($produto['instagram_url'])): ?>
                        <a href="<?php echo htmlspecialchars($produto['instagram_url']); ?>" target="_blank"
                            class="text-slate-400 hover:text-pink-600 transition-colors"><i data-lucide="instagram"
                                class="w-4 h-4"></i></a>
                    <?php endif; ?>
                    <?php if (!empty($produto['facebook_url'])): ?>
                        <a href="<?php echo htmlspecialchars($produto['facebook_url']); ?>" target="_blank"
                            class="text-slate-400 hover:text-blue-600 transition-colors"><i data-lucide="facebook"
                                class="w-4 h-4"></i></a>
                    <?php endif; ?>
                    <?php if (!empty($produto['youtube_url'])): ?>
                        <a href="<?php echo htmlspecialchars($produto['youtube_url']); ?>" target="_blank"
                            class="text-slate-400 hover:text-red-600 transition-colors"><i data-lucide="youtube"
                                class="w-4 h-4"></i></a>
                    <?php endif; ?>
                </div>

                <?php if ($produto['abordagens']): ?>
                    <div class="flex flex-wrap justify-center gap-2 mb-3">
                        <?php foreach (explode(',', $produto['abordagens']) as $tag): ?>
                            <span
                                class="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded border border-emerald-100"><?php echo trim($tag); ?></span>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>

                <?php if ($produto['biografia']): ?>
                    <p class="text-sm text-slate-500 mt-2 leading-relaxed px-4">
                        "<?php echo nl2br(htmlspecialchars($produto['biografia'])); ?>"
                    </p>
                <?php endif; ?>
            </div>

            <!-- 2. Calendário (Widget JS) -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex-1 flex flex-col">
                <h3 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <i data-lucide="calendar" class="w-4 h-4 text-emerald-500"></i> Selecione data e hora
                </h3>

                <!-- Date Picker Simples (Semana) -->
                <div class="flex justify-between items-center mb-4">
                    <button id="prevWeek" class="p-1 hover:bg-slate-100 rounded"><i data-lucide="chevron-left"
                            class="w-4 h-4"></i></button>
                    <span id="currentMonthYear" class="text-xs font-semibold uppercase text-slate-500">Janeiro
                        2026</span>
                    <button id="nextWeek" class="p-1 hover:bg-slate-100 rounded"><i data-lucide="chevron-right"
                            class="w-4 h-4"></i></button>
                </div>

                <div id="calendarDays"
                    class="grid grid-cols-7 gap-1 text-center mb-4 text-xs font-medium text-slate-600">
                    <!-- Preenchido via JS -->
                </div>

                <div class="border-t border-slate-100 my-2"></div>

                <!-- Lista de Horários -->
                <div id="timeSlots" class="grid grid-cols-3 gap-2 overflow-y-auto max-h-40 p-1">
                    <p class="col-span-3 text-center text-xs text-slate-400 py-4">Selecione uma data para ver horários.
                    </p>
                </div>
            </div>
        </div>

        <!-- CONTEÚDO DIREITA: Checkout (5 cols now) -->
        <div class="lg:col-span-5 bg-white p-8 lg:p-12 flex flex-col">

            <div class="mb-8 border-b border-slate-100 pb-6">
                <span
                    class="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">Resumo
                    do Pedido</span>
                <div class="flex justify-between items-start mt-4">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-900"><?php echo htmlspecialchars($produto['nome']); ?>
                        </h2>
                        <p class="text-slate-500 text-sm mt-1"><?php echo htmlspecialchars($produto['descricao']); ?>
                        </p>

                        <!-- Mostra o agendamento selecionado -->
                        <div id="selectedAppointmentDisplay"
                            class="hidden mt-3 flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 p-2 rounded-lg inline-block">
                            <i data-lucide="clock" class="w-4 h-4"></i>
                            <span id="apptText">14/01 às 15:00</span>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-3xl font-extrabold text-slate-900">R$ <?php echo $preco_formatado; ?></p>
                    </div>
                </div>
            </div>

            <!-- Formulário de Pagamento -->
            <form action="process_payment.php" method="POST" id="paymentForm" class="space-y-6 flex-1">
                <input type="hidden" name="produto_id" value="<?php echo $produto['id']; ?>">
                <input type="hidden" name="agendamento_data" id="inputDate">
                <input type="hidden" name="agendamento_hora" id="inputTime">

                <!-- Dados do Cliente -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Seu Nome</label>
                        <input type="text" name="nome" required
                            class="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
                            placeholder="Nome completo">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Seu Email</label>
                        <input type="email" name="email" required
                            class="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                            placeholder="email@exemplo.com">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-1">CPF</label>
                        <input type="text" name="cpf" required
                            class="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                            placeholder="000.000.000-00">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Celular</label>
                        <input type="text" name="telefone" required
                            class="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                            placeholder="(00) 00000-0000">
                    </div>
                </div>

                <!-- Forma de Pagamento (Tabs) -->
                <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase mb-3">Forma de Pagamento</label>
                    <div class="grid grid-cols-3 gap-3 mb-4">
                        <label class="cursor-pointer">
                            <input type="radio" name="metodo_pagamento" value="pix" class="peer sr-only" checked
                                onchange="togglePaymentFields('pix')">
                            <div
                                class="flex flex-col items-center justify-center p-3 border-2 border-slate-100 rounded-xl peer-checked:border-emerald-500 peer-checked:bg-emerald-50 transition-all h-full">
                                <i data-lucide="qr-code"
                                    class="w-6 h-6 mb-1 text-slate-600 peer-checked:text-emerald-600"></i>
                                <span class="text-xs font-bold text-slate-600 peer-checked:text-emerald-700">Pix</span>
                            </div>
                        </label>
                        <label class="cursor-pointer">
                            <input type="radio" name="metodo_pagamento" value="credit_card" class="peer sr-only"
                                onchange="togglePaymentFields('credit_card')">
                            <div
                                class="flex flex-col items-center justify-center p-3 border-2 border-slate-100 rounded-xl peer-checked:border-emerald-500 peer-checked:bg-emerald-50 transition-all h-full">
                                <i data-lucide="credit-card"
                                    class="w-6 h-6 mb-1 text-slate-600 peer-checked:text-emerald-600"></i>
                                <span
                                    class="text-xs font-bold text-slate-600 peer-checked:text-emerald-700">Cartão</span>
                            </div>
                        </label>
                        <label class="cursor-pointer">
                            <input type="radio" name="metodo_pagamento" value="boleto" class="peer sr-only"
                                onchange="togglePaymentFields('boleto')">
                            <div
                                class="flex flex-col items-center justify-center p-3 border-2 border-slate-100 rounded-xl peer-checked:border-emerald-500 peer-checked:bg-emerald-50 transition-all h-full">
                                <i data-lucide="barcode"
                                    class="w-6 h-6 mb-1 text-slate-600 peer-checked:text-emerald-600"></i>
                                <span
                                    class="text-xs font-bold text-slate-600 peer-checked:text-emerald-700">Boleto</span>
                            </div>
                        </label>
                    </div>

                    <!-- Campos Cartão (Escondidos por padrão) -->
                    <div id="creditCardFields"
                        class="hidden bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-200">
                        <input type="text" name="card_number"
                            class="w-full bg-white border-slate-200 rounded-lg px-4 py-2 text-sm"
                            placeholder="Número do Cartão">
                        <div class="grid grid-cols-2 gap-3">
                            <input type="text" name="card_expiry"
                                class="w-full bg-white border-slate-200 rounded-lg px-4 py-2 text-sm"
                                placeholder="MM/AA">
                            <input type="text" name="card_cvc"
                                class="w-full bg-white border-slate-200 rounded-lg px-4 py-2 text-sm" placeholder="CVC">
                        </div>
                        <input type="text" name="card_holder"
                            class="w-full bg-white border-slate-200 rounded-lg px-4 py-2 text-sm"
                            placeholder="Nome no Cartão">
                    </div>
                </div>

                <!-- Botão Pagar -->
                <button type="submit"
                    class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-lg">
                    <i data-lucide="lock" class="w-5 h-5"></i>
                    <span>Pagar e Agendar</span>
                </button>

                <p class="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                    <i data-lucide="shield-check" class="w-3 h-3"></i> Pagamento 100% Seguro por Mentalpag
                </p>
            </form>
        </div>
    </div>

    <!-- Lógica JS para Calendário e Interatividade -->
    <script>
        lucide.createIcons();

        // Variáveis de Estado
        let currentDate = new Date();
        let selectedDate = null;
        let selectedTime = null;
        const userId = <?php echo $produto['usuario_id']; ?>;

        // Renderizar Calendário
        function renderCalendar() {
            const daysContainer = document.getElementById('calendarDays');
            const monthLabel = document.getElementById('currentMonthYear');

            // Define cabeçalho do mês
            const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            monthLabel.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

            daysContainer.innerHTML = '';

            // Cabeçalho dias da semana
            const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
            weekDays.forEach(d => {
                daysContainer.innerHTML += `<div class="text-slate-400 font-bold py-1">${d}</div>`;
            });

            // Lógica simples de renderizar os dias do mês
            const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            // Espaços vazios
            for (let i = 0; i < firstDay.getDay(); i++) {
                daysContainer.innerHTML += `<div></div>`;
            }

            // Dias (hoje para frente)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (let d = 1; d <= lastDay.getDate(); d++) {
                const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
                const isPast = dateObj < today;
                const dateString = dateObj.toISOString().split('T')[0];
                const isSelected = selectedDate === dateString;

                let classes = "py-1.5 rounded-lg cursor-pointer transition-colors hover:bg-emerald-50 text-slate-700";
                if (isPast) classes = "py-1.5 text-slate-300 cursor-not-allowed";
                if (isSelected) classes = "py-1.5 rounded-lg bg-emerald-500 text-white shadow-md font-bold";

                const onClick = isPast ? '' : `onclick="selectDate('${dateString}')"`;

                daysContainer.innerHTML += `<div class="${classes}" ${onClick}>${d}</div>`;
            }
        }

        async function selectDate(dateStr) {
            selectedDate = dateStr;
            renderCalendar(); // Re-render para atualizar classe 'selected'

            const timeSlotsContainer = document.getElementById('timeSlots');
            timeSlotsContainer.innerHTML = '<p class="col-span-3 text-center text-xs text-slate-400 py-4"><i class="animate-spin" data-lucide="loader-2"></i> Buscando horários...</p>';
            lucide.createIcons();

            // Buscar horários na API
            try {
                const response = await fetch(`api_agenda.php?action=get_slots&user_id=${userId}&date=${dateStr}`);
                const data = await response.json();

                timeSlotsContainer.innerHTML = '';

                if (data.slots && data.slots.length > 0) {
                    data.slots.forEach(time => {
                        const isSelected = selectedTime === time;
                        const classes = isSelected
                            ? "bg-emerald-600 text-white border-emerald-600 font-bold"
                            : "bg-white border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-600";

                        timeSlotsContainer.innerHTML += `
                            <button type="button" onclick="selectTime('${time}')" 
                                class="border rounded-lg py-2 text-xs transition-all ${classes}">
                                ${time}
                            </button>
                        `;
                    });
                } else {
                    timeSlotsContainer.innerHTML = '<p class="col-span-3 text-center text-xs text-slate-400 py-2">Sem horários livres.</p>';
                }

            } catch (e) {
                timeSlotsContainer.innerHTML = '<p class="col-span-3 text-center text-xs text-red-400 py-2">Erro ao buscar.</p>';
            }
        }

        function selectTime(time) {
            selectedTime = time;
            document.getElementById('inputDate').value = selectedDate;
            document.getElementById('inputTime').value = selectedTime;

            // Atualiza visual
            selectDate(selectedDate); // Re-renderiza slots para marcar o ativo

            // Mostra resumo
            const dateObj = new Date(selectedDate + 'T00:00:00');
            const dateFmt = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            document.getElementById('apptText').innerText = `${dateFmt} às ${time}`;
            document.getElementById('selectedAppointmentDisplay').classList.remove('hidden');
        }

        function togglePaymentFields(method) {
            const cardFields = document.getElementById('creditCardFields');
            if (method === 'credit_card') {
                cardFields.classList.remove('hidden');
            } else {
                cardFields.classList.add('hidden');
            }
        }

        // Navegação Mês (Mockup simples)
        document.getElementById('prevWeek').onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
        document.getElementById('nextWeek').onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };

        // Init
        renderCalendar();
    </script>
</body>

</html>
