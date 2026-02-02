<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
header('Content-Type: application/json');
ob_start(); // Inicia o buffer de saída para evitar problemas com headers já enviados

// Incluir PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// Ativar log de erros detalhado (APENAS PARA DEPURAÇÃO - REMOVA EM PRODUÇÃO!)
error_reporting(E_ALL); // Habilitar todos os erros
ini_set('display_errors', 0); // DESABILITAR exibição de erros no navegador para APIs
ini_set('log_errors', 1); // Habilita o log de erros
ini_set('error_log', __DIR__ . '/api_errors.log'); // Opcional: log personalizado para esta API

error_log("API: Script iniciado."); // Log para o início do script

// Incluir os arquivos do PHPMailer
$phpmailer_path = __DIR__ . '/PHPMailer/src/';
if (file_exists($phpmailer_path . 'Exception.php')) {
    require_once $phpmailer_path . 'Exception.php';
    error_log("API: PHPMailer Exception.php carregado com sucesso.");
} else {
    error_log("API: ERRO: PHPMailer Exception.php não encontrado em " . $phpmailer_path . 'Exception.php');
}
if (file_exists($phpmailer_path . 'PHPMailer.php')) {
    require_once $phpmailer_path . 'PHPMailer.php';
    error_log("API: PHPMailer PHPMailer.php carregado com sucesso.");
} else {
    error_log("API: ERRO: PHPMailer PHPMailer.php não encontrado em " . $phpmailer_path . 'PHPMailer.php');
}
if (file_exists($phpmailer_path . 'SMTP.php')) {
    require_once $phpmailer_path . 'SMTP.php';
    error_log("API: PHPMailer SMTP.php carregado com sucesso.");
} else {
    error_log("API: ERRO: PHPMailer SMTP.php não encontrado em " . $phpmailer_path . 'SMTP.php');
}


/**
 * Função para registrar mensagens em um arquivo de log.
 * @param string $message A mensagem a ser registrada.
 */
function log_webhook($message) {
    file_put_contents('webhook_log.txt', date('Y-m-d H:i:s') . " - " . $message . "\n", FILE_APPEND);
}

/**
 * Processa a entrega de um único servi�o, registrando acessos ou coletando dados para e-mail.
 *
 * @param array $product_data Detalhes do servi�o e da venda (`vendas` JOIN `servi�os`).
 * @param string $customer_email E-mail do comprador.
 * @return array Um array com 'success' (bool), 'product_name' (string), 'content_type' (string: 'link', 'pdf', 'area_membros'),
 * 'content_value' (string: URL, path_to_pdf, ou null para área de membros), e 'message' (string).
 */
function process_single_product_delivery($product_data, $customer_email) {
    global $pdo;

    $delivery_type = $product_data['tipo_entrega'];
    $delivery_content = $product_data['conteudo_entrega'];
    $product_name = $product_data['servi�o_nome'];
    $product_id_for_area_membros = $product_data['servi�o_id'];

    error_log("  Iniciando processamento de entrega para servi�o '$product_name'. Tipo: '$delivery_type'.");
    
    switch ($delivery_type) {
        case 'link':
            if (!empty($delivery_content)) {
                return ['success' => true, 'product_name' => $product_name, 'content_type' => 'link', 'content_value' => $delivery_content];
            } else {
                return ['success' => false, 'message' => "Conteúdo de entrega (link) vazio para o servi�o '$product_name'."];
            }
        case 'email_pdf':
            if (!empty($delivery_content)) {
                $pdf_path = 'uploads/' . $delivery_content;
                if (file_exists($pdf_path) && is_readable($pdf_path)) {
                    return ['success' => true, 'product_name' => $product_name, 'content_type' => 'pdf', 'content_value' => $pdf_path];
                } else {
                    return ['success' => false, 'message' => "Arquivo PDF não encontrado ou ilegível em: " . $pdf_path];
                }
            } else {
                return ['success' => false, 'message' => "Conteúdo de entrega (PDF) vazio para o servi�o '$product_name'."];
            }
        case 'area_membros':
            if (!empty($customer_email) && !empty($product_id_for_area_membros)) {
                $stmt_grant_access = $pdo->prepare("INSERT IGNORE INTO alunos_acessos (aluno_email, servi�o_id) VALUES (?, ?)");
                $stmt_grant_access->execute([$customer_email, $product_id_for_area_membros]);

                if ($stmt_grant_access->rowCount() > 0) {
                    error_log("    SUCESSO DE ENTREGA (Área de Membros): Acesso concedido para " . $customer_email . " ao servi�o ID " . $product_id_for_area_membros);
                    return ['success' => true, 'product_name' => $product_name, 'content_type' => 'area_membros', 'content_value' => null];
                } else {
                    error_log("    INFO DE ENTREGA (Área de Membros): Acesso para " . $customer_email . " ao servi�o ID " . $product_id_for_area_membros . " já existia ou falhou (IGNORADO).");
                    return ['success' => true, 'product_name' => $product_name, 'content_type' => 'area_membros', 'content_value' => null, 'message' => 'Acesso já concedido.'];
                }
            } else {
                return ['success' => false, 'message' => "E-mail do comprador ou ID do servi�o ausente para a área de membros do servi�o '$product_name'."];
            }
        default:
            return ['success' => false, 'message' => "Tipo de entrega desconhecido ('$delivery_type') para o servi�o '$product_name'."];
    }
}


/**
 * Função para enviar e-mail de entrega consolidado do servi�o.
 * Utiliza as configurações SMTP do administrador e um template personalizável.
 *
 * @param string $to_email E-mail do destinatário.
 * @param string $customer_name Nome do cliente.
 * @param array $processed_products_for_email Array de servi�os com detalhes de entrega formatados.
 * @param string|null $member_area_password Senha gerada para a área de membros, se houver.
 * @param string|null $member_area_login_url URL de login da área de membros.
 * @param string $email_subject Assunto do e-mail (do admin config).
 * @param string $email_html_template Template HTML do e-mail (do admin config).
 * @return bool True se o e-mail foi enviado com sucesso, false caso contrário.
 */
function send_delivery_email_consolidated($to_email, $customer_name, $processed_products_for_email, $member_area_password, $member_area_login_url, $email_subject, $email_html_template) {
    global $pdo;

    $mail = new PHPMailer(true); // Habilita exceções

    try {
        // Obter configurações SMTP da tabela `configuracoes`
        $stmt_smtp_configs = $pdo->prepare("SELECT chave, valor FROM configuracoes WHERE chave IN ('smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'smtp_encryption', 'smtp_from_email', 'smtp_from_name')");
        $stmt_smtp_configs->execute();
        $smtp_configs_raw = $stmt_smtp_configs->fetchAll(PDO::FETCH_KEY_PAIR);
        
        $smtp_config = [
            'host' => $smtp_configs_raw['smtp_host'] ?? '',
            'port' => (int)($smtp_configs_raw['smtp_port'] ?? 587),
            'username' => $smtp_configs_raw['smtp_username'] ?? '',
            'password' => $smtp_configs_raw['smtp_password'] ?? '',
            'encryption' => $smtp_configs_raw['smtp_encryption'] ?? 'tls',
            'from_email' => $smtp_configs_raw['smtp_from_email'] ?? '',
            'from_name' => $smtp_configs_raw['smtp_from_name'] ?? 'Starfy'
        ];

        // Adiciona logging das configurações SMTP
        error_log("EMAIL_DELIVERY: Configurações SMTP obtidas para envio: " . print_r($smtp_config, true));

        // Configurar PHPMailer para usar SMTP ou PHP Mailer padrão
        if (empty($smtp_config['host']) || empty($smtp_config['username']) || empty($smtp_config['password'])) {
            error_log("SMTP: Credenciais não configuradas. Tentando usar a função mail() padrão.");
            $mail->isMail();
            $default_from_email = $smtp_config['from_email'] ?: ("nao-responda@" . parse_url($_SERVER['HTTP_HOST'], PHP_URL_HOST));
            $mail->setFrom($default_from_email, $smtp_config['from_name']);
        } else {
            $mail->isSMTP();
            $mail->Host = $smtp_config['host'];
            $mail->Port = $smtp_config['port'];
            $mail->SMTPAuth = true;
            $mail->Username = $smtp_config['username'];
            $mail->Password = $smtp_config['password'];
            
            // SMTPOptions para aceitar certificados autoassinados (cuidado em produção)
            $mail->SMTPOptions = array(
                'ssl' => array(
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                )
            );

            if ($smtp_config['encryption'] === 'ssl') {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            } elseif ($smtp_config['encryption'] === 'tls') {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            } else {
                $mail->SMTPSecure = false;
                $mail->SMTPAutoTLS = false;
            }
            // CORREÇÃO: Usar o username como 'From' address para evitar "Sender address rejected"
            $mail->setFrom($smtp_config['username'], $smtp_config['from_name']);
            error_log("SMTP: Usando configurações: Host=" . $smtp_config['host'] . ", User=" . $smtp_config['username'] . ", Port=" . $smtp_config['port'] . ", Enc=" . $smtp_config['encryption']);
        }

        $mail->CharSet = 'UTF-8';
        $mail->addAddress($to_email, $customer_name);
        $mail->Subject = $email_subject;
        $mail->isHTML(true);

        // Substituições de placeholders globais
        $html_body = str_replace(
            ['{CLIENT_NAME}', '{CLIENT_EMAIL}', '{MEMBER_AREA_PASSWORD}', '{MEMBER_AREA_LOGIN_URL}'],
            [
                htmlspecialchars($customer_name ?? ''), // Adicionado null coalescing para evitar deprecation warning
                htmlspecialchars($to_email ?? ''),       // Adicionado null coalescing para evitar deprecation warning
                htmlspecialchars($member_area_password ?? 'Não aplicável'),
                htmlspecialchars($member_area_login_url ?? '#')
            ],
            $email_html_template
        );

        // Processar blocos de servi�os dentro do template
        $products_html_blocks = [];
        $product_loop_start_tag = '<!-- LOOP_PRODUCTS_START -->';
        $product_loop_end_tag = '<!-- LOOP_PRODUCTS_END -->';

        if (strpos($html_body, $product_loop_start_tag) !== false && strpos($html_body, $product_loop_end_tag) !== false) {
            $loop_template = substr(
                $html_body,
                strpos($html_body, $product_loop_start_tag) + strlen($product_loop_start_tag),
                strpos($html_body, $product_loop_end_tag) - (strpos($html_body, $product_loop_start_tag) + strlen($product_loop_start_tag))
            );

            foreach ($processed_products_for_email as $product) {
                $current_product_block = $loop_template;
                $current_product_block = str_replace('{PRODUCT_NAME}', htmlspecialchars($product['product_name']), $current_product_block);

                // Handle conditional content based on product type
                $product_type_markers = [
                    'link'        => ['<!-- IF_PRODUCT_TYPE_LINK -->', '<!-- END_IF_PRODUCT_TYPE_LINK -->'],
                    'pdf'         => ['<!-- IF_PRODUCT_TYPE_PDF -->', '<!-- END_IF_PRODUCT_TYPE_PDF -->'],
                    'area_membros' => ['<!-- IF_PRODUCT_TYPE_MEMBER_AREA -->', '<!-- END_IF_PRODUCT_TYPE_MEMBER_AREA -->']
                ];

                // Passo 1: Processar blocos condicionais (IFs)
                foreach ($product_type_markers as $type => $markers) {
                    $start = strpos($current_product_block, $markers[0]);
                    $end = strpos($current_product_block, $markers[1]);

                    if ($start !== false && $end !== false) {
                        $block_content = substr($current_product_block, $start + strlen($markers[0]), $end - ($start + strlen($markers[0])));
                        if ($product['content_type'] === $type) {
                            // MANTÉM O BLOCO

                            // Substituições específicas da área de membros (se estiverem dentro do bloco)
                            $block_content = str_replace('{MEMBER_AREA_PASSWORD}', htmlspecialchars($member_area_password ?? ''), $block_content);
                            $block_content = str_replace('{MEMBER_AREA_LOGIN_URL}', htmlspecialchars($member_area_login_url ?? ''), $block_content);
                            
                            $current_product_block = str_replace($markers[0] . $block_content . $markers[1], $block_content, $current_product_block);
                        } else {
                            // Remove this block (tipo não corresponde)
                            $current_product_block = str_replace($markers[0] . $block_content . $markers[1], '', $current_product_block);
                        }
                    }
                }
                
                // Passo 2: Substituir placeholders de conteúdo (link, etc.) DEPOIS de processar os blocos IF
                // Isso permite que {PRODUCT_LINK} seja usado dentro ou fora dos blocos IF
                
                $product_link_value = ''; // Inicia vazio
                if ($product['content_type'] === 'link' && !empty($product['content_value'])) {
                    $product_link_value = $product['content_value'];
                }
                
                // CORREÇÃO: Não usar htmlspecialchars em URLs para o {PRODUCT_LINK}
                // $product_link_value é o link real apenas se o tipo for 'link'.
                $current_product_block = str_replace('{PRODUCT_LINK}', $product_link_value, $current_product_block);

                // Substituições de área de membros (caso estejam fora do bloco IF)
                $current_product_block = str_replace('{MEMBER_AREA_PASSWORD}', htmlspecialchars($member_area_password ?? 'Não aplicável'), $current_product_block);
                $current_product_block = str_replace('{MEMBER_AREA_LOGIN_URL}', htmlspecialchars($member_area_login_url ?? '#'), $current_product_block);

                
                $products_html_blocks[] = $current_product_block;
            }
            $html_body = str_replace($product_loop_start_tag . $loop_template . $product_loop_end_tag, implode('', $products_html_blocks), $html_body);
        }

        $mail->Body = $html_body;
        $mail->AltBody = strip_tags($html_body); // Fallback para clientes de e-mail que não suportam HTML

        // Adicionar anexos PDF
        foreach ($processed_products_for_email as $product) {
            if ($product['content_type'] === 'pdf' && file_exists($product['content_value'])) {
                $mail->addAttachment($product['content_value'], basename($product['content_value']));
            }
        }
        
        $mail->send();
        error_log("SUCESSO DE ENTREGA: E-mail consolidado enviado para " . $to_email);
        return true;
    } catch (Exception $e) {
        error_log("FALHA DE ENTREGA (E-mail): O e-mail para " . $to_email . " não pôde ser enviado. Erro: " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
        return false;
    }
}


try {
    require_once 'config.php';
    error_log("API: config.php carregado com sucesso.");

    // Verificação de segurança: Apenas usuários LOGADOS (não importa se é admin ou user) podem acessar esta API.
    // O tipo 'admin' específico será tratado no admin_api.php.
    if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true || !isset($_SESSION['id'])) {
        http_response_code(403);
        ob_clean(); // Limpa o buffer antes de enviar o JSON
        echo json_encode(['error' => 'Acesso não autorizado']);
        exit;
    }

    $usuario_id_logado = $_SESSION['id'];
    $action = $_GET['action'] ?? '';
    
    // Para POST requests, a ação pode vir no corpo
    if (empty($action) && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? $action;
    }

    error_log("API: Ação recebida: " . $action);

    // Ação para obter dados do dashboard do usuário
    if ($action == 'get_dashboard_data') {
        $response = [
            'kpis' => [],
            'chart' => []
        ];

        $period = $_GET['period'] ?? 'today';
        $date_filter_sql = '';
        $chart_labels = [];
        $chart_data_template = [];
        $chart_group_by_clause = '';

        // O fuso horário da sessão do MySQL já é definido em config.php
        // $pdo->exec("SET time_zone = 'America/Sao_Paulo';"); // Removido para evitar redundância e erro "Unknown or incorrect time zone" se DB não tiver tabelas de TZ

        switch ($period) {
            case 'today':
                $date_filter_sql = "AND DATE(v.data_venda) = CURDATE()";
                $chart_group_by_clause = "DATE_FORMAT(v.data_venda, '%Y-%m-%d %H:00')"; // Agrupa por hora
                for ($i = 0; $i < 24; $i++) {
                    $hour_label = sprintf('%02d:00', $i);
                    $date_hour_key = date('Y-m-d') . ' ' . $hour_label; // Chave com 'YYYY-M-D HH:00'
                    $chart_labels[] = $hour_label;
                    $chart_data_template[$date_hour_key] = 0;
                }
                break;
            case 'yesterday':
                $date_filter_sql = "AND DATE(v.data_venda) = CURDATE() - INTERVAL 1 DAY";
                $chart_group_by_clause = "DATE_FORMAT(v.data_venda, '%Y-%m-%d %H:00')"; // Agrupa por hora
                $yesterday_date = date('Y-m-d', strtotime('-1 day'));
                for ($i = 0; $i < 24; $i++) {
                    $hour_label = sprintf('%02d:00', $i);
                    $date_hour_key = $yesterday_date . ' ' . $hour_label; // Chave com 'YYYY-M-D HH:00'
                    $chart_labels[] = $hour_label;
                    $chart_data_template[$date_hour_key] = 0;
                }
                break;
            case '7days':
                $date_filter_sql = "AND v.data_venda >= CURDATE() - INTERVAL 6 DAY";
                $chart_group_by_clause = "DATE_FORMAT(v.data_venda, '%Y-%m-%d')";
                for ($i = 6; $i >= 0; $i--) {
                    $date = date('Y-m-d', strtotime("-$i days"));
                    $chart_labels[] = date('d/m', strtotime($date));
                    $chart_data_template[$date] = 0;
                }
                break;
            case 'month':
                $date_filter_sql = "AND MONTH(v.data_venda) = MONTH(CURDATE()) AND YEAR(v.data_venda) = YEAR(CURDATE())";
                $chart_group_by_clause = "DATE_FORMAT(v.data_venda, '%Y-%m-%d')";
                $days_in_month = date('t'); // Number of days in the current month
                $first_day_of_month = date('Y-m-01');
                for ($i = 0; $i < $days_in_month; $i++) {
                    $date = date('Y-m-d', strtotime("+$i days", strtotime($first_day_of_month)));
                    $chart_labels[] = date('d/m', strtotime($date));
                    $chart_data_template[$date] = 0;
                }
                break;
            case 'year':
                $date_filter_sql = "AND YEAR(v.data_venda) = YEAR(CURDATE())";
                $chart_group_by_clause = "DATE_FORMAT(v.data_venda, '%Y-%m')";
                // Gera os rótulos para os últimos 12 meses, incluindo o atual
                for ($i = 11; $i >= 0; $i--) { // Começa 11 meses atrás até o mês atual
                    $month_ts = strtotime("-$i months", strtotime(date('Y-m-01')));
                    $month_key = date('Y-m', $month_ts);
                    $chart_labels[] = date('m/Y', $month_ts);
                    $chart_data_template[$month_key] = 0;
                }
                // O array chart_labels e chart_data_template já está na ordem correta (mais antigo para mais novo)
                break;
            case 'all': // For 'all', chart should still show recent data (e.g., last 30 days), as lifetime is in KPI
            default:
                $date_filter_sql = "AND v.data_venda >= CURDATE() - INTERVAL 29 DAY";
                $chart_group_by_clause = "DATE_FORMAT(v.data_venda, '%Y-%m-%d')";
                for ($i = 29; $i >= 0; $i--) {
                    $date = date('Y-m-d', strtotime("-$i days"));
                    $chart_labels[] = date('d/m', strtotime($date));
                    $chart_data_template[$date] = 0;
                }
                break;
        }

        // --- Geração de KPIs ---
        $query_base = "
            SELECT 
                SUM(CASE WHEN v.status_pagamento = 'approved' THEN v.valor ELSE 0 END) AS vendas_totais,
                COUNT(CASE WHEN v.status_pagamento = 'approved' THEN v.id ELSE NULL END) AS quantidade_vendas,
                SUM(CASE WHEN v.status_pagamento = 'refunded' THEN v.valor ELSE 0 END) AS reembolsos,
                SUM(CASE WHEN v.status_pagamento = 'charged_back' THEN v.valor ELSE 0 END) AS chargebacks,
                -- MODIFICADO: Inclui 'cancelled' e 'info_filled' nos carrinhos abandonados gerais
                COUNT(CASE WHEN v.status_pagamento IN ('pending', 'in_process', 'cancelled', 'info_filled') THEN v.id ELSE NULL END) AS abandono_carrinho,
                -- NOVO: Vendas Pendentes (agora inclui 'cancelled')
                SUM(CASE WHEN v.status_pagamento IN ('pending', 'in_process', 'cancelled') THEN v.valor ELSE 0 END) AS vendas_pendentes_valor,
                COUNT(CASE WHEN v.status_pagamento IN ('pending', 'in_process', 'cancelled') THEN v.id ELSE NULL END) AS vendas_pendentes_quantidade,
                SUM(CASE WHEN v.metodo_pagamento = 'Pix' AND v.status_pagamento = 'approved' THEN v.valor ELSE 0 END) AS pix_vendas_valor,
                COUNT(CASE WHEN v.metodo_pagamento = 'Pix' AND v.status_pagamento = 'approved' THEN v.id ELSE NULL END) AS pix_vendas_count,
                COUNT(CASE WHEN v.metodo_pagamento = 'Pix' THEN v.id ELSE NULL END) AS pix_iniciadas_count,
                SUM(CASE WHEN v.metodo_pagamento = 'Boleto' AND v.status_pagamento = 'approved' THEN v.valor ELSE 0 END) AS boleto_vendas_valor,
                COUNT(CASE WHEN v.metodo_pagamento = 'Boleto' AND v.status_pagamento = 'approved' THEN v.id ELSE NULL END) AS boleto_vendas_count,
                COUNT(CASE WHEN v.metodo_pagamento = 'Boleto' THEN v.id ELSE NULL END) AS boleto_iniciadas_count,
                SUM(CASE WHEN v.metodo_pagamento = 'Cartão de crédito' AND v.status_pagamento = 'approved' THEN v.valor ELSE 0 END) AS cartao_vendas_valor,
                COUNT(CASE WHEN v.metodo_pagamento = 'Cartão de crédito' AND v.status_pagamento = 'approved' THEN v.id ELSE NULL END) AS cartao_vendas_count,
                COUNT(CASE WHEN v.metodo_pagamento = 'Cartão de crédito' THEN v.id ELSE NULL END) AS cartao_iniciadas_count,
                COUNT(v.id) AS total_iniciadas_count,
                -- NOVO: Adicionado para calcular a taxa de conversão geral excluindo 'info_filled'
                COUNT(CASE WHEN v.status_pagamento NOT IN ('info_filled') THEN v.id ELSE NULL END) AS total_iniciadas_para_conversao_count,
                SUM(CASE WHEN v.status_pagamento = 'approved' THEN v.valor ELSE 0 END) AS total_faturamento_lifetime_current_period
            FROM vendas v
            JOIN servi�os p ON v.servi�o_id = p.id
            WHERE p.usuario_id = :usuario_id
            {$date_filter_sql}
        ";

        $stmt_kpis = $pdo->prepare($query_base);
        $stmt_kpis->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
        $stmt_kpis->execute();
        $kpis_data = $stmt_kpis->fetch(PDO::FETCH_ASSOC);

        $response['kpis']['vendas_totais'] = number_format($kpis_data['vendas_totais'] ?? 0, 2, ',', '.');
        $response['kpis']['quantidade_vendas'] = $kpis_data['quantidade_vendas'] ?? 0;
        $response['kpis']['ticket_medio'] = ($kpis_data['quantidade_vendas'] > 0) ? number_format($kpis_data['vendas_totais'] / $kpis_data['quantidade_vendas'], 2, ',', '.') : '0,00';
        
        $stmt_total_servi�os = $pdo->prepare("SELECT COUNT(id) FROM servi�os WHERE usuario_id = :usuario_id");
        $stmt_total_servi�os->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
        $stmt_total_servi�os->execute();
        $response['kpis']['total_servi�os'] = $stmt_total_servi�os->fetchColumn();

        // NOVO: KPIs para vendas pendentes (incluindo canceladas)
        $response['kpis']['vendas_pendentes_valor'] = number_format($kpis_data['vendas_pendentes_valor'] ?? 0, 2, ',', '.');
        $response['kpis']['vendas_pendentes_quantidade'] = $kpis_data['vendas_pendentes_quantidade'] ?? 0;

        $response['kpis']['abandono_carrinho'] = $kpis_data['abandono_carrinho'] ?? 0;
        $response['kpis']['reembolsos'] = number_format($kpis_data['reembolsos'] ?? 0, 2, ',', '.');
        $response['kpis']['chargebacks'] = number_format($kpis_data['chargebacks'] ?? 0, 2, ',', '.');
        
        // Faturamento Lifetime (sempre o total aprovado, sem filtro de data)
        $stmt_lifetime_faturamento = $pdo->prepare("SELECT SUM(valor) FROM vendas v JOIN servi�os p ON v.servi�o_id = p.id WHERE p.usuario_id = :usuario_id AND v.status_pagamento = 'approved'");
        $stmt_lifetime_faturamento->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
        $stmt_lifetime_faturamento->execute();
        $response['kpis']['total_faturamento_lifetime'] = (float)($stmt_lifetime_faturamento->fetchColumn() ?? 0);

        // Taxas de Conversão
        $total_aprovadas_current_period = $kpis_data['quantidade_vendas'];
        // MODIFICADO: Usa a nova contagem para o denominador da taxa de conversão geral
        $total_iniciadas_current_period_for_conversion = $kpis_data['total_iniciadas_para_conversao_count']; 

        $response['kpis']['taxa_conversao_geral'] = ($total_iniciadas_current_period_for_conversion > 0) ? number_format(($total_aprovadas_current_period / $total_iniciadas_current_period_for_conversion) * 100, 2, ',', '.') . '%' : '0%';

        $response['kpis']['pix_vendas_valor'] = number_format($kpis_data['pix_vendas_valor'] ?? 0, 2, ',', '.');
        $response['kpis']['pix_vendas_percentual'] = ($kpis_data['pix_iniciadas_count'] > 0) ? number_format(($kpis_data['pix_vendas_count'] / $kpis_data['pix_iniciadas_count']) * 100, 2, ',', '.') . '%' : '0%';

        $response['kpis']['boleto_vendas_valor'] = number_format($kpis_data['boleto_vendas_valor'] ?? 0, 2, ',', '.');
        $response['kpis']['boleto_vendas_percentual'] = ($kpis_data['boleto_iniciadas_count'] > 0) ? number_format(($kpis_data['boleto_vendas_count'] / $kpis_data['boleto_iniciadas_count']) * 100, 2, ',', '.') . '%' : '0%';
        
        $response['kpis']['cartao_vendas_valor'] = number_format($kpis_data['cartao_vendas_valor'] ?? 0, 2, ',', '.');
        $response['kpis']['cartao_vendas_percentual'] = ($kpis_data['cartao_iniciadas_count'] > 0) ? number_format(($kpis_data['cartao_vendas_count'] / $kpis_data['cartao_iniciadas_count']) * 100, 2, ',', '.') . '%' : '0%';

        // --- Dados do Gráfico ---
        $sql_chart = "
            SELECT {$chart_group_by_clause} as period_label, SUM(v.valor) as total_period
            FROM vendas v
            JOIN servi�os p ON v.servi�o_id = p.id
            WHERE p.usuario_id = :usuario_id AND v.status_pagamento = 'approved'
            {$date_filter_sql}
            GROUP BY period_label ORDER BY period_label ASC
        ";

        $stmt_chart = $pdo->prepare($sql_chart);
        $stmt_chart->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
        $stmt_chart->execute();
        $vendas_chart_data = $stmt_chart->fetchAll(PDO::FETCH_KEY_PAIR);

        foreach ($chart_data_template as $period_label => $default_value) {
            $chart_data_template[$period_label] = (float)($vendas_chart_data[$period_label] ?? 0);
        }

        $response['chart']['labels'] = $chart_labels;
        $response['chart']['data'] = array_values($chart_data_template);

        ob_clean(); // Limpa o buffer antes de enviar o JSON
        echo json_encode($response);
        exit;
    }

    // NOVO: Ação para obter dados para a Jornada Starfy
    if ($action == 'get_jornada_Starfy_data') {
        $response = ['total_faturamento_lifetime' => 0];

        try {
            // Faturamento Lifetime (sempre o total aprovado, sem filtro de data)
            $stmt_lifetime_faturamento = $pdo->prepare("SELECT SUM(valor) FROM vendas v JOIN servi�os p ON v.servi�o_id = p.id WHERE p.usuario_id = :usuario_id AND v.status_pagamento = 'approved'");
            $stmt_lifetime_faturamento->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt_lifetime_faturamento->execute();
            $response['total_faturamento_lifetime'] = (float)($stmt_lifetime_faturamento->fetchColumn() ?? 0);

            ob_clean();
            echo json_encode($response);
            exit;
        } catch (PDOException $e) {
            http_response_code(500);
            ob_clean();
            error_log("API: Erro ao buscar dados da Jornada Starfy (get_jornada_Starfy_data): " . $e->getMessage());
            echo json_encode(['error' => 'Erro ao buscar dados da Jornada Starfy.']);
            exit;
        }
    }


    // Ações de gerenciamento de vendas (para index.php?pagina=vendas)
    if ($action == 'get_vendas') {
        $status_filter = $_GET['status'] ?? 'all';
        $search_query = $_GET['search'] ?? '';
        $page = isset($_GET['page']) && is_numeric($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = 10;
        $offset = ($page - 1) * $limit;

        $where_clauses = ["p.usuario_id = :usuario_id"];
        $params = [':usuario_id' => $usuario_id_logado];

        // MODIFICADO: Lógica para os novos filtros de carrinho abandonado
        if ($status_filter === 'abandoned_all') {
            $where_clauses[] = "v.status_pagamento IN ('pending', 'cancelled', 'info_filled')";
        } elseif ($status_filter === 'info_filled') {
            $where_clauses[] = "v.status_pagamento = 'info_filled'";
        } elseif ($status_filter !== 'all') {
            $where_clauses[] = "v.status_pagamento = :status_filter";
            $params[':status_filter'] = $status_filter;
        }

        if (!empty($search_query)) {
            $where_clauses[] = "(v.comprador_nome LIKE :search_query OR v.comprador_email LIKE :search_query)";
            $params[':search_query'] = '%' . $search_query . '%';
        }

        $where_sql = count($where_clauses) > 0 ? 'WHERE ' . implode(' AND ', $where_clauses) : '';

        // Contar total de vendas para paginação
        $stmt_count = $pdo->prepare("SELECT COUNT(v.id) FROM vendas v JOIN servi�os p ON v.servi�o_id = p.id {$where_sql}");
        $stmt_count->execute($params);
        $total_records = $stmt_count->fetchColumn();
        $total_pages = $total_records > 0 ? ceil($total_records / $limit) : 1;

        // Fetch vendas
        $sql_vendas = "
            SELECT 
                v.id, v.valor, v.status_pagamento, v.data_venda, 
                v.comprador_email, v.comprador_nome, v.comprador_cpf, v.comprador_telefone, 
                v.metodo_pagamento, p.nome AS servi�o_nome, p.tipo_entrega
            FROM vendas v
            JOIN servi�os p ON v.servi�o_id = p.id
            {$where_sql}
            ORDER BY v.data_venda DESC
            LIMIT :limit OFFSET :offset
        ";
        $stmt_vendas = $pdo->prepare($sql_vendas);
        foreach ($params as $key => $val) {
            $stmt_vendas->bindValue($key, $val);
        }
        $stmt_vendas->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt_vendas->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt_vendas->execute();
        $vendas = $stmt_vendas->fetchAll(PDO::FETCH_ASSOC);

        // Fetch métricas para os cards
        $stmt_metrics = $pdo->prepare("
            SELECT
                COUNT(v.id) AS all_count,
                COUNT(CASE WHEN v.status_pagamento = 'approved' THEN v.id ELSE NULL END) AS approved_count,
                COUNT(CASE WHEN v.status_pagamento IN ('pending', 'cancelled', 'info_filled') THEN v.id ELSE NULL END) AS abandoned_all_count, -- NOVO: Todos os abandonados
                COUNT(CASE WHEN v.status_pagamento = 'info_filled' THEN v.id ELSE NULL END) AS info_filled_count, -- NOVO: Abandonados com info preenchida
                COUNT(CASE WHEN v.status_pagamento = 'refunded' THEN v.id ELSE NULL END) AS refunded_count,
                COUNT(CASE WHEN v.status_pagamento = 'charged_back' THEN v.id ELSE NULL END) AS charged_back_count
            FROM vendas v
            JOIN servi�os p ON v.servi�o_id = p.id
            WHERE p.usuario_id = :usuario_id
        ");
        $stmt_metrics->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
        $stmt_metrics->execute();
        $metrics_data = $stmt_metrics->fetch(PDO::FETCH_ASSOC);

        ob_clean();
        echo json_encode([
            'vendas' => $vendas,
            'pagination' => [
                'currentPage' => $page,
                'totalPages' => $total_pages,
                'totalRecords' => $total_records
            ],
            'metrics' => [
                'all' => $metrics_data['all_count'],
                'approved' => $metrics_data['approved_count'],
                'abandoned_all' => $metrics_data['abandoned_all_count'], // NOVO
                'info_filled' => $metrics_data['info_filled_count'],   // NOVO
                'refunded' => $metrics_data['refunded_count'],
                'charged_back' => $metrics_data['charged_back_count']
            ]
        ]);
        exit;
    }
    
    // NOVO: Ação para reenviar e-mail de acesso
    if ($action == 'resend_access_email' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $venda_id = $input['venda_id'] ?? null;

        if (!$venda_id) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'ID da venda é obrigatório.']);
            exit;
        }

        try {
            // 1. Obter detalhes da venda principal e da sessão de checkout
            $stmt_main_sale = $pdo->prepare("
                SELECT 
                    v.id, v.servi�o_id, v.comprador_email, v.comprador_nome, v.checkout_session_uuid, v.metodo_pagamento, v.status_pagamento, 
                    p.usuario_id, p.nome AS servi�o_nome, p.checkout_config
                FROM vendas v
                JOIN servi�os p ON v.servi�o_id = p.id
                WHERE v.id = :venda_id AND p.usuario_id = :usuario_id
            ");
            $stmt_main_sale->bindParam(':venda_id', $venda_id, PDO::PARAM_INT);
            $stmt_main_sale->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt_main_sale->execute();
            $main_sale_details = $stmt_main_sale->fetch(PDO::FETCH_ASSOC);

            if (!$main_sale_details) {
                http_response_code(404);
                ob_clean();
                echo json_encode(['success' => false, 'error' => 'Venda não encontrada ou não pertence a você.']);
                exit;
            }

            // Apenas reenviar se o status for aprovado
            if ($main_sale_details['status_pagamento'] !== 'approved') {
                http_response_code(400);
                ob_clean();
                echo json_encode(['success' => false, 'error' => 'O reenvio de acesso é permitido apenas para vendas aprovadas.']);
                exit;
            }

            $customer_email = $main_sale_details['comprador_email'];
            $customer_name = $main_sale_details['comprador_nome'];
            $checkout_session_uuid = $main_sale_details['checkout_session_uuid'];

            // 2. Recuperar TODOS os servi�os associados a esta checkout_session_uuid
            $stmt_all_products_in_session = $pdo->prepare("
                SELECT 
                    v.id, v.servi�o_id, v.valor, p.nome AS servi�o_nome, 
                    p.tipo_entrega, p.conteudo_entrega
                FROM vendas v
                JOIN servi�os p ON v.servi�o_id = p.id
                WHERE v.checkout_session_uuid = :checkout_session_uuid AND p.usuario_id = :usuario_id
            ");
            $stmt_all_products_in_session->bindParam(':checkout_session_uuid', $checkout_session_uuid, PDO::PARAM_STR);
            $stmt_all_products_in_session->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt_all_products_in_session->execute();
            $all_products_for_delivery = $stmt_all_products_in_session->fetchAll(PDO::FETCH_ASSOC);

            if (empty($all_products_for_delivery)) {
                http_response_code(404);
                ob_clean();
                echo json_encode(['success' => false, 'error' => 'Nenhum servi�o encontrado para esta sessão de checkout.']);
                exit;
            }

            $processed_products_for_email = [];
            $member_area_password_for_delivery = null;
            $member_area_login_url = null;

            // Fetch email template, subject and member area login URL from global config
            $stmt_email_config = $pdo->query("SELECT chave, valor FROM configuracoes WHERE chave IN ('email_template_delivery_subject', 'email_template_delivery_html', 'member_area_login_url')");
            $email_configs = $stmt_email_config->fetchAll(PDO::FETCH_KEY_PAIR);
            $email_subject = $email_configs['email_template_delivery_subject'] ?? 'Seus Acessos Foram Liberados!';
            $email_html_template = $email_configs['email_template_delivery_html'] ?? '';
            $member_area_login_url_config = $email_configs['member_area_login_url'] ?? '';

            // Get existing password or generate new for member area products
            $stmt_get_user_pass = $pdo->prepare("SELECT senha FROM usuarios WHERE usuario = ? AND tipo = 'usuario'");
            $stmt_get_user_pass->execute([$customer_email]);
            $existing_user_password_hash = $stmt_get_user_pass->fetchColumn();

            // In an ideal world, we'd recover the *original* plaintext password.
            // But since we only store hashes, we must either generate a new one
            // or inform the user to use "forgot password". For re-send access,
            // generating a new temporary one is more user-friendly.
            $new_password_for_delivery = bin2hex(random_bytes(8));
            $hashed_new_password = password_hash($new_password_for_delivery, PASSWORD_DEFAULT);

            // Update user's password in `usuarios` table, or create if not exists
            $stmt_check_user = $pdo->prepare("SELECT id FROM usuarios WHERE usuario = ? AND tipo = 'usuario'");
            $stmt_check_user->execute([$customer_email]);
            $existing_user = $stmt_check_user->fetch(PDO::FETCH_ASSOC);

            if ($existing_user) {
                // User exists. MUST reset password to show it in the email as requested.
                // Original password cannot be retrieved (hashed).
                $stmt_update_user = $pdo->prepare("UPDATE usuarios SET senha = ?, nome = ? WHERE id = ?");
                $stmt_update_user->execute([$hashed_new_password, $customer_name, $existing_user['id']]);
                error_log("API: Reenviar Acesso (Área de Membros): Senha resetada para usuário existente (Solicitação explícita de senha no email): " . $customer_email);
                $member_area_password_for_delivery = $new_password_for_delivery;
            } else {
                $stmt_insert_user = $pdo->prepare("INSERT INTO usuarios (usuario, nome, senha, tipo) VALUES (?, ?, ?, 'usuario')");
                $stmt_insert_user->execute([$customer_email, $customer_name, $hashed_new_password]);
                error_log("API: Reenviar Acesso (Área de Membros): Novo usuário criado: " . $customer_email);
                $member_area_password_for_delivery = $new_password_for_delivery;
            }
            $member_area_login_url = $member_area_login_url_config;

            // Process each product for delivery content
            foreach ($all_products_for_delivery as $product) {
                $delivery_result = process_single_product_delivery($product, $customer_email); // This will re-grant access if it's an area_membros product

                if ($delivery_result['success']) {
                    $processed_products_for_email[] = $delivery_result;
                } else {
                    error_log("API: Reenviar Acesso: Entrega falhou para o servi�o '{$product['servi�o_nome']}': {$delivery_result['message']}");
                }
            }

            // Send consolidated delivery email
            if (!empty($processed_products_for_email)) {
                $email_sent = send_delivery_email_consolidated(
                    $customer_email,
                    $customer_name,
                    $processed_products_for_email,
                    $member_area_password_for_delivery, // This will be passed to the template
                    $member_area_login_url,
                    $email_subject,
                    $email_html_template
                );

                if ($email_sent) {
                    // Mark as email sent to prevent duplicate automatic emails, but for manual re-send, we don't change this flag.
                    // This is just to ensure no new emails are sent by automatic webhooks for this specific session.
                    // $stmt_mark_sent = $pdo->prepare("UPDATE vendas SET email_entrega_enviado = 1 WHERE checkout_session_uuid = ?");
                    // $stmt_mark_sent->execute([$checkout_session_uuid]);
                    ob_clean();
                    echo json_encode(['success' => true, 'message' => 'E-mail de acesso reenviado com sucesso!']);
                } else {
                    ob_clean();
                    echo json_encode(['success' => false, 'error' => 'Falha ao reenviar e-mail. Verifique as configurações SMTP.']);
                }
            } else {
                ob_clean();
                echo json_encode(['success' => false, 'error' => 'Nenhum conteúdo de servi�o para reenviar no e-mail.']);
            }

        } catch (Exception $e) {
            http_response_code(500);
            ob_clean();
            error_log("API: Erro ao reenviar e-mail de acesso: " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
            echo json_encode(['success' => false, 'error' => 'Erro interno ao reenviar acesso: ' . $e->getMessage()]);
        }
        exit;
    }

    // NOVO: Ação para registrar atividade no checkout (carrinho abandonado - informações preenchidas)
    if ($action == 'record_checkout_activity' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $checkout_session_uuid = $input['checkout_session_uuid'] ?? null;
        $product_id = $input['product_id'] ?? null;
        $comprador_nome = $input['comprador_nome'] ?? null;
        $comprador_email = $input['comprador_email'] ?? null;
        $comprador_telefone = $input['comprador_telefone'] ?? null;
        $comprador_cpf = $input['comprador_cpf'] ?? null;
        $utm_parameters = $input['utm_parameters'] ?? [];

        error_log("API: record_checkout_activity - UUID: " . $checkout_session_uuid . ", Product ID: " . $product_id . ", Email: " . $comprador_email);

        if (!$checkout_session_uuid || !$product_id || !$comprador_email || !$comprador_nome) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'Dados de preenchimento do checkout incompletos.']);
            exit;
        }

        try {
            // 1. Verificar se o servi�o pertence ao infoservi�or logado
            $stmt_check_product_owner = $pdo->prepare("SELECT id, preco FROM servi�os WHERE id = :product_id AND usuario_id = :usuario_id");
            $stmt_check_product_owner->bindParam(':product_id', $product_id, PDO::PARAM_INT);
            $stmt_check_product_owner->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt_check_product_owner->execute();

            $product_info = $stmt_check_product_owner->fetch(PDO::FETCH_ASSOC);

            if (!$product_info) {
                http_response_code(403);
                ob_clean();
                echo json_encode(['success' => false, 'error' => 'Servi�o não encontrado ou não pertence a você.']);
                exit;
            }
            // MODIFICADO: Remove a linha que pega o preço, pois o valor agora será 0.00
            // $product_price = $product_info['preco']; // Get the actual price of the main product

            // 2. Tentar encontrar um registro de venda para esta sessão e servi�o
            $stmt_find_sale = $pdo->prepare("SELECT id, status_pagamento FROM vendas WHERE checkout_session_uuid = :checkout_session_uuid AND servi�o_id = :product_id");
            $stmt_find_sale->bindParam(':checkout_session_uuid', $checkout_session_uuid, PDO::PARAM_STR);
            $stmt_find_sale->bindParam(':product_id', $product_id, PDO::PARAM_INT);
            $stmt_find_sale->execute();
            $existing_sale = $stmt_find_sale->fetch(PDO::FETCH_ASSOC);

            // Define UTM parameters
            $utm_source = $utm_parameters['utm_source'] ?? null;
            $utm_campaign = $utm_parameters['utm_campaign'] ?? null;
            $utm_medium = $utm_parameters['utm_medium'] ?? null;
            $utm_content = $utm_parameters['utm_content'] ?? null;
            $utm_term = $utm_parameters['utm_term'] ?? null;
            $src = $utm_parameters['src'] ?? null;
            $sck = $utm_parameters['sck'] ?? null;


            if ($existing_sale) {
                // Se já existe um registro, verificar o status atual para evitar sobrescrever com "info_filled"
                // se já estiver em um estado de pagamento mais avançado (pending, approved, etc.)
                $current_status = $existing_sale['status_pagamento'];
                // Only update if current status is 'info_filled', 'pending', 'cancelled' or empty.
                // Do NOT downgrade an 'approved' status.
                // $allowed_to_update_status_to_info_filled = in_array($current_status, [null, '', 'info_filled', 'pending', 'cancelled']); // Original logic, slightly redundant with CASE

                $sql_update = "UPDATE vendas SET 
                                    comprador_nome = :comprador_nome, 
                                    comprador_email = :comprador_email, 
                                    comprador_telefone = :comprador_telefone, 
                                    comprador_cpf = :comprador_cpf,
                                    -- Apenas atualiza para 'info_filled' se o status atual permitir.
                                    -- Caso contrário, mantém o status existente (ex: 'approved', 'in_process').
                                    status_pagamento = CASE 
                                                        WHEN status_pagamento IN ('approved', 'in_process') THEN status_pagamento 
                                                        ELSE 'info_filled' 
                                                       END,
                                    -- MODIFICADO: Sempre define o valor como 0.00 se não for 'approved' ou 'in_process'
                                    valor = CASE 
                                            WHEN status_pagamento IN ('approved', 'in_process') THEN valor 
                                            ELSE 0.00 
                                            END,
                                    utm_source = :utm_source,
                                    utm_campaign = :utm_campaign,
                                    utm_medium = :utm_medium,
                                    utm_content = :utm_content,
                                    utm_term = :utm_term,
                                    src = :src,
                                    sck = :sck
                                WHERE id = :id";
                $stmt_update = $pdo->prepare($sql_update);
                $stmt_update->bindParam(':comprador_nome', $comprador_nome, PDO::PARAM_STR);
                $stmt_update->bindParam(':comprador_email', $comprador_email, PDO::PARAM_STR);
                $stmt_update->bindParam(':comprador_telefone', $comprador_telefone, PDO::PARAM_STR);
                $stmt_update->bindParam(':comprador_cpf', $comprador_cpf, PDO::PARAM_STR);
                // MODIFICADO: Removido o bind para :product_price_update, pois o valor é fixo em 0.00
                $stmt_update->bindParam(':utm_source', $utm_source, PDO::PARAM_STR);
                $stmt_update->bindParam(':utm_campaign', $utm_campaign, PDO::PARAM_STR);
                $stmt_update->bindParam(':utm_medium', $utm_medium, PDO::PARAM_STR);
                $stmt_update->bindParam(':utm_content', $utm_content, PDO::PARAM_STR);
                $stmt_update->bindParam(':utm_term', $utm_term, PDO::PARAM_STR);
                $stmt_update->bindParam(':src', $src, PDO::PARAM_STR);
                $stmt_update->bindParam(':sck', $sck, PDO::PARAM_STR);
                $stmt_update->bindParam(':id', $existing_sale['id'], PDO::PARAM_INT);
                $stmt_update->execute();
                error_log("API: record_checkout_activity - Venda existente atualizada (ID " . $existing_sale['id'] . "). Novo status: " . $current_status . " -> " . (in_array($current_status, ['approved', 'in_process']) ? $current_status : 'info_filled') . ", Valor: 0.00");
                
            } else {
                // Criar um novo registro de venda com status 'info_filled'
                $sql_insert = "INSERT INTO vendas (
                                servi�o_id, valor, status_pagamento, data_venda, 
                                comprador_email, comprador_nome, comprador_cpf, comprador_telefone, 
                                checkout_session_uuid,
                                utm_source, utm_campaign, utm_medium, utm_content, utm_term, src, sck
                                ) VALUES (
                                :product_id, :valor, 'info_filled', NOW(), 
                                :comprador_email, :comprador_nome, :comprador_cpf, :comprador_telefone, 
                                :checkout_session_uuid,
                                :utm_source, :utm_campaign, :utm_medium, :utm_content, :utm_term, :src, :sck
                                )";
                $stmt_insert = $pdo->prepare($sql_insert);
                $stmt_insert->bindParam(':product_id', $product_id, PDO::PARAM_INT);
                // MODIFICADO: O valor para novos carrinhos abandonados é 0.00
                $stmt_insert->bindValue(':valor', 0.00, PDO::PARAM_STR); 
                $stmt_insert->bindParam(':comprador_email', $comprador_email, PDO::PARAM_STR);
                $stmt_insert->bindParam(':comprador_nome', $comprador_nome, PDO::PARAM_STR);
                $stmt_insert->bindParam(':comprador_telefone', $comprador_telefone, PDO::PARAM_STR);
                $stmt_insert->bindParam(':comprador_cpf', $comprador_cpf, PDO::PARAM_STR);
                $stmt_insert->bindParam(':checkout_session_uuid', $checkout_session_uuid, PDO::PARAM_STR);
                $stmt_insert->bindParam(':utm_source', $utm_source, PDO::PARAM_STR);
                $stmt_insert->bindParam(':utm_campaign', $utm_campaign, PDO::PARAM_STR);
                $stmt_insert->bindParam(':utm_medium', $utm_medium, PDO::PARAM_STR);
                $stmt_insert->bindParam(':utm_content', $utm_content, PDO::PARAM_STR);
                $stmt_insert->bindParam(':utm_term', $utm_term, PDO::PARAM_STR);
                $stmt_insert->bindParam(':src', $src, PDO::PARAM_STR);
                $stmt_insert->bindParam(':sck', $sck, PDO::PARAM_STR);
                $stmt_insert->execute();
                error_log("API: record_checkout_activity - Nova venda com status 'info_filled' criada: ID " . $pdo->lastInsertId() . ", Valor: 0.00");
            }

            ob_clean();
            echo json_encode(['success' => true, 'message' => 'Atividade de checkout registrada com sucesso.']);

        } catch (PDOException $e) {
            http_response_code(500);
            ob_clean();
            error_log("API: Erro de banco de dados em record_checkout_activity: " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
            echo json_encode(['success' => false, 'error' => 'Erro interno ao registrar atividade: ' . $e->getMessage()]);
        }
        exit;
    }


    // MODIFICADO: get_member_exclusive_offers
    if ($action == 'get_member_exclusive_offers') {
        $cliente_email = $_SESSION['usuario'] ?? null; // Assume que o email do cliente está na sessão

        if (!$cliente_email) {
            http_response_code(401);
            ob_clean();
            echo json_encode(['error' => 'Email do cliente não encontrado na sessão.']);
            exit;
        }

        try {
            // 1. Encontra os IDs dos servi�os que o cliente JÁ POSSUI
            $stmt_owned_product_ids = $pdo->prepare("
                SELECT DISTINCT servi�o_id
                FROM alunos_acessos
                WHERE aluno_email = :aluno_email
            ");
            $stmt_owned_product_ids->bindParam(':aluno_email', $cliente_email, PDO::PARAM_STR);
            $stmt_owned_product_ids->execute();
            $owned_product_ids = $stmt_owned_product_ids->fetchAll(PDO::FETCH_COLUMN);
            
            // Se o cliente não possui nenhum servi�o, não há ofertas relacionadas a nenhum servi�o.
            if (empty($owned_product_ids)) {
                ob_clean();
                echo json_encode(['offers' => []]);
                exit;
            }

            // Transforma o array de IDs em uma string para a cláusula IN
            $owned_product_ids_placeholder = implode(',', array_fill(0, count($owned_product_ids), '?'));

            // 2. Busca as ofertas exclusivas que estão configuradas para os servi�os que o cliente já possui,
            // e que o cliente ainda não adquiriu.
            $sql_offers = "
                SELECT
                    p_offer.id AS product_id,
                    p_offer.nome AS product_name,
                    p_offer.foto AS product_photo,
                    p_offer.preco AS product_price,
                    p_offer.checkout_hash,
                    u.nome AS infoprod_name
                FROM
                    product_exclusive_offers peo
                JOIN
                    servi�os p_source ON peo.source_product_id = p_source.id
                JOIN
                    servi�os p_offer ON peo.offer_product_id = p_offer.id
                JOIN
                    usuarios u ON p_offer.usuario_id = u.id
                WHERE
                    peo.is_active = 1
                    AND peo.source_product_id IN ({$owned_product_ids_placeholder})
                    AND p_offer.tipo_entrega = 'area_membros'
                    AND p_offer.id NOT IN ({$owned_product_ids_placeholder}) -- Exclui servi�os que o cliente já possui
                GROUP BY p_offer.id -- Garante que cada servi�o ofertado apareça apenas uma vez
                ORDER BY peo.created_at DESC
                LIMIT 10
            ";
            
            $stmt_offers = $pdo->prepare($sql_offers);
            
            // Bind parameters for source_product_id and then for the NOT IN clause
            $param_index = 1;
            foreach ($owned_product_ids as $id) {
                $stmt_offers->bindValue($param_index++, $id, PDO::PARAM_INT);
            }
            foreach ($owned_product_ids as $id) {
                $stmt_offers->bindValue($param_index++, $id, PDO::PARAM_INT);
            }

            $stmt_offers->execute();
            $offers = $stmt_offers->fetchAll(PDO::FETCH_ASSOC);

            ob_clean();
            echo json_encode(['offers' => $offers]);
            exit;

        } catch (PDOException $e) {
            http_response_code(500);
            ob_clean();
            error_log("API: Erro de banco de dados em get_member_exclusive_offers: " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
            echo json_encode(['error' => 'Erro de banco de dados ao buscar ofertas: ' . $e->getMessage()]);
            exit;
        }
    }

    // --- NEW: Ações para gerenciamento de cursos (modulos e aulas) ---

    // Action: Reorder Aulas
    if ($action == 'reorder_aulas' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $modulo_id = $input['modulo_id'] ?? null;
        $aulas_order = $input['aulas_order'] ?? []; // Array of lesson IDs in the new order
        $servi�o_id = $input['servi�o_id'] ?? null; // For security validation

        if (!$modulo_id || !is_array($aulas_order) || empty($aulas_order) || !$servi�o_id) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'Dados inválidos para reordenar aulas.']);
            exit;
        }

        try {
            // 1. Validate ownership: Ensure the module belongs to a course associated with the user's product.
            $stmt_check_ownership = $pdo->prepare("
                SELECT m.id
                FROM modulos m
                JOIN cursos c ON m.curso_id = c.id
                JOIN servi�os p ON c.servi�o_id = p.id
                WHERE m.id = :modulo_id AND p.id = :servi�o_id AND p.usuario_id = :usuario_id
            ");
            $stmt_check_ownership->bindParam(':modulo_id', $modulo_id, PDO::PARAM_INT);
            $stmt_check_ownership->bindParam(':servi�o_id', $servi�o_id, PDO::PARAM_INT);
            $stmt_check_ownership->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt_check_ownership->execute();

            if ($stmt_check_ownership->rowCount() === 0) {
                http_response_code(403);
                ob_clean();
                echo json_encode(['success' => false, 'error' => 'Acesso negado: Módulo não encontrado ou não pertence a você.']);
                exit;
            }

            // 2. Update order in a transaction
            $pdo->beginTransaction();
            $ordem = 0;
            $stmt_update_order = $pdo->prepare("UPDATE aulas SET ordem = :ordem WHERE id = :aula_id AND modulo_id = :modulo_id");

            foreach ($aulas_order as $aula_id) {
                $stmt_update_order->bindParam(':ordem', $ordem, PDO::PARAM_INT);
                $stmt_update_order->bindParam(':aula_id', $aula_id, PDO::PARAM_INT);
                $stmt_update_order->bindParam(':modulo_id', $modulo_id, PDO::PARAM_INT);
                $stmt_update_order->execute();
                $ordem++;
            }
            $pdo->commit();

            ob_clean();
            echo json_encode(['success' => true, 'message' => 'Ordem das aulas atualizada com sucesso.']);

        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            ob_clean();
            error_log("API: Erro ao reordenar aulas: " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
            echo json_encode(['success' => false, 'error' => 'Erro interno ao reordenar aulas: ' . $e->getMessage()]);
        }
        exit;
    }

    // Action: Get Lesson Files
    if ($action == 'get_lesson_files' && $_SERVER['REQUEST_METHOD'] === 'GET') {
        $aula_id = $_GET['aula_id'] ?? null;

        if (!$aula_id) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'ID da aula é obrigatório.']);
            exit;
        }

        try {
            // 1. Validate ownership: Ensure the lesson belongs to a module of a course associated with the user's product.
            $stmt_check_ownership = $pdo->prepare("
                SELECT af.id, af.nome_original, af.nome_salvo, af.caminho_arquivo
                FROM aula_arquivos af
                JOIN aulas a ON af.aula_id = a.id
                JOIN modulos m ON a.modulo_id = m.id
                JOIN cursos c ON m.curso_id = c.id
                JOIN servi�os p ON c.servi�o_id = p.id
                WHERE a.id = :aula_id AND p.usuario_id = :usuario_id
                ORDER BY af.ordem ASC, af.id ASC
            ");
            $stmt_check_ownership->bindParam(':aula_id', $aula_id, PDO::PARAM_INT);
            $stmt_check_ownership->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt_check_ownership->execute();

            $files = $stmt_check_ownership->fetchAll(PDO::FETCH_ASSOC);

            ob_clean();
            echo json_encode(['success' => true, 'files' => $files]);

        } catch (PDOException $e) {
            http_response_code(500);
            ob_clean();
            error_log("API: Erro ao buscar arquivos da aula: " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
            echo json_encode(['success' => false, 'error' => 'Erro interno ao buscar arquivos da aula: ' . $e->getMessage()]);
        }
        exit;
    }

    // Action: Delete Aula File
    if ($action == 'delete_aula_file' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $file_id = $input['file_id'] ?? null;

        if (!$file_id) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'ID do arquivo é obrigatório.']);
            exit;
        }

        try {
            // 1. Validate ownership and get file path
            $stmt_get_file = $pdo->prepare("
                SELECT af.caminho_arquivo
                FROM aula_arquivos af
                JOIN aulas a ON af.aula_id = a.id
                JOIN modulos m ON a.modulo_id = m.id
                JOIN cursos c ON m.curso_id = c.id
                JOIN servi�os p ON c.servi�o_id = p.id
                WHERE af.id = :file_id AND p.usuario_id = :usuario_id
            ");
            $stmt_get_file->bindParam(':file_id', $file_id, PDO::PARAM_INT);
            $stmt_get_file->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt_get_file->execute();

            $file_info = $stmt_get_file->fetch(PDO::FETCH_ASSOC);

            if (!$file_info) {
                http_response_code(403);
                ob_clean();
                echo json_encode(['success' => false, 'error' => 'Acesso negado: Arquivo não encontrado ou não pertence a você.']);
                exit;
            }

            $caminho_arquivo = $file_info['caminho_arquivo'];

            // 2. Delete physical file
            if (file_exists($caminho_arquivo)) {
                unlink($caminho_arquivo);
            } else {
                error_log("API: Warning - Arquivo físico não encontrado para deletar: " . $caminho_arquivo);
            }

            // 3. Delete database record
            $stmt_delete_record = $pdo->prepare("DELETE FROM aula_arquivos WHERE id = :file_id");
            $stmt_delete_record->bindParam(':file_id', $file_id, PDO::PARAM_INT);
            $stmt_delete_record->execute();

            ob_clean();
            echo json_encode(['success' => true, 'message' => 'Arquivo deletado com sucesso.']);

        } catch (PDOException $e) {
            http_response_code(500);
            ob_clean();
            error_log("API: Erro ao deletar arquivo da aula: " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
            echo json_encode(['success' => false, 'error' => 'Erro interno ao deletar arquivo da aula: ' . $e->getMessage()]);
        }
        exit;
    }

    // NOVO: Ações para Starfy Track
    if ($action == 'get_Starfy_tracked_products') {
        try {
            $stmt = $pdo->prepare("SELECT stp.id, stp.servi�o_id, stp.tracking_id, p.nome FROM Starfy_tracking_products stp JOIN servi�os p ON stp.servi�o_id = p.id WHERE stp.usuario_id = :usuario_id ORDER BY p.nome ASC");
            $stmt->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt->execute();
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            ob_clean();
            echo json_encode(['success' => true, 'products' => $products]);
        } catch (PDOException $e) {
            http_response_code(500);
            ob_clean();
            error_log("API: Erro ao buscar servi�os rastreados (get_Starfy_tracked_products): " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
            echo json_encode(['success' => false, 'error' => 'Erro ao buscar servi�os rastreados: ' . $e->getMessage()]);
        }
        exit;
    }

    if ($action == 'add_Starfy_tracked_product' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $servi�o_id = $input['servi�o_id'] ?? null;
        error_log("API: add_Starfy_tracked_product - Servi�o ID: $servi�o_id, Usuário ID: $usuario_id_logado");

        if (!$servi�o_id) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'ID do servi�o é obrigatório.']);
            exit;
        }

        try {
            // Verifica se o servi�o pertence ao usuário logado
            $stmt_check_owner = $pdo->prepare("SELECT id FROM servi�os WHERE id = :servi�o_id AND usuario_id = :usuario_id");
            $stmt_check_owner->bindParam(':servi�o_id', $servi�o_id, PDO::PARAM_INT);
            $stmt_check_owner->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt_check_owner->execute();

            if ($stmt_check_owner->rowCount() === 0) {
                http_response_code(403);
                ob_clean();
                echo json_encode(['success' => false, 'error' => 'Servi�o não encontrado ou não pertence a você.']);
                exit;
            }
            error_log("API: add_Starfy_tracked_product - Servi�o pertence ao usuário.");

            // Verifica se já está rastreado
            $stmt_check_tracked = $pdo->prepare("SELECT tracking_id FROM Starfy_tracking_products WHERE servi�o_id = :servi�o_id AND usuario_id = :usuario_id");
            $stmt_check_tracked->bindParam(':servi�o_id', $servi�o_id, PDO::PARAM_INT);
            $stmt_check_tracked->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt_check_tracked->execute();

            if ($stmt_check_tracked->rowCount() > 0) {
                $existing_tracking = $stmt_check_tracked->fetch(PDO::FETCH_ASSOC);
                ob_clean();
                echo json_encode(['success' => true, 'message' => 'Servi�o já está sendo rastreado.', 'tracking_id' => $existing_tracking['tracking_id']]);
                exit;
            }
            error_log("API: add_Starfy_tracked_product - Servi�o ainda não rastreado, criando novo.");

            $tracking_id = uniqid('st_') . bin2hex(random_bytes(8));
            $stmt_insert = $pdo->prepare("INSERT INTO Starfy_tracking_products (usuario_id, servi�o_id, tracking_id) VALUES (:usuario_id, :servi�o_id, :tracking_id)");
            $stmt_insert->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt_insert->bindParam(':servi�o_id', $servi�o_id, PDO::PARAM_INT);
            $stmt_insert->bindParam(':tracking_id', $tracking_id, PDO::PARAM_STR);
            $stmt_insert->execute();

            ob_clean();
            echo json_encode(['success' => true, 'message' => 'Servi�o configurado para rastreamento.', 'tracking_id' => $tracking_id]);

        } catch (PDOException $e) {
            http_response_code(500);
            ob_clean();
            error_log("API: Erro ao configurar rastreamento (add_Starfy_tracked_product): " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
            echo json_encode(['success' => false, 'error' => 'Erro ao configurar rastreamento: ' . $e->getMessage()]);
        }
        exit;
    }

    if ($action == 'generate_tracking_script') {
        $tracking_id = $_GET['tracking_id'] ?? null;
        error_log("API: generate_tracking_script - Tracking ID: $tracking_id, Usuário ID: $usuario_id_logado");

        if (!$tracking_id) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'Tracking ID é obrigatório.']);
            exit;
        }

        // Verifica se o tracking_id pertence ao usuário logado
        $stmt_check_owner = $pdo->prepare("SELECT stp.id, p.id as servi�o_id FROM Starfy_tracking_products stp JOIN servi�os p ON stp.servi�o_id = p.id WHERE stp.tracking_id = :tracking_id AND stp.usuario_id = :usuario_id");
        $stmt_check_owner->bindParam(':tracking_id', $tracking_id, PDO::PARAM_STR);
        $stmt_check_owner->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
        $stmt_check_owner->execute();

        if ($stmt_check_owner->rowCount() === 0) {
            http_response_code(403);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'Tracking ID inválido ou não pertence a você.']);
            exit;
        }
        $tracking_product_id_db_row = $stmt_check_owner->fetch(PDO::FETCH_ASSOC);
        $tracking_product_id_db = $tracking_product_id_db_row['id'];
        $associated_product_id = $tracking_product_id_db_row['servi�o_id'];

        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
        $domainName = $_SERVER['HTTP_HOST'];
        $basePath = rtrim(dirname($_SERVER['PHP_SELF']), '/\\');
        $track_beacon_endpoint = $protocol . $domainName . $basePath . '/track_beacon.php';
        $track_event_endpoint = $protocol . $domainName . $basePath . '/api.php'; // Updated to use api.php
        $checkout_endpoint = $protocol . $domainName . $basePath . '/checkout.php'; // Para detectar visitas ao checkout

        // CORREÇÃO: Removendo a lógica de IS_CHECKOUT_PAGE e voltando para a detecção de clique mais simples
        // O script SÓ DEVE SER INSTALADO NA PÁGINA DE VENDAS.
        $script = <<<EOT
<script>
    (function() {
        const Starfy_TRACK_ID = '{$tracking_id}';
        const TRACK_EVENT_ENDPOINT = '{$track_event_endpoint}';
        const TRACK_BEACON_ENDPOINT = '{$track_beacon_endpoint}';
        const CHECKOUT_BASE_URL = '{$checkout_endpoint}?p=';
        const CHECKOUT_ENDPOINT_PARTIAL = 'checkout.php'; // Para detecção de forms
        const TRACKING_PRODUCT_DB_ID = '{$tracking_product_id_db}'; 

        console.log('Starfy Track Script Loaded. Tracking ID:', Starfy_TRACK_ID, 'Checkout Base URL:', CHECKOUT_BASE_URL);

        // Função para obter parâmetros UTM da URL
        function getUrlUtmParameters() {
            const urlParams = new URLSearchParams(window.location.search);
            const utmParams = {};
            const utmKeys = ['utm_source', 'utm_campaign', 'utm_medium', 'utm_content', 'utm_term', 'src', 'sck'];
            utmKeys.forEach(key => {
                utmParams[key] = urlParams.get(key);
            });
            return utmParams;
        }

        const utmParameters = getUrlUtmParameters();

        function getSessionId() {
            let sessionId = localStorage.getItem('Starfy_session_id');
            if (!sessionId) {
                // Gera Session ID
                sessionId = 's_' + Date.now() + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('Starfy_session_id', sessionId);
            }
            return sessionId;
        }

        const sessionId = getSessionId();

        // Envia evento para o endpoint de rastreamento via API (POST)
        function sendEvent(eventType, eventData = {}) {
            // Apenas para eventos que não são Page View (como initiate_checkout ou purchase, se usados)
            const payload = {
                action: 'record_tracking_event', 
                tracking_id: Starfy_TRACK_ID,
                session_id: sessionId,
                event_type: eventType,
                event_data: {
                    ...eventData,
                    url: window.location.href,
                    referrer: document.referrer,
                    ...utmParameters 
                }
            };
            
            console.log('Starfy Track: Sending event', eventType, 'with payload:', payload);

            fetch(TRACK_EVENT_ENDPOINT, {
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

        // Rastreia a visualização de página usando um beacon transparente (GET via imagem)
        function trackPageViewBeacon() {
            const img = new Image();
            const eventDataString = encodeURIComponent(JSON.stringify({
                url: window.location.href,
                referrer: document.referrer,
                ...utmParameters 
            }));
            
            // A URL do beacon é usada para o evento page_view
            img.src = \`${TRACK_BEACON_ENDPOINT}?tracking_id=\${Starfy_TRACK_ID}&session_id=\${sessionId}&event_type=page_view&event_data=\${eventDataString}&t=\${Date.now()}\`;
            
            // Log para debug
            console.log('Starfy Track: Sending Page View via Beacon to:', img.src);

            img.style.width = '1px';
            img.style.height = '1px';
            img.style.position = 'absolute';
            img.style.left = '-9999px';
            img.style.top = '-9999px';
            document.body.appendChild(img);
            img.onload = () => { if(img.parentNode) img.parentNode.removeChild(img); };
            img.onerror = () => { console.error('Starfy Track: Erro ao carregar beacon de rastreamento.'); if(img.parentNode) img.parentNode.removeChild(img); };
        }

        // --- INICIALIZAÇÃO ---

        // 1. DISPARO INICIAL (Page View)
        if (document.body) {
             trackPageViewBeacon(); 
        } else {
             window.addEventListener('load', trackPageViewBeacon);
        }
        
        // 2. Tenta extrair o checkout hash da URL (usado na maioria das implementações do checkout)
        // Isso será útil para links diretos ou formas mais simples
        function extractCheckoutHash(url) {
            try {
                const urlObj = new URL(url);
                return urlObj.searchParams.get('p');
            } catch (e) {
                return null;
            }
        }
        
        // 3. MONITORAMENTO DE INTERAÇÕES (Início de Checkout)
        
        // Listener principal para cliques
        document.addEventListener('click', (e) => {
            let target = e.target;
            while (target && target !== document.body) {
                
                // Opção A: Detecção por link <a> com a URL de checkout
                if (target.tagName === 'A' && target.href && target.href.includes(CHECKOUT_ENDPOINT_PARTIAL)) {
                    const checkoutHash = extractCheckoutHash(target.href);
                    if (checkoutHash) {
                        sendEvent('initiate_checkout', { checkout_hash: checkoutHash, via: 'link_a' });
                        console.log('Starfy Track: Evento initiate_checkout disparado para hash:', checkoutHash, 'no link A.');
                        return; // Evento capturado, sair
                    }
                }
                
                // Opção B: Detecção por Classe de Botão de Checkout (Fallback manual)
                if (target.classList && target.classList.contains('Starfy-checkout-btn')) {
                    // Tenta encontrar o hash no link ou em um atributo de dado se o link não for claro
                    const href = target.tagName === 'A' ? target.href : target.getAttribute('data-checkout-url');
                    let checkoutHash = null;
                    if(href) {
                        checkoutHash = extractCheckoutHash(href);
                    }
                    
                    // Se não encontrou o hash no href, use o ID do servi�o ou o nome da classe como fallback (menos ideal)
                    if(!checkoutHash) {
                        // Tenta obter o hash de um data-attribute auxiliar
                        checkoutHash = target.getAttribute('data-checkout-hash') || 'hash_via_class_unknown';
                    }

                    sendEvent('initiate_checkout', { checkout_hash: checkoutHash, via: 'button_class' });
                    console.log('Starfy Track: Evento initiate_checkout disparado via classe para hash:', checkoutHash);
                    return; // Evento capturado, sair
                }
                
                target = target.parentElement;
            }
        });
        
        // Listener para interceptar envio de formulário (se o botão for um <button type="submit"> dentro de um <form>)
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.tagName === 'FORM' && form.action.includes(CHECKOUT_ENDPOINT_PARTIAL)) {
                 
                // Tenta encontrar o hash no action ou em um campo de formulário oculto
                let checkoutHash = extractCheckoutHash(form.action);
                
                // Se não encontrou na action, verifica se há um campo 'p' dentro do form
                if (!checkoutHash) {
                    const inputHash = form.querySelector('input[name="p"]');
                    if (inputHash) {
                        checkoutHash = inputHash.value;
                    }
                }
                
                if (checkoutHash) {
                    sendEvent('initiate_checkout', { checkout_hash: checkoutHash, via: 'form_submit' });
                    console.log('Starfy Track: Evento initiate_checkout disparado via FORM submit para hash:', checkoutHash);
                    // O formulário continuará a ser enviado normalmente
                }
            }
        });
    })();
</script>
EOT;

        ob_clean();
        echo json_encode(['success' => true, 'script' => $script]);
        exit;
    }

    if ($action == 'record_tracking_event' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $tracking_id = $input['tracking_id'] ?? null;
        $session_id = $input['session_id'] ?? null;
        $event_type = $input['event_type'] ?? null;
        $event_data = $input['event_data'] ?? [];

        error_log("API: record_tracking_event - Received data: " . print_r($input, true));

        if (!$tracking_id || !$session_id || !$event_type) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'Dados de rastreamento incompletos.']);
            exit;
        }

        try {
            // Retrieve the internal tracking_product_id using the public tracking_id
            $stmt_get_internal_id = $pdo->prepare("SELECT id, servi�o_id FROM Starfy_tracking_products WHERE tracking_id = :tracking_id");
            $stmt_get_internal_id->bindParam(':tracking_id', $tracking_id, PDO::PARAM_STR);
            $stmt_get_internal_id->execute();
            $tracked_product_info = $stmt_get_internal_id->fetch(PDO::FETCH_ASSOC);

            if (!$tracked_product_info) {
                http_response_code(404);
                ob_clean();
                echo json_encode(['success' => false, 'error' => 'Tracking ID não encontrado.']);
                exit;
            }

            $internal_tracking_product_id = $tracked_product_info['id'];
            $associated_product_id = $tracked_product_info['servi�o_id'];

            // Store event data as JSON
            $event_data_json = json_encode($event_data);

            $stmt_insert_event = $pdo->prepare("
                INSERT INTO Starfy_tracking_events (tracking_product_id, session_id, event_type, event_data)
                VALUES (:tracking_product_id, :session_id, :event_type, :event_data)
            ");
            $stmt_insert_event->bindParam(':tracking_product_id', $internal_tracking_product_id, PDO::PARAM_INT);
            $stmt_insert_event->bindParam(':session_id', $session_id, PDO::PARAM_STR);
            $stmt_insert_event->bindParam(':event_type', $event_type, PDO::PARAM_STR);
            $stmt_insert_event->bindParam(':event_data', $event_data_json, PDO::PARAM_STR);
            $stmt_insert_event->execute();

            error_log("API: Evento de rastreamento registrado: Tipo='" . $event_type . "', Session ID='" . $session_id . "'");

            ob_clean();
            echo json_encode(['success' => true, 'message' => 'Evento de rastreamento registrado com sucesso.']);

        } catch (PDOException $e) {
            http_response_code(500);
            ob_clean();
            error_log("API: Erro de banco de dados em record_tracking_event: " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
            echo json_encode(['success' => false, 'error' => 'Erro interno ao registrar evento: ' . $e->getMessage()]);
        }
        exit;
    }

    if ($action == 'get_Starfy_tracking_data') {
        $tracking_product_id = $_GET['tracking_product_id'] ?? null;
        $period = $_GET['period'] ?? 'all'; // 'today', 'yesterday', '7days', 'month', 'year', 'all'
        error_log("API: get_Starfy_tracking_data - Tracking Product ID: $tracking_product_id, Period: $period, Usuário ID: $usuario_id_logado");

        if (!$tracking_product_id) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'Tracking Product ID é obrigatório.']);
            exit;
        }

        // Valida se o tracking_product_id pertence ao usuário logado
        $stmt_check_owner = $pdo->prepare("SELECT stp.id, stp.servi�o_id, p.checkout_hash FROM Starfy_tracking_products stp JOIN servi�os p ON stp.servi�o_id = p.id WHERE stp.id = :tracking_product_id AND stp.usuario_id = :usuario_id");
        $stmt_check_owner->bindParam(':tracking_product_id', $tracking_product_id, PDO::PARAM_INT);
        $stmt_check_owner->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
        $stmt_check_owner->execute();

        if ($stmt_check_owner->rowCount() === 0) {
            http_response_code(403);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'Tracking Product ID inválido ou não pertence a você.']);
            exit;
        }
        $tracked_product_info = $stmt_check_owner->fetch(PDO::FETCH_ASSOC);
        $associated_checkout_hash = $tracked_product_info['checkout_hash'];
        $original_product_id = $tracked_product_info['servi�o_id'];
        error_log("API: get_Starfy_tracking_data - Servi�o rastreado encontrado. Original Product ID: $original_product_id.");


        $date_filter_sql_ste = ''; // Para Starfy_tracking_events
        $date_filter_sql_vendas = ''; // Para vendas
        switch ($period) {
            case 'today': 
                $date_filter_sql_ste = "AND DATE(ste.created_at) = CURDATE()"; 
                $date_filter_sql_vendas = "AND DATE(v.data_venda) = CURDATE()"; 
                break;
            case 'yesterday': 
                $date_filter_sql_ste = "AND DATE(ste.created_at) = CURDATE() - INTERVAL 1 DAY"; 
                $date_filter_sql_vendas = "AND DATE(v.data_venda) = CURDATE() - INTERVAL 1 DAY"; 
                break;
            case '7days': 
                $date_filter_sql_ste = "AND ste.created_at >= CURDATE() - INTERVAL 6 DAY"; 
                $date_filter_sql_vendas = "AND v.data_venda >= CURDATE() - INTERVAL 6 DAY"; 
                break;
            case 'month': 
                $date_filter_sql_ste = "AND MONTH(ste.created_at) = MONTH(CURDATE()) AND YEAR(ste.created_at) = YEAR(CURDATE())"; 
                $date_filter_sql_vendas = "AND MONTH(v.data_venda) = MONTH(CURDATE()) AND YEAR(v.data_venda) = YEAR(CURDATE())"; 
                break;
            case 'year': 
                $date_filter_sql_ste = "AND YEAR(ste.created_at) = YEAR(CURDATE())"; 
                $date_filter_sql_vendas = "AND YEAR(v.data_venda) = YEAR(CURDATE())"; 
                break;
            case 'all': default: 
                $date_filter_sql_ste = ""; 
                $date_filter_sql_vendas = ""; 
                break;
        }
        error_log("API: get_Starfy_tracking_data - Filtro de data STE: '$date_filter_sql_ste', Filtro de data Vendas: '$date_filter_sql_vendas'.");


        // 1. Total Page Views (unique sessions)
        try {
            // CORREÇÃO: Adicionado alias 'ste' à tabela
            $sql_page_views = "SELECT COUNT(DISTINCT ste.session_id) FROM Starfy_tracking_events ste WHERE ste.tracking_product_id = :tracking_product_id AND ste.event_type = 'page_view' {$date_filter_sql_ste}";
            $stmt_page_views = $pdo->prepare($sql_page_views);
            $stmt_page_views->bindParam(':tracking_product_id', $tracking_product_id, PDO::PARAM_INT);
            $stmt_page_views->execute();
            $page_views = (int)$stmt_page_views->fetchColumn();
            error_log("API: Page Views - SQL: '$sql_page_views', Result: $page_views");
        } catch (PDOException $e) {
            error_log("API: Erro PDO na consulta de page_views: " . $e->getMessage() . " SQL: " . $sql_page_views);
            throw $e;
        }

        // 2. Total Initiate Checkouts (unique sessions)
        try {
            // CORREÇÃO: Adicionado alias 'ste' à tabela
            $sql_initiate_checkouts = "SELECT COUNT(DISTINCT ste.session_id) FROM Starfy_tracking_events ste WHERE ste.tracking_product_id = :tracking_product_id AND ste.event_type = 'initiate_checkout' {$date_filter_sql_ste}";
            $stmt_initiate_checkouts = $pdo->prepare($sql_initiate_checkouts);
            $stmt_initiate_checkouts->bindParam(':tracking_product_id', $tracking_product_id, PDO::PARAM_INT);
            $stmt_initiate_checkouts->execute();
            $initiate_checkouts = (int)$stmt_initiate_checkouts->fetchColumn();
            error_log("API: Initiate Checkouts - SQL: '$sql_initiate_checkouts', Result: $initiate_checkouts");
        } catch (PDOException $e) {
            error_log("API: Erro PDO na consulta de initiate_checkouts: " . $e->getMessage() . " SQL: " . $sql_initiate_checkouts);
            throw $e;
        }

        // 3. Total Purchases (unique sales for main product)
        try {
            $sql_purchases = "
                SELECT COUNT(DISTINCT v.id) 
                FROM vendas v
                WHERE v.servi�o_id = :original_product_id 
                AND v.status_pagamento = 'approved'
                {$date_filter_sql_vendas}
                AND v.checkout_session_uuid IN (SELECT DISTINCT ste.session_id FROM Starfy_tracking_events ste WHERE ste.event_type = 'purchase' AND ste.tracking_product_id = :tracking_product_id {$date_filter_sql_ste})
            ";
            $stmt_purchases = $pdo->prepare($sql_purchases);
            $stmt_purchases->bindParam(':original_product_id', $original_product_id, PDO::PARAM_INT);
            $stmt_purchases->bindParam(':tracking_product_id', $tracking_product_id, PDO::PARAM_INT);
            $stmt_purchases->execute();
            $purchases = (int)$stmt_purchases->fetchColumn();
            error_log("API: Purchases - SQL: '$sql_purchases', Original Product ID: $original_product_id, Tracking Product ID: $tracking_product_id, Result: $purchases");
        } catch (PDOException $e) {
            error_log("API: Erro PDO na consulta de purchases: " . $e->getMessage() . " SQL: " . $sql_purchases);
            throw $e;
        }

        // 4. Sales details (main product and order bumps)
        try {
            $sql_sales_details = "
                SELECT 
                    p.nome as product_name, 
                    SUM(v.valor) as total_value, 
                    COUNT(v.id) as total_count,
                    p.id as product_db_id
                FROM vendas v
                JOIN servi�os p ON v.servi�o_id = p.id
                WHERE v.status_pagamento = 'approved'
                {$date_filter_sql_vendas}
                AND v.checkout_session_uuid IN (
                    SELECT DISTINCT ste.session_id 
                    FROM Starfy_tracking_events ste 
                    WHERE ste.event_type = 'purchase' 
                    AND ste.tracking_product_id = :tracking_product_id 
                    {$date_filter_sql_ste}
                )
                GROUP BY product_db_id, p.nome
                ORDER BY FIELD(product_db_id, :original_product_id) DESC, product_name ASC
            ";
            $stmt_sales_details = $pdo->prepare($sql_sales_details);
            $stmt_sales_details->bindParam(':original_product_id', $original_product_id, PDO::PARAM_INT);
            $stmt_sales_details->bindParam(':tracking_product_id', $tracking_product_id, PDO::PARAM_INT);
            $stmt_sales_details->execute();
            $sales_details_raw = $stmt_sales_details->fetchAll(PDO::FETCH_ASSOC);
            error_log("API: Sales Details - SQL: '$sql_sales_details', Original Product ID: $original_product_id, Tracking Product ID: $tracking_product_id, Result: " . print_r($sales_details_raw, true));
        } catch (PDOException $e) {
            error_log("API: Erro PDO na consulta de sales_details: " . $e->getMessage() . " SQL: " . $sql_sales_details);
            throw $e;
        }

        $main_product_sales_value = 0;
        $main_product_sales_count = 0;
        $order_bump_sales = [];
        foreach ($sales_details_raw as $sale) {
            if ($sale['product_db_id'] == $original_product_id) {
                $main_product_sales_value = $sale['total_value'];
                $main_product_sales_count = $sale['total_count'];
            } else {
                $order_bump_sales[] = [
                    'product_name' => $sale['product_name'],
                    'total_value' => (float)$sale['total_value'],
                    'total_count' => (int)$sale['total_count']
                ];
            }
        }
        
        // Conversions
        $page_to_checkout_conversion = ($page_views > 0) ? ($initiate_checkouts / $page_views) * 100 : 0;
        $checkout_to_purchase_conversion = ($initiate_checkouts > 0) ? ($purchases / $initiate_checkouts) * 100 : 0;
        $overall_conversion = ($page_views > 0) ? ($purchases / $page_views) * 100 : 0;

        // Clicks per sale
        $clicks_to_sale_page = ($purchases > 0) ? round($page_views / $purchases, 2) : 0;
        $clicks_to_sale_checkout = ($purchases > 0) ? round($initiate_checkouts / $purchases, 2) : 0;


        ob_clean();
        echo json_encode([
            'success' => true,
            'data' => [
                'funnel' => [
                    'page_views' => $page_views,
                    'initiate_checkouts' => $initiate_checkouts,
                    'purchases' => $purchases,
                ],
                'conversions' => [
                    'page_to_checkout' => round($page_to_checkout_conversion, 2),
                    'checkout_to_purchase' => round($checkout_to_purchase_conversion, 2),
                    'overall' => round($overall_conversion, 2),
                ],
                'sales_summary' => [
                    'main_product_sales_value' => (float)$main_product_sales_value,
                    'main_product_sales_count' => (int)$main_product_sales_count,
                    'order_bump_sales' => $order_bump_sales,
                ],
                'kpis' => [
                    'clicks_to_sale_page' => $clicks_to_sale_page,
                    'clicks_to_sale_checkout' => $clicks_to_sale_checkout,
                ]
            ]
        ]);
        exit;
    }

    // NOVO: Ação para excluir um funil de rastreamento
    if ($action == 'delete_Starfy_tracked_product' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $tracking_product_db_id = $input['tracking_product_db_id'] ?? null;
        error_log("API: delete_Starfy_tracked_product - Tracking Product DB ID: $tracking_product_db_id, Usuário ID: $usuario_id_logado");

        if (!$tracking_product_db_id) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'ID do funil de rastreamento é obrigatório.']);
            exit;
        }

        try {
            // Verifica se o funil de rastreamento pertence ao usuário logado
            $stmt_check_owner = $pdo->prepare("SELECT id FROM Starfy_tracking_products WHERE id = :tracking_product_db_id AND usuario_id = :usuario_id");
            $stmt_check_owner->bindParam(':tracking_product_db_id', $tracking_product_db_id, PDO::PARAM_INT);
            $stmt_check_owner->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt_check_owner->execute();

            if ($stmt_check_owner->rowCount() === 0) {
                http_response_code(403);
                ob_clean();
                echo json_encode(['success' => false, 'error' => 'Funil de rastreamento não encontrado ou não pertence a você.']);
                exit;
            }

            // Deleta o funil de rastreamento (aulas serão deletadas em cascata se a FK estiver configurada)
            $stmt_delete = $pdo->prepare("DELETE FROM Starfy_tracking_products WHERE id = :tracking_product_db_id");
            $stmt_delete->bindParam(':tracking_product_db_id', $tracking_product_db_id, PDO::PARAM_INT);
            $stmt_delete->execute();

            ob_clean();
            echo json_encode(['success' => true, 'message' => 'Funil de rastreamento excluído com sucesso.']);

        } catch (PDOException $e) {
            http_response_code(500);
            ob_clean();
            error_log("API: Erro ao excluir funil de rastreamento (delete_Starfy_tracked_product): " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
            echo json_encode(['success' => false, 'error' => 'Erro ao excluir funil de rastreamento: ' . $e->getMessage()]);
        }
        exit;
    }

    // NOVO: Ações para Webhooks
    if ($action == 'get_webhooks') {
        try {
            // Busca todos os webhooks do usuário logado, incluindo o nome do servi�o se associado
            $stmt = $pdo->prepare("SELECT w.*, p.nome as servi�o_nome FROM webhooks w LEFT JOIN servi�os p ON w.servi�o_id = p.id WHERE w.usuario_id = :usuario_id ORDER BY w.created_at DESC");
            $stmt->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt->execute();
            $webhooks = $stmt->fetchAll(PDO::FETCH_ASSOC);
            ob_clean();
            echo json_encode(['success' => true, 'webhooks' => $webhooks]);
        } catch (PDOException $e) {
            http_response_code(500);
            ob_clean();
            error_log("API: Erro ao buscar webhooks (get_webhooks): " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
            echo json_encode(['success' => false, 'error' => 'Erro ao buscar webhooks: ' . $e->getMessage()]);
        }
        exit;
    }

    if ($action == 'create_webhook' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $url = filter_var($input['url'] ?? '', FILTER_VALIDATE_URL);
        $servi�o_id = $input['servi�o_id'] ?? null; // Pode ser null
        $events = $input['events'] ?? [];

        if (!$url) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'URL do webhook inválida ou ausente.']);
            exit;
        }

        // Se servi�o_id for fornecido, verifica se pertence ao usuário
        if ($servi�o_id) {
            $stmt_check_product = $pdo->prepare("SELECT id FROM servi�os WHERE id = :servi�o_id AND usuario_id = :usuario_id");
            $stmt_check_product->bindParam(':servi�o_id', $servi�o_id, PDO::PARAM_INT);
            $stmt_check_product->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt_check_product->execute();
            if ($stmt_check_product->rowCount() === 0) {
                http_response_code(403);
                ob_clean();
                echo json_encode(['success' => false, 'error' => 'Servi�o associado não encontrado ou não pertence a você.']);
                exit;
            }
        }

        try {
            $stmt_insert = $pdo->prepare("
                INSERT INTO webhooks (
                    usuario_id, servi�o_id, url, 
                    event_approved, event_pending, event_rejected, 
                    event_refunded, event_charged_back
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt_insert->execute([
                $usuario_id_logado,
                $servi�o_id,
                $url,
                (int)($events['approved'] ?? 0),
                (int)($events['pending'] ?? 0),
                (int)($events['rejected'] ?? 0),
                (int)($events['refunded'] ?? 0),
                (int)($events['charged_back'] ?? 0)
            ]);
            ob_clean();
            echo json_encode(['success' => true, 'message' => 'Webhook criado com sucesso!', 'id' => $pdo->lastInsertId()]);
        } catch (PDOException $e) {
            http_response_code(500);
            ob_clean();
            error_log("API: Erro ao criar webhook (create_webhook): " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
            echo json_encode(['success' => false, 'error' => 'Erro ao criar webhook: ' . $e->getMessage()]);
        }
        exit;
    }

    if ($action == 'update_webhook' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $webhook_id = $input['id'] ?? null;
        $url = filter_var($input['url'] ?? '', FILTER_VALIDATE_URL);
        $servi�o_id = $input['servi�o_id'] ?? null; // Pode ser null
        $events = $input['events'] ?? [];

        if (!$webhook_id || !$url) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'ID do webhook ou URL inválida/ausente.']);
            exit;
        }

        // Verifica se o webhook pertence ao usuário
        $stmt_check_webhook_owner = $pdo->prepare("SELECT id FROM webhooks WHERE id = :webhook_id AND usuario_id = :usuario_id");
        $stmt_check_webhook_owner->bindParam(':webhook_id', $webhook_id, PDO::PARAM_INT);
        $stmt_check_webhook_owner->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
        $stmt_check_webhook_owner->execute();
        if ($stmt_check_webhook_owner->rowCount() === 0) {
            http_response_code(403);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'Webhook não encontrado ou não pertence a você.']);
            exit;
        }

        // Se servi�o_id for fornecido, verifica se pertence ao usuário
        if ($servi�o_id) {
            $stmt_check_product = $pdo->prepare("SELECT id FROM servi�os WHERE id = :servi�o_id AND usuario_id = :usuario_id");
            $stmt_check_product->bindParam(':servi�o_id', $servi�o_id, PDO::PARAM_INT);
            $stmt_check_product->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt_check_product->execute();
            if ($stmt_check_product->rowCount() === 0) {
                http_response_code(403);
                ob_clean();
                echo json_encode(['success' => false, 'error' => 'Servi�o associado não encontrado ou não pertence a você.']);
                exit;
            }
        }

        try {
            $stmt_update = $pdo->prepare("
                UPDATE webhooks SET 
                    servi�o_id = ?, url = ?, 
                    event_approved = ?, event_pending = ?, event_rejected = ?, 
                    event_refunded = ?, event_charged_back = ?
                WHERE id = ? AND usuario_id = ?
            ");
            $stmt_update->execute([
                $servi�o_id,
                $url,
                (int)($events['approved'] ?? 0),
                (int)($events['pending'] ?? 0),
                (int)($events['rejected'] ?? 0),
                (int)($events['refunded'] ?? 0),
                (int)($events['charged_back'] ?? 0),
                $webhook_id,
                $usuario_id_logado
            ]);
            ob_clean();
            echo json_encode(['success' => true, 'message' => 'Webhook atualizado com sucesso!']);
        } catch (PDOException $e) {
            http_response_code(500);
            ob_clean();
            error_log("API: Erro ao atualizar webhook (update_webhook): " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
            echo json_encode(['success' => false, 'error' => 'Erro ao atualizar webhook: ' . $e->getMessage()]);
        }
        exit;
    }

    if ($action == 'delete_webhook' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $webhook_id = $input['id'] ?? null;

        if (!$webhook_id) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'ID do webhook é obrigatório.']);
            exit;
        }

        // Verifica se o webhook pertence ao usuário
        $stmt_check_owner = $pdo->prepare("SELECT id FROM webhooks WHERE id = :webhook_id AND usuario_id = :usuario_id");
        $stmt_check_owner->bindParam(':webhook_id', $webhook_id, PDO::PARAM_INT);
        $stmt_check_owner->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
        $stmt_check_owner->execute();
        if ($stmt_check_owner->rowCount() === 0) {
            http_response_code(403);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'Webhook não encontrado ou não pertence a você.']);
            exit;
        }

        try {
            $stmt_delete = $pdo->prepare("DELETE FROM webhooks WHERE id = :webhook_id AND usuario_id = :usuario_id");
            $stmt_delete->bindParam(':webhook_id', $webhook_id, PDO::PARAM_INT);
            $stmt_delete->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt_delete->execute();
            ob_clean();
            echo json_encode(['success' => true, 'message' => 'Webhook excluído com sucesso!']);
        } catch (PDOException $e) {
            http_response_code(500);
            ob_clean();
            error_log("API: Erro ao excluir webhook (delete_webhook): " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
            echo json_encode(['success' => false, 'error' => 'Erro ao excluir webhook: ' . $e->getMessage()]);
        }
        exit;
    }

    if ($action == 'test_webhook' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $url = filter_var($input['url'] ?? '', FILTER_VALIDATE_URL);

        if (!$url) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'URL do webhook inválida.']);
            exit;
        }

        // Preparar um payload de teste universal
        $test_payload = [
            'event' => 'test_webhook',
            'timestamp' => date('Y-m-d H:i:s'),
            'data' => [
                'test_message' => 'Este é um evento de teste da Starfy BR 3',
                'infoservi�or_id' => $usuario_id_logado,
                'servi�o_nome' => 'Servi�o de Teste',
                'valor' => 99.99,
                'status_pagamento' => 'approved',
                'comprador_nome' => 'Cliente Teste',
                'comprador_email' => 'cliente@teste.com',
                'comprador_telefone' => '5511987654321',
                'transacao_id' => 'TEST_TRANS_12345',
                'metodo_pagamento' => 'Pix',
                'checkout_session_uuid' => 'TEST_CHECKOUT_UUID'
            ]
        ];

        try {
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($test_payload));
            curl_setopt($ch, CURLOPT_TIMEOUT, 10); // Timeout de 10 segundos

            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curl_error = curl_error($ch);
            curl_close($ch);

            if ($curl_error) {
                http_response_code(500);
                ob_clean();
                echo json_encode(['success' => false, 'error' => 'Erro cURL ao enviar teste: ' . $curl_error]);
                exit;
            }

            if ($http_code >= 200 && $http_code < 300) {
                ob_clean();
                echo json_encode(['success' => true, 'message' => "Webhook de teste enviado com sucesso! Resposta HTTP: {$http_code}."]);
            } else {
                ob_clean();
                echo json_encode(['success' => false, 'error' => "Webhook de teste falhou. Resposta HTTP: {$http_code}. Resposta: " . (strlen($response) > 200 ? substr($response, 0, 200) . '...' : $response)]);
            }
        } catch (Throwable $e) {
            http_response_code(500);
            ob_clean();
            error_log("API: Erro ao testar webhook (test_webhook): " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
            echo json_encode(['success' => false, 'error' => 'Erro interno ao testar webhook: ' . $e->getMessage()]);
        }
        exit;
    }

    // NOVO: Ações para Integração UTMfy

    // Listar integrações UTMfy
    if ($action == 'get_utmfy_integrations') {
        try {
            $stmt = $pdo->prepare("
                SELECT utmfy.*, p.nome as product_name 
                FROM utmfy_integrations utmfy
                LEFT JOIN servi�os p ON utmfy.product_id = p.id
                WHERE utmfy.usuario_id = :usuario_id 
                ORDER BY utmfy.created_at DESC
            ");
            $stmt->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt->execute();
            $integrations = $stmt->fetchAll(PDO::FETCH_ASSOC);
            ob_clean();
            echo json_encode(['success' => true, 'integrations' => $integrations]);
        } catch (PDOException $e) {
            http_response_code(500);
            ob_clean();
            error_log("API: Erro ao buscar integrações UTMfy (get_utmfy_integrations): " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
            echo json_encode(['success' => false, 'error' => 'Erro ao buscar integrações UTMfy: ' . $e->getMessage()]);
        }
        exit;
    }

    // Criar nova integração UTMfy
    if ($action == 'create_utmfy_integration' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $name = trim($input['name'] ?? '');
        $api_token = trim($input['api_token'] ?? '');
        $product_id = $input['product_id'] ?? null; // Pode ser null
        $events = $input['events'] ?? [];

        if (empty($name) || empty($api_token)) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'Nome da integração e API Token são obrigatórios.']);
            exit;
        }

        // Se product_id for fornecido, verifica se pertence ao usuário
        if ($product_id) {
            $stmt_check_product = $pdo->prepare("SELECT id FROM servi�os WHERE id = :product_id AND usuario_id = :usuario_id");
            $stmt_check_product->bindParam(':servi�o_id', $servi�o_id, PDO::PARAM_INT);
            $stmt_check_product->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt_check_product->execute();
            if ($stmt_check_product->rowCount() === 0) {
                http_response_code(403);
                ob_clean();
                echo json_encode(['success' => false, 'error' => 'Servi�o associado não encontrado ou não pertence a você.']);
                exit;
            }
        }

        try {
            $stmt_insert = $pdo->prepare("
                INSERT INTO utmfy_integrations (
                    usuario_id, name, api_token, product_id, 
                    event_approved, event_pending, event_rejected, 
                    event_refunded, event_charged_back
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt_insert->execute([
                $usuario_id_logado,
                $name,
                $api_token,
                $product_id,
                (int)($events['approved'] ?? 0),
                (int)($events['pending'] ?? 0),
                (int)($events['rejected'] ?? 0),
                (int)($events['refunded'] ?? 0),
                (int)($events['charged_back'] ?? 0)
            ]);
            ob_clean();
            echo json_encode(['success' => true, 'message' => 'Integração UTMfy criada com sucesso!', 'id' => $pdo->lastInsertId()]);
        } catch (PDOException $e) {
            http_response_code(500);
            ob_clean();
            error_log("API: Erro ao criar integração UTMfy (create_utmfy_integration): " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
            echo json_encode(['success' => false, 'error' => 'Erro ao criar integração UTMfy: ' . $e->getMessage()]);
        }
        exit;
    }

    // Atualizar integração UTMfy
    if ($action == 'update_utmfy_integration' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $integration_id = $input['id'] ?? null;
        $name = trim($input['name'] ?? '');
        $api_token = trim($input['api_token'] ?? '');
        $product_id = $input['product_id'] ?? null; // Pode ser null
        $events = $input['events'] ?? [];

        if (!$integration_id || empty($name) || empty($api_token)) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'ID da integração, nome ou API Token inválido/ausente.']);
            exit;
        }

        // Verifica se a integração pertence ao usuário
        $stmt_check_integration_owner = $pdo->prepare("SELECT id FROM utmfy_integrations WHERE id = :integration_id AND usuario_id = :usuario_id");
        $stmt_check_integration_owner->bindParam(':integration_id', $integration_id, PDO::PARAM_INT);
        $stmt_check_integration_owner->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
        $stmt_check_integration_owner->execute();
        if ($stmt_check_integration_owner->rowCount() === 0) {
            http_response_code(403);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'Integração UTMfy não encontrada ou não pertence a você.']);
            exit;
        }

        // Se product_id for fornecido, verifica se pertence ao usuário
        if ($product_id) {
            $stmt_check_product = $pdo->prepare("SELECT id FROM servi�os WHERE id = :product_id AND usuario_id = :usuario_id");
            $stmt_check_product->bindParam(':servi�o_id', $servi�o_id, PDO::PARAM_INT);
            $stmt_check_product->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt_check_product->execute();
            if ($stmt_check_product->rowCount() === 0) {
                http_response_code(403);
                ob_clean();
                echo json_encode(['success' => false, 'error' => 'Servi�o associado não encontrado ou não pertence a você.']);
                exit;
            }
        }

        try {
            $stmt_update = $pdo->prepare("
                UPDATE utmfy_integrations SET 
                    name = ?, api_token = ?, product_id = ?, 
                    event_approved = ?, event_pending = ?, event_rejected = ?, 
                    event_refunded = ?, event_charged_back = ?
                WHERE id = ? AND usuario_id = ?
            ");
            $stmt_update->execute([
                $name,
                $api_token,
                $product_id,
                (int)($events['approved'] ?? 0),
                (int)($events['pending'] ?? 0),
                (int)($events['rejected'] ?? 0),
                (int)($events['refunded'] ?? 0),
                (int)($events['charged_back'] ?? 0),
                $integration_id,
                $usuario_id_logado
            ]);
            ob_clean();
            echo json_encode(['success' => true, 'message' => 'Integração UTMfy atualizada com sucesso!']);
        } catch (PDOException $e) {
            http_response_code(500);
            ob_clean();
            error_log("API: Erro ao atualizar integração UTMfy (update_utmfy_integration): " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
            echo json_encode(['success' => false, 'error' => 'Erro ao atualizar integração UTMfy: ' . $e->getMessage()]);
        }
        exit;
    }

    // Deletar integração UTMfy
    if ($action == 'delete_utmfy_integration' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $integration_id = $input['id'] ?? null;

        if (!$integration_id) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'ID da integração é obrigatório.']);
            exit;
        }

        // Verifica se a integração pertence ao usuário
        $stmt_check_owner = $pdo->prepare("SELECT id FROM utmfy_integrations WHERE id = :integration_id AND usuario_id = :usuario_id");
        $stmt_check_owner->bindParam(':integration_id', $integration_id, PDO::PARAM_INT);
        $stmt_check_owner->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
        $stmt_check_owner->execute();
        if ($stmt_check_owner->rowCount() === 0) {
            http_response_code(403);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'Integração UTMfy não encontrada ou não pertence a você.']);
            exit;
        }

        try {
            $stmt_delete = $pdo->prepare("DELETE FROM utmfy_integrations WHERE id = :integration_id AND usuario_id = :usuario_id");
            $stmt_delete->bindParam(':integration_id', $integration_id, PDO::PARAM_INT);
            $stmt_delete->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt_delete->execute();
            ob_clean();
            echo json_encode(['success' => true, 'message' => 'Integração UTMfy excluída com sucesso!']);
        } catch (PDOException $e) {
            http_response_code(500);
            ob_clean();
            error_log("API: Erro ao excluir integração UTMfy (delete_utmfy_integration): " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
            echo json_encode(['success' => false, 'error' => 'Erro ao excluir integração UTMfy: ' . $e->getMessage()]);
        }
        exit;
    }

    // NEW: Ações para Clonar Site
    if ($action == 'clone_url' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $url_to_clone = filter_var($input['url'], FILTER_VALIDATE_URL);

        if (!$url_to_clone) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'URL inválida ou ausente.']);
            exit;
        }

        try {
            // Configure a stream context para simular um navegador (User-Agent)
            $context = stream_context_create([
                'http' => [
                    'header' => 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                ]
            ]);

            $html_content = file_get_contents($url_to_clone, false, $context);

            if ($html_content === false) {
                http_response_code(500);
                ob_clean();
                echo json_encode(['success' => false, 'error' => 'Não foi possível buscar o conteúdo da URL. Verifique se a URL está correta e acessível.']);
                exit;
            }

            // Usar DOMDocument para parsear e manipular o HTML
            $dom = new DOMDocument();
            // Suprime avisos de HTML malformado
            libxml_use_internal_errors(true);
            $dom->loadHTML($html_content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
            libxml_clear_errors();

            // Resolve URLs relativas para absolutas
            $base_url_parts = parse_url($url_to_clone);
            $base_scheme = $base_url_parts['scheme'] ?? 'http';
            $base_host = $base_url_parts['host'] ?? '';
            $base_path = dirname($base_url_parts['path'] ?? '/');

            // Função helper para resolver URLs (handle relative paths)
            $resolve_url = function($relative_url) use ($base_scheme, $base_host, $base_path) {
                if (empty($relative_url)) return '';

                // Already absolute (starts with http(s):// or //)
                if (preg_match('/^(https?:\/\/|\/\/)/i', $relative_url)) {
                    // Handle protocol-relative URLs
                    if (str_starts_with($relative_url, '//')) {
                        return $base_scheme . ':' . $relative_url;
                    }
                    return $relative_url;
                }

                // Absolute path from root (starts with /)
                if (str_starts_with($relative_url, '/')) {
                    return $base_scheme . '://' . $base_host . $relative_url;
                }

                // Relative path
                return $base_scheme . '://' . $base_host . rtrim($base_path, '/') . '/' . $relative_url;
            };

            $elements_to_resolve = [
                'a' => 'href',
                'img' => 'src',
                'link' => 'href',
                'script' => 'src',
                'iframe' => 'src',
                'source' => 'src', // For <video> and <audio> elements
                'video' => 'src',
                'audio' => 'src',
                '*' => 'data-src' // Catch common lazy-load attributes
            ];

            foreach ($elements_to_resolve as $tag => $attr) {
                if ($tag === '*') { // Handle generic data-src attributes
                    $xpath = new DOMXPath($dom);
                    $nodes = $xpath->query("//*[@{$attr}]");
                    foreach ($nodes as $node) {
                        $current_url = $node->getAttribute($attr);
                        if (!empty($current_url)) {
                            $node->setAttribute($attr, $resolve_url($current_url));
                        }
                    }
                } else {
                    $elements = $dom->getElementsByTagName($tag);
                    foreach ($elements as $element) {
                        $current_url = $element->getAttribute($attr);
                        if (!empty($current_url)) {
                            $element->setAttribute($attr, $resolve_url($current_url));
                        }
                    }
                }
            }

            // Remover scripts de rastreamento conhecidos
            $scripts = $dom->getElementsByTagName('script');
            $scripts_to_remove = [];
            foreach ($scripts as $script) {
                $script_content = $script->textContent;
                $script_src = $script->getAttribute('src');

                // Facebook Pixel patterns
                if (strpos($script_content, 'fbq(') !== false || strpos($script_src, 'connect.facebook.net') !== false) {
                    $scripts_to_remove[] = $script;
                    continue;
                }
                // Google Analytics / Tag Manager patterns
                if (strpos($script_content, 'gtag(') !== false || strpos($script_src, 'googletagmanager.com') !== false || strpos($script_src, 'google-analytics.com') !== false) {
                    $scripts_to_remove[] = $script;
                    continue;
                }
                // TikTok Pixel (example pattern)
                if (strpos($script_content, 'ttq.load') !== false || strpos($script_src, 'tiktok.com/analytics.js') !== false) {
                    $scripts_to_remove[] = $script;
                    continue;
                }
                // Other common tracking (e.g., Hotjar, CrazyEgg - specific patterns would be needed)
                // For a robust solution, a whitelist of allowed scripts would be better than a blacklist.
            }

            foreach ($scripts_to_remove as $script) {
                if ($script->parentNode) {
                    $script->parentNode->removeChild($script);
                }
            }
            
            // Tenta obter o título da página
            $page_title = 'Site Clonado';
            $title_nodes = $dom->getElementsByTagName('title');
            if ($title_nodes->length > 0) {
                $page_title = $title_nodes->item(0)->textContent;
            }

            // Salva o HTML limpo e manipulado no banco de dados
            $cleaned_html = $dom->saveHTML();

            $stmt_insert_site = $pdo->prepare("INSERT INTO cloned_sites (usuario_id, original_url, title, original_html, edited_html) VALUES (:usuario_id, :original_url, :title, :original_html, :edited_html)");
            $stmt_insert_site->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt_insert_site->bindParam(':original_url', $url_to_clone, PDO::PARAM_STR);
            $stmt_insert_site->bindParam(':title', $page_title, PDO::PARAM_STR);
            $stmt_insert_site->bindParam(':original_html', $cleaned_html, PDO::PARAM_STR);
            $stmt_insert_site->bindParam(':edited_html', $cleaned_html, PDO::PARAM_STR); // Initially, edited_html is the same as original
            $stmt_insert_site->execute();
            $cloned_site_id = $pdo->lastInsertId();

            ob_clean();
            echo json_encode(['success' => true, 'message' => 'Site clonado e scripts de rastreamento removidos com sucesso!', 'cloned_site_id' => $cloned_site_id, 'html_content' => $cleaned_html, 'title' => $page_title, 'original_url' => $url_to_clone]);

        } catch (Exception $e) {
            http_response_code(500);
            ob_clean();
            error_log("API: Erro ao clonar URL (clone_url): " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
            echo json_encode(['success' => false, 'error' => 'Erro interno ao clonar site: ' . $e->getMessage()]);
        }
        exit;
    }

    if ($action == 'save_cloned_site' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $cloned_site_id = $input['cloned_site_id'] ?? null;
        $edited_html_content = $input['edited_html_content'] ?? '';
        $facebook_pixel_id = trim($input['facebook_pixel_id'] ?? '');
        $google_analytics_id = trim($input['google_analytics_id'] ?? '');
        $custom_head_scripts = trim($input['custom_head_scripts'] ?? '');
        $new_title = trim($input['title'] ?? 'Site Clonado'); // Allow updating title
        $slug = trim($input['slug'] ?? '');
        $status = trim($input['status'] ?? 'draft');

        // Slug validation
        $slug = strtolower(preg_replace('/[^a-zA-Z0-9-]/', '-', $slug));
        $slug = preg_replace('/-+/', '-', $slug);
        $slug = trim($slug, '-');

        // Cannot publish without a slug
        if (empty($slug) && $status === 'published') {
            http_response_code(400);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'É necessário definir um slug (URL amigável) para publicar o site.']);
            exit;
        }

        // Check unique slug if provided
        if (!empty($slug)) {
             $stmt_check_slug = $pdo->prepare("SELECT id FROM cloned_sites WHERE slug = :slug AND id != :cloned_site_id");
             $stmt_check_slug->execute([':slug' => $slug, ':cloned_site_id' => $cloned_site_id]);
             if ($stmt_check_slug->rowCount() > 0) {
                 http_response_code(400);
                 ob_clean();
                 echo json_encode(['success' => false, 'error' => 'Este slug já está em uso por outro site.']);
                 exit;
             }
        } else {
            $slug = null;
        }

        // Debugging: Log the pixel IDs received
        error_log("API: save_cloned_site - Received for ID {$cloned_site_id}:");
        error_log("  Facebook Pixel ID: '{$facebook_pixel_id}'");
        error_log("  Google Analytics ID: '{$google_analytics_id}'");
        error_log("  Custom Head Scripts (first 100 chars): '" . substr($custom_head_scripts, 0, 100) . "'");


        if (!$cloned_site_id || empty($edited_html_content)) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'ID do site clonado ou conteúdo HTML editado é obrigatório.']);
            exit;
        }

        try {
            // Validate ownership
            $stmt_check_owner = $pdo->prepare("SELECT id FROM cloned_sites WHERE id = :cloned_site_id AND usuario_id = :usuario_id");
            $stmt_check_owner->bindParam(':cloned_site_id', $cloned_site_id, PDO::PARAM_INT);
            $stmt_check_owner->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt_check_owner->execute();

            if ($stmt_check_owner->rowCount() === 0) {
                http_response_code(403);
                ob_clean();
                echo json_encode(['success' => false, 'error' => 'Site clonado não encontrado ou não pertence a você.']);
                exit;
            }

            $pdo->beginTransaction();

            // Update edited_html, title, slug, and status in cloned_sites
            $stmt_update_site = $pdo->prepare("UPDATE cloned_sites SET edited_html = :edited_html, title = :title, slug = :slug, status = :status, updated_at = NOW() WHERE id = :cloned_site_id");
            $stmt_update_site->bindParam(':edited_html', $edited_html_content, PDO::PARAM_STR);
            $stmt_update_site->bindParam(':title', $new_title, PDO::PARAM_STR);
            $stmt_update_site->bindParam(':slug', $slug, $slug === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
            $stmt_update_site->bindParam(':status', $status, PDO::PARAM_STR);
            $stmt_update_site->bindParam(':cloned_site_id', $cloned_site_id, PDO::PARAM_INT);
            $stmt_update_site->execute();

            // Insert or update cloned_site_settings
            $stmt_upsert_settings = $pdo->prepare("
                INSERT INTO cloned_site_settings (cloned_site_id, facebook_pixel_id, google_analytics_id, custom_head_scripts)
                VALUES (:cloned_site_id, :facebook_pixel_id, :google_analytics_id, :custom_head_scripts)
                ON DUPLICATE KEY UPDATE
                    facebook_pixel_id = :facebook_pixel_id_update,
                    google_analytics_id = :google_analytics_id_update,
                    custom_head_scripts = :custom_head_scripts_update,
                    updated_at = NOW()
            ");
            $stmt_upsert_settings->bindParam(':cloned_site_id', $cloned_site_id, PDO::PARAM_INT);
            $stmt_upsert_settings->bindParam(':facebook_pixel_id', $facebook_pixel_id, PDO::PARAM_STR);
            $stmt_upsert_settings->bindParam(':google_analytics_id', $google_analytics_id, PDO::PARAM_STR);
            $stmt_upsert_settings->bindParam(':custom_head_scripts', $custom_head_scripts, PDO::PARAM_STR);
            $stmt_upsert_settings->bindParam(':facebook_pixel_id_update', $facebook_pixel_id, PDO::PARAM_STR);
            $stmt_upsert_settings->bindParam(':google_analytics_id_update', $google_analytics_id, PDO::PARAM_STR);
            $stmt_upsert_settings->bindParam(':custom_head_scripts_update', $custom_head_scripts, PDO::PARAM_STR);
            $stmt_upsert_settings->execute();

            $pdo->commit();

            // Debug: Verify what was actually saved for Facebook Pixel ID immediately after commit
            $stmt_verify_pixel = $pdo->prepare("SELECT facebook_pixel_id FROM cloned_site_settings WHERE cloned_site_id = :cloned_site_id");
            $stmt_verify_pixel->bindParam(':cloned_site_id', $cloned_site_id, PDO::PARAM_INT);
            $stmt_verify_pixel->execute();
            $verified_pixel_id = $stmt_verify_pixel->fetchColumn();
            error_log("API: save_cloned_site - Verified Facebook Pixel ID in DB after save: '{$verified_pixel_id}' for site ID {$cloned_site_id}");


            ob_clean();
            echo json_encode(['success' => true, 'message' => 'Site clonado salvo com sucesso!']);

        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            ob_clean();
            error_log("API: Erro ao salvar site clonado (save_cloned_site): " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
            echo json_encode(['success' => false, 'error' => 'Erro interno ao salvar site clonado: ' . $e->getMessage()]);
        }
        exit;
    }

    if ($action == 'get_cloned_sites') {
        try {
            $stmt = $pdo->prepare("SELECT id, original_url, title, slug, status, created_at FROM cloned_sites WHERE usuario_id = :usuario_id ORDER BY created_at DESC");
            $stmt->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt->execute();
            $cloned_sites = $stmt->fetchAll(PDO::FETCH_ASSOC);

            ob_clean();
            echo json_encode(['success' => true, 'cloned_sites' => $cloned_sites]);

        } catch (PDOException $e) {
            http_response_code(500);
            ob_clean();
            error_log("API: Erro ao buscar sites clonados (get_cloned_sites): " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
            echo json_encode(['success' => false, 'error' => 'Erro ao buscar sites clonados: ' . $e->getMessage()]);
        }
        exit;
    }

    if ($action == 'get_cloned_site_details') {
        $cloned_site_id = $_GET['cloned_site_id'] ?? null;

        if (!$cloned_site_id) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'ID do site clonado é obrigatório.']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("
                SELECT 
                    cs.id, cs.original_url, cs.title, cs.original_html, cs.edited_html, cs.slug, cs.status,
                    css.facebook_pixel_id, css.google_analytics_id, css.custom_head_scripts
                FROM cloned_sites cs
                LEFT JOIN cloned_site_settings css ON cs.id = css.cloned_site_id
                WHERE cs.id = :cloned_site_id AND cs.usuario_id = :usuario_id
            ");
            $stmt->bindParam(':cloned_site_id', $cloned_site_id, PDO::PARAM_INT);
            $stmt->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt->execute();
            $site_details = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$site_details) {
                http_response_code(404);
                ob_clean();
                echo json_encode(['success' => false, 'error' => 'Site clonado não encontrado ou não pertence a você.']);
                exit;
            }

            ob_clean();
            echo json_encode(['success' => true, 'details' => $site_details]);

        } catch (PDOException $e) {
            http_response_code(500);
            ob_clean();
            error_log("API: Erro ao buscar detalhes do site clonado (get_cloned_site_details): " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
            echo json_encode(['success' => false, 'error' => 'Erro ao buscar detalhes do site clonado: ' . $e->getMessage()]);
        }
        exit;
    }

    if ($action == 'delete_cloned_site' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $cloned_site_id = $input['cloned_site_id'] ?? null;

        if (!$cloned_site_id) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'ID do site clonado é obrigatório.']);
            exit;
        }

        try {
            // Validate ownership
            $stmt_check_owner = $pdo->prepare("SELECT id FROM cloned_sites WHERE id = :cloned_site_id AND usuario_id = :usuario_id");
            $stmt_check_owner->bindParam(':cloned_site_id', $cloned_site_id, PDO::PARAM_INT);
            $stmt_check_owner->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
            $stmt_check_owner->execute();

            if ($stmt_check_owner->rowCount() === 0) {
                http_response_code(403);
                ob_clean();
                echo json_encode(['success' => false, 'error' => 'Site clonado não encontrado ou não pertence a você.']);
                exit;
            }

            $pdo->beginTransaction();

            // Delete settings first (if not cascaded by FK)
            $stmt_delete_settings = $pdo->prepare("DELETE FROM cloned_site_settings WHERE cloned_site_id = :cloned_site_id");
            $stmt_delete_settings->bindParam(':cloned_site_id', $cloned_site_id, PDO::PARAM_INT);
            $stmt_delete_settings->execute();

            // Delete the cloned site itself
            $stmt_delete_site = $pdo->prepare("DELETE FROM cloned_sites WHERE id = :cloned_site_id");
            $stmt_delete_site->bindParam(':cloned_site_id', $cloned_site_id, PDO::PARAM_INT);
            $stmt_delete_site->execute();

            $pdo->commit();

            ob_clean();
            echo json_encode(['success' => true, 'message' => 'Site clonado excluído com sucesso.']);

        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            ob_clean();
            error_log("API: Erro ao excluir site clonado (delete_cloned_site): " . $e->getMessage() . " File: " . $e->getFile() . " Line: " . $e->getLine());
            echo json_encode(['success' => false, 'error' => 'Erro interno ao excluir site clonado: ' . $e->getMessage()]);
        }
        exit;
    }

    http_response_code(400);
    ob_clean(); // Limpa o buffer antes de enviar o JSON
    echo json_encode(['error' => 'Ação inválida']);

} catch (Throwable $e) { // Captura Exception e Error
    http_response_code(500);
    error_log('API: Erro Fatal na API do Usuário: ' . $e->getMessage() . ' no arquivo ' . $e->getFile() . ' na linha ' . $e->getLine());
    ob_clean(); // Limpa o buffer antes de enviar o JSON
    echo json_encode(['error' => 'Ocorreu um erro interno no servidor. Verifique os logs de erro em ' . __DIR__ . '/api_errors.log para mais detalhes.']);
}
