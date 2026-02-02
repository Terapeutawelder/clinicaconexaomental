<div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-gray-800 tracking-tight">Produtos</h1>
            <p class="text-sm text-gray-500">Gerencie seus produtos e ofertas</p>
        </div>

        <div class="flex items-center gap-2">
            <div class="relative">
                <i data-lucide="search"
                    class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"></i>
                <input type="text" placeholder="Buscar produtos..."
                    class="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-100 focus:border-primary outline-none w-64">
            </div>

            <button onclick="openModal('newProductModal')"
                class="flex items-center gap-2 bg-primary hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors shadow-blue-200">
                <i data-lucide="plus" class="w-4 h-4"></i>
                Novo Produto
            </button>
        </div>
    </div>

    <!-- Products Grid/List -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50 border-b border-gray-100">
                <tr>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Produto</th>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Preço</th>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações
                    </th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm">
                <!-- Row 1 -->
                <tr class="hover:bg-gray-50 transition-colors group">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                <i data-lucide="image" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <p class="font-medium text-gray-800">Consulta Padrão</p>
                                <p class="text-xs text-gray-500">ID: #PROD-001</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 font-semibold text-gray-700">R$ 300,00</td>
                    <td class="px-6 py-4">
                        <span
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            Serviço
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                            <div
                                class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle" id="toggle1" checked
                                    class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-5 checked:border-green-400" />
                                <label for="toggle1"
                                    class="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer checked:bg-green-400"></label>
                            </div>
                            <span class="text-green-600 text-xs font-medium">Ativo</span>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button class="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-primary"><i
                                    data-lucide="edit-2" class="w-4 h-4"></i></button>
                            <button class="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-red-500"><i
                                    data-lucide="trash-2" class="w-4 h-4"></i></button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Empty State (Hidden by default) -->
        <div class="hidden p-12 text-center">
            <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <i data-lucide="package" class="w-8 h-8"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900">Nenhum produto encontrado</h3>
            <p class="text-gray-500 mt-1 mb-6">Comece criando seu primeiro produto ou serviço.</p>
            <button class="bg-primary hover:bg-sky-600 text-white px-5 py-2 rounded-lg font-medium transition-colors">
                Criar Produto
            </button>
        </div>
    </div>
</div>

<!-- Modal Logic would go here or in footer -->
<script>
    function openModal(id) {
        // Simple alert for now, full modal implementation to follow
        alert('Abrir Modal: ' + id);
    }
</script>

<style>
    /* Custom Toggle Checkbox */
    .toggle-checkbox:checked {
        right: 0;
        border-color: #4ade80;
        /* Green-400 */
    }

    .toggle-checkbox:checked+.toggle-label {
        background-color: #4ade80;
    }
</style>