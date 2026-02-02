<?php
require 'config.php';

$checkout_hash = $_GET['p'] ?? null;
if (!$checkout_hash) {
    die("Servi�o não encontrado.");
}

try {
    // 1. Busca o servi�o principal (INCLUINDO O CAMPO GATEWAY)
    $stmt_prod = $pdo->prepare("SELECT * FROM servi�os WHERE checkout_hash = ?");
    $stmt_prod->execute([$checkout_hash]);
    $servi�o = $stmt_prod->fetch(PDO::FETCH_ASSOC);

    if (!$servi�o) {
        die("Servi�o inválido ou não existe mais.");
    }
    
    // Define o gateway (padrão mercadopago se estiver vazio)
    $gateway = $servi�o['gateway'] ?? 'mercadopago';

    // 2. Busca os order bumps
    $stmt_ob = $pdo->prepare("
        SELECT 
            ob.*, 
            p.id as ob_id,
            p.nome as ob_nome, 
            p.preco as ob_preco, 
            p.preco_anterior as ob_preco_anterior,
            p.foto as ob_foto 
        FROM order_bumps as ob
        JOIN servi�os as p ON ob.offer_product_id = p.id
        WHERE ob.main_product_id = ? AND ob.is_active = 1
        ORDER BY ob.ordem ASC
    ");
    $stmt_ob->execute([$servi�o['id']]);
    $order_bumps = $stmt_ob->fetchAll(PDO::FETCH_ASSOC);

    $checkout_config = json_decode($servi�o['checkout_config'] ?? '{}', true);
    if (!is_array($checkout_config)) { $checkout_config = []; }

    // LÓGICA DE RASTREAMENTO
    $tracking_config = $checkout_config['tracking'] ?? [];
    if (empty($tracking_config['facebookPixelId']) && !empty($checkout_config['facebookPixelId'])) {
        $tracking_config['facebookPixelId'] = $checkout_config['facebookPixelId'];
    }
    $fbPixelId = $tracking_config['facebookPixelId'] ?? '';
    $gaId = $tracking_config['googleAnalyticsId'] ?? '';
    $gAdsId = $tracking_config['googleAdsId'] ?? '';
    $tracking_events = $tracking_config['events'] ?? [];
    $fb_events_enabled = $tracking_events['facebook'] ?? [];
    $gg_events_enabled = $tracking_events['google'] ?? [];

    $infoservi�or_id = $servi�o['usuario_id'];
    
    // Busca o nome do vendedor e a public key (Só necessária se for MP)
    $stmt_vendedor = $pdo->prepare("SELECT nome, mp_public_key FROM usuarios WHERE id = ?");
    $stmt_vendedor->execute([$infoservi�or_id]);
    $vendedor_data = $stmt_vendedor->fetch(PDO::FETCH_ASSOC);
    $public_key = $vendedor_data['mp_public_key'] ?? '';
    $vendedor_nome = $vendedor_data['nome'] ?? 'Vendedor';

    // --- Starfy TRACK: Busca ID de rastreamento para o servi�o ---
    $Starfy_tracking_id_hash = null;
    $Starfy_track_endpoint = null;
    $stmt_st = $pdo->prepare("SELECT tracking_id FROM Starfy_tracking_products WHERE servi�o_id = ?");
    $stmt_st->execute([$servi�o['id']]);
    $Starfy_tracking_id_hash = $stmt_st->fetchColumn();

    if ($Starfy_tracking_id_hash) {
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
        $domainName = $_SERVER['HTTP_HOST'];
        $basePath = rtrim(dirname($_SERVER['PHP_SELF']), '/\\');
        $Starfy_track_endpoint = $protocol . $domainName . $basePath . '/track.php'; // Endpoint da API de rastreamento
    }
    // -------------------------------------------------------------

} catch (PDOException $e) {
    die("Erro de banco de dados: " . $e->getMessage());
}

$orderbump_active = !empty($order_bumps);

// Configurações de Estilo e Funcionalidade
$backgroundColor = $checkout_config['backgroundColor'] ?? '#E3E3E3';
$accentColor = $checkout_config['accentColor'] ?? '#7427F1';
$banners = $checkout_config['banners'] ?? [];
if (empty($banners) && !empty($checkout_config['bannerUrl'])) { $banners = [$checkout_config['bannerUrl']]; }
$sideBanners = $checkout_config['sideBanners'] ?? [];
if (empty($sideBanners) && !empty($checkout_config['sideBannerUrl'])) { $sideBanners = [$checkout_config['sideBannerUrl']]; }
$youtubeUrl = $checkout_config['youtubeUrl'] ?? null;
$timerConfig = $checkout_config['timer'] ?? ['enabled' => false, 'minutes' => 15, 'text' => 'Esta oferta expira em:', 'bgcolor' => '#000000', 'textcolor' => '#FFFFFF', 'sticky' => true];
$salesNotificationConfig = $checkout_config['salesNotification'] ?? ['enabled' => false, 'names' => '', 'product' => '', 'tempo_exibicao' => 5, 'intervalo_notificacao' => 10];
$backRedirectConfig = $checkout_config['backRedirect'] ?? ['enabled' => false, 'url' => ''];
$redirectUrlConfig = $checkout_config['redirectUrl'] ?? '';
$payment_methods_config = $checkout_config['paymentMethods'] ?? ['credit_card' => true, 'pix' => true, 'ticket' => true];
$customer_fields_config = $checkout_config['customer_fields'] ?? ['enable_cpf' => true, 'enable_phone' => true];

// Variáveis de Resumo
$main_price = floatval($servi�o['preco']);
$main_name = !empty($checkout_config['summary']['product_name']) ? $checkout_config['summary']['product_name'] : $servi�o['nome'];
$main_image = 'uploads/' . htmlspecialchars($servi�o['foto'] ?: 'placeholder.png');
$formattedMainPrice = 'R$ ' . number_format($main_price, 2, ',', '.');
$preco_anterior_raw = !empty($servi�o['preco_anterior']) ? floatval($servi�o['preco_anterior']) : null;
$formattedPrecoAnterior = $preco_anterior_raw ? 'R$ ' . number_format($preco_anterior_raw, 2, ',', '.') : null;
$discount_text = $checkout_config['summary']['discount_text'] ?? '';

// --- Funções de Renderização ---

function render_timer($timerConfig) {
    if (!($timerConfig['enabled'] ?? false)) return '';
    $text = htmlspecialchars($timerConfig['text'] ?? 'Esta oferta expira em:');
    $minutes = intval($timerConfig['minutes'] ?? 15);
    $bgcolor = htmlspecialchars($timerConfig['bgcolor'] ?? '#000000');
    $textcolor = htmlspecialchars($timerConfig['textcolor'] ?? '#FFFFFF');
    $is_sticky = $timerConfig['sticky'] ?? true;
    $transparent_bgcolor = $bgcolor . '99'; 
    $sticky_style = $is_sticky ? 'position: sticky; top: 0; z-index: 1000; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: background-color 0.3s ease, backdrop-filter 0.3s ease;' : 'position: relative;';
    $storage_key = 'checkoutTimer_' . htmlspecialchars($_GET['p'] ?? 'default');
    
    $js_script = "<script>
        document.addEventListener('DOMContentLoaded', () => {
            const timerData = { minutes: {$minutes}, storageKey: '{$storage_key}' };
            const timerElement = document.getElementById('timer-countdown-display');
            if (!timerElement) return;
            let endTime = localStorage.getItem(timerData.storageKey);
            if (!endTime || isNaN(endTime)) {
                endTime = new Date().getTime() + (timerData.minutes * 60 * 1000);
                localStorage.setItem(timerData.storageKey, endTime);
            }
            const interval = setInterval(() => {
                const now = new Date().getTime();
                const distance = endTime - now;
                if (distance < 0) {
                    clearInterval(interval);
                    timerElement.innerHTML = '00:00';
                    localStorage.removeItem(timerData.storageKey);
                    return;
                }
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                timerElement.innerHTML = (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
            }, 1000);
            const timerBar = document.getElementById('timer-bar');
            if (timerBar && {$is_sticky}) {
                const solidColor = '{$bgcolor}';
                const transparentColor = '{$transparent_bgcolor}';
                window.addEventListener('scroll', () => {
                    if (window.scrollY > 0) {
                        timerBar.style.backgroundColor = transparentColor;
                        timerBar.style.backdropFilter = 'blur(8px)';
                        timerBar.style.webkitBackdropFilter = 'blur(8px)';
                    } else {
                        timerBar.style.backgroundColor = solidColor;
                        timerBar.style.backdropFilter = 'none';
                        timerBar.style.webkitBackdropFilter = 'none';
                    }
                });
            }
        });
        </script>";
    return "<div id='timer-bar' style='background-color: {$bgcolor}; color: {$textcolor}; {$sticky_style}'><div class='flex items-center justify-center p-3 text-center w-full'><i data-lucide='clock' class='w-5 h-5 mr-3 flex-shrink-0'></i><p class='font-semibold'>{$text}</p><span id='timer-countdown-display' class='font-bold text-lg ml-2 font-mono w-14'>{$minutes}:00</span></div></div>{$js_script}";
}

function render_youtube_video($youtubeUrl) {
    if (!$youtubeUrl) return '';
    preg_match('%(?:youtube(?:-nocookie)?\.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu\.be/)([^"&?/ ]{11})%i', $youtubeUrl, $match);
    $youtube_id = $match[1] ?? null;
    if(!$youtube_id) return '';
    return "<div data-id='youtube_video' class='mb-6'><div class='aspect-video rounded-lg overflow-hidden shadow-md'><iframe src='https://www.youtube.com/embed/{$youtube_id}' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen class='w-full h-full'></iframe></div></div>";
}

function render_order_bumps_section($order_bumps_array) {
    if (empty($order_bumps_array)) return '';
    $html = "<div data-id='order_bump' class='space-y-6'>";
    foreach($order_bumps_array as $index => $bump) {
        $ob_image = 'uploads/' . htmlspecialchars($bump['ob_foto'] ?: 'placeholder.png');
        $ob_headline = htmlspecialchars($bump['headline']);
        $ob_description = htmlspecialchars($bump['description']);
        $ob_name = htmlspecialchars($bump['ob_nome']);
        $ob_price_formatted = 'R$ ' . number_format($bump['ob_preco'], 2, ',', '.');
        $ob_price_raw = floatval($bump['ob_preco']);
        $ob_id = intval($bump['ob_id']);

        $html .= "<div class='order-bump-wrapper'>";
        $html .= "<input type='checkbox' id='orderbump-checkbox-{$ob_id}' data-product-id='{$ob_id}' data-price='{$ob_price_raw}' data-name='{$ob_name}' class='orderbump-checkbox sr-only'>";
        $html .= "<label for='orderbump-checkbox-{$ob_id}' class='order-bump-block'>"; 
        $html .= "<div class='offer-badge'>Oferta Especial</div>";
        $html .= "<div class='flex items-start gap-4'><img src='{$ob_image}' class='w-16 h-16 rounded-md object-cover border shadow-sm flex-shrink-0' onerror=\"this.src='https://placehold.co/64x64/e2e8f0/334155?text=Servi�o'\"/><div class='flex-1'><h4 class='text-lg font-bold text-gray-800'>{$ob_headline}</h4><p class='text-sm text-gray-600 mt-1'>{$ob_description}</p></div></div>";
        $html .= "<hr class='my-3 border-dashed border-gray-300'>";
        $html .= "<div class='flex justify-between items-center'><div class='flex items-center gap-2'><div class='custom-checkbox flex-shrink-0'><i data-lucide='check' class='checkmark'></i></div><span class='font-semibold text-gray-800 text-sm sm:text-base'>Sim, quero esta oferta!</span></div><p class='font-bold text-green-600 text-lg'>+{$ob_price_formatted}</p></div>";
        $html .= "</label></div>";
    }
    $html .= "</div>";
    return $html;
}

function render_payment_section($gateway, $accentColor, $payment_methods_config) {
    $html = "<div data-id='payment'>";
    $html .= "<div id='payment_section_wrapper'>";
    
    if ($gateway === 'pushinpay') {
        // LAYOUT PUSHINPAY (Exclusivo Pix)
        $html .= "<div class='bg-white rounded-lg border border-gray-200 p-5 shadow-sm'>";
        $html .= "<h3 class='text-lg font-semibold mb-4 text-gray-800 flex items-center'><i data-lucide='wallet' class='w-5 h-5 mr-2'></i>Pagamento</h3>";
        
        // Opção Pix Pré-selecionada e única
        $html .= "<div class='border-2 border-green-500 bg-green-50 rounded-lg p-4 flex items-center justify-between cursor-default'>";
            $html .= "<div class='flex items-center gap-3'>";
                $html .= "<img src='https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo%E2%80%94pix_powered_by_Banco_Central_%28Brazil%2C_2020%29.svg' class='h-6 w-auto' alt='Pix'>";
                $html .= "<span class='font-bold text-gray-800'>Pix (Aprovação Imediata)</span>";
            $html .= "</div>";
            $html .= "<div class='w-5 h-5 rounded-full border-4 border-green-500'></div>"; // Radio visual checked
        $html .= "</div>";
        
        $html .= "<div class='mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200'>";
            $html .= "<p>• Liberação imediata do acesso.</p>";
            $html .= "<p>• 100% Seguro.</p>";
        $html .= "</div>";
        
        $html .= "<button id='btn-pagar-pushinpay' class='w-full mt-6 bg-green-600 text-white font-bold py-4 rounded-lg hover:bg-green-700 transition duration-300 text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform active:scale-95'>";
            $html .= "<i data-lucide='qr-code' class='w-6 h-6'></i> GERAR PIX AGORA";
        $html .= "</button>";
        
        $html .= "</div>";

    } else {
        // LAYOUT MERCADO PAGO (Padrão Payment Brick)
        // Se não tiver paymentMethods configurado, assume todos
        $enabled_payment_methods = [];
        if (($payment_methods_config['credit_card'] ?? false)) $enabled_payment_methods['creditCard'] = 'all';
        if (($payment_methods_config['pix'] ?? false)) $enabled_payment_methods['bankTransfer'] = 'all';
        if (($payment_methods_config['ticket'] ?? false)) $enabled_payment_methods['ticket'] = 'all';
        
        // Passa a configuração via data-attribute para o JS ler
        $json_config = htmlspecialchars(json_encode($enabled_payment_methods), ENT_QUOTES, 'UTF-8');
        
        $html .= "<div id='payment_container_wrapper' class='mt-6' data-mp-config='{$json_config}'>";
        $html .= "<div id='loading_spinner' class='flex flex-col items-center justify-center py-12 text-gray-500'><svg class='animate-spin h-8 w-8' style='color: {$accentColor};' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'><circle class='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' stroke-width='4'></circle><path class='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.96l2-2.669z'></path></svg><p class='mt-4 font-medium'>Carregando pagamento seguro...</p></div>";
        $html .= "<div id='paymentBrick_container'></div>";
        $html .= "</div>";
    }
    
    $html .= "</div></div>";
    return $html;
}

function render_security_info($vendedor_nome) {
    $vendedor_nome_html = htmlspecialchars($vendedor_nome);
    $html = "<div data-id='security_info' class='text-center text-xs text-gray-500 space-y-4'>"; 
    $html .= "<img src='assets/logo.png' alt='Logo Starfy' class='h-10 mx-auto mb-4'>";
    $html .= "<p><strong>Starfy</strong> está processando este pagamento para o vendedor <strong>{$vendedor_nome_html}</strong>.</p>";
    $html .= "<div class='flex items-center justify-center space-x-4'><div class='flex items-center space-x-1.5'><i data-lucide='shield-check' class='w-4 h-4 text-gray-400'></i><span>Compra 100% segura</span></div></div>";
    $html .= "<p>Este site é protegido pelo reCAPTCHA do Google<br><a href='#' class='underline hover:text-gray-700'>Política de privacidade</a> e <a href='#' class='underline hover:text-gray-700'>Termos de serviço</a>.</p>";
    $html .= "<p class='pt-4 text-gray-400'>Copyright &copy; " . date("Y") . ". Todos os direitos reservados.</p>";
    $html .= "</div>";
    return $html;
}

function render_sales_notification($config, $servi�o_nome_fallback) {
    if (!($config['enabled'] ?? false) || empty($config['names'])) return '';
    $notification_product_display = !empty($config['product']) ? $config['product'] : $servi�o_nome_fallback;
    return "<div id='sales-notification' class='fixed lg:bottom-4 left-4 w-80 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-4 flex items-center space-x-4 transform translate-y-full opacity-0 transition-all duration-500 z-[9999]'><div class='bg-blue-100 text-blue-600 p-2 rounded-full'><i data-lucide='shopping-cart'></i></div><div><p class='text-sm font-semibold text-gray-900'><span id='notification-name'></span> acabou de comprar!</p><p class='text-xs text-gray-600' id='notification-product' data-fallback-product-name='".htmlspecialchars($notification_product_display)."'></p></div></div>";
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout — <?php echo htmlspecialchars($servi�o['nome']); ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: { extend: { fontFamily: { 'mono': ['"Roboto Mono"', 'monospace'], }, aspectRatio: { '1/1': '1 / 1', '16/9': '16 / 9' } } },
            plugins: [],
        }
    </script>
    
    <?php if($gateway === 'mercadopago' && !isset($_GET['preview'])): ?>
    <script src="https://sdk.mercadopago.com/js/v2"></script>
    <?php endif; ?>

    <!-- Rastreamento (Pixel, Analytics) -->
    <?php if (!empty($fbPixelId) && !isset($_GET['preview'])): ?>
    <script>
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '<?php echo htmlspecialchars($fbPixelId); ?>');
    fbq('track', 'PageView');
    <?php if (!empty($fb_events_enabled['initiate_checkout'])) { echo "fbq('track', 'InitiateCheckout');"; } ?>
    </script>
    <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=<?php echo htmlspecialchars($fbPixelId); ?>&ev=PageView&noscript=1"/></noscript>
    <?php endif; ?>
    <!-- Fim Rastreamento -->

    <!-- Starfy TRACK: Initiate Checkout (Page Load) -->
    <?php if ($Starfy_tracking_id_hash && $Starfy_track_endpoint): ?>
    <script>
    (function() {
        // Função para obter Session ID (Tenta usar o do checkout, ou cria um temporário se não existir ainda)
        // Nota: O checkout.php gera 'Starfy_checkout_session_uuid' no DOMContentLoaded lá embaixo.
        // Vamos gerar um aqui ou esperar? Melhor: Vamos disparar o evento assim que o UUID estiver disponível.
        // Mas para garantir, podemos gerar um aqui se necessário, mas o ideal é usar o mesmo que será enviado na venda.
        
        // Vamos definir uma função global ou disparar logo após o localStorage ser definido.
        // Como o script principal roda no DOMContentLoaded, vamos nos enganchar lá ou usar um script inline logo após a geração do UUID.
        
        // Melhor abordagem: Inserir a função de rastreamento aqui, e chamá-la no script principal do checkout.
        window.fireStarfyInitiateCheckout = function(checkoutSessionUUID) {
            const TRACKING_ID = '<?php echo htmlspecialchars($Starfy_tracking_id_hash); ?>';
            const ENDPOINT = '<?php echo $Starfy_track_endpoint; ?>';
            
            // Pega UTMs
            const urlParams = new URLSearchParams(window.location.search);
            const utmParams = {};
            ['utm_source', 'utm_campaign', 'utm_medium', 'utm_content', 'utm_term', 'src', 'sck'].forEach(key => { utmParams[key] = urlParams.get(key); });

            const payload = {
                tracking_id: TRACKING_ID,
                session_id: checkoutSessionUUID,
                event_type: 'initiate_checkout',
                event_data: {
                    url: window.location.href,
                    referrer: document.referrer,
                    ...utmParams
                }
            };
            
            // Tenta pegar o Starfy_session_id original (Page View) para linkar (futuro)
            // const originSessionId = localStorage.getItem('Starfy_session_id');
            // if(originSessionId) payload.event_data.origin_session_id = originSessionId;

            fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(r => {
                if(r.ok) console.log('Starfy Track: Checkout initiated.');
            }).catch(e => console.error('Starfy Track Error:', e));
        };
    })();
    </script>
    <?php endif; ?>
    <!-- Fim Starfy Track -->

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="stylesheet" href="style.css">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: <?php echo htmlspecialchars($backgroundColor); ?>; }
        .custom-alert { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background-color: #ef4444; color: white; padding: 12px 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 1000; opacity: 0; visibility: hidden; transition: opacity 0.3s, visibility 0.3s; }
        .custom-alert.show { opacity: 1; visibility: visible; }
        #pix-modal-overlay { transition: opacity 0.3s ease-in-out; }
        #pix-modal-content { transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out; }
        .order-bump-block { display: block; cursor: pointer; background-color: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 12px; padding: 1rem; position: relative; transition: all 0.3s ease-in-out; }
        .custom-checkbox { width: 24px; height: 24px; border: 2px solid #9ca3af; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease-in-out; }
        .custom-checkbox .checkmark { opacity: 0; transform: scale(0.5); color: white; transition: all 0.2s ease-in-out; width: 16px; height: 16px; }
        .offer-badge { position: absolute; top: -12px; right: 16px; background-color: #ef4444; color: white; font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border: 2px solid white; }
        .order-bump-wrapper input:checked + .order-bump-block { background-color: #f0fdf4; border-color: #22c55e; border-style: dashed; }
        .order-bump-wrapper input:checked + .order-bump-block .custom-checkbox { background-color: #22c55e; border-color: #22c55e; }
        .order-bump-wrapper input:checked + .order-bump-block .custom-checkbox .checkmark { opacity: 1; transform: scale(1); }
        #sales-notification { visibility: hidden; }
        #sales-notification.show { visibility: visible; transform: translateY(0); opacity: 1; }
        #sales-notification.hide { visibility: hidden; transform: translateY(100%); opacity: 0; }
        .checkout-input { transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out; }
        .checkout-input:focus { border-color: <?php echo htmlspecialchars($accentColor); ?>; box-shadow: 0 0 0 2px <?php echo htmlspecialchars($accentColor); ?>40; outline: none; }
    </style>
</head>
<body>
    
    <?php echo render_timer($timerConfig); ?>
    <div id="custom-alert-box" class="custom-alert"></div>
    
    <div class="mx-auto max-w-6xl p-4">
        <?php if (!empty($banners)): ?>
        <div data-id="banner" class="mb-4 space-y-4">
            <?php foreach ($banners as $banner_url): ?>
            <img src="<?php echo htmlspecialchars($banner_url); ?>" alt="Banner do Servi�o" class="w-full h-auto md:h-[300px] object-cover rounded-lg shadow-md">
            <?php endforeach; ?>
        </div>
        <?php endif; ?>
        <?php echo render_youtube_video($youtubeUrl); ?>

        <div class="flex flex-col lg:flex-row gap-6">
            <!-- Coluna Principal -->
            <div class="w-full lg:w-2/3">
                <div class="bg-white rounded-lg shadow-lg p-6 md:p-8 space-y-6">
                    <section data-id="summary" class="flex flex-row items-start gap-4">
                        <img src="<?php echo htmlspecialchars($main_image); ?>" alt="Imagem de <?php echo htmlspecialchars($main_name); ?>" class="w-24 h-24 object-cover rounded-lg shadow-md border border-gray-200 flex-shrink-0" onerror="this.src='https://placehold.co/96x96/e2e8f0/334155?text=Servi�o'">
                        <div class="flex-1">
                            <h1 class="text-xl font-bold text-gray-800"><?php echo htmlspecialchars($main_name); ?></h1>
                            <div class="flex items-baseline flex-wrap gap-x-3 gap-y-1 mt-2">
                                <span class="text-2xl font-bold" style="color: <?php echo htmlspecialchars($accentColor); ?>;"><?php echo $formattedMainPrice; ?></span>
                                <?php if ($formattedPrecoAnterior): ?><span class="text-lg text-gray-400 line-through"><?php echo $formattedPrecoAnterior; ?></span><?php endif; ?>
                            </div>
                            <?php if (!empty($discount_text)): ?><span class="bg-red-100 text-red-700 text-xs font-bold uppercase px-3 py-1 rounded-full mt-2 inline-block"><?php echo htmlspecialchars($discount_text); ?></span><?php endif; ?>
                        </div>
                    </section>
                    <hr class="border-gray-200">
                    <section data-id="customer_info">
                        <div class="flex items-center gap-2.5 mb-4"><i data-lucide="clipboard-list" class="w-6 h-6 text-gray-700"></i><h2 class="text-xl font-semibold text-gray-800">Seus dados</h2></div>
                        <div class="space-y-4">
                            <div><label for="name" class="block text-sm font-medium text-gray-700">Qual é o seu nome completo?</label><div class="relative mt-1 rounded-lg shadow-sm"><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i data-lucide="user" class="w-5 h-5 text-gray-400"></i></div><input type="text" id="name" name="name" required class="checkout-input mt-1 block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-base" placeholder="Nome da Silva"></div></div>
                            <div><label for="email" class="block text-sm font-medium text-gray-700">Qual é o seu e-mail?</label><div class="relative mt-1 rounded-lg shadow-sm"><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i data-lucide="mail" class="w-5 h-5 text-gray-400"></i></div><input type="email" id="email" name="email" required class="checkout-input mt-1 block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-base" placeholder="Digite o e-mail que receberá o servi�o"></div></div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <?php if (($customer_fields_config['enable_phone'] ?? true)): ?>
                                <div><label for="phone" class="block text-sm font-medium text-gray-700">Qual é o número do seu celular?</label><div class="relative mt-1 rounded-lg shadow-sm"><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i data-lucide="smartphone" class="w-5 h-5 text-gray-400"></i></div><input type="tel" id="phone" name="phone" required class="checkout-input mt-1 block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-base" placeholder="(11) 99999-9999"></div></div>
                                <?php else: ?><input type="hidden" id="phone" name="phone" value="(00) 00000-0000"><?php endif; ?>
                                <?php if (($customer_fields_config['enable_cpf'] ?? true)): ?>
                                <div><label for="cpf" class="block text-sm font-medium text-gray-700">Qual é o seu CPF?</label><div class="relative mt-1 rounded-lg shadow-sm"><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i data-lucide="file-text" class="w-5 h-5 text-gray-400"></i></div><input type="text" id="cpf" name="cpf" required class="checkout-input mt-1 block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-base" placeholder="000.000.000-00"></div></div>
                                <?php else: ?><input type="hidden" id="cpf" name="cpf" value="000.000.000-00"><?php endif; ?>
                            </div>
                        </div>
                    </section>
                    <?php if ($orderbump_active): ?>
                        <hr class="border-gray-200">
                        <section data-id="order_bump"><?php echo render_order_bumps_section($order_bumps); ?></section>
                    <?php endif; ?>
                    <hr class="border-gray-200">
                    <!-- Renderiza Pagamento (Mercado Pago ou PushinPay) -->
                    <section data-id="payment"><?php echo render_payment_section($gateway, $accentColor, $payment_methods_config); ?></section>
                    <hr class="border-gray-200">
                    <section data-id="security_info"><?php echo render_security_info($vendedor_nome); ?></section>
                </div>
            </div>

            <!-- Coluna Lateral: Resumo -->
            <aside class="w-full lg:w-1/3 hidden lg:block">
                <div class="sticky top-6 space-y-6">
                    <div class="bg-white rounded-lg shadow-lg p-6 space-y-4" data-id="final_summary">
                        <h2 class="text-xl font-semibold text-gray-800">Resumo da compra</h2>
                        <div class="space-y-2">
                            <div class="flex justify-between text-gray-700">
                                <span><?php echo htmlspecialchars($main_name); ?></span>
                                <div class="flex items-baseline gap-2">
                                    <?php if ($formattedPrecoAnterior): ?><span class="text-sm text-gray-400 line-through"><?php echo $formattedPrecoAnterior; ?></span><?php endif; ?>
                                    <span class="font-medium"><?php echo $formattedMainPrice; ?></span>
                                </div>
                            </div>
                            <?php foreach ($order_bumps as $bump) {
                                $ob_id = intval($bump['ob_id']); $ob_name = htmlspecialchars($bump['ob_nome']); $ob_price = floatval($bump['ob_preco']);
                                echo "<div id='orderbump-summary-{$ob_id}' class='orderbump-summary-item flex justify-between text-gray-700' style='display: none;'><span>".htmlspecialchars($ob_name)."</span><span>R$ ".number_format($ob_price, 2, ',', '.')."</span></div>";
                            } ?>
                        </div>
                        <hr class="border-gray-200">
                        <div class="flex justify-between items-center"><span class="text-lg font-bold text-gray-800">Total a pagar</span><span id="final-total-price" class="text-2xl font-bold text-[#348535]"><?php echo $formattedMainPrice; ?></span></div>
                        <div class="text-center text-gray-500 text-sm mt-4"><i data-lucide="lock" class="w-4 h-4 inline-block -mt-1"></i> Compra segura</div>
                    </div>
                    <?php if (!empty($sideBanners)): ?>
                    <div class="space-y-4"><?php foreach ($sideBanners as $side_banner_url): ?><img src="<?php echo htmlspecialchars($side_banner_url); ?>" alt="Banner Lateral" class="w-full h-auto object-cover rounded-lg shadow-md"><?php endforeach; ?></div>
                    <?php endif; ?>
                </div>
            </aside>
        </div>
        <?php if (!empty($sideBanners)): ?><div class="mt-6 lg:hidden space-y-4"><?php foreach ($sideBanners as $side_banner_url): ?><img src="<?php echo htmlspecialchars($side_banner_url); ?>" alt="Banner Lateral" class="w-full h-auto object-cover rounded-lg shadow-md"><?php endforeach; ?></div><?php endif; ?>
    </div>

    <!-- Footer Mobile -->
    <footer id="mobile-footer" class="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 border-t border-gray-200">
        <div id="mobile-summary-items" class="mb-2 text-sm text-gray-700 space-y-1 max-h-20 overflow-y-auto pr-2"></div>
        <div class="flex justify-between items-center mb-3 pt-2 border-t"><span class="text-lg font-bold text-gray-800">Total a pagar</span><span id="final-total-price-mobile" class="text-2xl font-bold text-[#348535]"><?php echo $formattedMainPrice; ?></span></div>
        <p class="text-center text-xs text-gray-500 flex items-center justify-center space-x-1"><i data-lucide="lock" class="w-3 h-3"></i><span>Compra segura processada pela Starfy</span></p>
    </footer>
    <div id="mobile-footer-spacer" class="lg:hidden" style="height: 128px;"></div>

    <?php echo render_sales_notification($salesNotificationConfig, $servi�o['nome']); ?>

    <!-- Modal do PIX -->
    <div id="pix-modal-overlay" class="fixed inset-0 bg-black bg-opacity-70 z-[10000] flex items-center justify-center p-4 hidden opacity-0">
        <div id="pix-modal-content" class="bg-white rounded-xl shadow-2xl w-full max-w-md transform scale-95 opacity-0">
            <div id="pix-waiting-state" class="p-6 sm:p-8 text-center">
                <img src="assets/logo.png" alt="Logo" class="h-10 sm:h-12 mx-auto mb-6">
                <h2 class="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Escaneie para pagar com PIX</h2>
                <p class="text-sm sm:text-base text-gray-600 mb-6">Abra o app do seu banco e aponte a câmera para o QR Code.</p>
                <div class="w-full max-w-[260px] sm:max-w-[280px] mx-auto mb-6">
                    <div class="aspect-square p-1.5 sm:p-2 bg-white border-4 border-emerald-500 rounded-lg shadow-lg">
                        <img id="pix-qr-code-img" src="" alt="PIX QR Code" class="w-full h-full object-contain rounded-sm">
                    </div>
                </div>
                <p class="text-center text-sm sm:text-base text-gray-600 mb-2">Ou use o PIX Copia e Cola:</p>
                <div class="relative max-w-sm mx-auto">
                    <input type="text" id="pix-code-input" readonly class="w-full bg-gray-100 p-3 rounded-lg text-xs sm:text-sm text-gray-800 pr-20 sm:pr-24 border border-gray-300">
                    <button id="copy-pix-code-btn" class="absolute right-1 top-1/2 -translate-y-1/2 bg-emerald-500 text-white px-2.5 sm:px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-emerald-600 transition-colors">Copiar</button>
                </div>
                <div class="mt-6 flex items-center justify-center gap-3 text-gray-500">
                    <svg class="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.96l2-2.669z"></path></svg>
                    <span class="font-semibold text-base sm:text-lg">Aguardando pagamento...</span>
                </div>
            </div>
            <div id="pix-approved-state" class="hidden p-6 sm:p-8 text-center">
                 <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><i data-lucide="check" class="w-12 h-12 text-green-600"></i></div>
                 <h2 class="text-2xl font-bold text-gray-800 mb-2">Pagamento Aprovado!</h2>
                 <p class="text-gray-600">Tudo certo! Você será redirecionado em instantes.</p>
            </div>
            <div class="bg-gray-50 p-4 border-t border-gray-200 rounded-b-xl text-center">
                <p class="text-xs text-gray-600">Este pagamento será processado para <strong class="font-semibold"><?php echo htmlspecialchars($vendedor_nome); ?></strong>.</p>
            </div>
        </div>
    </div>

    <script>
        function generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        let checkoutSessionUUID = generateUUID();
        localStorage.setItem('Starfy_checkout_session_uuid', checkoutSessionUUID);
        
        // --- Starfy TRACK TRIGGER ---
        if (typeof window.fireStarfyInitiateCheckout === 'function') {
            window.fireStarfyInitiateCheckout(checkoutSessionUUID);
        }
        // ----------------------------

        document.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();
            let paymentCheckInterval;
            let notificationTimer;
            
            const pixModalOverlay = document.getElementById('pix-modal-overlay');
            const pixModalContent = document.getElementById('pix-modal-content');
            const mainProductPrice = <?php echo (float)$servi�o['preco']; ?>;
            const infoservi�orId = <?php echo (int)$infoservi�or_id; ?>;
            const mainProductId = <?php echo (int)$servi�o['id']; ?>;
            const activeGateway = '<?php echo $gateway; ?>';
            let currentAmount = mainProductPrice;
            let acceptedOrderBumps = [];
            
            const finalTotalElement = document.getElementById('final-total-price');
            const finalTotalMobileElement = document.getElementById('final-total-price-mobile');
            const mobileSummaryItemsContainer = document.getElementById('mobile-summary-items');
            const orderbumpCheckboxes = document.querySelectorAll('.orderbump-checkbox');
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const phoneInput = document.getElementById('phone');
            const cpfInput = document.getElementById('cpf');
            const customerFieldsConfig = <?php echo json_encode($customer_fields_config); ?>;

            function updateMobileLayout() {
                const footer = document.getElementById('mobile-footer');
                const spacer = document.getElementById('mobile-footer-spacer');
                const notification = document.getElementById('sales-notification');
                if (footer && spacer && window.innerWidth < 1024) {
                    const footerHeight = footer.offsetHeight;
                    spacer.style.height = footerHeight + 'px';
                    if (notification) notification.style.bottom = (footerHeight + 16) + 'px';
                } else if (spacer) {
                    spacer.style.height = '0px';
                    if (notification) notification.style.bottom = '';
                }
            }
            window.addEventListener('resize', updateMobileLayout);
            
            function getUrlUtmParameters() {
                const urlParams = new URLSearchParams(window.location.search);
                const utmParams = {};
                ['utm_source', 'utm_campaign', 'utm_medium', 'utm_content', 'utm_term', 'src', 'sck'].forEach(key => { utmParams[key] = urlParams.get(key); });
                return utmParams;
            }
            const utmParameters = getUrlUtmParameters();

            const updateSummaryAndTotal = () => {
                currentAmount = mainProductPrice;
                acceptedOrderBumps = [];
                document.querySelectorAll('.orderbump-summary-item').forEach(item => item.style.display = 'none');
                if (mobileSummaryItemsContainer) {
                    mobileSummaryItemsContainer.innerHTML = '';
                    const mainItemEl = document.createElement('div');
                    mainItemEl.className = 'flex justify-between';
                    mainItemEl.innerHTML = `<span><?php echo htmlspecialchars(addslashes($main_name)); ?></span><div class="flex items-baseline gap-2"><?php if ($formattedPrecoAnterior): ?><span class="text-sm text-gray-400 line-through"><?php echo $formattedPrecoAnterior; ?></span><?php endif; ?><span class="font-medium"><?php echo $formattedMainPrice; ?></span></div>`;
                    mobileSummaryItemsContainer.appendChild(mainItemEl);
                }
                orderbumpCheckboxes.forEach(checkbox => {
                    const productId = parseInt(checkbox.dataset.productId);
                    const summaryItem = document.getElementById(`orderbump-summary-${productId}`);
                    if (checkbox.checked) {
                        const price = parseFloat(checkbox.dataset.price);
                        const name = checkbox.dataset.name;
                        currentAmount += price;
                        acceptedOrderBumps.push(productId);
                        if(summaryItem) summaryItem.style.display = 'flex';
                        if (mobileSummaryItemsContainer && name) {
                            const itemEl = document.createElement('div');
                            itemEl.className = 'flex justify-between';
                            itemEl.innerHTML = `<span>${name}</span><span class="font-medium">R$ ${price.toFixed(2).replace('.', ',')}</span>`;
                            mobileSummaryItemsContainer.appendChild(itemEl);
                        }
                    }
                });
                const totalText = `R$ ${currentAmount.toFixed(2).replace('.', ',')}`;
                if (finalTotalElement) finalTotalElement.textContent = totalText;
                if (finalTotalMobileElement) finalTotalMobileElement.textContent = totalText;
                updateMobileLayout();
            };
            
            orderbumpCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    updateSummaryAndTotal();
                    if (activeGateway === 'mercadopago') {
                        if (emailInput.value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
                            initializePaymentBrick(emailInput.value, currentAmount);
                        } else {
                            initializePaymentBrick(null, currentAmount);
                        }
                    }
                });
            });
            updateSummaryAndTotal();
            updateMobileLayout();

            function showAlert(message) {
                const alertBox = document.getElementById('custom-alert-box');
                alertBox.textContent = message;
                alertBox.classList.add('show');
                setTimeout(() => { alertBox.classList.remove('show'); }, 3000);
            }

            // --- Lógica de Validação Comum ---
            function validateForm() {
                const cpfEl = document.getElementById('cpf');
                const phoneEl = document.getElementById('phone');
                
                // A lógica abaixo confia no DOM: 
                // Se o PHP renderizou um campo 'hidden', é porque foi desabilitado no backend.
                // Logo, não validamos e pegamos o valor padrão do hidden (ex: "000.000.000-00").
                const isCpfActive = cpfEl && cpfEl.type !== 'hidden';
                const isPhoneActive = phoneEl && phoneEl.type !== 'hidden';

                const payerData = {
                    name: nameInput.value,
                    email: emailInput.value,
                    phone: phoneEl ? phoneEl.value : '',
                    cpf: cpfEl ? cpfEl.value : '',
                    product_id: mainProductId,
                    checkout_session_uuid: checkoutSessionUUID
                };

                if (!payerData.name || !payerData.email) { showAlert('Por favor, preencha o nome e o e-mail.'); return null; }
                
                // Validação condicional baseada no estado VISUAL do campo
                if (isPhoneActive && !payerData.phone) { showAlert('Por favor, preencha o telefone.'); return null; }
                if (isCpfActive && !payerData.cpf) { showAlert('Por favor, preencha o CPF.'); return null; }
                
                return payerData;
            }

            // --- LÓGICA PUSHINPAY ---
            const btnPagarPushin = document.getElementById('btn-pagar-pushinpay');
            if (btnPagarPushin) {
                btnPagarPushin.addEventListener('click', async () => {
                    const payerData = validateForm();
                    if (!payerData) return;

                    btnPagarPushin.disabled = true;
                    btnPagarPushin.innerHTML = '<i class="animate-spin h-6 w-6 mr-2" data-lucide="loader-2"></i> Gerando Pix...';
                    lucide.createIcons();

                    try {
                        const response = await fetch('process_payment.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                ...payerData,
                                payment_method_id: 'pix', // Força Pix para PushinPay
                                transaction_amount: parseFloat(currentAmount).toFixed(2),
                                order_bump_product_ids: acceptedOrderBumps,
                                utm_parameters: utmParameters,
                                gateway: 'pushinpay' // Flag para o backend
                            })
                        });
                        const result = await response.json();

                        if (response.ok && result.status === 'pix_created') {
                            showPixModal(result.pix_data.qr_code_base64, result.pix_data.qr_code, result.pix_data.payment_id, 'pushinpay');
                        } else {
                            showAlert(result.error || 'Erro ao gerar Pix.');
                        }
                    } catch (e) {
                        console.error(e);
                        showAlert('Erro de conexão.');
                    } finally {
                        btnPagarPushin.disabled = false;
                        btnPagarPushin.innerHTML = '<i data-lucide="qr-code" class="w-6 h-6"></i> GERAR PIX AGORA';
                        lucide.createIcons();
                    }
                });
            }

            // --- LÓGICA MERCADO PAGO ---
            <?php if ($gateway === 'mercadopago' && !isset($_GET['preview'])): ?>
            const mp = new MercadoPago('<?php echo $public_key; ?>', { locale: 'pt-BR' });
            let paymentBrickController;
            
            async function initializePaymentBrick(payerEmail = null, amount = mainProductPrice) {
                if (paymentBrickController) try { await paymentBrickController.unmount(); } catch(e){}
                const oldContainer = document.getElementById('paymentBrick_container');
                if (oldContainer) {
                    const newContainer = document.createElement('div');
                    newContainer.id = 'paymentBrick_container';
                    oldContainer.parentNode.replaceChild(newContainer, oldContainer);
                }
                document.getElementById('loading_spinner')?.classList.remove('hidden');
                
                // Recupera config do HTML
                const configEl = document.getElementById('payment_container_wrapper');
                const paymentMethods = configEl ? JSON.parse(configEl.dataset.mpConfig || '{}') : {};

                paymentBrickController = await mp.bricks().create("payment", "paymentBrick_container", {
                    initialization: { amount: parseFloat(amount), ...(payerEmail && { payer: { email: payerEmail } }) },
                    customization: {
                        paymentMethods: paymentMethods,
                        visual: { style: { theme: 'flat', borderRadius: '8px', verticalPadding: '26px', primaryColor: '<?php echo htmlspecialchars($accentColor); ?>' } },
                    },
                    callbacks: {
                        onReady: () => { document.getElementById('loading_spinner')?.classList.add('hidden'); },
                        onSubmit: async ({ formData }) => {
                            const payerData = validateForm();
                            if (!payerData) return; // Validação já feita na função comum

                            const response = await fetch('process_payment.php', {
                                method: 'POST', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                    ...formData, 
                                    ...payerData,
                                    transaction_amount: parseFloat(currentAmount).toFixed(2),
                                    order_bump_product_ids: acceptedOrderBumps,
                                    utm_parameters: utmParameters,
                                    gateway: 'mercadopago'
                                })
                            });
                            const result = await response.json();

                            if (response.ok && result.status === 'pix_created') {
                                showPixModal(result.pix_data.qr_code_base64, result.pix_data.qr_code, result.pix_data.payment_id, 'mercadopago');
                            } else if (response.ok && result.redirect_url) {
                                window.location.href = result.redirect_url;
                            } else {
                                showAlert(result.error || 'Ocorreu um erro.');
                            }
                        },
                        onError: (error) => { showAlert("Erro no Mercado Pago."); },
                    },
                });
            }
            emailInput.addEventListener('blur', () => {
                const currentEmail = emailInput.value;
                if (currentEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentEmail)) initializePaymentBrick(currentEmail, currentAmount);
            });
            initializePaymentBrick(null, currentAmount); 
            <?php endif; ?>

            // --- Funções Auxiliares de Pix e Status ---
            document.getElementById('copy-pix-code-btn')?.addEventListener('click', (e) => {
                const input = document.getElementById('pix-code-input');
                input.select();
                document.execCommand('copy');
                e.target.textContent = 'Copiado!';
                setTimeout(() => { e.target.textContent = 'Copiar'; }, 2000);
            });

            function showPixModal(qrCodeBase64, pixCode, paymentId, gatewayUsed) {
                if (notificationTimer) clearInterval(notificationTimer);
                document.getElementById('sales-notification')?.classList.remove('show');
                document.getElementById('pix-qr-code-img').src = qrCodeBase64.startsWith('data:') ? qrCodeBase64 : `data:image/jpeg;base64,${qrCodeBase64}`;
                document.getElementById('pix-code-input').value = pixCode;
                document.getElementById('pix-waiting-state').classList.remove('hidden');
                document.getElementById('pix-approved-state').classList.add('hidden');
                pixModalOverlay.classList.remove('hidden');
                setTimeout(() => { pixModalOverlay.classList.remove('opacity-0'); pixModalContent.classList.remove('opacity-0', 'scale-95'); lucide.createIcons(); }, 10);
                startPaymentCheck(paymentId, infoservi�orId, gatewayUsed);
            }

            function startPaymentCheck(paymentId, sellerId, gatewayUsed) {
                if (paymentCheckInterval) clearInterval(paymentCheckInterval);
                let attempts = 0;
                paymentCheckInterval = setInterval(async () => {
                    attempts++;
                    if (attempts > 120) { clearInterval(paymentCheckInterval); showAlert("Tempo expirou."); return; }
                    try {
                        // Passa o gateway para o check_status.php
                        const response = await fetch(`check_status.php?id=${paymentId}&seller_id=${sellerId}&gateway=${gatewayUsed}`);
                        const result = await response.json();
                        if (result.status === 'approved' || result.status === 'paid') {
                            clearInterval(paymentCheckInterval);
                            document.getElementById('pix-waiting-state').classList.add('hidden');
                            document.getElementById('pix-approved-state').classList.remove('hidden');
                            lucide.createIcons();
                            const customRedirectUrl = '<?php echo $redirectUrlConfig; ?>';
                            const defaultRedirectUrl = `obrigado.php?payment_id=${paymentId}`;
                            setTimeout(() => { window.location.href = customRedirectUrl || defaultRedirectUrl; }, 2000);
                        }
                    } catch (error) { console.error('Erro status:', error); }
                }, 5000);
            }
        });
    </script>
</body>
</html>
