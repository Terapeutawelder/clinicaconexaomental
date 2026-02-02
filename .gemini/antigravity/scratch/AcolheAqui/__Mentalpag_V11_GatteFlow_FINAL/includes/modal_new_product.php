<!-- New Product Modal -->
<div id="newProductModal" class="hidden fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog"
    aria-modal="true">
    <!-- Backdrop -->
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-900 bg-opacity-40 transition-opacity backdrop-blur-sm" aria-hidden="true"
            onclick="closeModal('newProductModal')"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <!-- Modal Panel -->
        <div
            class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">

            <!-- Header -->
            <div class="px-8 py-6 border-b border-gray-100">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-gray-800" id="modal-title">Novo Produto</h3>
                    <button onclick="closeModal('newProductModal')"
                        class="text-gray-400 hover:text-gray-500 transition-colors">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>

                <!-- Steps Indicator -->
                <div class="flex items-center justify-between relative">
                    <div class="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-gray-100 -z-10">
                    </div>

                    <!-- Step 1 -->
                    <div class="step-indicator active flex flex-col items-center gap-2 bg-white px-2">
                        <div
                            class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold ring-4 ring-white">
                            1</div>
                        <span class="text-xs font-medium text-primary">Informações</span>
                    </div>
                    <!-- Step 2 -->
                    <div class="step-indicator flex flex-col items-center gap-2 bg-white px-2 opacity-50">
                        <div
                            class="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold ring-4 ring-white">
                            2</div>
                        <span class="text-xs font-medium text-gray-500">Mídia</span>
                    </div>
                    <!-- Step 3 -->
                    <div class="step-indicator flex flex-col items-center gap-2 bg-white px-2 opacity-50">
                        <div
                            class="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold ring-4 ring-white">
                            3</div>
                        <span class="text-xs font-medium text-gray-500">Config</span>
                    </div>
                    <!-- Step 4 -->
                    <div class="step-indicator flex flex-col items-center gap-2 bg-white px-2 opacity-50">
                        <div
                            class="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold ring-4 ring-white">
                            4</div>
                        <span class="text-xs font-medium text-gray-500">Checkout</span>
                    </div>
                </div>
            </div>

            <!-- Content -->
            <div class="px-8 py-6">
                <!-- Step 1 Content: Informações -->
                <div id="step1" class="step-content space-y-4">
                    <div class="text-center mb-6">
                        <div
                            class="w-12 h-12 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-3 text-primary">
                            <i data-lucide="file-text" class="w-6 h-6"></i>
                        </div>
                        <h4 class="text-lg font-bold text-gray-800">Informações Básicas</h4>
                        <p class="text-sm text-gray-500">Comece definindo os dados principais do seu produto</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nome do produto *</label>
                        <input type="text" placeholder="Ex: Curso de Marketing Digital"
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-100 focus:border-primary outline-none transition-all">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                        <textarea rows="3" placeholder="Descreva seu produto..."
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-100 focus:border-primary outline-none transition-all resize-none"></textarea>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
                            <div class="relative">
                                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">R$</span>
                                <input type="text" placeholder="0,00"
                                    class="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-100 focus:border-primary outline-none transition-all">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select
                                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-100 focus:border-primary outline-none transition-all bg-white">
                                <option>Digital</option>
                                <option>Serviço</option>
                                <option>Físico</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Placeholders for other steps -->
                <div id="step2" class="step-content hidden text-center py-10">
                    <i data-lucide="image" class="w-12 h-12 text-gray-300 mx-auto mb-4"></i>
                    <p class="text-gray-500">Upload de Imagens (Front-end demo only)</p>
                </div>
                <div id="step3" class="step-content hidden text-center py-10">
                    <i data-lucide="settings" class="w-12 h-12 text-gray-300 mx-auto mb-4"></i>
                    <p class="text-gray-500">Configurações Avançadas</p>
                </div>
                <div id="step4" class="step-content hidden text-center py-10">
                    <i data-lucide="shopping-bag" class="w-12 h-12 text-gray-300 mx-auto mb-4"></i>
                    <p class="text-gray-500">Checkout Builder</p>
                </div>
            </div>

            <!-- Footer -->
            <div class="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <button class="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                    <i data-lucide="chevron-left" class="w-4 h-4 inline-block mr-1"></i> Voltar
                </button>
                <button onclick="nextStep()"
                    class="bg-primary hover:bg-sky-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors shadow-blue-200">
                    Próximo <i data-lucide="chevron-right" class="w-4 h-4 inline-block ml-1"></i>
                </button>
            </div>
        </div>
    </div>
</div>

<script>
    let currentStep = 1;

    function openModal(id) {
        document.getElementById(id).classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(id) {
        document.getElementById(id).classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    function nextStep() {
        if (currentStep < 4) {
            // Hide current
            document.getElementById('step' + currentStep).classList.add('hidden');

            // Increment
            currentStep++;

            // Show new
            document.getElementById('step' + currentStep).classList.remove('hidden');

            // Update indicators (simple version)
            // Ideally we'd update classes for all step-indicators
        } else {
            alert('Produto criado com sucesso! (Demo)');
            closeModal('newProductModal');
            currentStep = 1;
            // Reset to step 1 logic here
        }
    }
</script>