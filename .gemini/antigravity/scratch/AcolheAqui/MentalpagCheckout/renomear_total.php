<?php
// renomear_total.php
// Substitui TODAS as ocorrências de "Starfy" por "MentalPag" em todo o sistema.

echo "<h1>Renomeação Total: Starfy -> MentalPag</h1>";
echo "<pre>";

// Pega TODOS os arquivos PHP recursivamente
$arquivos_raiz = glob("*.php");
$arquivos_includes = glob("includes/*.php");
$arquivos_components = glob("components/*.php");
$arquivos_pages = glob("pages/*.php");

// Une tudo
$todos_arquivos = array_merge(
    $arquivos_raiz ?: [],
    $arquivos_includes ?: [],
    $arquivos_components ?: [],
    $arquivos_pages ?: []
);

$contador = 0;

foreach ($todos_arquivos as $arquivo) {
    if (!file_exists($arquivo))
        continue;
    // Pula o próprio script para não dar erro
    if (basename($arquivo) == 'renomear_total.php')
        continue;

    $conteudo = file_get_contents($arquivo);
    $novoConteudo = $conteudo;

    // --- SUBSTITUIÇÕES ---
    // 1. Starfy (Exato) -> MentalPag
    $novoConteudo = str_replace('Starfy', 'MentalPag', $novoConteudo);

    // 2. STARFY (Maiúsculo) -> MENTALPAG
    $novoConteudo = str_replace('STARFY', 'MENTALPAG', $novoConteudo);

    // 3. starfy (Minúsculo) -> mentalpag
    // Cuidado: aqui eu vou evitar substituir urls ou coisas sensíveis, 
    // mas geralmente em nomes de classes ou textos é seguro.
    $novoConteudo = str_replace('starfy', 'mentalpag', $novoConteudo);

    // 4. Correções Específicas de Frases (caso existam)
    $novoConteudo = str_replace('Bem-vindo ao Starfy', 'Bem-vindo ao MentalPag', $novoConteudo);
    $novoConteudo = str_replace('Jornada Starfy', 'Jornada MentalPag', $novoConteudo);

    if ($novoConteudo !== $conteudo) {
        file_put_contents($arquivo, $novoConteudo);
        echo "✅ RENOMEADO: $arquivo\n";
        $contador++;
    }
}

echo "</pre>";
echo "<hr><h3>Concluído!</h3>";
echo "<p>Total de arquivos alterados: <b>$contador</b>.</p>";
echo "<p>Agora o nome Starfy deve ter sumido de menus, títulos e textos.</p>";
?>