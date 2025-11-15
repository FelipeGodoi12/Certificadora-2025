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
    container.className = "workshop-list"
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
                // Formatar data para 'dd/mm/aaaa'
                let dataFormatada = ''
                let statusDinamico = ''
                if (oficina.data) {
                    try {
                        const dataObj = new Date(oficina.data)
                        dataFormatada = dataObj.toLocaleDateString('pt-BR')
                        // Combinar data e horário para comparar
                        let [hora, minuto] = (oficina.horario || '00:00').split(':')
                        dataObj.setHours(Number(hora), Number(minuto), 0, 0)
                        const agora = new Date()
                        statusDinamico = (dataObj > agora) ? 'Aberta' : 'Finalizada'
                    } catch {
                        dataFormatada = oficina.data
                        statusDinamico = oficina.status || ''
                    }
                }
                card.innerHTML = `
                    <h2>${oficina.nome}</h2>
                    <p><strong>Professor:</strong> ${oficina.professor}</p>
                    <p><strong>Data:</strong> ${dataFormatada}</p>
                    <p><strong>Horário:</strong> ${oficina.horario}</p>
                    <p><strong>Vagas:</strong> ${oficina.vagas}</p>
                    <p>${oficina.descricao}</p>
                    <p><strong>Status:</strong> ${statusDinamico}</p>
                    <button class="inscrever-btn" data-id="${oficina._id}">Inscrever-se</button>
                `
                container.appendChild(card)
            })
        }

        container.addEventListener('click', async function (e) {
            if (e.target.classList.contains('inscrever-btn') || e.target.classList.contains('cancelar-btn')) {
                const id = e.target.dataset.id
                const token = localStorage.getItem('token')
                if (!token) {
                    alert('Você precisa estar logado para se inscrever.');
                    return;
                }
                try {
                    if (e.target.classList.contains('inscrever-btn')) {
                        // Inscrever
                        const resp = await fetch(`/api/oficinas/${id}/inscrever`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` }
                        })
                        const data = await resp.json()
                        if (resp.ok) {
                            e.target.textContent = 'Cancelar Inscrição'
                            e.target.classList.remove('inscrever-btn')
                            e.target.classList.add('cancelar-btn')
                            alert('Inscrição realizada com sucesso!')
                        } else {
                            alert(data.message || 'Erro ao inscrever.')
                        }
                    } else if (e.target.classList.contains('cancelar-btn')) {
                        // Cancelar inscrição
                        const resp = await fetch(`/api/oficinas/${id}/cancelar`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        })
                        const data = await resp.json()
                        if (resp.ok) {
                            e.target.textContent = 'Inscrever-se'
                            e.target.classList.remove('cancelar-btn')
                            e.target.classList.add('inscrever-btn')
                            alert('Inscrição cancelada com sucesso!')
                        } else {
                            alert(data.message || 'Erro ao cancelar inscrição.')
                        }
                    }
                } catch (err) {
                    alert('Erro ao processar requisição.')
                }
            }
        })

    } catch (e) {
        container.innerHTML = "<p style='color: red;'>Erro ao listar oficinas.</p>"
    }
})