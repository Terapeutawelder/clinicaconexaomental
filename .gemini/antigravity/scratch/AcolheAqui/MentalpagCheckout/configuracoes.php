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
$stmt_user_data = $pdo->prepare("SELECT mp_public_key, mp_access_token, pushinpay_token, pagseguro_email, pagseguro_token, stripe_public_key, stripe_secret_key, pagarme_api_key, asaas_api_key FROM usuarios WHERE id = ?");
$stmt_user_data->execute([$usuario_id_logado]);
$user_data_fetched = $stmt_user_data->fetch(PDO::FETCH_ASSOC);

$mercado_pago_public_key = $user_data_fetched['mp_public_key'] ?? '';
$mercado_pago_access_token = $user_data_fetched['mp_access_token'] ?? '';
$pushinpay_token = $user_data_fetched['pushinpay_token'] ?? '';
$pagseguro_email = $user_data_fetched['pagseguro_email'] ?? '';
$pagseguro_token = $user_data_fetched['pagseguro_token'] ?? '';
$stripe_public_key = $user_data_fetched['stripe_public_key'] ?? '';
$stripe_secret_key = $user_data_fetched['stripe_secret_key'] ?? '';
$pagarme_api_key = $user_data_fetched['pagarme_api_key'] ?? '';
$asaas_api_key = $user_data_fetched['asaas_api_key'] ?? '';

$mp_configured = !empty($mercado_pago_access_token);
$pp_configured = !empty($pushinpay_token);
$ps_configured = !empty($pagseguro_token);
$st_configured = !empty($stripe_secret_key);
$pm_configured = !empty($pagarme_api_key);
$as_configured = !empty($asaas_api_key);

// --- CORREÇÃO DA URL DE WEBHOOK ---
$domainName = $_SERVER['HTTP_HOST'];
$scriptDir = dirname($_SERVER['PHP_SELF']);
$path = rtrim(str_replace('\\', '/', $scriptDir), '/');
$webhook_url = "https://" . $domainName . $path . '/notification.php';


// Salvar configurações
if (isset($_POST['salvar_configuracoes'])) {
    $mp_public = $_POST['mercado_pago_public_key'] ?? '';
    $mp_access = $_POST['mercado_pago_access_token'] ?? '';
    $pp_token = $_POST['pushinpay_token'] ?? '';
    $ps_email = $_POST['pagseguro_email'] ?? '';
    $ps_token = $_POST['pagseguro_token'] ?? '';
    $st_public = $_POST['stripe_public_key'] ?? '';
    $st_secret = $_POST['stripe_secret_key'] ?? '';
    $pm_key = $_POST['pagarme_api_key'] ?? '';
    $as_key = $_POST['asaas_api_key'] ?? '';

    try {
        $stmt = $pdo->prepare("UPDATE usuarios SET mp_public_key = ?, mp_access_token = ?, pushinpay_token = ?, pagseguro_email = ?, pagseguro_token = ?, stripe_public_key = ?, stripe_secret_key = ?, pagarme_api_key = ?, asaas_api_key = ? WHERE id = ?");
        $stmt->execute([$mp_public, $mp_access, $pp_token, $ps_email, $ps_token, $st_public, $st_secret, $pm_key, $as_key, $usuario_id_logado]);

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
    $pagseguro_email = $user_data_fetched['pagseguro_email'] ?? '';
    $pagseguro_token = $user_data_fetched['pagseguro_token'] ?? '';
    $stripe_public_key = $user_data_fetched['stripe_public_key'] ?? '';
    $stripe_secret_key = $user_data_fetched['stripe_secret_key'] ?? '';
    $pagarme_api_key = $user_data_fetched['pagarme_api_key'] ?? '';
    $asaas_api_key = $user_data_fetched['asaas_api_key'] ?? '';

    $mp_configured = !empty($mercado_pago_access_token);
    $pp_configured = !empty($pushinpay_token);
    $ps_configured = !empty($pagseguro_token);
    $st_configured = !empty($stripe_secret_key);
    $pm_configured = !empty($pagarme_api_key);
    $as_configured = !empty($asaas_api_key);
}
?>

<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configurações de Pagamento - Mentalpag</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        emerald: {
                            50: '#ecfdf5',
                            100: '#d1fae5',
                            500: '#10b981',
                            600: '#059669',
                            700: '#047857',
                        }
                    }
                }
            }
        }
    </script>
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet">

    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #f8fafc;
            /* Slate 50 */
        }

        .card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .selected-ring {
            ring-width: 2px;
            ring-color: #059669;
            /* Emerald 600 */
            background-color: #ecfdf5;
            /* Emerald 50 */
            border-color: #059669;
        }

        .animate-fade-in {
            animation: fadeIn 0.4s ease-out forwards;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .custom-input:focus-within {
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
            border-color: #059669;
        }
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
                <p class="mt-2 text-slate-500 text-lg">Gerencie suas integrações financeiras.</p>
            </div>
        </div>

        <!-- Mensagens Flutuantes (Toast) -->
        <?php if (!empty($mensagem)): ?>
            <div id='toast-msg'
                class='fixed top-5 right-5 z-50 animate-fade-in flex items-center w-full max-w-xs p-4 text-slate-600 bg-white rounded-lg shadow-xl border border-slate-100'
                role='alert'>
                <div
                    class='inline-flex items-center justify-center flex-shrink-0 w-8 h-8 <?php echo ($msg_type == "success" ? "text-green-500 bg-green-100" : "text-red-500 bg-red-100"); ?> rounded-lg'>
                    <i data-lucide='<?php echo ($msg_type == "success" ? "check" : "alert-circle"); ?>' class='w-5 h-5'></i>
                </div>
                <div class='ml-3 text-sm font-medium'><?php echo $mensagem; ?></div>
                <button type='button'
                    class='ml-auto -mx-1.5 -my-1.5 bg-white text-slate-400 hover:text-slate-900 rounded-lg focus:ring-2 focus:ring-slate-300 p-1.5 hover:bg-slate-100 inline-flex h-8 w-8'
                    onclick='this.parentElement.remove()'>
                    <i data-lucide='x' class='w-4 h-4'></i>
                </button>
            </div>
        <?php endif; ?>

        <form action="index.php?pagina=configuracoes" method="post" enctype="multipart/form-data" class="space-y-8">

            <!-- Grid de Cards de Gateway -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <!-- Mercado Pago -->
                <div id="card-mp" onclick="showGateway('mp')"
                    class="card-hover group relative bg-white border border-slate-200 rounded-2xl p-6 cursor-pointer overflow-hidden h-full flex flex-col justify-between">
                    <div class="absolute top-4 right-4"><?php statusIcon($mp_configured); ?></div>
                    <div class="flex items-center gap-4 mb-3">
                        <div
                            class="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                            <img src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo-1.png"
                                class="h-6 object-contain"></div>
                        <div>
                            <h3 class="font-bold text-slate-900">Mercado Pago</h3>
                            <p class="text-xs text-slate-500">Cartão, Pix, Boleto</p>
                        </div>
                    </div>
                </div>

                <!-- PagSeguro -->
                <div id="card-ps" onclick="showGateway('ps')"
                    class="card-hover group relative bg-white border border-slate-200 rounded-2xl p-6 cursor-pointer overflow-hidden h-full flex flex-col justify-between">
                    <div class="absolute top-4 right-4"><?php statusIcon($ps_configured); ?></div>
                    <div class="flex items-center gap-4 mb-3">
                        <div
                            class="h-12 w-12 rounded-xl bg-yellow-50 flex items-center justify-center border border-yellow-100">
                            <img src="https://logodownload.org/wp-content/uploads/2015/04/pagseguro-logo-transparent.png"
                                class="h-6 object-contain"></div>
                        <div>
                            <h3 class="font-bold text-slate-900">PagSeguro</h3>
                            <p class="text-xs text-slate-500">Líder no Brasil</p>
                        </div>
                    </div>
                </div>

                <!-- Stripe -->
                <div id="card-st" onclick="showGateway('st')"
                    class="card-hover group relative bg-white border border-slate-200 rounded-2xl p-6 cursor-pointer overflow-hidden h-full flex flex-col justify-between">
                    <div class="absolute top-4 right-4"><?php statusIcon($st_configured); ?></div>
                    <div class="flex items-center gap-4 mb-3">
                        <div
                            class="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png"
                                class="h-6 object-contain"></div>
                        <div>
                            <h3 class="font-bold text-slate-900">Stripe</h3>
                            <p class="text-xs text-slate-500">Global & Cartões</p>
                        </div>
                    </div>
                </div>

                <!-- Pagar.me -->
                <div id="card-pm" onclick="showGateway('pm')"
                    class="card-hover group relative bg-white border border-slate-200 rounded-2xl p-6 cursor-pointer overflow-hidden h-full flex flex-col justify-between">
                    <div class="absolute top-4 right-4"><?php statusIcon($pm_configured); ?></div>
                    <div class="flex items-center gap-4 mb-3">
                        <div
                            class="h-12 w-12 rounded-xl bg-stone-50 flex items-center justify-center border border-stone-100">
                            <img src="https://logospng.org/download/pagarme/logo-pagarme-icon-1024.png"
                                class="h-6 object-contain"></div>
                        <div>
                            <h3 class="font-bold text-slate-900">Pagar.me</h3>
                            <p class="text-xs text-slate-500">Stone Co.</p>
                        </div>
                    </div>
                </div>

                <!-- Asaas -->
                <div id="card-as" onclick="showGateway('as')"
                    class="card-hover group relative bg-white border border-slate-200 rounded-2xl p-6 cursor-pointer overflow-hidden h-full flex flex-col justify-between">
                    <div class="absolute top-4 right-4"><?php statusIcon($as_configured); ?></div>
                    <div class="flex items-center gap-4 mb-3">
                        <div
                            class="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                            <img src="https://www.asaas.com/static/asaas-logo-meta.png" class="h-6 object-contain">
                        </div>
                        <div>
                            <h3 class="font-bold text-slate-900">Asaas</h3>
                            <p class="text-xs text-slate-500">Gestão Completa</p>
                        </div>
                    </div>
                </div>

                <!-- PushinPay -->
                <div id="card-pp" onclick="showGateway('pp')"
                    class="card-hover group relative bg-white border border-slate-200 rounded-2xl p-6 cursor-pointer overflow-hidden h-full flex flex-col justify-between">
                    <div class="absolute top-4 right-4"><?php statusIcon($pp_configured); ?></div>
                    <div class="flex items-center gap-4 mb-3">
                        <div
                            class="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center border border-green-100">
                            <img src="https://play-lh.googleusercontent.com/rZ3iKAteqcYZLSnMvVW66rqqlQdRQh9JXPFdLXkcBR3VxZ0jXz6T8ARRHzGKS72GYSMB"
                                class="h-8 object-contain rounded"></div>
                        <div>
                            <h3 class="font-bold text-slate-900">PushinPay</h3>
                            <p class="text-xs text-slate-500">Pix High Speed</p>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Área de Formulários -->
            <div id="gateway-forms-container" class="hidden animate-fade-in mt-8">
                <div class="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-10">

                    <!-- MP Form -->
                    <div id="fields-mp" class="hidden gateway-section">
                        <?php renderHeader('Mercado Pago', 'key', 'blue'); ?>
                        <div class="grid gap-6">
                            <?php renderInput('mercado_pago_public_key', 'Public Key', 'APP_USR-...', $mercado_pago_public_key); ?>
                            <?php renderInput('mercado_pago_access_token', 'Access Token', 'APP_USR-...', $mercado_pago_access_token); ?>
                        </div>
                    </div>

                    <!-- PagSeguro Form -->
                    <div id="fields-ps" class="hidden gateway-section">
                        <?php renderHeader('PagSeguro', 'credit-card', 'yellow'); ?>
                        <div class="grid gap-6">
                            <?php renderInput('pagseguro_email', 'Email da Conta', 'exemplo@email.com', $pagseguro_email, 'mail'); ?>
                            <?php renderInput('pagseguro_token', 'Token de Produção', 'Obtido no painel PagSeguro', $pagseguro_token); ?>
                        </div>
                    </div>

                    <!-- Stripe Form -->
                    <div id="fields-st" class="hidden gateway-section">
                        <?php renderHeader('Stripe', 'globe', 'indigo'); ?>
                        <div class="grid gap-6">
                            <?php renderInput('stripe_public_key', 'Public Key', 'pk_live_...', $stripe_public_key); ?>
                            <?php renderInput('stripe_secret_key', 'Secret Key', 'sk_live_...', $stripe_secret_key); ?>
                        </div>
                    </div>

                    <!-- Pagar.me Form -->
                    <div id="fields-pm" class="hidden gateway-section">
                        <?php renderHeader('Pagar.me', 'layers', 'stone'); ?>
                        <div class="grid gap-6">
                            <?php renderInput('pagarme_api_key', 'API Key (Dash v5)', 'ak_live_...', $pagarme_api_key); ?>
                        </div>
                    </div>

                    <!-- Asaas Form -->
                    <div id="fields-as" class="hidden gateway-section">
                        <?php renderHeader('Asaas', 'landmark', 'blue'); ?>
                        <div class="grid gap-6">
                            <?php renderInput('asaas_api_key', 'API Key', '$aact_...', $asaas_api_key); ?>
                        </div>
                    </div>

                    <!-- PushinPay Form -->
                    <div id="fields-pp" class="hidden gateway-section">
                        <?php renderHeader('PushinPay', 'zap', 'green'); ?>
                        <div class="grid gap-6">
                            <?php renderInput('pushinpay_token', 'API Token', 'Bearer Token', $pushinpay_token); ?>
                        </div>
                    </div>

                    <!-- Footer Actions -->
                    <div class="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                        <button type="submit" name="salvar_configuracoes"
                            class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2">
                            <i data-lucide="save" class="w-5 h-5"></i> Salvar Configuração
                        </button>
                    </div>

                </div>
            </div>

        </form>
    </div>

    <!-- Helper Functions (Inline for simplicity) -->
    <?php
    function statusIcon($configured)
    {
        if ($configured)
            echo '<div class="bg-emerald-100 text-emerald-700 p-1 rounded-full"><i data-lucide="check" class="w-4 h-4 stroke-[3]"></i></div>';
        else
            echo '<div class="bg-slate-100 text-slate-300 p-1 rounded-full"><i data-lucide="circle" class="w-4 h-4"></i></div>';
    }

    function renderHeader($title, $icon, $color)
    {
        echo "<div class='flex items-center gap-4 mb-8 border-b border-slate-100 pb-6'>
                <div class='h-12 w-12 rounded-xl bg-{$color}-50 flex items-center justify-center text-{$color}-600 border border-{$color}-100'><i data-lucide='{$icon}' class='w-6 h-6'></i></div>
                <div><h3 class='text-xl font-bold text-slate-900'>{$title}</h3><p class='text-slate-500'>Configure suas credenciais de produção.</p></div>
              </div>";
    }

    function renderInput($name, $label, $placeholder, $value, $icon = 'key')
    {
        echo "<div class='group'>
                <label class='block text-sm font-semibold text-slate-700 mb-2'>{$label}</label>
                <div class='custom-input flex items-center border border-slate-300 rounded-lg px-4 py-3 bg-slate-50 transition-all'>
                    <i data-lucide='{$icon}' class='text-slate-400 w-5 h-5 mr-3'></i>
                    <input type='text' name='{$name}' value='" . htmlspecialchars($value) . "' class='w-full bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400' placeholder='{$placeholder}'>
                </div>
              </div>";
    }
    ?>

    <script>
        document.addEventListener('DOMContentLoaded', () => { setTimeout(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, 100); });
        function showGateway(id) {
            document.querySelectorAll('[id^=card-]').forEach(c => c.classList.remove('selected-ring', 'border-emerald-500'));
            document.getElementById('card-' + id).classList.add('selected-ring');

            document.getElementById('gateway-forms-container').classList.remove('hidden');
            document.querySelectorAll('.gateway-section').forEach(s => s.classList.add('hidden'));
            document.getElementById('fields-' + id).classList.remove('hidden');

            if (window.innerWidth < 768) document.getElementById('gateway-forms-container').scrollIntoView({ behavior: 'smooth' });
        }
    </script>
</body>

</html>