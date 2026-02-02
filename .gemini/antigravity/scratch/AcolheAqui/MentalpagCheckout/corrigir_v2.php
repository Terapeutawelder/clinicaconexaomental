<?php
// corrigir_v2.php
// CORREÇÃO FINAL: Cores (Amber/Orange) + Logo (Forçar Largura)

// Lista expandida de arquivos para garantir que pegamos Sidebar e outros includes
$arquivos = [
    'admin.php',
    'dashboard.php',
    'login.php',
    'index.php',
    'sidebar.php',
    'includes/header.php',
    'includes/sidebar.php',
    'includes/menu.php',
    'components/sidebar.php'
];

echo "<h1>CORREÇÃO V2: Amber + Largura da Logo</h1>";

foreach ($arquivos as $arquivo) {
    if (!file_exists($arquivo))
        continue;

    $conteudo = file_get_contents($arquivo);
    $novoConteudo = $conteudo;

    // --- 1. CORES (Expandido) ---
    // Alguns botões usam 'amber' (âmbar/amarelo queimado) que parece laranja.
    // Vamos trocar Amber e Orange por Emerald (Verde).

    $trocas_cor = [
        'bg-orange-' => 'bg-emerald-',
        'text-orange-' => 'text-emerald-',
        'border-orange-' => 'border-emerald-',
        'from-orange-' => 'from-emerald-',
        'to-orange-' => 'to-emerald-',
        'ring-orange-' => 'ring-emerald-',

        // Novas trocas para pegar o botão que sobrou
        'bg-amber-' => 'bg-emerald-',
        'text-amber-' => 'text-emerald-',
        'border-amber-' => 'border-emerald-',
        'from-amber-' => 'from-emerald-',
        'to-amber-' => 'to-emerald-',
        'ring-amber-' => 'ring-emerald-',

        // Hexadecimal específico (às vezes usado)
        '#f97316' => '#10b981', // Orange-500 -> Emerald-500
        '#f59e0b' => '#10b981', // Amber-500 -> Emerald-500
    ];

    $novoConteudo = str_replace(array_keys($trocas_cor), array_values($trocas_cor), $novoConteudo);

    // --- 2. LOGO (Forçar Largura) ---
    // Se h-20 não funcionou, vamos forçar a LARGURA (w-40) e remover w-auto.
    // Isso obriga a imagem a ocupar espaço horizontal.

    // Procura pela tag da logo (que já deve estar com h-20 do script anterior)
    // Vamos substituir 'w-auto' por 'w-40' (160px) ou adicionar se não tiver.

    if (strpos($novoConteudo, 'src="assets/logo.png"') !== false) {
        $novoConteudo = preg_replace('/(src="assets\/logo\.png"[^>]*class=["\'][^"\']*)w-auto/', '$1w-48', $novoConteudo);
        // Se após isso ainda tiver h-20, vamos aumentar para h-24 para garantir
        $novoConteudo = str_replace('h-20', 'h-24', $novoConteudo);
    }

    // Salvar
    if ($novoConteudo !== $conteudo) {
        file_put_contents($arquivo, $novoConteudo);
        echo "<p style='color:green'>✅ <b>$arquivo</b>: Cores Amber removidas e Logo alargada (w-48)!</p>";
    } else {
        echo "<p style='color:gray'>ℹ️ <b>$arquivo</b>: Sem novas alterações.</p>";
    }
}

echo "<hr><h3>Processo Concluído</h3>";
echo "<p>Agora deve ter sumido o laranja restante e a logo deve estar BEM larga.</p>";
echo "<p><b>IMPORTANTE:</b> Atualize a página com <b>Ctrl + F5</b> para limpar o cache.</p>";
?>