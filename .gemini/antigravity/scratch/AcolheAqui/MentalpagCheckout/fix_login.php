<?php
require_once 'config.php';

echo "<h2>🔧 Ferramenta de Recuperação de Login (Schema 'usuario')</h2>";

try {
    // 1. Verificar conexão
    if (!$pdo) {
        die("<p style='color:red'>Erro: Não houve conexão com o banco de dados. Verifique config.php.</p>");
    }
    echo "<p>✅ Conexão com Banco de Dados: OK</p>";

    // 2. Verificar Tabela
    $check_table = $pdo->query("SHOW TABLES LIKE 'usuarios'");
    if ($check_table->rowCount() == 0) {
        die("<p style='color:red'>❌ ERRO CRÍTICO: A tabela 'usuarios' não foi encontrada.</p>");
    }
    echo "<p>✅ Tabela 'usuarios': Encontrada</p>";

    // 3. Criar/Atualizar Usuário Admin
    // SCHEMA HOSTINGER: Coluna 'usuario' em vez de 'email', 'tipo' em vez de 'nivel_acesso'
    $email_login = "admin@gmail.com";
    $senha_plana = "admin123";
    $senha_hash = password_hash($senha_plana, PASSWORD_DEFAULT);

    // Verifica se já existe pela coluna 'usuario'
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE usuario = ?");
    $stmt->execute([$email_login]);

    if ($stmt->rowCount() > 0) {
        // Atualiza senha e garante que é admin
        $update = $pdo->prepare("UPDATE usuarios SET senha = ?, tipo = 'admin' WHERE usuario = ?");
        $update->execute([$senha_hash, $email_login]);
        echo "<p style='color:green'>✅ Usuário <b>$email_login</b> encontrado. Senha redefinida para: <b>$senha_plana</b> e Tipo definido como 'admin'.</p>";
    } else {
        // Cria novo
        $insert = $pdo->prepare("INSERT INTO usuarios (nome, usuario, senha, tipo) VALUES (?, ?, ?, 'admin')");
        try {
            $insert->execute(["Admin Recuperado", $email_login, $senha_hash]);
            echo "<p style='color:green'>✅ Usuário criado: <b>$email_login</b> / Senha: <b>$senha_plana</b></p>";
        } catch (Exception $e) {
            echo "<p style='color:red'>Erro ao criar usuário: " . $e->getMessage() . "</p>";
        }
    }

} catch (PDOException $e) {
    echo "<p style='color:red'>Erro de Banco de Dados: " . $e->getMessage() . "</p>";
}
?>