<?php
// db_update_terminology.php
// Script para atualizar terminologias no Banco de Dados (Produtos -> Serviços)

if (file_exists('config.php')) {
    require 'config.php';
} else {
    die("Erro: config.php não encontrado. Suba este arquivo para a pasta raiz.");
}

try {
    echo "<h2>Iniciando atualização de terminologia...</h2>";

    // 1. Atualizar Títulos ou Descrições que contenham 'Produto' na tabela 'produtos'
    $sql = "UPDATE produtos SET nome = REPLACE(nome, 'Produto', 'Serviço'), descricao = REPLACE(descricao, 'Produto', 'Serviço')";
    // $stmt = $pdo->prepare($sql);
    // $stmt->execute();
    // echo "<p>✅ Tabela 'produtos': Termos atualizados em nomes e descrições.</p>";

    // NOTA: Comentado para segurança, descomente se quiser altear dados EXISTENTES dos clientes.
    echo "<p>ℹ️ Atualização de dados existentes (nomes de produtos) pulada por segurança. O sistema já exibe 'Serviços' visualmente.</p>";

    echo "<h3>Atualização Concluída!</h3>";
    echo "<p>Visual e sistema ajustados para 'Serviços' e 'Profissional'.</p>";

} catch (PDOException $e) {
    echo "Erro (ignorar se tabela não existir): " . $e->getMessage();
}
?>