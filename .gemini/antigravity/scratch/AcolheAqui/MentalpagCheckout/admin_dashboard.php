<?php
// admin_dashboard.php - Fixed Columns & Light Theme

// --- 1. Fetch Data ---
$stats = [
    'usuarios' => 0,
    'faturamento' => 0,
    'vendas_count' => 0,
    'produtos' => 0,
    'chart_data' => []
];

try {
    // 1. Usuários (OK)
    $stats['usuarios'] = $pdo->query("SELECT COUNT(*) FROM usuarios")->fetchColumn();

    // 2. Produtos (Tabela 'produtos')
    $stats['produtos'] = $pdo->query("SELECT COUNT(*) FROM produtos")->fetchColumn();

    // 3. Vendas (Tabela 'vendas', colunas 'status_pagamento', 'valor', 'data_venda')
    // Status esperado: 'approved', 'pai' ou 'aprovado'
    $sql_fat = "SELECT SUM(valor), COUNT(*) FROM vendas WHERE status_pagamento IN ('approved', 'paid', 'aprovado', 'paga')";
    $row_fat = $pdo->query($sql_fat)->fetch(PDO::FETCH_NUM);

    $stats['faturamento'] = $row_fat[0] ?? 0;
    $stats['vendas_count'] = $row_fat[1] ?? 0; // Total approved
    // Se quiser total geral (incluindo pendentes):
    // $stats['vendas_count'] = $pdo->query("SELECT COUNT(*) FROM vendas")->fetchColumn();

    // 4. Chart Data (Por data_venda)
    $sql_chart = "
        SELECT DATE(data_venda) as data, COUNT(*) as total 
        FROM vendas 
        WHERE data_venda >= DATE_SUB(NOW(), INTERVAL 30 DAY) 
        AND status_pagamento IN ('approved', 'paid', 'aprovado', 'paga')
        GROUP BY DATE(data_venda) 
        ORDER BY data ASC
    ";
    $stmt_chart = $pdo->query($sql_chart);
    $stats['chart_data'] = $stmt_chart->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    // Silent fail or log
}

// JSON for JS
$chart_labels = [];
$chart_values = [];
foreach ($stats['chart_data'] as $d) {
    $chart_labels[] = date('d/m', strtotime($d['data']));
    $chart_values[] = $d['total'];
}
?>

<div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-800">Dashboard</h1>
    <p class="text-gray-500">Visão geral do sistema.</p>
</div>

<!-- Stats Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

    <!-- Usuários -->
    <div
        class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div class="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <i data-lucide="users" class="w-8 h-8"></i>
        </div>
        <div>
            <p class="text-sm text-gray-500 font-medium">Usuários</p>
            <h3 class="text-2xl font-bold text-gray-900">
                <?php echo number_format($stats['usuarios']); ?>
            </h3>
        </div>
    </div>

    <!-- Faturamento -->
    <div
        class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div class="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <i data-lucide="dollar-sign" class="w-8 h-8"></i>
        </div>
        <div>
            <p class="text-sm text-gray-500 font-medium">Faturamento</p>
            <h3 class="text-2xl font-bold text-gray-900">R$
                <?php echo number_format($stats['faturamento'], 2, ',', '.'); ?>
            </h3>
        </div>
    </div>

    <!-- Vendas -->
    <div
        class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div class="p-3 bg-green-50 text-green-600 rounded-xl">
            <i data-lucide="shopping-cart" class="w-8 h-8"></i>
        </div>
        <div>
            <p class="text-sm text-gray-500 font-medium">Vendas Aprovadas</p>
            <h3 class="text-2xl font-bold text-gray-900">
                <?php echo number_format($stats['vendas_count']); ?>
            </h3>
        </div>
    </div>

    <!-- Produtos -->
    <div
        class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div class="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <i data-lucide="box" class="w-8 h-8"></i>
        </div>
        <div>
            <p class="text-sm text-gray-500 font-medium">Serviços</p>
            <h3 class="text-2xl font-bold text-gray-900">
                <?php echo number_format($stats['produtos']); ?>
            </h3>
        </div>
    </div>
</div>

<!-- Chart & Lists -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Chart -->
    <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Vendas (30 dias)</h3>
        <div id="chart-sales" class="w-full h-80"></div>
    </div>

    <!-- Shortcuts -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Ações Rápidas</h3>
        <div class="space-y-3">
            <a href="?page=users"
                class="block p-4 rounded-xl bg-gray-50 hover:bg-emerald-50 transition-colors flex items-center gap-3 border border-transparent hover:border-emerald-100">
                <div class="bg-blue-100 text-blue-600 p-2 rounded-lg"><i data-lucide="user-plus" class="w-5 h-5"></i>
                </div>
                <div>
                    <span class="font-bold text-gray-800">Gerenciar Usuários</span>
                    <p class="text-xs text-gray-500">Adicionar/Editar</p>
                </div>
            </a>
            <a href="?page=produtos"
                class="block p-4 rounded-xl bg-gray-50 hover:bg-emerald-50 transition-colors flex items-center gap-3 border border-transparent hover:border-emerald-100">
                <div class="bg-purple-100 text-purple-600 p-2 rounded-lg"><i data-lucide="plus-circle"
                        class="w-5 h-5"></i></div>
                <div>
                    <span class="font-bold text-gray-800">Novo Infoproduto</span>
                    <p class="text-xs text-gray-500">Cadastrar oferta</p>
                </div>
            </a>
            <a href="?page=agenda"
                class="block p-4 rounded-xl bg-gray-50 hover:bg-emerald-50 transition-colors flex items-center gap-3 border border-transparent hover:border-emerald-100">
                <div class="bg-orange-100 text-orange-600 p-2 rounded-lg"><i data-lucide="calendar" class="w-5 h-5"></i>
                </div>
                <div>
                    <span class="font-bold text-gray-800">Agenda</span>
                    <p class="text-xs text-gray-500">Ver compromissos</p>
                </div>
            </a>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
<script>
    lucide.createIcons();

    var options = {
        series: [{
            name: 'Vendas',
            data: <?php echo json_encode($chart_values); ?>
        }],
        chart: {
            type: 'area',
            height: 320,
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif',
            background: 'transparent'
        },
        colors: ['#10B981'],
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
        stroke: { curve: 'smooth', width: 2 },
        xaxis: {
            categories: <?php echo json_encode($chart_labels); ?>,
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: { show: false },
        grid: {
            borderColor: '#f1f5f9',
            strokeDashArray: 4,
            yaxis: { lines: { show: true } }
        },
        theme: { mode: 'light' }
    };

    var chart = new ApexCharts(document.querySelector("#chart-sales"), options);
    chart.render();
</script>
