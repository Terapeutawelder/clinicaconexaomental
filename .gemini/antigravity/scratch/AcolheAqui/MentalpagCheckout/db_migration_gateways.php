<?php
require_once 'config.php';

try {
    echo "Iniciando atualização do banco de dados...<br>";

    // Colunas a serem adicionadas e seus tipos
    $columns = [
        'pagseguro_email' => 'VARCHAR(255) DEFAULT NULL',
        'pagseguro_token' => 'VARCHAR(255) DEFAULT NULL',
        'stripe_public_key' => 'VARCHAR(255) DEFAULT NULL',
        'stripe_secret_key' => 'VARCHAR(255) DEFAULT NULL',
        'pagarme_api_key' => 'VARCHAR(255) DEFAULT NULL',
        'asaas_api_key' => 'VARCHAR(255) DEFAULT NULL'
    ];

    foreach ($columns as $col => $type) {
        // Verifica se a coluna já existe
        $check = $pdo->query("SHOW COLUMNS FROM usuarios LIKE '$col'");
        
        if ($check->rowCount() == 0) {
            // Adiciona a coluna se não existir
            $sql = "ALTER TABLE usuarios ADD COLUMN $col $type";
            $pdo->exec($sql);
            echo "Coluna <strong>$col</strong> adicionada com sucesso.<br>";
        } else {
            echo "Coluna <strong>$col</strong> já existe.<br>";
        }
    }

    echo "<br><strong>Sucesso! O banco de dados foi atualizado para suportar os novos gateways.</strong>";
    echo "<br>Você pode apagar este arquivo agora.";

} catch (PDOException $e) {
    die("Erro ao atualizar banco de dados: " . $e->getMessage());
}
?>
