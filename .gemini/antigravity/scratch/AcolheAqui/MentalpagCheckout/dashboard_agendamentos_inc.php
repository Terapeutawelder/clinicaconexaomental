<?php
// dashboard_agendamentos_inc.php
// Injetado antes do dashboard.php para exibir os cards de agendamentos

// Verifica se está logado (redundância, pois index.php já verifica)
if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    return;
}

// Busca agendamentos recentes
$agendamentos_dash = [];
try {
    $stmt_ag = $pdo->prepare("SELECT * FROM agendamentos WHERE usuario_id = ? ORDER BY data_sessao DESC, hora_inicio DESC LIMIT 4");
    $stmt_ag->execute([$_SESSION['id']]);
    $agendamentos_dash = $stmt_ag->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    // Silently fail or log
    error_log("Erro ao buscar agendamentos para dashboard: " . $e->getMessage());
}
?>

<!-- Seção Injetada de Agendamentos -->
<div class="container mx-auto px-4 mt-6">
    <div class="mb-4">
        <h2 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <i data-lucide="calendar-check-2" class="w-6 h-6 text-emerald-600"></i>
            Últimos Agendamentos
        </h2>

        <?php if (empty($agendamentos_dash)): ?>
            <!-- Estado Vazio (Opcional: Pode ocultar ou mostrar mensagem) -->
            <!-- <p class="text-slate-400 text-sm">Nenhum agendamento recente.</p> -->
        <?php else: ?>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <?php foreach ($agendamentos_dash as $ag): ?>
                    <?php
                    $status_colors = [
                        'pendente_pagamento' => 'bg-yellow-50 text-yellow-700 border-yellow-200',
                        'pago' => 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        'cancelado' => 'bg-red-50 text-red-700 border-red-200',
                        'confirmado' => 'bg-blue-50 text-blue-700 border-blue-200'
                    ];
                    $status_class = $status_colors[$ag['status']] ?? 'bg-slate-50 text-slate-600 border-slate-200';
                    $status_label = ucfirst(str_replace('_', ' ', $ag['status']));

                    $data_fmt = date('d/m/Y', strtotime($ag['data_sessao']));
                    $hora_fmt = substr($ag['hora_inicio'], 0, 5);
                    ?>
                    <div
                        class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div class="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>

                        <div class="flex justify-between items-start mb-2">
                            <span
                                class="text-[10px] font-bold px-2 py-0.5 rounded border uppercase <?php echo $status_class; ?>">
                                <?php echo $status_label; ?>
                            </span>
                            <span class="text-xs text-slate-400 font-mono">
                                <?php echo $hora_fmt; ?>
                            </span>
                        </div>

                        <h3 class="font-bold text-slate-800 truncate text-sm"
                            title="<?php echo htmlspecialchars($ag['cliente_nome']); ?>">
                            <?php echo htmlspecialchars($ag['cliente_nome']); ?>
                        </h3>

                        <div class="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <i data-lucide="calendar" class="w-3 h-3"></i>
                            <span>
                                <?php echo $data_fmt; ?>
                            </span>
                        </div>

                        <div class="mt-3 pt-2 border-t border-slate-50 flex gap-2 justify-end">
                            <?php if (!empty($ag['cliente_telefone'])): ?>
                                <a href="https://wa.me/55<?php echo preg_replace('/[^0-9]/', '', $ag['cliente_telefone']); ?>"
                                    target="_blank"
                                    class="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="Chamar no WhatsApp">
                                    <i data-lucide="message-circle" class="w-4 h-4"></i>
                                </a>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
</div>