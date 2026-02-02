<?php
// Start Session
session_start();

// Default Page
$page = isset($_GET['page']) ? $_GET['page'] : 'dashboard';

// Clean page string to prevent traversal
$page = preg_replace('/[^a-zA-Z0-9_\-\/]/', '', $page);

// Determine Mode (Seller vs Admin) - leveraging session or default
// For demo purposes, we will toggle this via a GET parameter or Session
if (isset($_GET['mode'])) {
    $_SESSION['user_mode'] = $_GET['mode']; // 'seller' or 'admin'
}
$user_mode = isset($_SESSION['user_mode']) ? $_SESSION['user_mode'] : 'seller';

// Include Database Connection
if (file_exists('config.php')) {
    include 'config.php';
} elseif (file_exists('../config.php')) {
    include '../config.php';
} else {
    // Fallback or empty conn for UI testing
    $conn = null;
}


// Base layout
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MentalPag - GatteClone V11</title>

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Google Fonts: Inter -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>

    <!-- Custom Styles for GatteFlow Look -->
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f3f4f6;
            /* Gray-100 */
        }

        /* GatteFlow Blue */
        :root {
            --primary: #0ea5e9;
            /* Sky-500 */
            --primary-dark: #0284c7;
            /* Sky-600 */
            --sidebar-bg: #ffffff;
            --active-item: #e0f2fe;
            /* Sky-100 */
            --active-text: #0ea5e9;
        }

        .text-primary {
            color: var(--primary);
        }

        .bg-primary {
            background-color: var(--primary);
        }

        .bg-active {
            background-color: var(--active-item);
        }

        .text-active {
            color: var(--active-text);
        }

        /* Smooth transitions */
        .transition-all {
            transition-property: all;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            transition-duration: 150ms;
        }

        /* Custom Scrollbar for inner content */
        .custom-scroll::-webkit-scrollbar {
            width: 6px;
        }

        .custom-scroll::-webkit-scrollbar-track {
            background: #f1f1f1;
        }

        .custom-scroll::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
        }

        /* Card Hover Effects */
        .hover-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
    </style>
</head>

<body class="text-gray-600 antialiased h-screen flex overflow-hidden">

    <!-- Sidebar -->
    <?php include 'includes/sidebar.php'; ?>

    <!-- Main Content Wrapper -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">

        <!-- Header -->
        <?php include 'includes/header.php'; ?>

        <!-- Main Content Area -->
        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 px-6 py-6 custom-scroll">
            <?php
            // Dynamic routing
            $file_path = "pages/{$page}.php";
            if (file_exists($file_path)) {
                include $file_path;
            } else {
                echo "<div class='text-center mt-20'><h2 class='text-2xl font-bold text-gray-400'>Página não encontrada: " . htmlspecialchars($page) . "</h2></div>";
            }
            ?>
        </main>
    </div>

    <!-- Global Modals -->
    <?php include 'includes/modal_new_product.php'; ?>

    <!-- Initialize Icons -->
    <script>
        lucide.createIcons();
    </script>
</body>

</html>