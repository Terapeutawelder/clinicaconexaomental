<?php
// Lógica para processar o formulário de adição/edição de produto
$mensagem = '';
$produto_edit = null;
$upload_dir = 'uploads/'; // Pasta para salvar as imagens e PDFs

// Garante que o diretório de uploads exista
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

// Obter o ID do usuário logado
$usuario_id = $_SESSION['id'] ?? 0;
if ($usuario_id === 0) {
    header("location: login.php");
    exit;
}

// Deletar produto
if (isset($_POST['deletar_produto'])) {
    try {
        $stmt_find = $pdo->prepare("SELECT foto, tipo_entrega, conteudo_entrega FROM produtos WHERE id = ? AND usuario_id = ?");
        $stmt_find->execute([$_POST['id_produto'], $usuario_id]);
        $produto_files = $stmt_find->fetch(PDO::FETCH_ASSOC);

        if ($produto_files) {
            if ($produto_files['foto'] && file_exists($upload_dir . $produto_files['foto'])) {
                unlink($upload_dir . $produto_files['foto']);
            }
            if ($produto_files['tipo_entrega'] === 'email_pdf' && $produto_files['conteudo_entrega'] && file_exists($upload_dir . $produto_files['conteudo_entrega'])) {
                unlink($upload_dir . $produto_files['conteudo_entrega']);
            }

            $stmt = $pdo->prepare("DELETE FROM produtos WHERE id = ? AND usuario_id = ?");
            $stmt->execute([$_POST['id_produto'], $usuario_id]);
            $mensagem = "<div class='animate-fade-in-down bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-sm mb-6' role='alert'><div class='flex'><div class='py-1'><i data-lucide='check-circle' class='w-6 h-6 mr-3 text-green-500'></i></div><div><p class='font-bold'>Sucesso</p><p class='text-sm'>Produto deletado com sucesso!</p></div></div></div>";
        } else {
            $mensagem = "<div class='animate-fade-in-down bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm mb-6' role='alert'><div class='flex'><div class='py-1'><i data-lucide='alert-circle' class='w-6 h-6 mr-3 text-red-500'></i></div><div><p class='font-bold'>Erro</p><p class='text-sm'>Produto não encontrado ou permissão negada.</p></div></div></div>";
        }
    } catch (PDOException $e) {
        $mensagem = "<div class='bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm mb-6' role='alert'>Erro ao deletar: " . $e->getMessage() . "</div>";
    }
}

// Salvar (Adicionar ou Editar) produto
if (isset($_POST['salvar_produto'])) {
    $nome = $_POST['nome'];
    $descricao = $_POST['descricao'];
    $preco = $_POST['preco'];
    $id_produto = $_POST['id_produto'];
    $gateway = $_POST['gateway'] ?? 'mercadopago';
    
    // --- Lógica de Upload de Imagem de Capa ---
    $foto_atual = $_POST['foto_atual'] ?? null;
    $nome_foto = $foto_atual;
    if (isset($_FILES['foto']) && $_FILES['foto']['error'] == 0) {
        $arquivo_tmp = $_FILES['foto']['tmp_name'];
        $nome_original = $_FILES['foto']['name'];
        $extensao = strtolower(pathinfo($nome_original, PATHINFO_EXTENSION));
        $allowed_img_ext = ['jpg', 'jpeg', 'png', 'webp'];
        if(in_array($extensao, $allowed_img_ext)) {
            $nome_foto = uniqid() . '.' . $extensao;
            if (move_uploaded_file($arquivo_tmp, $upload_dir . $nome_foto)) {
                if ($foto_atual && file_exists($upload_dir . $foto_atual)) {
                    unlink($upload_dir . $foto_atual);
                }
            } else {
                $mensagem .= "<div class='bg-red-100 text-red-700 p-3 rounded mb-4'>Erro no upload da imagem.</div>";
                $nome_foto = $foto_atual;
            }
        } else {
             $mensagem .= "<div class='bg-red-100 text-red-700 p-3 rounded mb-4'>Formato de imagem inválido.</div>";
        }
    }

    // --- Lógica de Entrega do Produto ---
    $tipo_entrega = $_POST['tipo_entrega'];
    $conteudo_entrega_atual = $_POST['conteudo_entrega_atual'] ?? null;
    $conteudo_entrega = $conteudo_entrega_atual;

    if ($tipo_entrega === 'link') {
        $conteudo_entrega = $_POST['conteudo_entrega_link'] ?? null;
    } elseif ($tipo_entrega === 'area_membros') {
        $conteudo_entrega = null; 
    } elseif ($tipo_entrega === 'email_pdf') {
        if (isset($_FILES['conteudo_entrega_pdf']) && $_FILES['conteudo_entrega_pdf']['error'] === UPLOAD_ERR_OK) {
            $pdf_file = $_FILES['conteudo_entrega_pdf'];
            $pdf_ext = strtolower(pathinfo($pdf_file['name'], PATHINFO_EXTENSION));

            if ($pdf_ext === 'pdf') {
                if ($conteudo_entrega_atual && file_exists($upload_dir . $conteudo_entrega_atual)) {
                    unlink($upload_dir . $conteudo_entrega_atual);
                }
                $new_pdf_name = 'pdf_' . uniqid() . '.pdf';
                if (move_uploaded_file($pdf_file['tmp_name'], $upload_dir . $new_pdf_name)) {
                    $conteudo_entrega = $new_pdf_name;
                } else {
                    $mensagem .= "<div class='bg-red-100 text-red-700 p-3 rounded mb-4'>Erro no upload do PDF.</div>";
                    $conteudo_entrega = $conteudo_entrega_atual;
                }
            } else {
                $mensagem .= "<div class='bg-red-100 text-red-700 p-3 rounded mb-4'>Apenas PDF é permitido.</div>";
            }
        }
    }

    try {
        if (empty($id_produto)) {
            // Adicionar novo produto
            $checkout_hash = bin2hex(random_bytes(16));
            $stmt = $pdo->prepare("INSERT INTO produtos (nome, descricao, preco, foto, checkout_hash, tipo_entrega, conteudo_entrega, usuario_id, gateway) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$nome, $descricao, $preco, $nome_foto, $checkout_hash, $tipo_entrega, $conteudo_entrega, $usuario_id, $gateway]);
            $mensagem = "<div class='animate-fade-in-down bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-sm mb-6' role='alert'><div class='flex'><div class='py-1'><i data-lucide='check-circle' class='w-6 h-6 mr-3 text-green-500'></i></div><div><p class='font-bold'>Sucesso</p><p class='text-sm'>Produto cadastrado com sucesso!</p></div></div></div>";
        } else {
            // Atualizar produto
            $stmt = $pdo->prepare("UPDATE produtos SET nome = ?, descricao = ?, preco = ?, foto = ?, tipo_entrega = ?, conteudo_entrega = ?, gateway = ? WHERE id = ? AND usuario_id = ?");
            $stmt->execute([$nome, $descricao, $preco, $nome_foto, $tipo_entrega, $conteudo_entrega, $gateway, $id_produto, $usuario_id]);
            if ($stmt->rowCount() > 0) {
                 $mensagem = "<div class='animate-fade-in-down bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-sm mb-6' role='alert'><div class='flex'><div class='py-1'><i data-lucide='check-circle' class='w-6 h-6 mr-3 text-green-500'></i></div><div><p class='font-bold'>Sucesso</p><p class='text-sm'>Produto atualizado com sucesso!</p></div></div></div>";
            } else {
                 $mensagem = "<div class='bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md shadow-sm mb-6' role='alert'>Nenhuma alteração realizada ou produto não encontrado.</div>";
            }
        }
    } catch (PDOException $e) {
        $mensagem = "<div class='bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm mb-6' role='alert'>Erro ao salvar: " . $e->getMessage() . "</div>";
    }
}

// Buscar produto para edição
if (isset($_GET['editar'])) {
    $stmt = $pdo->prepare("SELECT * FROM produtos WHERE id = ? AND usuario_id = ?");
    $stmt->execute([$_GET['editar'], $usuario_id]);
    $produto_edit = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$produto_edit) {
        echo "<script>window.location.href='index.php?pagina=produtos';</script>";
        exit;
    }
}

// Busca todos os produtos
$stmt_produtos_list = $pdo->prepare("SELECT * FROM produtos WHERE usuario_id = ? ORDER BY data_criacao DESC");
$stmt_produtos_list->execute([$usuario_id]);
$produtos = $stmt_produtos_list->fetchAll(PDO::FETCH_ASSOC);
?>

<style>
    /* Custom Animations */
    @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-down { animation: fadeInDown 0.4s ease-out forwards; }
    .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
    
    /* Scrollbar personalizada suave */
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Meus Produtos</h1>
            <p class="text-gray-500 mt-1 text-sm">Gerencie seu catálogo, preços e formas de entrega.</p>
        </div>
        <button id="novo-produto-btn" class="group bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-6 rounded-xl shadow-lg shadow-orange-600/20 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center space-x-2">
            <i data-lucide="plus" class="w-5 h-5 transition-transform group-hover:rotate-90"></i>
            <span>Novo Produto</span>
        </button>
    </div>

    <!-- Area de Mensagens -->
    <?php echo $mensagem; ?>

    <!-- Formulário (Slide Down) -->
    <div id="form-container" class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-10 animate-fade-in-down" style="display: none;">
        <div class="bg-gray-50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 class="text-lg font-bold text-gray-800 flex items-center">
                <i data-lucide="<?php echo $produto_edit ? 'edit-3' : 'package-plus'; ?>" class="w-5 h-5 mr-2 text-orange-600"></i>
                <?php echo $produto_edit ? 'Editar Produto' : 'Cadastrar Novo Produto'; ?>
            </h2>
            <button id="fechar-form-btn" class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>
        
        <form action="index.php?pagina=produtos" method="post" enctype="multipart/form-data" class="p-8">
            <input type="hidden" name="id_produto" value="<?php echo $produto_edit['id'] ?? ''; ?>">
            <input type="hidden" name="foto_atual" value="<?php echo $produto_edit['foto'] ?? ''; ?>">
            <input type="hidden" name="conteudo_entrega_atual" value="<?php echo htmlspecialchars($produto_edit['conteudo_entrega'] ?? ''); ?>">

            <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                <!-- Coluna Esquerda: Informações Básicas -->
                <div class="md:col-span-8 space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label for="nome" class="block text-gray-700 text-sm font-semibold mb-2">Nome do Produto</label>
                            <div class="relative">
                                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <i data-lucide="tag" class="w-4 h-4"></i>
                                </span>
                                <input type="text" id="nome" name="nome" class="pl-10 w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-800 placeholder-gray-400" placeholder="Ex: E-book Premium" value="<?php echo htmlspecialchars($produto_edit['nome'] ?? ''); ?>" required>
                            </div>
                        </div>
                        <div>
                            <label for="preco" class="block text-gray-700 text-sm font-semibold mb-2">Preço (R$)</label>
                            <div class="relative">
                                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-bold">R$</span>
                                <input type="number" step="0.01" id="preco" name="preco" class="pl-10 w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-800" placeholder="0.00" value="<?php echo htmlspecialchars($produto_edit['preco'] ?? ''); ?>" required>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label for="descricao" class="block text-gray-700 text-sm font-semibold mb-2">Descrição</label>
                        <textarea id="descricao" name="descricao" rows="4" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-800 placeholder-gray-400" placeholder="Descreva os benefícios do seu produto..."><?php echo htmlspecialchars($produto_edit['descricao'] ?? ''); ?></textarea>
                    </div>

                    <!-- Configuração de Entrega -->
                    <div class="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 flex items-center">
                            <i data-lucide="truck" class="w-4 h-4 mr-2"></i> Configuração de Entrega
                        </h3>
                        
                        <div class="mb-4">
                            <label for="tipo_entrega" class="block text-gray-700 text-sm font-medium mb-2">Como o cliente receberá o produto?</label>
                            <select id="tipo_entrega" name="tipo_entrega" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer">
                                <option value="link" <?php echo (($produto_edit['tipo_entrega'] ?? 'link') == 'link') ? 'selected' : ''; ?>>🔗 Link Externo (Google Drive, Notion, etc)</option>
                                <option value="email_pdf" <?php echo (($produto_edit['tipo_entrega'] ?? '') == 'email_pdf') ? 'selected' : ''; ?>>📄 Arquivo PDF (Anexo no E-mail)</option>
                                <option value="area_membros" <?php echo (($produto_edit['tipo_entrega'] ?? '') == 'area_membros') ? 'selected' : ''; ?>>🔐 Área de Membros Interna</option>
                            </select>
                        </div>

                        <!-- Campos Dinâmicos de Entrega -->
                        <div id="entrega-fields-container">
                            <div id="entrega-link-container" class="animate-fade-in-down" style="display: none;">
                                <label for="conteudo_entrega_link" class="block text-gray-700 text-sm font-medium mb-2">URL de Acesso</label>
                                <input type="url" id="conteudo_entrega_link" name="conteudo_entrega_link" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" placeholder="https://" value="<?php echo ($produto_edit['tipo_entrega'] ?? '') === 'link' ? htmlspecialchars($produto_edit['conteudo_entrega'] ?? '') : ''; ?>">
                            </div>

                            <div id="entrega-pdf-container" class="animate-fade-in-down" style="display: none;">
                                <label class="block text-gray-700 text-sm font-medium mb-2">Upload do Arquivo PDF</label>
                                <?php if (($produto_edit['tipo_entrega'] ?? '') == 'email_pdf' && !empty($produto_edit['conteudo_entrega'])): ?>
                                    <div class="flex items-center space-x-3 mb-3 p-3 bg-white border border-orange-100 rounded-lg shadow-sm">
                                        <div class="bg-red-100 p-2 rounded-lg"><i data-lucide="file-text" class="w-5 h-5 text-red-600"></i></div>
                                        <div class="flex-1 truncate">
                                            <p class="text-xs text-gray-500">Arquivo Atual:</p>
                                            <p class="text-sm font-medium text-gray-800 truncate"><?php echo htmlspecialchars($produto_edit['conteudo_entrega']); ?></p>
                                        </div>
                                    </div>
                                <?php endif; ?>
                                <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                        <i data-lucide="upload-cloud" class="w-8 h-8 text-gray-400 mb-2"></i>
                                        <p class="text-sm text-gray-500"><span class="font-semibold">Clique para enviar</span> ou arraste</p>
                                        <p class="text-xs text-gray-500">PDF (MAX. 10MB)</p>
                                    </div>
                                    <input type="file" id="conteudo_entrega_pdf" name="conteudo_entrega_pdf" class="hidden" accept="application/pdf">
                                </label>
                                <div id="pdf-file-name" class="mt-2 text-sm text-gray-600 font-medium text-center hidden"></div>
                            </div>

                            <div id="entrega-membros-container" class="animate-fade-in-down" style="display: none;">
                                <div class="flex items-start p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                    <i data-lucide="info" class="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"></i>
                                    <div>
                                        <h4 class="font-bold text-blue-800 text-sm">Integração Automática</h4>
                                        <p class="text-sm text-blue-700 mt-1">O acesso será liberado automaticamente na área "Meus Cursos" do aluno após a confirmação do pagamento.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Coluna Direita: Imagem e Gateway -->
                <div class="md:col-span-4 space-y-6">
                    <!-- Upload de Imagem -->
                    <div>
                        <label class="block text-gray-700 text-sm font-semibold mb-2">Capa do Produto</label>
                        <div class="relative group">
                            <div class="w-full h-64 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 border-dashed flex items-center justify-center relative">
                                <?php if ($produto_edit && !empty($produto_edit['foto'])): ?>
                                    <img src="<?php echo $upload_dir . htmlspecialchars($produto_edit['foto']); ?>" id="preview-img" class="absolute inset-0 w-full h-full object-cover">
                                <?php else: ?>
                                    <img id="preview-img" class="absolute inset-0 w-full h-full object-cover hidden">
                                    <div id="placeholder-img" class="text-center p-4">
                                        <i data-lucide="image" class="w-12 h-12 text-gray-300 mx-auto mb-2"></i>
                                        <p class="text-sm text-gray-400">Nenhuma imagem selecionada</p>
                                    </div>
                                <?php endif; ?>
                                
                                <!-- Overlay para troca -->
                                <label for="foto" class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center cursor-pointer">
                                    <span class="bg-white text-gray-800 px-4 py-2 rounded-full shadow-lg font-medium text-sm transform scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all">
                                        <i data-lucide="camera" class="w-4 h-4 inline mr-1"></i> Alterar Capa
                                    </span>
                                </label>
                            </div>
                            <input type="file" id="foto" name="foto" class="hidden" accept="image/png, image/jpeg, image/webp" onchange="previewImage(this)">
                        </div>
                        <p class="text-xs text-gray-500 mt-2 text-center">Recomendado: 800x800px (JPG/PNG)</p>
                    </div>

                    <!-- Seletor de Gateway -->
                    <div class="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                        <label for="gateway" class="block text-indigo-900 text-sm font-bold mb-3">Processador de Pagamento</label>
                        <div class="space-y-3">
                            <label class="flex items-center p-3 bg-white border border-indigo-100 rounded-lg cursor-pointer transition-all hover:border-indigo-300">
                                <input type="radio" name="gateway" value="mercadopago" class="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" <?php echo (($produto_edit['gateway'] ?? 'mercadopago') == 'mercadopago') ? 'checked' : ''; ?>>
                                <div class="ml-3">
                                    <span class="block text-sm font-medium text-gray-900">Mercado Pago</span>
                                    <span class="block text-xs text-gray-500">Cartão, Pix e Boleto</span>
                                </div>
                            </label>
                            
                            <label class="flex items-center p-3 bg-white border border-indigo-100 rounded-lg cursor-pointer transition-all hover:border-indigo-300">
                                <input type="radio" name="gateway" value="pushinpay" class="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" <?php echo (($produto_edit['gateway'] ?? '') == 'pushinpay') ? 'checked' : ''; ?>>
                                <div class="ml-3">
                                    <span class="block text-sm font-medium text-gray-900">PushinPay</span>
                                    <span class="block text-xs text-gray-500">Exclusivo para PIX</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer do Form -->
            <div class="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-100">
                <button type="button" id="cancelar-btn" class="px-6 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-800 font-medium transition-colors">Cancelar</button>
                <button type="submit" name="salvar_produto" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-8 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center">
                    <i data-lucide="save" class="w-4 h-4 mr-2"></i>
                    <?php echo $produto_edit ? 'Salvar Alterações' : 'Cadastrar Produto'; ?>
                </button>
            </div>
        </form>
    </div>

    <!-- Grid de Produtos -->
    <div class="animate-fade-in-up">
        <?php if (empty($produtos)): ?>
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div class="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
                    <i data-lucide="package-open" class="w-10 h-10 text-gray-300"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">Nenhum produto encontrado</h3>
                <p class="text-gray-500 mb-8 max-w-md mx-auto">Seu catálogo está vazio. Comece adicionando seu primeiro produto digital agora mesmo.</p>
                <button onclick="document.getElementById('novo-produto-btn').click()" class="text-orange-600 font-bold hover:text-orange-700 hover:underline">
                    Criar meu primeiro produto &rarr;
                </button>
            </div>
        <?php else: ?>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <?php foreach ($produtos as $produto): ?>
                    <div class="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden group">
                        
                        <!-- Capa do Card -->
                        <div class="relative h-56 overflow-hidden bg-gray-100">
                            <?php if ($produto['foto']): ?>
                                <img src="<?php echo $upload_dir . htmlspecialchars($produto['foto']); ?>" alt="<?php echo htmlspecialchars($produto['nome']); ?>" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                            <?php else: ?>
                                <div class="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                    <i data-lucide="image" class="w-12 h-12 mb-2"></i>
                                    <span class="text-xs font-medium">Sem imagem</span>
                                </div>
                            <?php endif; ?>
                            
                            <!-- Badges -->
                            <div class="absolute top-3 right-3 flex flex-col items-end gap-2">
                                <?php if (($produto['gateway'] ?? 'mercadopago') == 'pushinpay'): ?>
                                    <span class="bg-blue-900/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-sm uppercase tracking-wide">PushinPay</span>
                                <?php else: ?>
                                    <span class="bg-sky-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-sm uppercase tracking-wide">Mercado Pago</span>
                                <?php endif; ?>
                            </div>

                            <!-- Overlay de Ações (Desktop Hover / Mobile Tap) -->
                            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                <a href="index.php?pagina=produtos&editar=<?php echo $produto['id']; ?>" class="bg-white text-gray-800 p-2.5 rounded-full hover:bg-orange-500 hover:text-white transition-all transform hover:scale-110 shadow-lg" title="Editar">
                                    <i data-lucide="pencil" class="w-5 h-5"></i>
                                </a>
                                <a href="index.php?pagina=checkout_editor&id=<?php echo $produto['id']; ?>" class="bg-white text-gray-800 p-2.5 rounded-full hover:bg-blue-500 hover:text-white transition-all transform hover:scale-110 shadow-lg" title="Editar Checkout">
                                    <i data-lucide="palette" class="w-5 h-5"></i>
                                </a>
                                <button onclick="copiarLink('<?php echo 'https://' . $_SERVER['HTTP_HOST'] . rtrim(dirname($_SERVER['PHP_SELF']), '/\\') . '/checkout.php?p=' . $produto['checkout_hash']; ?>', this)" class="bg-white text-gray-800 p-2.5 rounded-full hover:bg-green-500 hover:text-white transition-all transform hover:scale-110 shadow-lg" title="Copiar Link">
                                    <i data-lucide="link" class="w-5 h-5"></i>
                                </button>
                                <form action="index.php?pagina=produtos" method="post" onsubmit="return confirm('ATENÇÃO: Deletar este produto é irreversível. Continuar?');" class="inline">
                                    <input type="hidden" name="id_produto" value="<?php echo $produto['id']; ?>">
                                    <button type="submit" name="deletar_produto" class="bg-white text-red-600 p-2.5 rounded-full hover:bg-red-600 hover:text-white transition-all transform hover:scale-110 shadow-lg" title="Excluir">
                                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                                    </button>
                                </form>
                            </div>
                        </div>

                        <!-- Info do Card -->
                        <div class="p-5 flex-grow flex flex-col">
                            <h3 class="font-bold text-gray-900 text-lg leading-snug mb-2 line-clamp-2 min-h-[3.5rem]" title="<?php echo htmlspecialchars($produto['nome']); ?>">
                                <?php echo htmlspecialchars($produto['nome']); ?>
                            </h3>
                            
                            <div class="mt-auto flex items-end justify-between border-t border-gray-100 pt-4">
                                <div>
                                    <p class="text-xs text-gray-500 uppercase font-semibold">Preço</p>
                                    <p class="text-orange-600 font-bold text-xl">R$ <?php echo number_format($produto['preco'], 2, ',', '.'); ?></p>
                                </div>
                                <div class="text-gray-400" title="Tipo de Entrega">
                                    <?php if($produto['tipo_entrega'] == 'link'): ?>
                                        <i data-lucide="link" class="w-5 h-5"></i>
                                    <?php elseif($produto['tipo_entrega'] == 'email_pdf'): ?>
                                        <i data-lucide="file-text" class="w-5 h-5"></i>
                                    <?php else: ?>
                                        <i data-lucide="lock" class="w-5 h-5"></i>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
</div>

<script>
    // Inicializa ícones Lucide
    lucide.createIcons();

    // Preview de Imagem
    function previewImage(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('preview-img');
                const placeholder = document.getElementById('placeholder-img');
                preview.src = e.target.result;
                preview.classList.remove('hidden');
                placeholder.classList.add('hidden');
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    // Input file PDF feedback
    document.getElementById('conteudo_entrega_pdf').addEventListener('change', function(e) {
        const fileName = e.target.files[0] ? e.target.files[0].name : '';
        const display = document.getElementById('pdf-file-name');
        if (fileName) {
            display.textContent = 'Arquivo selecionado: ' + fileName;
            display.classList.remove('hidden');
        } else {
            display.classList.add('hidden');
        }
    });

    // Função Copiar Link com Feedback Visual Melhorado
    function copiarLink(link, btn) {
        navigator.clipboard.writeText(link).then(() => {
            const icon = btn.querySelector('svg'); // Pega o SVG gerado pelo Lucide
            const originalIconHtml = btn.innerHTML; // Salva o HTML original (pode ser o SVG)
            
            // Troca o ícone/classe
            btn.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i>'; // Adiciona o check
            btn.classList.add('bg-green-500', 'text-white');
            btn.classList.remove('bg-white', 'text-gray-800');
            
            lucide.createIcons(); // Renderiza o check

            setTimeout(() => {
                btn.innerHTML = originalIconHtml; // Restaura o original (seja SVG ou <i>)
                
                // Se o original era <i>, precisa renderizar novamente
                if (originalIconHtml.includes('data-lucide')) {
                    lucide.createIcons();
                }

                btn.classList.remove('bg-green-500', 'text-white');
                btn.classList.add('bg-white', 'text-gray-800');
            }, 2000);
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        const formContainer = document.getElementById('form-container');
        const novoProdutoBtn = document.getElementById('novo-produto-btn');
        const cancelarBtn = document.getElementById('cancelar-btn');
        const fecharFormBtn = document.getElementById('fechar-form-btn');

        function toggleForm(show) {
            if (show) {
                formContainer.style.display = 'block';
                // Scroll suave até o formulário
                formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                novoProdutoBtn.classList.add('opacity-50', 'cursor-not-allowed');
                novoProdutoBtn.disabled = true;
            } else {
                formContainer.style.display = 'none';
                novoProdutoBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                novoProdutoBtn.disabled = false;
                
                // Limpa parâmetro URL
                const url = new URL(window.location);
                url.searchParams.delete('editar');
                window.history.replaceState({}, document.title, url);
            }
        }

        novoProdutoBtn.addEventListener('click', () => toggleForm(true));
        fecharFormBtn.addEventListener('click', () => toggleForm(false));
        cancelarBtn.addEventListener('click', () => {
            // Se estiver editando, volta para o padrão (pode recarregar ou só fechar)
            window.location.href = 'index.php?pagina=produtos';
        });

        const urlParams = new URLSearchParams(window.location.search);
        // Abre o form se estiver editando ou se tiver erro/sucesso na tela
        if (urlParams.has('editar') || document.querySelector('[role="alert"]')) { 
            toggleForm(true);
        } else {
            toggleForm(false);
        }

        // Lógica de Entrega (Tabs)
        const tipoEntregaSelect = document.getElementById('tipo_entrega');
        const linkContainer = document.getElementById('entrega-link-container');
        const pdfContainer = document.getElementById('entrega-pdf-container');
        const membrosContainer = document.getElementById('entrega-membros-container');
        
        const linkInput = document.getElementById('conteudo_entrega_link');
        const pdfInput = document.getElementById('conteudo_entrega_pdf');

        function toggleEntregaFields() {
            const selectedValue = tipoEntregaSelect.value;

            // Hide all
            linkContainer.style.display = 'none';
            pdfContainer.style.display = 'none';
            membrosContainer.style.display = 'none';
            
            // Reset required
            linkInput.required = false;
            // PDF input required logic is handled in PHP validation largely, but frontend helps
            // We don't force 'required' on file input if updating, logic stays custom.

            if (selectedValue === 'link') {
                linkContainer.style.display = 'block';
                linkInput.required = true;
            } else if (selectedValue === 'email_pdf') {
                pdfContainer.style.display = 'block';
            } else if (selectedValue === 'area_membros') {
                membrosContainer.style.display = 'block';
            }
        }

        tipoEntregaSelect.addEventListener('change', toggleEntregaFields);
        toggleEntregaFields(); // Init
    });
</script>