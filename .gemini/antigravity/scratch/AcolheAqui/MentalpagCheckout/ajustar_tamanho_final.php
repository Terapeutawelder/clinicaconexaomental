<?php
// ajustar_tamanho_final.php
// Aumenta a logo para EXTRA GRANDE (h-40)

echo "<h1>Ajuste de Tamanho: EXTRA GRANDE</h1>";

$arquivos = glob("*.php");
$arquivos_includes = glob("includes/*.php");
$todos = array_merge($arquivos, $arquivos_includes);

foreach ($todos as $arquivo) {
    if (!file_exists($arquivo))
        continue;

    $conteudo = file_get_contents($arquivo);
    $novoConteudo = $conteudo;

    // Substitui h-32 (script anterior) e outros menores por h-40 (160px)
    // Regex procura por: src="assets/logo.png" ... h-algumacoisa
    $novoConteudo = preg_replace('/(src=["\']assets\/logo\.png["\'][^>]*class=["\'][^"\']*)h-\d+/', '$1h-40', $novoConteudo);

    // Garante w-auto para não distorcer
    $novoConteudo = str_replace('w-48', 'w-auto', $novoConteudo);
    $novoConteudo = str_replace('w-32', 'w-auto', $novoConteudo);

    if ($novoConteudo !== $conteudo) {
        file_put_contents($arquivo, $novoConteudo);
        echo "<p>✅ <b>$arquivo</b>: Logo aumentada para <b>h-40</b> (Gigante).</p>";
    }
}
echo "<hr><p>Logo redimensionada. Certifique-se de ter enviado o arquivo <b>logo_transparente.png</b> (renomeado para logo.png) para remover o fundo quadriculado.</p>";
?>