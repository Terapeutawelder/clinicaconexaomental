<?php
// admin_users.php
if (!isset($_SESSION["loggedin"]) || $_SESSION["tipo"] !== 'admin') {
    header("location: login.php");
    exit;
}

// Processar Exclusão
if (isset($_GET['delete_id'])) {
    $del_id = $_GET['delete_id'];
    $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ?");
    if ($stmt->execute([$del_id])) {
        echo "<div class='bg-green-100 text-green-700 p-4 rounded mb-4'>Usuário removido com sucesso!</div>";
    } else {
        echo "<div class='bg-red-100 text-red-700 p-4 rounded mb-4'>Erro ao remover usuário.</div>";
    }
}

// Listar Usuários
$sql = "SELECT id, nome, usuario, tipo, created_at FROM usuarios ORDER BY id DESC";
$stmt = $pdo->query($sql);
$usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<div class="bg-white rounded-xl shadow-lg p-6">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Gerenciar Usuários</h2>
        <a href="register.php"
            class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <i data-lucide="plus"></i> Novo Usuário
        </a>
    </div>

    <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
            <thead>
                <tr class="text-gray-500 border-b">
                    <th class="p-3">ID</th>
                    <th class="p-3">Nome</th>
                    <th class="p-3">Email/Usuário</th>
                    <th class="p-3">Tipo</th>
                    <th class="p-3">Criado em</th>
                    <th class="p-3">Ações</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                <?php foreach ($usuarios as $u): ?>
                    <tr class="hover:bg-gray-50">
                        <td class="p-3">
                            <?php echo $u['id']; ?>
                        </td>
                        <td class="p-3 font-medium">
                            <?php echo htmlspecialchars($u['nome']); ?>
                        </td>
                        <td class="p-3">
                            <?php echo htmlspecialchars($u['usuario']); ?>
                        </td>
                        <td class="p-3">
                            <span
                                class="px-2 py-1 rounded text-xs font-bold <?php echo $u['tipo'] === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'; ?>">
                                <?php echo strtoupper($u['tipo']); ?>
                            </span>
                        </td>
                        <td class="p-3 text-sm text-gray-500">
                            <?php echo date('d/m/Y', strtotime($u['created_at'] ?? 'now')); ?>
                        </td>
                        <td class="p-3 flex gap-2">
                            <!-- Edit (Placeholder) -->
                            <button class="text-blue-500 hover:bg-blue-50 p-2 rounded"><i data-lucide="edit-2"
                                    class="w-4 h-4"></i></button>
                            <!-- Delete -->
                            <?php if ($u['id'] != $_SESSION['id']): ?>
                                <a href="admin.php?page=users&delete_id=<?php echo $u['id']; ?>"
                                    onclick="return confirm('Tem certeza?')" class="text-red-500 hover:bg-red-50 p-2 rounded"><i
                                        data-lucide="trash-2" class="w-4 h-4"></i></a>
                            <?php endif; ?>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>