<div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-gray-800 tracking-tight">Gateways de Pagamento</h1>
            <p class="text-sm text-gray-500">Gerencie os processadores de pagamento da plataforma</p>
        </div>

        <button
            class="flex items-center gap-2 bg-primary hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors shadow-blue-200">
            <i data-lucide="plus" class="w-4 h-4"></i>
            Novo Gateway
        </button>
    </div>

    <!-- Gateways List -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 class="font-bold text-gray-800">Gateways Cadastrados</h3>
            <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">5 Integrados</span>
        </div>

        <div class="divide-y divide-gray-100">
            <!-- Asaas -->
            <div class="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-4">
                    <div
                        class="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                        ASAAS</div>
                    <div>
                        <h4 class="font-bold text-gray-800">Asaas</h4>
                        <p class="text-xs text-gray-500">Taxa média: 1.99%</p>
                    </div>
                </div>

                <div class="flex items-center gap-6">
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-1 bg-sky-100 text-sky-700 rounded text-xs font-bold">PIX</span>
                        <span class="px-2 py-1 bg-sky-100 text-sky-700 rounded text-xs font-bold">Cartão</span>
                        <span class="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs font-bold">Boleto</span>
                    </div>

                    <div class="flex items-center gap-2">
                        <div
                            class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" name="toggle" id="gw1" checked
                                class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-5 checked:border-green-400" />
                            <label for="gw1"
                                class="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer checked:bg-green-400"></label>
                        </div>
                        <span class="text-green-600 text-xs font-medium">Ativo</span>
                    </div>

                    <button class="text-gray-400 hover:text-primary"><i data-lucide="edit-2"
                            class="w-4 h-4"></i></button>
                </div>
            </div>

            <!-- Mercado Pago -->
            <div class="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-4">
                    <div
                        class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                        MP</div>
                    <div>
                        <h4 class="font-bold text-gray-800">Mercado Pago</h4>
                        <p class="text-xs text-gray-500">Taxa média: 3.99%</p>
                    </div>
                </div>

                <div class="flex items-center gap-6">
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-1 bg-sky-100 text-sky-700 rounded text-xs font-bold">PIX</span>
                        <span
                            class="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs font-bold opacity-50">Cartão</span>
                    </div>

                    <div class="flex items-center gap-2">
                        <div
                            class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" name="toggle" id="gw2"
                                class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-5 checked:border-green-400" />
                            <label for="gw2"
                                class="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer checked:bg-green-400"></label>
                        </div>
                        <span class="text-gray-400 text-xs font-medium">Inativo</span>
                    </div>

                    <button class="text-gray-400 hover:text-primary"><i data-lucide="edit-2"
                            class="w-4 h-4"></i></button>
                </div>
            </div>
        </div>
    </div>
</div>
<style>
    .toggle-checkbox:checked {
        right: 0;
        border-color: #4ade80;
    }

    .toggle-checkbox:checked+.toggle-label {
        background-color: #4ade80;
    }
</style>