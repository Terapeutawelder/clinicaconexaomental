<?php
// dashboard_modern.php
// Versão modernizada do Dashboard com Cards de Agendamento, Vendas, Gráficos Premium e DARK MODE.

require_once 'config.php';

// Segurança
if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    exit;
}

$user_id = $_SESSION['id'];

// --- 1. Buscar Dados de Agendamentos (Server Side) ---
$agendamentos_dash = [];
try {
    $stmt_ag = $pdo->prepare("SELECT * FROM agendamentos WHERE usuario_id = ? ORDER BY data_sessao DESC, hora_inicio DESC LIMIT 4");
    $stmt_ag->execute([$user_id]);
    $agendamentos_dash = $stmt_ag->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) { /* Silêncio é ouro */
}

// --- 2. Buscar Resumo de Vendas (Hoje) - Inicial ---
$total_vendas_hoje = 0;
$qtd_vendas_hoje = 0;
$ticket_medio_hoje = 0;

try {
    $stmt_vendas = $pdo->prepare("
        SELECT 
            SUM(valor_liquido) as total, 
            COUNT(*) as qtd 
        FROM vendas 
        WHERE produtor_id = ? 
        AND status = 'pago' 
        AND DATE(data_venda) = CURDATE()
    ");
    $stmt_vendas->execute([$user_id]);
    $res_vendas = $stmt_vendas->fetch(PDO::FETCH_ASSOC);

    $total_vendas_hoje = $res_vendas['total'] ?? 0;
    $qtd_vendas_hoje = $res_vendas['qtd'] ?? 0;
    $ticket_medio_hoje = ($qtd_vendas_hoje > 0) ? ($total_vendas_hoje / $qtd_vendas_hoje) : 0;
} catch (Exception $e) {
}
?>

<!-- Container Principal com Efeito Glass e Suporte a Dark Mode -->
<div class="container mx-auto px-4 pb-12 animate-fade-in-up transition-colors duration-300">

    <!-- Header / Boas Vindas -->
    <div class="flex flex-col md:flex-row justify-between items-center mb-8 mt-6 gap-4">
        <div>
            <h1
                class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-800 dark:from-emerald-400 dark:to-teal-200">
                Olá, <?php echo htmlspecialchars($user_name_display); ?>! 👋
            </h1>
            <p class="text-slate-500 dark:text-slate-400 mt-1">Aqui está o resumo da sua clínica hoje.</p>
        </div>

        <div class="flex items-center gap-4">
            <!-- Botão Dark Mode Toggle -->
            <button id="themeToggle"
                class="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all shadow-sm">
                <i data-lucide="moon" class="w-5 h-5 block dark:hidden"></i>
                <i data-lucide="sun" class="w-5 h-5 hidden dark:block"></i>
            </button>

            <!-- Filtro de Período -->
            <div
                class="bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex">
                <button onclick="updateDashboard('today')"
                    class="period-btn px-3 py-1.5 text-xs font-semibold rounded-md transition-all active-period bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    data-period="today">Hoje</button>
                <button onclick="updateDashboard('yesterday')"
                    class="period-btn px-3 py-1.5 text-xs font-semibold rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                    data-period="yesterday">Ontem</button>
                <button onclick="updateDashboard('7days')"
                    class="period-btn px-3 py-1.5 text-xs font-semibold rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                    data-period="7days">7 Dias</button>
                <button onclick="updateDashboard('month')"
                    class="period-btn px-3 py-1.5 text-xs font-semibold rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                    data-period="month">Mês</button>
            </div>
        </div>
    </div>

    <!-- SEÇÃO DE KPIS PRINCIPAIS (Agora inclui Agendamentos) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        <!-- Agendamentos (NOVO - Substitui a lista) -->
        <div
            class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:border-emerald-200 dark:hover:border-emerald-700 transition-colors">
            <div class="flex justify-between items-start">
                <div>
                    <p class="text-slate-400 font-medium text-sm mb-1 uppercase tracking-wider">Agendamentos</p>
                    <h3 class="text-3xl font-bold text-slate-800 dark:text-slate-100" id="kpi-agendamentos">
                        <?php echo count($agendamentos_dash); // Mostra contagem inicial ?>
                    </h3>
                </div>
                <div
                    class="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <i data-lucide="calendar" class="w-6 h-6"></i>
                </div>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-700 h-1.5 mt-4 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full w-[100%]"></div>
            </div>
        </div>

        <!-- Vendas Totais (Card Principal) -->
        <div
            class="bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-800 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200/50 dark:shadow-none relative overflow-hidden group">
            <div
                class="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700">
            </div>
            <div class="relative z-10">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-emerald-100 font-medium text-sm mb-1">Faturamento</p>
                        <h3 class="text-3xl font-bold tracking-tight" id="kpi-total">R$
                            <?php echo number_format($total_vendas_hoje, 2, ',', '.'); ?>
                        </h3>
                    </div>
                    <div class="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <i data-lucide="dollar-sign" class="w-6 h-6 text-white"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quantidade Vendas -->
        <div
            class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:border-emerald-200 dark:hover:border-emerald-700 transition-colors">
            <div class="flex justify-between items-start">
                <div>
                    <p class="text-slate-400 font-medium text-sm mb-1 uppercase tracking-wider">Vendas</p>
                    <h3 class="text-3xl font-bold text-slate-800 dark:text-slate-100" id="kpi-qtd">
                        <?php echo $qtd_vendas_hoje; ?>
                    </h3>
                </div>
                <div
                    class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <i data-lucide="shopping-bag" class="w-6 h-6"></i>
                </div>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-700 h-1.5 mt-4 rounded-full overflow-hidden">
                <div class="bg-blue-500 h-full w-[70%]"></div>
            </div>
        </div>

        <!-- Ticket Médio -->
        <div
            class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:border-purple-200 dark:hover:border-purple-700 transition-colors">
            <div class="flex justify-between items-start">
                <div>
                    <p class="text-slate-400 font-medium text-sm mb-1 uppercase tracking-wider">Ticket Médio</p>
                    <h3 class="text-3xl font-bold text-slate-800 dark:text-slate-100" id="kpi-ticket">R$
                        <?php echo number_format($ticket_medio_hoje, 2, ',', '.'); ?>
                    </h3>
                </div>
                <div
                    class="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <i data-lucide="bar-chart-2" class="w-6 h-6"></i>
                </div>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-700 h-1.5 mt-4 rounded-full overflow-hidden">
                <div class="bg-purple-500 h-full w-[45%]"></div>
            </div>
        </div>
    </div>


    <!-- SEÇÃO 3: MÉTRICAS SECUNDÁRIAS (Grid de 4) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        <!-- Vendas Pendentes -->
        <div
            class="bg-white dark:bg-slate-800 p-5 rounded-xl border border-orange-100 dark:border-slate-700 shadow-sm flex items-center justify-between group hover:border-orange-300 transition-colors">
            <div>
                <p class="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">Pendentes</p>
                <h4 class="text-xl font-bold text-slate-700 dark:text-slate-200" id="kpi-pending">R$ 0,00</h4>
                <p class="text-[10px] text-slate-400 mt-1"><span id="kpi-pending-qtd">0</span> transações</p>
            </div>
            <div
                class="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500">
                <i data-lucide="clock" class="w-5 h-5"></i>
            </div>
        </div>

        <!-- Abandono de Carrinho -->
        <div
            class="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between group hover:border-slate-300 transition-colors">
            <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Abandonos</p>
                <h4 class="text-xl font-bold text-slate-700 dark:text-slate-200" id="kpi-abandoned">0</h4>
                <p class="text-[10px] text-slate-400 mt-1">Checkout incompleto</p>
            </div>
            <div
                class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                <i data-lucide="shopping-cart" class="w-5 h-5"></i>
            </div>
        </div>

        <!-- Reembolsos -->
        <div
            class="bg-white dark:bg-slate-800 p-5 rounded-xl border border-red-100 dark:border-slate-700 shadow-sm flex items-center justify-between group hover:border-red-300 transition-colors">
            <div>
                <p class="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Reembolsos</p>
                <h4 class="text-xl font-bold text-slate-700 dark:text-slate-200" id="kpi-refunds">R$ 0,00</h4>
            </div>
            <div
                class="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
                <i data-lucide="rotate-ccw" class="w-5 h-5"></i>
            </div>
        </div>

        <!-- Chargebacks -->
        <div
            class="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between group hover:border-slate-300 transition-colors">
            <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Chargebacks</p>
                <h4 class="text-xl font-bold text-slate-700 dark:text-slate-200" id="kpi-chargebacks">R$ 0,00</h4>
            </div>
            <div
                class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                <i data-lucide="alert-triangle" class="w-5 h-5"></i>
            </div>
        </div>
    </div>


    <!-- SEÇÃO 4: GRÁFICO ApexCharts + MÉTODOS DE PAGAMENTO -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Gráfico Principal (Ocupa 2 colunas) -->
        <div
            class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none p-6 border border-slate-100 dark:border-slate-700">
            <h4 class="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <span class="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                Performance de Vendas
            </h4>
            <div id="salesChart" class="w-full h-[350px]"></div>
        </div>

        <!-- Métodos de Pagamento (Ocupa 1 coluna) -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <h4 class="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Por Método</h4>

            <div class="space-y-6">
                <!-- Pix -->
                <div>
                    <div class="flex justify-between text-sm mb-1">
                        <span class="text-emerald-600 font-bold flex items-center gap-1"><i data-lucide="zap"
                                class="w-3 h-3"></i> Pix</span>
                        <span class="text-slate-600 dark:text-slate-300 font-mono" id="method-pix-val">R$ 0,00</span>
                    </div>
                    <div class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div id="bar-pix" class="bg-emerald-500 h-full w-0 transition-all duration-1000"></div>
                    </div>
                    <p class="text-[10px] text-right text-slate-400 mt-1" id="method-pix-count">0 vendas</p>
                </div>

                <!-- Cartão -->
                <div>
                    <div class="flex justify-between text-sm mb-1">
                        <span class="text-blue-600 font-bold flex items-center gap-1"><i data-lucide="credit-card"
                                class="w-3 h-3"></i> Cartão</span>
                        <span class="text-slate-600 dark:text-slate-300 font-mono" id="method-card-val">R$ 0,00</span>
                    </div>
                    <div class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div id="bar-card" class="bg-blue-500 h-full w-0 transition-all duration-1000"></div>
                    </div>
                    <p class="text-[10px] text-right text-slate-400 mt-1" id="method-card-count">0 vendas</p>
                </div>

                <!-- Boleto -->
                <div>
                    <div class="flex justify-between text-sm mb-1">
                        <span class="text-slate-600 dark:text-slate-400 font-bold flex items-center gap-1"><i
                                data-lucide="barcode" class="w-3 h-3"></i> Boleto</span>
                        <span class="text-slate-600 dark:text-slate-300 font-mono" id="method-boleto-val">R$ 0,00</span>
                    </div>
                    <div class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div id="bar-boleto" class="bg-slate-400 h-full w-0 transition-all duration-1000"></div>
                    </div>
                    <p class="text-[10px] text-right text-slate-400 mt-1" id="method-boleto-count">0 vendas</p>
                </div>
            </div>

            <!-- Taxa de Aprovação -->
            <div class="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
                <p class="text-xs text-slate-400 uppercase tracking-widest mb-2">Taxa de Conversão</p>
                <div class="relative inline-flex items-center justify-center">
                    <svg class="transform -rotate-90 w-24 h-24">
                        <circle cx="48" cy="48" r="36" stroke="currentColor" stroke-width="8" fill="transparent"
                            class="text-slate-100 dark:text-slate-700" />
                        <circle id="circle-conversion" cx="48" cy="48" r="36" stroke="currentColor" stroke-width="8"
                            fill="transparent" stroke-dasharray="226" stroke-dashoffset="226"
                            class="text-emerald-500 transition-all duration-1000" />
                    </svg>
                    <span class="absolute text-xl font-bold text-slate-800 dark:text-slate-100"
                        id="conversion-rate">0%</span>
                </div>
            </div>
        </div>

    </div>

</div>

<!-- Scripts -->
<script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
<script>
    lucide.createIcons();
    let chartInstance = null;
    let isDarkMode = localStorage.getItem('theme') === 'dark';

    // --- DARK MODE LOGIC ---
    function toggleTheme() {
        isDarkMode = !isDarkMode;
        applyTheme();
    }

    function applyTheme() {
        const html = document.documentElement;
        if (isDarkMode) {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
        updateChartTheme(); // Atualiza cores do gráfico
    }

    // Inicialização do Tema
    if (isDarkMode || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        isDarkMode = true;
    }
    applyTheme(); // Aplica no load

    // Listener do Botão
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);


    // --- APEXCHARTS CONFIG ---
    function getChartColors() {
        return {
            text: isDarkMode ? '#94a3b8' : '#64748b',
            grid: isDarkMode ? '#334155' : '#f1f5f9',
            tooltipBg: isDarkMode ? '#1e293b' : '#ffffff',
            tooltipText: isDarkMode ? '#f8fafc' : '#0f172a'
        };
    }

    const chartOptions = {
        series: [{ name: 'Vendas', data: [] }],
        chart: {
            type: 'area',
            height: 350,
            fontFamily: 'Inter, sans-serif',
            toolbar: { show: false },
            zoom: { enabled: false },
            background: 'transparent'
        },
        theme: { mode: isDarkMode ? 'dark' : 'light' }, // ApexCharts Theme
        colors: ['#10b981'],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.1,
                stops: [0, 90, 100]
            }
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3, colors: ['#059669'] },
        xaxis: {
            categories: [],
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { colors: getChartColors().text } }
        },
        yaxis: {
            labels: {
                formatter: (val) => `R$ ${val.toFixed(2)}`,
                style: { colors: getChartColors().text }
            }
        },
        tooltip: {
            theme: isDarkMode ? 'dark' : 'light',
            y: { formatter: (val) => `R$ ${val.toFixed(2)}` }
        },
        grid: {
            borderColor: getChartColors().grid,
            strokeDashArray: 4,
        }
    };

    chartInstance = new ApexCharts(document.querySelector("#salesChart"), chartOptions);
    chartInstance.render();

    function updateChartTheme() {
        if (!chartInstance) return;
        const colors = getChartColors();
        chartInstance.updateOptions({
            theme: { mode: isDarkMode ? 'dark' : 'light' },
            xaxis: { labels: { style: { colors: colors.text } } },
            yaxis: { labels: { style: { colors: colors.text } } },
            tooltip: { theme: isDarkMode ? 'dark' : 'light' },
            grid: { borderColor: colors.grid }
        });
    }

    // --- DASHBOARD DATA (Mantém lógica anterior) ---
    async function updateDashboard(period) {
        // ... (Mesma lógica de botões, adicionando classes dark mode se necessário)
        document.querySelectorAll('.period-btn').forEach(btn => {
            // Remove classes ativas (Light & Dark)
            btn.classList.remove('bg-emerald-100', 'text-emerald-700', 'active-period', 'dark:bg-emerald-900/30', 'dark:text-emerald-400');
            // Adiciona inativas
            btn.classList.add('text-slate-500', 'dark:text-slate-400');

            if (btn.dataset.period === period) {
                // Adiciona ativas
                btn.classList.add('bg-emerald-100', 'text-emerald-700', 'active-period', 'dark:bg-emerald-900/30', 'dark:text-emerald-400');
                btn.classList.remove('text-slate-500', 'dark:text-slate-400');
            }
        });

        try {
            const response = await fetch(`api.php?action=get_dashboard_data&period=${period}`);
            const data = await response.json();

            if (data.success) {
                // 1. Atualiza Cards KPI Principais
                document.getElementById('kpi-total').textContent = data.kpis.total_sales_formatted || 'R$ 0,00';
                document.getElementById('kpi-qtd').textContent = data.kpis.sales_count || '0';
                document.getElementById('kpi-ticket').textContent = data.kpis.average_ticket_formatted || 'R$ 0,00';

                // 2. Atualiza Métricas Secundárias
                // Pendentes
                const pendenteVal = parseFloat(data.kpis.vendas_pendentes_valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                document.getElementById('kpi-pending').textContent = pendenteVal;
                document.getElementById('kpi-pending-qtd').textContent = data.kpis.vendas_pendentes_quantidade || 0;

                // Abandonos & Outros
                document.getElementById('kpi-abandoned').textContent = data.kpis.abandono_carrinho || 0;
                document.getElementById('kpi-refunds').textContent = parseFloat(data.kpis.reembolsos || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                document.getElementById('kpi-chargebacks').textContent = parseFloat(data.kpis.chargebacks || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });


                // 3. Atualiza Métodos de Pagamento
                const updateMethod = (type, val, count, total) => {
                    const formattedVal = parseFloat(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    document.getElementById(`method-${type}-val`).textContent = formattedVal;
                    document.getElementById(`method-${type}-count`).textContent = `${count || 0} vendas`;

                    // Barra de Progresso (Baseada no Total de Vendas hoje)
                    const totalSalesVal = parseFloat(data.kpis.vendas_totais || 1); // Evita divpor zero
                    const percentage = totalSalesVal > 0 ? ((parseFloat(val || 0) / totalSalesVal) * 100) : 0;
                    document.getElementById(`bar-${type}`).style.width = `${percentage}%`;
                };

                updateMethod('pix', data.kpis.pix_vendas_valor, data.kpis.pix_vendas_count);
                updateMethod('card', data.kpis.cartao_vendas_valor, data.kpis.cartao_vendas_count);
                updateMethod('boleto', data.kpis.boleto_vendas_valor, data.kpis.boleto_vendas_count);


                // 4. Taxa de Conversão (Cálculo Aproximado ou vindo da API)
                // Se a API não mandar, calculamos: Vendas / (Vendas + Abandonos)
                let conversion = 0;
                const totalVendas = parseInt(data.kpis.quantidade_vendas || 0);
                const abandonos = parseInt(data.kpis.abandono_carrinho || 0);
                const initiated = totalVendas + abandonos; // Simplificação

                if (initiated > 0) {
                    conversion = Math.round((totalVendas / initiated) * 100);
                }

                document.getElementById('conversion-rate').textContent = `${conversion}%`;
                // Atualiza Círculo (Stroke Dashoffset: 226 é 100%, 0 é 0% ... na vdd 0 é cheio)
                // Circumference = 2 * PI * 36 ~= 226.
                // Offset = 226 - (226 * conversion / 100)
                const offset = 226 - (226 * conversion / 100);
                document.getElementById('circle-conversion').style.strokeDashoffset = offset;


                // 5. Atualiza Gráfico
                const categories = Object.keys(data.charts.sales_over_time);
                const seriesData = Object.values(data.charts.sales_over_time);

                chartInstance.updateOptions({
                    xaxis: { categories: categories },
                    series: [{ data: seriesData }]
                });
            }
        } catch (error) {
            console.error("Erro ao atualizar dashboard:", error);
        }
    }

    updateDashboard('today');

</script>

<style>
    /* Dark Mode Global Support na página se não tiver classe no body */
    .dark body {
        background-color: #0f172a;
        /* slate-900 */
        color: #f8fafc;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .animate-fade-in-up {
        animation: fadeInUp 0.5s ease-out forwards;
    }
</style>