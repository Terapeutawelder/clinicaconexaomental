<?php
header('Content-Type: application/json');
require 'config.php';
// Inclui o helper da UTMfy
if (file_exists('utmfy_helper.php')) {
    require_once 'utmfy_helper.php';
}

// Ativa o log de erros detalhado
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/process_payment_log.txt');

function log_process($msg)
{
    file_put_contents(__DIR__ . '/process_payment_log.txt', date('Y-m-d H:i:s') . " - " . $msg . "\n", FILE_APPEND);
}

log_process("INÃCIO DO PROCESSAMENTO");

$raw_post_data = file_get_contents('php://input');
$data = json_decode($raw_post_data, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados invÃ¡lidos.']);
    exit;
}

// Campos comuns
$required_fields = ['transaction_amount', 'email', 'cpf', 'name', 'phone', 'product_id'];
foreach ($required_fields as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Campo obrigatÃ³rio ausente: $field"]);
        exit;
    }
}

// 1. Descobrir Gateway e Credenciais
$main_product_id = $data['product_id'];
$gateway_choice = $data['gateway'] ?? 'mercadopago';

try {
    $stmt_prod = $pdo->prepare("SELECT usuario_id, nome FROM serviços WHERE id = ?");
    $stmt_prod->execute([$main_product_id]);
    $product_info = $stmt_prod->fetch(PDO::FETCH_ASSOC);
    if (!$product_info)
        throw new Exception("Serviço nÃ£o encontrado.");

    $usuario_id = $product_info['usuario_id'];
    $main_product_name = $product_info['nome'];

    $stmt_user = $pdo->prepare("SELECT mp_access_token, mp_seller_status, mp_seller_access_token, pushinpay_token FROM usuarios WHERE id = ?");
    $stmt_user->execute([$usuario_id]);
    $credentials = $stmt_user->fetch(PDO::FETCH_ASSOC);

    // URL Webhook
    $domainName = $_SERVER['HTTP_HOST'];
    $scriptDir = dirname($_SERVER['PHP_SELF']);
    $path = rtrim(str_replace('\\', '/', $scriptDir), '/');
    $webhook_url = "https://" . $domainName . $path . '/notification.php';

    // URL Obrigado
    $stmt_prod_conf = $pdo->prepare("SELECT checkout_config FROM serviços WHERE id = ?");
    $stmt_prod_conf->execute([$main_product_id]);
    $p_conf = $stmt_prod_conf->fetch(PDO::FETCH_ASSOC);
    $checkout_config = json_decode($p_conf['checkout_config'] ?? '{}', true);
    $redirect_url_after_approval = $checkout_config['redirectUrl'] ?? ("https://" . $domainName . $path . '/obrigado.php');

    log_process("Webhook URL gerada: " . $webhook_url);
    $checkout_session_uuid = uniqid('checkout_') . bin2hex(random_bytes(8));

    // UTMs
    $utm_parameters = $data['utm_parameters'] ?? [];

    // ==========================================================
    // FLUXO PUSHINPAY
    // ==========================================================
    if ($gateway_choice === 'pushinpay') {

        $token = $credentials['pushinpay_token'] ?? '';
        if (empty($token))
            throw new Exception("Token PushinPay nÃ£o configurado.");

        $amount_cents = (int) (round((float) $data['transaction_amount'], 2) * 100);
        $payload = [
            "value" => $amount_cents,
            "webhook_url" => $webhook_url,
            "payer" => [
                "name" => $data['name'],
                "document" => preg_replace('/[^0-9]/', '', $data['cpf']),
                "email" => $data['email']
            ]
        ];

        $ch = curl_init('https://api.pushinpay.com.br/api/pix/cashIn');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $token,
            'Content-Type: application/json'
        ]);

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $res_data = json_decode($response, true);

        if ($http_code >= 200 && $http_code < 300 && isset($res_data['qr_code_base64'])) {
            $payment_id = $res_data['id'];
            $status = 'pending';

            // Salva Venda
            save_sales($pdo, $data, $main_product_id, $payment_id, $status, 'Pix', $checkout_session_uuid, $utm_parameters);

            // --- DISPARO IMEDIATO PARA UTMFY (Status: Waiting Payment) ---
            if (function_exists('trigger_utmfy_integrations')) {
                // Monta estrutura de evento compatÃ­vel
                $event_data_utmfy = [
                    'transacao_id' => $payment_id,
                    'valor_total_compra' => $data['transaction_amount'],
                    'comprador' => [
                        'nome' => $data['name'],
                        'email' => $data['email'],
                        'telefone' => $data['phone'],
                        'cpf' => $data['cpf']
                    ],
                    'metodo_pagamento' => 'Pix',
                    'serviços_comprados' => [
                        [
                            'serviço_id' => $main_product_id,
                            'nome' => $main_product_name,
                            'valor' => $data['transaction_amount']
                        ]
                    ],
                    'utm_parameters' => $utm_parameters,
                    'data_venda' => date('Y-m-d H:i:s')
                ];
                trigger_utmfy_integrations($usuario_id, $event_data_utmfy, 'pending', $main_product_id);
            }
            // -------------------------------------------------------------

            echo json_encode([
                'status' => 'pix_created',
                'pix_data' => [
                    'qr_code_base64' => $res_data['qr_code_base64'],
                    'qr_code' => $res_data['qr_code'],
                    'payment_id' => $payment_id
                ],
                'redirect_url_after_approval' => $redirect_url_after_approval . '?payment_id=' . $payment_id
            ]);
            exit;

        } else {
            throw new Exception("PushinPay Error ($http_code)");
        }

        // ==========================================================
        // FLUXO MERCADO PAGO
        // ==========================================================
    } else {
        $token = $credentials['mp_access_token'] ?? '';
        if (empty($token))
            throw new Exception("Token Mercado Pago não configurado.");

        $payment_data = [
            'transaction_amount' => (float) $data['transaction_amount'],
            'description' => 'Compra: ' . $main_product_name,
            'payment_method_id' => $data['payment_method_id'],
            'payer' => [
                'email' => $data['email'],
                'first_name' => explode(' ', $data['name'])[0],
                'last_name' => substr(strstr($data['name'], ' '), 1) ?: '',
                'identification' => ['type' => 'CPF', 'number' => preg_replace('/[^0-9]/', '', $data['cpf'])],
            ],
            'binary_mode' => true,
            'statement_descriptor' => substr(preg_replace('/[^a-zA-Z0-9 ]/', '', $main_product_name), 0, 22),
            'external_reference' => $checkout_session_uuid,
            'notification_url' => $webhook_url
        ];

        // Adiciona telefone se disponível
        $phone_raw = preg_replace('/[^0-9]/', '', $data['phone'] ?? '');
        if (strlen($phone_raw) >= 10) {
            $payment_data['payer']['phone'] = [
                'area_code' => substr($phone_raw, 0, 2),
                'number' => substr($phone_raw, 2)
            ];
        }

        if (isset($data['token']))
            $payment_data['token'] = $data['token'];
        if (isset($data['installments']))
            $payment_data['installments'] = (int) $data['installments'];
        if (isset($data['issuer_id']))
            $payment_data['issuer_id'] = (int) $data['issuer_id'];

        $ch = curl_init('https://api.mercadopago.com/v1/payments');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $token,
            'X-Idempotency-Key: ' . $checkout_session_uuid
        ]);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payment_data));
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);


        $res_data = json_decode($response, true);

        if ($http_code >= 200 && $http_code < 300 && isset($res_data['status'])) {
            $status = $res_data['status'];
            $payment_id = $res_data['id'];
            $metodo = ($data['payment_method_id'] === 'pix') ? 'Pix' : (($data['payment_method_id'] === 'ticket') ? 'Boleto' : 'CartÃ£o de crÃ©dito');

            save_sales($pdo, $data, $main_product_id, $payment_id, $status, $metodo, $checkout_session_uuid, $utm_parameters);

            // --- DISPARO IMEDIATO PARA UTMFY ---
            if (function_exists('trigger_utmfy_integrations')) {
                $event_data_utmfy = [
                    'transacao_id' => $payment_id,
                    'valor_total_compra' => $data['transaction_amount'],
                    'comprador' => [
                        'nome' => $data['name'],
                        'email' => $data['email'],
                        'telefone' => $data['phone'],
                        'cpf' => $data['cpf']
                    ],
                    'metodo_pagamento' => $metodo,
                    'serviços_comprados' => [
                        [
                            'serviço_id' => $main_product_id,
                            'nome' => $main_product_name,
                            'valor' => $data['transaction_amount']
                        ]
                    ],
                    'utm_parameters' => $utm_parameters,
                    'data_venda' => date('Y-m-d H:i:s')
                ];
                // Se for aprovado instantaneamente (CartÃ£o), manda approved, senÃ£o pending
                $trigger_status = ($status === 'approved') ? 'approved' : 'pending';
                trigger_utmfy_integrations($usuario_id, $event_data_utmfy, $trigger_status, $main_product_id);
            }
            // ------------------------------------

            if ($status == 'pending' && $data['payment_method_id'] == 'pix') {
                echo json_encode([
                    'status' => 'pix_created',
                    'pix_data' => [
                        'qr_code_base64' => $res_data['point_of_interaction']['transaction_data']['qr_code_base64'],
                        'qr_code' => $res_data['point_of_interaction']['transaction_data']['qr_code'],
                        'payment_id' => $payment_id
                    ],
                    'redirect_url_after_approval' => $redirect_url_after_approval . '?payment_id=' . $payment_id
                ]);
                exit;
            }

            $response_front = ['status' => $status, 'message' => 'Processado.'];
            if ($status == 'approved')
                $response_front['redirect_url'] = $redirect_url_after_approval . '?payment_id=' . $payment_id;
            echo json_encode($response_front);

        } else {
            throw new Exception("Mercado Pago Error");
        }
    }

} catch (Exception $e) {
    http_response_code(500);
    log_process("Erro Exception: " . $e->getMessage());
    echo json_encode(['error' => $e->getMessage()]);
}

function save_sales($pdo, $data, $main_id, $payment_id, $status, $metodo, $uuid, $utm_params)
{
    // Extrai UTMs
    $utm_source = $utm_params['utm_source'] ?? null;
    $utm_campaign = $utm_params['utm_campaign'] ?? null;
    $utm_medium = $utm_params['utm_medium'] ?? null;
    $utm_content = $utm_params['utm_content'] ?? null;
    $utm_term = $utm_params['utm_term'] ?? null;
    $src = $utm_params['src'] ?? null;
    $sck = $utm_params['sck'] ?? null;

    $pdo->beginTransaction();
    try {
        $products = [$main_id];
        if (isset($data['order_bump_product_ids']) && is_array($data['order_bump_product_ids'])) {
            $products = array_merge($products, $data['order_bump_product_ids']);
        }

        $placeholders = implode(',', array_fill(0, count($products), '?'));
        $stmt_info = $pdo->prepare("SELECT id, preco, usuario_id FROM produtos WHERE id IN ($placeholders)");
        $stmt_info->execute($products);
        $prod_map = $stmt_info->fetchAll(PDO::FETCH_UNIQUE | PDO::FETCH_ASSOC);

        $stmt_insert = $pdo->prepare("INSERT INTO vendas (produto_id, comprador_nome, comprador_email, comprador_cpf, comprador_telefone, valor, status_pagamento, transacao_id, metodo_pagamento, checkout_session_uuid, email_entrega_enviado, utm_source, utm_campaign, utm_medium, utm_content, utm_term, src, sck) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?)");

        foreach ($products as $pid) {
            if (isset($prod_map[$pid])) {
                $val = $prod_map[$pid]['preco'];
                $usuario_id_prod = $prod_map[$pid]['usuario_id'] ?? 0;
                $stmt_insert->execute([
                    $pid,
                    $data['name'],
                    $data['email'],
                    preg_replace('/[^0-9]/', '', $data['cpf']),
                    preg_replace('/[^0-9]/', '', $data['phone']),
                    $val,
                    $status,
                    $payment_id,
                    $metodo,
                    $uuid,
                    $utm_source,
                    $utm_campaign,
                    $utm_medium,
                    $utm_content,
                    $utm_term,
                    $src,
                    $sck
                ]);
            }
        }
        $pdo->commit();

        // --- STARFY TRACK SERVER-SIDE (Confiabilidade de Rastreamento) ---
        // Registra o evento de compra diretamente no servidor para garantir que apareÃ§a no dashboard
        if ($status === 'approved' || $status === 'pending') { // Registra pending tambÃ©m, ou sÃ³ approved? Dashboard filtra por approved vendas, mas evento purchase geralmente Ã© approved.
            // Vamos registrar apenas se for 'approved' para consistÃªncia com 'purchases' count, 
            // MAS se for Pix/Boleto, o status inicial Ã© pending.
            // O dashboard filtra vendas por status_pagamento='approved'.
            // O evento 'purchase' serve para LIGAR a sessÃ£o.
            // Se registrarmos agora, e a venda for aprovada depois (webhook), o link jÃ¡ existe.
            // EntÃ£o Ã© seguro registrar.
            record_mentalpag_purchase_server_side($pdo, $main_id, $uuid, $payment_id, $data['transaction_amount']);
        }
        // -----------------------------------------------------------------

        // --- SISTEMA DE AFILIADOS (25% Recorrente) ---
        if ($status === 'approved' || $status === 'paga') {
            try {
                // 1. Verifica afiliado pelo email do comprador
                $buyer_email = $data['email'];
                $stmt_aff = $pdo->prepare("SELECT afiliado_por FROM usuarios WHERE email = ? LIMIT 1");
                $stmt_aff->execute([$buyer_email]);
                $affiliate_data = $stmt_aff->fetch(PDO::FETCH_ASSOC);

                if ($affiliate_data && !empty($affiliate_data['afiliado_por'])) {
                    $afiliado_id = $affiliate_data['afiliado_por'];
                    $valor_comissao = $data['transaction_amount'] * 0.25; // 25%

                    // Evita duplicidade
                    $stmt_check_comm = $pdo->prepare("SELECT id FROM comissoes WHERE transacao_id = ?");
                    $stmt_check_comm->execute([$payment_id]);

                    if ($stmt_check_comm->rowCount() == 0) {
                        $stmt_ins_comm = $pdo->prepare("INSERT INTO comissoes (afiliado_id, indicado_id, transacao_id, valor, status, data_criacao) VALUES (?, (SELECT id FROM usuarios WHERE email = ? LIMIT 1), ?, ?, 'aprovada', NOW())");
                        $stmt_ins_comm->execute([$afiliado_id, $buyer_email, $payment_id, $valor_comissao]);
                        error_log("AFILIADOS: Comissão de R$ $valor_comissao para ID $afiliado_id (Ref: $payment_id)");
                    }
                }
            } catch (Exception $e_aff) {
                error_log("AFILIADOS ERRO: " . $e_aff->getMessage());
            }
        }
        // ---------------------------------------------

    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Erro ao salvar vendas: " . $e->getMessage());
    }
}

function record_mentalpag_purchase_server_side($pdo, $main_product_id, $session_id, $transaction_id, $value)
{
    try {
        // Busca o ID de rastreamento interno para este serviço
        $stmt = $pdo->prepare("SELECT id FROM mentalpag_tracking_products WHERE serviço_id = ?");
        $stmt->execute([$main_product_id]);
        $tracking_product_id = $stmt->fetchColumn();

        if ($tracking_product_id) {
            $event_data = json_encode([
                'transaction_id' => $transaction_id,
                'product_id' => $main_product_id,
                'value' => $value,
                'currency' => 'BRL',
                'source' => 'server_side'
            ]);
            $event_type = 'purchase';

            // Verifica se jÃ¡ existe para evitar duplicatas (embora o UUID deva ser Ãºnico)
            $stmt_check = $pdo->prepare("SELECT COUNT(*) FROM mentalpag_tracking_events WHERE session_id = ? AND event_type = ? AND tracking_product_id = ?");
            $stmt_check->execute([$session_id, $event_type, $tracking_product_id]);

            if ($stmt_check->fetchColumn() == 0) {
                $stmt_insert = $pdo->prepare("INSERT INTO mentalpag_tracking_events (tracking_product_id, session_id, event_type, event_data) VALUES (?, ?, ?, ?)");
                $stmt_insert->execute([$tracking_product_id, $session_id, $event_type, $event_data]);
                error_log("STARFY TRACK: Evento de compra registrado via Server-Side. Session: $session_id");
            }
        }
    } catch (Exception $e) {
        error_log("STARFY TRACK ERROR: Falha ao registrar evento server-side: " . $e->getMessage());
    }
}
?>