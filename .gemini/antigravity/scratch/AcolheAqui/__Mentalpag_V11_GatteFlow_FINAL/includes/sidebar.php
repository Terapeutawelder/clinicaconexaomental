<?php
$current_page = isset($_GET['page']) ? $_GET['page'] : 'dashboard';
$mode = isset($_SESSION['user_mode']) ? $_SESSION['user_mode'] : 'seller';

// Menu Items Configuration
$menu_items = [];

if ($mode === 'admin') {
    $menu_items = [
        ['label' => 'Dashboard', 'icon' => 'layout-grid', 'page' => 'dashboard'],
        ['label' => 'Usuários', 'icon' => 'users', 'page' => 'users'],
        ['label' => 'Gateways', 'icon' => 'credit-card', 'page' => 'gateways'],
        ['label' => 'Saques', 'icon' => 'wallet', 'page' => 'withdrawals'],
        ['label' => 'Logs', 'icon' => 'file-text', 'page' => 'logs'],
        ['label' => 'Configurações', 'icon' => 'settings', 'page' => 'settings'],
    ];
} else {
    // Seller Mode
    $menu_items = [
        ['label' => 'Dashboard', 'icon' => 'layout-grid', 'page' => 'dashboard'],
        ['label' => 'Produtos', 'icon' => 'package', 'page' => 'products'],
        ['label' => 'Vendas', 'icon' => 'shopping-cart', 'page' => 'sales'],
        ['label' => 'Area de Membros', 'icon' => 'users', 'page' => 'members'],
        ['label' => 'Configurações', 'icon' => 'settings', 'page' => 'settings'],
    ];
}
?>

<aside
    class="w-64 bg-white border-r border-gray-200 flex flex-col justify-between h-full z-10 transition-all duration-300 transform">
    <!-- Top Section -->
    <div>
        <!-- Logo -->
        <div class="h-20 flex items-center px-8 border-b border-gray-50">
            <div class="flex items-center gap-2 text-primary font-bold text-2xl tracking-tight">
                <span class="p-1.5 bg-sky-100 rounded-lg"><i data-lucide="zap" class="w-6 h-6 text-primary"></i></span>
                MentalPag
            </div>
        </div>

        <!-- Mode Switcher -->
        <div class="px-6 py-4">
            <div class="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span class="text-sm font-medium text-gray-600">
                    <?php echo $mode === 'admin' ? 'Modo Admin' : 'Modo Vendedor'; ?>
                </span>
                <a href="?mode=<?php echo $mode === 'admin' ? 'seller' : 'admin'; ?>"
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 <?php echo $mode === 'admin' ? 'bg-primary' : 'bg-gray-200'; ?>">
                    <span class="sr-only">Trocar Modo</span>
                    <span
                        class="inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform <?php echo $mode === 'admin' ? 'translate-x-6' : 'translate-x-1'; ?>"></span>
                </a>
            </div>
        </div>

        <!-- Navigation -->
        <nav class="px-4 space-y-1 mt-2">
            <?php foreach ($menu_items as $item): ?>
                <?php
                $isActive = ($current_page === $item['page']);
                $activeClass = $isActive ? 'bg-sky-50 text-sky-600 font-semibold shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900';
                $iconClass = $isActive ? 'text-sky-600' : 'text-gray-400 group-hover:text-gray-500';
                ?>
                <a href="?page=<?php echo $item['page']; ?>"
                    class="<?php echo $activeClass; ?> group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150 ease-in-out">
                    <i data-lucide="<?php echo $item['icon']; ?>"
                        class="<?php echo $iconClass; ?> mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-150 ease-in-out"></i>
                    <?php echo $item['label']; ?>
                </a>
            <?php endforeach; ?>
        </nav>
    </div>

    <!-- Bottom Section (User/Exit) -->
    <div class="p-4 border-t border-gray-100">
        <a href="#"
            class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors">
            <i data-lucide="log-out" class="w-5 h-5"></i>
            Sair
        </a>
    </div>
</aside>