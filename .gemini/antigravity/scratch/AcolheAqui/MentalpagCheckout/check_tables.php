<?php
// check_tables.php
// Diagnóstico de Conexão e Tabelas
require_once 'config.php'; // Ou o arquivo que faz a conexão $pdo

echo "<h1>Diagnóstico do Banco de Dados</h1>";

try {
    // 1. Mostrar qual banco está conectado
    $dbName = $pdo->query('select database()')->fetchColumn();
    echo "<p><b>Conectado ao banco:</b> " . htmlspecialchars($dbName) . "</p>";

    // 2. Listar tabelas
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);

    if (count($tables) > 0) {
        echo "<p style='color:green'><b>Foram encontradas " . count($tables) . " tabelas:</b></p>";
        echo "<ul>";
        foreach ($tables as $table) {
            echo "<li>" . htmlspecialchars($table) . "</li>";
        }
        echo "</ul>";
    } else {
        echo "<h2 style='color:red'>ERRO: Nenhuma tabela encontrada!</h2>";
        echo "<p>O banco de dados <b>$dbName</b> está VAZIO.</p>";
        echo "<p>Isso significa que a importação do SQL não funcionou neste banco específico.</p>";
    }

} catch (Exception $e) {
    echo "<p style='color:red'>Erro ao conectar ou consultar: " . $e->getMessage() . "</p>";
}
?>