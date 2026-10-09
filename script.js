// =============================================
// ESTOQUE FÁCIL - JAVASCRIPT
// Lógica de navegação, busca e cadastro
// =============================================

// BANCO DE DADOS EM MEMÓRIA (DEMONSTRAÇÃO)
let baseProdutos = [
    { id: 1, codigo: 'SKU-001', rua: 'Rua A', prateleira: 'P1', foto: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop', status: 'ativo' },
    { id: 2, codigo: 'SKU-002', rua: 'Rua B', prateleira: 'P2', foto: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop', status: 'ativo' },
    { id: 3, codigo: 'SKU-003', rua: 'Rua C', prateleira: 'P3', foto: 'https://images.unsplash.com/photo-1533139602282-d2e5a28e5f42?w=400&h=300&fit=crop', status: 'zerado' },
    { id: 4, codigo: 'SKU-004', rua: 'Rua D', prateleira: 'P1', foto: 'https://images.unsplash.com/photo-1535628346881-dac1665014d5?w=400&h=300&fit=crop', status: 'ativo' }
];

let proximoId = 5;
let produtoSelecionado = null;

const seletores = {
    navBtns: document.querySelectorAll('.nav-btn'),
    tabContents: document.querySelectorAll('.tab-content'),

    codigoPesquisa: document.getElementById('codigoPesquisa'),
    btnBuscar: document.getElementById('btnBuscar'),
    resultadoBusca: document.getElementById('resultadoBusca'),
    naoEncontrado: document.getElementById('naoEncontrado'),
    imgProduto: document.getElementById('imgProduto'),
    codigoProduto: document.getElementById('codigoProduto'),
    ruaProduto: document.getElementById('ruaProduto'),
    prateleiraeProduto: document.getElementById('prateleiraeProduto'),
    situacaoProduto: document.getElementById('situacaoProduto'),
    btnMudarLocalizacao: document.getElementById('btnMudarLocalizacao'),
    btnZerarProduto: document.getElementById('btnZerarProduto'),
    btnReativar: document.getElementById('btnReativar'),

    formAdicionar: document.getElementById('formAdicionar'),
    codigoNovo: document.getElementById('codigoNovo'),
    ruaNova: document.getElementById('ruaNova'),
    prateleiraNova: document.getElementById('prateleiraNova'),
    fotoNova: document.getElementById('fotoNova'),
    erroCodigoDuplicado: document.getElementById('erroCodigoDuplicado'),
    previewFoto: document.getElementById('previewFoto'),
    imgPreview: document.getElementById('imgPreview'),
    sucessoAdicionar: document.getElementById('sucessoAdicionar'),

    filtroSituacao: document.getElementById('filtroSituacao'),
    listaHistorico: document.getElementById('listaHistorico'),
    historicoVazio: document.getElementById('historicoVazio'),

    modalMudarLocalizacao: document.getElementById('modalMudarLocalizacao'),
    formMudarLocalizacao: document.getElementById('formMudarLocalizacao'),
    ruaModal: document.getElementById('ruaModal'),
    prateleiraModal: document.getElementById('prateleiraModal'),
    fecharModal: document.getElementById('fecharModal'),
    cancelarModal: document.getElementById('cancelarModal'),
    modalOverlay: document.getElementById('modalOverlay')
};

function mostrarAba(idAba) {
    seletores.navBtns.forEach(btn => btn.classList.remove('active'));
    seletores.tabContents.forEach(tab => tab.classList.remove('active'));

    const btn = document.querySelector(`[data-tab="${idAba}"]`);
    const tab = document.getElementById(idAba);
    if (btn) btn.classList.add('active');
    if (tab) tab.classList.add('active');
}

function ocultarMensagensResultado() {
    if (seletores.resultadoBusca) seletores.resultadoBusca.classList.add('hidden');
    if (seletores.naoEncontrado) seletores.naoEncontrado.classList.add('hidden');
}

function abrirModalLocalizacao(produto) {
    produtoSelecionado = produto;
    seletores.ruaModal.value = produto.rua;
    seletores.prateleiraModal.value = produto.prateleira;
    seletores.modalMudarLocalizacao.classList.remove('hidden');
    seletores.modalOverlay.classList.remove('hidden');
}

function fecharModalLocalizacao() {
    seletores.modalMudarLocalizacao.classList.add('hidden');
    seletores.modalOverlay.classList.add('hidden');
    seletores.formMudarLocalizacao.reset();
    produtoSelecionado = null;
}

function buscarProdutoPorCodigo(codigo) {
    return baseProdutos.find(p => p.codigo.toLowerCase() === codigo.toLowerCase());
}

function codigoJaExiste(codigo) {
    return baseProdutos.some(p => p.codigo.toLowerCase() === codigo.toLowerCase());
}

function mostrarProdutoEncontrado(produto) {
    seletores.imgProduto.src = produto.foto;
    seletores.imgProduto.alt = `Produto ${produto.codigo}`;
    seletores.codigoProduto.textContent = `Código: ${produto.codigo}`;
    seletores.ruaProduto.textContent = produto.rua;
    seletores.prateleiraeProduto.textContent = produto.prateleira;

    if (produto.status === 'zerado') {
        seletores.situacaoProduto.textContent = 'Zerado';
        seletores.situacaoProduto.className = 'info-valor status-zerado';
        seletores.btnZerarProduto.classList.add('hidden');
        seletores.btnReativar.classList.remove('hidden');
    } else {
        seletores.situacaoProduto.textContent = 'Ativo';
        seletores.situacaoProduto.className = 'info-valor status-ativo';
        seletores.btnZerarProduto.classList.remove('hidden');
        seletores.btnReativar.classList.add('hidden');
    }

    ocultarMensagensResultado();
    seletores.resultadoBusca.classList.remove('hidden');
}

function mostrarProdutoNaoEncontrado() {
    ocultarMensagensResultado();
    seletores.naoEncontrado.classList.remove('hidden');
}

function executarBusca() {
    const codigo = seletores.codigoPesquisa.value.trim();
    if (!codigo) {
        alert('Digite um código para buscar.');
        return;
    }

    const produto = buscarProdutoPorCodigo(codigo);
    if (produto) {
        produtoSelecionado = produto;
        mostrarProdutoEncontrado(produto);
    } else {
        mostrarProdutoNaoEncontrado();
    }
}

seletores.btnBuscar.addEventListener('click', executarBusca);
seletores.codigoPesquisa.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') executarBusca();
});

seletores.formAdicionar.addEventListener('submit', function (e) {
    e.preventDefault();

    const codigo = seletores.codigoNovo.value.trim();
    const rua = seletores.ruaNova.value.trim();
    const prateleira = seletores.prateleiraNova.value.trim();
    const fotoUrl = seletores.fotoNova.value.trim();

    if (!codigo || !rua || !prateleira) {
        alert('Preencha todos os campos obrigatórios.');
        return;
    }

    if (codigoJaExiste(codigo)) {
        seletores.erroCodigoDuplicado.classList.remove('hidden');
        return;
    }

    seletores.erroCodigoDuplicado.classList.add('hidden');

    const novoProduto = {
        id: proximoId++,
        codigo,
        rua,
        prateleira,
        foto: fotoUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
        status: 'ativo'
    };

    baseProdutos.push(novoProduto);
    seletores.formAdicionar.reset();
    seletores.previewFoto.classList.add('hidden');
    seletores.imgPreview.src = '';
    seletores.sucessoAdicionar.classList.remove('hidden');
    setTimeout(() => seletores.sucessoAdicionar.classList.add('hidden'), 2500);
    atualizarHistorico();
});

seletores.fotoNova.addEventListener('change', function () {
    const url = this.value.trim();
    if (url) {
        seletores.imgPreview.src = url;
        seletores.previewFoto.classList.remove('hidden');
    } else {
        seletores.previewFoto.classList.add('hidden');
    }
});

seletores.btnMudarLocalizacao.addEventListener('click', function () {
    if (!produtoSelecionado) return;
    abrirModalLocalizacao(produtoSelecionado);
});

seletores.formMudarLocalizacao.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!produtoSelecionado) return;

    const novaRua = seletores.ruaModal.value.trim();
    const novaPrateleira = seletores.prateleiraModal.value.trim();

    if (!novaRua || !novaPrateleira) {
        alert('Preencha todos os campos.');
        return;
    }

    produtoSelecionado.rua = novaRua;
    produtoSelecionado.prateleira = novaPrateleira;
    mostrarProdutoEncontrado(produtoSelecionado);
    fecharModalLocalizacao();
    atualizarHistorico();
});

seletores.fecharModal.addEventListener('click', fecharModalLocalizacao);
seletores.cancelarModal.addEventListener('click', fecharModalLocalizacao);
seletores.modalOverlay.addEventListener('click', fecharModalLocalizacao);

seletores.btnZerarProduto.addEventListener('click', function () {
    if (!produtoSelecionado) return;
    const confirmado = confirm('Tem certeza que deseja zerar este produto?');
    if (!confirmado) return;

    produtoSelecionado.status = 'zerado';
    mostrarProdutoEncontrado(produtoSelecionado);
    atualizarHistorico();
});

seletores.btnReativar.addEventListener('click', function () {
    if (!produtoSelecionado) return;
    const confirmado = confirm('Reativar este produto?');
    if (!confirmado) return;

    produtoSelecionado.status = 'ativo';
    mostrarProdutoEncontrado(produtoSelecionado);
    atualizarHistorico();
});

function atualizarHistorico() {
    const filtro = seletores.filtroSituacao.value;
    let produtosFiltrados = baseProdutos;

    if (filtro === 'ativo') {
        produtosFiltrados = baseProdutos.filter(p => p.status === 'ativo');
    } else if (filtro === 'zerado') {
        produtosFiltrados = baseProdutos.filter(p => p.status === 'zerado');
    }

    if (produtosFiltrados.length === 0) {
        seletores.listaHistorico.innerHTML = '';
        seletores.historicoVazio.classList.remove('hidden');
        return;
    }

    seletores.historicoVazio.classList.add('hidden');
    seletores.listaHistorico.innerHTML = produtosFiltrados.map(produto => `
        <div class="produto-item" onclick="selecionarProdutoHistorico('${produto.codigo}')">
            <img src="${produto.foto}" alt="${produto.codigo}" class="produto-item-img">
            <div class="produto-item-info">
                <span class="produto-item-codigo">${produto.codigo}</span>
                <span class="produto-item-localizacao">📍 ${produto.rua} • ${produto.prateleira}</span>
                <span class="produto-item-status" style="color: ${produto.status === 'ativo' ? '#16a34a' : '#dc2626'}">
                    ${produto.status === 'ativo' ? '✓ Ativo' : '✗ Zerado'}
                </span>
            </div>
        </div>
    `).join('');
}

seletores.filtroSituacao.addEventListener('change', atualizarHistorico);

function selecionarProdutoHistorico(codigo) {
    const produto = buscarProdutoPorCodigo(codigo);
    if (produto) {
        seletores.codigoPesquisa.value = codigo;
        mostrarAba('buscar');
        executarBusca();
    }
}

seletores.navBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        const aba = this.getAttribute('data-tab');
        mostrarAba(aba);
        if (aba === 'historico') atualizarHistorico();
    });
});

window.addEventListener('load', function () {
    atualizarHistorico();
});
