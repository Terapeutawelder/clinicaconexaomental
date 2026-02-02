<?php
// verificar.php
// Mostra a logo atual ignorando o cache do navegador

$versao = time(); // Número aleatório para forçar o navegador a baixar a imagem de novo
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <title>Verificador de Logo</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-gray-100 p-10 text-center">

    <h1 class="text-2xl font-bold mb-5">Qual Logo está no Servidor?</h1>

    <div class="bg-white p-10 rounded shadow inline-block">
        <p class="mb-4 text-gray-600">Esta é a imagem exata que está na pasta <b>assets/logo.png</b> agora:</p>

        <!-- O ?v=... obriga o navegador a mostrar a versão nova -->
        <img src="assets/logo.png?v=<?php echo $versao; ?>" alt="Logo Atual" class="mx-auto border-4 border-red-500"
            style="max-height: 200px;">

        <p class="mt-4 text-sm text-gray-500">Se esta imagem for a ANTIGA (Starfy ou Cruz), você precisa enviar a nova
            de novo.</p>
        <p class="text-sm text-gray-500">Se esta imagem for a NOV (Cérebro), mas no site aparece a velha, é
            <b>CACHE</b>.</p>
    </div>

</body>

</html>