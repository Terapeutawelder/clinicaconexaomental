<?php
// ATENÇÃO: Preencha com as suas credenciais do banco de dados da Hostinger.
// É uma prática de segurança recomendada manter este arquivo fora da pasta 'public_html' se possível.
// Se não for possível, proteja-o com um arquivo .htaccess.

define('DB_HOST', 'localhost');
define('DB_USER', 'u232648875_Suporte'); // Insira seu usuário do banco de dados
define('DB_PASS', 'Leonardo195423@');   // Insira sua senha
define('DB_NAME', 'u232648875_licensa'); // Insira o nome do banco de dados

// Define o fuso horário padrão para o PHP para 'America/Sao_Paulo' (Horário de Brasília)
date_default_timezone_set('America/Sao_Paulo');

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8", DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Define o fuso horário da sessão do MySQL para UTC-03:00 (Horário de Brasília)
    // Isso evita o erro "Unknown or incorrect time zone" se o servidor MySQL não tiver as tabelas de fuso horário instaladas.
    $pdo->exec("SET time_zone = '-03:00';");
} catch (PDOException $e) {
    // Em um ambiente de produção, você pode querer registrar este erro em vez de exibi-lo.
    die("ERRO: Não foi possível conectar ao banco de dados. " . $e->getMessage());
}

// Inicia a sessão para todas as páginas do painel
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
?>