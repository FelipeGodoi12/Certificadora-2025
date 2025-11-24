document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')

    if (!id) {
        document.getElementById('detalhes-oficina').innerHTML =
            '<p>Oficina não encontrada.</p>'
        return
    }

    try {
        const res = await fetch(`${window.BASE_URL}/api/oficinas/${id}`)
        if (!res.ok) {
            document.getElementById('detalhes-oficina').innerHTML =
                '<p>Erro ao carregar detalhes da oficina.</p>'
            return
        }

        const o = await res.json()
        const div = document.getElementById('detalhes-oficina')

        const data = new Date(o.data).toLocaleDateString('pt-BR')
        const vagasRestantes = o.vagas - o.inscritos.length

        div.innerHTML = `
			<h2>${o.nome}</h2>
			<p><strong>Professor:</strong> ${o.professor}</p>
			<p><strong>Descrição:</strong> ${o.descricao}</p>
			<p><strong>Data:</strong> ${data}</p>
			<p><strong>Horário:</strong> ${o.horario}</p>
			<p><strong>Status:</strong> ${o.status}</p>
			<p><strong>Vagas restantes:</strong> ${vagasRestantes}</p>
			<br>
			<a href="/oficinas" class="inscrever-btn">Voltar para lista</a>
		`
    } catch (err) {
        console.error(err)
        document.getElementById('detalhes-oficina').innerHTML =
            '<p>Erro inesperado ao carregar detalhes.</p>'
    }
})