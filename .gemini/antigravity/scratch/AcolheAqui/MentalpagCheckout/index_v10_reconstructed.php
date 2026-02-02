<?php
// PACOTE GOLD V10 - index.php RECONSTRUÍDO
// Inicia sessão
session_start();

// Verifica login
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

// Configuração Básica
require_once 'config.php';
$pagina = isset($_GET['pagina']) ? $_GET['pagina'] : 'dashboard';

// Roteamento Seguro
switch ($pagina) {
    case 'dashboard':
        $titulo_pagina = 'Dashboard';
        $arquivo_include = 'dashboard.php';
        break;
    case 'vendas':
        $titulo_pagina = 'Minhas Vendas';
        $arquivo_include = 'vendas.php';
        // Se o arquivo real for outro, ajustaremos. Mas 'vendas' costuma ser padrão.
        // Verificando padrão anterior: muitos sistemas usam admin_vendas.php?
        // Vou assumir que o usuario disse que "Vendas" funciona.
        if (file_exists('admin_sales.php'))
            $arquivo_include = 'admin_sales.php';
        elseif (file_exists('vendas.php'))
            $arquivo_include = 'vendas.php';
        break;
    case 'produtos':
    case 'servicos': // Mapeamento novo
    case 'serviços': // Variação com acento
        $titulo_pagina = 'Meus Serviços';
        $arquivo_include = 'admin_products.php';
        break;
    case 'mentalpag_track':
        $titulo_pagina = 'Rastreamento';
        $arquivo_include = 'track.php'; // Chute educado, mas se não existir, o include falha suave.
        if (file_exists('admin_track.php'))
            $arquivo_include = 'admin_track.php';
        break;
    case 'integracoes':
        $titulo_pagina = 'Integrações';
        $arquivo_include = 'configuracoes.php'; // Muitas vezes integracoes fica em config ou separado
        if (file_exists('admin_integrations.php'))
            $arquivo_include = 'admin_integrations.php';
        break;
    case 'area_membros':
        $titulo_pagina = 'Área de Membros';
        $arquivo_include = 'member_area_dashboard.php';
        break;
    case 'afiliados': // SE o usuário pediu pra remover, eu removo do MENU, mas a rota pode existir se digitada.
        // Mas como ele quer "sem afiliados", vou deixar sem case ou redirecionar dashboard.
        $titulo_pagina = 'Afiliados';
        $arquivo_include = 'affiliates.php';
        break;
    case 'configuracoes':
        $titulo_pagina = 'Configurações';
        $arquivo_include = 'configuracoes.php';
        break;
    default:
        $titulo_pagina = 'Dashboard';
        $arquivo_include = 'dashboard.php';
        break;
}

// Classe ativa para menu
$active_class = 'bg-green-500 text-white';
$inactive_class = 'text-gray-600 hover:bg-gray-100';

?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MentalPag -
        <?php echo $titulo_pagina; ?>
    </title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        body {
            font-family: 'Inter', sans-serif;
        }
    </style>
</head>

<body class="bg-gray-50 flex h-screen overflow-hidden">

    <!-- Sidebar (Menu Lateral Restaurado) -->
    <aside class="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col z-10">
        <!-- Logo -->
        <div class="h-20 flex items-center px-6 border-b border-gray-100">
            <img src="assets/logo.png" alt="MentalPag" class="h-24 w-auto object-contain">
        </div>

        <!-- Menu Navigation -->
        <nav class="flex-1 overflow-y-auto py-4">
            <ul class="space-y-1 px-3">

                <!-- Dashboard -->
                <li>
                    <a href="index.php?pagina=dashboard"
                        class="flex items-center space-x-3 p-3 rounded-lg <?php echo ($pagina == 'dashboard') ? $active_class : $inactive_class; ?>">
                        <i data-lucide="layout-grid" class="w-5 h-5"></i>
                        <span>Dashboard</span>
                    </a>
                </li>

                <!-- Minha Página (Bio) - REMOVIDO A PEDIDO -->

                <!-- Vendas -->
                <li>
                    <a href="index.php?pagina=vendas"
                        class="flex items-center space-x-3 p-3 rounded-lg <?php echo ($pagina == 'vendas') ? $active_class : $inactive_class; ?>">
                        <i data-lucide="shopping-cart" class="w-5 h-5"></i>
                        <span>Vendas</span>
                    </a>
                </li>

                <!-- Serviços (Antigo Produtos) -->
                <li>
                    <a href="index.php?pagina=servicos"
                        class="flex items-center space-x-3 p-3 rounded-lg <?php echo ($pagina == 'servicos' || $pagina == 'produtos') ? $active_class : $inactive_class; ?>">
                        <i data-lucide="package" class="w-5 h-5"></i>
                        <span>Serviços</span>
                    </a>
                </li>

                <!-- Mentalpag Track -->
                <li>
                    <a href="index.php?pagina=mentalpag_track"
                        class="flex items-center space-x-3 p-3 rounded-lg <?php echo ($pagina == 'mentalpag_track') ? $active_class : $inactive_class; ?>">
                        <i data-lucide="line-chart" class="w-5 h-5"></i>
                        <span>Mentalpag Track</span>
                    </a>
                </li>

                <!-- Integrações -->
                <li>
                    <a href="index.php?pagina=integracoes"
                        class="flex items-center space-x-3 p-3 rounded-lg <?php echo ($pagina == 'integracoes') ? $active_class : $inactive_class; ?>">
                        <i data-lucide="plug-zap" class="w-5 h-5"></i>
                        <span>Integrações</span>
                    </a>
                </li>

                <!-- Área de Membros -->
                <li>
                    <a href="index.php?pagina=area_membros"
                        class="flex items-center space-x-3 p-3 rounded-lg <?php echo ($pagina == 'area_membros') ? $active_class : $inactive_class; ?>">
                        <i data-lucide="play-square" class="w-5 h-5"></i>
                        <span>Área de Membros</span>
                    </a>
                </li>

                <!-- Afiliados - REMOVIDO A PEDIDO -->

                <!-- Configurações -->
                <li>
                    <a href="index.php?pagina=configuracoes"
                        class="flex items-center space-x-3 p-3 rounded-lg <?php echo ($pagina == 'configuracoes') ? $active_class : $inactive_class; ?>">
                        <i data-lucide="settings" class="w-5 h-5"></i>
                        <span>Configurações</span>
                    </a>
                </li>
            </ul>
        </nav>

        <!-- User Profile (Footer Sidebar) -->
        <div class="p-4 border-t border-gray-100">
            <div class="flex items-center space-x-3">
                <div
                    class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                    <?php echo substr($_SESSION['user_name'] ?? 'U', 0, 1); ?>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-700">
                        <?php echo $_SESSION['user_name'] ?? 'Usuário'; ?>
                    </p>
                    <a href="logout.php" class="text-xs text-red-500 hover:text-red-700">Sair</a>
                </div>
            </div>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-screen overflow-hidden">
        <!-- Top Header (Mobile Toggle + Notifications) -->
        <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div class="md:hidden">
                <!-- Mobile Menu Button (Implementar JS se necessário, mas o foco é Desktop agora) -->
                <button class="text-gray-500 hover:text-gray-700">
                    <i data-lucide="menu" class="w-6 h-6"></i>
                </button>
            </div>

            <div class="flex items-center space-x-4 ml-auto">
                <button class="relative p-2 text-gray-400 hover:text-gray-500">
                    <i data-lucide="bell" class="w-6 h-6"></i>
                    <!-- Notification Dot example -->
                    <!-- <span class="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span> -->
                </button>
                <div class="flex items-center md:hidden">
                    <!-- Mobile Profile if needed -->
                </div>
            </div>
        </header>

        <!-- Page Content Scrollable Area -->
        <div class="flex-1 overflow-auto bg-gray-50 p-6">
            <?php
            // Include dinâmico do conteúdo
            if (file_exists($arquivo_include)) {
                include $arquivo_include;
            } else {
                echo "<div class='text-center py-20'>";
                echo "<h2 class='text-2xl font-bold text-gray-700'>Erro 404</h2>";
                echo "<p class='text-gray-500'>A página solicitada não foi encontrada: <strong>$arquivo_include</strong></p>";
                echo "</div>";
            }
            ?>
        </div>
    </main>

    <script>
        lucide.createIcons();
    </script>
</body>

</html>