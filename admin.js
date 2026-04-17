/**
 * ARQUIVO: admin.js - Versão Final Integrada
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

// 2. LÓGICA DO OLHO (MOSTRAR/ESCONDER SENHA)
// Lógica corrigida do Olho (Mostrar/Esconder Senha)


if (togglePassword) {
    togglePassword.addEventListener('click', function () {
        // Inverte o tipo do input
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        
        // Ajusta o ícone corretamente
        if (type === 'password') {
             eyeIcon.classList.remove('fa-eye');
            eyeIcon.classList.add('fa-eye-slash'); // Ícone de "Cortado" quando está visível
        } else {
           
             eyeIcon.classList.remove('fa-eye-slash');
            eyeIcon.classList.add('fa-eye');
        }
    });
}

// 3. AUTENTICAÇÃO (LOGIN)
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

// 4. CARREGAR DADOS DO SERVIDOR (CONSULTA)
async function carregarCadastros() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/consulta`, {
            headers: { 'Authorization': `Bearer ${tokenAtual}` }
        });
        if (resposta.ok) {
            const dados = await resposta.json();
            cadastros = dados.usuarios;
            renderizarTabela();
        } else if (resposta.status === 401) {
            btnLogout.click(); // Token expirado
        }
    } catch (erro) {
        console.error("Erro ao carregar:", erro);
    }
}

// 5. RENDERIZAR TABELA COM ID E STATUS
function renderizarTabela() {
    tabelaCadastros.innerHTML = ''; 
    totalCadastrosEl.textContent = cadastros.length;

    cadastros.forEach(cadastro => {
        const tr = document.createElement('tr');
        
        // No Firebase/Flask o ID vem como 'id'. Se não existir, mostra '---'
        const idExibido = cadastro.id
        const status = cadastro.status || 'Pendente';
        const statusClass = `status-${status.toLowerCase()}`;

        tr.innerHTML = `
            
            <td style="padding: 12px; color: #fff;">${cadastro.nome}</td>
            <td style="padding: 12px; color: #4f8b4f;">${cadastro.cpf}</td>
            <td style="padding: 12px;">
                <span class="status-badge ${statusClass}">${status}</span>
            </td>
            <td style="padding: 12px; text-align: right;">
                <button onclick="editarCadastro('${cadastro.cpf}')" style="color: #4f8b4f; background: none; border: none; cursor: pointer; margin-right: 15px; font-weight: bold;">EDITAR</button>
                <button onclick="deletarCadastro('${cadastro.cpf}')" style="color: #ff4444; background: none; border: none; cursor: pointer; font-weight: bold;">EXCLUIR</button>
            </td>
        `;
        tabelaCadastros.appendChild(tr);
    });
}

// 6. SALVAR OU EDITAR CADASTRO
cadastroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const idEdicao = document.getElementById('cadastroId').value;
    const nome = document.getElementById('nome').value;
    const cpf = document.getElementById('cpf').value;
    const status = document.getElementById('status').value; // Valor do Select

    const dados = { nome, cpf, status };
    
    // Se tiver idEdicao usamos PUT (substituir), senão POST (novo)
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
            alert(idEdicao ? "Atualizado!" : "Cadastrado!");
        } else {
            const erro = await resposta.json();
            alert("Erro: " + (erro.erro || erro.mensagem));
        }
    } catch (erro) {
        console.error("Erro ao salvar:", erro);
    }
});

// 7. FUNÇÕES DE APOIO (EDITAR, EXCLUIR, SAIR)
window.editarCadastro = function(cpf) {
    const cadastro = cadastros.find(c => String(c.cpf) === String(cpf));
    if (cadastro) {
        // Guarda o CPF para a rota de busca
        document.getElementById('cadastroId').value = cadastro.cpf;
        
        // Preenche os campos visíveis
        document.getElementById('cpf').value = cadastro.cpf;
        document.getElementById('nome').value = cadastro.nome;
        
        // Garante que o status também seja carregado no select ao editar
        if(document.getElementById('status')) {
            document.getElementById('status').value = cadastro.status || 'Pendente';
        }

        formTitle.textContent = "Editar Cadastro";
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

window.deletarCadastro = async function(cpf) {
    if (!confirm("Excluir este cadastro?")) return;
    try {
        const resposta = await fetch(`${API_BASE_URL}/excluir/${cpf}`, {
            method: 'DELETE',
            
        });
        if (resposta.ok) carregarCadastros();
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
// Restrição para o campo NOME (impede números e caracteres especiais)
document.getElementById('nome').addEventListener('input', function (e) {
    this.value = this.value.replace(/[0-9]/g, ''); // Remove qualquer número
});

// Restrição para o campo CPF (impede letras e limita a 11 dígitos)
document.getElementById('cpf').addEventListener('input', function (e) {
    // Remove tudo o que não for número
    let value = this.value.replace(/\D/g, ''); 
    
    // Limita a 11 caracteres
    if (value.length > 11) {
        value = value.slice(0, 11);
    }
    
    this.value = value;
});
btnCancelar.addEventListener('click', limparFormulario);
// Adicione isto ao final do seu admin.js
const inputNome = document.getElementById('nome');

if (inputNome) {
    inputNome.addEventListener('input', function() {
        // Remove qualquer caractere que NÃO seja letra ou espaço
        this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
    });
}

// INICIAR
iniciarApp();