<?php
// api_agenda.php - API pública para consultar disponibilidade
require_once 'config.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

if ($action == 'get_slots') {
    $user_id = $_GET['user_id'] ?? 0;
    $date = $_GET['date'] ?? ''; // YYYY-MM-DD

    if (!$user_id || !$date) {
        echo json_encode(['error' => 'Parâmetros inválidos']);
        exit;
    }

    try {
        // 1. Descobrir dia da semana (0=Dom, 1=Seg...)
        $timestamp = strtotime($date);
        $dia_semana_num = date('w', $timestamp);

        // 2. Buscar configuração desse dia
        $stmt = $pdo->prepare("SELECT * FROM agenda_disponibilidade WHERE usuario_id = ? AND dia_semana = ? AND ativo = 1");
        $stmt->execute([$user_id, $dia_semana_num]);
        $config = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$config) {
            echo json_encode(['slots' => []]); // Não atende nesse dia
            exit;
        }

        // 3. Buscar agendamentos já existentes nesse dia
        $stmt_agend = $pdo->prepare("SELECT hora_inicio FROM agendamentos WHERE usuario_id = ? AND data_sessao = ? AND status != 'cancelado'");
        $stmt_agend->execute([$user_id, $date]);
        $ocupados = $stmt_agend->fetchAll(PDO::FETCH_COLUMN); // Array de horários ['08:00:00', '09:00:00']

        // 4. Gerar slots de 1 em 1 hora (Regra simples por enquanto)
        $slots = [];
        $inicio = strtotime($date . ' ' . $config['hora_inicio']);
        $fim = strtotime($date . ' ' . $config['hora_fim']);

        // Intervalo de almoço (se houver - lógica futura)

        while ($inicio < $fim) {
            $hora_formatada = date('H:i', $inicio); // 08:00
            $hora_db = date('H:i:00', $inicio); // 08:00:00 para comparar

            // Verifica se está no futuro (se for hoje)
            $is_past = false;
            if ($date == date('Y-m-d') && $inicio < time()) {
                $is_past = true;
            }

            if (!in_array($hora_db, $ocupados) && !$is_past) {
                $slots[] = $hora_formatada;
            }

            // Incrementa 1 hora (Sessão de 50min + 10min intervalo implícito)
            $inicio = strtotime('+1 hour', $inicio);
        }

        echo json_encode(['slots' => $slots]);

    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}
?>