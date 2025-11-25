# Projeto de Gerenciamento de Oficinas

## Ferramentas utilizadas

### Compilação
- Node  
- Visual Studio Code

### Hospedagem
- GitHub: https://github.com  
- MongoDbAtlas: https://www.mongodb.com/products/platform/atlas-database  
- Render: https://render.com/

---

## Versões das bibliotecas

- node: 22.9.0  
- bcrypt: 6.0.0  
- cors: 2.8.5  
- dotenv: 17.2.3  
- express: 5.1.0  
- jsonwebtoken: 9.0.2  
- mongoose: 8.19.2  
- nodemon: 3.1.10  

---

## Roteiro para criar e executar a base de dados e compilar o projeto

Após baixar o projeto:

### 1. Instalar dependências

### 2. Criar o arquivo `.env` na raiz do projeto com o seguinte conteúdo:

MONGODB_URI="mongodb+srv://felipegodoicirino_db_user:RMmLhIuNMF4fkrKv@certificadora.s2cnarq.mongodb.net/?appName=Certificadora"
PORT=3000
SECRET=senhasecreta12
BASE_URL=http://localhost:3000

### 3. Iniciar o projeto

npm start

### 4. Acessar pelo navegador

http://localhost:3000

### 5. Acessar o site hospedado
https://certificadora-2025-11.onrender.com/



## Nome da equipe
**Nr 03**


## Objetivo do Sistema

Atender à uma demanda de usuários composta majoritariamente por alunos e professores da UTFPR de Cornélio Procópio, permitindo que os professores disponibilizem
o acesso às oficinas internas da universidade para os alunos e demais pessoas da comunidade que queiram participar.
Também permitirá que usuários tenham acesso à um histórico das oficinas que participaram e que estão cadastrados.



## Funcionalidades desenvolvidas

- Usuário pode mudar entre diferentes páginas do site através da barra de navegação;
- Usuário pode criar um novo cadastro a partir de um email individual (apenas um cadastro por email);
- Usuário pode realizar o login através da página de login;
- Ao realizar o login, os botões de login e cadastro da barra de tarefas serão alterados para botões de sair (log out) e perfil;
- Usuário pode acessar, através da página de oficinas, as oficinas disponíveis no site;
- Usuário pode se inscrever, assim como cancelar sua inscrição em oficinas cujo status seja "aberta";
- Usuário não conseguirá se cadastrar em oficinas caso não esteja logado ou caso a oficina já tenha sido finalizada;
- Status das oficinas serão mudados para "finalizada" após o dia e horário de início serem atingidos;
- Apenas usuários administradores terão acesso às páginas de criar e gerenciar oficinas;
- Usuários administradores poderão criar e alterar oficinas;
- Usuários terão acesso à uma página de perfil, onde poderão ver suas informações de usuário, oficinas nas quais estão cadastrados e oficinas que participaram e concluíram;
- Usuário poderá realizar o Log out caso esteja logado no site;

---

## Contas padrão (admin)

- **email:** felipegodoi.cirino@gmail.com  
  **senha:** 123456  

- **email:** z@gmail.com  
  **senha:** 123456  

- **email:** Rodrigo@gmail.com  
  **senha:** 123456  



