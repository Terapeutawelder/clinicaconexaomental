<div class="space-y-6">
    <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">Usuários</h1>
        <button
            class="bg-primary hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Novo
            Usuário</button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50 border-b border-gray-100">
                <tr>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Usuário</th>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Ações</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm">
                <tr>
                    <td class="px-6 py-4 font-medium">Welder de Aquino</td>
                    <td class="px-6 py-4 text-gray-600">welder@example.com</td>
                    <td class="px-6 py-4"><span
                            class="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">Admin</span></td>
                    <td class="px-6 py-4"><span
                            class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Ativo</span></td>
                    <td class="px-6 py-4 text-right"><button class="text-gray-400 hover:text-primary"><i
                                data-lucide="more-vertical" class="w-4 h-4"></i></button></td>
                </tr>
                <tr>
                    <td class="px-6 py-4 font-medium">Teste Vendedor</td>
                    <td class="px-6 py-4 text-gray-600">vendedor@example.com</td>
                    <td class="px-6 py-4"><span
                            class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Seller</span></td>
                    <td class="px-6 py-4"><span
                            class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Ativo</span></td>
                    <td class="px-6 py-4 text-right"><button class="text-gray-400 hover:text-primary"><i
                                data-lucide="more-vertical" class="w-4 h-4"></i></button></td>
                </tr>
            </tbody>
        </table>
    </div>
</div>