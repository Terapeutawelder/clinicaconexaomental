<?php
require_once 'config.php';
echo "<h2>Diagnóstico de Tabelas do Banco de Dados</h2>";
try {
    // Listar todas as tabelas
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);

    echo "<table border='1' cellpadding='5' style='border-collapse:collapse; width:100%; max-width:600px;'>";
    echo "<tr style='background:#f0f0f0;'><th>Nome da Tabela</th><th>Registros (COUNT)</th></tr>";

    foreach ($tables as $table) {
        try {
            $count = $pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
            echo "<tr><td><b>$table</b></td><td>$count</td></tr>";
        } catch (Exception $e) {
            echo "<tr><td>$table</td><td>Erro: " . $e->getMessage() . "</td></tr>";
        }
    }
    echo "</table>";

    // Se houver tabela 'servicos' ou 'produtos', mostrar colunas
    echo "<h3>Colunas de Tabelas Importantes</h3>";
    $targets = ['usuarios', 'vendas', 'transacoes', 'produtos', 'servicos', 'orders', 'payments'];

    foreach ($targets as $t) {
        if (in_array($t, $tables)) {
            echo "<h4>$t</h4>";
            $cols = $pdo->query("SHOW COLUMNS FROM `$t`")->fetchAll(PDO::FETCH_ASSOC);
            $names = array_map(function ($c) {
                return $c['Field']; }, $cols);
            echo implode(", ", $names);
        }
    }

} catch (PDOException $e) {
    echo "Erro Geral: " . $e->getMessage();
}
?>