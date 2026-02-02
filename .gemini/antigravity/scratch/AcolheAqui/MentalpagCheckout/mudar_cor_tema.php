<?php
// mudar_cor_tema.php
// Substitui a cor Laranja (orange) pela cor Verde (emerald/green) em todo o sistema.

$diretorio = '.'; // Pasta atual
$arquivos = scandir($diretorio);
$ignorar = ['.', '..', 'mudar_cor_tema.php', 'ajustar_logo.php', 'fix_logo_url.php', 'encontrar_logo.php'];

echo "<h1>Mudança de Tema: Laranja -> Verde</h1>";

foreach ($arquivos as $arquivo) {
    // Só processa arquivos .php e .html
    if (in_array($arquivo, $ignorar) || is_dir($arquivo))
        continue;
    $ext = pathinfo($arquivo, PATHINFO_EXTENSION);
    if ($ext != 'php' && $ext != 'html')
        continue;

    $conteudo = file_get_contents($arquivo);
    $novoConteudo = $conteudo;

    // Substituições de Orange para Emerald (Verde Moderno)
    $novoConteudo = str_replace('bg-orange-', 'bg-emerald-', $novoConteudo);
    $novoConteudo = str_replace('text-orange-', 'text-emerald-', $novoConteudo);
    $novoConteudo = str_replace('border-orange-', 'border-emerald-', $novoConteudo);
    $novoConteudo = str_replace('ring-orange-', 'ring-emerald-', $novoConteudo);
    $novoConteudo = str_replace('from-orange-', 'from-emerald-', $novoConteudo);
    $novoConteudo = str_replace('to-orange-', 'to-emerald-', $novoConteudo);

    // Substituições de Amber (Amarelo) caso exista e queira verde também
    // $novoConteudo = str_replace('bg-amber-', 'bg-emerald-', $novoConteudo);

    if ($novoConteudo !== $conteudo) {
        // Backup
        copy($arquivo, $arquivo . ".bak_tema");

        file_put_contents($arquivo, $novoConteudo);
        echo "<p style='color:green'>✅ <b>$arquivo</b>: Cores alteradas para Verde!</p>";
    }
}
echo "<hr><h3>Tema Atualizado!</h3>";
echo "<p>Verifique o admin e dashboard. Se não mudar, limpe o cache.</p>";
?>