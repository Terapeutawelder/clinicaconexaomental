<?php
// db_migration_gateways_v2.php
require_once 'config.php';

try {
    echo "<h1>Migração de Novos Gateways</h1>";

    $cloumns_to_add = [
        "pagseguro_email VARCHAR(255) NULL",
        "pagseguro_token VARCHAR(255) NULL",
        "stripe_public_key VARCHAR(255) NULL",
        "stripe_secret_key VARCHAR(255) NULL",
        "pagarme_api_key VARCHAR(255) NULL",
        "asaas_api_key VARCHAR(255) NULL"
    ];

    foreach ($cloumns_to_add as $col_def) {
        try {
            $pdo->exec("ALTER TABLE usuarios ADD COLUMN $col_def");
            echo "✅ Coluna adicionada: $col_def<br>";
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), "Duplicate column name") !== false) {
                echo "⚠️ Coluna já existe (pulei): $col_def<br>";
            } else {
                echo "❌ Erro ao adicionar $col_def: " . $e->getMessage() . "<br>";
            }
        }
    }

    echo "<hr><h3>Tudo pronto! As colunas para Stripe, Asaas, Pagar.me e PagSeguro foram verificadas.</h3>";
    echo "<a href='configuracoes.php'>Voltar para Configurações</a>";

} catch (Exception $e) {
    echo "Erro Geral: " . $e->getMessage();
}
?>