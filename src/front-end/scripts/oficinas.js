// Barra de navegação
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

document.addEventListener('DOMContentLoaded', function () {
    let oficinasData = []

    const searchInput = document.getElementById('searchInput')
    const searchBtn = document.getElementById('searchBtn')
    const container = document.getElementById('oficinasContainer')

    // ---- BUSCA OFICINAS E RENDER ----
    fetch('/oficinas/list')
        .then(res => res.json())
        .then(data => {
            oficinasData = data
            renderOficinas(oficinasData)
        })
        .catch(() => {
            container.innerHTML = "<p style='color: red'>Erro ao listar oficinas.</p>"
        })

    function buscarOficinas() {
        const termo = searchInput.value.trim().toLowerCase()
        if (termo === "") {
            renderOficinas(oficinasData)
            return
        }
        const filtradas = oficinasData.filter(oficina =>
            (oficina.nome || '').toLowerCase().includes(termo) ||
            (oficina.professor || '').toLowerCase().includes(termo) ||
            (oficina.descricao || '').toLowerCase().includes(termo)
        )
        renderOficinas(filtradas)
    }

    searchBtn.addEventListener('click', buscarOficinas)
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') buscarOficinas()
    })

    // ---- RENDERIZAÇÃO DOS CARDS ----
    function renderOficinas(lista) {
        container.innerHTML = ""
        if (!Array.isArray(lista) || lista.length === 0) {
            container.innerHTML = "<p>Nenhuma oficina encontrada.</p>"
            return
        }
        lista.forEach(oficina => {
            const card = document.createElement('div')
            card.className = "oficina-card"
            card.innerHTML = `
                <h3>${oficina.nome || ''}</h3>
                <p><strong>Professor:</strong> ${oficina.professor || ''}</p>
                <p><strong>Data:</strong> ${oficina.data ? new Date(oficina.data).toLocaleDateString() : ''}</p>
                <p><strong>Horário:</strong> ${oficina.horario || ''}</p>
                <p><strong>Vagas:</strong> ${oficina.inscritos.length}/${oficina.vagas || ''}</p> 
                <p><strong>Status:</strong> ${oficina.status || ''}</p>
                <p>${oficina.descricao || ''}</p>
                <button class="inscrever-btn" data-id="${oficina._id}" data-oficina-nome="${oficina.nome}">Inscrever-se</button>
                <button class="cancelar-btn" data-nome="${oficina.nome}">Cancelar inscrição</button>
            `
            container.appendChild(card)
        })
    }


    // ---- INSCRIÇÃO ----
    container.addEventListener('click', async function (e) {
    // Inscrever-se
    if (e.target.classList.contains('inscrever-btn')) {
        const oficinaNome = e.target.dataset.oficinaNome
        const email = localStorage.getItem('email')
        const token = localStorage.getItem('token')
        if (!token || !email) {
            alert('Você precisa estar logado para se inscrever!')
            window.location.href = '/login'
            return
        }
        try {
            const response = await fetch('http://localhost:3000/oficinas/inscrever', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: email,
                    nome: oficinaNome
                })
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.msg || 'Erro')
            alert('Inscrição realizada com sucesso!')
            window.location.reload()
        } catch (err) {
            alert('Erro ao se inscrever: ' + err.message)
        }
    }

    // **Cancelar inscrição**
    if (e.target.classList.contains('cancelar-btn')) {
        const nomeOficina = e.target.dataset.nome
        const email = localStorage.getItem('email')
        const token = localStorage.getItem('token')
        if (!token || !email) {
            alert('Você precisa estar logado para cancelar inscrição!')
            window.location.href = '/login'
            return
        }
        try {
            const response = await fetch('http://localhost:3000/oficinas/cancelar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: email,
                    nome: nomeOficina
                })
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.msg || 'Erro ao cancelar.')
            alert('Inscrição cancelada com sucesso!')
            window.location.reload()
            } catch (err) {
                alert('Erro ao cancelar inscrição: ' + err.message)
            }
        }
    })
})


