<?php
session_start();
require_once 'config.php';

// Segurança: Apenas Admin
if (!isset($_SESSION["loggedin"]) || $_SESSION["tipo"] !== 'admin') {
    header("location: login.php");
    exit;
}

$page = $_GET['page'] ?? 'dashboard';
?>
<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Mentalpag</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        body {
            font-family: 'Inter', sans-serif;
        }
    </style>
</head>

<body class="bg-gray-50 flex h-screen overflow-hidden text-sm text-gray-800">

    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div class="p-6 flex items-center gap-3 text-emerald-600 font-bold text-xl">
            <img src="assets/logo.png" onerror="this.src='https://via.placeholder.com/30'" class="h-14"> Admin
        </div>

        <nav class="flex-1 px-4 space-y-1 overflow-y-auto">
            <a href="?page=dashboard"
                class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors <?php echo $page == 'dashboard' ? 'bg-emerald-50 text-emerald-600 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'; ?>">
                <i data-lucide="layout-dashboard" class="w-5 h-5"></i> Dashboard
            </a>

            <p class="px-4 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Gestão</p>

            <a href="?page=users"
                class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors <?php echo $page == 'users' ? 'bg-emerald-50 text-emerald-600 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'; ?>">
                <i data-lucide="users" class="w-5 h-5"></i> Usuários
            </a>
            <!-- Link atualizado para produtos -->
            <a href="?page=produtos"
                class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors <?php echo $page == 'produtos' ? 'bg-emerald-50 text-emerald-600 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'; ?>">
                <i data-lucide="box" class="w-5 h-5"></i> Serviços
            </a>
            <a href="?page=pacientes"
                class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors <?php echo $page == 'pacientes' ? 'bg-emerald-50 text-emerald-600 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'; ?>">
                <i data-lucide="heart-pulse" class="w-5 h-5"></i> Pacientes
            </a>
            <a href="?page=agenda"
                class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors <?php echo $page == 'agenda' ? 'bg-emerald-50 text-emerald-600 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'; ?>">
                <i data-lucide="calendar" class="w-5 h-5"></i> Agenda
            </a>

            <p class="px-4 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Sistema</p>

            <a href="?page=relatorios"
                class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors <?php echo $page == 'relatorios' ? 'bg-emerald-50 text-emerald-600 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'; ?>">
                <i data-lucide="bar-chart-2" class="w-5 h-5"></i> Relatórios
            </a>
            <a href="?page=smtp"
                class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors <?php echo $page == 'smtp' ? 'bg-emerald-50 text-emerald-600 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'; ?>">
                <i data-lucide="mail" class="w-5 h-5"></i> Config SMTP
            </a>

            <a href="logout.php"
                class="flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 mt-10 transition-colors">
                <i data-lucide="log-out" class="w-5 h-5"></i> Sair
            </a>
        </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-8 bg-gray-50">
        <?php
        switch ($page) {
            case 'dashboard':
                if (file_exists('admin_dashboard.php'))
                    include 'admin_dashboard.php';
                else
                    echo "<h1 class='text-2xl font-bold'>Bem-vindo ao Painel Admin</h1>";
                break;
            case 'users':
                if (file_exists('admin_users.php'))
                    include 'admin_users.php';
                else
                    echo "<p class='text-red-500'>Arquivo admin_users.php não encontrado.</p>";
                break;
            case 'produtos': // Updated case name
                if (file_exists('admin_products.php'))
                    include 'admin_products.php'; // New file
                elseif (file_exists('servicos.php'))
                    include 'servicos.php'; // Fallback
                else
                    echo "<p class='text-red-500'>Arquivo admin_products.php não encontrado.</p>";
                break;
            case 'servicos': // Legacy redirect
                if (file_exists('admin_products.php'))
                    include 'admin_products.php';
                break;
            case 'pacientes':
                if (file_exists('admin_pacientes.php'))
                    include 'admin_pacientes.php';
                else
                    echo "<p class='text-red-500'>Arquivo admin_pacientes.php não encontrado.</p>";
                break;
            case 'agenda':
                if (file_exists('admin_agenda.php'))
                    include 'admin_agenda.php';
                else
                    echo "<p class='text-red-500'>Arquivo admin_agenda.php não encontrado.</p>";
                break;
            case 'relatorios':
                if (file_exists('admin_relatorios.php'))
                    include 'admin_relatorios.php';
                else
                    echo "<p class='text-red-500'>Arquivo admin_relatorios.php não encontrado.</p>";
                break;
            case 'smtp':
                if (file_exists('admin_smtp_config.php'))
                    include 'admin_smtp_config.php';
                else
                    echo "<p class='text-red-500'>Arquivo admin_smtp_config.php não encontrado.</p>";
                break;
            default:
                echo "<h2 class='text-red-500 text-xl font-bold'>Página não encontrada</h2><p>Verifique o link ou se o arquivo existe.</p>";
        }
        ?>
    </main>

    <script> lucide.createIcons(); </script>
</body>

</html>
