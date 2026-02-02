<?php
// login.php (Versão Corrigida para Schema Hostinger)
session_start();

if (isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true) {
    if (isset($_SESSION["tipo"]) && $_SESSION["tipo"] === 'admin') {
        header("location: index.php");
    } else {
        header("location: member_area_dashboard.php");
    }
    exit;
}

require_once "config.php";

$email = $senha = "";
$email_err = $senha_err = $login_err = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    if (empty(trim($_POST["email"]))) {
        $email_err = "Por favor, insira o email.";
    } else {
        $email = trim($_POST["email"]);
    }

    if (empty(trim($_POST["senha"]))) {
        $senha_err = "Por favor, insira a senha.";
    } else {
        $senha = trim($_POST["senha"]);
    }

    if (empty($email_err) && empty($senha_err)) {
        // Coluna no banco é 'usuario', mas usamos email como valor
        $sql = "SELECT id, usuario, nome, senha, tipo, foto_perfil FROM usuarios WHERE usuario = ?";

        if ($stmt = $pdo->prepare($sql)) {
            $stmt->execute([$email]);

            if ($stmt->rowCount() == 1) {
                if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $id = $row["id"];
                    $db_usuario = $row["usuario"];
                    $nome = $row["nome"];
                    $hashed_password = $row["senha"];
                    $tipo = $row["tipo"];
                    $foto = $row["foto_perfil"];

                    if (password_verify($senha, $hashed_password)) {
                        $_SESSION["loggedin"] = true;
                        $_SESSION["id"] = $id;
                        $_SESSION["usuario"] = $db_usuario;
                        $_SESSION["nome"] = $nome;
                        $_SESSION["tipo"] = $tipo;
                        $_SESSION["foto_perfil"] = $foto;

                        if ($tipo === 'admin') {
                            header("location: index.php");
                        } else {
                            header("location: member_area_dashboard.php");
                        }
                        exit;
                    } else {
                        $login_err = "Senha inválida.";
                    }
                }
            } else {
                $login_err = "Nenhuma conta encontrada com esse email.";
            }
            unset($stmt);
        } else {
            echo "Ops! Algo deu errado. Tente novamente mais tarde.";
        }
    }
    unset($pdo);
}
?>

<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Mentalpag</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="manifest" href="/manifest.json">
    <script>
        tailwind.config = {
            theme: { extend: { fontFamily: { sans: ['Inter', 'sans-serif'] } } }
        }
    </script>
</head>

<body class="bg-indigo-50 min-h-screen flex items-center justify-center font-sans">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        <div class="p-8 sm:p-10">
            <div class="text-center mb-8">
                <div
                    class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-500 mb-4">
                    <img src="assets/logo.png" onerror="this.src='https://via.placeholder.com/80?text=Logo'"
                        class="h-12 w-auto">
                </div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Área de Membros</h1>
                <p class="text-gray-500">Acesse seus cursos e conteúdos exclusivos.</p>
            </div>

            <?php
            if (!empty($login_err)) {
                echo '<div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 text-red-500">
                                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
                            </div>
                            <div class="ml-3"><p class="text-sm text-red-700 font-medium">' . $login_err . '</p></div>
                        </div>
                      </div>';
            }
            ?>

            <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post" class="space-y-6">
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">Seu E-mail</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <input type="text" name="email"
                            class="block w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors <?php echo (!empty($email_err)) ? 'border-red-500' : ''; ?>"
                            value="<?php echo $email; ?>" placeholder="exemplo@email.com">
                    </div>
                    <span class="text-xs text-red-500 mt-1 ml-1">
                        <?php echo $email_err; ?>
                    </span>
                </div>

                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">Sua Senha</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <input type="password" name="senha"
                            class="block w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors <?php echo (!empty($senha_err)) ? 'border-red-500' : ''; ?>"
                            placeholder="••••••••">
                    </div>
                    <span class="text-xs text-red-500 mt-1 ml-1">
                        <?php echo $senha_err; ?>
                    </span>
                </div>

                <div class="flex items-center justify-between text-sm">
                    <label class="flex items-center text-gray-600 cursor-pointer hover:text-gray-900">
                        <input type="checkbox"
                            class="rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 w-4 h-4 mr-2">
                        Lembrar de mim
                    </label>
                    <a href="#" class="font-medium text-emerald-600 hover:text-emerald-500 hover:underline">Esqueceu a
                        senha?</a>
                </div>

                <button type="submit"
                    class="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all transform hover:scale-[1.02]">
                    <svg class="w-5 h-5 mr-2 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Acessar Área de Membros
                </button>
            </form>

            <p class="mt-8 text-center text-sm text-gray-400">
                &copy; 2026 Mentalpag. Todos os direitos reservados.
            </p>
        </div>
    </div>
</body>

</html>