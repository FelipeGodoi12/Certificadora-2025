// front-end/scripts/perfil.js

let currentUser = null
let currentToken = null

document.addEventListener('DOMContentLoaded', async () => {
    currentToken = localStorage.getItem('token')

    if (!currentToken) {
        window.location.href = '/login'
        return
    }

    try {
        // 1) Carrega dados básicos do usuário
        const resProfile = await fetch(`${window.BASE_URL}/users/profile`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${currentToken}`,
                'Content-Type': 'application/json',
            },
        })

        if (!resProfile.ok) {
            window.location.href = '/login'
            return
        }

        currentUser = await resProfile.json()

        document.getElementById('profile-nome').textContent = currentUser.nome
        document.getElementById('profile-email').textContent = currentUser.email
        document.getElementById('profile-role').textContent =
            currentUser.admin ? 'Administrador' : 'Usuário padrão'

        if (currentUser.admin) {
            document.getElementById('admin-section').style.display = 'block'
        }

        // 2) Carrega oficinas inscritas
        await carregarOficinas()

        // 3) Liga o listener para cliques no botão de cancelar
        configurarCancelamento()
    } catch (err) {
        console.error('Erro ao carregar perfil:', err)
        window.location.href = '/login'
    }
})

async function carregarOficinas() {
    const res = await fetch(`${window.BASE_URL}/users/minhas-oficinas`, {
        headers: { Authorization: `Bearer ${currentToken}` }
    })

    const { ativas, concluidas } = await res.json()

    const aDiv = document.getElementById('lista-ativas')
    const cDiv = document.getElementById('lista-concluidas')

    aDiv.innerHTML = ''
    cDiv.innerHTML = ''

    ativas.forEach(o => aDiv.appendChild(renderCard(o, true)))
    concluidas.forEach(o => cDiv.appendChild(renderCard(o, false)))
}

function renderCard(o, podeCancelar) {
    const div = document.createElement('div')
    div.className = 'oficina-card'
    const data = new Date(o.dataInscricao).toLocaleDateString('pt-BR')

    div.innerHTML = `
		<h3>${o.nome}</h3>
		<p>Status da inscrição: ${o.statusInscricao}</p>
		<p>Status da oficina: ${o.statusOficina}</p>
		<p>Inscrito em: ${data}</p>
		<p>Vagas restantes: ${o.vagasRestantes}</p>
	`

    if (podeCancelar && o.statusInscricao === 'inscrito' && o.statusOficina === 'Aberta') {
        const btn = document.createElement('button')
        btn.className = 'cancelar-btn btn-cancelar-oficina'
        btn.textContent = 'Cancelar inscrição'
        btn.dataset.id = o.id
        div.appendChild(btn)
    }

    return div
}

function configurarCancelamento() {
    const lista = document.getElementById('lista-oficinas')

    lista.addEventListener('click', async (event) => {
        const btn = event.target

        if (!btn.classList.contains('btn-cancelar-oficina')) return

        const oficinaId = btn.dataset.oficinaId
        if (!oficinaId || !currentUser) return

        const confirmar = window.confirm('Deseja realmente cancelar sua inscrição nesta oficina?')
        if (!confirmar) return

        try {
            const res = await fetch(`${window.BASE_URL}/api/oficinas/${oficinaId}/cancelar`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: currentUser.email,
                }),
            })

            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                console.error('Erro ao cancelar inscrição:', body)
                alert(body.msg || body.erro || 'Erro ao cancelar inscrição.')
                return
            }

            // sucesso → recarrega lista
            await carregarOficinas()
        } catch (err) {
            console.error('Erro ao cancelar inscrição:', err)
            alert('Erro inesperado ao cancelar inscrição.')
        }
    })
}

// Event delegation to catch clicks from any cancel button
document.addEventListener('click', async (e) => {
    if (!e.target.classList.contains('btn-cancelar-oficina')) return

    const id = e.target.dataset.id

    const confirmar = window.confirm('Deseja realmente cancelar sua inscrição?')
    if (!confirmar) return

    try {
        await fetch(`${window.BASE_URL}/api/oficinas/${id}/cancelar`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentUser.email })
        })

        // Refresh the lists after cancellation
        carregarOficinas()
    } catch (err) {
        console.error('Erro ao cancelar inscrição:', err)
        alert('Não foi possível cancelar. Tente novamente.')
    }
})