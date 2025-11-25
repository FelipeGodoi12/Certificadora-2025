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

    // 1. Inicializa a lógica do Modal de Edição (fechar, submeter form)
    initModalLogic(API_BASE, token);

    try {
        // Validação de Admin (usa currentUser se disponível ou busca no back)
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

        // 2. Carrega a lista de oficinas
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

            const dataObj = new Date(oficina.data)
            const dataFormatada = dataObj.toLocaleDateString('pt-BR')
            const horaFormatada = dataObj.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
            })

            // Prepara data para o input do tipo "date" (yyyy-MM-dd)
            const dataInputFormat = dataObj.toISOString().split('T')[0];

            const vagasRestantes = oficina.vagas - (oficina.inscritos ? oficina.inscritos.length : 0)

            // Renderiza o card com o novo botão "Editar"
            card.innerHTML = `
                <h3>${oficina.nome}</h3>
                <p><strong>Professor:</strong> ${oficina.professor}</p>
                <p><strong>Data:</strong> ${dataFormatada} às ${horaFormatada}</p>
                <p><strong>Vagas:</strong> ${oficina.inscritos ? oficina.inscritos.length : 0} / ${oficina.vagas} (restam ${vagasRestantes})</p>
                <p><strong>Status atual:</strong> 
                    <span class="status-label" data-status="${oficina.status}">
                        ${oficina.status}
                    </span>
                </p>

                <div class="button-group" style="margin-top: 16px; gap: 8px; flex-wrap: wrap;">
                    <button class="btn-editar" 
                        data-nome="${oficina.nome}"
                        data-professor="${oficina.professor}"
                        data-descricao="${oficina.descricao}"
                        data-data="${dataInputFormat}"
                        data-horario="${oficina.horario}"
                        data-vagas="${oficina.vagas}"
                    >Editar</button>

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

        // Delegação de eventos (Status e Edição)
        container.addEventListener('click', async (e) => {
            // Clique no botão de STATUS
            const btnStatus = e.target.closest('.btn-status')
            if (btnStatus) {
                const oficinaId = btnStatus.dataset.id
                const novoStatus = btnStatus.dataset.status
                await atualizarStatusOficina(API_BASE, token, oficinaId, novoStatus, btnStatus)
                return
            }

            // Clique no botão de EDITAR
            const btnEditar = e.target.closest('.btn-editar')
            if (btnEditar) {
                abrirModal(btnEditar.dataset)
            }
        })
    } catch (err) {
        console.error('Erro ao carregar oficinas admin:', err)
    }
}

// === LÓGICA DO MODAL E EDIÇÃO ===

function initModalLogic(API_BASE, token) {
    const modal = document.getElementById('modal-editar')
    const btnFechar = document.getElementById('btn-fechar-modal')
    const form = document.getElementById('form-editar-oficina')

    if (!modal || !form) return // Se o HTML do modal não existir, ignora

    // Botão Cancelar/Fechar
    btnFechar.addEventListener('click', () => {
        modal.style.display = 'none'
    })

    // Submit do formulário de edição
    form.addEventListener('submit', async (e) => {
        e.preventDefault()

        const nomeOriginal = document.getElementById('edit-nome-original').value
        
        const payload = {
            nomeAtual: nomeOriginal, // Chave para buscar no back-end
            titulo: document.getElementById('edit-titulo').value,
            professor: document.getElementById('edit-professor').value,
            descricao: document.getElementById('edit-descricao').value,
            data: document.getElementById('edit-data').value,
            horario: document.getElementById('edit-horario').value,
            vagas: document.getElementById('edit-vagas').value
        }

        try {
            const res = await fetch(`${API_BASE}/api/oficinas/editar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            const data = await res.json()

            if (res.ok) {
                window.mostrarNotificacao('Oficina atualizada com sucesso!', 'sucesso');
                modal.style.display = 'none'
                // Recarrega a lista para ver as mudanças
                const container = document.getElementById('adminOficinasContainer')
                carregarOficinasAdmin(API_BASE, token, container)
            } else {
                window.mostrarNotificacao(data.message || 'Erro ao atualizar oficina.', 'erro');
            }
        } catch (error) {
            console.error(error)
            alert('Erro de conexão ao atualizar.')
        }
    })
}

function abrirModal(dados) {
    const modal = document.getElementById('modal-editar')
    if (!modal) return

    // Preenche os campos
    document.getElementById('edit-nome-original').value = dados.nome
    document.getElementById('edit-titulo').value = dados.nome
    document.getElementById('edit-professor').value = dados.professor
    document.getElementById('edit-descricao').value = dados.descricao
    document.getElementById('edit-data').value = dados.data
    document.getElementById('edit-horario').value = dados.horario
    document.getElementById('edit-vagas').value = dados.vagas

    // Exibe
    modal.style.display = 'flex'
}

// === LÓGICA DE STATUS (Mantida Original) ===

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
            window.mostrarNotificacao(data.message || 'Erro ao atualizar status da oficina.', 'erro');
            return
        }

        const statusSpan = btn
            .closest('.oficina-card')
            .querySelector('.status-label')

        if (statusSpan) {
            statusSpan.textContent = data.status || novoStatus
            statusSpan.dataset.status = data.status || novoStatus
        }

        window.mostrarNotificacao(data.message || 'Status atualizado com sucesso!', 'sucesso');
    } catch (err) {
        console.error('Erro ao atualizar status da oficina:', err)
        alert('Erro ao atualizar status da oficina.')
    }
}
