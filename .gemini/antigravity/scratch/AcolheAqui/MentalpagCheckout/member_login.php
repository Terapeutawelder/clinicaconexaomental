<?php
// Inclui o arquivo de configuração que inicia a sessão com session_start() e a conexão PDO.
require_once 'config.php';

// Se o usuário já estiver logado, redireciona para o painel apropriado.
if (isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true) {
    if (isset($_SESSION["tipo"]) && $_SESSION["tipo"] == 'admin') {
        header("location: admin.php"); 
    } else { 
        header("location: member_area_dashboard.php"); 
    }
    exit;
}

$erro = '';
$email_input = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    if (empty(trim($_POST["email"])) || empty(trim($_POST["senha"]))) {
        $erro = "Por favor, preencha o e-mail e a senha.";
    } else {
        $email_input = trim($_POST["email"]);
        $senha_input = trim($_POST["senha"]);

        // Seleciona o usuário no banco de dados, especificamente procurando por tipo 'usuario'
        $sql = "SELECT id, usuario, nome, senha, tipo FROM usuarios WHERE usuario = :email AND tipo = 'usuario'";
        
        if ($stmt = $pdo->prepare($sql)) {
            $stmt->bindParam(":email", $email_input, PDO::PARAM_STR);
            
            if ($stmt->execute()) {
                if ($stmt->rowCount() == 1) {
                    $row = $stmt->fetch(PDO::FETCH_ASSOC);
                    
                    if (password_verify($senha_input, $row["senha"])) {
                        $_SESSION["loggedin"] = true;
                        $_SESSION["id"] = $row["id"];
                        $_SESSION["usuario"] = $row["usuario"]; 
                        $_SESSION["nome"] = $row["nome"]; 
                        $_SESSION["tipo"] = $row["tipo"]; 
                        
                        header("location: member_area_dashboard.php");
                        exit();
                    } else {
                        $erro = "E-mail ou senha inválidos.";
                    }
                } else {
                    $erro = "E-mail ou senha inválidos.";
                }
            } else {
                $erro = "Oops! Algo deu errado. Por favor, tente novamente mais tarde.";
            }
            unset($stmt);
        }
    }
    unset($pdo);
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acesso à Área de Membros - Mentalpag</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <style> 
        body { 
            font-family: 'Plus Jakarta Sans', sans-serif; 
            background-color: #f8fafc; /* Slate 50 background global */
        } 
        
        /* Estilos dos Inputs Modernos (Mesma pegada do login principal) */
        .modern-input-group {
            position: relative;
            transition: all 0.3s ease;
        }
        
        .modern-input {
            width: 100%;
            padding: 1rem 1rem 1rem 3rem; /* Padding maior para conforto */
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 1rem; /* Arredondado */
            color: #1e293b;
            font-size: 0.95rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .modern-input:focus {
            outline: none;
            background-color: #ffffff;
            border-color: #10b981; /* Laranja Mentalpag */
            box-shadow: 0 4px 20px -2px rgba(249, 115, 22, 0.15);
            transform: translateY(-1px);
        }

        .input-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: #94a3b8;
            transition: color 0.3s ease;
        }

        .modern-input:focus + .input-icon,
        .modern-input:focus ~ .input-icon {
            color: #10b981;
        }

        /* Botão Gradiente */
        .btn-primary {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            position: relative;
            overflow: hidden;
            z-index: 1;
        }
        
        .btn-primary::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
            z-index: -1;
            transition: opacity 0.3s ease;
            opacity: 0;
        }

        .btn-primary:hover::before {
            opacity: 1;
        }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center p-4">

    <!-- Card Centralizado -->
    <div class="w-full max-w-[450px] bg-white p-8 md:p-12 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100">
        
        <div class="text-center mb-10">
            <div class="inline-flex justify-center p-4 rounded-3xl bg-emerald-50 mb-6">
                 <img src="assets/logo.png" alt="Logotipo da Mentalpag" class="w-auto h-12 object-contain">
            </div>
            <h2 class="text-2xl font-bold text-slate-900">Área de Membros</h2>
            <p class="text-slate-500 mt-2 text-sm">Acesse seus cursos e conteúdos exclusivos.</p>
        </div>
        
        <?php if(!empty($erro)): ?>
            <div class="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 mb-6 animate-pulse" role="alert">
                <i data-lucide="alert-circle" class="w-5 h-5 flex-shrink-0"></i>
                <p class="text-sm font-medium"><?php echo htmlspecialchars($erro); ?></p>
            </div>
        <?php endif; ?>

        <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post" class="space-y-6">
            
            <div class="space-y-5">
                <!-- Campo E-mail -->
                <div class="modern-input-group">
                    <label for="email" class="block text-slate-700 text-sm font-bold mb-2 ml-1">Seu E-mail</label>
                    <div class="relative">
                        <i data-lucide="mail" class="input-icon w-5 h-5"></i>
                        <input type="email" name="email" id="email" 
                               class="modern-input" 
                               value="<?php echo htmlspecialchars($email_input); ?>" 
                               required 
                               placeholder="seuemail@exemplo.com">
                    </div>
                </div>

                <!-- Campo Senha -->
                <div class="modern-input-group">
                    <label for="senha" class="block text-slate-700 text-sm font-bold mb-2 ml-1">Sua Senha</label>
                    <div class="relative">
                        <i data-lucide="lock" class="input-icon w-5 h-5"></i>
                        <input type="password" name="senha" id="senha" 
                               class="modern-input" 
                               required 
                               placeholder="••••••••">
                    </div>
                </div>
            </div>

            <button type="submit" class="btn-primary w-full text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group mt-4">
                 <i data-lucide="log-in" class="w-5 h-5"></i>
                <span>Acessar Área de Membros</span>
            </button>
        </form>
        
        <!-- Rodapé Minimalista -->
        <p class="text-center text-xs text-slate-400 mt-10">
            &copy; <?php echo date("Y"); ?> Mentalpag. Todos os direitos reservados.
        </p>
    </div>

    <script>
        lucide.createIcons();
    </script>
</body>
</html>
