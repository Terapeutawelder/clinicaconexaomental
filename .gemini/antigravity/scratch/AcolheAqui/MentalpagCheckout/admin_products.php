<?php
// admin_products.php
if (!isset($_SESSION["loggedin"]) || $_SESSION["tipo"] !== 'admin') {
    header("location: login.php");
    exit;
}

// 1. Processar Exclusão
if (isset($_GET['delete_id'])) {
    $del = $pdo->prepare("DELETE FROM produtos WHERE id = ?");
    if ($del->execute([$_GET['delete_id']])) {
        echo "<div class='bg-green-100 text-green-700 p-4 rounded mb-4'>Serviço removido.</div>";
    }
}

// 2. Fetch Serviços
$produtos = $pdo->query("SELECT * FROM produtos ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC);
?>

<div class="bg-white rounded-xl shadow-lg p-6">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Gerenciar Serviços</h2>
        <a href="gerenciar_curso.php"
            class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <i data-lucide="plus"></i> Novo Serviço
        </a>
    </div>

    <?php if (count($produtos) == 0): ?>
        <div class="text-center py-10 text-gray-500">
            <i data-lucide="box" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
            <p>Nenhum serviço cadastrado ainda.</p>
        </div>
    <?php else: ?>
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="text-gray-500 border-b">
                        <th class="p-3">ID</th>
                        <th class="p-3">Nome</th>
                        <th class="p-3">Preço</th>
                        <th class="p-3">Gateway</th>
                        <th class="p-3">Ações</th>
                    </tr>
                </thead>
                <tbody class="divide-y">
                    <?php foreach ($produtos as $p): ?>
                        <tr class="hover:bg-gray-50">
                            <td class="p-3">
                                <?php echo $p['id']; ?>
                            </td>
                            <td class="p-3 font-medium">
                                <?php echo htmlspecialchars($p['nome']); ?>
                            </td>
                            <td class="p-3">R$
                                <?php echo number_format($p['preco'], 2, ',', '.'); ?>
                            </td>
                            <td class="p-3 text-sm text-gray-500">
                                <?php echo htmlspecialchars($p['gateway'] ?? '-'); ?>
                            </td>
                            <td class="p-3 flex gap-2">
                                <a href="gerenciar_curso.php?id=<?php echo $p['id']; ?>"
                                    class="text-blue-500 hover:bg-blue-50 p-2 rounded"><i data-lucide="edit-2"
                                        class="w-4 h-4"></i></a>
                                <a href="admin.php?page=produtos&delete_id=<?php echo $p['id']; ?>"
                                    onclick="return confirm('Apagar este serviço?')"
                                    class="text-red-500 hover:bg-red-50 p-2 rounded"><i data-lucide="trash-2"
                                        class="w-4 h-4"></i></a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    <?php endif; ?>
</div>
