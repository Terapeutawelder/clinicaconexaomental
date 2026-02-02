<?php
// Inclui o arquivo de configuração que inicia a sessão e a conexão PDO
require_once 'config.php';

// Proteção de página: verifica se o usuário está logado
if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    header("location: login.php");
    exit;
}

$mensagem = '';
$usuario_id_logado = $_SESSION['id']; // ID do usuário logado

// Fetch current user data
$stmt_user_data = $pdo->prepare("SELECT mp_public_key, mp_access_token, pushinpay_token FROM usuarios WHERE id = ?");
$stmt_user_data->execute([$usuario_id_logado]);
$user_data_fetched = $stmt_user_data->fetch(PDO::FETCH_ASSOC);

$mercado_pago_public_key = $user_data_fetched['mp_public_key'] ?? '';
$mercado_pago_access_token = $user_data_fetched['mp_access_token'] ?? '';
$pushinpay_token = $user_data_fetched['pushinpay_token'] ?? '';

$mp_configured = !empty($mercado_pago_access_token);
$pp_configured = !empty($pushinpay_token);

// --- CORREÇÃO DA URL DE WEBHOOK ---
$domainName = $_SERVER['HTTP_HOST'];
$scriptDir = dirname($_SERVER['PHP_SELF']);
$path = rtrim(str_replace('\\', '/', $scriptDir), '/');
$webhook_url = "https://" . $domainName . $path . '/notification.php';


// Salvar configurações
if (isset($_POST['salvar_configuracoes'])) {
    $public_key = $_POST['mercado_pago_public_key'] ?? '';
    $access_token = $_POST['mercado_pago_access_token'] ?? '';
    $pp_token = $_POST['pushinpay_token'] ?? '';

    try {
        $stmt = $pdo->prepare("UPDATE usuarios SET mp_public_key = ?, mp_access_token = ?, pushinpay_token = ? WHERE id = ?");
        $stmt->execute([$public_key, $access_token, $pp_token, $usuario_id_logado]);

        // Mensagem de Sucesso (Estilo Toast)
        if (empty($mensagem)) {
            $mensagem = "Configurações salvas com sucesso.";
            $msg_type = 'success';
        }
        
    } catch (PDOException $e) {
        $mensagem = "Erro ao salvar: " . $e->getMessage();
        $msg_type = 'error';
    }

    // Recarrega os dados
    $stmt_user_data->execute([$usuario_id_logado]);
    $user_data_fetched = $stmt_user_data->fetch(PDO::FETCH_ASSOC);

    $mercado_pago_public_key = $user_data_fetched['mp_public_key'] ?? '';
    $mercado_pago_access_token = $user_data_fetched['mp_access_token'] ?? '';
    $pushinpay_token = $user_data_fetched['pushinpay_token'] ?? '';
    
    $mp_configured = !empty($mercado_pago_access_token);
    $pp_configured = !empty($pushinpay_token);
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configurações de Pagamento</title>
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
        
        .selected-ring { 
            ring-width: 2px; 
            ring-color: #ea580c; /* Orange 600 */
            background-color: #fff7ed; /* Orange 50 */
            border-color: #ea580c;
        }

        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        /* Input Styles */
        .custom-input:focus-within { box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.1); border-color: #ea580c; }
    </style>
</head>
<body class="min-h-screen text-slate-800 pb-20">

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
                <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                    Gateways de Pagamento
                </h1>
                <p class="mt-2 text-slate-500 text-lg">Gerencie suas chaves de API e métodos de recebimento.</p>
            </div>
        </div>

        <!-- Mensagens Flutuantes (Toast) -->
        <?php if(!empty($mensagem)): ?>
            <div id='toast-msg' class='fixed top-5 right-5 z-50 animate-fade-in flex items-center w-full max-w-xs p-4 text-slate-600 bg-white rounded-lg shadow-xl border border-slate-100' role='alert'>
                <div class='inline-flex items-center justify-center flex-shrink-0 w-8 h-8 <?php echo ($msg_type == "success" ? "text-green-500 bg-green-100" : "text-red-500 bg-red-100"); ?> rounded-lg'>
                    <i data-lucide='<?php echo ($msg_type == "success" ? "check" : "alert-circle"); ?>' class='w-5 h-5'></i>
                </div>
                <div class='ml-3 text-sm font-medium'><?php echo $mensagem; ?></div>
                <button type='button' class='ml-auto -mx-1.5 -my-1.5 bg-white text-slate-400 hover:text-slate-900 rounded-lg focus:ring-2 focus:ring-slate-300 p-1.5 hover:bg-slate-100 inline-flex h-8 w-8' onclick='this.parentElement.remove()'>
                    <i data-lucide='x' class='w-4 h-4'></i>
                </button>
            </div>
        <?php endif; ?>

        <form action="index.php?pagina=configuracoes" method="post" enctype="multipart/form-data" class="space-y-8">
            
            <!-- Seleção de Gateway (Cards) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <!-- Card Mercado Pago -->
                <div id="card-mp" onclick="showGateway('mp')"
                     class="card-hover group relative bg-white border border-slate-200 rounded-2xl p-8 cursor-pointer overflow-hidden h-full flex flex-col justify-between">
                    
                    <div class="absolute top-0 right-0 p-6">
                         <?php if($mp_configured): ?>
                            <div class="bg-green-100 text-green-700 p-1.5 rounded-full">
                                <i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>
                            </div>
                        <?php else: ?>
                            <div class="bg-slate-100 text-slate-400 p-1.5 rounded-full group-hover:bg-slate-200 transition-colors">
                                <i data-lucide="circle" class="w-4 h-4"></i>
                            </div>
                        <?php endif; ?>
                    </div>

                    <div class="flex items-center gap-5 mb-4">
                        <div class="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm group-hover:bg-blue-100 transition-colors">
                            <img src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo-1.png" alt="MP" class="h-8 object-contain">
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Mercado Pago</h3>
                            <p class="text-slate-500 text-sm">Cartão, Boleto e Pix</p>
                        </div>
                    </div>
                    
                    <div class="mt-4 pt-4 border-t border-slate-100">
                        <span class="text-sm font-semibold text-blue-600 flex items-center group-hover:translate-x-1 transition-transform">
                            Configurar <i data-lucide="chevron-right" class="w-4 h-4 ml-1"></i>
                        </span>
                    </div>
                </div>

                <!-- Card PushinPay -->
                <div id="card-pp" onclick="showGateway('pp')"
                     class="card-hover group relative bg-white border border-slate-200 rounded-2xl p-8 cursor-pointer overflow-hidden h-full flex flex-col justify-between">
                    
                    <div class="absolute top-0 right-0 p-6">
                         <?php if($pp_configured): ?>
                            <div class="bg-green-100 text-green-700 p-1.5 rounded-full">
                                <i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>
                            </div>
                        <?php else: ?>
                            <div class="bg-slate-100 text-slate-400 p-1.5 rounded-full group-hover:bg-slate-200 transition-colors">
                                <i data-lucide="circle" class="w-4 h-4"></i>
                            </div>
                        <?php endif; ?>
                    </div>

                    <div class="flex items-center gap-5 mb-4">
                        <div class="h-16 w-16 rounded-2xl bg-green-50 flex items-center justify-center border border-green-100 shadow-sm group-hover:bg-green-100 transition-colors">
                            <img src="https://play-lh.googleusercontent.com/rZ3iKAteqcYZLSnMvVW66rqqlQdRQh9JXPFdLXkcBR3VxZ0jXz6T8ARRHzGKS72GYSMB" alt="PushinPay" class="h-9 w-9 object-contain rounded-md">
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-slate-900 group-hover:text-green-600 transition-colors">PushinPay</h3>
                            <p class="text-slate-500 text-sm">Pix Instantâneo</p>
                        </div>
                    </div>

                    <div class="mt-4 pt-4 border-t border-slate-100">
                        <span class="text-sm font-semibold text-green-600 flex items-center group-hover:translate-x-1 transition-transform">
                            Configurar <i data-lucide="chevron-right" class="w-4 h-4 ml-1"></i>
                        </span>
                    </div>
                </div>

            </div>

            <!-- Área de Configuração (Painel Expansível) -->
            <div id="gateway-forms-container" class="hidden animate-fade-in">
                <div class="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    
                    <div class="p-8 md:p-10">
                        
                        <!-- Formulário MP -->
                        <div id="fields-mp" class="hidden gateway-section">
                            <div class="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
                                <div class="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                    <i data-lucide="key" class="w-6 h-6"></i>
                                </div>
                                <div>
                                    <h3 class="text-xl font-bold text-slate-900">Credenciais Mercado Pago</h3>
                                    <p class="text-slate-500">Insira suas chaves de produção (Live Keys).</p>
                                </div>
                            </div>

                            <div class="grid gap-6">
                                <div class="group">
                                    <label class="block text-sm font-semibold text-slate-700 mb-2">Public Key</label>
                                    <div class="custom-input flex items-center border border-slate-300 rounded-lg px-4 py-3 bg-slate-50 transition-all">
                                        <i data-lucide="unlock" class="text-slate-400 w-5 h-5 mr-3"></i>
                                        <input type="text" name="mercado_pago_public_key" value="<?php echo htmlspecialchars($mercado_pago_public_key); ?>" 
                                            class="w-full bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 font-medium sm:text-sm"
                                            placeholder="APP_USR-xxxxxxxx...">
                                    </div>
                                </div>

                                <div class="group">
                                    <label class="block text-sm font-semibold text-slate-700 mb-2">Access Token</label>
                                    <div class="custom-input flex items-center border border-slate-300 rounded-lg px-4 py-3 bg-slate-50 transition-all">
                                        <i data-lucide="lock" class="text-slate-400 w-5 h-5 mr-3"></i>
                                        <input type="text" name="mercado_pago_access_token" value="<?php echo htmlspecialchars($mercado_pago_access_token); ?>" 
                                            class="w-full bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 font-medium sm:text-sm"
                                            placeholder="APP_USR-xxxxxxxx...">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Formulário PP -->
                        <div id="fields-pp" class="hidden gateway-section">
                            <div class="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
                                <div class="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
                                    <i data-lucide="zap" class="w-6 h-6"></i>
                                </div>
                                <div>
                                    <h3 class="text-xl font-bold text-slate-900">Credenciais PushinPay</h3>
                                    <p class="text-slate-500">Token de acesso para API Pix.</p>
                                </div>
                            </div>

                            <div class="group mb-6">
                                <label class="block text-sm font-semibold text-slate-700 mb-2">API Token (Bearer)</label>
                                <div class="custom-input flex items-center border border-slate-300 rounded-lg px-4 py-3 bg-slate-50 transition-all">
                                    <i data-lucide="shield-check" class="text-slate-400 w-5 h-5 mr-3"></i>
                                    <input type="text" name="pushinpay_token" value="<?php echo htmlspecialchars($pushinpay_token); ?>" 
                                        class="w-full bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 font-medium sm:text-sm"
                                        placeholder="Cole seu token aqui...">
                                </div>
                            </div>

                            <div class="rounded-xl bg-orange-50 border border-orange-100 p-4 flex gap-4 items-start">
                                <i data-lucide="info" class="text-orange-500 w-5 h-5 flex-shrink-0 mt-0.5"></i>
                                <div>
                                    <h4 class="text-sm font-bold text-orange-800">Nota Importante</h4>
                                    <p class="text-sm text-orange-700 mt-1">Este gateway processa exclusivamente pagamentos via <strong>Pix</strong>. O checkout será adaptado automaticamente.</p>
                                </div>
                            </div>
                        </div>

                        <!-- Webhook Section (Estilo Terminal/Code) -->
                        <div class="mt-10 pt-8 border-t border-slate-100">
                            <label class="block text-sm font-semibold text-slate-700 mb-3 flex justify-between items-center">
                                <span>Webhook URL <span class="font-normal text-slate-400 ml-2 text-xs">Para notificações automáticas</span></span>
                                <span class="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">POST</span>
                            </label>
                            
                            <div class="relative group">
                                <div class="relative bg-slate-900 rounded-xl p-1 flex items-center shadow-lg overflow-hidden border border-slate-800">
                                    <div class="pl-4 pr-2 py-3 flex-1 font-mono text-sm text-green-400 overflow-x-auto whitespace-nowrap">
                                        <span class="text-slate-500 select-none mr-2">$</span><?php echo htmlspecialchars($webhook_url); ?>
                                        <input type="hidden" id="webhook_url" value="<?php echo htmlspecialchars($webhook_url); ?>">
                                    </div>
                                    <button type="button" onclick="copyWebhookUrl()" id="copy-webhook-btn" 
                                            class="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors mr-1 flex items-center gap-2 border border-slate-700">
                                        <i data-lucide="copy" class="w-4 h-4"></i> <span class="hidden sm:inline">Copiar</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                    
                    <!-- Footer Actions -->
                    <div class="bg-slate-50 px-8 py-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-4">
                        <button type="submit" name="salvar_configuracoes" 
                            class="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                            <i data-lucide="save" class="w-5 h-5"></i>
                            Salvar Alterações
                        </button>
                    </div>

                </div>
            </div>

        </form>
    </div>

    <!-- Scripts -->
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof lucide !== 'undefined') lucide.createIcons();
            
            // Remove toast automaticamente
            const toast = document.getElementById('toast-msg');
            if(toast) {
                setTimeout(() => {
                    toast.style.opacity = '0';
                    toast.style.transition = 'opacity 0.5s ease';
                    setTimeout(() => toast.remove(), 500);
                }, 4000);
            }

            // Lógica de seleção automática na carga
            const hasMp = "<?php echo $mercado_pago_access_token; ?>";
            const hasPp = "<?php echo $pushinpay_token; ?>";
            
            if(hasPp && !hasMp) {
                showGateway('pp');
            } else if (hasMp) {
                showGateway('mp');
            }
        });

        function showGateway(gateway) {
            // Visual reset
            const allCards = document.querySelectorAll('#card-mp, #card-pp');
            allCards.forEach(card => {
                card.classList.remove('selected-ring', 'border-orange-500', 'bg-orange-50');
                card.classList.add('border-slate-200', 'bg-white');
            });

            // Active visual
            const selectedCard = document.getElementById('card-' + gateway);
            selectedCard.classList.remove('border-slate-200', 'bg-white');
            selectedCard.classList.add('selected-ring'); // Usa a classe definida no estilo (Laranja)

            // Show container and specific form
            const container = document.getElementById('gateway-forms-container');
            container.classList.remove('hidden');
            
            document.querySelectorAll('.gateway-section').forEach(el => el.classList.add('hidden'));
            document.getElementById('fields-' + gateway).classList.remove('hidden');
            
            if (typeof lucide !== 'undefined') lucide.createIcons();
            
            // Scroll suave
            if(window.innerWidth < 768) {
                setTimeout(() => {
                    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }

        function copyWebhookUrl() {
            const webhookInput = document.getElementById('webhook_url');
            const copyBtn = document.getElementById('copy-webhook-btn');
            
            navigator.clipboard.writeText(webhookInput.value).then(() => {
                const originalContent = copyBtn.innerHTML;
                copyBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-green-400"></i> <span class="text-green-400">Copiado!</span>`;
                copyBtn.classList.remove('border-slate-700');
                copyBtn.classList.add('border-green-900');
                
                if (typeof lucide !== 'undefined') lucide.createIcons();
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalContent;
                    copyBtn.classList.add('border-slate-700');
                    copyBtn.classList.remove('border-green-900');
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }, 2000);
            }).catch(err => {
                alert('Erro ao copiar. Tente manualmente.');
            });
        }
    </script>
</body>
</html>