<?php
require_once 'config.php';

// Verificação de segurança padrão
if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    header("location: login.php");
    exit;
}
?>

<!-- Container principal com suporte ao Dark Mode -->
<div class="container mx-auto px-4 py-6">

    <!-- Header -->
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-800 dark:text-white mb-2">Programa de Parceiros Mentalpag</h1>
        <p class="text-slate-500 dark:text-slate-400">Indique colegas e construa sua renda recorrente. Ganhe 25% para
            sempre.</p>
    </div>

    <!-- Seção de Link de Indicação (Hero) -->
    <div
        class="bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-800 dark:to-teal-900 rounded-3xl p-8 mb-10 text-white shadow-xl relative overflow-hidden">
        <div class="absolute top-0 right-0 p-12 opacity-10">
            <i data-lucide="share-2" class="w-64 h-64 text-white"></i>
        </div>

        <div class="relative z-10 max-w-2xl">
            <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
                <i data-lucide="gift" class="w-6 h-6"></i> Seu Link Exclusivo
            </h2>
            <p class="mb-6 text-emerald-50">Compartilhe este link com outros profissionais. Quando eles assinarem, você
                ganha 25% de comissão todo mês.</p>

            <div class="bg-white/10 backdrop-blur-md rounded-xl p-2 flex items-center border border-white/20">
                <input type="text" id="affiliate-link" readonly
                    class="bg-transparent border-none text-white w-full px-4 focus:ring-0 font-mono text-lg truncate"
                    value="Carregando link...">
                <button onclick="copyLink()"
                    class="bg-white text-emerald-700 hover:bg-emerald-50 font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
                    <i data-lucide="copy" class="w-4 h-4"></i> Copiar
                </button>
            </div>
            <p id="copy-feedback" class="text-sm mt-2 text-emerald-200 h-5"></p>
        </div>
    </div>

    <!-- KPIs de Ganhos -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <!-- Ganhos Totais -->
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div class="flex items-center gap-4 mb-4">
                <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                    <i data-lucide="dollar-sign" class="w-8 h-8"></i>
                </div>
                <div>
                    <p class="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase">Ganhos Totais</p>
                    <h3 class="text-3xl font-bold text-slate-800 dark:text-white" id="total-earnings">R$ 0,00</h3>
                </div>
            </div>
            <p class="text-xs text-slate-400">Acumulado desde o início.</p>
        </div>

        <!-- A Receber -->
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div class="flex items-center gap-4 mb-4">
                <div class="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
                    <i data-lucide="clock" class="w-8 h-8"></i>
                </div>
                <div>
                    <p class="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase">Pendente</p>
                    <h3 class="text-3xl font-bold text-slate-800 dark:text-white" id="pending-earnings">R$ 0,00</h3>
                </div>
            </div>
            <p class="text-xs text-slate-400">Disponível para saque em breve.</p>
        </div>

        <!-- Indicações Ativas -->
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div class="flex items-center gap-4 mb-4">
                <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                    <i data-lucide="users" class="w-8 h-8"></i>
                </div>
                <div>
                    <p class="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase">Indicações Ativas</p>
                    <h3 class="text-3xl font-bold text-slate-800 dark:text-white" id="active-referrals">0</h3>
                </div>
            </div>
            <p class="text-xs text-slate-400">Usuários cadastrados com seu link.</p>
        </div>
    </div>

    <!-- Progresso Gamificado -->
    <div
        class="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 mb-10">
        <div class="flex justify-between items-end mb-6">
            <div>
                <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-1">Seu Nível de Parceiro</h3>
                <p class="text-slate-500 dark:text-slate-400 text-sm">Desbloqueie benefícios exclusivos conforme você
                    cresce.</p>
            </div>
            <span
                class="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-bold text-sm"
                id="current-badge">
                Iniciante
            </span>
        </div>

        <!-- Barra de Progresso -->
        <div class="relative pt-6 pb-2">
            <div class="flex mb-2 items-center justify-between">
                <div>
                    <span
                        class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200 dark:text-purple-300 dark:bg-purple-900">
                        Progresso para o Próximo Nível
                    </span>
                </div>
                <div class="text-right">
                    <span class="text-xs font-semibold inline-block text-purple-600 dark:text-purple-300"
                        id="progress-percentage">
                        0%
                    </span>
                </div>
            </div>
            <div class="overflow-hidden h-4 mb-4 text-xs flex rounded bg-purple-100 dark:bg-slate-700">
                <div id="progress-bar" style="width:0%"
                    class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500 transition-all duration-1000">
                </div>
            </div>
            <p class="text-center text-xs text-slate-400 dark:text-slate-500" id="next-level-message">Faltam 5
                indicações para Prata!</p>
        </div>

        <!-- Grid de Níveis (Visual) -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div
                class="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 opacity-100 ring-2 ring-purple-500">
                <div
                    class="w-10 h-10 mx-auto bg-slate-200 dark:bg-slate-600 rounded-full mb-2 flex items-center justify-center text-slate-500 dark:text-slate-300">
                    <i data-lucide="star" class="w-5 h-5"></i></div>
                <p class="font-bold text-sm dark:text-white">Bronze</p>
                <p class="text-[10px] text-slate-500">Início</p>
            </div>
            <div
                class="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 opacity-50 grayscale">
                <div
                    class="w-10 h-10 mx-auto bg-slate-200 dark:bg-slate-600 rounded-full mb-2 flex items-center justify-center text-slate-500 dark:text-slate-300">
                    <i data-lucide="medal" class="w-5 h-5"></i></div>
                <p class="font-bold text-sm dark:text-white">Prata</p>
                <p class="text-[10px] text-slate-500">5 Indicações</p>
            </div>
            <div
                class="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 opacity-50 grayscale">
                <div
                    class="w-10 h-10 mx-auto bg-slate-200 dark:bg-slate-600 rounded-full mb-2 flex items-center justify-center text-slate-500 dark:text-slate-300">
                    <i data-lucide="crown" class="w-5 h-5"></i></div>
                <p class="font-bold text-sm dark:text-white">Ouro</p>
                <p class="text-[10px] text-slate-500">20 Indicações</p>
            </div>
            <div
                class="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 opacity-50 grayscale">
                <div
                    class="w-10 h-10 mx-auto bg-slate-200 dark:bg-slate-600 rounded-full mb-2 flex items-center justify-center text-slate-500 dark:text-slate-300">
                    <i data-lucide="trophy" class="w-5 h-5"></i></div>
                <p class="font-bold text-sm dark:text-white">Diamante</p>
                <p class="text-[10px] text-slate-500">50+ Indicações</p>
            </div>
        </div>
    </div>

    <!-- Tabela de Últimas Comissões -->
    <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-4">Últimas Comissões</h3>
    <div
        class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                <thead class="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase text-slate-700 dark:text-slate-300">
                    <tr>
                        <th class="px-6 py-4 font-semibold">Indicado</th>
                        <th class="px-6 py-4 font-semibold">Data</th>
                        <th class="px-6 py-4 font-semibold">Status</th>
                        <th class="px-6 py-4 font-semibold text-right">Valor</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-700" id="history-table-body">
                    <!-- Preenchido via JS -->
                    <tr>
                        <td colspan="4" class="px-6 py-8 text-center text-slate-400 text-xs">Carregando histórico...
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<script>
    function copyLink() {
        const link = document.getElementById('affiliate-link');
        link.select();
        link.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(link.value);

        const feedback = document.getElementById('copy-feedback');
        feedback.textContent = 'Link copiado! Espalhe a novidade.';
        setTimeout(() => feedback.textContent = '', 3000);
    }

    async function loadAffiliateData() {
        try {
            const response = await fetch('api_afiliados.php?action=get_affiliate_dashboard');
            const data = await response.json();

            if (data.success) {
                // Preencher KPI Cards
                document.getElementById('affiliate-link').value = data.link_indicacao;
                document.getElementById('total-earnings').textContent = Number(data.ganhos_totais).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                document.getElementById('pending-earnings').textContent = Number(data.saldo_pendente).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                document.getElementById('active-referrals').textContent = data.indicacoes_ativas;

                // Lógica Simples de Níveis (Mock Up)
                const indications = data.indicacoes_ativas;
                let level = 'Bronze';
                let nextLevel = 5;
                let percent = (indications / 5) * 100;

                if (indications >= 50) {
                    level = 'Diamante'; percent = 100; nextLevel = 100;
                } else if (indications >= 20) {
                    level = 'Ouro'; percent = ((indications - 20) / 30) * 100; nextLevel = 50;
                } else if (indications >= 5) {
                    level = 'Prata'; percent = ((indications - 5) / 15) * 100; nextLevel = 20;
                }

                document.getElementById('current-badge').textContent = level;
                document.getElementById('progress-bar').style.width = Math.min(percent, 100) + '%';
                document.getElementById('progress-percentage').textContent = Math.floor(Math.min(percent, 100)) + '%';

                if (level !== 'Diamante') {
                    document.getElementById('next-level-message').textContent = `Faltam ${nextLevel - indications} indicações para o próximo nível!`;
                } else {
                    document.getElementById('next-level-message').textContent = `Você é o máximo!`;
                }

                // Tabela
                const tbody = document.getElementById('history-table-body');
                tbody.innerHTML = '';
                if (data.historico.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-slate-400">Nenhuma comissão ainda. Comece a indicar!</td></tr>';
                } else {
                    data.historico.forEach(item => {
                        const date = new Date(item.data_criacao).toLocaleDateString('pt-BR');
                        const val = Number(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                        let statusColor = 'text-slate-500';
                        if (item.status === 'paga') statusColor = 'text-green-500 font-bold';
                        if (item.status === 'pendente') statusColor = 'text-orange-500';

                        const row = `
                            <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                <td class="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">${item.indicado_nome}</td>
                                <td class="px-6 py-4 text-slate-500 dark:text-slate-400">${date}</td>
                                <td class="px-6 py-4 ${statusColor} capitalize">${item.status}</td>
                                <td class="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-200">${val}</td>
                            </tr>
                        `;
                        tbody.insertAdjacentHTML('beforeend', row);
                    });
                }
            }
        } catch (error) {
            console.error('Erro ao carregar afiliados:', error);
        }
    }

    document.addEventListener('DOMContentLoaded', loadAffiliateData);
</script>