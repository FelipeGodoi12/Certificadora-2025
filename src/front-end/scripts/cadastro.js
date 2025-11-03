document.querySelector('form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('senha').value;
    const confirmaSenha = document.getElementById('confirmaSenha').value;

    if (password !== confirmaSenha) {
        alert('As senhas não conferem!');
        return;
    }

    const res = await fetch(`${window.BASE_URL}/users/cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, password })
    });

    const data = await res.json();

    if (res.ok) {
        alert('Cadastro realizado com sucesso')
        window.location.href = '/login'
    } else {
        alert(data.erro || 'Erro')
    }
})

document.addEventListener('DOMContentLoaded', function () {

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
})