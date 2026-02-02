<?php
$file = 'process_payment.php';
$content = file_get_contents($file);

if ($content === false) {
    die("Erro ao ler process_payment.php");
}

// Fix 1: Select query (Corrigindo tabela serviços -> produtos e adicionando usuario_id)
// Tenta variantes caso o usuario ja tenha mexido
$content = str_replace(
    'SELECT id, preco FROM serviços',
    'SELECT id, preco, usuario_id FROM produtos',
    $content
);

// Fix 2: Insert query column (serviço_id -> produto_id)
$content = str_replace(
    'INSERT INTO vendas (serviço_id,',
    'INSERT INTO vendas (produto_id,',
    $content
);

// Fix 3: Inserir a lógica de pegar o ID do usuario (dono do produto)
$searchLogic = '$val = $prod_map[$pid][\'preco\'];';
$insertLogic = '$val = $prod_map[$pid][\'preco\'];' . "\n" .
    '                  $usuario_id_prod = $prod_map[$pid][\'usuario_id\'] ?? 0;';

$content = str_replace($searchLogic, $insertLogic, $content);

// Fix 4: Inserir a lógica de criar o agendamento após o insert da venda
$searchExec = '$stmt_insert->execute([$pid, $nome, $email, $cpf, $telefone, $val, $status_pagamento, $transacao_id, $metodo, $checkout_session_uuid, $utm_source, $utm_campaign, $utm_medium, $utm_content, $utm_term, $src, $sck]);';

$logicCode = '
$stmt_insert->execute([$pid, $nome, $email, $cpf, $telefone, $val, $status_pagamento, $transacao_id, $metodo, $checkout_session_uuid, $utm_source, $utm_campaign, $utm_medium, $utm_content, $utm_term, $src, $sck]);

                  // --- LOGICA DE AGENDAMENTO MENTALPAG ---
                  $venda_created_id = $pdo->lastInsertId();
                  if ($venda_created_id && !empty($_POST[\'agendamento_data\']) && !empty($_POST[\'agendamento_hora\'])) {
                      $data_sessao = $_POST[\'agendamento_data\'];
                      $hora_inicio = $_POST[\'agendamento_hora\'];
                      
                      // Inserir agendamento vinculado à venda
                      try {
                          $stmt_agend = $pdo->prepare("INSERT INTO agendamentos (usuario_id, venda_id, cliente_email, cliente_nome, cliente_telefone, data_sessao, hora_inicio, status) VALUES (?, ?, ?, ?, ?, ?, ?, \'pendente_pagamento\')");
                          $stmt_agend->execute([$usuario_id_prod, $venda_created_id, $email, $nome, $telefone, $data_sessao, $hora_inicio]);
                      } catch (Exception $e) {
                          error_log("Erro ao criar agendamento: " . $e->getMessage());
                      }
                  }
                  // ---------------------------------------
';

$content = str_replace($searchExec, $logicCode, $content);

file_put_contents($file, $content);
echo "Patched process_payment.php successfully.";
?>