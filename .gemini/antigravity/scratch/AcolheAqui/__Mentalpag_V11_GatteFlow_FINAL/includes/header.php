<header class="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-8 sticky top-0 z-10">
    <!-- Search Bar -->
    <div class="flex-1 max-w-2xl">
        <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i data-lucide="search" class="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors"></i>
            </div>
            <input type="text"
                class="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:bg-white transition-all text-sm font-medium"
                placeholder="Buscar transações, produtos, afiliados...">
        </div>
    </div>

    <!-- Right Actions -->
    <div class="flex items-center gap-4 ml-8">
        <!-- Notifications -->
        <button class="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 rounded-lg transition-colors relative">
            <span class="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            <i data-lucide="bell" class="w-6 h-6"></i>
        </button>

        <!-- Profile Dropdown -->
        <div class="flex items-center gap-3 pl-4 border-l border-gray-100">
            <div class="text-right hidden md:block">
                <p class="text-sm font-semibold text-gray-800 leading-tight">Welder de Aquino</p>
                <p class="text-xs text-gray-500">Terapeutawelder</p>
            </div>
            <div
                class="h-10 w-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                WA
            </div>
        </div>
    </div>
</header>