/**
 * ARQUIVO: admin.js - Versão Final com Validações e Correções
 */

const API_BASE_URL = 'https://academia-limpo.vercel.app'; 

// REFERÊNCIAS DO DOM
const loginSection = document.getElementById('loginSection');
const adminSection = document.getElementById('adminSection');
const loginForm = document.getElementById('loginForm');
const btnLogout = document.getElementById('btnLogout');
const userInfo = document.getElementById('userInfo');
const loginError = document.getElementById('loginError');

const cadastroForm = document.getElementById('cadastroForm');
const tabelaCadastros = document.getElementById('tabelaCadastros');
const totalCadastrosEl = document.getElementById('totalCadastros');
const btnCancelar = document.getElementById('btnCancelar');
const formTitle = document.getElementById('formTitle');

// Campos de Input
const inputNome = document.getElementById('nome');
const inputCpf = document.getElementById('cpf');
const inputStatus = document.getElementById('status');

// Referências para o Olho da Senha
const togglePassword = document.querySelector('#togglePassword');
const passwordField = document.querySelector('#password');
const eyeIcon = document.querySelector('#eyeIcon');

// ESTADO DA APLICAÇÃO
let tokenAtual = localStorage.getItem('adminToken') || null;
let cadastros = []; 

// 1. INICIALIZAÇÃO
function iniciarApp() {
    if (tokenAtual) {
        mostrarPainelAdmin();
        carregarCadastros();
    } else {
        mostrarLogin();
    }
}

// 2. LÓGICA DO OLHO (CORRIGIDA)
if (togglePassword) {
    togglePassword.addEventListener('click', function () {
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        
        // Se a senha está oculta (password), mostra o olho normal para "ver"
        // Se a senha está visível (text), mostra o olho cortado para "esconder"
        if (type === 'password') {
            eyeIcon.className = 'fas fa-eye';
        } else {
            eyeIcon.className = 'fas fa-eye-slash';
        }
    });
}

// 3. FILTROS DE INPUT (NOME E CPF)
if (inputNome) {
    inputNome.addEventListener('input', function() {
        // Aceita apenas letras e espaços
        let valor = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
        // Primeira letra de cada palavra em Maiúscula
        this.value = valor.replace(/\b\w/g, l => l.toUpperCase());
    });
}

if (inputCpf) {
    inputCpf.addEventListener('input', function() {
        // Aceita apenas números e limita a 11 dígitos
        this.value = this.value.replace(/\D/g, "").slice(0, 11);
    });
}

// 4. AUTENTICAÇÃO (LOGIN)
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const usuario = document.getElementById('usuario').value;
    const password = passwordField.value;

    try {
        const resposta = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, senha: password })
        });

        if (resposta.ok) {
            const dados = await resposta.json();
            tokenAtual = dados.token;
            localStorage.setItem('adminToken', tokenAtual);
            mostrarPainelAdmin();
            carregarCadastros();
        } else {
            loginError.classList.remove('hidden');
        }
    } catch (erro) {
        console.error("Erro no login:", erro);
        alert("Erro ao conectar com o servidor.");
    }
});

// 5. CARREGAR DADOS DO SERVIDOR
async function carregarCadastros() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/consulta`, {
            headers: { 'Authorization': `Bearer ${tokenAtual}` }
        });
        if (resposta.ok) {
            const dados = await resposta.json();
            cadastros = dados.usuarios;
            renderizarTabela();
        }
    } catch (erro) {
        console.error("Erro ao carregar:", erro);
    }
}

// 6. RENDERIZAR TABELA (COM ID E STATUS)
function renderizarTabela() {
    tabelaCadastros.innerHTML = ''; 
    totalCadastrosEl.textContent = cadastros.length;

    cadastros.forEach(cadastro => {
        const tr = document.createElement('tr');
        const idExibido = cadastro.id || '---';
        const status = cadastro.status || 'Pendente';
        const statusClass = `status-${status.toLowerCase()}`;

        tr.innerHTML = `
           
            <td style="padding: 12px; color: #fff;">${cadastro.nome}</td>
            <td style="padding: 12px; color: #4f8b4f;">${cadastro.cpf}</td>
            <td style="padding: 12px;">
                <span class="status-badge ${statusClass}">${status}</span>
            </td>
            <td style="padding: 12px; text-align: right;">
                <button onclick="editarCadastro('${cadastro.cpf}')" class="btn-edit-table">EDITAR</button>
                <button onclick="deletarCadastro('${cadastro.cpf}')" class="btn-delete-table">EXCLUIR</button>
            </td>
        `;
        tabelaCadastros.appendChild(tr);
    });
}

// 7. SALVAR OU EDITAR (COM VALIDAÇÃO DE CPF)
cadastroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const idEdicao = document.getElementById('cadastroId').value;
    const nome = inputNome.value;
    const cpf = inputCpf.value;
    const status = inputStatus.value;

    // Bloqueia CPF com números repetidos (ex: 00000000000)
    if (/^(\d)\1{10}$/.test(cpf)) {
        alert("CPF Inválido: Não pode conter todos os números iguais.");
        return;
    }

    const dados = { nome, cpf, status };
    const url = idEdicao ? `${API_BASE_URL}/substituir/${cpf}` : `${API_BASE_URL}/cadastro`;
    const metodo = idEdicao ? 'PUT' : 'POST';

    try {
        const resposta = await fetch(url, {
            method: metodo,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAtual}`
            },
            body: JSON.stringify(dados)
        });

        if (resposta.ok) {
            limparFormulario();
            carregarCadastros();
            alert(idEdicao ? "Atualizado com sucesso!" : "Cadastrado com sucesso!");
        } else {
            const erro = await resposta.json();
            alert("Erro: " + (erro.erro || "Falha na operação"));
        }
    } catch (erro) {
        console.error("Erro ao salvar:", erro);
    }
});

// 8. FUNÇÕES DE SUPORTE
window.editarCadastro = function(cpf) {
    const cadastro = cadastros.find(c => String(c.cpf) === String(cpf));
    if (cadastro) {
        document.getElementById('cadastroId').value = cadastro.cpf;
        inputCpf.value = cadastro.cpf;
        inputNome.value = cadastro.nome;
        inputStatus.value = cadastro.status || 'Pendente';
        
        formTitle.textContent = "Editar Cadastro";
        btnCancelar.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

window.deletarCadastro = async function(cpf) {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    try {
        await fetch(`${API_BASE_URL}/excluir/${cpf}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${tokenAtual}` }
        });
        carregarCadastros();
    } catch (erro) {
        console.error("Erro ao deletar:", erro);
    }
};

btnLogout.addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    location.reload();
});

function limparFormulario() {
    cadastroForm.reset();
    document.getElementById('cadastroId').value = ''; 
    formTitle.textContent = "Novo Cadastro";
    btnCancelar.classList.add('hidden');
    inputStatus.value = "Pendente";
}

function mostrarPainelAdmin() {
    loginSection.classList.add('hidden');
    adminSection.classList.remove('hidden');
    userInfo.classList.remove('hidden');
}

function mostrarLogin() {
    loginSection.classList.remove('hidden');
    adminSection.classList.add('hidden');
    userInfo.classList.add('hidden');
}

btnCancelar.addEventListener('click', limparFormulario);

// INICIAR APLICAÇÃO
iniciarApp();