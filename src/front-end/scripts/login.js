document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    
    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const resposta = await fetch('/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const resultado = await resposta.json();

                const msg = document.getElementById('mensagem');
                if (resposta.ok && resultado.token) {
                    localStorage.setItem('token', resultado.token);
                    localStorage.setItem('isAdmin', resultado.admin);
                    localStorage.setItem('email', email);
                    window.location.href = '/';
                } else {
                    msg.textContent = resultado.erro || 'Email ou senha incorretos!';
                }
            } catch (error) {
                console.error('Erro:', error);
                document.getElementById('mensagem').textContent = 'Erro ao conectar com o servidor.';
            }
        });
    }

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
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('isAdmin');
            location.reload();
        });
    }

});
