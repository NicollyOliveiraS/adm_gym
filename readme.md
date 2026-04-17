🌿 GreenFit - Painel Administrativo
O GreenFit Admin é uma interface de gerenciamento para o ecossistema da academia GreenFit. Desenvolvido para oferecer um controle centralizado de alunos e colaboradores, o painel permite realizar operações de CRUD (Criar, Ler, Atualizar e Deletar) de forma segura e intuitiva, com um design moderno em modo escuro (Dark Mode).

🚀 Funcionalidades
Autenticação Segura: Acesso restrito via login com armazenamento de Token JWT no localStorage.

Gestão de Cadastros:

Criação de novos usuários com validação de CPF.

Edição de dados existentes (Nome, CPF e Status).

Exclusão de registros com confirmação de segurança.

Filtros Inteligentes:

O campo de nome aceita apenas letras e formata automaticamente a primeira letra em maiúscula.

O campo de CPF aceita apenas números e bloqueia sequências repetidas (ex: 111.111.111-11).

Interface Responsiva: Adaptável para desktops, tablets e dispositivos móveis.

Visualização de Status: Sistema de badges coloridos para identificar usuários Ativos, Inativos ou Pendentes.

🛠️ Tecnologias Utilizadas
HTML5: Estruturação semântica da aplicação.

CSS3: Estilização personalizada com variáveis, CSS Grid, Flexbox e animações de glow.

JavaScript (ES6+): Lógica de consumo de API (Fetch API), manipulação de DOM e validações.

Font Awesome: Ícones vetoriais para interface.

Vercel: Hospedagem da API (Backend).

📂 Estrutura do Projeto
Plaintext
├── index.html      # Estrutura principal e seções de Login/Admin
├── style.css       # Estilização visual (Glow, Dark Mode, Responsividade)
├── admin.js        # Lógica de autenticação, consumo de API e CRUD
└── img/            # Ativos visuais (Logo gf.png)
⚙️ Configuração
Para rodar o projeto localmente:

Certifique-se de que a API base em https://academia-limpo.vercel.app está operacional.

Abra o arquivo index.html em qualquer navegador moderno.

Nota de Segurança: O arquivo admin.js utiliza uma API_BASE_URL. Caso o backend mude de endereço, basta atualizar essa constante no topo do arquivo.

🔒 Segurança de Dados
Token: Após o login, o token de acesso é enviado no header Authorization (Bearer) de todas as requisições subsequentes.

Validação de Input: Scripts impedem a inserção de caracteres especiais em campos numéricos e validam o formato básico do CPF antes do envio ao servidor.

📝 Licença
Este projeto foi desenvolvido para uso interno da academia GreenFit.