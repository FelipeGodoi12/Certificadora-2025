;(function () {
    const API_BASE =
        window.BASE_URL ||
        (window.ENV && (window.ENV.API_BASE_URL || window.ENV.BASE_URL)) ||
        ''

    function buildHeaderHTML(activePage) {
        const isActive = (page) => (page === activePage ? 'active' : '')

        return `
			<nav class="navBar" role="navigation" aria-label="Navegação Principal">
				<div class="nav-brand">
					<a href="/" class="logo">🎓 Oficinas UTFPR</a>
				</div>
				<div class="nav-left">
					<a class="Item ${isActive('home')}" href="/">Página Inicial</a>
					<a class="Item ${isActive('oficinas')}" href="/oficinas">Listar oficinas</a>
					<a class="Item ${isActive('criar')}" href="/criar-oficinas" id="createLink">Criar oficina</a>
					<a class="Item ${isActive('gerenciar')}" href="/gerenciar-oficinas" id="manageLink">Gerenciar oficinas</a>
				</div>
				<div class="nav-right">
					<a class="Item ${isActive('login')}" href="/login" id="loginBtn">Login</a>
					<a class="Item ${isActive('cadastro')}" href="/cadastro" id="cadastroBtn">Cadastro</a>
					<a class="Item ${isActive('perfil')}" href="/perfil" id="perfilBtn" style="display:none;">Perfil</a>
					<a class="Item" href="#" id="logoutBtn" style="display:none;">Sair</a>
				</div>
			</nav>
		`
    }

    async function initHeader(activePage) {
        const headerEl = document.getElementById('main-header')
        if (!headerEl) return

        headerEl.innerHTML = buildHeaderHTML(activePage)

        const loginBtn = document.getElementById('loginBtn')
        const cadastroBtn = document.getElementById('cadastroBtn')
        const logoutBtn = document.getElementById('logoutBtn')
        const perfilBtn = document.getElementById('perfilBtn')
        const createLink = document.getElementById('createLink')
        const manageLink = document.getElementById('manageLink')

        const token = localStorage.getItem('token')

        // estado base: não logado
        const setLoggedOut = () => {
            if (perfilBtn) perfilBtn.style.display = 'none'
            if (logoutBtn) logoutBtn.style.display = 'none'
            if (createLink) createLink.style.display = 'none'
            if (manageLink) manageLink.style.display = 'none'
            if (loginBtn) loginBtn.style.display = 'inline-block'
            if (cadastroBtn) cadastroBtn.style.display = 'inline-block'
        }

        if (!token) {
            setLoggedOut()
            return
        }

        try {
            const res = await fetch(`${API_BASE}/users/profile`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })

            if (!res.ok) {
                localStorage.removeItem('token')
                setLoggedOut()
                return
            }

            const user = await res.json()
            window.currentUser = user

            // logado: mostra perfil / sair, esconde login/cadastro
            if (loginBtn) loginBtn.style.display = 'none'
            if (cadastroBtn) cadastroBtn.style.display = 'none'
            if (perfilBtn) perfilBtn.style.display = 'inline-block'
            if (logoutBtn) logoutBtn.style.display = 'inline-block'

            // criar / gerenciar só pra admin
            if (user.admin) {
                if (createLink) createLink.style.display = 'inline-block'
                if (manageLink) manageLink.style.display = 'inline-block'
            } else {
                if (createLink) createLink.style.display = 'none'
                if (manageLink) manageLink.style.display = 'none'
            }

            // logout
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault()
                    localStorage.removeItem('token')
                    localStorage.removeItem('email')
                    localStorage.removeItem('isAdmin')
                    window.location.href = '/login'
                })
            }
        } catch (err) {
            console.error('Erro ao inicializar header:', err)
            localStorage.removeItem('token')
            setLoggedOut()
        }
    }

    window.initHeader = initHeader
})()
window.mostrarNotificacao = function(texto, tipo = 'sucesso') {
    // Define cores: Verde para sucesso, Vermelho/Laranja para erro
    const cor = tipo === 'sucesso' 
        ? "linear-gradient(to right, #00b09b, #96c93d)" // Verde
        : "linear-gradient(to right, #ff5f6d, #ffc371)"; // Vermelho

    Toastify({
        text: texto,
        duration: 3000,       // Duração em milissegundos (3 segundos)
        close: true,          // Botão de fechar
        gravity: "top",       // Posição vertical: top ou bottom
        position: "right",    // Posição horizontal: left, center ou right
        stopOnFocus: true,    // Para o tempo se passar o mouse em cima
        style: {
            background: cor,
            borderRadius: "8px", // Deixa bonitinho arredondado
            boxShadow: "0 3px 6px rgba(0,0,0,0.16)"
        }
    }).showToast();
};
