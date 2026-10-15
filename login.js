/* ============================================================
   M-Utility v5.0 — Lógica da Tela de Login
   ============================================================ */

(function initLogin() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const user = document.getElementById('loginUser').value.trim();
        const pass = document.getElementById('loginPassword').value;

        if (!user) {
            showMessage('loginMessage', 'Informe seu usuário ou e-mail.');
            document.getElementById('loginUser').focus();
            return;
        }
        if (!pass || pass.length < 4) {
            showMessage('loginMessage', 'A senha deve ter pelo menos 4 caracteres.');
            document.getElementById('loginPassword').focus();
            return;
        }

        loginBtn.disabled = true;
        loginBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 4V2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10h-2c0 4.41-3.59 8-8 8s-8-3.59-8-8 3.59-8 8-8z"/></svg> Entrando...';

        setTimeout(() => {
            const found = findUser(user, pass);
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/></svg> Entrar';

            if (!found) {
                showMessage('loginMessage', 'Usuário ou senha incorretos.');
                return;
            }

            setCurrentUser(found);
            setTimeout(() => {
                applyUserToUI();
                showView('app');
            }, 400);
        }, 700);
    });
})();