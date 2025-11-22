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

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('isAdmin');
            location.reload();
        });
    }
})