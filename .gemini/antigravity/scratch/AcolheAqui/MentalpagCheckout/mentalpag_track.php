<?php
// Este arquivo é incluído a partir do index.php,
// então a verificação de login e a conexão com o banco ($pdo) já existem.

// Obter o ID do usuário logado
$usuario_id_logado = $_SESSION['id'] ?? 0;

// Se por algum motivo o ID do usuário não estiver definido, redireciona para o login
if ($usuario_id_logado === 0) {
    header("location: login.php");
    exit;
}

$mensagem = '';

// Pega a mensagem da sessão, se houver, e depois limpa
if (isset($_SESSION['flash_message'])) {
    $mensagem = $_SESSION['flash_message'];
    unset($_SESSION['flash_message']);
}

// Busca todos os servi�os do infoservi�or para o dropdown
try {
    $stmt_products = $pdo->prepare("SELECT id, nome FROM servi�os WHERE usuario_id = :usuario_id ORDER BY nome ASC");
    $stmt_products->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
    $stmt_products->execute();
    $infoservi�or_products = $stmt_products->fetchAll(PDO::FETCH_ASSOC);

    // Busca servi�os já rastreados pelo infoservi�or
    $stmt_tracked_products = $pdo->prepare("SELECT stp.id, stp.servi�o_id, stp.tracking_id, p.nome FROM mentalpag_tracking_products stp JOIN servi�os p ON stp.servi�o_id = p.id WHERE stp.usuario_id = :usuario_id ORDER BY p.nome ASC");
    $stmt_tracked_products->bindParam(':usuario_id', $usuario_id_logado, PDO::PARAM_INT);
    $stmt_tracked_products->execute();
    $tracked_products = $stmt_tracked_products->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    $mensagem = "<div class='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4' role='alert'>Erro ao buscar servi�os: " . htmlspecialchars($e->getMessage()) . "</div>";
    $infoservi�or_products = [];
    $tracked_products = [];
}
?>

<div class="container mx-auto">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Mentalpag Track</h1>
    <p class="text-gray-600 mb-8">Monitore o desempenho do seu funil de vendas em tempo real. Veja quantas pessoas visitam sua página, chegam ao checkout e compram seus servi�os.</p>

    <?php echo $mensagem; ?>

    <!-- Configuração de Rastreamento -->
    <div class="bg-white p-8 rounded-lg shadow-md mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">Configurar Rastreamento de Servi�o</h2>
        <div class="space-y-6">
            <div>
                <label for="product_select" class="block text-gray-700 text-sm font-semibold mb-2">Selecione um Servi�o para Rastrear</label>
                <div class="flex flex-col sm:flex-row items-stretch sm:space-x-4 space-y-4 sm:space-y-0">
                    <select id="product_select" class="w-full sm:w-2/3 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="">-- Selecione um servi�o --</option>
                        <?php foreach ($infoservi�or_products as $product): ?>
                            <option value="<?php echo $product['id']; ?>"><?php echo htmlspecialchars($product['nome']); ?></option>
                        <?php endforeach; ?>
                    </select>
                    <button id="add_track_product_btn" class="w-full sm:w-1/3 bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-700 transition duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <i data-lucide="plus-circle" class="w-5 h-5"></i>
                        <span>Ativar Rastreamento</span>
                    </button>
                </div>
                <div id="product_select_error" class="text-red-500 text-sm mt-2 hidden">Por favor, selecione um servi�o.</div>
            </div>

            <!-- Servi�os já rastreados -->
            <div class="mt-8 border-t pt-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">Servi�os Ativamente Rastreando</h3>
                <div id="tracked_products_list" class="space-y-4">
                    <?php if (empty($tracked_products)): ?>
                        <div class="text-center py-4 text-gray-500">
                            <i data-lucide="line-chart" class="mx-auto w-12 h-12 text-gray-300 mb-2"></i>
                            <p>Nenhum servi�o está sendo rastreado ainda.</p>
                            <p class="text-sm">Selecione um servi�o acima para começar.</p>
                        </div>
                    <?php else: ?>
                        <?php foreach ($tracked_products as $tp): ?>
                            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div class="flex-1 mb-2 sm:mb-0">
                                    <p class="font-semibold text-gray-800"><?php echo htmlspecialchars($tp['nome']); ?></p>
                                    <p class="text-sm text-gray-500">ID de Rastreamento: <span class="font-mono text-gray-700"><?php echo htmlspecialchars($tp['tracking_id']); ?></span></p>
                                </div>
                                <div class="flex space-x-2 mt-2 sm:mt-0">
                                    <button class="generate-script-btn bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg hover:bg-blue-200 transition text-sm flex items-center space-x-1" data-tracking-id="<?php echo htmlspecialchars($tp['tracking_id']); ?>" data-product-name="<?php echo htmlspecialchars($tp['nome']); ?>">
                                        <i data-lucide="code" class="w-4 h-4"></i>
                                        <span>Gerar Script</span>
                                    </button>
                                    <button class="view-data-btn bg-purple-100 text-purple-700 font-semibold py-2 px-4 rounded-lg hover:bg-purple-200 transition text-sm flex items-center space-x-1" data-tracking-product-db-id="<?php echo htmlspecialchars($tp['id']); ?>" data-product-name="<?php echo htmlspecialchars($tp['nome']); ?>">
                                        <i data-lucide="bar-chart" class="w-4 h-4"></i>
                                        <span>Ver Dados</span>
                                    </button>
                                    <button class="delete-funnel-btn bg-red-100 text-red-700 font-semibold py-2 px-4 rounded-lg hover:bg-red-200 transition text-sm flex items-center space-x-1" data-tracking-product-db-id="<?php echo htmlspecialchars($tp['id']); ?>" data-product-name="<?php echo htmlspecialchars($tp['nome']); ?>">
                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                        <span>Excluir</span>
                                    </button>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <!-- Seção de Dados de Rastreamento (Escondida por padrão) -->
    <div id="tracking_data_section" class="bg-white p-8 rounded-lg shadow-md" style="display: none;">
        <div class="flex items-center justify-between mb-6 border-b pb-4">
            <div>
                <h2 class="text-2xl font-semibold text-gray-800">Análise de Funil para <span id="analyzed_product_name" class="text-emerald-600"></span></h2>
                <p class="text-gray-500 text-sm mt-1">Dados atualizados em tempo real.</p>
            </div>
            <div class="flex space-x-2">
                <button id="close_analysis_btn" class="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-300 flex items-center space-x-2">
                    <i data-lucide="x-circle" class="w-5 h-5"></i>
                    <span>Fechar Análise</span>
                </button>
            </div>
        </div>

        <!-- Filtros de Período -->
        <div class="flex flex-wrap items-center justify-start gap-3 mb-6 bg-gray-100 p-2 rounded-lg">
            <span class="text-sm font-semibold text-gray-700 mr-2">Filtrar por:</span>
            <button data-period="today" class="period-filter-btn px-3 py-1 text-sm font-semibold rounded-md bg-emerald-500 text-white shadow">Hoje</button>
            <button data-period="yesterday" class="period-filter-btn px-3 py-1 text-sm font-semibold rounded-md text-gray-600 hover:bg-gray-200">Ontem</button>
            <button data-period="7days" class="period-filter-btn px-3 py-1 text-sm font-semibold rounded-md text-gray-600 hover:bg-gray-200">7 dias</button>
            <button data-period="month" class="period-filter-btn px-3 py-1 text-sm font-semibold rounded-md text-gray-600 hover:bg-gray-200">Mês</button>
            <button data-period="year" class="period-filter-btn px-3 py-1 text-sm font-semibold rounded-md text-gray-600 hover:bg-gray-200">Ano</button>
            <button data-period="all" class="period-filter-btn px-3 py-1 text-sm font-semibold rounded-md text-gray-600 hover:bg-gray-200">Todo o Período</button>
        </div>
        
        <!-- Funil de Conversão (Gráfico) -->
        <div class="flex flex-col lg:flex-row gap-8 mb-8">
            <div class="lg:w-1/2 w-full bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2"><i data-lucide="funnel" class="w-6 h-6 text-blue-600"></i><span>Funil de Vendas</span></h3>
                <div class="h-80 relative">
                    <canvas id="funnelChart"></canvas>
                </div>
            </div>
            <div class="lg:w-1/2 w-full space-y-4">
                <!-- KPIs do Funil -->
                <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-sm">
                    <p class="text-gray-600 text-sm">Visitas à Página</p>
                    <p id="kpi_page_views" class="text-3xl font-bold text-blue-800">0</p>
                </div>
                <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg shadow-sm">
                    <p class="text-gray-600 text-sm">Visitas ao Checkout</p>
                    <p id="kpi_initiate_checkouts" class="text-3xl font-bold text-yellow-800">0</p>
                    <p id="conversion_page_to_checkout" class="text-sm text-gray-600 mt-1">0% de conversão (Página > Checkout)</p>
                </div>
                <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm">
                    <p class="text-gray-600 text-sm">Compras Aprovadas</p>
                    <p id="kpi_purchases" class="text-3xl font-bold text-green-800">0</p>
                    <p id="conversion_checkout_to_purchase" class="text-sm text-gray-600 mt-1">0% de conversão (Checkout > Compra)</p>
                </div>
                 <div class="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-lg shadow-sm">
                    <p class="text-gray-600 text-sm">Taxa de Conversão Geral</p>
                    <p id="conversion_overall" class="text-3xl font-bold text-emerald-800">0%</p>
                </div>
            </div>
        </div>

        <!-- Métricas de Desempenho Adicionais -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 class="text-gray-500 text-sm font-medium">Cliques na Página p/ 1 Venda</h3>
                <p id="kpi_clicks_to_sale_page" class="text-2xl font-bold text-gray-800">0</p>
            </div>
            <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 class="text-gray-500 text-sm font-medium">Cliques no Checkout p/ 1 Venda</h3>
                <p id="kpi_clicks_to_sale_checkout" class="text-2xl font-bold text-gray-800">0</p>
            </div>
            <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 class="text-gray-500 text-sm font-medium">Vendas do Servi�o Principal</h3>
                <p id="kpi_main_product_sales_count" class="text-2xl font-bold text-gray-800">0</p>
                <p id="kpi_main_product_sales_value" class="text-sm text-gray-600 mt-1">Valor Total: R$ 0,00</p>
            </div>
        </div>

        <!-- Vendas de Order Bumps -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Vendas de Order Bumps</h3>
            <div id="order_bump_sales_list" class="space-y-3">
                 <p class="text-gray-500">Nenhuma venda de order bump neste período.</p>
            </div>
        </div>
    </div>
</div>

<!-- Modal para exibir o script de rastreamento -->
<div id="script_modal" class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all opacity-0 scale-95" id="script_modal_content">
        <div class="p-6 border-b flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-800">Script de Rastreamento para <span id="script_product_name" class="text-emerald-600"></span></h2>
            <button class="close-modal-btn text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition">
                <i data-lucide="x" class="w-6 h-6"></i>
            </button>
        </div>
        <div class="p-6 space-y-4">
            <p class="text-gray-700">Copie o script abaixo e cole-o na seção <code>&lt;head&gt;</code> do seu site de vendas, antes da tag <code>&lt;/head&gt;</code>.</p>
            <div class="relative">
                <textarea id="tracking_script_textarea" readonly rows="10" class="w-full p-4 bg-gray-900 text-green-300 text-sm font-mono rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" wrap="off"></textarea>
                <button id="copy_script_btn" class="absolute top-4 right-4 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center space-x-2">
                    <i data-lucide="copy" class="w-5 h-5"></i>
                    <span>Copiar Script</span>
                </button>
            </div>
            <p class="text-sm text-gray-500">Este script irá rastrear visitas à página e cliques em botões de checkout para o servi�o selecionado.</p>
        </div>
    </div>
</div>


<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();

    const productSelect = document.getElementById('product_select');
    const addTrackProductBtn = document.getElementById('add_track_product_btn');
    const productSelectError = document.getElementById('product_select_error');
    const trackedProductsList = document.getElementById('tracked_products_list');

    const trackingDataSection = document.getElementById('tracking_data_section');
    const analyzedProductName = document.getElementById('analyzed_product_name');
    const periodFilterButtons = document.querySelectorAll('.period-filter-btn');
    const closeAnalysisBtn = document.getElementById('close_analysis_btn');

    const kpiPageViews = document.getElementById('kpi_page_views');
    const kpiInitiateCheckouts = document.getElementById('kpi_initiate_checkouts');
    const kpiPurchases = document.getElementById('kpi_purchases');
    const conversionPageToCheckout = document.getElementById('conversion_page_to_checkout');
    const conversionCheckoutToPurchase = document.getElementById('conversion_checkout_to_purchase');
    const conversionOverall = document.getElementById('conversion_overall');
    const kpiClicksToSalePage = document.getElementById('kpi_clicks_to_sale_page');
    const kpiClicksToSaleCheckout = document.getElementById('kpi_clicks_to_sale_checkout');
    const kpiMainProductSalesCount = document.getElementById('kpi_main_product_sales_count');
    const kpiMainProductSalesValue = document.getElementById('kpi_main_product_sales_value');
    const orderBumpSalesList = document.getElementById('order_bump_sales_list');

    const scriptModal = document.getElementById('script_modal');
    const scriptProductName = document.getElementById('script_product_name');
    const trackingScriptTextarea = document.getElementById('tracking_script_textarea');
    const copyScriptBtn = document.getElementById('copy_script_btn');
    const closeModalBtns = document.querySelectorAll('.close-modal-btn');

    let currentTrackingProductDbId = null; // ID da tabela mentalpag_tracking_products
    let currentPeriodFilter = 'all';
    let funnelChartInstance = null;

    // --- Funções Auxiliares ---
    function showModal(modalElement) {
        modalElement.classList.remove('hidden');
        setTimeout(() => {
            const content = modalElement.querySelector('.transform');
            if (content) {
                content.classList.remove('opacity-0', 'scale-95');
            }
        }, 10);
    }

    function hideModal(modalElement) {
        const content = modalElement.querySelector('.transform');
        if (content) {
            content.classList.add('opacity-0', 'scale-95');
        }
        setTimeout(() => {
            modalElement.classList.add('hidden');
        }, 200);
    }

    function formatCurrency(value) {
        return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // --- Lógica de Adição de Servi�o para Rastreamento ---
    productSelect.addEventListener('change', function() {
        if (this.value) {
            addTrackProductBtn.disabled = false;
            productSelectError.classList.add('hidden');
        } else {
            addTrackProductBtn.disabled = true;
        }
    });

    addTrackProductBtn.addEventListener('click', async function() {
        const productId = productSelect.value;
        if (!productId) {
            productSelectError.classList.remove('hidden');
            return;
        }

        try {
            const response = await fetch('api.php?action=add_mentalpag_tracked_product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ servi�o_id: productId })
            });
            const result = await response.json();

            if (result.success) {
                alert(result.message);
                await refreshTrackedProductsList(); // Atualiza a lista de servi�os rastreados
                productSelect.value = ''; // Limpa o seletor
                addTrackProductBtn.disabled = true;
            } else {
                alert('Erro: ' + (result.error || 'Não foi possível ativar o rastreamento.'));
            }
        } catch (error) {
            console.error('Erro ao adicionar servi�o para rastreamento:', error);
            alert('Erro de comunicação com o servidor.');
        }
    });

    async function refreshTrackedProductsList() {
        try {
            const response = await fetch('api.php?action=get_mentalpag_tracked_products');
            const result = await response.json();

            if (result.success) {
                trackedProductsList.innerHTML = ''; // Limpa a lista existente
                if (result.products.length === 0) {
                    trackedProductsList.innerHTML = `
                        <div class="text-center py-4 text-gray-500">
                            <i data-lucide="line-chart" class="mx-auto w-12 h-12 text-gray-300 mb-2"></i>
                            <p>Nenhum servi�o está sendo rastreado ainda.</p>
                            <p class="text-sm">Selecione um servi�o acima para começar.</p>
                        </div>
                    `;
                } else {
                    result.products.forEach(tp => {
                        const div = document.createElement('div');
                        div.className = 'flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200';
                        div.innerHTML = `
                            <div class="flex-1 mb-2 sm:mb-0">
                                <p class="font-semibold text-gray-800">${htmlspecialchars(tp.nome)}</p>
                                <p class="text-sm text-gray-500">ID de Rastreamento: <span class="font-mono text-gray-700">${htmlspecialchars(tp.tracking_id)}</span></p>
                            </div>
                            <div class="flex space-x-2 mt-2 sm:mt-0">
                                <button class="generate-script-btn bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg hover:bg-blue-200 transition text-sm flex items-center space-x-1" data-tracking-id="${htmlspecialchars(tp.tracking_id)}" data-product-name="${htmlspecialchars(tp.nome)}">
                                    <i data-lucide="code" class="w-4 h-4"></i>
                                    <span>Gerar Script</span>
                                </button>
                                <button class="view-data-btn bg-purple-100 text-purple-700 font-semibold py-2 px-4 rounded-lg hover:bg-purple-200 transition text-sm flex items-center space-x-1" data-tracking-product-db-id="${htmlspecialchars(tp.id)}" data-product-name="${htmlspecialchars(tp.nome)}">
                                    <i data-lucide="bar-chart" class="w-4 h-4"></i>
                                    <span>Ver Dados</span>
                                </button>
                                <button class="delete-funnel-btn bg-red-100 text-red-700 font-semibold py-2 px-4 rounded-lg hover:bg-red-200 transition text-sm flex items-center space-x-1" data-tracking-product-db-id="${htmlspecialchars(tp.id)}" data-product-name="${htmlspecialchars(tp.nome)}">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                    <span>Excluir</span>
                                </button>
                            </div>
                        `;
                        trackedProductsList.appendChild(div);
                    });
                }
                lucide.createIcons(); // Re-render icons after adding new elements
            } else {
                alert('Erro ao carregar lista de servi�os rastreados: ' + (result.error || 'Erro desconhecido.'));
            }
        } catch (error) {
            console.error('Erro ao recarregar servi�os rastreados:', error);
            alert('Erro de comunicação ao recarregar a lista de servi�os rastreados.');
        }
    }


    // --- Lógica do Modal de Script ---
    trackedProductsList.addEventListener('click', async function(e) {
        const generateBtn = e.target.closest('.generate-script-btn');
        if (generateBtn) {
            const trackingId = generateBtn.dataset.trackingId;
            const productName = generateBtn.dataset.productName;

            try {
                const response = await fetch(`api.php?action=generate_tracking_script&tracking_id=${trackingId}`);
                const result = await response.json();

                if (result.success) {
                    scriptProductName.textContent = productName;
                    trackingScriptTextarea.value = result.script;
                    showModal(scriptModal);
                } else {
                    alert('Erro ao gerar script: ' + (result.error || 'Erro desconhecido.'));
                }
            } catch (error) {
                console.error('Erro ao gerar script de rastreamento:', error);
                alert('Erro de comunicação com o servidor ao gerar o script.');
            }
        }
    });

    copyScriptBtn.addEventListener('click', function() {
        trackingScriptTextarea.select();
        document.execCommand('copy');
        const originalText = this.innerHTML;
        this.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i><span>Copiado!</span>';
        lucide.createIcons();
        setTimeout(() => {
            this.innerHTML = originalText;
            lucide.createIcons();
        }, 2000);
    });

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => hideModal(scriptModal));
    });

    scriptModal.addEventListener('click', (e) => {
        if (e.target === scriptModal) hideModal(scriptModal);
    });

    // --- Lógica da Seção de Dados de Rastreamento ---
    trackedProductsList.addEventListener('click', async function(e) {
        const viewDataBtn = e.target.closest('.view-data-btn');
        if (viewDataBtn) {
            currentTrackingProductDbId = viewDataBtn.dataset.trackingProductDbId;
            const productName = viewDataBtn.dataset.productName;
            analyzedProductName.textContent = productName;
            
            trackingDataSection.style.display = 'block';
            await fetchTrackingData(currentTrackingProductDbId, currentPeriodFilter);
            trackingDataSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    closeAnalysisBtn.addEventListener('click', function() {
        trackingDataSection.style.display = 'none';
        currentTrackingProductDbId = null;
        if (funnelChartInstance) {
            funnelChartInstance.destroy();
            funnelChartInstance = null;
        }
    });

    periodFilterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            periodFilterButtons.forEach(b => {
                b.classList.remove('bg-emerald-500', 'text-white', 'shadow');
                b.classList.add('text-gray-600', 'hover:bg-gray-200');
            });
            this.classList.add('bg-emerald-500', 'text-white', 'shadow');
            this.classList.remove('text-gray-600', 'hover:bg-gray-200');

            currentPeriodFilter = this.dataset.period;
            if (currentTrackingProductDbId) {
                fetchTrackingData(currentTrackingProductDbId, currentPeriodFilter);
            }
        });
    });

    async function fetchTrackingData(trackingProductDbId, period) {
        try {
            const response = await fetch(`api.php?action=get_mentalpag_tracking_data&tracking_product_id=${trackingProductDbId}&period=${period}`);
            const result = await response.json();

            if (result.success) {
                const data = result.data;

                // Update KPIs
                kpiPageViews.textContent = data.funnel.page_views;
                kpiInitiateCheckouts.textContent = data.funnel.initiate_checkouts;
                kpiPurchases.textContent = data.funnel.purchases;

                conversionPageToCheckout.textContent = `${data.conversions.page_to_checkout}% de conversão (Página > Checkout)`;
                conversionCheckoutToPurchase.textContent = `${data.conversions.checkout_to_purchase}% de conversão (Checkout > Compra)`;
                conversionOverall.textContent = `${data.conversions.overall}%`;
                
                kpiClicksToSalePage.textContent = data.kpis.clicks_to_sale_page;
                kpiClicksToSaleCheckout.textContent = data.kpis.clicks_to_sale_checkout;

                kpiMainProductSalesCount.textContent = data.sales_summary.main_product_sales_count;
                kpiMainProductSalesValue.textContent = `Valor Total: ${formatCurrency(data.sales_summary.main_product_sales_value)}`;
                
                // Order Bumps
                orderBumpSalesList.innerHTML = '';
                if (data.sales_summary.order_bump_sales.length > 0) {
                    data.sales_summary.order_bump_sales.forEach(ob => {
                        const div = document.createElement('div');
                        div.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-md border';
                        div.innerHTML = `
                            <p class="font-medium text-gray-700">${htmlspecialchars(ob.product_name)}</p>
                            <p class="text-sm text-gray-600">${ob.total_count} vendas - ${formatCurrency(ob.total_value)}</p>
                        `;
                        orderBumpSalesList.appendChild(div);
                    });
                } else {
                    orderBumpSalesList.innerHTML = '<p class="text-gray-500">Nenhuma venda de order bump neste período.</p>';
                }

                // Render Funnel Chart
                renderFunnelChart(data.funnel);

            } else {
                alert('Erro ao carregar dados de rastreamento: ' + (result.error || 'Erro desconhecido.'));
            }
        } catch (error) {
            console.error('Erro ao buscar dados de rastreamento:', error);
            alert('Erro de comunicação com o servidor ao buscar dados de rastreamento.');
        }
    }

    function renderFunnelChart(funnelData) {
        const ctx = document.getElementById('funnelChart').getContext('2d');
        if (funnelChartInstance) {
            funnelChartInstance.destroy();
        }

        funnelChartInstance = new Chart(ctx, {
            type: 'bar', // Pode ser 'bar' ou 'horizontalBar'
            data: {
                labels: ['Visitas à Página', 'Visitas ao Checkout', 'Compras'],
                datasets: [{
                    label: 'Contagem',
                    data: [funnelData.page_views, funnelData.initiate_checkouts, funnelData.purchases],
                    backgroundColor: [
                        'rgba(66, 133, 244, 0.7)', // Azul (Google-like)
                        'rgba(251, 188, 5, 0.7)',  // Amarelo (Google-like)
                        'rgba(52, 168, 83, 0.7)'   // Verde (Google-like)
                    ],
                    borderColor: [
                        'rgba(66, 133, 244, 1)',
                        'rgba(251, 188, 5, 1)',
                        'rgba(52, 168, 83, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y', // Para barras horizontais
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) { return value.toLocaleString('pt-BR'); }
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed.x.toLocaleString('pt-BR')}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // --- Lógica para Excluir Funil ---
    trackedProductsList.addEventListener('click', async function(e) {
        const deleteBtn = e.target.closest('.delete-funnel-btn');
        if (deleteBtn) {
            const trackingProductDbId = deleteBtn.dataset.trackingProductDbId;
            const productName = deleteBtn.dataset.productName;

            if (confirm(`Tem certeza que deseja excluir o funil de rastreamento para o servi�o "${productName}"? Esta ação não pode ser desfeita.`)) {
                try {
                    const response = await fetch('api.php?action=delete_mentalpag_tracked_product', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ tracking_product_db_id: trackingProductDbId })
                    });
                    const result = await response.json();

                    if (result.success) {
                        alert(result.message);
                        await refreshTrackedProductsList(); // Recarrega a lista
                        // Se o funil excluído era o que estava sendo analisado, fecha a seção de análise
                        if (currentTrackingProductDbId === trackingProductDbId) {
                            closeAnalysisBtn.click();
                        }
                    } else {
                        alert('Erro ao excluir funil: ' + (result.error || 'Erro desconhecido.'));
                    }
                } catch (error) {
                    console.error('Erro ao excluir funil de rastreamento:', error);
                    alert('Erro de comunicação com o servidor.');
                }
            }
        }
    });

    // Helper para escapar HTML (já que estamos inserindo conteúdo dinâmico)
    function htmlspecialchars(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }
});
</script>
