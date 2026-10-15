/* ============================================================
   M-Utility v5.0 — Lógica da Tela de Registro
   ============================================================ */

(function initRegister() {
    const registerForm = document.getElementById('registerForm');
    const registerBtn = document.getElementById('registerBtn');
    if (!registerForm) return;

    // ===== Força da senha =====
    const regPassword = document.getElementById('regPassword');
    const passwordStrength = document.getElementById('passwordStrength');
    const passwordStrengthText = document.getElementById('passwordStrengthText');
    const bars = passwordStrength ? passwordStrength.querySelectorAll('.bar') : [];

    function updatePasswordStrength(pwd) {
        let score = 0;
        if (pwd.length >= 6) score++;
        if (pwd.length >= 10) score++;
        if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        if (score > 4) score = 4;

        bars.forEach((bar, i) => {
            bar.classList.remove('active-weak', 'active-medium', 'active-strong');
            if (i < score) {
                if (score <= 2) bar.classList.add('active-weak');
                else if (score === 3) bar.classList.add('active-medium');
                else bar.classList.add('active-strong');
            }
        });

        let text = 'Digite uma senha';
        let color = 'var(--text-muted)';
        if (pwd.length === 0) text = 'Digite uma senha';
        else if (score <= 2) { text = 'Senha fraca'; color = 'var(--accent-red)'; }
        else if (score === 3) { text = 'Senha média'; color = 'var(--accent-yellow)'; }
        else { text = 'Senha forte'; color = 'var(--accent-lime)'; }
        passwordStrengthText.textContent = text;
        passwordStrengthText.style.color = color;
    }

    if (regPassword) {
        regPassword.addEventListener('input', (e) => updatePasswordStrength(e.target.value));
        // Expõe para reset externo
        window.updatePasswordStrength = updatePasswordStrength;
    }

    // ===== Submit =====
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const user = document.getElementById('regUser').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const pass = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirm').value;
        const terms = document.getElementById('regTerms').checked;

        if (!user || user.length < 3) {
            showMessage('registerMessage', 'O usuário deve ter pelo menos 3 caracteres.');
            document.getElementById('regUser').focus();
            return;
        }
        if (!/^[a-zA-Z0-9_.-]+$/.test(user)) {
            showMessage('registerMessage', 'O usuário só pode conter letras, números, "_", "." e "-".');
            document.getElementById('regUser').focus();
            return;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showMessage('registerMessage', 'Informe um e-mail válido.');
            document.getElementById('regEmail').focus();
            return;
        }
        if (!pass || pass.length < 4) {
            showMessage('registerMessage', 'A senha deve ter pelo menos 4 caracteres.');
            document.getElementById('regPassword').focus();
            return;
        }
        if (pass !== confirm) {
            showMessage('registerMessage', 'As senhas não coincidem.');
            document.getElementById('regConfirm').focus();
            return;
        }
        if (!terms) {
            showMessage('registerMessage', 'Você precisa aceitar os Termos de Uso.');
            return;
        }
        if (userExists(user, email)) {
            showMessage('registerMessage', 'Este usuário ou e-mail já está em uso.');
            return;
        }

        registerBtn.disabled = true;
        registerBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 4V2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10h-2c0 4.41-3.59 8-8 8s-8-3.59-8-8 3.59-8 8-8z"/></svg> Criando conta...';

        setTimeout(() => {
            registerUser({ username: user, password: pass, email });
            registerBtn.disabled = false;
            registerBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg> Criar Conta';
            showMessage('registerMessage', 'Conta criada com sucesso! Redirecionando...', 'success');
            setTimeout(() => showView('login'), 1400);
        }, 700);
    });
})();