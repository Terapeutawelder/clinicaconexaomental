<?php
require_once 'config.php';

try {
    echo "<h2>Iniciando migração de Agenda e Perfil...</h2>";

    // 1. Atualizar tabela USUARIOS
    echo "<h3>1. Atualizando tabela Usuarios...</h3>";
    $columns_users = [
        'registro_profissional' => 'VARCHAR(50) DEFAULT NULL',
        'abordagens' => 'TEXT DEFAULT NULL',
        'biografia' => 'TEXT DEFAULT NULL',
        'instagram_url' => 'VARCHAR(255) DEFAULT NULL',
        'facebook_url' => 'VARCHAR(255) DEFAULT NULL',
        'youtube_url' => 'VARCHAR(255) DEFAULT NULL'
    ];

    foreach ($columns_users as $col => $type) {
        $check = $pdo->query("SHOW COLUMNS FROM usuarios LIKE '$col'");
        if ($check->rowCount() == 0) {
            $pdo->exec("ALTER TABLE usuarios ADD COLUMN $col $type");
            echo "Coluna <strong>$col</strong> adicionada.<br>";
        } else {
            echo "Coluna <strong>$col</strong> já existe.<br>";
        }
    }

    // 2. Criar tabela AGENDA_DISPONIBILIDADE
    echo "<h3>2. Criando tabela Agenda Disponibilidade...</h3>";
    $sql_dispo = "CREATE TABLE IF NOT EXISTS `agenda_disponibilidade` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `usuario_id` int(11) NOT NULL,
      `dia_semana` int(1) NOT NULL COMMENT '0=Dom, 1=Seg...',
      `hora_inicio` time NOT NULL,
      `hora_fim` time NOT NULL,
      `ativo` tinyint(1) NOT NULL DEFAULT 1,
      PRIMARY KEY (`id`),
      KEY `idx_user_dispo` (`usuario_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    $pdo->exec($sql_dispo);
    echo "Tabela <strong>agenda_disponibilidade</strong> verificada/criada.<br>";

    // 3. Criar tabela AGENDAMENTOS
    echo "<h3>3. Criando tabela Agendamentos...</h3>";
    $sql_agend = "CREATE TABLE IF NOT EXISTS `agendamentos` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `usuario_id` int(11) NOT NULL,
      `venda_id` int(11) DEFAULT NULL,
      `cliente_nome` varchar(255) DEFAULT NULL,
      `cliente_email` varchar(255) NOT NULL,
      `cliente_telefone` varchar(20) DEFAULT NULL,
      `data_sessao` date NOT NULL,
      `hora_inicio` time NOT NULL,
      `status` varchar(20) DEFAULT 'pendente_pagamento',
      `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (`id`),
      KEY `idx_user_agend` (`usuario_id`),
      KEY `idx_data_sessao` (`data_sessao`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    $pdo->exec($sql_agend);
    echo "Tabela <strong>agendamentos</strong> verificada/criada.<br>";

    echo "<br><div style='color:green; font-weight:bold;'>Sucesso! Banco de Dados pronto para a Agenda.</div>";

} catch (PDOException $e) {
    die("<div style='color:red;'>Erro na migração: " . $e->getMessage() . "</div>");
}
?>