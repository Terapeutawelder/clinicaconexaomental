<div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-gray-800 tracking-tight">Vendas</h1>
            <p class="text-sm text-gray-500">Acompanhe suas transações em tempo real</p>
        </div>

        <div class="bg-white border text-sm text-gray-500 leading-none border-gray-200 rounded-lg flex shadow-sm p-1">
            <button
                class="flex-1 px-4 py-2 rounded-md bg-gray-100 text-gray-800 font-medium transition-colors">Todas</button>
            <button
                class="flex-1 px-4 py-2 rounded-md hover:text-gray-700 hover:bg-gray-50 transition-colors">Aprovadas</button>
            <button
                class="flex-1 px-4 py-2 rounded-md hover:text-gray-700 hover:bg-gray-50 transition-colors">Pendentes</button>
            <button
                class="flex-1 px-4 py-2 rounded-md hover:text-gray-700 hover:bg-gray-50 transition-colors">Canceladas</button>
        </div>
    </div>

    <!-- Sales Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50 border-b border-gray-100">
                <tr>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Produto</th>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações
                    </th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm">
                <!-- Row 1 (Approved) -->
                <tr class="hover:bg-gray-50 transition-colors group">
                    <td class="px-6 py-4 text-gray-500">#TRX-9821</td>
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                            <div
                                class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                JD</div>
                            <span class="font-medium text-gray-700">John Doe</span>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-gray-600">Consulta Padrão</td>
                    <td class="px-6 py-4 font-semibold text-gray-800">R$ 300,00</td>
                    <td class="px-6 py-4">
                        <span
                            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                            <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Pago
                        </span>
                    </td>
                    <td class="px-6 py-4 text-gray-500">21 Jan, 15:30</td>
                    <td class="px-6 py-4 text-right">
                        <button class="text-gray-400 hover:text-primary transition-colors"><i data-lucide="eye"
                                class="w-4 h-4"></i></button>
                    </td>
                </tr>

                <!-- Row 2 (Pending) -->
                <tr class="hover:bg-gray-50 transition-colors group">
                    <td class="px-6 py-4 text-gray-500">#TRX-9822</td>
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                            <div
                                class="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                                MS</div>
                            <span class="font-medium text-gray-700">Maria Silva</span>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-gray-600">Ebook Ansiedade</td>
                    <td class="px-6 py-4 font-semibold text-gray-800">R$ 49,90</td>
                    <td class="px-6 py-4">
                        <span
                            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                            <span class="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> Pendente
                        </span>
                    </td>
                    <td class="px-6 py-4 text-gray-500">21 Jan, 14:15</td>
                    <td class="px-6 py-4 text-right">
                        <button class="text-gray-400 hover:text-primary transition-colors"><i data-lucide="eye"
                                class="w-4 h-4"></i></button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>