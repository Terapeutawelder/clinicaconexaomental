<?php
// Assumimos que o seu arquivo 'config.php' já inicia a sessão com session_start().
// Se não for o caso, a linha session_start() deve ser a primeira linha deste arquivo.
require_once 'config.php';

// Se o usuário já estiver logado, redireciona para o painel apropriado
if (isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true) {
    // Redirecionamentos baseados no tipo
    if (isset($_SESSION["tipo"]) && $_SESSION["tipo"] == 'admin') {
        header("location: admin.php"); exit;
    } 
    if (isset($_SESSION["tipo"]) && $_SESSION["tipo"] == 'infoprodutor') {
        header("location: index.php"); exit;
    }
    if (isset($_SESSION["tipo"]) && $_SESSION["tipo"] == 'usuario') {
        header("location: member_area_dashboard.php"); exit;
    }
    header("location: login.php"); exit;
}

$erro = '';
$usuario_input = '';

// Verifica se existe cookie de "Lembrar usuário" para pré-preencher
if (isset($_COOKIE['remember_user'])) {
    $usuario_input = $_COOKIE['remember_user'];
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    if (empty(trim($_POST["usuario"])) || empty(trim($_POST["senha"]))) {
        $erro = "Por favor, preencha o usuário e a senha.";
    } else {
        $usuario_input = trim($_POST["usuario"]);
        $senha_input = trim($_POST["senha"]);

        $sql = "SELECT id, usuario, nome, senha, tipo FROM usuarios WHERE usuario = :usuario";
        
        if ($stmt = $pdo->prepare($sql)) {
            $stmt->bindParam(":usuario", $usuario_input, PDO::PARAM_STR);
            
            if ($stmt->execute()) {
                if ($stmt->rowCount() == 1) {
                    $row = $stmt->fetch();
                    
                    if (password_verify($senha_input, $row["senha"])) {
                        $_SESSION["loggedin"] = true;
                        $_SESSION["id"] = $row["id"];
                        $_SESSION["usuario"] = $row["usuario"];
                        $_SESSION["nome"] = $row["nome"];
                        $_SESSION["tipo"] = $row["tipo"];

                        // Lógica do "Lembrar-me" (Cookies)
                        if (isset($_POST['remember'])) {
                            // Cria um cookie que expira em 30 dias
                            setcookie('remember_user', $usuario_input, time() + (86400 * 30), "/");
                        } else {
                            // Se desmarcado, remove o cookie se existir
                            if(isset($_COOKIE['remember_user'])) {
                                setcookie('remember_user', "", time() - 3600, "/");
                            }
                        }

                        // Redirecionamento
                        if ($row["tipo"] == 'admin') {
                            $_SESSION['is_infoprodutor'] = false;
                            header("location: admin.php"); 
                        } elseif ($row["tipo"] == 'infoprodutor') {
                            $_SESSION['is_infoprodutor'] = true;
                            header("location: index.php");
                        } else { 
                            $_SESSION['is_infoprodutor'] = false; 
                            header("location: member_area_dashboard.php"); 
                        }
                        exit();
                        
                    } else {
                        $erro = "Credenciais incorretas.";
                    }
                } else {
                    $erro = "Credenciais incorretas.";
                }
            } else {
                $erro = "Erro no sistema. Tente novamente.";
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
    <title>Login - Acesso à Plataforma</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <style> 
        body { 
            font-family: 'Plus Jakarta Sans', sans-serif; 
        } 
        
        .modern-input-group {
            position: relative;
            transition: all 0.3s ease;
        }
        
        .modern-input {
            width: 100%;
            padding: 1rem 1rem 1rem 3rem;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 1rem;
            color: #1e293b;
            font-size: 0.95rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .modern-input:focus {
            outline: none;
            background-color: #ffffff;
            border-color: #f97316;
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
            color: #f97316;
        }

        .btn-primary {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
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
            background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
            z-index: -1;
            transition: opacity 0.3s ease;
            opacity: 0;
        }

        .btn-primary:hover::before {
            opacity: 1;
        }

        @keyframes float-up {
            0% { opacity: 0; transform: translateY(40px) scale(0.9); }
            10% { opacity: 1; transform: translateY(0) scale(1); }
            90% { opacity: 1; transform: translateY(0) scale(1); }
            100% { opacity: 0; transform: translateY(-40px) scale(0.9); }
        }

        .notification-card {
            animation: float-up 4s ease-in-out forwards;
        }
        
        .glass-effect {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.5);
        }

        /* Checkbox customizado */
        .custom-checkbox input:checked + div {
            background-color: #f97316;
            border-color: #f97316;
        }
        .custom-checkbox input:checked + div svg {
            display: block;
        }
    </style>
</head>
<body class="bg-slate-50 min-h-screen">

    <div class="min-h-screen grid lg:grid-cols-2">
            
        <!-- Coluna da Esquerda -->
        <div class="hidden lg:flex relative flex-col justify-end p-12 overflow-hidden bg-slate-900">
            <div class="absolute inset-0 z-0">
                <img src="https://img.freepik.com/fotos-premium/cabelo-encaracolado-de-jovem-feliz-sorrindo-e-rindo-ela-esta-feliz-em-estudio-isolado-com-solido-brilhante_39704-6416.jpg" 
                     class="w-full h-full object-cover opacity-90" 
                     alt="Background">
                <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            </div>
            
            <div id="notifications-wrapper" class="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-center items-start gap-4"></div>

            <div class="relative z-20 mb-8 max-w-lg">
                <div class="inline-block px-3 py-1 mb-4 rounded-full bg-orange-500/20 border border-orange-500/30 backdrop-blur-md">
                    <span class="text-orange-400 text-xs font-bold tracking-wider uppercase">Plataforma #1 em Conversão</span>
                </div>
                <h1 class="text-5xl font-bold text-white mb-4 leading-tight">
                    Escale suas vendas <br>
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-200">sem limites.</span>
                </h1>
                <p class="text-gray-300 text-lg leading-relaxed">
                    Junte-se a milhares de empreendedores que faturam todos os dias com nossa tecnologia de alta performance.
                </p>
            </div>
        </div>

        <!-- Coluna da Direita -->
        <div class="flex items-center justify-center p-8 bg-white">
            <div class="w-full max-w-[420px] space-y-8">
                
                <div class="text-center">
                    <div class="inline-flex justify-center mb-6 p-4 rounded-3xl bg-orange-50 mb-6">
                        <img src="https://i.ibb.co/jZqbR2dv/1757909548831-Photoroom.png" alt="Logo" class="w-auto h-16 object-contain">
                    </div>
                    <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Bem-vindo de volta!</h2>
                    <p class="text-slate-500 mt-2">Acesse sua conta para gerenciar seu império.</p>
                </div>
                
                <?php if(!empty($erro)): ?>
                    <div class="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 animate-pulse" role="alert">
                        <i data-lucide="alert-circle" class="w-5 h-5 flex-shrink-0"></i>
                        <p class="text-sm font-medium"><?php echo htmlspecialchars($erro); ?></p>
                    </div>
                <?php endif; ?>

                <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post" class="space-y-6">
                    
                    <div class="space-y-5">
                        <div class="modern-input-group">
                            <label for="usuario" class="block text-slate-700 text-sm font-bold mb-2 ml-1">Usuário</label>
                            <div class="relative">
                                <i data-lucide="user" class="input-icon w-5 h-5"></i>
                                <input type="text" name="usuario" id="usuario" 
                                       class="modern-input" 
                                       value="<?php echo htmlspecialchars($usuario_input); ?>" 
                                       required 
                                       placeholder="exemplo@email.com"
                                       autocomplete="username">
                            </div>
                        </div>

                        <div class="modern-input-group">
                            <label for="senha" class="block text-slate-700 text-sm font-bold mb-2 ml-1">Senha</label>
                            <div class="relative">
                                <i data-lucide="lock" class="input-icon w-5 h-5"></i>
                                <input type="password" name="senha" id="senha" 
                                       class="modern-input" 
                                       required 
                                       placeholder="••••••••"
                                       autocomplete="current-password">
                            </div>
                        </div>

                        <!-- Checkbox "Lembrar-me" -->
                        <label class="custom-checkbox flex items-center gap-3 cursor-pointer group">
                            <div class="relative">
                                <input type="checkbox" name="remember" class="peer sr-only">
                                <div class="w-5 h-5 border-2 border-slate-300 rounded-md bg-white peer-focus:ring-2 peer-focus:ring-orange-200 transition-all duration-200 flex items-center justify-center group-hover:border-orange-400">
                                    <svg class="w-3.5 h-3.5 text-white hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                            </div>
                            <span class="text-sm font-medium text-slate-600 group-hover:text-slate-800 select-none">Lembrar meu acesso</span>
                        </label>
                    </div>

                    <button type="submit" class="btn-primary w-full text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group">
                        <span>Acessar Painel</span>
                        <i data-lucide="arrow-right" class="w-5 h-5 group-hover:translate-x-1 transition-transform"></i>
                    </button>
                </form>
            </div>
        </div>

    </div>

    <script>
        lucide.createIcons();

        const wrapper = document.getElementById('notifications-wrapper');
        const names = ['Gabriel S.', 'Amanda M.', 'Lucas R.', 'Beatriz C.', 'João P.', 'Fernanda L.'];
        const actions = [
            { type: 'Venda Aprovada', icon: 'check-circle', color: 'text-green-500', valueRange: [47, 297] },
            { type: 'PIX Gerado', icon: 'qr-code', color: 'text-blue-500', valueRange: [97, 197] },
            { type: 'Venda Cartão', icon: 'credit-card', color: 'text-orange-500', valueRange: [147, 497] }
        ];

        function formatCurrency(value) {
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
        }

        function createNotification() {
            if (wrapper.children.length > 3) wrapper.removeChild(wrapper.firstChild);

            const randomName = names[Math.floor(Math.random() * names.length)];
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            const randomValue = Math.floor(Math.random() * (randomAction.valueRange[1] - randomAction.valueRange[0]) + randomAction.valueRange[0]) + 0.90;

            const notif = document.createElement('div');
            notif.className = 'notification-card glass-effect rounded-2xl p-4 flex items-center gap-4 w-72 transform transition-all shadow-xl border-l-4 border-orange-500';
            
            notif.innerHTML = `
                <div class="bg-white/50 p-2 rounded-full">
                    <img src="https://i.ibb.co/jZqbR2dv/1757909548831-Photoroom.png" class="w-8 h-8 object-contain">
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                        <p class="text-xs font-bold text-slate-800 truncate">${randomAction.type}</p>
                        <span class="text-[10px] text-slate-500">Agora</span>
                    </div>
                    <p class="text-sm font-extrabold text-slate-900 mt-0.5">${formatCurrency(randomValue)}</p>
                    <p class="text-[10px] text-slate-500 truncate">${randomName} acabou de comprar</p>
                </div>
            `;

            wrapper.appendChild(notif);

            setTimeout(() => {
                if(notif.parentNode === wrapper) wrapper.removeChild(notif);
            }, 4000);
        }

        function startNotificationLoop() {
            createNotification();
            const nextTime = Math.random() * 2000 + 1500;
            setTimeout(startNotificationLoop, nextTime);
        }

        if (window.innerWidth >= 1024) {
            setTimeout(startNotificationLoop, 1000);
        }
    </script>
</body>
</html>