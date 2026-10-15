// =============================================
// ESTOQUE FÁCIL - JAVASCRIPT
// Lógica de navegação, busca, cadastro, edição e integração preparada com Supabase
// =============================================

// Dados em memória (fallback para quando Supabase não estiver configurado)
let baseProdutos = [
    { id: '1', code: 'SKU-001', rua: 'Rua A', prateleira: 'P1', photo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop', quantity: 10, observation: '', active: true },
    { id: '2', code: 'SKU-002', rua: 'Rua B', prateleira: 'P2', photo: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop', quantity: 5, observation: '', active: true },
    { id: '3', code: 'SKU-003', rua: 'Rua C', prateleira: 'P3', photo: 'https://images.unsplash.com/photo-1533139602282-d2e5a28e5f42?w=400&h=300&fit=crop', quantity: 0, observation: 'Aguardando', active: false }
];

let proximoId = 4;
let produtoSelecionado = null;
let produtoEditandoId = null;
let supabaseClient = null;
let supabaseConfigured = false;
let storageBucket = 'product-photos';

// Se a configuração estiver presente, inicializa o Supabase
if (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.SUPABASE_URL && window.SUPABASE_CONFIG.SUPABASE_ANON_KEY) {
    try {
        supabaseClient = supabase.createClient(window.SUPABASE_CONFIG.SUPABASE_URL, window.SUPABASE_CONFIG.SUPABASE_ANON_KEY);
        storageBucket = window.SUPABASE_CONFIG.STORAGE_BUCKET || storageBucket;
        supabaseConfigured = true;
        console.log('Supabase configurado:', window.SUPABASE_CONFIG.SUPABASE_URL);
    } catch (err) {
        console.warn('Erro ao inicializar Supabase:', err);
    }
} else {
    console.log('Supabase não configurado. Usando armazenamento local temporário.');
}

// Seletores
const sel = {
    navBtns: document.querySelectorAll('.nav-btn'),
    tabContents: document.querySelectorAll('.tab-content'),

    // Buscar
    codigoPesquisa: document.getElementById('codigoPesquisa'),
    btnBuscar: document.getElementById('btnBuscar'),
    resultadoBusca: document.getElementById('resultadoBusca'),
    naoEncontrado: document.getElementById('naoEncontrado'),
    imgProduto: document.getElementById('imgProduto'),
    codigoProduto: document.getElementById('codigoProduto'),
    ruaProduto: document.getElementById('ruaProduto'),
    prateleiraeProduto: document.getElementById('prateleiraeProduto'),
    situacaoProduto: document.getElementById('situacaoProduto'),
    quantidadeProduto: document.getElementById('quantidadeProduto'),
    observacaoProduto: document.getElementById('observacaoProduto'),
    btnMudarLocalizacao: document.getElementById('btnMudarLocalizacao'),
    btnZerarProduto: document.getElementById('btnZerarProduto'),
    btnReativar: document.getElementById('btnReativar'),
    btnIrEditar: document.getElementById('btnIrEditar'),

    // Adicionar
    formAdicionar: document.getElementById('formAdicionar'),
    codigoNovo: document.getElementById('codigoNovo'),
    ruaNova: document.getElementById('ruaNova'),
    prateleiraNova: document.getElementById('prateleiraNova'),
    fotoArquivoNovo: document.getElementById('fotoArquivoNovo'),
    imgPreview: document.getElementById('imgPreview'),
    previewFoto: document.getElementById('previewFoto'),
    btnTrocarFoto: document.getElementById('btnTrocarFoto'),
    btnRemoverFoto: document.getElementById('btnRemoverFoto'),
    quantidadeNova: document.getElementById('quantidadeNova'),
    observacaoNova: document.getElementById('observacaoNova'),
    erroCodigoDuplicado: document.getElementById('erroCodigoDuplicado'),
    sucessoAdicionar: document.getElementById('sucessoAdicionar'),
    btnLimparAdicionar: document.getElementById('btnLimparAdicionar'),

    // Editar
    codigoEditarBuscar: document.getElementById('codigoEditarBuscar'),
    btnBuscarParaEditar: document.getElementById('btnBuscarParaEditar'),
    formEditar: document.getElementById('formEditar'),
    codigoEditar: document.getElementById('codigoEditar'),
    fotoArquivoEditar: document.getElementById('fotoArquivoEditar'),
    imgPreviewEditar: document.getElementById('imgPreviewEditar'),
    previewFotoEditar: document.getElementById('previewFotoEditar'),
    btnTrocarFotoEditar: document.getElementById('btnTrocarFotoEditar'),
    btnRemoverFotoEditar: document.getElementById('btnRemoverFotoEditar'),
    ruaEditar: document.getElementById('ruaEditar'),
    prateleiraEditar: document.getElementById('prateleiraEditar'),
    quantidadeEditar: document.getElementById('quantidadeEditar'),
    observacaoEditar: document.getElementById('observacaoEditar'),
    erroCodigoDuplicadoEditar: document.getElementById('erroCodigoDuplicadoEditar'),
    mensagemEditar: document.getElementById('mensagemEditar'),
    btnCancelarEditar: document.getElementById('btnCancelarEditar'),

    // Modal
    modalMudarLocalizacao: document.getElementById('modalMudarLocalizacao'),
    formMudarLocalizacao: document.getElementById('formMudarLocalizacao'),
    ruaModal: document.getElementById('ruaModal'),
    prateleiraModal: document.getElementById('prateleiraModal'),
    fecharModal: document.getElementById('fecharModal'),
    cancelarModal: document.getElementById('cancelarModal'),
    modalOverlay: document.getElementById('modalOverlay'),

    // Zerados
    listaZerados: document.getElementById('listaZerados'),
    zeradosVazio: document.getElementById('zeradosVazio'),

    // Produtos (antes 'historico')
    filtroSituacao: document.getElementById('filtroSituacao'),
    listaProdutos: document.getElementById('listaProdutos'),
    produtosVazio: document.getElementById('produtosVazio')
};

// Navegação de abas
function mostrarAba(idAba) {
    sel.navBtns.forEach(btn => btn.classList.remove('active'));
    sel.tabContents.forEach(tab => tab.classList.remove('active'));
    const btn = document.querySelector(`[data-tab="${idAba}"]`);
    const tab = document.getElementById(idAba);
    if (btn) btn.classList.add('active');
    if (tab) tab.classList.add('active');
}

sel.navBtns.forEach(btn => btn.addEventListener('click', function () {
    const aba = this.getAttribute('data-tab');
    mostrarAba(aba);
    if (aba === 'produtos') atualizarHistorico();
    if (aba === 'zerados') carregarListaZerados();
}));

// Mensagens
function ocultarMensagensResultado() {
    if (sel.resultadoBusca) sel.resultadoBusca.classList.add('hidden');
    if (sel.naoEncontrado) sel.naoEncontrado.classList.add('hidden');
}

// Modal localização
function abrirModalLocalizacao(produto) {
    produtoSelecionado = produto;
    sel.ruaModal.value = produto.rua || '';
    sel.prateleiraModal.value = produto.prateleira || '';
    sel.modalMudarLocalizacao.classList.remove('hidden');
    sel.modalOverlay.classList.remove('hidden');
}
function fecharModalLocalizacao() {
    sel.modalMudarLocalizacao.classList.add('hidden');
    sel.modalOverlay.classList.add('hidden');
    sel.formMudarLocalizacao.reset();
    produtoSelecionado = null;
}
sel.fecharModal.addEventListener('click', fecharModalLocalizacao);
sel.cancelarModal.addEventListener('click', fecharModalLocalizacao);
sel.modalOverlay.addEventListener('click', fecharModalLocalizacao);

// BUSCAR
async function fetchProductByCode(code) {
    if (supabaseConfigured) {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .eq('code', code)
            .limit(1);
        if (error) throw error;
        return data && data.length ? data[0] : null;
    } else {
        return baseProdutos.find(p => p.code.toLowerCase() === (code || '').toLowerCase()) || null;
    }
}

async function executarBusca() {
    const codigo = sel.codigoPesquisa.value.trim();
    if (!codigo) { alert('Digite um código para buscar.'); return; }
    try {
        const produto = await fetchProductByCode(codigo);
        if (produto) {
            produtoSelecionado = produto;
            mostrarProdutoEncontrado(produto);
        } else {
            mostrarProdutoNaoEncontrado();
        }
    } catch (err) {
        console.error(err);
        alert('Erro ao buscar produto. Veja o console.');
    }
}
sel.btnBuscar.addEventListener('click', executarBusca);
sel.codigoPesquisa.addEventListener('keypress', function (e) { if (e.key === 'Enter') executarBusca(); });

function mostrarProdutoEncontrado(produto) {
    sel.imgProduto.src = produto.photo || produto.photo_path || produto.photo_url || '';
    sel.imgProduto.alt = `Produto ${produto.code}`;
    sel.codigoProduto.textContent = `Código: ${produto.code}`;
    sel.ruaProduto.textContent = produto.rua || '-';
    sel.prateleiraeProduto.textContent = produto.prateleira || '-';
    sel.quantidadeProduto.textContent = (produto.quantity != null) ? produto.quantity : '-';
    sel.observacaoProduto.textContent = produto.observation || '-';

    if (produto.active === false || produto.status === 'zerado') {
        sel.situacaoProduto.textContent = 'Zerado';
        sel.situacaoProduto.className = 'info-valor status-zerado';
        sel.btnZerarProduto.classList.add('hidden');
        sel.btnReativar.classList.remove('hidden');
    } else {
        sel.situacaoProduto.textContent = 'Ativo';
        sel.situacaoProduto.className = 'info-valor status-ativo';
        sel.btnZerarProduto.classList.remove('hidden');
        sel.btnReativar.classList.add('hidden');
    }

    ocultarMensagensResultado();
    sel.resultadoBusca.classList.remove('hidden');
}

function mostrarProdutoNaoEncontrado() {
    ocultarMensagensResultado();
    sel.naoEncontrado.classList.remove('hidden');
}

// ADICIONAR
function codigoJaExisteLocal(codigo) {
    return baseProdutos.some(p => p.code.toLowerCase() === codigo.toLowerCase());
}

async function codigoJaExisteRemoto(codigo) {
    if (!supabaseConfigured) return false;
    const { data, error } = await supabaseClient.from('products').select('id').eq('code', codigo).limit(1);
    if (error) throw error;
    return data && data.length > 0;
}

function resetPreviewAdicionar() {
    sel.previewFoto.classList.add('hidden');
    sel.imgPreview.src = '';
    sel.fotoArquivoNovo.value = null;
}

sel.fotoArquivoNovo.addEventListener('change', function () {
    const file = this.files && this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            sel.imgPreview.src = e.target.result;
            sel.previewFoto.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    } else {
        resetPreviewAdicionar();
    }
});
sel.btnRemoverFoto.addEventListener('click', resetPreviewAdicionar);
sel.btnTrocarFoto.addEventListener('click', () => sel.fotoArquivoNovo.click());

async function uploadImageFile(file, destPath) {
    if (!supabaseConfigured) throw new Error('Supabase não configurado');
    const { data, error } = await supabaseClient.storage.from(storageBucket).upload(destPath, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    // obter URL pública (dependendo se bucket for público)
    const { data: urlData } = supabaseClient.storage.from(storageBucket).getPublicUrl(destPath);
    return urlData && urlData.publicURL ? urlData.publicURL : null;
}

async function adicionarProduto(event) {
    event.preventDefault();
    const codigo = sel.codigoNovo.value.trim();
    const rua = sel.ruaNova.value.trim();
    const prateleira = sel.prateleiraNova.value.trim();
    const quantidade = parseInt(sel.quantidadeNova.value, 10) || 0;
    const observacao = sel.observacaoNova.value.trim();
    const file = sel.fotoArquivoNovo.files && sel.fotoArquivoNovo.files[0];

    if (!codigo || !rua || !prateleira) { alert('Preencha todos os campos obrigatórios.'); return; }
    if (quantidade < 0) { alert('Quantidade não pode ser negativa.'); return; }

    try {
        if (supabaseConfigured) {
            const exists = await codigoJaExisteRemoto(codigo);
            if (exists) { sel.erroCodigoDuplicado.classList.remove('hidden'); return; }
            sel.erroCodigoDuplicado.classList.add('hidden');

            // criar registro primeiro para ter um id
            const { data: insertData, error: insertError } = await supabaseClient.from('products').insert([{ code: codigo, rua, prateleira, quantity: quantidade, observation: observacao }]).select().single();
            if (insertError) throw insertError;
            const created = insertData;
            let publicUrl = null;
            if (file) {
                const ext = file.name.split('.').pop();
                const path = `${created.id}.${ext}`;
                await uploadImageFile(file, path);
                // salvar path no registro
                const photo_path = path;
                const { error: updErr } = await supabaseClient.from('products').update({ photo_path }).eq('id', created.id);
                if (updErr) throw updErr;
                // tentar obter public url
                const { data: urlData } = supabaseClient.storage.from(storageBucket).getPublicUrl(path);
                publicUrl = urlData && urlData.publicURL ? urlData.publicURL : null;
            }
            sel.formAdicionar.reset();
            resetPreviewAdicionar();
            sel.sucessoAdicionar.classList.remove('hidden');
            setTimeout(() => sel.sucessoAdicionar.classList.add('hidden'), 2500);
        } else {
            if (codigoJaExisteLocal(codigo)) { sel.erroCodigoDuplicado.classList.remove('hidden'); return; }
            sel.erroCodigoDuplicado.classList.add('hidden');
            const novo = { id: String(proximoId++), code: codigo, rua, prateleira, photo: sel.imgPreview.src || '', quantity, observation: observacao, active: true };
            baseProdutos.push(novo);
            sel.formAdicionar.reset();
            resetPreviewAdicionar();
            sel.sucessoAdicionar.classList.remove('hidden');
            setTimeout(() => sel.sucessoAdicionar.classList.add('hidden'), 2500);
            atualizarHistorico();
        }
    } catch (err) {
        console.error('Erro ao adicionar:', err);
        alert('Erro ao adicionar produto. Veja o console.');
    }
}
sel.formAdicionar.addEventListener('submit', adicionarProduto);
sel.btnLimparAdicionar.addEventListener('click', resetPreviewAdicionar);

// EDITAR
async function fetchProductByCodeAnyState(code) {
    if (supabaseConfigured) {
        const { data, error } = await supabaseClient.from('products').select('*').eq('code', code).limit(1);
        if (error) throw error;
        return data && data.length ? data[0] : null;
    } else {
        return baseProdutos.find(p => p.code.toLowerCase() === (code || '').toLowerCase()) || null;
    }
}

sel.btnBuscarParaEditar.addEventListener('click', async function () {
    const codigo = sel.codigoEditarBuscar.value.trim();
    if (!codigo) { alert('Digite um código para buscar.'); return; }
    try {
        const produto = await fetchProductByCodeAnyState(codigo);
        if (!produto) { alert('Produto não encontrado.'); return; }
        // preencher form
        produtoEditandoId = produto.id;
        sel.formEditar.classList.remove('hidden');
        sel.codigoEditar.value = produto.code || '';
        sel.ruaEditar.value = produto.rua || '';
        sel.prateleiraEditar.value = produto.prateleira || '';
        sel.quantidadeEditar.value = produto.quantity != null ? produto.quantity : 0;
        sel.observacaoEditar.value = produto.observation || '';
        // preview foto
        const fotoUrl = produto.photo || produto.photo_path || '';
        if (fotoUrl) {
            sel.imgPreviewEditar.src = fotoUrl;
            sel.previewFotoEditar.classList.remove('hidden');
        } else {
            sel.previewFotoEditar.classList.add('hidden');
        }
    } catch (err) {
        console.error(err);
        alert('Erro ao buscar produto para editar.');
    }
});

sel.fotoArquivoEditar.addEventListener('change', function () {
    const file = this.files && this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            sel.imgPreviewEditar.src = e.target.result;
            sel.previewFotoEditar.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
});
sel.btnRemoverFotoEditar.addEventListener('click', function () {
    sel.fotoArquivoEditar.value = null;
    sel.imgPreviewEditar.src = '';
    sel.previewFotoEditar.classList.add('hidden');
});
sel.btnTrocarFotoEditar.addEventListener('click', function () { sel.fotoArquivoEditar.click(); });

async function codigoExisteOutroRemoto(codigo, id) {
    if (!supabaseConfigured) return false;
    const { data, error } = await supabaseClient.from('products').select('id').eq('code', codigo).limit(1);
    if (error) throw error;
    return data && data.length && data[0].id !== id;
}

async function salvarEdicao(event) {
    event.preventDefault();
    if (!produtoEditandoId) { alert('Nenhum produto selecionado para edição.'); return; }
    const novoCodigo = sel.codigoEditar.value.trim();
    const rua = sel.ruaEditar.value.trim();
    const prateleira = sel.prateleiraEditar.value.trim();
    const quantidade = parseInt(sel.quantidadeEditar.value, 10) || 0;
    const observacao = sel.observacaoEditar.value.trim();
    const file = sel.fotoArquivoEditar.files && sel.fotoArquivoEditar.files[0];

    if (!novoCodigo || !rua || !prateleira) { alert('Preencha todos os campos obrigatórios.'); return; }
    if (quantidade < 0) { alert('Quantidade não pode ser negativa.'); return; }

    try {
        if (supabaseConfigured) {
            const existsOther = await codigoExisteOutroRemoto(novoCodigo, produtoEditandoId);
            if (existsOther) { sel.erroCodigoDuplicadoEditar.classList.remove('hidden'); return; }
            sel.erroCodigoDuplicadoEditar.classList.add('hidden');

            // atualizar campos
            const updates = { code: novoCodigo, rua, prateleira, quantity: quantidade, observation: observacao, updated_at: new Date().toISOString() };
            if (file) {
                const ext = file.name.split('.').pop();
                const path = `${produtoEditandoId}.${ext}`;
                await uploadImageFile(file, path);
                updates.photo_path = path;
            }
            const { error: updErr } = await supabaseClient.from('products').update(updates).eq('id', produtoEditandoId);
            if (updErr) throw updErr;
            sel.mensagemEditar.classList.remove('hidden');
            setTimeout(() => sel.mensagemEditar.classList.add('hidden'), 2500);
        } else {
            // local
            const existente = baseProdutos.find(p => p.id === produtoEditandoId);
            if (!existente) { alert('Produto não encontrado localmente.'); return; }
            // checar se novoCodigo pertence a outro
            if (baseProdutos.some(p => p.code.toLowerCase() === novoCodigo.toLowerCase() && p.id !== produtoEditandoId)) { sel.erroCodigoDuplicadoEditar.classList.remove('hidden'); return; }
            sel.erroCodigoDuplicadoEditar.classList.add('hidden');
            existente.code = novoCodigo;
            existente.rua = rua;
            existente.prateleira = prateleira;
            existente.quantity = quantidade;
            existente.observation = observacao;
            if (sel.imgPreviewEditar.src) existente.photo = sel.imgPreviewEditar.src;
            sel.mensagemEditar.classList.remove('hidden');
            setTimeout(() => sel.mensagemEditar.classList.add('hidden'), 2500);
            atualizarHistorico();
        }
    } catch (err) {
        console.error('Erro ao salvar edição:', err);
        alert('Erro ao salvar alterações. Veja o console.');
    }
}
sel.formEditar.addEventListener('submit', salvarEdicao);
sel.btnCancelarEditar.addEventListener('click', function () { sel.formEditar.classList.add('hidden'); produtoEditandoId = null; });
sel.btnIrEditar.addEventListener('click', function () { if (!produtoSelecionado) return; mostrarAba('editar'); sel.codigoEditarBuscar.value = produtoSelecionado.code; sel.btnBuscarParaEditar.click(); });

// ZERAR / REATIVAR
async function zerarProdutoCodigo(code) {
    if (supabaseConfigured) {
        const { data, error } = await supabaseClient.from('products').select('id').eq('code', code).limit(1);
        if (error) throw error;
        if (!data || !data.length) return;
        const id = data[0].id;
        const { error: e } = await supabaseClient.from('products').update({ active: false }).eq('id', id);
        if (e) throw e;
    } else {
        const p = baseProdutos.find(x => x.code.toLowerCase() === code.toLowerCase()); if (p) p.active = false;
    }
}

async function reativarProdutoId(id) {
    if (supabaseConfigured) {
        const { error } = await supabaseClient.from('products').update({ active: true }).eq('id', id);
        if (error) throw error;
    } else {
        const p = baseProdutos.find(x => x.id === id); if (p) p.active = true;
    }
}

sel.btnZerarProduto.addEventListener('click', async function () {
    if (!produtoSelecionado) return; const confirmado = confirm('Tem certeza que deseja zerar este produto?'); if (!confirmado) return;
    try { await zerarProdutoCodigo(produtoSelecionado.code); produtoSelecionado.active = false; mostrarProdutoEncontrado(produtoSelecionado); atualizarHistorico(); } catch (err) { console.error(err); alert('Erro ao zerar produto.'); }
});
sel.btnReativar.addEventListener('click', async function () { if (!produtoSelecionado) return; const confirmado = confirm('Reativar este produto?'); if (!confirmado) return; try { await reativarProdutoId(produtoSelecionado.id); produtoSelecionado.active = true; mostrarProdutoEncontrado(produtoSelecionado); atualizarHistorico(); } catch (err) { console.error(err); alert('Erro ao reativar produto.'); } });

// Listar zerados
async function carregarListaZerados() {
    try {
        let produtos = [];
        if (supabaseConfigured) {
            const { data, error } = await supabaseClient.from('products').select('*').eq('active', false).order('updated_at', { ascending: false });
            if (error) throw error; produtos = data || [];
        } else {
            produtos = baseProdutos.filter(p => p.active === false);
        }
        if (!produtos || produtos.length === 0) { sel.listaZerados.innerHTML = ''; sel.zeradosVazio.classList.remove('hidden'); return; }
        sel.zeradosVazio.classList.add('hidden');
        sel.listaZerados.innerHTML = produtos.map(p => `\n            <div class="produto-item">\n                <img src="${p.photo || p.photo_path || ''}" alt="${p.code}" class="produto-item-img">\n                <div class="produto-item-info">\n                    <span class="produto-item-codigo">${p.code}</span>\n                    <span class="produto-item-localizacao">📍 ${p.rua || '-'} • ${p.prateleira || '-'}</span>\n                </div>\n                <div style=\"display:flex;flex-direction:column;gap:8px\">\n                    <button class=\"btn btn-success\" onclick=\"window.__reativarProduto('${p.id}')\">Reativar</button>\n                </div>\n            </div>\n        `).join('');
        // expor função global para o onclick
        window.__reativarProduto = async function (id) { if (!confirm('Reativar este produto?')) return; try { await reativarProdutoId(id); carregarListaZerados(); atualizarHistorico(); alert('Produto reativado.'); } catch (err) { console.error(err); alert('Erro ao reativar.'); } };
    } catch (err) {
        console.error('Erro ao carregar zerados:', err);
        alert('Erro ao carregar produtos zerados. Veja o console.');
    }
}

// Histórico / lista geral (agora Produtos)
async function atualizarHistorico() {
    try {
        let produtos = [];
        if (supabaseConfigured) {
            const { data, error } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false });
            if (error) throw error; produtos = data || [];
        } else {
            produtos = baseProdutos.slice().reverse();
        }
        const filtro = sel.filtroSituacao ? sel.filtroSituacao.value : 'todos';
        if (filtro === 'ativo') produtos = produtos.filter(p => p.active === true);
        if (filtro === 'zerado') produtos = produtos.filter(p => p.active === false);
        if (!produtos || produtos.length === 0) { if (sel.listaProdutos) sel.listaProdutos.innerHTML = ''; if (sel.produtosVazio) sel.produtosVazio.classList.remove('hidden'); return; }
        if (sel.produtosVazio) sel.produtosVazio.classList.add('hidden');
        if (sel.listaProdutos) sel.listaProdutos.innerHTML = produtos.map(produto => `\n            <div class=\"produto-item\" onclick=\"window.__selecionarProdutoProdutos('${produto.code}')\">\n                <img src=\"${produto.photo || produto.photo_path || ''}\" alt=\"${produto.code}\" class=\"produto-item-img\">\n                <div class=\"produto-item-info\">\n                    <span class=\"produto-item-codigo\">${produto.code}</span>\n                    <span class=\"produto-item-localizacao\">📍 ${produto.rua || '-'} • ${produto.prateleira || '-'}</span>\n                    <span class=\"produto-item-status\" style=\"color: ${produto.active ? '#16a34a' : '#dc2626'}\">${produto.active ? '✓ Ativo' : '✗ Zerado'}</span>\n                </div>\n            </div>\n        `).join('');
        window.__selecionarProdutoProdutos = function (code) { if (sel.codigoPesquisa) sel.codigoPesquisa.value = code; mostrarAba('buscar'); executarBusca(); };
    } catch (err) {
        console.error('Erro ao atualizar histórico:', err);
    }
}
if (sel.filtroSituacao) sel.filtroSituacao.addEventListener('change', atualizarHistorico);

// Inicialização
window.addEventListener('load', function () {
    atualizarHistorico();
});

// Test helpers: obter URL pública se photo_path
async function getPublicUrlFromPath(path) {
    if (!supabaseConfigured) return null;
    const { data } = supabaseClient.storage.from(storageBucket).getPublicUrl(path);
    return data && data.publicURL ? data.publicURL : null;
}
