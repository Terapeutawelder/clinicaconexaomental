<?php
require_once 'config.php';

// Este painel (admin.php) é exclusivo para administradores do sistema.
// Infoprodutores acessam o painel principal (index.php) e clientes finais acessam a área de membros (member_area_dashboard.php).
// Proteção de página: verifica se o usuário está logado E se é um administrador
if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true || !isset($_SESSION["tipo"]) || $_SESSION["tipo"] !== 'admin') {
    header("location: login.php");
    exit;
}

// Fetch admin user data for display (no longer displayed, but session is still valid)
$admin_user_id = $_SESSION['id'];
$admin_user_name_display = htmlspecialchars($_SESSION['usuario']); 

// Sistema de roteamento simples para o painel de admin
$pagina_admin = isset($_GET['pagina']) ? $_GET['pagina'] : 'admin_dashboard';
$role_filter = isset($_GET['role']) ? $_GET['role'] : 'all'; // Nova variável para o filtro de função
$paginas_permitidas_admin = ['admin_dashboard', 'admin_usuarios', 'admin_relatorios', 'admin_smtp_config'];

// Classes para o menu ativo
// NOVO: Cores e classes para o efeito de laranja neon e animação
$active_class = 'text-white font-semibold relative overflow-hidden admin-sidebar-active-link'; // 'bg-orange-500' removido
$inactive_class = 'text-gray-600 hover:bg-orange-100 hover:text-orange-700';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel do Administrador</title>

    <!-- PWA Tags -->
    <meta name="theme-color" content="#f97316">
    <link rel="manifest" href="manifest.json">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Plataforma">
    <link rel="apple-touch-icon" href="https://i.ibb.co/gbNBTgDD/1757909548831.jpg">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            orange: { 50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12' }
          }
        }
      }
    }
    </script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        /* Live Floating Notification */
        .live-notification-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 320px;
            background-color: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            padding: 1rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            transform: translateY(120%); /* Start off-screen */
            opacity: 0;
            transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease-out;
            z-index: 1000;
        }

        .live-notification-container.show {
            transform: translateY(0);
            opacity: 1;
        }

        .live-notification-product-image {
            width: 50px;
            height: 50px;
            border-radius: 8px;
            object-fit: cover;
            flex-shrink: 0;
            border: 1px solid #e5e7eb; /* Adiciona uma borda sutil ao ícone */
        }
        .cash-register-sound {
            display: none; /* Hide audio element */
        }

        /* Responsividade para o menu lateral */
        /* Estilos base para mobile (sidebar oculta) */
        #admin-sidebar {
            position: fixed;
            top: 80px; /* Altura do header fixo */
            bottom: 0;
            left: 0;
            z-index: 40;
            width: 100%;
            max-width: 280px; /* Largura máxima para mobile */
            background-color: white;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
            transform: translateX(-100%); /* Oculto por padrão */
            transition: transform 0.3s ease-in-out;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
        }

        #admin-sidebar.open {
            transform: translateX(0); /* Visível quando aberto */
        }

        #admin-sidebar-overlay {
            position: fixed;
            inset: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 30;
            display: none; /* Oculto por padrão */
            transition: opacity 0.3s ease-in-out;
            opacity: 0;
        }

        #admin-sidebar-overlay.open {
            display: block;
            opacity: 1;
        }

        /* Botão de toggle visível em mobile */
        #admin-sidebar-toggle {
            display: flex;
        }

        /* Conteúdo principal sem margem em mobile */
        main {
            margin-left: 0;
        }

        /* Media query para telas maiores (desktop) - sidebar visível por padrão */
        @media (min-width: 768px) { /* md breakpoint */
            #admin-sidebar {
                transform: translateX(0); /* Sempre visível em desktop */
                width: 256px; /* md:w-64 */
                box-shadow: none; /* Sem sombra no desktop */
            }

            #admin-sidebar-toggle {
                display: none !important; /* Oculta em desktop */
            }

            main {
                margin-left: 256px; /* Adiciona margem em desktop */
            }

            #admin-sidebar-overlay {
                display: none !important; /* Nunca visível em desktop */
                opacity: 0 !important;
            }
        }

        /* NOVO: Estilos para o link ativo do menu lateral com animação */
        /* Keyframes para a animação de "abertura" da barra lateral */
        @keyframes slideInRight {
            from {
                transform: translateX(100%); /* Começa fora da tela, à direita */
                opacity: 0; /* Começa invisível */
            }
            to {
                transform: translateX(0%); /* Termina na posição, visível */
                opacity: 1;
            }
        }

        /* Estilo para o link ativo do menu lateral (a classe admin-sidebar-active-link é adicionada via PHP) */
        .admin-sidebar-active-link {
            /* A classe PHP já adiciona 'relative' e 'overflow-hidden' */
            /* Garante que o pseudo-elemento seja posicionado corretamente e cortado */
            background: linear-gradient(to right, #f97316 0%, rgba(249, 115, 22, 0.4) 100%); /* Degradê da esquerda para direita suavizando */
            box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4); /* Sombra laranja para efeito de elevação/neon */
            transition: background 0.3s ease, box-shadow 0.3s ease; /* Transição suave */
        }

        /* Pseudo-elemento para a animação da barra laranja neon no lado direito */
        .admin-sidebar-active-link::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0; /* Posição à direita do link */
            height: 100%; /* Altura total do link */
            width: 6px; /* Aumenta ligeiramente a largura para um efeito mais pronunciado */
            background-color: #f97316; /* Laranja Starfy, vibrante */
            box-shadow: 0 0 10px #f97316, 0 0 20px #f97316; /* Efeito de neon glow */
            animation: slideInRight 0.3s ease-out forwards; /* Animação ao carregar */
            transform: translateX(0%); /* Estado final da animação (visível) */
        }
    </style>
</head>
<body class="bg-gray-50 font-sans flex flex-col min-h-screen">
    <!-- Cabeçalho Fixo do Topo -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-white shadow-md p-4 flex items-center justify-between h-[80px]">
        <div class="flex items-center">
            <!-- Botão de Hamburger para Mobile -->
            <button id="admin-sidebar-toggle" class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 mr-2">
                <i data-lucide="menu" class="w-6 h-6 text-gray-500"></i>
            </button>
            <img src="https://i.ibb.co/2YRWNQw7/1757909548831-Photoroom.png" alt="Logotipo" class="h-12 w-auto">
            <span class="ml-4 text-lg font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full hidden sm:block">PAINEL ADMIN</span>
        </div>
        
        <div class="flex items-center space-x-3">
            <!-- Apenas o botão de Sair permanece -->
            <a href="logout.php" class="text-red-500 hover:text-red-700 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100" title="Sair">
                <i data-lucide="log-out" class="w-5 h-5"></i>
            </a>
        </div>
    </header>

    <!-- Menu Lateral do Admin -->
    <aside id="admin-sidebar" class="fixed top-[80px] left-0 bottom-0 z-40 transform -translate-x-full transition-transform duration-300 w-full max-w-xs bg-white shadow-md flex flex-col overflow-y-auto">
        <nav class="mt-4 flex-grow">
            <a href="admin.php?pagina=admin_dashboard" class="flex items-center space-x-3 p-3 rounded-lg mx-2 transition-colors duration-200 <?php echo $pagina_admin == 'admin_dashboard' ? $active_class : $inactive_class; ?>">
                <i data-lucide="bar-chart-3" class="w-5 h-5"></i>
                <span>Dashboard Admin</span>
            </a>
            
            <!-- Gerenciamento de Usuários (Links Separados) -->
            <div class="mt-2">
                <a href="admin.php?pagina=admin_usuarios&role=all" class="flex items-center space-x-3 p-3 rounded-lg mx-2 transition-colors duration-200 
                    <?php echo ($pagina_admin == 'admin_usuarios' && $role_filter == 'all') ? $active_class : $inactive_class; ?>">
                    <i data-lucide="users" class="w-5 h-5"></i>
                    <span>Todos os Usuários</span>
                </a>
                <a href="admin.php?pagina=admin_usuarios&role=infoproducer" class="flex items-center space-x-3 p-3 rounded-lg mx-2 mt-1 transition-colors duration-200 
                    <?php echo ($pagina_admin == 'admin_usuarios' && $role_filter == 'infoproducer') ? $active_class : $inactive_class; ?>">
                    <i data-lucide="award" class="w-5 h-5"></i>
                    <span>Gerenciar Infoprodutores</span>
                </a>
                <a href="admin.php?pagina=admin_usuarios&role=client" class="flex items-center space-x-3 p-3 rounded-lg mx-2 mt-1 transition-colors duration-200 
                    <?php echo ($pagina_admin == 'admin_usuarios' && $role_filter == 'client') ? $active_class : $inactive_class; ?>">
                    <i data-lucide="handshake" class="w-5 h-5"></i>
                    <span>Gerenciar Clientes Finais</span>
                </a>
            </div>

            <a href="admin.php?pagina=admin_relatorios" class="flex items-center space-x-3 p-3 rounded-lg mx-2 mt-2 transition-colors duration-200 <?php echo $pagina_admin == 'admin_relatorios' ? $active_class : $inactive_class; ?>">
                <i data-lucide="file-text" class="w-5 h-5"></i>
                <span>Relatórios Detalhados</span>
            </a>
            <!-- NOVO: Link para Configurações SMTP -->
            <a href="admin.php?pagina=admin_smtp_config" class="flex items-center space-x-3 p-3 rounded-lg mx-2 mt-2 transition-colors duration-200 <?php echo $pagina_admin == 'admin_smtp_config' ? $active_class : $inactive_class; ?>">
                <i data-lucide="mail" class="w-5 h-5"></i>
                <span>Configurações SMTP</span>
            </a>
        </nav>
        <div class="p-4 border-t">
            <!-- Conteúdo do footer do aside, se houver -->
        </div>
    </aside>

    <!-- Overlay para o menu mobile -->
    <div id="admin-sidebar-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-30 hidden"></div>

    <!-- Conteúdo Principal -->
    <main class="flex-1 mt-[80px] p-6 lg:p-8 overflow-y-auto">
        <?php
        if (in_array($pagina_admin, $paginas_permitidas_admin) && file_exists($pagina_admin . '.php')) {
            include $pagina_admin . '.php';
        } else {
            echo "<div class='text-center p-10 bg-white rounded-lg shadow'><h1 class='text-4xl font-bold'>Erro 404</h1><p class='mt-2'>Página não encontrada no painel administrativo.</p></div>";
        }
        ?>
    </main>

    <!-- Floating Live Notification (Mantido para o admin ver, se quiser, mas não ligado ao sininho) -->
    <div id="live-notification-container" class="live-notification-container">
        <img id="live-notification-product-image" src="https://i.ibb.co/gbNBTgDD/1757909548831.jpg" alt="Produto" class="live-notification-product-image">
        <div>
            <p class="text-sm font-semibold text-gray-900" id="live-notification-message"></p>
            <p class="text-xs text-gray-500 mt-1" id="live-notification-details"></p>
        </div>
        <audio id="cash-register-sound" class="cash-register-sound" src="assets/cash_register.mp3" preload="auto"></audio>
    </div>

    <script>
        // --- Lógica de Responsividade do Menu Lateral ---
        const adminSidebarToggle = document.getElementById('admin-sidebar-toggle');
        const adminSidebar = document.getElementById('admin-sidebar');
        const adminSidebarOverlay = document.getElementById('admin-sidebar-overlay');
        const body = document.body;

        function toggleAdminSidebar() {
            adminSidebar.classList.toggle('-translate-x-full');
            adminSidebar.classList.toggle('open');
            adminSidebarOverlay.classList.toggle('hidden');
            adminSidebarOverlay.classList.toggle('open');
            body.classList.toggle('overflow-hidden');
        }

        adminSidebarToggle.addEventListener('click', toggleAdminSidebar);
        adminSidebarOverlay.addEventListener('click', toggleAdminSidebar);

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) { // Desktop breakpoint
                adminSidebar.classList.remove('-translate-x-full', 'open');
                adminSidebarOverlay.classList.add('hidden'); // Ensure overlay is hidden
                adminSidebarOverlay.classList.remove('open');
                body.classList.remove('overflow-hidden');
            } else { // Mobile breakpoint
                // Ensure desktop classes are not present if resized back to mobile
                // and sidebar should be hidden by default unless opened manually
                if (!adminSidebar.classList.contains('open')) {
                    adminSidebar.classList.add('-translate-x-full');
                }
            }
        });


        // --- Lógica de Notificações Flutuantes (Live Notifications) ---
        const liveNotificationContainer = document.getElementById('live-notification-container');
        const liveNotificationMessage = document.getElementById('live-notification-message');
        const liveNotificationDetails = document.getElementById('live-notification-details');
        const liveNotificationProductImage = document.getElementById('live-notification-product-image');
        const cashRegisterSound = document.getElementById('cash-register-sound');

        let audioContextResumed = false;
        let notificationQueue = [];
        let isDisplayingNotification = false;

        function tryResumeAudioContext() {
            if (!audioContextResumed && cashRegisterSound) {
                const originalVolume = cashRegisterSound.volume; // Store original volume
                cashRegisterSound.volume = 0; // Set volume to 0 for silent unlock

                if (!cashRegisterSound.src || cashRegisterSound.readyState < 2) {
                    cashRegisterSound.load();
                    cashRegisterSound.oncanplaythrough = () => {
                         cashRegisterSound.play().then(() => {
                            audioContextResumed = true;
                            cashRegisterSound.pause();
                            cashRegisterSound.currentTime = 0;
                            cashRegisterSound.volume = originalVolume; // Restore original volume
                        }).catch(e => {
                            console.warn("Autoplay prevented after load, waiting for user interaction.", e);
                            cashRegisterSound.volume = originalVolume; // Restore original volume on error
                        });
                        cashRegisterSound.oncanplaythrough = null;
                    };
                    return;
                }
                cashRegisterSound.play().then(() => {
                    audioContextResumed = true;
                    cashRegisterSound.pause();
                    cashRegisterSound.currentTime = 0;
                    cashRegisterSound.volume = originalVolume; // Restore original volume
                }).catch(e => {
                    console.warn("Autoplay was prevented, waiting for user interaction.", e);
                    cashRegisterSound.volume = originalVolume; // Restore original volume on error
                });
            }
        }
        document.addEventListener('click', tryResumeAudioContext, { once: true });
        document.addEventListener('keydown', tryResumeAudioContext, { once: true });

        async function fetchLiveNotifications() {
            try {
                const response = await fetch('notifications_api.php?action=get_live_notifications');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();

                if (data.live_notifications && data.live_notifications.length > 0) {
                    for (const notification of data.live_notifications) {
                        notificationQueue.push(notification); 
                        await fetch('notifications_api.php?action=mark_as_displayed_live', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: `notification_id=${notification.id}`
                        });
                    }
                    processNotificationQueue();
                }
            } catch (error) {
                console.error('Error fetching live notifications:', error);
            }
        }

        function processNotificationQueue() {
            if (!isDisplayingNotification && notificationQueue.length > 0) {
                isDisplayingNotification = true;
                const notification = notificationQueue.shift();
                _actualDisplayLiveNotification(notification);
            }
        }

        function _actualDisplayLiveNotification(notification) {
            const allowedTypes = ['Compra Aprovada', 'Pix Gerado', 'Boleto Gerado'];
            if (!allowedTypes.includes(notification.tipo)) {
                isDisplayingNotification = false;
                processNotificationQueue();
                return;
            }

            let messageText = '';
            let detailsText = '';
            const value = parseFloat(notification.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const productName = notification.produto_nome || 'Um produto';

            switch (notification.tipo) {
                case 'Compra Aprovada':
                    messageText = `Nova Compra Aprovada!`;
                    detailsText = `${productName} por ${value} (${notification.metodo_pagamento})`;
                    break;
                case 'Pix Gerado':
                    messageText = `Pix Gerado!`;
                    detailsText = `${productName} por ${value}`;
                    break;
                case 'Boleto Gerado':
                    messageText = `Boleto Gerado!`;
                    detailsText = `${productName} por ${value}`;
                    break;
                default:
                    isDisplayingNotification = false;
                    processNotificationQueue();
                    return;
            }

            liveNotificationMessage.textContent = messageText;
            liveNotificationDetails.textContent = detailsText;
            // Modificação: Usa a foto do produto se disponível, caso contrário, usa a imagem padrão
            liveNotificationProductImage.src = notification.produto_foto ? 'uploads/' + notification.produto_foto : 'https://i.ibb.co/gbNBTgDD/1757909548831.jpg';
            
            if (cashRegisterSound && audioContextResumed) {
                cashRegisterSound.load();
                cashRegisterSound.currentTime = 0;
                cashRegisterSound.volume = 1; // Ensure volume is audible for real notifications
                cashRegisterSound.play().catch(e => console.error("Error playing sound:", e));
            }

            liveNotificationContainer.classList.add('show');
            setTimeout(() => {
                liveNotificationContainer.classList.remove('show');
                isDisplayingNotification = false;
                processNotificationQueue();
            }, 8000);
        }
        
        // Polling for live notifications (more frequent)
        fetchLiveNotifications();
        setInterval(fetchLiveNotifications, 10000);

    </script>
    <script>
        // Move lucide.createIcons() to the very end of the body to ensure all elements are parsed.
        lucide.createIcons();
    </script>
    <script>
        // Registra o Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(registration => {
                    console.log('ServiceWorker registrado com sucesso: ', registration.scope);
                }, err => {
                    console.log('Falha no registro do ServiceWorker: ', err);
                });
            });
        }
    </script>
</body>
</html>