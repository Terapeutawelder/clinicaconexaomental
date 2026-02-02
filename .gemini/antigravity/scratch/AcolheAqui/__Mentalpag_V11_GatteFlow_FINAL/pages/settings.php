<div class="flex flex-col md:flex-row gap-6">
    <!-- Settings Sidebar -->
    <div class="w-full md:w-64 bg-white rounded-xl shadow-sm border border-gray-100 p-2 h-fit">
        <nav class="space-y-1">
            <a href="#" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-sky-600 bg-sky-50 rounded-lg">
                <i data-lucide="user" class="w-5 h-5"></i>
                Visão Geral
            </a>
            <a href="#"
                class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <i data-lucide="credit-card" class="w-5 h-5"></i>
                Modo de Venda
            </a>
            <a href="#"
                class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <i data-lucide="lock" class="w-5 h-5"></i>
                Segurança
            </a>
            <a href="#"
                class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <i data-lucide="bell" class="w-5 h-5"></i>
                Notificações
            </a>
        </nav>
    </div>

    <!-- Main Settings Content -->
    <div class="flex-1 space-y-6">
        <!-- Section: Profile -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 class="text-xl font-bold text-gray-800 mb-6">Informações do Perfil</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Avatar Upload -->
                <div class="col-span-1 md:col-span-2 flex items-center gap-4 mb-4">
                    <div
                        class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-400 border-2 border-dashed border-gray-300">
                        WA
                    </div>
                    <div>
                        <button
                            class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                            Alterar Foto
                        </button>
                        <p class="text-xs text-gray-400 mt-2">JPG, GIF ou PNG. Max 1MB.</p>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                    <input type="text" value="Welder de Aquino"
                        class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-100 focus:border-primary outline-none transition-all">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value="welder@example.com"
                        class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-100 focus:border-primary outline-none transition-all">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input type="tel" value="+55 (11) 99999-9999"
                        class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-100 focus:border-primary outline-none transition-all">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ</label>
                    <input type="text" value="000.000.000-00" disabled
                        class="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 outline-none cursor-not-allowed">
                </div>
            </div>

            <div class="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                <button
                    class="bg-primary hover:bg-sky-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors shadow-blue-200">
                    Salvar Alterações
                </button>
            </div>
        </div>

        <!-- Section: Password -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 class="text-xl font-bold text-gray-800 mb-6">Segurança</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
                    <input type="password"
                        class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-100 focus:border-primary outline-none transition-all">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                    <input type="password"
                        class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-100 focus:border-primary outline-none transition-all">
                </div>
            </div>
        </div>
    </div>
</div>