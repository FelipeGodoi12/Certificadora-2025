document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault()

    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    console.log(window)
    try {
        const resposta = await fetch(`${window.BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })

        const resultado = await resposta.json()

        const msg = document.getElementById('mensagem')
        if (resposta.ok && resultado.token) {
            localStorage.setItem('token', resultado.token)
            localStorage.setItem('isAdmin', resultado.admin)
            msg.textContent = 'Login realizado com sucesso'
            window.location.href = '/'
        } else {
            msg.textContent = resultado.erro || 'Email ou senha incorretos!'
        }
    } catch (error) {
        console.log(error)
        document.getElementById('mensagem').textContent = 'Erro ao conectar com o servidor.'
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

    //Log out
    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault()
        localStorage.removeItem('token')
        localStorage.removeItem('isAdmin')
        location.reload()
    })
})