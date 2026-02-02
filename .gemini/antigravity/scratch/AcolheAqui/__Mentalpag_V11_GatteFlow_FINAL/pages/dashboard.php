<div class="space-y-6">

    <!-- Top Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
            <p class="text-sm text-gray-500">Visão geral do seu negócio</p>
        </div>

        <div class="flex items-center gap-2">
            <!-- Period Filter -->
            <div class="bg-white border boundary-gray-200 rounded-lg p-1 flex items-center shadow-sm">
                <button class="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-md shadow-sm">Hoje</button>
                <button class="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700">Ontem</button>
                <button class="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700">Mês Atual</button>
                <button class="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700">7 Dias</button>
            </div>

            <button
                class="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <i data-lucide="qr-code" class="w-4 h-4"></i>
                Gerar PIX
            </button>
            <button onclick="window.location.href='?page=products'"
                class="flex items-center gap-2 bg-primary hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors shadow-blue-200">
                <i data-lucide="plus" class="w-4 h-4"></i>
                Novo Produto
            </button>
        </div>
    </div>

    <!-- Main Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <!-- Card 1: Receita Total -->
        <div
            class="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover-card border border-gray-100 transition-all">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <p class="text-sm font-medium text-gray-500">Receita Total</p>
                    <h3 class="text-2xl font-bold text-gray-800 mt-1">R$ 0,00</h3>
                </div>
                <div class="p-2 bg-green-50 rounded-lg">
                    <i data-lucide="dollar-sign" class="w-5 h-5 text-green-600"></i>
                </div>
            </div>
            <div class="flex items-center text-xs">
                <span class="text-green-500 font-medium flex items-center gap-0.5">
                    <i data-lucide="arrow-up-right" class="w-3 h-3"></i> +0%
                </span>
                <span class="text-gray-400 ml-2">vs período anterior</span>
            </div>
        </div>

        <!-- Card 2: Vendas -->
        <div
            class="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover-card border border-gray-100 transition-all">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <p class="text-sm font-medium text-gray-500">Vendas</p>
                    <h3 class="text-2xl font-bold text-gray-800 mt-1">0</h3>
                </div>
                <div class="p-2 bg-sky-50 rounded-lg">
                    <i data-lucide="shopping-cart" class="w-5 h-5 text-sky-600"></i>
                </div>
            </div>
            <div class="flex items-center text-xs">
                <span class="text-green-500 font-medium flex items-center gap-0.5">
                    <i data-lucide="arrow-up-right" class="w-3 h-3"></i> +0%
                </span>
                <span class="text-gray-400 ml-2">vs período anterior</span>
            </div>
        </div>

        <!-- Card 3: Receita Pendente -->
        <div
            class="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover-card border border-gray-100 transition-all">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <p class="text-sm font-medium text-gray-500">Receita Pendente</p>
                    <h3 class="text-2xl font-bold text-gray-800 mt-1">R$ 0,00</h3>
                </div>
                <div class="p-2 bg-yellow-50 rounded-lg">
                    <i data-lucide="clock" class="w-5 h-5 text-yellow-600"></i>
                </div>
            </div>
            <div class="flex items-center text-xs">
                <span class="text-gray-400">PIX gerados não pagos</span>
            </div>
        </div>

        <!-- Card 4: Ticket Médio -->
        <div
            class="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover-card border border-gray-100 transition-all">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <p class="text-sm font-medium text-gray-500">Ticket Médio</p>
                    <h3 class="text-2xl font-bold text-gray-800 mt-1">R$ 0,00</h3>
                </div>
                <div class="p-2 bg-emerald-50 rounded-lg">
                    <i data-lucide="banknote" class="w-5 h-5 text-emerald-600"></i>
                </div>
            </div>
            <div class="flex items-center text-xs">
                <span class="text-gray-400">Por venda aprovada</span>
            </div>
        </div>
    </div>

    <!-- Secondary Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Card 5: PIX Gerados -->
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div class="p-3 bg-cyan-50 rounded-lg text-cyan-600">
                <i data-lucide="qr-code" class="w-6 h-6"></i>
            </div>
            <div>
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">PIX Gerados</p>
                <h4 class="text-xl font-bold text-gray-800">0</h4>
                <p class="text-xs text-gray-400">No período</p>
            </div>
        </div>

        <!-- Card 6: Clientes Únicos -->
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div class="p-3 bg-purple-50 rounded-lg text-purple-600">
                <i data-lucide="users" class="w-6 h-6"></i>
            </div>
            <div>
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Clientes</p>
                <h4 class="text-xl font-bold text-gray-800">0</h4>
                <p class="text-xs text-green-500 font-medium">↑ Compradores</p>
            </div>
        </div>

        <!-- Card 7: Produtos Ativos -->
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div class="p-3 bg-green-50 rounded-lg text-green-600">
                <i data-lucide="package" class="w-6 h-6"></i>
            </div>
            <div>
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Produtos</p>
                <h4 class="text-xl font-bold text-gray-800">1</h4>
                <p class="text-xs text-green-500 font-medium">↑ Publicados</p>
            </div>
        </div>

        <!-- Card 8: Conversão -->
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div class="p-3 bg-orange-50 rounded-lg text-orange-600">
                <i data-lucide="percent" class="w-6 h-6"></i>
            </div>
            <div>
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Conversão</p>
                <h4 class="text-xl font-bold text-gray-800">0.0%</h4>
                <p class="text-xs text-red-400">↓ Taxa média</p>
            </div>
        </div>
    </div>

    <!-- Charts & Lists Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Chart -->
        <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div class="flex justify-between items-center mb-6">
                <h3 class="font-bold text-gray-800">Receita (Últimos 7 dias)</h3>
                <button class="text-xs text-primary font-medium hover:underline">Ver relatório</button>
            </div>
            <div
                class="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-400">
                <!-- Placeholder for Chart.js / ApexCharts -->
                <span class="text-sm">Gráfico de Receita será exibido aqui</span>
            </div>
        </div>

        <!-- Top Products -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 class="font-bold text-gray-800 mb-4">Produtos em Destaque</h3>
            <div class="space-y-4">
                <!-- Item 1 -->
                <div class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                    <div class="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <i data-lucide="package" class="w-5 h-5 text-gray-500"></i>
                    </div>
                    <div class="flex-1">
                        <p class="text-sm font-semibold text-gray-800">Consulta Padrão</p>
                        <p class="text-xs text-gray-500">2 vendas</p>
                    </div>
                    <span class="text-sm font-bold text-green-600">R$ 300,00</span>
                </div>
            </div>
        </div>
    </div>
</div>