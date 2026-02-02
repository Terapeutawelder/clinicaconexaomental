<?php
// renomear_arquivos.php
// Renomeia os arquivos físicos do servidor (starfy_... -> mentalpag_...)

echo "<h1>Renomeação de Arquivos Físicos</h1>";
echo "<pre>";

$mapa = [
    'starfy_track.php' => 'mentalpag_track.php',
    'jornada_starfy.php' => 'jornada_mentalpag.php',
    'starfy_play.php' => 'mentalpag_play.php', // Caso exista
    'admin_starfy.php' => 'admin_mentalpag.php', // Caso exista
];

$contador = 0;

foreach ($mapa as $antigo => $novo) {
    if (file_exists($antigo)) {
        if (rename($antigo, $novo)) {
            echo "✅ SUCESSO: <b>$antigo</b> virou <b>$novo</b>\n";
            $contador++;
        } else {
            echo "❌ ERRO: Não foi possível renomear $antigo\n";
        }
    } else {
        if (file_exists($novo)) {
            echo "ℹ️ JÁ EXISTE: $novo (OK)\n";
        } else {
            // echo "ℹ️ NÃO ENCONTRADO: $antigo (Talvez não exista neste sistema)\n";
        }
    }
}

echo "</pre>";
echo "<hr><h3>Processo Finalizado!</h3>";
if ($contador > 0) {
    echo "<p>Agora os links do menu (que já foram alterados para 'mentalpag_...') vão funcionar!</p>";
} else {
    echo "<p>Nenhum arquivo 'starfy' foi encontrado para renomear. Verifique se já estão certos.</p>";
}
echo "<p><a href='mentalpag_track.php'>Testar MentalPag Track</a></p>";
?>