-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 28/12/2025 às 20:04
-- Versão do servidor: 11.8.3-MariaDB-log
-- Versão do PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `u232648875_licensa`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `alunos_acessos`
--

CREATE TABLE `alunos_acessos` (
  `id` int(11) NOT NULL,
  `aluno_email` varchar(255) NOT NULL,
  `produto_id` int(11) NOT NULL,
  `data_concessao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `aluno_progresso`
--

CREATE TABLE `aluno_progresso` (
  `id` int(11) NOT NULL,
  `aluno_email` varchar(255) NOT NULL,
  `aula_id` int(11) NOT NULL,
  `data_conclusao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `aulas`
--

CREATE TABLE `aulas` (
  `id` int(11) NOT NULL,
  `modulo_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `url_video` varchar(255) DEFAULT NULL COMMENT 'URL do vídeo (YouTube, Vimeo, etc.), pode ser NULL',
  `descricao` text DEFAULT NULL,
  `ordem` int(11) NOT NULL DEFAULT 0,
  `release_days` int(11) NOT NULL DEFAULT 0 COMMENT 'Número de dias após a compra para a aula ser liberada',
  `tipo_conteudo` enum('video','files','mixed') NOT NULL DEFAULT 'video' COMMENT 'Tipo de conteúdo da aula: video, files ou mixed'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `aula_arquivos`
--

CREATE TABLE `aula_arquivos` (
  `id` int(11) NOT NULL,
  `aula_id` int(11) NOT NULL,
  `nome_original` varchar(255) NOT NULL COMMENT 'Nome original do arquivo',
  `nome_salvo` varchar(255) NOT NULL COMMENT 'Nome do arquivo salvo no servidor',
  `caminho_arquivo` varchar(255) NOT NULL COMMENT 'Caminho completo do arquivo no servidor (ex: uploads/aula_files/arquivo.pdf)',
  `tipo_mime` varchar(100) DEFAULT NULL COMMENT 'Tipo MIME do arquivo (ex: application/pdf, image/png)',
  `tamanho_bytes` int(11) DEFAULT NULL,
  `ordem` int(11) NOT NULL DEFAULT 0 COMMENT 'Ordem de exibição do arquivo dentro da aula',
  `data_upload` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `cloned_sites`
--

CREATE TABLE `cloned_sites` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL COMMENT 'ID do infoprodutor dono do site clonado',
  `original_url` varchar(2048) NOT NULL COMMENT 'URL do site original que foi clonado',
  `title` varchar(255) DEFAULT NULL COMMENT 'Título da página clonada',
  `original_html` longtext NOT NULL COMMENT 'Conteúdo HTML original da página clonada',
  `edited_html` longtext DEFAULT NULL COMMENT 'Conteúdo HTML da página após edição do usuário',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `slug` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'draft'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `cloned_site_settings`
--

CREATE TABLE `cloned_site_settings` (
  `id` int(11) NOT NULL,
  `cloned_site_id` int(11) NOT NULL COMMENT 'ID do site clonado associado',
  `facebook_pixel_id` varchar(255) DEFAULT NULL COMMENT 'ID do Facebook Pixel',
  `google_analytics_id` varchar(255) DEFAULT NULL COMMENT 'ID do Google Analytics',
  `custom_head_scripts` longtext DEFAULT NULL COMMENT 'Scripts personalizados a serem injetados no <head>',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `configuracoes`
--

CREATE TABLE `configuracoes` (
  `chave` varchar(255) NOT NULL,
  `valor` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `configuracoes`
--

INSERT INTO `configuracoes` (`chave`, `valor`) VALUES
('email_template_delivery_html', '<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\">\n    <title>Bem-vindo(a) à Mentalpag!</title>\n    <style>\n        @import url(\'https://www.google.com/url?sa=E&source=gmail&q=https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700%26display=swap\');\n        /* Estilos para responsividade */\n        @media screen and (max-width: 600px) {\n            .container {\n                width: 100% !important;\n                padding: 10px !important;\n            }\n            .content {\n                padding: 25px 20px !important;\n            }\n            .header-img {\n                width: 150px !important;\n            }\n            h1 {\n                font-size: 24px !important;\n            }\n        }\n    </style>\n</head>\n<body style=\"margin: 0; padding: 0; background-color: #f1f5f9; font-family: \'Inter\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif;\">\n    <!-- Preheader (texto de visualização no cliente de e-mail) -->\n    <div style=\"display: none; max-height: 0; overflow: hidden;\">Tudo pronto! Seu acesso aos produtos Mentalpag já está disponível.</div>\n    <table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"border-collapse: collapse;\">\n        <tr>\n            <td align=\"center\" style=\"padding: 20px 0;\">\n                <table class=\"container\" align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"600\" style=\"border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0;\">\n                    <!-- Cabeçalho com a Nova Logo -->\n                    <tr>\n                        <td align=\"center\" bgcolor=\"#1e1e2f\" style=\"padding: 30px 20px; background-color: #1e1e2f;\">\n                            <div>\n                                <img class=\"header-img\" src=\"https://i.ibb.co/0RGhGvMt/Gemini-Generated-Image-hdcuf5hdcuf5hdcu-Photoroom.png\" alt=\"Logo Mentalpag\" width=\"200\" style=\"display: block; border: 0;\" />\n                            </div>\n                        </td>\n                    </tr>\n                    <!-- Corpo Principal -->\n                    <tr>\n                        <td class=\"content\" style=\"padding: 40px 35px;\">\n                            <h1 style=\"font-size: 28px; font-weight: 700; color: #0f172a; margin: 0 0 15px 0;\">Parabéns, {CLIENT_NAME}!</h1>\n                            <p style=\"margin: 0 0 25px 0; font-size: 16px; line-height: 1.6; color: #475569;\">\n                                Seus produtos adquiridos na Mentalpag foram liberados com sucesso! Abaixo estão os detalhes de acesso para cada um deles:\n                            </p>\n                            <!-- Início do Loop de Produtos -->\n                            <!-- LOOP_PRODUCTS_START -->\n                            <div style=\"background-color: #ffffff; border: 1px solid #f97316; border-radius: 12px; padding: 25px; margin-bottom: 25px; box-shadow: 0 4px 10px rgba(0,0,0,0.03);\">\n                                <h2 style=\"font-size: 20px; font-weight: 600; color: #1e293b; margin: 0 0 15px 0;\">{PRODUCT_NAME}</h2>\n                                \n                                <!-- Bloco para Área de Membros -->\n                                <!-- IF_PRODUCT_TYPE_MEMBER_AREA -->\n                                <p style=\"margin: 0 0 10px 0; font-size: 15px; color: #475569;\">Este produto está disponível em sua área de membros.</p>\n                                <p style=\"margin: 0 0 5px 0; font-size: 15px; color: #475569;\"><strong>Seu login:</strong> {CLIENT_EMAIL}</p>\n                                <p style=\"margin: 0 0 20px 0; font-size: 15px; color: #475569;\"><strong>Sua senha:</strong> {MEMBER_AREA_PASSWORD}</p>\n                                <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse: collapse;\">\n                                    <tr>\n                                        <td align=\"center\" style=\"background-color: #f97316; border-radius: 8px;\">\n                                            <a href=\"{MEMBER_AREA_LOGIN_URL}\" target=\"_blank\" style=\"color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 28px; border: 19px solid #f97316; display: inline-block; border-radius: 8px;\">Acessar sua Área de Membros</a>\n                                        </td>\n                                    </tr>\n                                </table>\n                                <!-- END_IF_PRODUCT_TYPE_MEMBER_AREA -->\n\n                                <!-- Bloco para Link -->\n                                <!-- IF_PRODUCT_TYPE_LINK -->\n                                <p style=\"margin: 0 0 15px 0; font-size: 15px; color: #475569;\"><strong>Link de Acesso:</strong></p>\n                                <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse: collapse; margin-bottom: 10px;\">\n                                    <tr>\n                                        <td align=\"center\" style=\"background-color: #f97316; border-radius: 8px;\">\n                                            <!-- ### CORREÇÃO AQUI ### -->\n                                            <!-- Eu mudei o \'border: 1px\' para \'border: 19px\' para bater com o botão da área de membros. -->\n                                            <!-- Isso força o Outlook e outros clientes de e-mail a tornar toda a área do botão clicável. -->\n                                            <a href=\"{PRODUCT_LINK}\" target=\"_blank\" style=\"color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 28px; border: 19px solid #f97316; display: inline-block; border-radius: 8px;\">Acessar {PRODUCT_NAME}</a>\n                                        </td>\n                                    </tr>\n                                </table>\n                                <p style=\"word-break: break-all; font-size: 12px; color: #64748b;\">Se o botão não funcionar, copie e cole o link: <a href=\"{PRODUCT_LINK}\" style=\"color: #f97316;\">{PRODUCT_LINK}</a></p>\n                                <!-- END_IF_PRODUCT_TYPE_LINK -->\n\n                                <!-- Bloco para PDF -->\n                                <!-- IF_PRODUCT_TYPE_PDF -->\n                                <p style=\"margin: 0 0 10px 0; font-size: 15px; color: #475569;\">Seu PDF está anexado a este e-mail. Faça o download para começar a aproveitar!</p>\n                                <!-- END_IF_PRODUCT_TYPE_PDF -->\n                            </div>\n                            <!-- Fim do Loop de Produtos -->\n                            <!-- LOOP_PRODUCTS_END -->\n\n                            <p style=\"margin: 30px 0 0 0; font-size: 16px; line-height: 1.6; color: #475569;\">\n                                Caso tenha alguma dúvida ou precise de suporte, entre em contato conosco.\n                            </p>\n                            <p style=\"margin: 15px 0 0 0; font-size: 16px; line-height: 1.6; color: #475569;\">\n                                Obrigado e aproveite seus novos produtos!\n                            </p>\n                        </td>\n                    </tr>\n                    <!-- Rodapé -->\n                    <tr>\n                        <td align=\"center\" style=\"padding: 25px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;\">\n                            <p style=\"margin: 0; font-size: 13px; color: #64748b;\">\n                                Este é um e-mail automático, por favor, não responda.\n                            </p>\n                            <p style=\"margin: 10px 0 0 0; font-size: 13px; color: #94a3b8;\">\n                                Mentalpag &copy; 2025. Todos os direitos reservados.\n                            </p>\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n    </table>\n</body>\n</html>'),
('email_template_delivery_subject', 'Acesso ao seu Produto Mentalpag!'),
('member_area_login_url', ''),
('mercado_pago_enable_credit_card', '1'),
('mercado_pago_enable_pix', '1'),
('mercado_pago_max_installments', '24'),
('smtp_encryption', 'ssl'),
('smtp_from_email', ''),
('smtp_from_name', 'Mentalpag'),
('smtp_host', 'smtp.hostinger.com'),
('smtp_password', 'Leonardo02041996@'),
('smtp_port', '465'),
('smtp_username', '');

-- --------------------------------------------------------

--
-- Estrutura para tabela `cursos`
--

CREATE TABLE `cursos` (
  `id` int(11) NOT NULL,
  `produto_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `imagem_url` varchar(255) DEFAULT NULL,
  `banner_url` varchar(255) DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `modulos`
--

CREATE TABLE `modulos` (
  `id` int(11) NOT NULL,
  `curso_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `imagem_capa_url` varchar(255) DEFAULT NULL,
  `ordem` int(11) NOT NULL DEFAULT 0,
  `release_days` int(11) NOT NULL DEFAULT 0 COMMENT 'Número de dias após a compra para o módulo ser liberado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `notificacoes`
--

CREATE TABLE `notificacoes` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL COMMENT 'ID do infoprodutor que deve receber a notificação',
  `tipo` varchar(50) NOT NULL COMMENT 'Tipo de evento (ex: Compra Aprovada, Pix Gerado, Boleto Pago)',
  `mensagem` text NOT NULL COMMENT 'Mensagem completa da notificação',
  `valor` decimal(10,2) DEFAULT NULL COMMENT 'Valor associado à notificação (ex: valor da venda)',
  `data_notificacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `lida` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0 para não lida, 1 para lida',
  `link_acao` varchar(255) DEFAULT NULL COMMENT 'Link opcional para detalhes da venda',
  `displayed_live` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0 para não exibida ao vivo, 1 para já exibida ao vivo',
  `venda_id_fk` int(11) DEFAULT NULL COMMENT 'Chave estrangeira para a tabela de vendas',
  `metodo_pagamento` varchar(50) DEFAULT NULL COMMENT 'Método de pagamento da venda associada, para notificação live'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `order_bumps`
--

CREATE TABLE `order_bumps` (
  `id` int(11) NOT NULL,
  `main_product_id` int(11) NOT NULL COMMENT 'ID do produto principal (o do checkout)',
  `offer_product_id` int(11) NOT NULL COMMENT 'ID do produto que está sendo ofertado',
  `headline` varchar(255) DEFAULT 'Sim, eu quero aproveitar essa oferta!',
  `description` text DEFAULT NULL,
  `ordem` int(11) NOT NULL DEFAULT 0 COMMENT 'Ordem de exibição no checkout',
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `product_exclusive_offers`
--

CREATE TABLE `product_exclusive_offers` (
  `id` int(11) NOT NULL,
  `source_product_id` int(11) NOT NULL COMMENT 'ID do produto que o cliente já possui e que gera a oferta',
  `offer_product_id` int(11) NOT NULL COMMENT 'ID do produto (tipo area_membros) ofertado',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Status da oferta: 1=ativo, 0=inativo',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `produtos`
--

CREATE TABLE `produtos` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `preco` decimal(10,2) NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `checkout_hash` varchar(255) NOT NULL,
  `checkout_config` text DEFAULT NULL,
  `usuario_id` int(11) NOT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `preco_anterior` decimal(10,2) DEFAULT NULL,
  `tipo_entrega` varchar(50) NOT NULL DEFAULT 'link',
  `conteudo_entrega` varchar(255) DEFAULT NULL,
  `gateway` varchar(50) DEFAULT 'mercadopago'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `mentalpag_tracking_events`
--

CREATE TABLE `mentalpag_tracking_events` (
  `id` int(11) NOT NULL,
  `tracking_product_id` int(11) NOT NULL COMMENT 'ID do produto rastreado em mentalpag_tracking_products',
  `session_id` varchar(255) NOT NULL COMMENT 'ID único da sessão do usuário',
  `event_type` varchar(50) NOT NULL COMMENT 'Tipo do evento (page_view, initiate_checkout, purchase)',
  `event_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Dados adicionais do evento (ex: url, referrer)' CHECK (json_valid(`event_data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `mentalpag_tracking_products`
--

CREATE TABLE `mentalpag_tracking_products` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL COMMENT 'ID do infoprodutor dono do produto',
  `produto_id` int(11) NOT NULL COMMENT 'ID do produto real sendo rastreado',
  `tracking_id` varchar(64) NOT NULL COMMENT 'ID único para o script de rastreamento',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `usuario` varchar(255) NOT NULL,
  `nome` varchar(255) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `senha` varchar(255) NOT NULL,
  `tipo` varchar(20) NOT NULL DEFAULT 'infoprodutor' COMMENT 'Define o tipo de usuário (admin, infoprodutor, usuario[cliente])',
  `mp_public_key` varchar(255) DEFAULT NULL,
  `mp_access_token` varchar(255) DEFAULT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL,
  `ultima_visualizacao_notificacoes` timestamp NULL DEFAULT NULL COMMENT 'Timestamp da última vez que o usuário visualizou o painel de notificações',
  `pushinpay_token` varchar(255) DEFAULT NULL,
  `pagseguro_email` varchar(255) DEFAULT NULL,
  `pagseguro_token` varchar(255) DEFAULT NULL,
  `stripe_public_key` varchar(255) DEFAULT NULL,
  `stripe_secret_key` varchar(255) DEFAULT NULL,
  `pagarme_api_key` varchar(255) DEFAULT NULL,
  `asaas_api_key` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `usuario`, `nome`, `telefone`, `senha`, `tipo`, `mp_public_key`, `mp_access_token`, `foto_perfil`, `ultima_visualizacao_notificacoes`, `pushinpay_token`) VALUES
(1, 'admin@gmail.com', 'Leonardo ADM', '', '$2y$10$lTXZqS7J/dsIHwTQWqAjduKpe/qZ6KGMMyvswxDamZcswA9Fp3GU.', 'admin', NULL, NULL, NULL, '2025-09-15 16:35:10', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `utmfy_integrations`
--

CREATE TABLE `utmfy_integrations` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL COMMENT 'ID do infoprodutor dono da integração',
  `name` varchar(255) NOT NULL COMMENT 'Nome amigável da integração (ex: Campanha de Lançamento X)',
  `api_token` varchar(255) NOT NULL COMMENT 'API Token fornecido pela UTMfy',
  `product_id` int(11) DEFAULT NULL COMMENT 'ID do produto específico que dispara a notificação (NULL para todos os produtos do infoprodutor)',
  `event_approved` tinyint(1) NOT NULL DEFAULT 0,
  `event_pending` tinyint(1) NOT NULL DEFAULT 0,
  `event_rejected` tinyint(1) NOT NULL DEFAULT 0,
  `event_refunded` tinyint(1) NOT NULL DEFAULT 0,
  `event_charged_back` tinyint(1) NOT NULL DEFAULT 0,
  `event_initiate_checkout` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Disparar evento ao iniciar checkout',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `vendas`
--

CREATE TABLE `vendas` (
  `id` int(11) NOT NULL,
  `produto_id` int(11) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `status_pagamento` varchar(50) NOT NULL,
  `data_venda` timestamp NOT NULL DEFAULT current_timestamp(),
  `comprador_email` varchar(255) DEFAULT NULL,
  `comprador_nome` varchar(255) DEFAULT NULL,
  `comprador_cpf` varchar(20) DEFAULT NULL,
  `comprador_telefone` varchar(20) DEFAULT NULL,
  `transacao_id` varchar(255) DEFAULT NULL,
  `metodo_pagamento` varchar(50) DEFAULT NULL,
  `checkout_session_uuid` varchar(255) DEFAULT NULL COMMENT 'UUID para agrupar vendas de um mesmo checkout (principal + order bumps)',
  `email_entrega_enviado` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0 = Não enviado, 1 = Enviado',
  `utm_source` varchar(255) DEFAULT NULL,
  `utm_campaign` varchar(255) DEFAULT NULL,
  `utm_medium` varchar(255) DEFAULT NULL,
  `utm_content` varchar(255) DEFAULT NULL,
  `utm_term` varchar(255) DEFAULT NULL,
  `src` varchar(255) DEFAULT NULL,
  `sck` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `webhooks`
--

CREATE TABLE `webhooks` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL COMMENT 'ID do infoprodutor dono do webhook',
  `produto_id` int(11) DEFAULT NULL COMMENT 'ID do produto específico que dispara o webhook (NULL para todos os produtos do infoprodutor)',
  `url` varchar(2048) NOT NULL COMMENT 'URL para onde o webhook será enviado',
  `event_approved` tinyint(1) NOT NULL DEFAULT 0,
  `event_pending` tinyint(1) NOT NULL DEFAULT 0,
  `event_rejected` tinyint(1) NOT NULL DEFAULT 0,
  `event_refunded` tinyint(1) NOT NULL DEFAULT 0,
  `event_charged_back` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `alunos_acessos`
--
ALTER TABLE `alunos_acessos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `aluno_produto_unico` (`aluno_email`,`produto_id`),
  ADD KEY `idx_produto_id` (`produto_id`),
  ADD KEY `idx_aluno_email` (`aluno_email`);

--
-- Índices de tabela `aluno_progresso`
--
ALTER TABLE `aluno_progresso`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `aluno_aula_unico` (`aluno_email`,`aula_id`),
  ADD KEY `idx_aula_id` (`aula_id`);

--
-- Índices de tabela `aulas`
--
ALTER TABLE `aulas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_modulo_id` (`modulo_id`);

--
-- Índices de tabela `aula_arquivos`
--
ALTER TABLE `aula_arquivos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_aula_arquivos_aula` (`aula_id`);

--
-- Índices de tabela `cloned_sites`
--
ALTER TABLE `cloned_sites`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cloned_sites_usuario` (`usuario_id`);

--
-- Índices de tabela `cloned_site_settings`
--
ALTER TABLE `cloned_site_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_cloned_site_settings_unique` (`cloned_site_id`),
  ADD KEY `fk_cloned_site_settings_site` (`cloned_site_id`);

--
-- Índices de tabela `configuracoes`
--
ALTER TABLE `configuracoes`
  ADD PRIMARY KEY (`chave`);

--
-- Índices de tabela `cursos`
--
ALTER TABLE `cursos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_produto_id_cursos` (`produto_id`);

--
-- Índices de tabela `modulos`
--
ALTER TABLE `modulos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_curso_id` (`curso_id`);

--
-- Índices de tabela `notificacoes`
--
ALTER TABLE `notificacoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario_id_notificacoes` (`usuario_id`),
  ADD KEY `idx_lida_data_notificacao` (`lida`,`data_notificacao`),
  ADD KEY `fk_notificacoes_venda` (`venda_id_fk`);

--
-- Índices de tabela `order_bumps`
--
ALTER TABLE `order_bumps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_main_product_id` (`main_product_id`),
  ADD KEY `fk_order_bumps_offer_product` (`offer_product_id`);

--
-- Índices de tabela `product_exclusive_offers`
--
ALTER TABLE `product_exclusive_offers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_unique_product_offer` (`source_product_id`,`offer_product_id`),
  ADD KEY `fk_offer_source_product` (`source_product_id`),
  ADD KEY `fk_offer_target_product` (`offer_product_id`);

--
-- Índices de tabela `produtos`
--
ALTER TABLE `produtos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario_id` (`usuario_id`);

--
-- Índices de tabela `mentalpag_tracking_events`
--
ALTER TABLE `mentalpag_tracking_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_tracking_events_product` (`tracking_product_id`),
  ADD KEY `idx_session_id` (`session_id`),
  ADD KEY `idx_event_type` (`event_type`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Índices de tabela `mentalpag_tracking_products`
--
ALTER TABLE `mentalpag_tracking_products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_unique_tracking_id` (`tracking_id`),
  ADD UNIQUE KEY `idx_unique_usuario_produto_rastreado` (`usuario_id`,`produto_id`),
  ADD KEY `fk_tracking_products_usuario` (`usuario_id`),
  ADD KEY `fk_tracking_products_produto` (`produto_id`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario` (`usuario`);

--
-- Índices de tabela `utmfy_integrations`
--
ALTER TABLE `utmfy_integrations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_utmfy_integrations_usuario` (`usuario_id`),
  ADD KEY `fk_utmfy_integrations_produto` (`product_id`);

--
-- Índices de tabela `vendas`
--
ALTER TABLE `vendas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_produto_id_vendas` (`produto_id`),
  ADD KEY `idx_checkout_session_uuid` (`checkout_session_uuid`);

--
-- Índices de tabela `webhooks`
--
ALTER TABLE `webhooks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_webhooks_usuario` (`usuario_id`),
  ADD KEY `fk_webhooks_produto` (`produto_id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `alunos_acessos`
--
ALTER TABLE `alunos_acessos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de tabela `aluno_progresso`
--
ALTER TABLE `aluno_progresso`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de tabela `aulas`
--
ALTER TABLE `aulas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `aula_arquivos`
--
ALTER TABLE `aula_arquivos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `cloned_sites`
--
ALTER TABLE `cloned_sites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de tabela `cloned_site_settings`
--
ALTER TABLE `cloned_site_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT de tabela `cursos`
--
ALTER TABLE `cursos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de tabela `modulos`
--
ALTER TABLE `modulos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de tabela `notificacoes`
--
ALTER TABLE `notificacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=245;

--
-- AUTO_INCREMENT de tabela `order_bumps`
--
ALTER TABLE `order_bumps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=104;

--
-- AUTO_INCREMENT de tabela `product_exclusive_offers`
--
ALTER TABLE `product_exclusive_offers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `produtos`
--
ALTER TABLE `produtos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT de tabela `mentalpag_tracking_events`
--
ALTER TABLE `mentalpag_tracking_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=296;

--
-- AUTO_INCREMENT de tabela `mentalpag_tracking_products`
--
ALTER TABLE `mentalpag_tracking_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de tabela `utmfy_integrations`
--
ALTER TABLE `utmfy_integrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de tabela `vendas`
--
ALTER TABLE `vendas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=238;

--
-- AUTO_INCREMENT de tabela `webhooks`
--
ALTER TABLE `webhooks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `alunos_acessos`
--
ALTER TABLE `alunos_acessos`
  ADD CONSTRAINT `fk_alunos_acessos_produto` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `aluno_progresso`
--
ALTER TABLE `aluno_progresso`
  ADD CONSTRAINT `fk_aluno_progresso_aula` FOREIGN KEY (`aula_id`) REFERENCES `aulas` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `aulas`
--
ALTER TABLE `aulas`
  ADD CONSTRAINT `fk_aulas_modulo` FOREIGN KEY (`modulo_id`) REFERENCES `modulos` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `aula_arquivos`
--
ALTER TABLE `aula_arquivos`
  ADD CONSTRAINT `fk_aula_arquivos_aula` FOREIGN KEY (`aula_id`) REFERENCES `aulas` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `cloned_sites`
--
ALTER TABLE `cloned_sites`
  ADD CONSTRAINT `fk_cloned_sites_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `cloned_site_settings`
--
ALTER TABLE `cloned_site_settings`
  ADD CONSTRAINT `fk_cloned_site_settings_site` FOREIGN KEY (`cloned_site_id`) REFERENCES `cloned_sites` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `cursos`
--
ALTER TABLE `cursos`
  ADD CONSTRAINT `fk_cursos_produto` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `modulos`
--
ALTER TABLE `modulos`
  ADD CONSTRAINT `fk_modulos_curso` FOREIGN KEY (`curso_id`) REFERENCES `cursos` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `notificacoes`
--
ALTER TABLE `notificacoes`
  ADD CONSTRAINT `fk_notificacoes_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notificacoes_venda` FOREIGN KEY (`venda_id_fk`) REFERENCES `vendas` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `order_bumps`
--
ALTER TABLE `order_bumps`
  ADD CONSTRAINT `fk_order_bumps_main_product` FOREIGN KEY (`main_product_id`) REFERENCES `produtos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_order_bumps_offer_product` FOREIGN KEY (`offer_product_id`) REFERENCES `produtos` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `product_exclusive_offers`
--
ALTER TABLE `product_exclusive_offers`
  ADD CONSTRAINT `fk_offer_source_product` FOREIGN KEY (`source_product_id`) REFERENCES `produtos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_offer_target_product` FOREIGN KEY (`offer_product_id`) REFERENCES `produtos` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `produtos`
--
ALTER TABLE `produtos`
  ADD CONSTRAINT `fk_produtos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `mentalpag_tracking_events`
--
ALTER TABLE `mentalpag_tracking_events`
  ADD CONSTRAINT `fk_tracking_events_product` FOREIGN KEY (`tracking_product_id`) REFERENCES `mentalpag_tracking_products` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `mentalpag_tracking_products`
--
ALTER TABLE `mentalpag_tracking_products`
  ADD CONSTRAINT `fk_tracking_products_produto` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tracking_products_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `utmfy_integrations`
--
ALTER TABLE `utmfy_integrations`
  ADD CONSTRAINT `fk_utmfy_integrations_produto` FOREIGN KEY (`product_id`) REFERENCES `produtos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_utmfy_integrations_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `vendas`
--
ALTER TABLE `vendas`
  ADD CONSTRAINT `fk_vendas_produto` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `webhooks`
--
ALTER TABLE `webhooks`
  ADD CONSTRAINT `fk_webhooks_produto` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_webhooks_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
