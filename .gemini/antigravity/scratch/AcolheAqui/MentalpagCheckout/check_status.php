<?php
header('Content-Type: application/json');
require 'config.php';

// Recebe ID, ID do Vendedor e o Gateway usado
$payment_id = $_GET['id'] ?? null;
$seller_id = $_GET['seller_id'] ?? null;
$gateway = $_GET['gateway'] ?? 'mercadopago'; // Padrão para retrocompatibilidade

if (!$payment_id || !$seller_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados insuficientes.']);
    exit;
}

try {
    // Busca tokens do vendedor
    $stmt = $pdo->prepare("SELECT mp_access_token, pushinpay_token FROM usuarios WHERE id = ?");
    $stmt->execute([$seller_id]);
    $tokens = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($gateway === 'pushinpay') {
        // --- Lógica PushinPay ---
        $token = $tokens['pushinpay_token'] ?? '';
        if (!$token) throw new Exception("Token PushinPay não encontrado.");

        $ch = curl_init('https://api.pushinpay.com.br/api/transactions/' . $payment_id);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $token,
            'Accept: application/json'
        ]);
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        $data = json_decode($response, true);

        if ($http_code >= 200 && isset($data['status'])) {
            // Normaliza o status para 'approved' se for 'paid'
            $status = ($data['status'] === 'paid') ? 'approved' : $data['status'];
            echo json_encode(['status' => $status]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Erro ao consultar PP']);
        }

    } else {
        // --- Lógica Mercado Pago ---
        $token = $tokens['mp_access_token'] ?? '';
        if (!$token) throw new Exception("Token Mercado Pago não encontrado.");

        $ch = curl_init('https://api.mercadopago.com/v1/payments/' . $payment_id);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $token]);
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        $data = json_decode($response, true);

        if ($http_code == 200 && isset($data['status'])) {
            echo json_encode(['status' => $data['status']]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Erro ao consultar MP']);
        }
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
