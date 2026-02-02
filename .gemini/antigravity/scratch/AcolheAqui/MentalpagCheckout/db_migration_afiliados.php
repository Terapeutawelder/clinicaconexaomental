<?php
require_once 'config.php';

echo "<h2>Migração de Banco de Dados - Sistema de Afiliados</h2>";

try {
    // 1. Adicionar colunas na tabela 'usuarios'
    // codigo_afiliado: O código único deste usuário para indicar outros
    // afiliado_por: O ID do usuário que indicou este usuário (quem ganha a comissão)

    $check_col = $pdo->query("SHOW COLUMNS FROM usuarios LIKE 'codigo_afiliado'");
    if ($check_col->rowCount() == 0) {
        $sql = "ALTER TABLE usuarios 
                ADD COLUMN codigo_afiliado VARCHAR(20) UNIQUE DEFAULT NULL AFTER email,
                ADD COLUMN afiliado_por INT DEFAULT NULL AFTER codigo_afiliado";
        $pdo->exec($sql);
        echo "<p class='text-green-600'>[SUCESSO] Colunas 'codigo_afiliado' e 'afiliado_por' adicionadas em 'usuarios'.</p>";

        // Adicionar FK para integridade (opcional, mas recomendado)
        // $pdo->exec("ALTER TABLE usuarios ADD CONSTRAINT fk_afiliado_por FOREIGN KEY (afiliado_por) REFERENCES usuarios(id)");
    } else {
        echo "<p class='text-gray-500'>[INFO] Colunas de afiliado já existem em 'usuarios'.</p>";
    }

    // 2. Criar tabela de comissões
    $sql_comissoes = "CREATE TABLE IF NOT EXISTS comissoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        afiliado_id INT NOT NULL COMMENT 'Quem recebe a comissão',
        indicado_id INT NOT NULL COMMENT 'Quem fez o pagamento',
        transacao_id VARCHAR(100) DEFAULT NULL COMMENT 'ID da transação no gateway',
        valor DECIMAL(10,2) NOT NULL COMMENT 'Valor da comissão (25%)',
        status ENUM('pendente', 'aprovada', 'paga', 'cancelada') DEFAULT 'pendente',
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (afiliado_id),
        INDEX (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

    $pdo->exec($sql_comissoes);
    echo "<p class='text-green-600'>[SUCESSO] Tabela 'comissoes' verificada/criada.</p>";

    // 3. Gerar códigos para usuários existentes que não têm
    $stmt = $pdo->query("SELECT id, nome FROM usuarios WHERE codigo_afiliado IS NULL");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($users) > 0) {
        echo "<p>Gerando códigos para " . count($users) . " usuários existentes...</p>";
        $update_stmt = $pdo->prepare("UPDATE usuarios SET codigo_afiliado = ? WHERE id = ?");

        foreach ($users as $user) {
            // Gera código base: Primeiro nome + 4 digitos aleatórios
            $primeiro_nome = explode(' ', trim($user['nome']))[0];
            $primeiro_nome = preg_replace("/[^a-zA-Z0-9]+/", "", $primeiro_nome); // Remove caracteres especiais
            $primeiro_nome = strtoupper(substr($primeiro_nome, 0, 10)); // Max 10 chars

            // Tenta gerar único
            $codigo = $primeiro_nome . mt_rand(1000, 9999);

            try {
                $update_stmt->execute([$codigo, $user['id']]);
                echo " - Código gerado para ID {$user['id']}: $codigo<br>";
            } catch (PDOException $e) {
                // Se der erro de duplicidade (raro), tenta de novo com outro numero
                $codigo = $primeiro_nome . mt_rand(1000, 9999) . 'X';
                $update_stmt->execute([$codigo, $user['id']]);
                echo " - Código gerado (retry) para ID {$user['id']}: $codigo<br>";
            }
        }
    } else {
        echo "<p class='text-gray-500'>[INFO] Todos os usuários já possuem código de afiliado.</p>";
    }

} catch (PDOException $e) {
    echo "<p class='text-red-600'>[ERRO] Falha na migração: " . $e->getMessage() . "</p>";
}
?>