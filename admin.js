/**
 * ARQUIVO: admin.js - Versão Integrada com Flask
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

// ESTADO DA APLICAÇÃO
let tokenAtual = localStorage.getItem('adminToken') || null;
let cadastros = []; 

function iniciarApp() {
    if (tokenAtual) {
        mostrarPainelAdmin();
        carregarCadastros();
    } else {
        mostrarLogin();
    }
}

// 1. AUTENTICAÇÃO
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;

    try {
        const resposta = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: usuario, senha: password }) 
        });

        if (resposta.ok) {
            const dados = await resposta.json(); 
            tokenAtual = dados.token;
            localStorage.setItem('adminToken', tokenAtual); 
            loginForm.reset(); 
            mostrarPainelAdmin();
            carregarCadastros(); 
        } else {
            loginError.classList.remove('hidden');
        }
    } catch (erro) {
        console.error("Erro no login:", erro);
        alert("Não foi possível conectar ao servidor.");
    }
});

btnLogout.addEventListener('click', () => {
    tokenAtual = null;
    localStorage.removeItem('adminToken');
    mostrarLogin(); 
});

// 2. CRUD: READ (Carregar lista usando a rota /consulta)
async function carregarCadastros() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/consulta`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenAtual}`
            }
        });

        if (resposta.status === 401 || resposta.status === 403) {
            alert("Sessão expirada.");
            btnLogout.click();
            return;
        }

        if (resposta.ok) {
            const dados = await resposta.json(); 
            // O Flask retorna os dados na chave "usuarios"
            cadastros = dados.usuarios || []; 
            renderizarTabela(); 
        } else {
            console.error("Falha ao buscar os cadastros. Status:", resposta.status);
        }
    } catch (erro) {
        console.error("Erro na busca:", erro);
    }
}

function renderizarTabela() {
    tabelaCadastros.innerHTML = ''; 
    totalCadastrosEl.textContent = cadastros.length;

    cadastros.forEach(cadastro => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="padding: 12px; color: #fff;">${cadastro.nome}</td>
            <td style="padding: 12px; color: #4f8b4f;">${cadastro.cpf}</td>
            <td style="padding: 12px; text-align: right;">
                <button onclick="editarCadastro('${cadastro.cpf}')" style="color: #4f8b4f; background: none; border: none; cursor: pointer; margin-right: 15px; font-weight: bold;">EDITAR</button>
                <button onclick="deletarCadastro('${cadastro.cpf}')" style="color: #ff4444; background: none; border: none; cursor: pointer; font-weight: bold;">EXCLUIR</button>
            </td>
        `;
        tabelaCadastros.appendChild(tr);
    });
}

// 3. CRUD: CREATE e UPDATE (POST /cadastro e PUT /substituir)
cadastroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // cadastroId armazena o CPF original em caso de edição
    const cpfOriginal = document.getElementById('cadastroId').value; 
    const cpf = document.getElementById('cpf').value;
    const nome = document.getElementById('nome').value;

    const cadastroData = { cpf, nome };

    try {
        let url = `${API_BASE_URL}/cadastro`;
        let metodoHTTP = 'POST'; 

        if (cpfOriginal) {
            // Rota de substituição total do back-end
            url = `${API_BASE_URL}/substituir/${cpfOriginal}`;
            metodoHTTP = 'PUT'; 
        }

        const respostaApi = await fetch(url, {
            method: metodoHTTP,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAtual}` 
            },
            body: JSON.stringify(cadastroData)
        });

        if (respostaApi.ok) {
            alert(cpfOriginal ? "Atualizado!" : "Criado com sucesso!");
            limparFormulario();
            carregarCadastros(); 
        } else {
            const erroRes = await respostaApi.json();
            alert("Erro: " + (erroRes.erro || "Falha ao salvar."));
        }
    } catch (erro) {
        console.error("Erro no salvamento:", erro);
    }
});

// Funções globais corrigidas
window.editarCadastro = function(cpf) {
    const cadastro = cadastros.find(c => String(c.cpf) === String(cpf));
    if (cadastro) {
        document.getElementById('cadastroId').value = cadastro.cpf;
        document.getElementById('cpf').value = cadastro.cpf;
        document.getElementById('nome').value = cadastro.nome;
        formTitle.textContent = "Editar Cadastro";
        btnCancelar.classList.remove('hidden');
    }
};

window.deletarCadastro = async function(cpf) {
    if (!confirm("Excluir este cadastro?")) return;
    try {
        // Rota de exclusão do back-end
        const resposta = await fetch(`${API_BASE_URL}/excluir/${cpf}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${tokenAtual}` }
        });
        if (resposta.ok) {
            carregarCadastros();
        } else {
            alert("Erro ao excluir usuário.");
        }
    } catch (erro) {
        console.error("Erro ao deletar:", erro);
    }
};

btnCancelar.addEventListener('click', limparFormulario);

function limparFormulario() {
    cadastroForm.reset();
    document.getElementById('cadastroId').value = ''; 
    formTitle.textContent = "Novo Cadastro";
    btnCancelar.classList.add('hidden');
}

function mostrarLogin() {
    loginSection.classList.remove('hidden');
    adminSection.classList.add('hidden');
    userInfo.classList.add('hidden');
}

function mostrarPainelAdmin() {
    loginSection.classList.add('hidden');
    adminSection.classList.remove('hidden');
    userInfo.classList.remove('hidden');
}
// Lógica para mostrar/esconder senha
const togglePassword = document.querySelector('#togglePassword');
const passwordField = document.querySelector('#password');
const eyeIcon = document.querySelector('#eyeIcon');

togglePassword.addEventListener('click', function () {
    // Alterna entre o tipo password e text
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);
    
    // Alterna as classes do ícone (olho aberto / olho cortado)
    if (type === 'text') {
        eyeIcon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        eyeIcon.classList.replace('fa-eye-slash', 'fa-eye');
    }
});


iniciarApp();