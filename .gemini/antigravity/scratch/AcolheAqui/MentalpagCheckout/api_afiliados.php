<?php
// api_afiliados.php
require_once 'config.php';
header('Content-Type: application/json');

if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    echo json_encode(['success' => false, 'error' => 'Acesso negado.']);
    exit;
}

$user_id = $_SESSION['id'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// --------------------------------------------------------
// ACTION: get_affiliate_dashboard
// Retorna todos os dados para o painel de afiliados
// --------------------------------------------------------
if ($action === 'get_affiliate_dashboard') {
    try {
        // 1. Pegar código de afiliado deste usuário
        $stmt = $pdo->prepare("SELECT codigo_afiliado FROM usuarios WHERE id = ?");
        $stmt->execute([$user_id]);
        $user_data = $stmt->fetch(PDO::FETCH_ASSOC);

        // Se por algum motivo não tiver código, tenta gerar on-the-fly (fallback)
        if (empty($user_data['codigo_afiliado'])) {
            $primeiro_nome = explode(' ', trim($_SESSION['usuario']))[0]; // Fallback to session name if needed, but better use DB name
            $novo_codigo = strtoupper(substr($primeiro_nome, 0, 5)) . mt_rand(1000, 9999);
            // Salva no banco
            $update = $pdo->prepare("UPDATE usuarios SET codigo_afiliado = ? WHERE id = ?");
            $update->execute([$novo_codigo, $user_id]);
            $codigo = $novo_codigo;
        } else {
            $codigo = $user_data['codigo_afiliado'];
        }

        // 2. Calcular Ganhos Totais (Comissões Confirmadas/Pagas)
        $stmtCoins = $pdo->prepare("SELECT SUM(valor) as total FROM comissoes WHERE afiliado_id = ? AND status IN ('aprovada', 'paga')");
        $stmtCoins->execute([$user_id]);
        $ganhos_totais = $stmtCoins->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

        // 3. Calcular Saldo Pendente (A Receber)
        $stmtPendente = $pdo->prepare("SELECT SUM(valor) as total FROM comissoes WHERE afiliado_id = ? AND status = 'pendente'");
        $stmtPendente->execute([$user_id]);
        $saldo_pendente = $stmtPendente->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

        // 4. Contar Indicações Ativas (Pessoas que se cadastraram com o código)
        $stmtInd = $pdo->prepare("SELECT COUNT(*) as total FROM usuarios WHERE afiliado_por = ?");
        $stmtInd->execute([$user_id]);
        $indicacoes_ativas = $stmtInd->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

        // 5. Histórico Recente de Comissões (últimas 5)
        $stmtHist = $pdo->prepare("
            SELECT c.valor, c.status, c.data_criacao, u.nome as indicado_nome
            FROM comissoes c
            JOIN usuarios u ON c.indicado_id = u.id
            WHERE c.afiliado_id = ?
            ORDER BY c.data_criacao DESC
            LIMIT 5
        ");
        $stmtHist->execute([$user_id]);
        $historico = $stmtHist->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'codigo' => $codigo,
            'link_indicacao' => "https://mentalpag.com.br/register.php?ref=" . $codigo, // Ajustar domínio se necessario
            'ganhos_totais' => (float) $ganhos_totais,
            'saldo_pendente' => (float) $saldo_pendente,
            'indicacoes_ativas' => (int) $indicacoes_ativas,
            'historico' => $historico
        ]);

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Ação inválida.']);
}
?>