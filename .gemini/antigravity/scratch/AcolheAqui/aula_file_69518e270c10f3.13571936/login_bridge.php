<?php
/**
 * AcolheAqui Login Bridge
 * This script allows seamless login from the React Dashboard.
 * 
 * Usage from React: 
 * window.open('/public/checkout-system/login_bridge.php?email=' + userEmail + '&token=' + secretToken);
 */

require_once 'config.php';

$email = $_GET['email'] ?? '';
$token = $_GET['token'] ?? ''; // In a real app, this should be a verified JWT or a shared secret.

// For development purposes, we will trust the email if the token matches a secret.
$SECRET_TOKEN = 'acolheaqui_secret_123';

if (empty($email) || $token !== $SECRET_TOKEN) {
    die("Acesso não autorizado ou parâmetros inválidos.");
}

// 1. Check if user exists in the PHP database
$sql = "SELECT id, usuario, nome, tipo FROM usuarios WHERE usuario = :usuario";
$stmt = $pdo->prepare($sql);
$stmt->bindParam(":usuario", $email, PDO::PARAM_STR);
$stmt->execute();

if ($stmt->rowCount() == 1) {
    // User exists, login
    $row = $stmt->fetch();
} else {
    // 2. Auto-register the user if they don't exist
    // We assume they are authorized since they coming from the React dashboard.
    $insert_sql = "INSERT INTO usuarios (nome, usuario, senha, tipo) VALUES (:nome, :usuario, :senha, 'infoprodutor')";
    $insert_stmt = $pdo->prepare($insert_sql);
    
    $default_name = explode('@', $email)[0];
    $insert_stmt->bindParam(":nome", $default_name, PDO::PARAM_STR);
    $insert_stmt->bindParam(":usuario", $email, PDO::PARAM_STR);
    
    // Set a random dummy password (they login via bridge)
    $dummy_password = password_hash(bin2hex(random_bytes(10)), PASSWORD_DEFAULT);
    $insert_stmt->bindParam(":senha", $dummy_password, PDO::PARAM_STR);
    
    $insert_stmt->execute();
    
    // Fetch the new user
    $stmt->execute();
    $row = $stmt->fetch();
}

// 3. Set Session
$_SESSION["loggedin"] = true;
$_SESSION["id"] = $row["id"];
$_SESSION["usuario"] = $row["usuario"];
$_SESSION["nome"] = $row["nome"];
$_SESSION["tipo"] = (isset($row['tipo']) ? $row['tipo'] : 'infoprodutor');
$_SESSION['is_infoprodutor'] = ($_SESSION["tipo"] == 'infoprodutor');

// 4. Redirect to PHP Dashboard
header("location: dashboard.php");
exit();
?>
