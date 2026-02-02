<?php
// corrigir_tudo_agora.php
// Script Forçado para: 1. Aumentar Logo, 2. Mudar Tema para Verde, 3. Garantir URL Local

$arquivos = ['admin.php', 'dashboard.php', 'login.php', 'index.php', 'includes/header.php'];
$caminho_logo = 'assets/logo.png';

echo "<h1>CORREÇÃO GERAL FORÇADA</h1>";
echo "<p>Aplicando: Logo Gigante (h-20) + Tema Verde (emerald)...</p><hr>";

foreach ($arquivos as $arquivo) {
    if (!file_exists($arquivo))
        continue;

    $conteudo = file_get_contents($arquivo);
    $novoConteudo = $conteudo;

    // --- PARTE 1: LOGO ---

    // Força URL para assets/logo.png (caso ainda tenha sobrado algum link errado)
    $novoConteudo = preg_replace('/src=["\']https?:\/\/[^"\']*ibb\.co[^"\']*["\']/', 'src="' . $caminho_logo . '"', $novoConteudo);

    // Força Tamanho Gigante (h-20)
    // Remove qualquer h-8, h-10, h-12, h-16 e coloca h-20
    $padroes_tamanho = ['h-8', 'h-10', 'h-12', 'h-16', 'w-8', 'w-10'];
    foreach ($padroes_tamanho as $tamanho) {
        $novoConteudo = preg_replace('/(class=["\'][^"\']*)\b' . $tamanho . '\b([^"\']*["\'])/', '$1h-20$2', $novoConteudo);
    }

    // --- PARTE 2: COR (TEMA VERDE) ---
    $novoConteudo = str_replace(
        ['bg-orange-', 'text-orange-', 'border-orange-', 'ring-orange-', 'from-orange-', 'to-orange-'],
        ['bg-emerald-', 'text-emerald-', 'border-emerald-', 'ring-emerald-', 'from-emerald-', 'to-emerald-'],
        $novoConteudo
    );

    $novoConteudo = str_replace('text-red-500', 'text-emerald-500', $novoConteudo); // Ajuste extra para botões vermelhos se quiser

    // --- SALVAR ---
    if ($novoConteudo !== $conteudo) {
        file_put_contents($arquivo, $novoConteudo);
        echo "<p style='color:green'>✅ <b>$arquivo</b>: Atualizado com Sucesso!</p>";
    } else {
        echo "<p style='color:gray'>ℹ️ <b>$arquivo</b>: Nada para alterar (provavelmente já está atualizado).</p>";
    }

    // --- DIAGNÓSTICO FINAL ---
    // Mostra como ficou a tag da logo para conferência
    if (preg_match('/<img[^>]*logo[^>]*>/i', $novoConteudo, $match)) {
        echo "<blockquote>Logo ficou assim: <code>" . htmlspecialchars($match[0]) . "</code></blockquote>";
    }
}

echo "<hr><h3>FIM DO PROCESSO</h3>";
echo "<p>Se a logo ainda estiver antiga: <b>LIMPE O CACHE DO NAVEGADOR</b> (Ctrl + Shift + R).</p>";
echo "<p>Se a cor não mudou: Verifique se o arquivo modificado foi salvo corretamente.</p>";
?>