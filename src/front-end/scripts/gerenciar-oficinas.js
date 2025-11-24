// front-end/scripts/gerenciar-oficinas.js

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('adminOficinasContainer')
    if (!container) {
        return
    }

    const API_BASE =
        window.BASE_URL ||
        (window.ENV && (window.ENV.API_BASE_URL || window.ENV.BASE_URL)) ||
        ''

    const token = localStorage.getItem('token')
    if (!token) {
        window.location.href = '/login'
        return
    }

    try {
        // Usa currentUser se o header já tiver carregado
        let user = window.currentUser
        if (!user) {
            const res = await fetch(`${API_BASE}/users/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) {
                window.location.href = '/login'
                return
            }
            user = await res.json()
            window.currentUser = user
        }

        if (!user.admin) {
            window.location.href = '/'
            return
        }

        await carregarOficinasAdmin(API_BASE, token, container)
    } catch (err) {
        console.error('Erro ao validar admin / carregar oficinas:', err)
        window.location.href = '/login'
    }
})

async function carregarOficinasAdmin(API_BASE, token, container) {
    try {
        const resp = await fetch(`${API_BASE}/api/oficinas`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })

        if (!resp.ok) {
            console.error('Erro ao carregar oficinas para admin')
            return
        }

        const oficinas = await resp.json()
        container.innerHTML = ''

        oficinas.forEach((oficina) => {
            const card = document.createElement('div')
            card.className = 'oficina-card'

            const data = new Date(oficina.data)
            const dataFormatada = data.toLocaleDateString('pt-BR')
            const horaFormatada = data.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
            })

            const vagasRestantes = oficina.vagas - oficina.inscritos.length

            card.innerHTML = `
				<h3>${oficina.nome}</h3>
				<p><strong>Professor:</strong> ${oficina.professor}</p>
				<p><strong>Data:</strong> ${dataFormatada} às ${horaFormatada}</p>
				<p><strong>Vagas:</strong> ${oficina.inscritos.length} / ${oficina.vagas} (restam ${vagasRestantes})</p>
				<p><strong>Status atual:</strong> 
					<span class="status-label" data-status="${oficina.status}">
						${oficina.status}
					</span>
				</p>

				<div class="button-group" style="margin-top: 16px; gap: 8px; flex-wrap: wrap;">
					<button class="inscrever-btn btn-status" data-status="Aberta" data-id="${oficina._id}">
						Abrir inscrições
					</button>
					<button class="cancelar-btn btn-status" data-status="Fechada" data-id="${oficina._id}">
						Fechar inscrições
					</button>
					<button class="cancelar-btn btn-status" data-status="finalizada" data-id="${oficina._id}">
						Finalizar oficina
					</button>
				</div>
			`

            container.appendChild(card)
        })

        // Delegação de eventos para os botões
        container.addEventListener('click', async (e) => {
            const btn = e.target.closest('.btn-status')
            if (!btn) return

            const oficinaId = btn.dataset.id
            const novoStatus = btn.dataset.status

            await atualizarStatusOficina(API_BASE, token, oficinaId, novoStatus, btn)
        })
    } catch (err) {
        console.error('Erro ao carregar oficinas admin:', err)
    }
}

async function atualizarStatusOficina(API_BASE, token, oficinaId, novoStatus, btn) {
    try {
        const resp = await fetch(`${API_BASE}/api/oficinas/${oficinaId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ novoStatus }),
        })

        const data = await resp.json().catch(() => ({}))

        if (!resp.ok) {
            alert(data.message || 'Erro ao atualizar status da oficina.')
            return
        }

        const statusSpan = btn
            .closest('.oficina-card')
            .querySelector('.status-label')

        if (statusSpan) {
            statusSpan.textContent = data.status || novoStatus
            statusSpan.dataset.status = data.status || novoStatus
        }

        alert(data.message || 'Status atualizado com sucesso!')
    } catch (err) {
        console.error('Erro ao atualizar status da oficina:', err)
        alert('Erro ao atualizar status da oficina.')
    }
}