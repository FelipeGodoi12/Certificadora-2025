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

document.querySelector('.create-workshop-form').addEventListener('submit', async function(e) {
    e.preventDefault()
    const titulo = document.getElementById('titulo').value
    const professor = document.getElementById('professor').value
    const descricao = document.getElementById('descricao').value
    const data = document.getElementById('data').value
    const horario = document.getElementById('horario').value
    const vagas = document.getElementById('vagas').value

    const response = await fetch('/criar-oficina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, professor, descricao, data, horario, vagas })
    })
    const result = await response.json()
    alert(result.message)
})