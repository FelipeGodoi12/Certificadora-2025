// front-end/scripts/criar-oficinas.js

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('form-criar-oficina')
    if (!form) {
        console.error('form-criar-oficina não encontrado')
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

    // garante que só admin acesse
    try {
        // se o header já buscou o currentUser, reaproveita
        if (!window.currentUser) {
            const resProfile = await fetch(`${API_BASE}/users/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!resProfile.ok) {
                window.location.href = '/login'
                return
            }
            window.currentUser = await resProfile.json()
        }

        if (!window.currentUser.admin) {
            window.location.href = '/'
            return
        }
    } catch (err) {
        console.error('Erro ao validar admin:', err)
        window.location.href = '/login'
        return
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault()

        const titulo = document.getElementById('titulo').value.trim()
        const professor = document.getElementById('professor').value.trim()
        const descricao = document.getElementById('descricao').value.trim()
        const data = document.getElementById('data').value
        const horario = document.getElementById('horario').value
        const vagas = document.getElementById('vagas').value

        try {
            const resp = await fetch(`${API_BASE}/criar-oficina`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    titulo,
                    professor,
                    descricao,
                    data,
                    horario,
                    vagas,
                }),
            })

            const body = await resp.json().catch(() => ({}))

            if (!resp.ok) {
                alert(body.message || 'Erro ao criar oficina.')
                return
            }

            alert(body.message || 'Oficina criada com sucesso!')
            form.reset()
        } catch (err) {
            console.error('Erro ao criar oficina:', err)
            alert('Erro inesperado ao criar oficina.')
        }
    })
})