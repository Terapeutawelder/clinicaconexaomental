<?php
// Este arquivo é incluído a partir do index.php,
// então a verificação de login e a conexão com o banco ($pdo) já existem.

// Obter o ID do usuário logado
$usuario_id_logado = $_SESSION['id'] ?? 0;

// Se por algum motivo o ID do usuário não estiver definido, redireciona para o login
if ($usuario_id_logado === 0) {
    header("location: login.php");
    exit;
}

$mensagem = '';

// Pega a mensagem da sessão, se houver, e depois limpa
if (isset($_SESSION['flash_message'])) {
    $mensagem = $_SESSION['flash_message'];
    unset($_SESSION['flash_message']);
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Integrações</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <style>
        body { 
            font-family: 'Plus Jakarta Sans', sans-serif; 
            background-color: #f8fafc; /* Slate 50 */
        }
        
        /* Animações e Efeitos */
        .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
        
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body class="min-h-screen text-slate-800 pb-20">

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
                <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                    Central de Integrações
                </h1>
                <p class="mt-2 text-slate-500 text-lg">Conecte sua plataforma a ferramentas externas e automatize seus processos.</p>
            </div>
        </div>

        <!-- Mensagens Flutuantes -->
        <?php if(!empty($mensagem)): ?>
            <div id='toast-msg' class='fixed top-5 right-5 z-50 animate-fade-in flex items-center w-full max-w-xs p-4 text-slate-600 bg-white rounded-lg shadow-xl border border-slate-100' role='alert'>
                <div class='inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-blue-500 bg-blue-100 rounded-lg'>
                    <i data-lucide='info' class='w-5 h-5'></i>
                </div>
                <div class='ml-3 text-sm font-medium'><?php echo $mensagem; ?></div>
                <button type='button' class='ml-auto -mx-1.5 -my-1.5 bg-white text-slate-400 hover:text-slate-900 rounded-lg focus:ring-2 focus:ring-slate-300 p-1.5 hover:bg-slate-100 inline-flex h-8 w-8' onclick='this.parentElement.remove()'>
                    <i data-lucide='x' class='w-4 h-4'></i>
                </button>
            </div>
        <?php endif; ?>

        <!-- Grid de Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <!-- Card Webhooks -->
            <a href="index.php?pagina=integracoes_webhooks" class="card-hover group relative bg-white border border-slate-200 rounded-2xl p-8 flex flex-col justify-between h-full hover:border-emerald-300 overflow-hidden cursor-pointer">
                <!-- Background Decoration -->
                <div class="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>

                <div class="relative z-10">
                    <div class="flex items-center gap-5 mb-6">
                        <div class="h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm group-hover:bg-emerald-100 transition-colors">
                            <img src="https://res.cloudinary.com/hevo/image/upload/v1636351137/hevo-learn/webhooks.png" alt="Webhook" class="h-10 w-10 object-contain">
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Webhooks</h2>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 mt-1">
                                Automação
                            </span>
                        </div>
                    </div>
                    
                    <p class="text-slate-500 text-base leading-relaxed mb-8">
                        Envie dados de vendas em tempo real para outras plataformas como Zapier, Make.com ou seu próprio sistema. Notifique eventos instantaneamente.
                    </p>
                </div>

                <div class="relative z-10 mt-auto pt-6 border-t border-slate-100">
                    <span class="flex items-center text-sm font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors">
                        Configurar Webhooks <i data-lucide="arrow-right" class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"></i>
                    </span>
                </div>
            </a>

            <!-- Card UTMfy -->
            <a href="index.php?pagina=integracoes_utmfy" class="card-hover group relative bg-white border border-slate-200 rounded-2xl p-8 flex flex-col justify-between h-full hover:border-blue-300 overflow-hidden cursor-pointer">
                <!-- Background Decoration -->
                <div class="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>

                <div class="relative z-10">
                    <div class="flex items-center gap-5 mb-6">
                        <div class="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm group-hover:bg-blue-100 transition-colors">
                            <img src="https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/a5/ca/21/a5ca2115-6efd-59cd-6724-475031a69400/AppIcon-1x_U007emarketing-0-8-0-85-220-0.png/434x0w.webp" alt="UTMfy" class="h-10 w-10 object-contain rounded-md">
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">UTMfy</h2>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                Rastreamento
                            </span>
                        </div>
                    </div>
                    
                    <p class="text-slate-500 text-base leading-relaxed mb-8">
                        Integre com a UTMfy para rastrear suas campanhas de marketing (Facebook Ads, Google Ads) e descobrir a origem exata de cada venda.
                    </p>
                </div>

                <div class="relative z-10 mt-auto pt-6 border-t border-slate-100">
                    <span class="flex items-center text-sm font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                        Configurar UTMfy <i data-lucide="arrow-right" class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"></i>
                    </span>
                </div>
            </a>

        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            lucide.createIcons();
            
            // Remove toast automaticamente após 4 segundos
            const toast = document.getElementById('toast-msg');
            if(toast) {
                setTimeout(() => {
                    toast.style.opacity = '0';
                    toast.style.transition = 'opacity 0.5s ease';
                    setTimeout(() => toast.remove(), 500);
                }, 4000);
            }
        });
    </script>
</body>
</html>
