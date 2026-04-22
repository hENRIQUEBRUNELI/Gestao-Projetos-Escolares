const DB_KEY = 'projetos_henrique_final';
const obterDados = () => JSON.parse(localStorage.getItem(DB_KEY)) || [];
const salvarDados = (dados) => localStorage.setItem(DB_KEY, JSON.stringify(dados));

function navegar(tela) {
    document.getElementById('sec-lista').style.display = tela === 'lista' ? 'block' : 'none';
    document.getElementById('sec-cadastro').style.display = tela === 'cadastro' ? 'block' : 'none';
    if(tela === 'cadastro') {
        document.getElementById('form-projeto').reset();
        document.getElementById('modo-edicao').value = 'false';
        document.getElementById('p-id-projeto').disabled = false;
        document.getElementById('titulo-form').innerText = 'Cadastro de Projeto';
    }
    renderizarTabela();
}

document.getElementById('form-projeto').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const idProjeto = document.getElementById('p-id-projeto').value.trim();
    const modoEdicao = document.getElementById('modo-edicao').value === 'true';
    const idOriginal = document.getElementById('id-original').value;
    const membrosArray = document.getElementById('p-membros').value.split(',').map(m => m.trim()).filter(m => m !== "");

    // Validação de membros (2-6)
    if (membrosArray.length < 2 || membrosArray.length > 6) {
        return alert("O grupo deve possuir entre 2 e 6 alunos!");
    }

    let projetos = obterDados();

    // Validação de ID Único
    if (!modoEdicao || (modoEdicao && idProjeto !== idOriginal)) {
        if (projetos.some(p => p.idProjeto === idProjeto)) {
            return alert("Erro: Já existe um projeto com este ID!");
        }
    }

    // Validação de aluno em apenas um grupo
    const outrosMembros = projetos.filter(p => p.idProjeto !== idOriginal).flatMap(p => p.membros);
    const duplicado = membrosArray.find(m => outrosMembros.includes(m));
    if (duplicado) return alert(`O aluno "${duplicado}" já está em outro projeto!`);

    const projeto = {
        idProjeto,
        tema: document.getElementById('p-tema').value,
        descricao: document.getElementById('p-desc').value,
        curso: document.getElementById('p-curso').value,
        periodo: document.getElementById('p-periodo').value,
        professor: document.getElementById('p-professor').value,
        membros: membrosArray
    };

    if (modoEdicao) {
        const index = projetos.findIndex(p => p.idProjeto === idOriginal);
        projetos[index] = projeto;
    } else {
        projetos.push(projeto);
    }

    salvarDados(projetos);
    alert("Salvo com sucesso!");
    navegar('lista');
});

function renderizarTabela() {
    const projetos = obterDados();
    
    const selectCursos = document.getElementById('filtro-curso-select');
    const valorAtual = selectCursos.value;
    const cursosUnicos = [...new Set(projetos.map(p => p.curso))];
    selectCursos.innerHTML = '<option value="todos">Todos os Cursos</option>';
    cursosUnicos.forEach(c => selectCursos.innerHTML += `<option value="${c}">${c}</option>`);
    selectCursos.value = valorAtual;

    const busca = document.getElementById('busca-geral').value.toLowerCase();
    const cursoFiltro = selectCursos.value;
    const tabela = document.getElementById('tabela-projetos');
    tabela.innerHTML = '';

    const filtrados = projetos.filter(p => {
        const matchesBusca = p.tema.toLowerCase().includes(busca) || 
                             p.idProjeto.toLowerCase().includes(busca) ||
                             p.professor.toLowerCase().includes(busca);
        const matchesCurso = cursoFiltro === 'todos' || p.curso === cursoFiltro;
        return matchesBusca && matchesCurso;
    });

    filtrados.forEach(p => {
        // REGRA DE 50 CARACTERES
        const resumo = p.descricao.length > 50 ? p.descricao.substring(0, 50) + "..." : p.descricao;
        
        tabela.innerHTML += `
            <tr>
                <td>${p.idProjeto}</td>
                <td>${p.tema}</td>
                <td>${resumo}</td>
                <td>${p.curso} / ${p.periodo}</td>
                <td>${p.professor}</td>
                <td>${p.membros.join(', ')}</td>
                <td>
                    <button onclick="prepararEdicao('${p.idProjeto}')">Editar</button>
                    <button onclick="excluirProjeto('${p.idProjeto}')">Excluir</button>
                </td>
            </tr>`;
    });
}

function prepararEdicao(id) {
    const p = obterDados().find(proj => proj.idProjeto === id);
    if (p) {
        navegar('cadastro');
        document.getElementById('titulo-form').innerText = 'Editar Projeto';
        document.getElementById('modo-edicao').value = 'true';
        document.getElementById('id-original').value = p.idProjeto;
        document.getElementById('p-id-projeto').value = p.idProjeto;
        document.getElementById('p-tema').value = p.tema;
        document.getElementById('p-desc').value = p.descricao;
        document.getElementById('p-curso').value = p.curso;
        document.getElementById('p-periodo').value = p.periodo;
        document.getElementById('p-professor').value = p.professor;
        document.getElementById('p-membros').value = p.membros.join(', ');
    }
}

function excluirProjeto(id) {
    if (!confirm(`Deseja excluir o projeto ID ${id}?`)) return;
    const novos = obterDados().filter(p => p.idProjeto !== id);
    salvarDados(novos);
    renderizarTabela();
}

renderizarTabela();