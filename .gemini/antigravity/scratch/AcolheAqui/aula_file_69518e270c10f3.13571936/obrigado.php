<?php
require 'config.php';

$payment_id = $_GET['payment_id'] ?? null;
$sale_details = null;
$tracking_config = [];
$fb_events_enabled = [];
$gg_events_enabled = [];

// NEW: Variables for Starfy Track
$starfy_track_endpoint = null;
$starfy_tracking_id_hash = null;
$starfy_checkout_session_uuid = null; // To get from DB, if it exists

if ($payment_id) {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                v.id as venda_id,
                v.valor,
                v.transacao_id,
                v.checkout_session_uuid,
                p.id as produto_id,
                p.nome as produto_nome,
                p.checkout_config
            FROM vendas v
            JOIN produtos p ON v.produto_id = p.id
            WHERE v.transacao_id = ? AND v.status_pagamento = 'approved'
            LIMIT 1
        ");
        $stmt->execute([$payment_id]);
        $sale_details = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($sale_details) {
            $checkout_config = json_decode($sale_details['checkout_config'] ?? '{}', true);
            $tracking_config = $checkout_config['tracking'] ?? [];
            
            // Retrocompatibilidade para o pixel antigo
            if (empty($tracking_config['facebookPixelId']) && !empty($checkout_config['facebookPixelId'])) {
                $tracking_config['facebookPixelId'] = $checkout_config['facebookPixelId'];
            }
            
            $tracking_events = $tracking_config['events'] ?? [];
            $fb_events_enabled = $tracking_events['facebook'] ?? [];
            $gg_events_enabled = $tracking_events['google'] ?? [];

            // NEW: Fetch Starfy Track info
            $starfy_checkout_session_uuid = $sale_details['checkout_session_uuid'];
            $stmt_get_starfy_tracking = $pdo->prepare("SELECT stp.tracking_id FROM starfy_tracking_products stp JOIN produtos p ON stp.produto_id = p.id WHERE p.id = ?");
            $stmt_get_starfy_tracking->execute([$sale_details['produto_id']]);
            $starfy_tracking_id_hash = $stmt_get_starfy_tracking->fetchColumn();

            if ($starfy_tracking_id_hash) {
                $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
                $domainName = $_SERVER['HTTP_HOST'];
                $basePath = rtrim(dirname($_SERVER['PHP_SELF']), '/\\');
                $starfy_track_endpoint = $protocol . $domainName . $basePath . '/track.php';
            }
        }
    } catch (PDOException $e) {
        // Em um ambiente de produção, é melhor logar este erro do que exibi-lo.
        error_log("Erro ao buscar detalhes da venda para rastreamento: " . $e->getMessage());
    }
}

$fbPixelId = $tracking_config['facebookPixelId'] ?? '';
$gaId = $tracking_config['googleAnalyticsId'] ?? '';
$gAdsId = $tracking_config['googleAdsId'] ?? '';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Obrigado pela sua compra!</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>

    <!-- Scripts de Rastreamento de Compra Aprovada -->
    <?php if ($sale_details): ?>

        <?php // Facebook Pixel Purchase Event ?>
        <?php if (!empty($fbPixelId) && !empty($fb_events_enabled['purchase'])): ?>
        <script>
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '<?php echo htmlspecialchars($fbPixelId); ?>');
        fbq('track', 'PageView');
        fbq('track', 'Purchase', {
            value: <?php echo (float)$sale_details['valor']; ?>,
            currency: 'BRL'
        });
        </script>
        <noscript><img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=<?php echo htmlspecialchars($fbPixelId); ?>&ev=Purchase&cd[value]=<?php echo (float)$sale_details['valor']; ?>&cd[currency]=BRL"
        /></noscript>
        <?php endif; ?>

        <?php // Google Analytics & Ads Purchase Event ?>
        <?php if ((!empty($gaId) || !empty($gAdsId)) && !empty($gg_events_enabled['purchase'])): 
            $google_primary_id = !empty($gAdsId) ? $gAdsId : $gaId;
        ?>
        <script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo htmlspecialchars($google_primary_id); ?>"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          <?php if (!empty($gAdsId)): ?>
          gtag('config', '<?php echo htmlspecialchars($gAdsId); ?>');
          <?php endif; ?>
          <?php if (!empty($gaId)): ?>
          gtag('config', '<?php echo htmlspecialchars($gaId); ?>');
          <?php endif; ?>

          gtag('event', 'purchase', {
            "transaction_id": "<?php echo htmlspecialchars($sale_details['transacao_id']); ?>",
            "value": <?php echo (float)$sale_details['valor']; ?>,
            "currency": "BRL",
            "items": [{
              "item_id": "<?php echo htmlspecialchars($sale_details['produto_id']); ?>",
              "item_name": "<?php echo htmlspecialchars($sale_details['produto_nome']); ?>",
              "price": <?php echo (float)$sale_details['valor']; ?>,
              "quantity": 1
            }]
          });
        </script>
        <?php endif; ?>

        <!-- NEW: STARFY TRACK - Purchase Event -->
        <?php if ($starfy_track_endpoint && $starfy_tracking_id_hash && $starfy_checkout_session_uuid): ?>
        <script>
            (function() {
                const STARFY_TRACK_ID_HASH = '<?php echo htmlspecialchars($starfy_tracking_id_hash); ?>';
                const TRACK_ENDPOINT = '<?php echo $starfy_track_endpoint; ?>';
                const CHECKOUT_SESSION_UUID = '<?php echo htmlspecialchars($starfy_checkout_session_uuid); ?>';
                const PRODUCT_ID = <?php echo (int)$sale_details['produto_id']; ?>;
                const PURCHASE_VALUE = <?php echo (float)$sale_details['valor']; ?>;

                // Send event to tracking endpoint
                function sendStarfyTrackEvent(eventType, eventData = {}) {
                    const payload = {
                        tracking_id: STARFY_TRACK_ID_HASH,
                        session_id: CHECKOUT_SESSION_UUID, // Use the checkout session UUID as the session_id for this event
                        event_type: eventType,
                        event_data: {
                            ...eventData,
                            url: window.location.href,
                            referrer: document.referrer,
                            transaction_id: '<?php echo htmlspecialchars($sale_details['transacao_id']); ?>',
                            product_id: PRODUCT_ID,
                            value: PURCHASE_VALUE,
                            currency: 'BRL'
                        }
                    };

                    fetch(TRACK_ENDPOINT, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    }).then(response => {
                        if (!response.ok) {
                            console.error('Starfy Track: Erro ao enviar evento ' + eventType + ':', response.statusText);
                        } else {
                            console.log('Starfy Track: Evento ' + eventType + ' enviado com sucesso.');
                        }
                    }).catch(error => {
                        console.error('Starfy Track: Erro de rede ao enviar evento ' + eventType + ':', error);
                    });
                }

                // Track Purchase on page load
                sendStarfyTrackEvent('purchase');
            })();
        </script>
        <?php endif; ?>
        <!-- Fim STARFY TRACK -->
        
    <?php endif; ?>
    <!-- Fim dos Scripts de Rastreamento -->

</head>
<body class="bg-gray-100 flex items-center justify-center min-h-screen p-4">
    <div class="w-full max-w-lg p-6 sm:p-8 bg-white rounded-2xl shadow-lg text-center">
        <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <i data-lucide="check-circle-2" class="h-12 w-12 text-green-600"></i>
        </div>
        <h1 class="text-3xl font-bold text-gray-800">Pagamento Recebido!</h1>
        <p class="text-gray-600 mt-4 text-lg">
            Obrigado pela sua compra! Em breve você receberá um e-mail com todos os detalhes e o acesso ao seu produto.
        </p>
        
        <?php if($sale_details && $sale_details['produto_nome']): ?>
            <div class="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p class="text-sm text-gray-500">Produto adquirido:</p>
                <p class="font-semibold text-gray-800"><?php echo htmlspecialchars($sale_details['produto_nome']); ?></p>
            </div>
        <?php endif; ?>

        <div class="mt-8">
            <a href="/" class="text-orange-600 font-semibold hover:underline">
                Voltar para a página inicial
            </a>
        </div>
        <?php if($payment_id): ?>
            <p class="text-xs text-gray-400 mt-10">ID da transação: <?php echo htmlspecialchars($payment_id); ?></p>
        <?php endif; ?>
    </div>
    <script>
        lucide.createIcons();
    </script>
</body>
</html>