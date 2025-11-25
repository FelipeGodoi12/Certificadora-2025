document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('senha').value;
            const confirmaSenha = document.getElementById('confirmaSenha').value;

            if (password.length < 6 || password.length > 12) {
                window.mostrarNotificacao('A senha deve conter entre 6 e 12 caracteres!', 'erro');
                return;
            }

            if (password !== confirmaSenha) {
                window.mostrarNotificacao('As senhas não conferem!', 'erro');
                return;
            }

            try {
                const res = await fetch('/users/cadastro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    window.mostrarNotificacao('Cadastro realizado com sucesso!', 'sucesso');
                    window.location.href = '/login';
                } else {
                    window.mostrarNotificacao(data.erro || 'Erro ao cadastrar', 'erro');
                }
            } catch (error) {
                console.error('Erro:', error);
                window.mostrarNotificacao('Erro ao conectar ao servidor', 'erro');
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Update navigation based on authentication state
    const loginBtn = document.querySelector('a[href="/login"]');
    const cadastroBtn = document.querySelector('a[href="/cadastro"]');
    const logoutBtn = document.getElementById('logoutBtn');
    const perfilBtn = document.getElementById('perfilBtn');

    const token = localStorage.getItem('token');
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

    // Handle logout
    const logoutElement = document.getElementById('logoutBtn');
    if (logoutElement) {
        logoutElement.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('isAdmin');
            location.reload();
        });
    }
});
