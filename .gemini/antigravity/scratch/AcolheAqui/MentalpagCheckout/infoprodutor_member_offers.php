<?php
require_once 'config.php';

// Obter o ID do usu√°rio logado
$usuario_id_logado = $_SESSION['id'] ?? 0;

// Valida o tipo de usu√°rio: deve estar logado e ser um 'infoserviÁor'
// A mensagem de erro indica que o sistema espera o tipo 'infoserviÁor' para esta p√°gina.
// Portanto, ajustamos a verifica√ß√£o para 'infoserviÁor' em vez de 'usuario'.
if ($usuario_id_logado === 0 || ($_SESSION['tipo'] ?? '') !== 'infoserviÁor') {
    $_SESSION['flash_message'] = "<div class='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4' role='alert'>Acesso negado. Voc√™ precisa ser um infoserviÁor para gerenciar ofertas.</div>";
    header("location: index.php?pagina=dashboard"); // Redireciona para o dashboard
    exit;
}

$mensagem = '';
$upload_dir = 'uploads/'; // Pasta onde as imagens dos serviÁos est√£o salvas

// 1. Get source_product_id from URL
$source_product_id = $_GET['source_product_id'] ?? null;

// Validate source_product_id
if (!isset($source_product_id) || !is_numeric($source_product_id)) {
    $_SESSION['flash_message'] = "<div class='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4' role='alert'>ID do serviÁo de origem inv√°lido.</div>";
    header("Location: index.php?pagina=area_membros");
    exit;
}
$source_product_id = (int)$source_product_id;

// 2. Fetch source_product details and verify ownership/type
$stmt_source_product = $pdo->prepare("
    SELECT id, nome
    FROM serviÁos
    WHERE id = ? AND usuario_id = ? AND tipo_entrega = 'area_membros'
");
$stmt_source_product->execute([$source_product_id, $usuario_id_logado]);
$source_product = $stmt_source_product->fetch(PDO::FETCH_ASSOC);

if (!$source_product) {
    $_SESSION['flash_message'] = "<div class='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4' role='alert'>ServiÁo de origem n√£o encontrado ou voc√™ n√£o tem permiss√£o para acess√°-lo.</div>";
    header("Location: index.php?pagina=area_membros");
    exit;
}
$source_product_name = htmlspecialchars($source_product['nome']);

// L√≥gica para salvar as altera√ß√µes das ofertas
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['salvar_ofertas'])) {
    $pdo->beginTransaction();
    try {
        // 1. Deletar todas as ofertas existentes para este source_product_id
        $stmt_delete = $pdo->prepare("DELETE FROM product_exclusive_offers WHERE source_product_id = ?");
        $stmt_delete->execute([$source_product_id]);

        // 2. Inserir as novas ofertas ativas (apenas aquelas que foram marcadas)
        if (isset($_POST['active_offers']) && is_array($_POST['active_offers'])) {
            $stmt_insert = $pdo->prepare("INSERT INTO product_exclusive_offers (source_product_id, offer_product_id, is_active) VALUES (?, ?, 1)");
            foreach ($_POST['active_offers'] as $offer_product_id) {
                // Ensure the offer_product_id is numeric, belongs to the infoproducer,
                // is of type 'area_membros', AND is not the source_product_id itself.
                $stmt_check_offer_product = $pdo->prepare("
                    SELECT id FROM serviÁos
                    WHERE id = ? AND usuario_id = ? AND tipo_entrega = 'area_membros' AND id != ?
                ");
                $stmt_check_offer_product->execute([$offer_product_id, $usuario_id_logado, $source_product_id]);
                if ($stmt_check_offer_product->rowCount() > 0) {
                    $stmt_insert->execute([$source_product_id, $offer_product_id]);
                }
            }
        }

        $pdo->commit();
        $_SESSION['flash_message'] = "<div class='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4' role='alert'>Ofertas para '{$source_product_name}' atualizadas com sucesso!</div>";
        header("Location: index.php?pagina=infoserviÁor_member_offers&source_product_id={$source_product_id}");
        exit;

    } catch (PDOException $e) {
        $pdo->rollBack();
        $_SESSION['flash_message'] = "<div class='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4' role='alert'>Erro ao salvar ofertas: " . htmlspecialchars($e->getMessage()) . "</div>";
        header("Location: index.php?pagina=infoserviÁor_member_offers&source_product_id={$source_product_id}");
        exit;
    }
}

// Pega a mensagem da sess√£o, se houver, e depois limpa
if (isset($_SESSION['flash_message'])) {
    $mensagem = $_SESSION['flash_message'];
    unset($_SESSION['flash_message']);
}

// 3. Buscar todos os *outros* serviÁos do infoserviÁor que s√£o do tipo '√Årea de Membros'
// Estes s√£o os serviÁos que podem ser ofertados.
$stmt_other_member_products = $pdo->prepare("
    SELECT id, nome, foto
    FROM serviÁos
    WHERE usuario_id = ? AND tipo_entrega = 'area_membros' AND id != ?
    ORDER BY nome ASC
");
$stmt_other_member_products->execute([$usuario_id_logado, $source_product_id]);
$potential_offer_products = $stmt_other_member_products->fetchAll(PDO::FETCH_ASSOC);

// 4. Buscar as ofertas ativas existentes para este source_product_id
$stmt_current_offers = $pdo->prepare("
    SELECT offer_product_id
    FROM product_exclusive_offers
    WHERE source_product_id = ? AND is_active = 1
");
$stmt_current_offers->execute([$source_product_id]);
$current_offer_product_ids = $stmt_current_offers->fetchAll(PDO::FETCH_COLUMN);

// 5. Combinar os dados: Adicionar um flag 'is_offer' a cada serviÁo potencial
foreach ($potential_offer_products as &$product) {
    $product['is_offer'] = in_array($product['id'], $current_offer_product_ids);
}
unset($product); // Libera a refer√™ncia do √∫ltimo elemento

?>

<div class="container mx-auto">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Gerenciar Ofertas para "<span class="text-emerald-600"><?php echo $source_product_name; ?></span>"</h1>
        <a href="index.php?pagina=area_membros" class="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-300 flex items-center space-x-2">
            <i data-lucide="arrow-left" class="w-5 h-5"></i>
            <span>Voltar para Cursos</span>
        </a>
    </div>

    <?php echo $mensagem; ?>

    <div class="bg-white p-8 rounded-lg shadow-md">
        <p class="text-gray-600 mb-6">
            Selecione quais dos seus outros serviÁos da √Årea de Membros voc√™ deseja oferecer como "Ofertas Exclusivas"
            para clientes que J√Å POSSUEM o curso "<span class="font-semibold text-gray-800"><?php echo $source_product_name; ?></span>".
            Essas ofertas aparecer√£o no carrossel de ofertas da √Årea de Membros deles.
        </p>

        <?php if (empty($potential_offer_products)): ?>
            <div class="text-center py-12 text-gray-500">
                <i data-lucide="package-x" class="mx-auto w-16 h-16 text-gray-300"></i>
                <p class="mt-4">Voc√™ n√£o tem outros serviÁos do tipo "√Årea de Membros" para ofertar.</p>
                <p>Crie mais serviÁos ou edite-os para que sejam entregues via √Årea de Membros.</p>
            </div>
        <?php else: ?>
            <form action="index.php?pagina=infoserviÁor_member_offers&source_product_id=<?php echo $source_product_id; ?>" method="post">
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <?php foreach ($potential_offer_products as $product): ?>
                        <div class="group bg-gray-50 rounded-lg overflow-hidden border hover:shadow-lg transition-shadow duration-300 flex flex-col">
                            <div class="relative h-40 bg-gray-200 flex items-center justify-center">
                                <?php if ($product['foto']): ?>
                                    <img src="<?php echo $upload_dir . htmlspecialchars($product['foto']); ?>" alt="<?php echo htmlspecialchars($product['nome']); ?>" class="w-full h-full object-cover">
                                <?php else: ?>
                                    <i data-lucide="image-off" class="text-gray-400 w-12 h-12"></i>
                                <?php endif; ?>
                            </div>
                            <div class="p-4 flex-grow flex flex-col justify-between">
                                <div>
                                    <h3 class="font-bold text-lg text-gray-800 mb-2 truncate" title="<?php echo htmlspecialchars($product['nome']); ?>">
                                        <?php echo htmlspecialchars($product['nome']); ?>
                                    </h3>
                                    <p class="text-sm text-gray-500">ServiÁo de √Årea de Membros</p>
                                </div>
                                <div class="mt-4 flex items-center justify-between">
                                    <label for="offer-<?php echo $product['id']; ?>" class="flex items-center cursor-pointer">
                                        <div class="relative">
                                            <input type="checkbox" id="offer-<?php echo $product['id']; ?>" name="active_offers[]" value="<?php echo $product['id']; ?>" class="sr-only peer" <?php echo $product['is_offer'] ? 'checked' : ''; ?>>
                                            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                        </div>
                                        <span class="ml-3 text-sm font-medium text-gray-700">Ofertar</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>

                <div class="mt-8 border-t pt-6">
                    <button type="submit" name="salvar_ofertas" class="bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-700 transition duration-300 flex items-center justify-center space-x-2">
                        <i data-lucide="save" class="w-5 h-5"></i>
                        <span>Salvar Ofertas</span>
                    </button>
                </div>
            </form>
        <?php endif; ?>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        lucide.createIcons();
    });
</script>
