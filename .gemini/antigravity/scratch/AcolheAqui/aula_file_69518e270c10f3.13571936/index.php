<?php
// Inclui o arquivo de configuração que inicia a sessão
require_once 'config.php';

// Verifica se o usuário está logado, se não, redireciona para a página de login
if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    header("location: login.php");
    exit;
}

// Se o usuário logado for um administrador, redireciona para o painel de administração.
// Isso garante que admins não acessem o painel de usuário/infoprodutor.
if (isset($_SESSION["tipo"]) && $_SESSION["tipo"] === 'admin') {
    header("location: admin.php");
    exit;
}

// Se o usuário logado for um membro (cliente final), redireciona para a área de membros.
// Isso impede que clientes acessem o painel do infoprodutor.
if (isset($_SESSION["tipo"]) && $_SESSION["tipo"] === 'usuario') {
    header("location: member_area_dashboard.php");
    exit;
}

// A página index.php é agora o dashboard unificado para infoprodutores,
// sem redirecionamento condicional para mobile_dashboard_charts.php
// A distinção entre desktop e PWA será apenas na experiência do navegador/aplicativo instalado,
// mas a base do conteúdo será a mesma.
// A remoção de $_SESSION['is_pwa_session'] e sua lógica relacionada é feita.


// Fetch user data for display in the header
$user_id_display = $_SESSION['id'];
$user_name_display = htmlspecialchars($_SESSION['usuario']); // Fallback to session username/email
$foto_perfil = null;

try {
    $stmt = $pdo->prepare("SELECT nome, foto_perfil FROM usuarios WHERE id = ?");
    $stmt->execute([$user_id_display]);
    $user_data = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user_data) {
        // Prefer the 'nome' from DB if available, otherwise use session 'usuario'
        $user_name_display = htmlspecialchars($user_data['nome'] ?? $_SESSION['usuario']);
        $foto_perfil = htmlspecialchars($user_data['foto_perfil'] ?? '');
    }
} catch (PDOException $e) {
    // Log the error, but don't stop the page from loading
    error_log("Error fetching user data for index.php: " . $e->getMessage());
}


// Define a página padrão
$pagina = isset($_GET['pagina']) ? $_GET['pagina'] : 'dashboard';

// Lista de páginas permitidas para segurança
$paginas_permitidas = ['dashboard', 'produtos', 'configuracoes', 'checkout_editor', 'vendas', 'area_membros', 'gerenciar_curso', 'profile', 'infoprodutor_member_offers', 'starfy_track', 'integracoes', 'integracoes_webhooks', 'integracoes_utmfy', 'jornada_starfy', 'clonar_site'];

// Lógica para link ativo do menu
// NOVO: Cores e classes para o efeito de laranja neon e animação
$active_class = 'text-white font-semibold relative overflow-hidden sidebar-active-link'; // 'bg-orange-500' removido
$inactive_class = 'text-gray-600 hover:bg-orange-100 hover:text-orange-700';

// Inicia o buffer de saída. Isso captura todo o HTML que seria gerado,
// permitindo que a página 'gerenciar_curso.php' use a função header() para redirecionar sem erros.
ob_start();

// Exibe a mensagem flash (se existir) dentro do buffer
if (isset($_SESSION['flash_message']) && !empty($_SESSION['flash_message'])) {
    echo '<div class="mb-6">';
    echo $_SESSION['flash_message'];
    echo '</div>';
    unset($_SESSION['flash_message']); // Limpa a mensagem após exibir
}

// Exibe mensagens de feedback do perfil (se existir)
if (isset($_SESSION['profile_feedback_for_js']) && !empty($_SESSION['profile_feedback_for_js'])) {
    $profile_messages_html = '';
    foreach ($_SESSION['profile_feedback_for_js'] as $msg) {
        $profile_messages_html .= '<p>' . htmlspecialchars($msg) . '</p>';
    }
    echo '<div class="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">';
    echo $profile_messages_html;
    echo '</div>';
    unset($_SESSION['profile_feedback_for_js']);
}

// Inclui a página solicitada (como 'gerenciar_curso.php') dentro do buffer
if (in_array($pagina, $paginas_permitidas) && file_exists($pagina . '.php')) {
    include $pagina . '.php';
} else {
    // Se a página não for encontrada, mostra um erro 404
    echo "<div class='text-center p-10 bg-white rounded-lg shadow'><h1 class='text-4xl font-bold'>Erro 404</h1><p class='mt-2'>Página não encontrada.</p></div>";
}

// Captura todo o conteúdo do buffer para a variável $page_content
$page_content = ob_get_clean();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel do Usuário</title>
    
    <!-- PWA Tags -->
    <meta name="theme-color" content="#f97316">
    <link rel="manifest" href="manifest.json">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Plataforma">
    <link rel="apple-touch-icon" href="https://i.ibb.co/gbNBTgDD/1757909548831.jpg">

    <script src="https://cdn.tailwindcss.com"></script>
    <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            orange: {
              50: '#fff7ed',
              100: '#ffedd5',
              200: '#fed7aa',
              300: '#fdba74',
              400: '#fb923c',
              500: '#f97316',
              600: '#ea580c',
              700: '#c2410c',
              800: '#9a3412',
              900: '#7c2d12',
            },
          }
        }
      }
    }
    </script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="stylesheet" href="style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        /* Estilos para o sino de notificações */
        .notification-bell-container {
            position: relative;
            cursor: pointer;
            padding: 8px;
            border-radius: 9999px; /* Full rounded */
            transition: background-color 0.2s;
        }
        .notification-bell-container:hover {
            background-color: #f3f4f6; /* Gray-100 */
        }
        .notification-badge {
            position: absolute;
            top: 0;
            right: 0;
            background-color: #f97316; /* Orange-500 */
            color: white;
            font-size: 0.75rem; /* text-xs */
            font-weight: 700; /* font-bold */
            border-radius: 9999px; /* Full rounded */
            padding: 0.15rem 0.4rem;
            min-width: 1.25rem; /* w-5 h-5 */
            height: 1.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            transform: translate(25%, -25%);
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            transition: background-color 0.2s;
        }
        .notification-popup {
            position: fixed;
            top: 80px; /* Abaixo do header */
            right: 0;
            width: 320px; /* Adjust as needed */
            height: calc(100vh - 80px); /* Fill remaining height */
            background-color: white;
            box-shadow: -4px 0 15px rgba(0,0,0,0.1);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
            display: flex;
            flex-direction: column;
        }
        .notification-popup.open {
            transform: translateX(0);
        }
        .notification-header {
            padding: 1rem;
            border-bottom: 1px solid #e5e7eb; /* gray-200 */
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .notification-list {
            flex-grow: 1;
            overflow-y: auto;
        }
        .notification-item {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #f3f4f6; /* gray-100 */
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            transition: background-color 0.2s;
        }
        .notification-item:hover {
            background-color: #f9fafb; /* gray-50 */
        }
        .notification-item.unread {
            background-color: #fff7ed; /* orange-50 */
            font-weight: 500;
        }
        .notification-icon {
            flex-shrink: 0;
            width: 1.25rem;
            height: 1.25rem;
            color: #f97316; /* orange-500 */
            margin-top: 2px;
        }
        .notification-item-message {
            flex-grow: 1;
            font-size: 0.875rem; /* text-sm */
            line-height: 1.4;
            color: #374151; /* gray-700 */
        }
        .notification-item-time {
            flex-shrink: 0;
            font-size: 0.75rem; /* text-xs */
            color: #6b7280; /* gray-500 */
            white-space: nowrap;
        }
        .empty-notifications {
            padding: 1.5rem;
            text-align: center;
            color: #6b7280; /* gray-500 */
        }

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
            border: 1px solid #e5e7eb;
        }
        .cash-register-sound {
            display: none; /* Hide audio element */
        }

        /* Responsividade para o menu lateral */
        #sidebar {
            width: 100%;
            max-width: 280px; /* Ajuste para um tamanho mais comum em mobile */
            transform: translateX(-100%); /* Escondido por padrão */
        }
        #sidebar.open {
            transform: translateX(0); /* Visível quando aberto */
        }
        #sidebar-overlay {
            display: none; /* Escondido por padrão */
        }
        #sidebar-overlay.open {
            display: block; /* Visível quando o menu está aberto */
        }
        /* Ajuste do conteúdo principal para telas menores */
        main {
            margin-left: 0; /* Remove a margem fixa em mobile */
        }
        /* Oculta o botão de toggle em telas maiores */
        #sidebar-toggle {
            display: flex; /* Exibe por padrão em mobile */
        }

        /* Media query para telas maiores (desktop) */
        @media (min-width: 768px) { /* md breakpoint */
            #sidebar {
                transform: translateX(0); /* Sempre visível em desktop */
                width: 256px; /* md:w-64 */
            }
            #sidebar-toggle {
                display: none; /* Oculta em desktop */
            }
            main {
                margin-left: 256px; /* md:ml-64 */
            }
            #sidebar-overlay {
                display: none; /* Nunca visível em desktop */
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

        /* Estilo para o link ativo do menu lateral (a classe sidebar-active-link é adicionada via PHP) */
        .sidebar-active-link {
            /* A classe PHP já adiciona 'relative' e 'overflow-hidden' */
            /* Garante que o pseudo-elemento seja posicionado corretamente e cortado */
            background: linear-gradient(to right, #f97316 0%, rgba(249, 115, 22, 0.4) 100%); /* Degradê da direita para esquerda suavizando */
            box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4); /* Sombra laranja para efeito de elevação/neon */
            transition: background 0.3s ease, box-shadow 0.3s ease; /* Transição suave */
        }

        /* Pseudo-elemento para a animação da barra laranja neon no lado direito */
        .sidebar-active-link::after {
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
            <img src="https://i.ibb.co/2YRWNQw7/1757909548831-Photoroom.png" alt="Logotipo" class="h-12 w-auto">
        </div>
        
        <div class="flex items-center space-x-3">
            <!-- Botão de Hamburger para Mobile -->
            <button id="sidebar-toggle" class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <i data-lucide="menu" class="w-6 h-6 text-gray-500"></i>
            </button>

            <!-- Sininho de Notificações -->
            <div id="notification-bell" class="notification-bell-container flex items-center justify-center relative">
                <i data-lucide="bell" id="bell-icon" class="w-6 h-6 text-gray-400 transition-colors duration-200"></i>
                <span id="notification-badge" class="notification-badge hidden">0</span>
            </div>

            <a href="index.php?pagina=profile" class="flex items-center space-x-3 group hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" title="Meu Perfil">
                <?php if (!empty($foto_perfil)): ?>
                    <img src="uploads/<?php echo $foto_perfil; ?>" alt="Foto de Perfil" class="w-10 h-10 rounded-full object-cover border-2 border-orange-500 shadow-sm">
                <?php else: ?>
                    <div class="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 text-lg font-bold border-2 border-orange-400 shadow-sm">
                        <?php echo strtoupper(substr($user_name_display, 0, 1)); ?>
                    </div>
                <?php endif; ?>
                <span class="text-sm font-semibold text-gray-800 hidden sm:block"><?php echo $user_name_display; ?></span>
            </a>
            <a href="logout.php" class="text-red-500 hover:text-red-700 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100" title="Sair">
                <i data-lucide="log-out" class="w-5 h-5"></i>
            </a>
        </div>
    </header>

    <!-- Popup de Notificações Lateral -->
    <div id="notification-popup" class="notification-popup">
        <div class="notification-header">
            <h3 class="text-lg font-bold text-gray-800">Notificações</h3>
            <button id="close-notification-popup" class="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>
        <div id="notification-list" class="notification-list">
            <div class="empty-notifications" id="empty-notifications-state">
                <i data-lucide="bell-off" class="mx-auto w-12 h-12 text-gray-300 mb-2"></i>
                <p class="text-sm">Nenhuma notificação recente.</p>
            </div>
            <!-- Notifications will be loaded here by JavaScript -->
        </div>
    </div>


    <!-- Menu Lateral (Sidebar) -->
    <aside id="sidebar" class="fixed top-[80px] left-0 bottom-0 z-40 transform -translate-x-full transition-transform duration-300 w-full max-w-xs md:translate-x-0 md:w-64 bg-white shadow-md flex flex-col overflow-y-auto">
        <nav class="mt-4 flex-grow">
            <a href="index.php?pagina=dashboard" class="flex items-center space-x-3 p-3 rounded-lg mx-2 transition-colors duration-200 <?php echo $pagina == 'dashboard' ? $active_class : $inactive_class; ?>">
                <i data-lucide="layout-dashboard" class="w-5 h-5"></i>
                <span>Dashboard</span>
            </a>
            <!-- NOVO: Link para Jornada Starfy -->
            <a href="index.php?pagina=jornada_starfy" class="flex items-center space-x-3 p-3 rounded-lg mx-2 mt-2 transition-colors duration-200 <?php echo $pagina == 'jornada_starfy' ? $active_class : $inactive_class; ?>">
                <i data-lucide="rocket" class="w-5 h-5"></i>
                <span>Jornada Starfy</span>
            </a>
            <a href="index.php?pagina=vendas" class="flex items-center space-x-3 p-3 rounded-lg mx-2 mt-2 transition-colors duration-200 <?php echo $pagina == 'vendas' ? $active_class : $inactive_class; ?>">
                <i data-lucide="shopping-cart" class="w-5 h-5"></i>
                <span>Vendas</span>
            </a>
            <a href="index.php?pagina=produtos" class="flex items-center space-x-3 p-3 rounded-lg mx-2 mt-2 transition-colors duration-200 <?php echo ($pagina == 'produtos' || $pagina == 'checkout_editor') ? $active_class : $inactive_class; ?>">
                <i data-lucide="package" class="w-5 h-5"></i>
                <span>Produtos</span>
            </a>
            <!-- NOVO: Starfy Track -->
            <a href="index.php?pagina=starfy_track" class="flex items-center space-x-3 p-3 rounded-lg mx-2 mt-2 transition-colors duration-200 <?php echo $pagina == 'starfy_track' ? $active_class : $inactive_class; ?>">
                <i data-lucide="line-chart" class="w-5 h-5"></i>
                <span>Starfy Track</span>
            </a>
            <!-- NOVO: Link para Integrações -->
            <a href="index.php?pagina=integracoes" class="flex items-center space-x-3 p-3 rounded-lg mx-2 mt-2 transition-colors duration-200 
                <?php echo (in_array($pagina, ['integracoes', 'integracoes_webhooks', 'integracoes_utmfy'])) ? $active_class : $inactive_class; ?>">
                <i data-lucide="plug-zap" class="w-5 h-5"></i>
                <span>Integrações</span>
            </a>
            <!-- NOVO: Link para Clonar Site -->
            <a href="index.php?pagina=clonar_site" class="flex items-center space-x-3 p-3 rounded-lg mx-2 mt-2 transition-colors duration-200 <?php echo $pagina == 'clonar_site' ? $active_class : $inactive_class; ?>">
                <i data-lucide="copy-check" class="w-5 h-5"></i>
                <span>Clonar Site</span>
            </a>
            <!-- MODIFICADO: Agrupamento de Área de Membros -->
            <!-- Botão de dropdown removido, substituído por link direto -->
            <a href="index.php?pagina=area_membros" class="flex items-center space-x-3 p-3 rounded-lg mx-2 mt-2 transition-colors duration-200 <?php echo ($pagina == 'area_membros' || $pagina == 'gerenciar_curso' || $pagina == 'infoprodutor_member_offers') ? $active_class : $inactive_class; ?>">
                <i data-lucide="play-square" class="w-5 h-5"></i>
                <span>Área de Membros</span>
            </a>
            <!-- FIM DO MODIFICADO -->
            <a href="index.php?pagina=configuracoes" class="flex items-center space-x-3 p-3 rounded-lg mx-2 mt-2 transition-colors duration-200 <?php echo $pagina == 'configuracoes' ? $active_class : $inactive_class; ?>">
                <i data-lucide="settings" class="w-5 h-5"></i>
                <span>Configurações</span>
            </a>
            <?php // O link para o Painel Admin foi removido do painel de usuário, pois admins serão redirecionados diretamente. ?>
        </nav>
        <div class="p-4 border-t">
            <!-- Conteúdo do footer do aside, se houver -->
        </div>
    </aside>

    <!-- Overlay para o menu mobile -->
    <div id="sidebar-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-30 hidden"></div>

    <!-- Conteúdo Principal -->
    <main class="flex-1 md:ml-64 mt-[80px] p-6 lg:p-8 overflow-y-auto">
        <?php
        // Agora, simplesmente exibe o conteúdo que foi capturado no buffer
        echo $page_content;
        ?>
    </main>

    <!-- Floating Live Notification -->
    <div id="live-notification-container" class="live-notification-container">
        <!-- Substituído o ícone padrão pela URL fornecida -->
        <img id="live-notification-product-image" src="https://i.ibb.co/gbNBTgDD/1757909548831.jpg" alt="Notificação" class="live-notification-product-image">
        <div>
            <p class="text-sm font-semibold text-gray-900" id="live-notification-message"></p>
            <p class="text-xs text-gray-500 mt-1" id="live-notification-details"></p>
        </div>
        <audio id="cash-register-sound" class="cash-register-sound" src="assets/cash_register.mp3" preload="auto"></audio>
    </div>

    <script>
        // Move lucide.createIcons() to the very end of the body to ensure all elements are parsed.
        lucide.createIcons();

        // --- Lógica de Responsividade do Menu Lateral ---
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        const body = document.body;

        function toggleSidebar() {
            sidebar.classList.toggle('-translate-x-full');
            sidebar.classList.toggle('open'); // Adiciona a classe open para controle de visibilidade
            sidebarOverlay.classList.toggle('hidden');
            sidebarOverlay.classList.toggle('open'); // Adiciona a classe open ao overlay
            body.classList.toggle('overflow-hidden'); // Previne o scroll do body quando o sidebar está aberto
        }

        sidebarToggle.addEventListener('click', toggleSidebar);
        sidebarOverlay.addEventListener('click', toggleSidebar); // Fechar o sidebar ao clicar no overlay

        // Close sidebar if window resized to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) { // Tailwind's 'md' breakpoint
                sidebar.classList.remove('-translate-x-full', 'open');
                sidebarOverlay.classList.add('hidden', 'open');
                body.classList.remove('overflow-hidden');
            }
        });

        // --- Lógica de Notificações ---
        const notificationBell = document.getElementById('notification-bell');
        const bellIcon = document.getElementById('bell-icon');
        const notificationBadge = document.getElementById('notification-badge');
        const notificationPopup = document.getElementById('notification-popup');
        const closePopupBtn = document.getElementById('close-notification-popup');
        const notificationList = document.getElementById('notification-list');
        const emptyNotificationsState = document.getElementById('empty-notifications-state');
        // Floating Live Notification elements
        const liveNotificationContainer = document.getElementById('live-notification-container');
        const liveNotificationMessage = document.getElementById('live-notification-message');
        const liveNotificationDetails = document.getElementById('live-notification-details');
        const liveNotificationProductImage = document.getElementById('live-notification-product-image');
        const cashRegisterSound = document.getElementById('cash-register-sound');

        // Flag to prevent repeated attempts to resume audio context
        let audioContextResumed = false;
        // Queue for live notifications
        let notificationQueue = [];
        let isDisplayingNotification = false;

        // Function to attempt to resume audio context (unlock audio playback)
        function tryResumeAudioContext() {
            if (!audioContextResumed && cashRegisterSound) {
                // Store original volume
                const originalVolume = cashRegisterSound.volume;
                // Set volume to 0 for silent unlock attempt
                cashRegisterSound.volume = 0;

                // Ensure the audio element has a valid source and is loaded
                if (!cashRegisterSound.src || cashRegisterSound.readyState < 2) {
                    cashRegisterSound.load();
                    // Wait for it to load, then try to play (or rely on next interaction)
                    cashRegisterSound.oncanplaythrough = () => {
                         cashRegisterSound.play().then(() => {
                            audioContextResumed = true;
                            cashRegisterSound.pause();
                            cashRegisterSound.currentTime = 0;
                            cashRegisterSound.volume = originalVolume; // Restore original volume
                        }).catch(e => {
                            console.warn("Autoplay was prevented after load, waiting for user interaction.", e);
                            cashRegisterSound.volume = originalVolume; // Restore original volume on error
                        });
                        cashRegisterSound.oncanplaythrough = null; // Remove handler
                    };
                    return; // Exit, will try again on next interaction/poll
                }

                // If audio is ready, try to play
                cashRegisterSound.play().then(() => {
                    audioContextResumed = true;
                    // Pause it immediately if it's just for unlocking
                    cashRegisterSound.pause();
                    cashRegisterSound.currentTime = 0;
                    cashRegisterSound.volume = originalVolume; // Restore original volume
                }).catch(e => {
                    console.warn("Autoplay was prevented, waiting for user interaction.", e);
                    cashRegisterSound.volume = originalVolume; // Restore original volume on error
                    // This error is expected if no user interaction yet.
                    // We don't mark audioContextResumed as true here.
                });
            }
        }

        // Attach audio context resume attempt to first user interaction
        // Using { once: true } ensures it runs only once per event type
        document.addEventListener('click', tryResumeAudioContext, { once: true });
        document.addEventListener('keydown', tryResumeAudioContext, { once: true });


        // CORREÇÃO: Função formatTimeAgo com mais granularidade e correção de fuso horário
        function formatTimeAgo(timestamp) {
            const now = new Date();
            // A API em 'notification.php' agora formata a data como 'YYYY-MM-DDTHH:MM:SS'.
            // Ao criar um objeto Date com esta string sem um fuso horário explícito ('Z' ou offset),
            // o navegador a interpreta no fuso horário LOCAL do usuário, conforme solicitado.
            const date = new Date(timestamp);
            const seconds = Math.floor((now - date) / 1000);

            if (seconds < 5) return "Agora mesmo";
            if (seconds < 60) return `Há ${seconds} segundo(s) atrás`;

            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return `Há ${minutes} minuto(s) atrás`;

            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `Há ${hours} hora(s) atrás`;

            const days = Math.floor(hours / 24);
            if (days < 30) return `Há ${days} dia(s) atrás`;

            const months = Math.floor(days / 30);
            if (months < 12) return `Há ${months} mês(es) atrás`;

            const years = Math.floor(days / 365);
            return `Há ${years} ano(s) atrás`;
        }


        async function fetchNotificationsCount() {
            try {
                const response = await fetch('notification.php?action=get_unread_count'); // Use notification.php
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                
                if (data.count > 0) {
                    notificationBadge.textContent = data.count;
                    notificationBadge.classList.remove('hidden');
                    bellIcon.classList.remove('text-gray-400');
                    bellIcon.classList.add('text-orange-500'); // Cor laranja para notificações
                } else {
                    notificationBadge.classList.add('hidden');
                    bellIcon.classList.remove('text-orange-500');
                    bellIcon.classList.add('text-gray-400'); // Cinza quando não há notificações
                }
            } catch (error) {
                console.error('Error fetching notification count:', error);
            }
        }

        async function fetchRecentNotifications() {
            try {
                const response = await fetch('notification.php?action=get_recent_notifications'); // Use notification.php
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();

                notificationList.innerHTML = ''; // Clear previous notifications
                if (data.notifications && data.notifications.length > 0) {
                    emptyNotificationsState.style.display = 'none';
                    data.notifications.forEach(notification => {
                        const item = document.createElement('a');
                        item.href = notification.link_acao || '#'; // If link_acao exists, make it clickable
                        item.target = notification.link_acao ? '_blank' : '_self'; // Open in new tab if there's a link
                        item.classList.add('notification-item');
                        if (notification.lida === 0) {
                            item.classList.add('unread');
                        }

                        // Determine icon based on type (example mapping)
                        let iconName = 'bell'; // Default icon
                        switch (notification.tipo) {
                            case 'Compra Aprovada': iconName = 'check-circle'; break;
                            case 'Pix Gerado': iconName = 'smartphone'; break;
                            case 'Boleto Gerado': iconName = 'file-text'; break;
                            case 'Pagamento Pendente': iconName = 'clock'; break;
                            case 'Pagamento Recusado': iconName = 'x-circle'; break;
                            case 'Reembolso': iconName = 'rotate-ccw'; break;
                            case 'Chargeback': iconName = 'shield-alert'; break;
                            default: iconName = 'info'; break;
                        }

                        item.innerHTML = `
                            <i data-lucide="${iconName}" class="notification-icon"></i>
                            <div class="notification-item-message">
                                <span class="font-semibold">${notification.tipo}:</span> ${notification.mensagem}
                            </div>
                            <span class="notification-item-time">${formatTimeAgo(notification.data_notificacao)}</span>
                        `;
                        notificationList.appendChild(item);
                    });
                    lucide.createIcons(); // Re-render Lucide icons for new content
                } else {
                    emptyNotificationsState.style.display = 'block';
                }
            } catch (error) {
                console.error('Error fetching recent notifications:', error);
                notificationList.innerHTML = `<div class="empty-notifications"><p class="text-red-500">Erro ao carregar notificações.</p></div>`;
            }
        }

        async function markNotificationsAsRead() {
            try {
                const response = await fetch('notification.php?action=mark_all_as_read', { method: 'POST' }); // Use notification.php
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                // No need to process response, just update count locally
                notificationBadge.classList.add('hidden');
                bellIcon.classList.remove('text-orange-500');
                bellIcon.classList.add('text-gray-400');
            } catch (error) {
                console.error('Error marking notifications as read:', error);
            }
        }

        // --- Lógica para Notificações Flutuantes (Live Notifications) ---
        async function fetchLiveNotifications() {
            try {
                const response = await fetch('notification.php?action=get_live_notifications'); // Use notification.php
                if (!response.ok) {
                    throw new Error('Failed to fetch live notifications');
                }
                const data = await response.json();

                if (data.live_notifications && data.live_notifications.length > 0) {
                    for (const notification of data.live_notifications) {
                        notificationQueue.push(notification); 
                        // Mark as displayed_live on the server immediately upon *receiving* it
                        // This prevents it from being fetched again in subsequent polls
                        await fetch('notification.php?action=mark_as_displayed_live', { // Use notification.php
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: `notification_id=${notification.id}`
                        });
                    }
                    // Once all fetched notifications are in the queue, process them
                    processNotificationQueue();
                    // Refresh main notification count after potentially 'consuming' new notifications
                    fetchNotificationsCount();
                }
            } catch (error) {
                console.error('Error fetching live notifications:', error);
            }
        }

        // Processes the notification queue
        function processNotificationQueue() {
            if (!isDisplayingNotification && notificationQueue.length > 0) {
                isDisplayingNotification = true;
                const notification = notificationQueue.shift(); // Get the next notification
                _actualDisplayLiveNotification(notification); // Call the internal displayer
            }
        }

        // Actual function to display a single live notification
        function _actualDisplayLiveNotification(notification) {
            const allowedTypes = ['Compra Aprovada', 'Pix Gerado', 'Boleto Gerado'];
            if (!allowedTypes.includes(notification.tipo)) {
                isDisplayingNotification = false; // Important: reset flag even if not displayed
                processNotificationQueue(); // Try next in queue
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
                    isDisplayingNotification = false; // Reset flag
                    processNotificationQueue(); // Try next in queue
                    return;
            }

            liveNotificationMessage.textContent = messageText;
            liveNotificationDetails.textContent = detailsText;
            
            // Set product image - NOW USING A STATIC ICON
            liveNotificationProductImage.src = 'https://i.ibb.co/gbNBTgDD/1757909548831.jpg'; // Static icon URL
            
            // Play sound
            if (cashRegisterSound && audioContextResumed) { // Only play if context is resumed
                cashRegisterSound.load(); // Ensure the audio is ready to play
                cashRegisterSound.currentTime = 0; // Reset sound to start
                cashRegisterSound.volume = 1; // Ensure volume is audible for real notifications
                cashRegisterSound.play().catch(e => console.error("Error playing sound, autoplay might be blocked:", e));
            }

            liveNotificationContainer.classList.add('show');
            setTimeout(() => {
                liveNotificationContainer.classList.remove('show');
                isDisplayingNotification = false; // Reset flag
                processNotificationQueue(); // Process the next one in queue
            }, 8000); // Display for 8 seconds
        }

        notificationBell.addEventListener('click', () => {
            notificationPopup.classList.toggle('open');
            if (notificationPopup.classList.contains('open')) {
                fetchRecentNotifications();
                markNotificationsAsRead();
            }
            // Attempt to resume audio context on bell click as well
            tryResumeAudioContext();
        });

        closePopupBtn.addEventListener('click', () => {
            notificationPopup.classList.remove('open');
        });

        // Close popup when clicking outside
        document.addEventListener('click', (event) => {
            if (!notificationPopup.contains(event.target) && !notificationBell.contains(event.target) && notificationPopup.classList.contains('open')) {
                notificationPopup.classList.remove('open');
            }
        });
        
        // Initial fetch and polling for count
        fetchNotificationsCount();
        setInterval(fetchNotificationsCount, 15000); // Poll every 15 seconds

        // Polling for live notifications (more frequent)
        fetchLiveNotifications();
        setInterval(fetchLiveNotifications, 10000);
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