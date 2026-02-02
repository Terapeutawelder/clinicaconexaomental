<?php
// corrigir_final_v3.php
// CORREÇÃO UNIVERSAL: Varre TODOS os arquivos PHP para trocar cores e ajustar a logo.

echo "<h1>CORREÇÃO V3: VARREDURA GERAL</h1>";
echo "<pre>";

$arquivos = glob("*.php"); // Pega todos os arquivos .php na raiz
$arquivos_includes = glob("includes/*.php"); // Pega includes
$todos_arquivos = array_merge($arquivos, $arquivos_includes);

// Opcional: Adicionar pastas extras se existirem
if (is_dir('components')) {
    $arquivos_comp = glob("components/*.php");
    $todos_arquivos = array_merge($todos_arquivos, $arquivos_comp);
}

foreach ($todos_arquivos as $arquivo) {
    if (!file_exists($arquivo))
        continue;

    $conteudo = file_get_contents($arquivo);
    $novoConteudo = $conteudo;
    $alterado = false;

    // --- CORES (Todas as variações possíveis de laranja/âmbar) ---
    $trocas = [
        'bg-orange-' => 'bg-emerald-',
        'text-orange-' => 'text-emerald-',
        'border-orange-' => 'border-emerald-',
        'ring-orange-' => 'ring-emerald-',
        'from-orange-' => 'from-emerald-',
        'to-orange-' => 'to-emerald-',

        'bg-amber-' => 'bg-emerald-',
        'text-amber-' => 'text-emerald-',
        'border-amber-' => 'border-emerald-',
        'ring-amber-' => 'ring-emerald-',
        'from-amber-' => 'from-emerald-',
        'to-amber-' => 'to-emerald-',

        // Cores específicas em hexadecimal
        '#f97316' => '#10b981',
        '#f59e0b' => '#10b981',
        '#ffedd5' => '#d1fae5', // Laranja claro -> Verde claro
        '#fff7ed' => '#ecfdf5', // Fundo bem claro
    ];

    $novoConteudo = str_replace(array_keys($trocas), array_values($trocas), $novoConteudo);

    // --- LOGO (Forçar URL Local + Tamanho) ---
    // 1. Remove ImgBB (se existir)
    if (strpos($novoConteudo, 'ibb.co') !== false) {
        $novoConteudo = preg_replace('/src=["\']https?:\/\/[^"\']*ibb\.co[^"\']*["\']/', 'src="assets/logo.png"', $novoConteudo);
    }

    // 2. Aumentar Logo
    if (strpos($novoConteudo, 'assets/logo.png') !== false) {
        // Se tiver w-auto, troca por w-48
        $novoConteudo = str_replace('w-auto', 'w-48', $novoConteudo);

        // Remove tamanhos fixos pequenos
        $novoConteudo = str_replace(['h-8', 'h-10', 'h-12', 'w-8', 'w-10'], 'h-24', $novoConteudo);

        // Se já tinha h-16 ou h-20 de scripts anteriores, aumenta para h-24
        $novoConteudo = str_replace(['h-16', 'h-20'], 'h-24', $novoConteudo);
    }

    if ($novoConteudo !== $conteudo) {
        file_put_contents($arquivo, $novoConteudo);
        echo "✅ MODIFICADO: $arquivo\n";
    } else {
        // echo "ℹ️ Sem alterações: $arquivo\n"; 
    }
}

echo "</pre>";
echo "<hr><h3>CONCLUÍDO! Laranja virou Verde. Logo está GIGANTE.</h3>";
echo "<h2>⚠️ IMPORTANTE: Vá na pasta assets e ENVIE A LOGO CORRETA (Cérebro).</h2>";
echo "<p>Se o site mostra a logo errada (cruz), é porque o arquivo logo.png que você enviou antes ERA a cruz.</p>";
?>