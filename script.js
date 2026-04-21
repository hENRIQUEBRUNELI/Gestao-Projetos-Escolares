// --- CONFIGURAÇÃO INICIAL ---
const usuarioAtivo = { nome: "Henrique", perfil: "ADMIN" };
document.getElementById('status-usuario').innerText = `Usuário: ${usuarioAtivo.nome}`;

const form = document.getElementById('form-projeto');
const corpoTabela = document.getElementById('corpo-tabela');

// --- NAVEGAÇÃO ENTRE TELAS ---
function mostrarTela(tela) {
    document.getElementById('tela-listagem').style.display = tela === 'listagem' ? 'block' : 'none';
    document.getElementById('tela-cadastro').style.display = tela === 'cadastro' ? 'block' : 'none';
    if (tela === 'listagem') renderizarTabela();
}

// --- FUNÇÕES DO LOCALSTORAGE ---
function obterProjetos() {
    return JSON.parse(localStorage.getItem('projetos_escolares')) || [];
}

function salvarProjetos(lista) {
    localStorage.setItem('projetos_escolares', JSON.stringify(lista));
}

// --- OPERAÇÕES DO CRUD ---

// SALVAR OU EDITAR (Create & Update)
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('projeto-id').value;
    
    const projeto = {
        id: id ? Number(id) : Date.now(),
        titulo: document.getElementById('titulo').value,
        responsavel: document.getElementById('responsavel').value,
        prazo: document.getElementById('prazo').value
    };

    let lista = obterProjetos();
    if (id) {
        const index = lista.findIndex(p => p.id == id);
        lista[index] = projeto;
    } else {
        lista.push(projeto);
    }

    salvarProjetos(lista);
    form.reset();
    document.getElementById('projeto-id').value = '';
    mostrarTela('listagem');
});

// LISTAR (Read)
function renderizarTabela() {
    const lista = obterProjetos();
    corpoTabela.innerHTML = '';
    lista.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.titulo}</td>
            <td>${p.responsavel}</td>
            <td>${p.prazo}</td>
            <td>
                <button onclick="prepararEdicao(${p.id})">Editar</button>
                <button onclick="removerProjeto(${p.id})" style="background:#dc3545; color:white;">Excluir</button>
            </td>
        `;
        corpoTabela.appendChild(tr);
    });
}

// EDITAR
function prepararEdicao(id) {
    const projeto = obterProjetos().find(p => p.id == id);
    document.getElementById('projeto-id').value = projeto.id;
    document.getElementById('titulo').value = projeto.titulo;
    document.getElementById('responsavel').value = projeto.responsavel;
    document.getElementById('prazo').value = projeto.prazo;
    document.getElementById('titulo-formulario').innerText = "Editar Projeto";
    mostrarTela('cadastro');
}

// EXCLUIR (Delete)
function removerProjeto(id) {
    if (confirm("Deseja mesmo excluir?")) {
        const novaLista = obterProjetos().filter(p => p.id !== id);
        salvarProjetos(novaLista);
        renderizarTabela();
    }
}

// INICIALIZAÇÃO
renderizarTabela();