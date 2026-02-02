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
$servi�o = null;
$curso = null;
$modulos_com_aulas = [];
$upload_dir = 'uploads/';
$aula_files_dir = 'uploads/aula_files/';

// Garante que o diretório de arquivos de aula exista
if (!is_dir($aula_files_dir)) {
    mkdir($aula_files_dir, 0755, true);
}


// 1. Validar e buscar o servi�o_id
if (!isset($_GET['servi�o_id']) || !is_numeric($_GET['servi�o_id'])) {
    header("Location: index.php?pagina=area_membros");
    exit;
}
$servi�o_id = (int)$_GET['servi�o_id'];

try {
    // 2. Buscar o servi�o e verificar se é do tipo 'area_membros' E pertence ao usuário logado
    $stmt_servi�o = $pdo->prepare("SELECT * FROM servi�os WHERE id = ? AND tipo_entrega = 'area_membros' AND usuario_id = ?");
    $stmt_servi�o->execute([$servi�o_id, $usuario_id_logado]);
    $servi�o = $stmt_servi�o->fetch(PDO::FETCH_ASSOC);

    if (!$servi�o) {
        // Se o servi�o não for encontrado ou não pertencer ao usuário, redireciona
        $_SESSION['flash_message'] = "<div class='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4' role='alert'>Servi�o não encontrado ou você não tem permissão para acessá-lo.</div>";
        header("Location: index.php?pagina=area_membros");
        exit;
    }

    // 3. Sincronizar com a tabela 'cursos'
    $stmt_curso = $pdo->prepare("SELECT * FROM cursos WHERE servi�o_id = ?");
    $stmt_curso->execute([$servi�o_id]);
    $curso = $stmt_curso->fetch(PDO::FETCH_ASSOC);

    if (!$curso) {
        // Se o curso não existe, cria um novo
        $stmt_insert_curso = $pdo->prepare("INSERT INTO cursos (servi�o_id, titulo, descricao, imagem_url) VALUES (?, ?, ?, ?)");
        $stmt_insert_curso->execute([$servi�o_id, $servi�o['nome'], $servi�o['descricao'], $servi�o['foto'] ? 'uploads/' . $servi�o['foto'] : null]);
        
        // Busca o curso recém-criado
        $stmt_curso->execute([$servi�o_id]);
        $curso = $stmt_curso->fetch(PDO::FETCH_ASSOC);
    }
    $curso_id = $curso['id'];

    // 4. Lógica de manipulação de dados (POST requests)
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $should_redirect = false; // Flag para controlar o redirecionamento

        // Função auxiliar para upload de arquivos
        function handle_file_upload($file_key, $target_dir, $current_file_path = null) {
            if (isset($_FILES[$file_key]) && $_FILES[$file_key]['error'] === UPLOAD_ERR_OK) {
                $file_tmp_path = $_FILES[$file_key]['tmp_name'];
                $file_name = $_FILES[$file_key]['name'];
                $file_extension = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
                $new_file_name = uniqid($file_key . '_', true) . '.' . $file_extension;
                $dest_path = $target_dir . $new_file_name;
                
                if (move_uploaded_file($file_tmp_path, $dest_path)) {
                    // Deleta o arquivo antigo se existir, mas apenas após o sucesso do novo upload
                    if ($current_file_path && file_exists($current_file_path) && strpos($current_file_path, 'uploads/') === 0) {
                        unlink($current_file_path);
                    }
                    return $dest_path;
                }
            }
            return null; // Retorna null se não houver upload ou falhar
        }

        // Salvar Banner do Curso
        if (isset($_POST['salvar_banner_curso'])) {
            $should_redirect = true;
            $novo_banner_path = handle_file_upload('banner_curso', $upload_dir, $curso['banner_url']);
            if ($novo_banner_path) {
                $stmt = $pdo->prepare("UPDATE cursos SET banner_url = ? WHERE id = ?");
                $stmt->execute([$novo_banner_path, $curso_id]);
                $mensagem = "<div class='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded' role='alert'>Banner do curso atualizado!</div>";
            } else if (!empty($_POST['remove_banner'])) { // Lógica para remover banner
                if ($curso['banner_url'] && file_exists($curso['banner_url']) && strpos($curso['banner_url'], 'uploads/') === 0) {
                    unlink($curso['banner_url']);
                }
                $stmt = $pdo->prepare("UPDATE cursos SET banner_url = NULL WHERE id = ?");
                $stmt->execute([$curso_id]);
                $mensagem = "<div class='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded' role='alert'>Banner do curso removido!</div>";
            } else {
                 // Diagnóstico de erro de upload
                 $error_code = $_FILES['banner_curso']['error'] ?? UPLOAD_ERR_NO_FILE;
                 $error_msg = "Nenhuma imagem de banner enviada ou selecionada para remover.";
                 
                 if ($error_code === UPLOAD_ERR_OK) {
                     // Se o erro é OK mas handle_file_upload retornou null, falhou no move_uploaded_file
                     $error_msg = "Falha ao salvar o arquivo. Verifique as permissões da pasta uploads.";
                 } elseif ($error_code !== UPLOAD_ERR_NO_FILE) {
                     switch ($error_code) {
                         case UPLOAD_ERR_INI_SIZE:
                             $error_msg = "O arquivo excede o tamanho máximo permitido pelo servidor (upload_max_filesize).";
                             break;
                         case UPLOAD_ERR_FORM_SIZE:
                             $error_msg = "O arquivo excede o tamanho máximo permitido pelo formulário.";
                             break;
                         case UPLOAD_ERR_PARTIAL:
                             $error_msg = "O upload do arquivo foi interrompido.";
                             break;
                         case UPLOAD_ERR_NO_TMP_DIR:
                             $error_msg = "Pasta temporária ausente no servidor.";
                             break;
                         case UPLOAD_ERR_CANT_WRITE:
                             $error_msg = "Falha ao escrever o arquivo no disco.";
                             break;
                         case UPLOAD_ERR_EXTENSION:
                             $error_msg = "Uma extensão do PHP interrompeu o upload.";
                             break;
                         default:
                             $error_msg = "Erro desconhecido no upload (Código: $error_code).";
                     }
                 }
                 
                 $mensagem = "<div class='bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded' role='alert'>$error_msg</div>";
                 // Não redirecionar se for erro de upload (exceto se for apenas "nenhum arquivo" e o usuário esperava algo, mas nesse caso a msg amarela é informativa)
                 // Se o usuário clicou em salvar sem selecionar nada, deve ver a msg amarela.
            }
        }

        // Adicionar Módulo
        if (isset($_POST['adicionar_modulo'])) {
            $should_redirect = true;
            $titulo_modulo = trim($_POST['titulo_modulo']);
            $release_days_modulo = (int)($_POST['release_days_modulo'] ?? 0); 
            if (!empty($titulo_modulo)) {
                $stmt = $pdo->prepare("INSERT INTO modulos (curso_id, titulo, release_days) VALUES (?, ?, ?)"); 
                $stmt->execute([$curso_id, $titulo_modulo, $release_days_modulo]); 
                $mensagem = "<div class='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded' role='alert'>Módulo adicionado!</div>";
            } else {
                $mensagem = "<div class='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded' role='alert'>O título do módulo não pode estar vazio.</div>";
            }
        }
        
        // Editar Módulo (Título, Capa e Release Days)
        if (isset($_POST['editar_modulo'])) {
            $should_redirect = true;
            $modulo_id_edit = $_POST['modulo_id'];
            $titulo_modulo_edit = trim($_POST['titulo_modulo']);
            $release_days_edit = (int)($_POST['release_days_modulo'] ?? 0); 

            // Busca dados atuais do módulo para pegar o caminho da imagem antiga
            $stmt_old_mod = $pdo->prepare("SELECT imagem_capa_url FROM modulos WHERE id = ? AND curso_id = ?");
            $stmt_old_mod->execute([$modulo_id_edit, $curso_id]);
            $old_module = $stmt_old_mod->fetch(PDO::FETCH_ASSOC);

            if ($old_module) {
                $nova_imagem_path = handle_file_upload('imagem_capa_modulo', $upload_dir, $old_module['imagem_capa_url']);
                
                if ($nova_imagem_path) { // Se uma nova imagem foi enviada
                    $stmt = $pdo->prepare("UPDATE modulos SET titulo = ?, imagem_capa_url = ?, release_days = ? WHERE id = ? AND curso_id = ?"); 
                    $stmt->execute([$titulo_modulo_edit, $nova_imagem_path, $release_days_edit, $modulo_id_edit, $curso_id]); 
                    $mensagem = "<div class='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded' role='alert'>Módulo atualizado!</div>";
                } else if (!empty($_POST['remove_imagem_capa_modulo'])) { // Lógica para remover a imagem de capa
                    if ($old_module['imagem_capa_url'] && file_exists($old_module['imagem_capa_url']) && strpos($old_module['imagem_capa_url'], 'uploads/') === 0) {
                        unlink($old_module['imagem_capa_url']);
                    }
                    $stmt = $pdo->prepare("UPDATE modulos SET titulo = ?, imagem_capa_url = NULL, release_days = ? WHERE id = ? AND curso_id = ?"); 
                    $stmt->execute([$titulo_modulo_edit, $release_days_edit, $modulo_id_edit, $curso_id]); 
                    $mensagem = "<div class='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded' role='alert'>Módulo e imagem de capa atualizados!</div>";
                } else { // Se nenhuma imagem nova foi enviada e não foi pedido para remover, atualiza apenas o título
                    $stmt = $pdo->prepare("UPDATE modulos SET titulo = ?, release_days = ? WHERE id = ? AND curso_id = ?"); 
                    $stmt->execute([$titulo_modulo_edit, $release_days_edit, $modulo_id_edit, $curso_id]); 
                     $mensagem = "<div class='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded' role='alert'>Título do módulo atualizado!</div>";
                }
            } else {
                 $mensagem = "<div class='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded' role='alert'>Módulo não encontrado para edição.</div>";
            }
        }

        // Adicionar Aula
        if (isset($_POST['adicionar_aula'])) {
            $should_redirect = true;
            $modulo_id = $_POST['modulo_id'];
            $titulo_aula = trim($_POST['titulo_aula']);
            $url_video = trim($_POST['url_video']); // Pode ser vazio
            $descricao_aula = trim($_POST['descricao_aula']);
            $release_days_aula = (int)($_POST['release_days_aula'] ?? 0);
            $tipo_conteudo = $_POST['tipo_conteudo'] ?? 'video'; // 'video', 'files', 'mixed'

            // Verifica se o módulo realmente pertence a este curso
            $stmt_check_modulo = $pdo->prepare("SELECT id FROM modulos WHERE id = ? AND curso_id = ?");
            $stmt_check_modulo->execute([$modulo_id, $curso_id]);
            if ($stmt_check_modulo->rowCount() === 0) {
                 $mensagem = "<div class='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded' role='alert'>Módulo inválido para este curso.</div>";
            } elseif (empty($titulo_aula)) {
                $mensagem = "<div class='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded' role='alert'>O título da aula é obrigatório.</div>";
            } else {
                // Validações de conteúdo baseadas no tipo
                // NOTE: 'aula_files' will have name[0] as empty if no file is selected.
                $has_new_files = isset($_FILES['aula_files']) && !empty($_FILES['aula_files']['name'][0]);

                if ($tipo_conteudo === 'video' && empty($url_video)) {
                    $mensagem = "<div class='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded' role='alert'>Para aulas de vídeo, a URL do vídeo é obrigatória.</div>";
                } elseif ($tipo_conteudo === 'files' && !$has_new_files) {
                    $mensagem = "<div class='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded' role='alert'>Para aulas de arquivos, pelo menos um arquivo é obrigatório.</div>";
                } elseif ($tipo_conteudo === 'mixed' && empty($url_video) && !$has_new_files) {
                    $mensagem = "<div class='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded' role='alert'>Para aulas mistas, a URL do vídeo e pelo menos um arquivo são obrigatórios.</div>";
                } else {
                    $stmt = $pdo->prepare("INSERT INTO aulas (modulo_id, titulo, url_video, descricao, release_days, tipo_conteudo) VALUES (?, ?, ?, ?, ?, ?)"); 
                    $stmt->execute([$modulo_id, $titulo_aula, $url_video, $descricao_aula, $release_days_aula, $tipo_conteudo]); 
                    $nova_aula_id = $pdo->lastInsertId();

                    // Upload de múltiplos arquivos para a aula
                    if ($has_new_files) {
                        foreach ($_FILES['aula_files']['name'] as $key => $name) {
                            if ($_FILES['aula_files']['error'][$key] === UPLOAD_ERR_OK) {
                                $tmp_name = $_FILES['aula_files']['tmp_name'][$key];
                                $file_extension = strtolower(pathinfo($name, PATHINFO_EXTENSION));
                                $new_file_name = uniqid('aula_file_', true) . '.' . $file_extension;
                                $dest_path = $aula_files_dir . $new_file_name;

                                if (move_uploaded_file($tmp_name, $dest_path)) {
                                    $stmt_insert_file = $pdo->prepare("INSERT INTO aula_arquivos (aula_id, nome_original, nome_salvo, caminho_arquivo, tipo_mime, tamanho_bytes) VALUES (?, ?, ?, ?, ?, ?)");
                                    $stmt_insert_file->execute([
                                        $nova_aula_id,
                                        $name,
                                        $new_file_name,
                                        $dest_path,
                                        $_FILES['aula_files']['type'][$key],
                                        $_FILES['aula_files']['size'][$key]
                                    ]);
                                }
                            }
                        }
                    }
                    $mensagem = "<div class='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded' role='alert'>Aula adicionada!</div>";
                }
            }
        }
        
        // Editar Aula
        if (isset($_POST['editar_aula_form'])) {
            $should_redirect = true;
            $aula_id_edit = $_POST['aula_id'];
            $titulo_aula = trim($_POST['titulo_aula']);
            $url_video = trim($_POST['url_video']);
            $descricao_aula = trim($_POST['descricao_aula']);
            $release_days_aula = (int)($_POST['release_days_aula'] ?? 0);
            $tipo_conteudo = $_POST['tipo_conteudo'] ?? 'video';

            // Valida se a aula pertence a um módulo deste curso
            $stmt_check_aula = $pdo->prepare("SELECT a.id FROM aulas a JOIN modulos m ON a.modulo_id = m.id WHERE a.id = ? AND m.curso_id = ?");
            $stmt_check_aula->execute([$aula_id_edit, $curso_id]);

            if ($stmt_check_aula->rowCount() === 0) {
                 $mensagem = "<div class='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded' role='alert'>Aula não encontrada ou não pertence a este curso.</div>";
            } elseif (empty($titulo_aula)) {
                $mensagem = "<div class='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded' role='alert'>O título da aula é obrigatório.</div>";
            } else {
                // Validações de conteúdo baseadas no tipo
                $has_new_files = isset($_FILES['aula_files']) && !empty($_FILES['aula_files']['name'][0]);
                $has_existing_files_to_keep = !empty($_POST['existing_files']);

                if ($tipo_conteudo === 'video' && empty($url_video)) {
                    $mensagem = "<div class='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded' role='alert'>Para aulas de vídeo, a URL do vídeo é obrigatória.</div>";
                } elseif ($tipo_conteudo === 'files' && !$has_new_files && !$has_existing_files_to_keep) {
                    // Se o tipo é 'files' e não há arquivos novos e nem existentes marcados, erro.
                    $mensagem = "<div class='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded' role='alert'>Para aulas de arquivos, pelo menos um arquivo é obrigatório.</div>";
                } elseif ($tipo_conteudo === 'mixed' && empty($url_video) && !$has_new_files && !$has_existing_files_to_keep) {
                    // Se o tipo é 'mixed' e não há vídeo, nem arquivos novos, nem existentes.
                    $mensagem = "<div class='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded' role='alert'>Para aulas mistas, a URL do vídeo e pelo menos um arquivo são obrigatórios.</div>";
                } else {
                    $stmt = $pdo->prepare("UPDATE aulas SET titulo = ?, url_video = ?, descricao = ?, release_days = ?, tipo_conteudo = ? WHERE id = ?");
                    $stmt->execute([$titulo_aula, $url_video, $descricao_aula, $release_days_aula, $tipo_conteudo, $aula_id_edit]);

                    // Gerenciar arquivos existentes (deletar)
                    $existing_files_to_keep = $_POST['existing_files'] ?? [];
                    // Busca todos os arquivos da aula
                    $stmt_all_files = $pdo->prepare("SELECT id, caminho_arquivo FROM aula_arquivos WHERE aula_id = ?");
                    $stmt_all_files->execute([$aula_id_edit]);
                    $all_files = $stmt_all_files->fetchAll(PDO::FETCH_ASSOC);

                    foreach ($all_files as $file) {
                        if (!in_array($file['id'], $existing_files_to_keep)) {
                            // Deleta o arquivo do sistema de arquivos
                            if (file_exists($file['caminho_arquivo'])) {
                                unlink($file['caminho_arquivo']);
                            }
                            // Deleta o registro do banco de dados
                            $stmt_delete_file = $pdo->prepare("DELETE FROM aula_arquivos WHERE id = ?");
                            $stmt_delete_file->execute([$file['id']]);
                        }
                    }

                    // Upload de novos arquivos
                    if ($has_new_files) {
                        foreach ($_FILES['aula_files']['name'] as $key => $name) {
                            if ($_FILES['aula_files']['error'][$key] === UPLOAD_ERR_OK) {
                                $tmp_name = $_FILES['aula_files']['tmp_name'][$key];
                                $file_extension = strtolower(pathinfo($name, PATHINFO_EXTENSION));
                                $new_file_name = uniqid('aula_file_', true) . '.' . $file_extension;
                                $dest_path = $aula_files_dir . $new_file_name;

                                if (move_uploaded_file($tmp_name, $dest_path)) {
                                    $stmt_insert_file = $pdo->prepare("INSERT INTO aula_arquivos (aula_id, nome_original, nome_salvo, caminho_arquivo, tipo_mime, tamanho_bytes) VALUES (?, ?, ?, ?, ?, ?)");
                                    $stmt_insert_file->execute([
                                        $aula_id_edit,
                                        $name,
                                        $new_file_name,
                                        $dest_path,
                                        $_FILES['aula_files']['type'][$key],
                                        $_FILES['aula_files']['size'][$key]
                                    ]);
                                }
                            }
                        }
                    }
                    $mensagem = "<div class='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded' role='alert'>Aula atualizada!</div>";
                }
            }
        }

        // Deletar Módulo
        if (isset($_POST['deletar_modulo'])) {
            $should_redirect = true;
            $modulo_id_del = $_POST['modulo_id'];

            // Primeiro, verifica se o módulo pertence a este curso antes de deletar
            $stmt_check_modulo = $pdo->prepare("SELECT imagem_capa_url FROM modulos WHERE id = ? AND curso_id = ?");
            $stmt_check_modulo->execute([$modulo_id_del, $curso_id]);
            $module_to_delete = $stmt_check_modulo->fetch(PDO::FETCH_ASSOC);

            if ($module_to_delete) {
                // Deleta a imagem de capa se existir
                if ($module_to_delete['imagem_capa_url'] && file_exists($module_to_delete['imagem_capa_url']) && strpos($module_to_delete['imagem_capa_url'], 'uploads/') === 0) {
                    unlink($module_to_delete['imagem_capa_url']);
                }
                
                // Antes de deletar o módulo, precisamos deletar os arquivos das aulas para evitar órfãos
                $stmt_get_aula_files = $pdo->prepare("
                    SELECT af.caminho_arquivo 
                    FROM aula_arquivos af
                    JOIN aulas a ON af.aula_id = a.id
                    WHERE a.modulo_id = ?
                ");
                $stmt_get_aula_files->execute([$modulo_id_del]);
                $files_to_delete = $stmt_get_aula_files->fetchAll(PDO::FETCH_COLUMN);

                foreach ($files_to_delete as $file_path) {
                    if (file_exists($file_path)) {
                        unlink($file_path);
                    }
                }

                // Deleta o módulo (e suas aulas em cascata devido à FOREIGN KEY ON DELETE CASCADE)
                $stmt = $pdo->prepare("DELETE FROM modulos WHERE id = ? AND curso_id = ?");
                $stmt->execute([$modulo_id_del, $curso_id]);
                $mensagem = "<div class='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded' role='alert'>Módulo e suas aulas foram deletados.</div>";
            } else {
                 $mensagem = "<div class='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded' role='alert'>Módulo não encontrado ou não pertence a este curso.</div>";
            }
        }
        
        // Deletar Aula
        if (isset($_POST['deletar_aula'])) {
            $should_redirect = true;
            $aula_id_del = $_POST['aula_id'];

            // Verifica se a aula pertence a um módulo deste curso
            $stmt_check_aula = $pdo->prepare("
                SELECT a.id, af.caminho_arquivo 
                FROM aulas a 
                JOIN modulos m ON a.modulo_id = m.id 
                LEFT JOIN aula_arquivos af ON a.id = af.aula_id
                WHERE a.id = ? AND m.curso_id = ?
            ");
            $stmt_check_aula->execute([$aula_id_del, $curso_id]);
            $aula_files_to_delete = $stmt_check_aula->fetchAll(PDO::FETCH_ASSOC);

            if (!empty($aula_files_to_delete)) {
                foreach ($aula_files_to_delete as $file_info) {
                    if ($file_info['caminho_arquivo'] && file_exists($file_info['caminho_arquivo'])) {
                        unlink($file_info['caminho_arquivo']);
                    }
                }
                // Deleta a aula (e seus arquivos em cascata se a FK estiver configurada)
                $stmt = $pdo->prepare("DELETE FROM aulas WHERE id = ?");
                $stmt->execute([$aula_id_del]);
                $mensagem = "<div class='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded' role='alert'>Aula deletada.</div>";
            } else {
                $mensagem = "<div class='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded' role='alert'>Aula não encontrada ou não pertence a este curso.</div>";
            }
        }
        
        // CORREÇÃO: Lógica de redirecionamento centralizada
        if ($should_redirect) {
            $_SESSION['flash_message'] = $mensagem;
            // AQUI ESTÁ A CORREÇÃO: Garantir que o redirecionamento inclua a página correta no index
            header("Location: index.php?pagina=gerenciar_curso&servi�o_id=" . $servi�o_id);
            exit;
        }
    }
    
    // Pega a mensagem da sessão, se houver, e depois limpa
    if (isset($_SESSION['flash_message'])) {
        $mensagem = $_SESSION['flash_message'];
        unset($_SESSION['flash_message']);
    }

    // 5. Buscar todos os módulos e aulas para exibição
    // NEW: Include release_days in SELECT for modulos
    $stmt_modulos = $pdo->prepare("SELECT id, curso_id, titulo, imagem_capa_url, ordem, release_days FROM modulos WHERE curso_id = ? ORDER BY ordem ASC, id ASC");
    $stmt_modulos->execute([$curso_id]);
    $modulos = $stmt_modulos->fetchAll(PDO::FETCH_ASSOC);

    foreach ($modulos as $modulo) {
        // NEW: Include release_days and tipo_conteudo in SELECT for aulas
        $stmt_aulas = $pdo->prepare("SELECT id, modulo_id, titulo, url_video, descricao, ordem, release_days, tipo_conteudo FROM aulas WHERE modulo_id = ? ORDER BY ordem ASC, id ASC");
        $stmt_aulas->execute([$modulo['id']]);
        $aulas = $stmt_aulas->fetchAll(PDO::FETCH_ASSOC);

        // Fetch files for each lesson
        foreach ($aulas as &$aula) {
            $stmt_files = $pdo->prepare("SELECT id, nome_original, caminho_arquivo FROM aula_arquivos WHERE aula_id = ? ORDER BY ordem ASC, id ASC");
            $stmt_files->execute([$aula['id']]);
            $aula['files'] = $stmt_files->fetchAll(PDO::FETCH_ASSOC);
        }
        unset($aula); // Break the reference

        $modulos_com_aulas[] = [
            'modulo' => $modulo,
            'aulas' => $aulas
        ];
    }

} catch (PDOException $e) {
    $mensagem = "<div class='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded' role='alert'>Erro de banco de dados: " . htmlspecialchars($e->getMessage()) . "</div>";
}

?>

<div class="container mx-auto">
    <div class="flex items-center mb-6">
        <a href="index.php?pagina=area_membros" class="text-emerald-600 hover:text-emerald-800 mr-4">
            <i data-lucide="arrow-left-circle" class="w-8 h-8"></i>
        </a>
        <div>
            <h1 class="text-3xl font-bold text-gray-800">Gerenciar Conteúdo</h1>
            <p class="text-gray-600">Curso: <?php echo htmlspecialchars($curso['titulo'] ?? 'Carregando...'); ?></p>
        </div>
    </div>

    <?php if ($mensagem) echo "<div class='mb-6'>$mensagem</div>"; ?>

    <!-- Personalizar Aparência do Curso -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">Personalizar Aparência do Curso</h2>
        <form action="index.php?pagina=gerenciar_curso&servi�o_id=<?php echo $servi�o_id; ?>" method="post" enctype="multipart/form-data">
            <div class="mb-4">
                <label for="banner_curso" class="block text-gray-700 text-sm font-semibold mb-2">Banner do Topo</label>
                <?php if (!empty($curso['banner_url']) && file_exists($curso['banner_url'])): ?>
                    <div class="mb-2">
                        <img src="<?php echo htmlspecialchars($curso['banner_url']); ?>" alt="Banner atual" class="w-full h-48 object-cover rounded-lg border">
                        <label class="mt-2 flex items-center text-sm text-gray-600">
                            <input type="checkbox" name="remove_banner" value="1" class="h-4 w-4 mr-1 text-red-600 focus:ring-red-500 rounded"> Remover banner existente
                        </label>
                    </div>
                <?php endif; ?>
                <input type="file" id="banner_curso" name="banner_curso" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" accept="image/*">
                <p class="mt-1 text-xs text-gray-500">Recomendado: 1920x400px</p>
            </div>
            <button type="submit" name="salvar_banner_curso" class="bg-emerald-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-emerald-700 transition">Salvar Banner</button>
        </form>
    </div>

    <!-- Adicionar Novo Módulo -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">Adicionar Novo Módulo</h2>
        <form action="index.php?pagina=gerenciar_curso&servi�o_id=<?php echo $servi�o_id; ?>" method="post" class="space-y-4"> <!-- Changed to space-y-4 for vertical stacking -->
            <div>
                <label for="titulo_modulo_add" class="block text-gray-700 text-sm font-semibold mb-2">Título do Módulo</label>
                <input type="text" id="titulo_modulo_add" name="titulo_modulo" placeholder="Ex: Módulo 1 - Introdução" required class="form-input-style">
            </div>
            <!-- NEW: Release Days for Add Module -->
            <div>
                <label for="release_days_modulo_add" class="block text-gray-700 text-sm font-semibold mb-2">Liberar após (dias)</label>
                <input type="number" id="release_days_modulo_add" name="release_days_modulo" value="0" min="0" class="form-input-style" placeholder="0 = Liberação imediata">
                <p class="mt-1 text-xs text-gray-500">Defina quantos dias após a compra do curso este módulo será liberado para o aluno.</p>
            </div>
            <div class="flex justify-end">
                <button type="submit" name="adicionar_modulo" class="bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-700 transition duration-300 flex items-center space-x-2">
                    <i data-lucide="plus" class="w-5 h-5"></i>
                    <span>Adicionar Módulo</span>
                </button>
            </div>
        </form>
    </div>

    <!-- Listagem de Módulos e Aulas -->
    <div class="space-y-6">
        <?php if (empty($modulos_com_aulas)): ?>
            <div class="bg-white p-8 rounded-lg shadow-md text-center text-gray-500">
                <i data-lucide="folder-open" class="mx-auto w-16 h-16 text-gray-300"></i>
                <p class="mt-4">Nenhum módulo foi criado para este curso ainda.</p>
                <p>Use o formulário acima para começar.</p>
            </div>
        <?php else: ?>
            <?php foreach ($modulos_com_aulas as $item): ?>
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="bg-gray-50 p-4 flex justify-between items-center border-b">
                        <div class="flex items-center gap-4">
                            <?php if (!empty($item['modulo']['imagem_capa_url']) && file_exists($item['modulo']['imagem_capa_url'])): ?>
                                <img src="<?php echo htmlspecialchars($item['modulo']['imagem_capa_url']); ?>" alt="Capa do módulo" class="w-24 h-16 object-cover rounded-md border">
                            <?php else: ?>
                                <div class="w-24 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                                    <i data-lucide="image-off" class="w-8 h-8 text-gray-400"></i>
                                </div>
                            <?php endif; ?>
                            <h3 class="text-xl font-bold text-gray-800">
                                <?php echo htmlspecialchars($item['modulo']['titulo']); ?>
                                <?php if ($item['modulo']['release_days'] > 0): ?>
                                    <span class="ml-2 text-sm font-medium text-emerald-600">(Liberado em <?php echo $item['modulo']['release_days']; ?> dias)</span>
                                <?php endif; ?>
                            </h3>
                        </div>
                        <div class="flex items-center space-x-2">
                             <button class="add-lesson-btn text-sm bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition flex items-center space-x-1" data-modulo-id="<?php echo $item['modulo']['id']; ?>" data-modulo-titulo="<?php echo htmlspecialchars($item['modulo']['titulo']); ?>">
                                <i data-lucide="plus-circle" class="w-4 h-4"></i>
                                <span>Nova Aula</span>
                            </button>
                            <button class="edit-module-btn p-2 rounded-lg bg-yellow-400 text-yellow-900 hover:bg-yellow-500 transition"
                                data-modulo-id="<?php echo $item['modulo']['id']; ?>"
                                data-modulo-titulo="<?php echo htmlspecialchars($item['modulo']['titulo']); ?>"
                                data-imagem-url="<?php echo htmlspecialchars($item['modulo']['imagem_capa_url'] ?? ''); ?>"
                                data-release-days="<?php echo htmlspecialchars($item['modulo']['release_days']); ?>">
                                <i data-lucide="edit" class="w-5 h-5"></i>
                            </button>
                            <form action="index.php?pagina=gerenciar_curso&servi�o_id=<?php echo $servi�o_id; ?>" method="post" onsubmit="return confirm('Tem certeza que deseja deletar este módulo e todas as suas aulas?');">
                                <input type="hidden" name="modulo_id" value="<?php echo $item['modulo']['id']; ?>">
                                <button type="submit" name="deletar_modulo" class="text-white bg-red-500 p-2 rounded-lg hover:bg-red-600 transition">
                                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                    <div class="p-4">
                        <?php if (empty($item['aulas'])): ?>
                            <p class="text-gray-500 text-center py-4">Nenhuma aula neste módulo.</p>
                        <?php else: ?>
                            <ul class="space-y-3 sortable-aulas" data-modulo-id="<?php echo $item['modulo']['id']; ?>">
                                <?php foreach ($item['aulas'] as $aula): ?>
                                    <li class="flex justify-between items-center p-3 bg-gray-50 rounded-md border hover:bg-gray-100 aula-item" data-aula-id="<?php echo $aula['id']; ?>">
                                        <div class="flex items-center space-x-3 cursor-grab">
                                            <i data-lucide="grip-vertical" class="w-5 h-5 text-gray-400 flex-shrink-0"></i>
                                            <?php if ($aula['tipo_conteudo'] === 'video' || $aula['tipo_conteudo'] === 'mixed'): ?>
                                                <i data-lucide="play-circle" class="w-5 h-5 text-gray-500 flex-shrink-0"></i>
                                            <?php endif; ?>
                                            <?php if ($aula['tipo_conteudo'] === 'files' || $aula['tipo_conteudo'] === 'mixed'): ?>
                                                <i data-lucide="file-text" class="w-5 h-5 text-gray-500 flex-shrink-0"></i>
                                            <?php endif; ?>
                                            <span class="font-medium text-gray-700">
                                                <?php echo htmlspecialchars($aula['titulo']); ?>
                                                <?php if ($aula['release_days'] > 0): ?>
                                                    <span class="ml-2 text-sm font-medium text-emerald-500">(Liberada em <?php echo $aula['release_days']; ?> dias)</span>
                                                <?php endif; ?>
                                            </span>
                                        </div>
                                        <div class="flex items-center space-x-2 flex-shrink-0">
                                            <button class="edit-lesson-btn text-blue-500 hover:text-blue-700 p-1 rounded-full"
                                                data-aula-id="<?php echo $aula['id']; ?>"
                                                data-titulo="<?php echo htmlspecialchars($aula['titulo']); ?>"
                                                data-url-video="<?php echo htmlspecialchars($aula['url_video'] ?? ''); ?>"
                                                data-descricao="<?php echo htmlspecialchars($aula['descricao'] ?? ''); ?>"
                                                data-release-days="<?php echo htmlspecialchars($aula['release_days']); ?>"
                                                data-tipo-conteudo="<?php echo htmlspecialchars($aula['tipo_conteudo']); ?>"
                                                data-files='<?php echo json_encode($aula['files']); ?>'>
                                                <i data-lucide="edit" class="w-5 h-5"></i>
                                            </button>
                                            <form action="index.php?pagina=gerenciar_curso&servi�o_id=<?php echo $servi�o_id; ?>" method="post" onsubmit="return confirm('Tem certeza que deseja deletar esta aula?');" class="inline-block">
                                                <input type="hidden" name="aula_id" value="<?php echo $aula['id']; ?>">
                                                <button type="submit" name="deletar_aula" class="text-red-500 hover:text-red-700 p-1 rounded-full">
                                                    <i data-lucide="x-circle" class="w-5 h-5"></i>
                                                </button>
                                            </form>
                                        </div>
                                    </li>
                                <?php endforeach; ?>
                            </ul>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>

<!-- Modal para Adicionar Aula -->
<div id="add-lesson-modal" class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all opacity-0 scale-95" id="add-lesson-modal-content">
        <form action="index.php?pagina=gerenciar_curso&servi�o_id=<?php echo $servi�o_id; ?>" method="post" enctype="multipart/form-data">
            <div class="p-6 border-b"><h2 class="text-2xl font-bold text-gray-800">Adicionar Nova Aula em <span id="modal-modulo-titulo-add" class="text-emerald-600"></span></h2></div>
            <div class="p-6 space-y-4">
                <input type="hidden" name="modulo_id" id="modal-modulo-id-add">
                <div><label for="add_titulo_aula" class="block text-gray-700 text-sm font-semibold mb-2">Título da Aula</label><input type="text" id="add_titulo_aula" name="titulo_aula" required class="form-input-style" placeholder="Ex: Aula 1 - Bem-vindo ao curso"></div>
                
                <!-- Tipo de Conteúdo da Aula (Add) -->
                <div>
                    <label for="add_tipo_conteudo" class="block text-gray-700 text-sm font-semibold mb-2">Tipo de Conteúdo</label>
                    <select id="add_tipo_conteudo" name="tipo_conteudo" class="form-input-style">
                        <option value="video">Somente Vídeo</option>
                        <option value="files">Somente Arquivos</option>
                        <option value="mixed">Vídeo e Arquivos</option>
                    </select>
                </div>

                <!-- URL do Vídeo (Add) -->
                <div id="add-video-url-container">
                    <label for="add_url_video" class="block text-gray-700 text-sm font-semibold mb-2">URL do Vídeo (YouTube)</label>
                    <input type="url" id="add_url_video" name="url_video" class="form-input-style" placeholder="https://www.youtube.com/watch?v=...">
                </div>

                <!-- Upload de Arquivos (Add) -->
                <div id="add-files-upload-container">
                    <label for="add_aula_files" class="block text-gray-700 text-sm font-semibold mb-2">Upload de Arquivos</label>
                    <input type="file" id="add_aula_files" name="aula_files[]" multiple class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100">
                    <p class="mt-1 text-xs text-gray-500">Múltiplos arquivos (PDF, imagens, zip, etc.)</p>
                </div>

                <div><label for="add_descricao_aula" class="block text-gray-700 text-sm font-semibold mb-2">Descrição / Materiais</label><textarea id="add_descricao_aula" name="descricao_aula" rows="5" class="form-input-style" placeholder="Links, textos de apoio, etc."></textarea></div>
                <!-- Release Days for Add Lesson -->
                <div>
                    <label for="add_release_days_aula" class="block text-gray-700 text-sm font-semibold mb-2">Liberar após (dias)</label>
                    <input type="number" id="add_release_days_aula" name="release_days_aula" value="0" min="0" class="form-input-style" placeholder="0 = Liberação imediata">
                    <p class="mt-1 text-xs text-gray-500">Defina quantos dias após a compra do curso esta aula será liberada para o aluno.</p>
                </div>
            </div>
            <div class="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end items-center space-x-4">
                <button type="button" class="modal-cancel-btn bg-gray-200 text-gray-800 font-bold py-2 px-5 rounded-lg hover:bg-gray-300">Cancelar</button>
                <button type="submit" name="adicionar_aula" class="bg-green-500 text-white font-bold py-2 px-5 rounded-lg hover:bg-green-600">Salvar Aula</button>
            </div>
        </form>
    </div>
</div>

<!-- Modal para Editar Aula -->
<div id="edit-lesson-modal" class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all opacity-0 scale-95" id="edit-lesson-modal-content">
        <form action="index.php?pagina=gerenciar_curso&servi�o_id=<?php echo $servi�o_id; ?>" method="post" enctype="multipart/form-data">
            <div class="p-6 border-b"><h2 class="text-2xl font-bold text-gray-800">Editar Aula</h2></div>
            <div class="p-6 space-y-4">
                <input type="hidden" name="aula_id" id="edit_aula_id">
                <div><label for="edit_titulo_aula" class="block text-gray-700 text-sm font-semibold mb-2">Título da Aula</label><input type="text" id="edit_titulo_aula" name="titulo_aula" required class="form-input-style" placeholder="Ex: Aula 1 - Bem-vindo ao curso"></div>

                <!-- Tipo de Conteúdo da Aula (Edit) -->
                <div>
                    <label for="edit_tipo_conteudo" class="block text-gray-700 text-sm font-semibold mb-2">Tipo de Conteúdo</label>
                    <select id="edit_tipo_conteudo" name="tipo_conteudo" class="form-input-style">
                        <option value="video">Somente Vídeo</option>
                        <option value="files">Somente Arquivos</option>
                        <option value="mixed">Vídeo e Arquivos</option>
                    </select>
                </div>

                <!-- URL do Vídeo (Edit) -->
                <div id="edit-video-url-container">
                    <label for="edit_url_video" class="block text-gray-700 text-sm font-semibold mb-2">URL do Vídeo (YouTube)</label>
                    <input type="url" id="edit_url_video" name="url_video" class="form-input-style" placeholder="https://www.youtube.com/watch?v=...">
                </div>

                <!-- Arquivos Existentes (Edit) -->
                <div id="edit-existing-files-container" class="space-y-2">
                    <p class="block text-gray-700 text-sm font-semibold mb-2">Arquivos Atuais:</p>
                    <div id="existing-files-list">
                        <!-- Arquivos serão carregados aqui via JS -->
                    </div>
                </div>

                <!-- Upload de Novos Arquivos (Edit) -->
                <div id="edit-new-files-upload-container">
                    <label for="edit_aula_files" class="block text-gray-700 text-sm font-semibold mb-2">Upload de Novos Arquivos</label>
                    <input type="file" id="edit_aula_files" name="aula_files[]" multiple class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100">
                    <p class="mt-1 text-xs text-gray-500">Múltiplos arquivos (PDF, imagens, zip, etc.)</p>
                </div>

                <div><label for="edit_descricao_aula" class="block text-gray-700 text-sm font-semibold mb-2">Descrição / Materiais</label><textarea id="edit_descricao_aula" name="descricao_aula" rows="5" class="form-input-style" placeholder="Links, textos de apoio, etc."></textarea></div>
                <!-- Release Days for Edit Lesson -->
                <div>
                    <label for="edit_release_days_aula" class="block text-gray-700 text-sm font-semibold mb-2">Liberar após (dias)</label>
                    <input type="number" id="edit_release_days_aula" name="release_days_aula" value="0" min="0" class="form-input-style" placeholder="0 = Liberação imediata">
                    <p class="mt-1 text-xs text-gray-500">Defina quantos dias após a compra do curso esta aula será liberada para o aluno.</p>
                </div>
            </div>
            <div class="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end items-center space-x-4">
                <button type="button" class="modal-cancel-btn bg-gray-200 text-gray-800 font-bold py-2 px-5 rounded-lg hover:bg-gray-300">Cancelar</button>
                <button type="submit" name="editar_aula_form" class="bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700">Salvar Alterações</button>
            </div>
        </form>
    </div>
</div>

<!-- Modal para Editar Módulo -->
<div id="edit-module-modal" class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all opacity-0 scale-95" id="edit-module-modal-content">
        <form action="index.php?pagina=gerenciar_curso&servi�o_id=<?php echo $servi�o_id; ?>" method="post" enctype="multipart/form-data">
            <div class="p-6 border-b"><h2 class="text-2xl font-bold text-gray-800">Editar Módulo</h2></div>
            <div class="p-6 space-y-4">
                <input type="hidden" name="modulo_id" id="modal-modulo-id-edit">
                <div><label for="modal-titulo-modulo-edit" class="block text-gray-700 text-sm font-semibold mb-2">Título do Módulo</label><input type="text" id="modal-titulo-modulo-edit" name="titulo_modulo" required class="form-input-style"></div>
                <div>
                    <label for="imagem_capa_modulo" class="block text-gray-700 text-sm font-semibold mb-2">Imagem de Capa do Módulo</label>
                    <img id="modal-imagem-preview" src="" alt="Preview da imagem" class="w-48 h-auto object-cover rounded-lg border mb-2 hidden">
                    <input type="file" id="imagem_capa_modulo" name="imagem_capa_modulo" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" accept="image/*">
                    <label class="mt-2 flex items-center text-sm text-gray-600">
                        <input type="checkbox" name="remove_imagem_capa_modulo" value="1" id="remove_imagem_capa_modulo" class="h-4 w-4 mr-1 text-red-600 focus:ring-red-500 rounded"> Remover imagem de capa existente
                    </label>
                </div>
                <!-- Release Days for Edit Module -->
                <div>
                    <label for="modal-release-days-modulo-edit" class="block text-gray-700 text-sm font-semibold mb-2">Liberar após (dias)</label>
                    <input type="number" id="modal-release-days-modulo-edit" name="release_days_modulo" value="0" min="0" class="form-input-style" placeholder="0 = Liberação imediata">
                    <p class="mt-1 text-xs text-gray-500">Defina quantos dias após a compra do curso este módulo será liberado para o aluno.</p>
                </div>
            </div>
            <div class="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end items-center space-x-4">
                <button type="button" class="modal-cancel-btn bg-gray-200 text-gray-800 font-bold py-2 px-5 rounded-lg hover:bg-gray-300">Cancelar</button>
                <button type="submit" name="editar_modulo" class="bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700">Salvar Alterações</button>
            </div>
        </form>
    </div>
</div>

<style>
.form-input-style { @apply w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500; }
.sortable-ghost { opacity: 0.4; background: #c0d8ff; } /* Estilo para o item sendo arrastado */
</style>

<script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();

    const currentProductId = <?php echo $servi�o_id; ?>;

    // --- Lógica genérica para Modais ---
    function openModal(modal) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            const content = modal.querySelector('.transform');
            if (content) content.classList.remove('opacity-0', 'scale-95');
        }, 10);
    }

    function closeModal(modal) {
        const content = modal.querySelector('.transform');
        if (content) content.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
            const form = modal.querySelector('form');
            if (form) form.reset();
        }, 200);
    }

    document.querySelectorAll('.modal-cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn.closest('.fixed')));
    });

    document.querySelectorAll('.fixed[id$="-modal"]').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    });

    // --- Lógica para Modal de Adicionar Aula ---
    const addLessonModal = document.getElementById('add-lesson-modal');
    const addTipoConteudoSelect = document.getElementById('add_tipo_conteudo');
    const addVideoUrlContainer = document.getElementById('add-video-url-container');
    const addAulaFilesContainer = document.getElementById('add-files-upload-container');
    const addUrlVideoInput = document.getElementById('add_url_video');
    const addAulaFilesInput = document.getElementById('add_aula_files');

    function toggleAddLessonFields() {
        const selectedType = addTipoConteudoSelect.value;
        addUrlVideoInput.required = false;
        addAulaFilesInput.required = false;

        addVideoUrlContainer.style.display = 'none';
        addAulaFilesContainer.style.display = 'none';

        if (selectedType === 'video' || selectedType === 'mixed') {
            addVideoUrlContainer.style.display = 'block';
            addUrlVideoInput.required = true;
        }
        if (selectedType === 'files' || selectedType === 'mixed') {
            addAulaFilesContainer.style.display = 'block';
            addAulaFilesInput.required = true; // Always require new files for 'add' if type is files/mixed
        }
    }

    addTipoConteudoSelect.addEventListener('change', toggleAddLessonFields);


    document.querySelectorAll('.add-lesson-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.getElementById('modal-modulo-id-add').value = this.dataset.moduloId;
            document.getElementById('modal-modulo-titulo-add').textContent = this.dataset.moduloTitulo;
            document.getElementById('add_release_days_aula').value = 0; // Reset to 0 when opening for new lesson
            addTipoConteudoSelect.value = 'video'; // Default to video
            addUrlVideoInput.value = '';
            document.getElementById('add_descricao_aula').value = '';
            toggleAddLessonFields(); // Apply initial display logic
            openModal(addLessonModal);
        });
    });

    // --- Lógica para Modal de Editar Aula ---
    const editLessonModal = document.getElementById('edit-lesson-modal');
    const editTipoConteudoSelect = document.getElementById('edit_tipo_conteudo');
    const editVideoUrlContainer = document.getElementById('edit-video-url-container');
    const editExistingFilesContainer = document.getElementById('edit-existing-files-container');
    const editNewFilesUploadContainer = document.getElementById('edit-new-files-upload-container');
    const editUrlVideoInput = document.getElementById('edit_url_video');
    const existingFilesList = document.getElementById('existing-files-list');
    const editAulaFilesInput = document.getElementById('edit_aula_files');


    function toggleEditLessonFields() {
        const selectedType = editTipoConteudoSelect.value;
        editUrlVideoInput.required = false;
        editAulaFilesInput.required = false; // Reset required for new uploads

        editVideoUrlContainer.style.display = 'none';
        editExistingFilesContainer.style.display = 'none';
        editNewFilesUploadContainer.style.display = 'none';

        if (selectedType === 'video' || selectedType === 'mixed') {
            editVideoUrlContainer.style.display = 'block';
            editUrlVideoInput.required = true;
        }
        if (selectedType === 'files' || selectedType === 'mixed') {
            editExistingFilesContainer.style.display = 'block';
            editNewFilesUploadContainer.style.display = 'block';
            
            // Check if any existing file is still in the list (hidden input exists)
            const anyExistingFileSelectedToKeep = existingFilesList.querySelectorAll('input[name="existing_files[]"]').length > 0;

            if (!anyExistingFileSelectedToKeep) { // If no existing files are kept, then new uploads become required
                editAulaFilesInput.required = true;
            }
        }
    }

    editTipoConteudoSelect.addEventListener('change', toggleEditLessonFields);
    
    // Handle file deletion (click on trash icon)
    existingFilesList.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-file-btn');
        if (deleteBtn) {
            const fileItem = deleteBtn.closest('.file-item');
            if (fileItem) {
                fileItem.remove();
                toggleEditLessonFields(); // Re-evaluate if new files are required
            }
        }
    });


    document.querySelectorAll('.edit-lesson-btn').forEach(button => {
        button.addEventListener('click', function() {
            const aulaId = this.dataset.aulaId;
            const titulo = this.dataset.titulo;
            const urlVideo = this.dataset.urlVideo;
            const descricao = this.dataset.descricao;
            const releaseDays = this.dataset.releaseDays;
            const tipoConteudo = this.dataset.tipoConteudo;
            const files = JSON.parse(this.dataset.files);

            document.getElementById('edit_aula_id').value = aulaId;
            document.getElementById('edit_titulo_aula').value = titulo;
            document.getElementById('edit_url_video').value = urlVideo;
            document.getElementById('edit_descricao_aula').value = descricao;
            document.getElementById('edit_release_days_aula').value = releaseDays;
            document.getElementById('edit_tipo_conteudo').value = tipoConteudo;

            // Preencher lista de arquivos existentes
            existingFilesList.innerHTML = '';
            if (files && files.length > 0) {
                files.forEach(file => {
                    const fileItem = document.createElement('div');
                    fileItem.className = 'flex items-center justify-between p-2 bg-gray-100 rounded-md file-item';
                    fileItem.innerHTML = `
                        <input type="hidden" name="existing_files[]" value="${file.id}">
                        <div class="flex items-center space-x-2 overflow-hidden">
                            <i data-lucide="file" class="w-4 h-4 text-gray-500 flex-shrink-0"></i>
                            <span class="text-sm text-gray-700 truncate" title="${file.nome_original}">${file.nome_original}</span>
                        </div>
                        <div class="flex items-center space-x-2 flex-shrink-0 ml-2">
                            <a href="${file.caminho_arquivo}" target="_blank" class="text-blue-500 hover:text-blue-700 p-1" title="Baixar"><i data-lucide="download" class="w-4 h-4"></i></a>
                            <button type="button" class="text-red-500 hover:text-red-700 p-1 delete-file-btn" title="Excluir"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                        </div>
                    `;
                    existingFilesList.appendChild(fileItem);
                });
            } else {
                existingFilesList.innerHTML = '<p class="text-sm text-gray-500">Nenhum arquivo enviado para esta aula.</p>';
            }

            // Reset o input de novos arquivos
            editAulaFilesInput.value = '';

            toggleEditLessonFields(); // Aplica a lógica de exibição inicial
            lucide.createIcons();
            openModal(editLessonModal);
        });
    });

    // --- Lógica para Modal de Editar Módulo ---
    const editModuleModal = document.getElementById('edit-module-modal');
    const imgPreview = document.getElementById('modal-imagem-preview');
    const removeImageCheckbox = document.getElementById('remove_imagem_capa_modulo');
    document.querySelectorAll('.edit-module-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.getElementById('modal-modulo-id-edit').value = this.dataset.moduloId;
            document.getElementById('modal-titulo-modulo-edit').value = this.dataset.moduloTitulo;
            document.getElementById('modal-release-days-modulo-edit').value = this.dataset.releaseDays; 
            const imageUrl = this.dataset.imageUrl;
            if (imageUrl) {
                imgPreview.src = imageUrl;
                imgPreview.classList.remove('hidden');
                removeImageCheckbox.checked = false; // Garante que não esteja marcado ao abrir
                removeImageCheckbox.parentElement.style.display = 'flex'; // Mostra a opção de remover
            } else {
                imgPreview.src = '';
                imgPreview.classList.add('hidden');
                removeImageCheckbox.checked = false;
                removeImageCheckbox.parentElement.style.display = 'none'; // Esconde se não houver imagem
            }
            openModal(editModuleModal);
        });
    });

    // --- Lógica de Reordenação (Drag-and-Drop) de Aulas ---
    document.querySelectorAll('.sortable-aulas').forEach(ul => {
        new Sortable(ul, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            handle: '.cursor-grab', // A alça para arrastar será o ícone de 'grip-vertical'
            onEnd: function (evt) {
                const moduloId = evt.from.dataset.moduloId;
                const newOrder = Array.from(evt.from.children).map(item => item.dataset.aulaId);
                
                // Enviar a nova ordem para a API
                fetch('api.php?action=reorder_aulas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        modulo_id: moduloId,
                        aulas_order: newOrder,
                        servi�o_id: currentProductId // Passa o ID do servi�o para validação
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Opcional: Feedback visual de sucesso
                        // alert('Ordem das aulas atualizada!');
                        console.log('Ordem das aulas atualizada com sucesso!');
                    } else {
                        // alert('Erro ao reordenar aulas: ' + (data.error || 'Erro desconhecido.'));
                        console.error('Erro ao reordenar aulas:', data.error);
                        // Opcional: Recarregar a página para reverter a ordem visual para a do banco
                        // window.location.reload(); 
                    }
                })
                .catch(error => {
                    console.error('Erro de rede ao reordenar aulas:', error);
                    // alert('Erro de comunicação com o servidor ao reordenar aulas.');
                    // window.location.reload();
                });
            }
        });
    });

    // Chamada inicial para toggleAddLessonFields para garantir que o formulário "Adicionar Aula" esteja correto ao carregar
    toggleAddLessonFields();
});
</script>
