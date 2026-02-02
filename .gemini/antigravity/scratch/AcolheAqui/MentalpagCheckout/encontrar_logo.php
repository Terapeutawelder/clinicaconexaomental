<?php
// encontrar_logo.php
// Lista todas as imagens encontradas nos arquivos principais
// para ajudar a localizar onde está a logo.

$arquivos = ['admin.php', 'dashboard.php', 'login.php', 'index.php', 'header.php', 'sidebar.php', 'includes/header.php', 'includes/sidebar.php'];
echo "<h1>Rastreador de Imagens (Logos)</h1>";
echo "<p>Procurando por tags &lt;img&gt; nos arquivos...</p><hr>";

foreach ($arquivos as $arq) {
    if (file_exists($arq)) {
        echo "<h3>Arquivo: $arq</h3>";
        $conteudo = file_get_contents($arq);
        $linhas = explode("\n", $conteudo);
        $encontrou = false;

        foreach ($linhas as $num => $linha) {
            // Procura por <img ou class="logo" ou id="logo"
            if (stripos($linha, '<img') !== false || stripos($linha, 'logo') !== false) {
                $numLinha = $num + 1;
                echo "<div style='background:#f4f4f4; padding:10px; margin-bottom:5px; border-left: 4px solid #007bff;'>";
                echo "<strong>Linha $numLinha:</strong><br>";
                echo "<code>" . htmlspecialchars(trim($linha)) . "</code>";
                echo "</div>";
                $encontrou = true;
            }
        }
        if (!$encontrou)
            echo "<p><i>Nenhuma imagem ou referência a logo encontrada neste arquivo.</i></p>";
    }
}
?>