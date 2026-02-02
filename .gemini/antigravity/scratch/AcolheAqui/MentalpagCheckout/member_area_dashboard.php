<?php
require_once 'config.php';

// ... (código de sessão PHP inalterado) ...
if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    header("location: member_login.php");
    exit;
}
if (isset($_SESSION["tipo"]) && $_SESSION["tipo"] === 'admin') {
    header("location: admin.php");
    exit;
}
$cliente_email = $_SESSION['usuario'];
$cliente_nome = $_SESSION['nome'] ?? $cliente_email;
$cursos_adquiridos = [];
$upload_dir = 'uploads/'; 

try {
    // ... (código de busca PDO inalterado) ...
    $stmt = $pdo->prepare("
        SELECT
            aa.produto_id,
            p.nome AS produto_nome,
            p.foto AS produto_foto,
            c.titulo AS curso_titulo,
            c.descricao AS curso_descricao,
            c.imagem_url AS curso_imagem_url,
            c.banner_url AS curso_banner_url
        FROM alunos_acessos aa
        JOIN produtos p ON aa.produto_id = p.id
        LEFT JOIN cursos c ON p.id = c.produto_id
        WHERE aa.aluno_email = ? AND p.tipo_entrega = 'area_membros'
        ORDER BY aa.data_concessao DESC
    ");
    $stmt->execute([$cliente_email]);
    $cursos_adquiridos = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    $mensagem_erro = "<div class='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4' role='alert'>Erro ao buscar seus cursos: " . htmlspecialchars($e->getMessage()) . "</div>";
    $cursos_adquiridos = [];
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale-1.0">
    <title>Meus Cursos - Área de Membros Mentalpag</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <!-- Swiper CSS (Apenas para as Ofertas) -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
    <style>
        body { font-family: 'Inter', sans-serif; }
        
        /* * Estilos do Swiper para "Ofertas Exclusivas"
         * ATUALIZAÇÃO: Aumentamos o tamanho dos cards
         */
        
        /* O slide de oferta (maior) */
        .offer-swiper-slide {
            width: 280px; /* ANTES: 220px */
            height: auto; 
            flex-shrink: 0;
        }

        /* O card de oferta */
        .offer-card-style {
            display: flex;
            flex-direction: column;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            background-color: #1f2937; /* bg-gray-800 */
            border: 2px solid #374151; /* border-gray-700. '2px' para reservar espaço */
            height: 100%;
            /* ATUALIZAÇÃO: Nova transição */
            transition: all 0.3s ease-in-out;
        }
        /* ATUALIZAÇÃO: Efeito "chamativo" no hover */
        .offer-card-style:hover {
            transform: translateY(-5px); /* ANTES: scale(1.03) foi REMOVIDO */
            box-shadow: 0 10px 25px rgba(0,0,0,0.3); /* Sombra mais forte */
            border-color: #10b981; /* Borda laranja */
        }
        
        /* Container da imagem de oferta (maior) */
        .offer-image-container {
            width: 100%;
            height: 160px; /* ANTES: 130px */
            background-color: #374151; /* bg-gray-700 */
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border-radius: 10px 10px 0 0;
        }
        .offer-image-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 10px 10px 0 0;
            /* ATUALIZAÇÃO: Adicionada transição para o zoom suave */
            transition: transform 0.3s ease-in-out;
        }

        /* ATUALIZAÇÃO: Nova regra para o zoom da IMAGEM, imitando os cards principais */
        .offer-card-style:hover .offer-image-container img {
            transform: scale(1.05);
        }

        /* Controles de Navegação do Swiper (Setas) */
        .swiper-button-next, .swiper-button-prev {
            color: #10b981; /* Laranja */
            width: 40px;
            height: 40px;
            background-color: rgba(255, 255, 255, 0.9);
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transition: all 0.3s;
            transform: translateY(-50%) scale(0.9);
            opacity: 0;
            position: absolute;
            top: 50%;
            z-index: 10;
        }
        .swiper-button-next:hover, .swiper-button-prev:hover {
            background-color: #10b981;
            color: white;
            transform: translateY(-50%) scale(1);
        }
        .swiper-button-next::after, .swiper-button-prev::after {
            font-size: 1.5rem;
        }
        .swiper-button-prev { left: 10px; }
        .swiper-button-next { right: 10px; }

        .swiper-container:hover .swiper-button-next,
        .swiper-container:hover .swiper-button-prev {
            opacity: 1;
            transform: translateY(-50%) scale(1);
        }

        /* Paginação do Swiper (Pontos) */
        .swiper-pagination-bullet {
            background-color: #6b7280; /* gray-500 */
            width: 10px;
            height: 10px;
        }
        .swiper-pagination-bullet-active {
            background-color: #10b981; /* Laranja */
        }

        /* Estilo do Swiper de Ofertas */
        .exclusiveOffersSwiper {
            width: 100%;
            height: 100%;
            padding-bottom: 40px; /* Espaço para paginação */
        }

        /* Styles for padlock icon on exclusive offers */
        .offer-card-style .lock-icon {
            position: absolute;
            top: 8px;
            right: 8px;
            background-color: rgba(0, 0, 0, 0.6);
            border-radius: 50%;
            padding: 6px;
            color: #10b981; /* Laranja */
            z-index: 5;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body class="bg-gray-900 text-gray-200 antialiased">

    <!-- Cabeçalho Premium Fixo (voltando para paleta 'gray') -->
    <header class="sticky top-0 z-50 w-full border-b border-gray-700/50 bg-gray-900/70 backdrop-blur-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-20">
                <div class="flex items-center space-x-4">
                    <a href="member_area_dashboard.php">
                        <img src="https://i.ibb.co/0RGhGvMt/Gemini-Generated-Image-hdcuf5hdcuf5hdcu-Photoroom.png" alt="Mentalpag Logo" class="h-10">
                    </a>
                </div>
                <div class="flex items-center space-x-5">
                    <span class="font-medium hidden md:block text-gray-300">Olá, <?php echo htmlspecialchars($cliente_nome); ?>!</span>
                    <a href="member_logout.php" class="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group">
                        <i data-lucide="log-out" class="w-5 h-5 transition-colors"></i>
                        <span class="hidden sm:block font-medium">Sair</span>
                    </a>
                </div>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <?php if (isset($mensagem_erro)) echo $mensagem_erro; ?>

        <!-- Novo Título Premium -->
        <div class_id="intro-header" class="mb-10">
            <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-pink-500 mb-2">
                Sua Biblioteca de Cursos
            </h1>
            <p class="text-xl text-gray-400">
                Todo seu conhecimento adquirido em um só lugar. Pronto para começar?
            </p>
        </div>


        <?php if (empty($cursos_adquiridos)): ?>
            <!-- Tela de Boas-Vindas / Vazio -->
            <div class="bg-gray-800 p-8 rounded-lg shadow-md text-center text-gray-400 border border-gray-700">
                <i data-lucide="inbox" class="mx-auto w-16 h-16 text-gray-600 mb-4"></i>
                <p class="text-lg font-semibold text-white">Você ainda não possui cursos</p>
                <p class="mt-2 text-sm">Parece que você ainda não adquiriu nenhum produto. Explore nossa loja ou, se você acredita que isso é um erro, por favor, entre em contato com o suporte.</p>
            </div>
        <?php else: ?>
            
            <!-- 
                NOVO LAYOUT: GRID DE CURSOS 
            -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                
                <?php foreach ($cursos_adquiridos as $curso): ?>
                    <!-- O Card do Curso (agora em grid, não swiper) -->
                    <a href="member_course_view.php?produto_id=<?php echo $curso['produto_id']; ?>" 
                       class="group bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border border-gray-700/50 flex flex-col">
                        
                        <!-- A "Capa" Robusta -->
                        <div class="relative aspect-video overflow-hidden">
                            <?php 
                            // ***********************************************
                            // LÓGICA DE IMAGEM CORRIGIDA E PRIORIZADA
                            // ***********************************************
                            $image_path = null;
                            $placeholder_url = 'https://placehold.co/600x400/1f2937/9ca3af?text=Curso+Sem+Imagem';

                            // 1. Priorizar a foto do PRODUTO (capa principal)
                            if (!empty($curso['produto_foto'])) {
                                $image_path = $upload_dir . $curso['produto_foto'];
                            } 
                            // 2. Se não houver, tentar a imagem do CURSO (módulo)
                            elseif (!empty($curso['curso_imagem_url'])) {
                                // Verificar se é uma URL completa ou um nome de arquivo
                                if (filter_var($curso['curso_imagem_url'], FILTER_VALIDATE_URL)) {
                                    $image_path = $curso['curso_imagem_url']; // É uma URL completa
                                } else {
                                    $image_path = $upload_dir . $curso['curso_imagem_url']; // Assumir que é um arquivo local
                                }
                            }

                            // 3. Se ainda assim for nulo, definir o placeholder diretamente
                            if (empty($image_path)) {
                                $image_path = $placeholder_url; 
                            }
                            ?>
                            <img src="<?php echo htmlspecialchars($image_path); ?>" 
                                 alt="<?php echo htmlspecialchars($curso['curso_titulo'] ?? $curso['produto_nome']); ?>"
                                 class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                 onerror="this.onerror=null; this.src='<?php echo $placeholder_url; ?>';">
                            
                            <!-- Overlay de "Play" que aparece no hover -->
                            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <i data-lucide="play-circle" class="w-16 h-16 text-white/80"></i>
                            </div>
                        </div>

                        <!-- Informações do Card -->
                        <div class="p-6 flex flex-col flex-grow">
                            <h3 class="text-2xl font-bold text-white mb-3 line-clamp-2">
                                <?php echo htmlspecialchars($curso['curso_titulo'] ?? $curso['produto_nome']); ?>
                            </h3>
                            <p class="text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">
                                <?php echo htmlspecialchars($curso['curso_descricao'] ?? 'Acesse para ver mais detalhes.'); ?>
                            </p>
                            
                            <!-- Barra de Progresso (Exemplo) -->
                            <div class="mt-4">
                                <span class="text-xs font-semibold text-gray-400">Progresso</span>
                                <div class="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                                    <!-- 
                                        NOTA: Isso é um exemplo estático. 
                                        Para funcionar, você precisaria buscar o progresso real do aluno no banco.
                                    -->
                                    <div class="bg-emerald-500 h-2.5 rounded-full" style="width: 45%"></div>
                                </div>
                            </div>
                        </div>
                    </a>
                <?php endforeach; ?>

            </div> <!-- Fim do Grid de Cursos -->
        <?php endif; ?>

        <!-- 
            SEÇÃO DE OFERTAS EXCLUSIVAS (COM CARDS MAIORES E MAIS CHAMATIVOS)
        -->
        <h2 class="text-3xl font-extrabold text-gray-100 mb-8 mt-12">Ofertas Exclusivas para Você</h2>
        
        <div id="exclusive-offers-loading" class="bg-gray-800 p-8 rounded-lg shadow-md text-center text-gray-400 border border-gray-700" style="display: block;">
            <svg class="animate-spin h-8 w-8 text-emerald-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.96l2-2.669z"></path>
            </svg>
            <p class="text-lg font-semibold">Carregando ofertas...</p>
        </div>

        <div id="exclusive-offers-empty" class="bg-gray-800 p-8 rounded-lg shadow-md text-center text-gray-400 border border-gray-700" style="display: none;">
            <i data-lucide="tag-off" class="mx-auto w-16 h-16 text-gray-600 mb-4"></i>
            <p class="text-lg font-semibold text-white">Nenhuma oferta exclusiva disponível.</p>
            <p class="mt-2 text-sm">Fique atento para futuras oportunidades!</p>
        </div>

        <!-- Swiper para Ofertas Exclusivas -->
        <div class="swiper exclusiveOffersSwiper swiper-container relative" style="display: none;">
            <div class="swiper-wrapper" id="exclusive-offers-list">
                <!-- Offers will be loaded here by JavaScript -->
            </div>
            <!-- Add Pagination -->
            <div class="swiper-pagination"></div>
            <!-- Add Navigation -->
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
        </div>

    </main>

    <script>
        lucide.createIcons();
    </script>
    <!-- Swiper JS -->
    <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const uploadDir = '<?php echo $upload_dir; ?>';
            
            var exclusiveOffersSwiper; // Declare here so it can be initialized later

            const exclusiveOffersLoading = document.getElementById('exclusive-offers-loading');
            const exclusiveOffersEmpty = document.getElementById('exclusive-offers-empty');
            const exclusiveOffersSwiperContainer = document.querySelector('.exclusiveOffersSwiper');
            const exclusiveOffersList = document.getElementById('exclusive-offers-list');

            function formatCurrency(value) {
                return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            }

            async function fetchExclusiveOffers() {
                exclusiveOffersLoading.style.display = 'block';
                exclusiveOffersEmpty.style.display = 'none';
                exclusiveOffersSwiperContainer.style.display = 'none';
                exclusiveOffersList.innerHTML = ''; // Clear previous offers

                try {
                    const response = await fetch('api.php?action=get_member_exclusive_offers');
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();

                    if (data.offers && data.offers.length > 0) {
                        data.offers.forEach(offer => {
                            const slide = document.createElement('div');
                            // ATUALIZAÇÃO: Usando a nova classe de slide de oferta (com 'width: 280px' no CSS)
                            slide.classList.add('offer-swiper-slide');
                            
                            const productPhoto = offer.product_photo ? uploadDir + offer.product_photo : 'https://placehold.co/280x160/1f2937/d1d5db?text=Produto'; // Placeholder maior
                            const productPrice = formatCurrency(offer.product_price);
                            const checkoutLink = `checkout.php?p=${offer.checkout_hash}`;

                            // ATUALIZAÇÃO: Usando as novas classes de CSS e adicionando o BADGE
                            slide.innerHTML = `
                                <a href="${checkoutLink}" class="offer-card-style offer-card relative block">
                                    <div class="lock-icon">
                                        <i data-lucide="lock" class="w-5 h-5"></i>
                                    </div>
                                    <div class="offer-image-container">
                                        <img src="${productPhoto}" alt="${offer.product_name}" onerror="this.onerror=null;this.src='https://placehold.co/280x160/1f2937/d1d5db?text=Produto';">
                                    </div>
                                    <div class="p-5 flex-grow flex flex-col justify-between">
                                        
                                        <!-- ATUALIZAÇÃO: BADGE ADICIONADO -->
                                        <span class="inline-block bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase mb-3 self-start">
                                            Oferta Exclusiva
                                        </span>

                                        <div>
                                            <h3 class="text-xl font-bold text-white mb-2 line-clamp-2">${offer.product_name}</h3>
                                            <p class="text-gray-400 text-sm mb-4 line-clamp-3">
                                                Oferta exclusiva do seu infoprodutor.
                                            </p>
                                        </div>
                                        <span class="mt-4 inline-flex items-center justify-center bg-green-600 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-green-700 transition duration-300 text-base">
                                            Comprar por ${productPrice}
                                        </span>
                                    </div>
                                </a>
                            `;
                            exclusiveOffersList.appendChild(slide);
                        });
                        
                        exclusiveOffersLoading.style.display = 'none';
                        exclusiveOffersSwiperContainer.style.display = 'block';
                        
                        // Initialize Swiper after content is loaded
                        exclusiveOffersSwiper = new Swiper(".exclusiveOffersSwiper", {
                            slidesPerView: "auto", // Permite que o CSS (.offer-swiper-slide) defina a largura
                            spaceBetween: 20,
                            freeMode: true,
                            pagination: {
                                el: ".swiper-pagination",
                                clickable: true,
                            },
                            navigation: {
                                nextEl: ".swiper-button-next",
                                prevEl: ".swiper-button-prev",
                            },
                            breakpoints: {
                                640: { spaceBetween: 20 },
                                768: { spaceBetween: 25 },
                                1024: { spaceBetween: 30 },
                                1280: { spaceBetween: 30 }
                            },
                        });
                        lucide.createIcons(); // Re-render icons for newly added elements
                    } else {
                        exclusiveOffersLoading.style.display = 'none';
                        exclusiveOffersEmpty.style.display = 'block';
                    }
                } catch (error) {
                    console.error('Error fetching exclusive offers:', error);
                    exclusiveOffersLoading.style.display = 'none';
                    exclusiveOffersEmpty.style.display = 'block'; // Show empty state on error too
                    exclusiveOffersEmpty.innerHTML = `<i data-lucide="cloud-off" class="mx-auto w-16 h-16 text-gray-600 mb-4"></i><p class="text-lg font-semibold text-red-500">Erro ao carregar ofertas!</p><p class="mt-2 text-sm text-gray-400">Tente novamente mais tarde ou entre em contato com o suporte.</p>`;
                    lucide.createIcons(); // Re-render icons for newly added elements
                }
            }

            fetchExclusiveOffers(); // Call to load exclusive offers
        });
    </script>
</body>
</html>
