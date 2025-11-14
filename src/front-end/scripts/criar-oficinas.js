document.addEventListener('DOMContentLoaded', function () {
    
    // --- Lógica da NavBar (sem alteração) ---
    const loginBtn = document.getElementById('loginBtn')
    const cadastroBtn = document.getElementById('cadastroBtn')
    const logoutBtn = document.getElementById('logoutBtn')
    const perfilBtn = document.getElementById('perfilBtn')
    const criarOficinaBtn = document.getElementById('criarOficinaBtn')

    loginBtn.style.display = 'none'
    cadastroBtn.style.display = 'none'
    logoutBtn.style.display = 'none'
    perfilBtn.style.display = 'none'

    if (criarOficinaBtn) {
        const isAdmin = localStorage.getItem('isAdmin') === 'true'
        criarOficinaBtn.style.display = isAdmin ? 'inline-block' : 'none'
    }

    const token = localStorage.getItem('token')
    if (token) {
        logoutBtn.style.display = 'inline-block'
        perfilBtn.style.display = 'inline-block'
    } else {
        loginBtn.style.display = 'inline-block'
        cadastroBtn.style.display = 'inline-block'
    }

    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault()
        localStorage.removeItem('token')
        localStorage.removeItem('isAdmin')
        location.reload()
    })

    // --- Lógica da Página de Criar/Editar ---

    // Referências aos elementos do formulário
    const form = document.querySelector('.create-workshop-form');
    const tituloInput = document.getElementById('titulo');
    const professorInput = document.getElementById('professor');
    const descricaoInput = document.getElementById('descricao');
    const dataInput = document.getElementById('data');
    const horarioInput = document.getElementById('horario');
    const vagasInput = document.getElementById('vagas');
    const submitButton = form.querySelector('button[type="submit"]');

    // Referências aos novos elementos de busca
    const searchIdInput = document.getElementById('searchId');
    const searchButton = document.getElementById('searchOficinaBtn');
    const cancelEditButton = document.getElementById('cancelEditBtn');
    const editMessage = document.getElementById('editMessage');

    let editingOficinaId = null; // Guarda o ID da oficina que estamos a editar

    // Função para limpar o formulário e voltar ao modo "Criar"
    function resetForm() {
        form.reset(); // Limpa todos os campos
        submitButton.textContent = 'Criar Oficina'; // Muda o texto do botão
        submitButton.style.backgroundColor = '#4f46e5'; // Cor original
        cancelEditButton.style.display = 'none'; // Esconde o botão "Cancelar"
        editMessage.textContent = ''; // Limpa a mensagem
        searchIdInput.value = ''; // Limpa o campo de busca de ID
        editingOficinaId = null; // Limpa o ID
    }

    // --- Event Listener do Botão de BUSCA ---
    searchButton.addEventListener('click', async () => {
        const id = searchIdInput.value.trim();
        if (!id) {
            editMessage.textContent = 'Por favor, insira um ID.';
            editMessage.style.color = 'red';
            return;
        }

        try {
            const response = await fetch(`/api/oficinas/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Erro ao buscar oficina.');
            }

            // Se encontrou, preenche o formulário
            const oficina = result;
            tituloInput.value = oficina.nome;
            professorInput.value = oficina.professor;
            descricaoInput.value = oficina.descricao;
            // Formata a data para YYYY-MM-DD
            dataInput.value = new Date(oficina.data).toISOString().split('T')[0]; 
            horarioInput.value = oficina.horario;
            vagasInput.value = oficina.vagas;

            // Muda para o modo "Editar"
            editingOficinaId = oficina._id;
            submitButton.textContent = 'Salvar Alterações';
            submitButton.style.backgroundColor = '#34d399'; // Cor verde (sucesso)
            cancelEditButton.style.display = 'inline-block';
            editMessage.textContent = `Editando oficina: ${oficina.nome}`;
            editMessage.style.color = 'blue';

        } catch (error) {
            editMessage.textContent = error.message;
            editMessage.style.color = 'red';
            resetForm(); // Limpa se der erro
        }
    });

    // --- Event Listener do Botão de CANCELAR ---
    cancelEditButton.addEventListener('click', resetForm);


    // --- Event Listener do SUBMIT (Criar OU Editar) ---
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const oficinaData = {
            titulo: tituloInput.value,
            professor: professorInput.value,
            descricao: descricaoInput.value,
            data: dataInput.value,
            horario: horarioInput.value,
            vagas: vagasInput.value
        };

        let url = '/criar-oficina';
        let method = 'POST';

        // Se tivermos um ID, estamos a EDITAR (PUT)
        if (editingOficinaId) {
            url = `/api/oficinas/${editingOficinaId}`;
            method = 'PUT';
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Envia o token
                },
                body: JSON.stringify(oficinaData)
            });

            const result = await response.json();

            if (!response.ok) {
                // Se o token for inválido ou não for o criador, cairá aqui
                throw new Error(result.message || 'Erro ao salvar oficina.');
            }

            alert(result.message); // "Oficina criada/atualizada com sucesso!"
            resetForm(); // Limpa o formulário

        } catch (error) {
            alert(error.message);
        }
    });
});
