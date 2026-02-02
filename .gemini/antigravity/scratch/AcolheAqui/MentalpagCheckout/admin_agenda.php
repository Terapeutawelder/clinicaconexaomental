<?php
// admin_agenda.php - Gerenciamento de Perfil e Horários
require_once 'config.php';

// Proteção: Login
if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    header("location: login.php");
    exit;
}

$usuario_id = $_SESSION['id'];
$mensagem = '';
$msg_type = '';

// --- PROCESSAR FORMULÁRIO ---
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // 1. Salvar Perfil (Bio, CRP, Abordagens)
    if (isset($_POST['salvar_perfil'])) {
        $registro = trim($_POST['registro_profissional'] ?? '');
        $abordagens = trim($_POST['abordagens'] ?? '');
        $biografia = trim($_POST['biografia'] ?? '');

        try {
            $stmt = $pdo->prepare("UPDATE usuarios SET registro_profissional = ?, abordagens = ?, biografia = ?, instagram_url = ?, facebook_url = ?, youtube_url = ? WHERE id = ?");
            if ($stmt->execute([$registro, $abordagens, $biografia, $_POST['instagram_url'], $_POST['facebook_url'], $_POST['youtube_url'], $usuario_id])) {
                $mensagem = "Perfil atualizado com sucesso!";
                $msg_type = 'success';
            }
        } catch (PDOException $e) {
            $mensagem = "Erro ao salvar perfil: " . $e->getMessage();
            $msg_type = 'error';
        }
    }

    // 2. Salvar Disponibilidade (Agenda)
    if (isset($_POST['salvar_agenda'])) {
        // Limpa disponibilidade anterior
        $pdo->prepare("DELETE FROM agenda_disponibilidade WHERE usuario_id = ?")->execute([$usuario_id]);

        $dias_selecionados = $_POST['dias'] ?? [];
        
        try {
            $stmt_insert = $pdo->prepare("INSERT INTO agenda_disponibilidade (usuario_id, dia_semana, hora_inicio, hora_fim, ativo) VALUES (?, ?, ?, ?, 1)");
            
            foreach ($dias_selecionados as $dia) {
                $inicio = $_POST["inicio_$dia"] ?? '08:00';
                $fim = $_POST["fim_$dia"] ?? '18:00';
                
                // Validação básica
                if (!empty($inicio) && !empty($fim)) {
                    $stmt_insert->execute([$usuario_id, $dia, $inicio, $fim]);
                }
            }
            $mensagem = "Horários da agenda atualizados!";
            $msg_type = 'success';

        } catch (PDOException $e) {
            $mensagem = "Erro ao salvar agenda: " . $e->getMessage();
            $msg_type = 'error';
        }
    }
}

// --- CARREGAR DADOS ---

// 1. Dados do Usuário
$stmt = $pdo->prepare("SELECT registro_profissional, abordagens, biografia, instagram_url, facebook_url, youtube_url FROM usuarios WHERE id = ?");
$stmt->execute([$usuario_id]);
$user_profile = $stmt->fetch(PDO::FETCH_ASSOC);

// 2. Dados da Agenda
$stmt = $pdo->prepare("SELECT * FROM agenda_disponibilidade WHERE usuario_id = ?");
$stmt->execute([$usuario_id]);
$agenda_rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Mapeia para fácil acesso na view: $agenda[dia_semana] = ['inicio' => ..., 'fim' => ...]
$agenda = [];
foreach ($agenda_rows as $row) {
    $agenda[$row['dia_semana']] = $row;
}

$dias_semana = [
    1 => 'Segunda-feira',
    2 => 'Terça-feira',
    3 => 'Quarta-feira',
    4 => 'Quinta-feira',
    5 => 'Sexta-feira',
    6 => 'Sábado',
    0 => 'Domingo'
];

?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Minha Agenda - Mentalpag</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            emerald: { 50: '#ecfdf5', 100: '#d1fae5', 500: '#10b981', 600: '#059669', 700: '#047857' }
          }
        }
      }
    }
    </script>
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f8fafc; }</style>
</head>
<body class="min-h-screen text-slate-800 pb-20">

    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <!-- Header -->
        <div class="mb-10">
            <h1 class="text-3xl font-extrabold text-slate-900">Configuração Bio & Agenda</h1>
            <p class="text-slate-500 mt-2">Personalize como você aparece no checkout e seus horários de atendimento.</p>
        </div>
        
        <!-- Botão Voltar -->
        <a href="dashboard.php" class="inline-flex items-center text-sm text-slate-500 hover:text-emerald-600 mb-6 transition-colors">
            <i data-lucide="arrow-left" class="w-4 h-4 mr-1"></i> Voltar ao Dashboard
        </a>

        <!-- Mensagens -->
        <?php if(!empty($mensagem)): ?>
            <div class="mb-6 p-4 rounded-lg flex items-center gap-3 <?php echo ($msg_type == 'success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'; ?>">
                <i data-lucide="<?php echo ($msg_type == 'success') ? 'check-circle' : 'alert-circle'; ?>" class="w-5 h-5"></i>
                <span class="font-medium"><?php echo $mensagem; ?></span>
            </div>
        <?php endif; ?>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Coluna 1: Perfil Profissional -->
            <div class="lg:col-span-1">
                <form method="POST" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-10">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="p-2 bg-blue-50 text-blue-600 rounded-lg"><i data-lucide="user-cog" class="w-5 h-5"></i></div>
                        <h2 class="text-xl font-bold text-slate-900">Peril & Redes Sociais</h2>
                    </div>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Registro Profissional</label>
                            <input type="text" name="registro_profissional" class="w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-sm" 
                                   placeholder="Ex: CRP 06/123456" 
                                   value="<?php echo htmlspecialchars($user_profile['registro_profissional'] ?? ''); ?>">
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Abordagens Terapêuticas</label>
                            <input type="text" name="abordagens" class="w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-sm" 
                                   placeholder="TCC, Psicanálise (separar por vírgula)" 
                                   value="<?php echo htmlspecialchars($user_profile['abordagens'] ?? ''); ?>">
                            <p class="text-xs text-slate-400 mt-1">Aparecerão como tags no seu perfil.</p>
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Minibiografia</label>
                            <textarea name="biografia" rows="4" class="w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-sm" 
                                      placeholder="Um breve resumo sobre sua especialidade..."><?php echo htmlspecialchars($user_profile['biografia'] ?? ''); ?></textarea>
                        </div>
                        
                        <div class="pt-4 border-t border-slate-100">
                             <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Redes Sociais</label>
                             
                             <div class="space-y-3">
                                 <div class="relative">
                                     <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                         <i data-lucide="instagram" class="w-4 h-4"></i>
                                     </div>
                                     <input type="text" name="instagram_url" class="pl-10 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-sm" placeholder="Instagram URL" value="<?php echo htmlspecialchars($user_profile['instagram_url'] ?? ''); ?>">
                                 </div>
                                 
                                 <div class="relative">
                                     <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                         <i data-lucide="facebook" class="w-4 h-4"></i>
                                     </div>
                                     <input type="text" name="facebook_url" class="pl-10 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-sm" placeholder="Facebook URL" value="<?php echo htmlspecialchars($user_profile['facebook_url'] ?? ''); ?>">
                                 </div>
                                 
                                 <div class="relative">
                                     <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                         <i data-lucide="youtube" class="w-4 h-4"></i>
                                     </div>
                                     <input type="text" name="youtube_url" class="pl-10 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-sm" placeholder="YouTube URL" value="<?php echo htmlspecialchars($user_profile['youtube_url'] ?? ''); ?>">
                                 </div>
                             </div>
                        </div>

                        <button type="submit" name="salvar_perfil" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2">
                            <i data-lucide="save" class="w-4 h-4"></i> Salvar Perfil
                        </button>
                    </div>
                </form>
            </div>

            <!-- Coluna 2: Configuração da Agenda (Slots) -->
            <div class="lg:col-span-2">
                <form method="POST" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div class="flex items-center gap-3 mb-8">
                        <div class="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><i data-lucide="calendar-clock" class="w-5 h-5"></i></div>
                        <div>
                            <h2 class="text-xl font-bold text-slate-900">Disponibilidade Semanal</h2>
                            <p class="text-sm text-slate-500">Marque os dias que você atende.</p>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <?php foreach ($dias_semana as $dia_num => $dia_nome): 
                            $isActive = isset($agenda[$dia_num]);
                            $horaIni = $isActive ? $agenda[$dia_num]['hora_inicio'] : '09:00';
                            $horaFim = $isActive ? $agenda[$dia_num]['hora_fim'] : '18:00';
                        ?>
                        <div class="flex items-center gap-4 p-4 rounded-lg border <?php echo $isActive ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100 bg-slate-50 opacity-60'; ?> transition-all hover:opacity-100">
                            
                            <!-- Checkbox Dia -->
                            <div class="flex items-center h-5">
                                <input type="checkbox" name="dias[]" value="<?php echo $dia_num; ?>" id="dia_<?php echo $dia_num; ?>" 
                                       class="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                       <?php echo $isActive ? 'checked' : ''; ?>
                                       onclick="toggleTimeInputs(<?php echo $dia_num; ?>)">
                            </div>
                            
                            <div class="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                                <label for="dia_<?php echo $dia_num; ?>" class="font-medium text-slate-700 cursor-pointer select-none">
                                    <?php echo $dia_nome; ?>
                                </label>
                                
                                <!-- Seletores de Horário -->
                                <div class="col-span-2 flex items-center gap-2 <?php echo $isActive ? '' : 'pointer-events-none opacity-50'; ?>" id="times_<?php echo $dia_num; ?>">
                                    <input type="time" name="inicio_<?php echo $dia_num; ?>" value="<?php echo $horaIni; ?>" class="rounded-md border-slate-300 text-sm focus:ring-emerald-500 focus:border-emerald-500">
                                    <span class="text-slate-400">até</span>
                                    <input type="time" name="fim_<?php echo $dia_num; ?>" value="<?php echo $horaFim; ?>" class="rounded-md border-slate-300 text-sm focus:ring-emerald-500 focus:border-emerald-500">
                                </div>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>

                    <div class="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                        <button type="submit" name="salvar_agenda" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-colors flex items-center gap-2">
                            <i data-lucide="calendar-check" class="w-5 h-5"></i> Salvar Horários
                        </button>
                    </div>
                </form>
            </div>

        </div>
    </div>

    <!-- Scripts -->
    <script>
        lucide.createIcons();

        function toggleTimeInputs(diaId) {
            const container = document.getElementById('times_' + diaId);
            const checkbox = document.getElementById('dia_' + diaId);
            
            if (checkbox.checked) {
                container.classList.remove('pointer-events-none', 'opacity-50');
                // Habilitar visualmente o card pai (opcional)
                checkbox.closest('.rounded-lg').classList.remove('opacity-60', 'bg-slate-50', 'border-slate-100');
                checkbox.closest('.rounded-lg').classList.add('bg-emerald-50/30', 'border-emerald-200');
            } else {
                container.classList.add('pointer-events-none', 'opacity-50');
                checkbox.closest('.rounded-lg').classList.add('opacity-60', 'bg-slate-50', 'border-slate-100');
                checkbox.closest('.rounded-lg').classList.remove('bg-emerald-50/30', 'border-emerald-200');
            }
        }
    </script>
</body>
</html>
