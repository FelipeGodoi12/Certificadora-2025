// Barra de navegação e carregamento de oficinas
document.addEventListener('DOMContentLoaded', function () {
    // Update navigation based on authentication state
    const loginBtn = document.querySelector('a[href="/login"]');
    const cadastroBtn = document.querySelector('a[href="/cadastro"]');
    const logoutBtn = document.getElementById('logoutBtn');
    const perfilBtn = document.getElementById('perfilBtn');

    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    
    if (token) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (cadastroBtn) cadastroBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (perfilBtn) perfilBtn.style.display = 'inline-block';
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (cadastroBtn) cadastroBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (perfilBtn) perfilBtn.style.display = 'none';
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('email');
            location.reload();
        });
    }

    let oficinasData = [];

    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const container = document.getElementById('oficinasContainer');

    // ---- BUSCA OFICINAS E RENDER ----
    fetch('/api/oficinas')
        .then(res => res.json())
        .then(data => {
            oficinasData = data;
            renderOficinas(oficinasData);
        })
        .catch((err) => {
            console.error('Erro ao buscar oficinas:', err);
            container.innerHTML = "<p style='color: red'>Erro ao listar oficinas.</p>";
        });

    function buscarOficinas() {
        const termo = searchInput.value.trim().toLowerCase();
        if (termo === "") {
            renderOficinas(oficinasData);
            return;
        }
        const filtradas = oficinasData.filter(oficina =>
            (oficina.nome || '').toLowerCase().includes(termo) ||
            (oficina.professor || '').toLowerCase().includes(termo) ||
            (oficina.descricao || '').toLowerCase().includes(termo)
        );
        renderOficinas(filtradas);
    }

    searchBtn.addEventListener('click', buscarOficinas);
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') buscarOficinas();
    });

    // ---- RENDERIZAÇÃO DOS CARDS ----
    function renderOficinas(lista) {
        container.innerHTML = "";
        if (!Array.isArray(lista) || lista.length === 0) {
            container.innerHTML = "<p>Nenhuma oficina encontrada.</p>";
            return;
        }
        lista.forEach(oficina => {
            const card = document.createElement('div');
            card.className = "oficina-card";
            
            // Check if user is enrolled
            const isEnrolled = oficina.inscritos && oficina.inscritos.some(inscrito => inscrito.email === email);
            
            // Status color
            const statusColor = oficina.status === 'Aberta' ? '#28a745' : '#dc3545';
            const statusBg = oficina.status === 'Aberta' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)';
            
            // Button HTML
            let buttonHTML = '';
            if (token && email) {
                if (isEnrolled) {
                    buttonHTML = `<button class="cancelar-btn" data-id="${oficina._id}" data-nome="${oficina.nome}">Cancelar Inscrição</button>`;
                } else {
                    buttonHTML = `<button class="inscrever-btn" data-id="${oficina._id}" data-oficina-nome="${oficina.nome}">Inscrever-se</button>`;
                }
            } else {
                buttonHTML = `<button class="inscrever-btn" disabled onclick="alert('Você precisa estar logado para se inscrever!')">Inscrever-se</button>`;
            }
            
            card.innerHTML = `
                <h3>${oficina.nome || ''}</h3>
                <p><strong>Professor:</strong> ${oficina.professor || ''}</p>
                <p><strong>Data:</strong> ${oficina.data ? new Date(oficina.data).toLocaleDateString('pt-BR') : ''}</p>
                <p><strong>Horário:</strong> ${oficina.horario || ''}</p>
                <p><strong>Vagas:</strong> ${oficina.inscritos ? oficina.inscritos.length : 0}/${oficina.vagas || ''}</p>
                <p><strong>Status:</strong> <span style="color: ${statusColor}; background-color: ${statusBg}; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${oficina.status || 'N/A'}</span></p>
                <p class="descricao">${oficina.descricao || ''}</p>
                <div class="button-group">
                    ${buttonHTML}
                </div>
            `;
            container.appendChild(card);
        });
    }

    // ---- INSCRIÇÃO E CANCELAMENTO ----
    container.addEventListener('click', async function (e) {
        // Inscrever-se
        if (e.target.classList.contains('inscrever-btn') && !e.target.disabled) {
            const oficinaNome = e.target.dataset.oficinaNome;
            const oficinasId = e.target.dataset.id;
            
            if (!token || !email) {
                alert('Você precisa estar logado para se inscrever!');
                window.location.href = '/login';
                return;
            }
            
            try {
                const response = await fetch(`/api/oficinas/${oficinasId}/inscrever`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ email: email })
                });
                
                const data = await response.json();
                if (!response.ok) throw new Error(data.msg || data.message || 'Erro');
                
                alert('Inscrição realizada com sucesso!');
                window.location.reload();
            } catch (err) {
                alert('Erro ao se inscrever: ' + err.message);
            }
        }

        // Cancelar inscrição
        if (e.target.classList.contains('cancelar-btn')) {
            const oficinasId = e.target.dataset.id;
            const oficinaNome = e.target.dataset.nome;
            
            if (!token || !email) {
                alert('Você precisa estar logado!');
                window.location.href = '/login';
                return;
            }
            
            if (!confirm(`Tem certeza que deseja cancelar a inscrição em "${oficinaNome}"?`)) {
                return;
            }
            
            try {
                const response = await fetch(`/api/oficinas/${oficinasId}/cancelar`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ email: email })
                });
                
                const data = await response.json();
                if (!response.ok) throw new Error(data.msg || data.message || 'Erro ao cancelar');
                
                alert('Inscrição cancelada com sucesso!');
                window.location.reload();
            } catch (err) {
                alert('Erro ao cancelar inscrição: ' + err.message);
            }
        }
    });
});



