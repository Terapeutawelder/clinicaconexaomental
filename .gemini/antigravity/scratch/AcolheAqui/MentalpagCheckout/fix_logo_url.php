<?php
// fix_logo_url.php (Versão 3 - MEGA E URL)
// 1. Substitui URL externa por assets/logo.png
// 2. Aumenta MUITO a logo (h-12/h-16 -> h-20)

$arquivos = ['admin.php', 'dashboard.php', 'login.php', 'index.php', 'includes/header.php'];
$caminho_novo = 'assets/logo.png';

echo "<h1>Ajuste de Logo (Versão Final)</h1>";

foreach ($arquivos as $arquivo) {
    if (!file_exists($arquivo))
        continue;

    $conteudo = file_get_contents($arquivo);
    $novoConteudo = $conteudo;

    // 1. Remove ImgBB e põe logo local
    $novoConteudo = preg_replace('/src=["\']https?:\/\/[^"\']*ibb\.co[^"\']*["\']/', 'src="' . $caminho_novo . '"', $novoConteudo);

    // 2. Aumenta classes pequenas (h-8, h-10, h-12, h-16) para h-20
    $novoConteudo = preg_replace('/(class=["\'][^"\']*)\bh-8\b([^"\']*["\'])/', '$1h-20$2', $novoConteudo);
    $novoConteudo = preg_replace('/(class=["\'][^"\']*)\bh-10\b([^"\']*["\'])/', '$1h-20$2', $novoConteudo);
    $novoConteudo = preg_replace('/(class=["\'][^"\']*)\bh-12\b([^"\']*["\'])/', '$1h-20$2', $novoConteudo);
    $novoConteudo = preg_replace('/(class=["\'][^"\']*)\bh-16\b([^"\']*["\'])/', '$1h-20$2', $novoConteudo);

    if ($novoConteudo !== $conteudo) {
        file_put_contents($arquivo, $novoConteudo);
        echo "<p style='color:green'>✅ <b>$arquivo</b>: Logo AJUSTADA para h-20!</p>";
    } else {
        echo "<p style='color:blue'>ℹ️ <b>$arquivo</b>: Nada alterado.</p>";
    }
}
?>