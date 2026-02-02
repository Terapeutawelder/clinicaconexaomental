<?php
// corrigir_logo_final.php
// CORREÇÃO DEFINITIVA DE LOGO E CORES (V4)

echo "<h1>CORREÇÃO V4: VARREDURA GERAL + LOGO GIGANTE</h1>";
echo "<pre>";

// Pega TODOS os arquivos PHP recursivamente (limite de 2 níveis para não demorar demais)
$arquivos_raiz = glob("*.php");
$arquivos_includes = glob("includes/*.php");
$arquivos_components = glob("components/*.php"); // Caso exista
$arquivos_pages = glob("pages/*.php"); // Caso exista

// Une tudo
$todos_arquivos = array_merge(
    $arquivos_raiz ?: [],
    $arquivos_includes ?: [],
    $arquivos_components ?: [],
    $arquivos_pages ?: []
);

foreach ($todos_arquivos as $arquivo) {
    if (!file_exists($arquivo))
        continue;

    $conteudo = file_get_contents($arquivo);
    $novoConteudo = $conteudo;

    // --- 1. CORES (Matar todo tipo de laranja) ---
    $trocas = [
        'bg-orange-' => 'bg-emerald-',
        'text-orange-' => 'text-emerald-',
        'border-orange-' => 'border-emerald-',
        'ring-orange-' => 'ring-emerald-',
        'from-orange-' => 'from-emerald-',
        'to-orange-' => 'to-emerald-',
        'via-orange-' => 'via-emerald-', // Gradientes

        'bg-amber-' => 'bg-emerald-',
        'text-amber-' => 'text-emerald-',
        'border-amber-' => 'border-emerald-',
        'ring-amber-' => 'ring-emerald-',
        'from-amber-' => 'from-emerald-',
        'to-amber-' => 'to-emerald-',
        'via-amber-' => 'via-emerald-',

        '#f97316' => '#10b981',
        '#f59e0b' => '#10b981',
        '#ffedd5' => '#d1fae5',
        '#fff7ed' => '#ecfdf5',
    ];

    $novoConteudo = str_replace(array_keys($trocas), array_values($trocas), $novoConteudo);

    // --- 2. LOGO (Tamanho h-32 = 128px e Forçar URL) ---

    // Força URL
    if (strpos($novoConteudo, 'ibb.co') !== false) {
        $novoConteudo = preg_replace('/src=["\']https?:\/\/[^"\']*ibb\.co[^"\']*["\']/', 'src="assets/logo.png"', $novoConteudo);
    }

    // Aumentar Tamanho (Substitui qualquer tamanho anterior de logo por h-32)
    // Procura por tags de imagem que tenham src="assets/logo.png"
    if (strpos($novoConteudo, 'assets/logo.png') !== false) {

        // Remove limitação w-auto se existir, para deixar a largura crescer com a altura
        $novoConteudo = str_replace('w-auto', '', $novoConteudo);
        // Ou melhor, força w-auto para manter proporção, mas remove larguras fixas pequenas
        // $novoConteudo = str_replace('w-auto', 'w-auto', $novoConteudo); 

        // Remove tamanhos antigos
        $tamanhos_antigos = ['h-8', 'h-10', 'h-12', 'h-16', 'h-20', 'h-24', 'w-8', 'w-10', 'w-12', 'w-16', 'w-32', 'w-48'];
        // Substituimos classes específicas que estariam na mesma tag
        // Regex é mais seguro:
        $novoConteudo = preg_replace('/(src=["\']assets\/logo\.png["\'][^>]*class=["\'][^"\']*)h-\d+/', '$1h-32', $novoConteudo);
        $novoConteudo = preg_replace('/(src=["\']assets\/logo\.png["\'][^>]*class=["\'][^"\']*)w-\d+/', '$1w-auto', $novoConteudo);

        // Caso regex falhe ou seja inline style:
        $novoConteudo = str_replace('height: 30px', 'height: 120px', $novoConteudo);
        $novoConteudo = str_replace('height: 40px', 'height: 120px', $novoConteudo);
        $novoConteudo = str_replace('height: 80px', 'height: 120px', $novoConteudo);
    }

    if ($novoConteudo !== $conteudo) {
        file_put_contents($arquivo, $novoConteudo);
        echo "✅ MODIFICADO: $arquivo\n";
    }
}

echo "</pre>";
echo "<hr><h3>ATUALIZADO PARA V4</h3>";
echo "<p>Cores Laranja/Amarelo -> Verde.</p>";
echo "<p>Logo definida para <b>h-32 (128px)</b> de altura.</p>";
echo "<h2>⚠️ Passo Final Obrigatório:</h2>";
echo "<p>Vá agora na pasta <b>assets</b> e certifique-se que a logo nova está lá como <b>logo.png</b>.</p>";
?>