<?php
// ajustar_logo.php
// Script para aumentar o tamanho da logo no Admin e Dashboard

$arquivos = ['admin.php', 'dashboard.php', 'login.php'];
$alteracoes = 0;

echo "<h1>Ajuste Automático de Logo</h1>";

foreach ($arquivos as $arquivo) {
    if (!file_exists($arquivo)) {
        echo "<p style='color:red'>Arquivo <b>$arquivo</b> não encontrado.</p>";
        continue;
    }

    $conteudo = file_get_contents($arquivo);
    $novoConteudo = $conteudo;

    // 1. Substituir classes Tailwind pequenas (h-8, h-10, w-auto h-8, etc)
    // Procura por tags img com h-8 ou h-10 e troca por h-16
    $novoConteudo = preg_replace('/(class=["\'][^"\']*)\bh-8\b([^"\']*["\'])/', '$1h-20$2', $novoConteudo);
    $novoConteudo = preg_replace('/(class=["\'][^"\']*)\bh-10\b([^"\']*["\'])/', '$1h-20$2', $novoConteudo);

    // 2. Substituir estilos inline (style="height: 30px")
    $novoConteudo = preg_replace('/height:\s*30px/', 'height: 80px', $novoConteudo);
    $novoConteudo = preg_replace('/height:\s*40px/', 'height: 80px', $novoConteudo);

    if ($novoConteudo !== $conteudo) {
        // Cria backup
        copy($arquivo, $arquivo . ".backup_logo");

        // Salva alteração
        file_put_contents($arquivo, $novoConteudo);
        echo "<p style='color:green'>✅ <b>$arquivo</b>: Logo aumentada com sucesso! (Backup criado: $arquivo.backup_logo)</p>";
        $alteracoes++;
    } else {
        echo "<p style='color:orange'>⚠️ <b>$arquivo</b>: Nenhuma logo pequena encontrada ou já foi alterada.</p>";
    }
}

if ($alteracoes > 0) {
    echo "<h2>🎉 Pronto! Suas logos agora estão maiores.</h2>";
    echo "<p>Pode apagar este arquivo (ajustar_logo.php) agora.</p>";
    echo "<p><a href='admin.php'>Ir para Admin</a> | <a href='dashboard.php'>Ir para Dashboard</a></p>";
} else {
    echo "<h2>Nenhuma alteração feita.</h2><p>Verifique se os arquivos já foram editados anteriormente.</p>";
}
?>