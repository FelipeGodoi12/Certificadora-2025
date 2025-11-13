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


document.addEventListener('DOMContentLoaded', async function () {

    const container = document.createElement('div')
    container.className = "oficinas-lista"
    document.body.appendChild(container)

    try {
        const response = await fetch('/oficinas/list')
        if (!response.ok) throw new Error('Erro ao carregar oficinas')
        const oficinas = await response.json()

        container.innerHTML = ""

        if (oficinas.length === 0) {
            container.innerHTML = "<p>Nenhuma oficina cadastrada no momento.</p>"
        } else {
            oficinas.forEach(oficina => {
                const card = document.createElement('div')
                card.className = "oficina-card"
                card.innerHTML = `
                    <h2>${oficina.nome}</h2>
                    <p><strong>Professor:</strong> ${oficina.professor}</p>
                    <p><strong>Data:</strong> ${oficina.data}</p>
                    <p><strong>Horário:</strong> ${oficina.horario}</p>
                    <p><strong>Vagas:</strong> ${oficina.vagas}</p>
                    <p>${oficina.descricao}</p>
                    <p>${oficina.status}</p>
                    <button class="inscrever-btn" data-id="${oficina._id}">Inscrever-se</button>
                `
                container.appendChild(card)
            })
        }

        container.addEventListener('click', function (e) {
            if (e.target.classList.contains('inscrever-btn')) {
                const id = e.target.dataset.id
                // 
                alert('Inscrição na oficina de id: ' + id)
            }
        })

    } catch (e) {
        container.innerHTML = "<p style='color: red;'>Erro ao listar oficinas.</p>"
    }
})