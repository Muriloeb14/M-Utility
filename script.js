/* ============================================================
   M-Utility v5.0 — Core Application Script
   ============================================================ */

// ============================================================
// NAVEGAÇÃO ENTRE VIEWS (global, usada por onclick no HTML)
// ============================================================
function showView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById('view-' + viewName);
    if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'instant' });
    }

    if (viewName === 'login') {
        document.getElementById('loginForm')?.reset();
        clearMessage('loginMessage');
        setTimeout(() => document.getElementById('loginUser')?.focus(), 350);
    } else if (viewName === 'register') {
        document.getElementById('registerForm')?.reset();
        clearMessage('registerMessage');
        if (typeof window.updatePasswordStrength === 'function') window.updatePasswordStrength('');
        setTimeout(() => document.getElementById('regUser')?.focus(), 350);
    } else if (viewName === 'app') {
        if (typeof initAppAfterLogin === 'function') initAppAfterLogin();
    }
}

// ============================================================
// UTILITÁRIOS GLOBAIS (mensagens, toggle password)
// ============================================================
function showMessage(elId, text, type = 'error') {
    const el = document.getElementById(elId);
    const textEl = document.getElementById(elId + 'Text');
    const iconEl = document.getElementById(elId + 'Icon');
    if (!el) return;
    el.className = 'form-message show ' + type;
    textEl.textContent = text;
    iconEl.innerHTML = type === 'success'
        ? '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>'
        : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>';
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 5000);
}

function clearMessage(elId) {
    const el = document.getElementById(elId);
    if (el) el.classList.remove('show');
}

// Toggle de senha
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.getElementById(btn.dataset.target);
            if (!target) return;
            const isPassword = target.type === 'password';
            target.type = isPassword ? 'text' : 'password';
            btn.innerHTML = isPassword
                ? '<svg viewBox="0 0 24 24"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>'
                : '<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>';
            btn.title = isPassword ? 'Ocultar senha' : 'Mostrar senha';
        });
    });
});

// ============================================================
// APLICAR USUÁRIO NA UI
// ============================================================
function applyUserToUI() {
    const user = getCurrentUser();
    if (!user) return;
    const initials = (user.displayName || user.username)
        .split(/[\s._-]+/).filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('') || '?';
    document.getElementById('sidebarUserAvatar').textContent = initials;
    document.getElementById('sidebarUserName').textContent = user.displayName || user.username;
    document.getElementById('sidebarUserRole').textContent = user.role || 'Operador';
    document.getElementById('hubWelcome').textContent = 'Bem-vindo, ' + (user.displayName || user.username);

    // Bloqueia aba Console se o usuário não tem permissão
    const tabConsole = document.getElementById('tabBtnConsole');
    if (user.canUseConsole) {
        tabConsole.style.display = '';
    } else {
        tabConsole.style.display = 'none';
        const consoleContent = document.getElementById('tab-console');
        if (consoleContent.classList.contains('active')) {
            consoleContent.classList.remove('active');
            document.getElementById('tab-import').classList.add('active');
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === 'import'));
        }
    }
}

// ============================================================
// LOGOUT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            clearCurrentUser();
            showView('landing');
        });
    }
});

// ============================================================
// CORE APP
// ============================================================
let appInitialized = false;

function initAppAfterLogin() {
    if (appInitialized) return;
    appInitialized = true;
    setupAppListeners();
}

function setupAppListeners() {
    // ===== NAVEGAÇÃO INTERNA =====
    const hubView = document.getElementById('hubView');
    const toolLocalizarAwb = document.getElementById('toolLocalizarAwb');
    const sidebarHomeBtn = document.getElementById('sidebarHomeBtn');
    const sidebarAwbBtn = document.getElementById('sidebarAwbBtn');
    const sidebarBrandBtn = document.getElementById('sidebarBrandBtn');
    const backToHubBtn = document.getElementById('backToHubBtn');
    const hubCardLocalizarAwb = document.getElementById('hubCardLocalizarAwb');

    // Settings panel
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsPanel.classList.toggle('active');
        settingsBtn.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
        if (!settingsPanel.contains(e.target) && !settingsBtn.contains(e.target)) {
            settingsPanel.classList.remove('active');
            settingsBtn.classList.remove('active');
        }
    });

    function showHub() {
        hubView.classList.remove('hidden');
        toolLocalizarAwb.classList.remove('active');
        sidebarHomeBtn.classList.add('active');
        sidebarAwbBtn.classList.remove('active');
    }
    function showLocalizarAwb() {
        hubView.classList.add('hidden');
        toolLocalizarAwb.classList.add('active');
        sidebarHomeBtn.classList.remove('active');
        sidebarAwbBtn.classList.add('active');
        if (currentTab === 'scan') setTimeout(() => scanInput.focus(), 200);
    }
    sidebarHomeBtn.addEventListener('click', showHub);
    sidebarBrandBtn.addEventListener('click', showHub);
    backToHubBtn.addEventListener('click', showHub);
    sidebarAwbBtn.addEventListener('click', showLocalizarAwb);
    hubCardLocalizarAwb.addEventListener('click', showLocalizarAwb);

    // ===== ESTADO =====
    let importedCodes = [];
    let lotesMap = {};
    let scanHistory = [];
    let currentTab = 'import';
    let codeStatus = {};
    let selectedCodes = new Set();
    let isTransitioning = false;
    let scannedCodesMap = {};
    let confirmCallback = null;
    let isCompletingByHint = false;

    const STATUS_DEV_RECUSADA = 'DEV RECUSADA';
    const LOTE_DEV_RECUSADA = 'DEV RECUSADA';
    const LOTE_DEVOLUCAO_RECUSADA = 'DEVOLUÇÃO RECUSADA';
    const LOTE_DEVOLUCAO_RECUSADA_ALT = 'DEVOLUCAO RECUSADA';
    const PRINT_ITEMS_PER_COLUMN = 38;
    const PRINT_LOGO_URL = 'https://res.cloudinary.com/txf25hqh/image/upload/v1789049740/M-Utility_Logo.png';
    const APP_VERSION = 'v5.0';
    const LOGO_ICO_URL = 'https://res.cloudinary.com/txf25hqh/image/upload/v1789051525/M-Utility-Logo.ico';

    const audioFiles = {
        APROVADO: 'https://res.cloudinary.com/txf25hqh/video/upload/v1789502918/APROVADO_TESTE_3.mp3',
        'NÃO ENCONTRADO': 'https://res.cloudinary.com/txf25hqh/video/upload/v1789039861/N%C3%83O_ENCONTRADO_TESTE_1.mp3',
        'INVÁLIDO': 'https://res.cloudinary.com/txf25hqh/video/upload/v1789039866/INVALIDO_TESTE_2.mp3',
        'DUPLICADO': 'https://res.cloudinary.com/txf25hqh/video/upload/v1789502915/J%C3%81_BIPADO_TESTE_1.mp3',
        'DEV RECUSADA': 'https://res.cloudinary.com/txf25hqh/video/upload/v1789502918/APROVADO_TESTE_3.mp3'
    };

    const audioCache = {};
    let audioVolume = 1.0;
    let isMuted = false;

    function preloadAudio() {
        Object.keys(audioFiles).forEach(status => {
            const audio = new Audio(audioFiles[status]);
            audio.preload = 'auto';
            audio.volume = audioVolume;
            audioCache[status] = audio;
        });
    }

    function playSound(status) {
        if (isMuted || audioVolume === 0) return;
        const audio = audioCache[status];
        if (!audio) return;
        try {
            const sound = audio.cloneNode();
            sound.volume = audioVolume;
            sound.play().catch(() => {});
            const statusEl = document.getElementById('audioStatus');
            statusEl.classList.remove('playing', 'duplicate');
            void statusEl.offsetWidth;
            if (status === 'DUPLICADO') statusEl.classList.add('duplicate');
            else statusEl.classList.add('playing');
            setTimeout(() => statusEl.classList.remove('playing', 'duplicate'), 700);
        } catch (e) {}
    }

    // ===== DOM REFS =====
    const importTextarea = document.getElementById('awbListInput');
    const loteTextarea = document.getElementById('loteListInput');
    const importBtn = document.getElementById('importBtn');
    const clearImportBtn = document.getElementById('clearImportBtn');
    const codeListContainer = document.getElementById('codeListContainer');
    const codeCount = document.getElementById('codeCount');
    const foundCount = document.getElementById('foundCount');
    const notFoundCount = document.getElementById('notFoundCount');
    const invalidCount = document.getElementById('invalidCount');
    const devRecusadaCount = document.getElementById('devRecusadaCount');
    const pendingCount = document.getElementById('pendingCount');
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const searchInput = document.getElementById('searchInput');

    const awbImportArea = document.getElementById('awbImportArea');
    const loteImportArea = document.getElementById('loteImportArea');
    const awbLineNumbers = document.getElementById('awbLineNumbers');
    const loteLineNumbers = document.getElementById('loteLineNumbers');

    const scanInput = document.getElementById('scanInput');
    const scanBtn = document.getElementById('scanBtn');
    const scanHistoryContainer = document.getElementById('scanHistoryContainer');
    const clearScanHistoryBtn = document.getElementById('clearScanHistoryBtn');
    const scanCodeListContainer = document.getElementById('scanCodeListContainer');
    const scanCodeCount = document.getElementById('scanCodeCount');
    const scanFoundCount = document.getElementById('scanFoundCount');
    const scanNotFoundCount = document.getElementById('scanNotFoundCount');
    const scanInvalidCount = document.getElementById('scanInvalidCount');
    const scanDevRecusadaCount = document.getElementById('scanDevRecusadaCount');
    const scanPendingCount = document.getElementById('scanPendingCount');
    const scanSelectAllBtn = document.getElementById('scanSelectAllBtn');
    const scanDeleteSelectedBtn = document.getElementById('scanDeleteSelectedBtn');
    const scanSearchInput = document.getElementById('scanSearchInput');
    const autocompleteHint = document.getElementById('autocompleteHint');

    const exportApprovedContainer = document.getElementById('exportApprovedContainer');
    const exportNotFoundContainer = document.getElementById('exportNotFoundContainer');
    const exportDevRecusadaContainer = document.getElementById('exportDevRecusadaContainer');
    const exportCodeListContainer = document.getElementById('exportCodeListContainer');
    const exportCodeCount = document.getElementById('exportCodeCount');
    const exportFoundCount = document.getElementById('exportFoundCount');
    const exportNotFoundCount = document.getElementById('exportNotFoundCount');
    const exportInvalidCount = document.getElementById('exportInvalidCount');
    const exportDevRecusadaCount = document.getElementById('exportDevRecusadaCount');
    const exportPendingCount = document.getElementById('exportPendingCount');
    const approvedCount = document.getElementById('approvedCount');
    const notFoundExportCount = document.getElementById('notFoundExportCount');
    const devRecusadaExportCount = document.getElementById('devRecusadaExportCount');
    const exportSearchInput = document.getElementById('exportSearchInput');

    const copyApprovedAllBtn = document.getElementById('copyApprovedAllBtn');
    const copyApprovedUniqueBtn = document.getElementById('copyApprovedUniqueBtn');
    const copyNotFoundAllBtn = document.getElementById('copyNotFoundAllBtn');
    const copyNotFoundUniqueBtn = document.getElementById('copyNotFoundUniqueBtn');
    const copyDevRecusadaAllBtn = document.getElementById('copyDevRecusadaAllBtn');
    const copyDevRecusadaUniqueBtn = document.getElementById('copyDevRecusadaUniqueBtn');

    const printApprovedBtn = document.getElementById('printApprovedBtn');
    const printNotFoundBtn = document.getElementById('printNotFoundBtn');
    const printDevRecusadaBtn = document.getElementById('printDevRecusadaBtn');
    const printArea = document.getElementById('printArea');

    const approvedAllCount = document.getElementById('approvedAllCount');
    const approvedUniqueCount = document.getElementById('approvedUniqueCount');
    const notFoundAllCount = document.getElementById('notFoundAllCount');
    const notFoundUniqueCount = document.getElementById('notFoundUniqueCount');
    const devRecusadaAllCount = document.getElementById('devRecusadaAllCount');
    const devRecusadaUniqueCount = document.getElementById('devRecusadaUniqueCount');

    const consoleInput = document.getElementById('consoleInput');
    const consoleOutput = document.getElementById('consoleOutput');
    const consoleExecuteBtn = document.getElementById('consoleExecuteBtn');
    const consoleClearBtn = document.getElementById('consoleClearBtn');

    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = {
        import: document.getElementById('tab-import'),
        scan: document.getElementById('tab-scan'),
        export: document.getElementById('tab-export'),
        console: document.getElementById('tab-console')
    };

    const gridBtns = document.querySelectorAll('.grid-btn');

    const audioToggle = document.getElementById('audioToggle');
    const audioIcon = document.getElementById('audioIcon');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumePercent = document.getElementById('volumePercent');
    const audioStatus = document.getElementById('audioStatus');

    const ICON_VOLUME = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
    const ICON_MUTED = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
    const DEV_RECUSADA_SVG_PATH = '<path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>';

    // ===== MODAIS =====
    const confirmPopup = document.getElementById('confirmPopup');
    const confirmPopupTitle = document.getElementById('confirmPopupTitle');
    const confirmPopupMessage = document.getElementById('confirmPopupMessage');
    const confirmPopupIcon = document.getElementById('confirmPopupIcon');
    const confirmPopupCancel = document.getElementById('confirmPopupCancel');
    const confirmPopupConfirm = document.getElementById('confirmPopupConfirm');
    const popupBackdrop = document.getElementById('popupBackdrop');

    function showConfirm(title, message, onConfirm, options = {}) {
        confirmPopupTitle.textContent = title;
        confirmPopupMessage.textContent = message;
        confirmCallback = onConfirm;
        let iconClass = 'confirm-popup-icon';
        let iconSvg = '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>';
        if (options.danger) iconClass += ' danger';
        else if (options.warning) iconClass += ' warning';
        else if (options.success) iconClass += ' success';
        else if (options.info) iconClass += ' info';
        confirmPopupIcon.className = iconClass;
        confirmPopupIcon.innerHTML = `<svg viewBox="0 0 24 24">${iconSvg}</svg>`;
        if (options.success || options.info) confirmPopupConfirm.className = 'confirm-popup-btn confirm success';
        else confirmPopupConfirm.className = 'confirm-popup-btn confirm';
        confirmPopup.classList.remove('closing', 'single-action');
        confirmPopup.classList.add('active');
        popupBackdrop.classList.add('active');
    }

    function showAlert(title, message, options = {}) {
        confirmPopupTitle.textContent = title;
        confirmPopupMessage.textContent = message;
        confirmCallback = null;
        let iconClass = 'confirm-popup-icon';
        let iconSvg = '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>';
        if (options.danger) iconClass += ' danger';
        else if (options.warning) iconClass += ' warning';
        else if (options.success) iconClass += ' success';
        else if (options.info) iconClass += ' info';
        confirmPopupIcon.className = iconClass;
        confirmPopupIcon.innerHTML = `<svg viewBox="0 0 24 24">${iconSvg}</svg>`;
        if (options.success || options.info) confirmPopupConfirm.className = 'confirm-popup-btn confirm success';
        else confirmPopupConfirm.className = 'confirm-popup-btn confirm';
        confirmPopupConfirm.textContent = 'OK';
        confirmPopup.classList.remove('closing');
        confirmPopup.classList.add('active', 'single-action');
        popupBackdrop.classList.add('active');
    }

    function hideConfirm() {
        confirmPopup.classList.add('closing');
        popupBackdrop.classList.remove('active');
        setTimeout(() => {
            confirmPopup.classList.remove('active', 'closing', 'single-action');
            confirmPopupConfirm.textContent = 'Sim';
        }, 300);
        confirmCallback = null;
    }

    confirmPopupCancel.addEventListener('click', hideConfirm);
    popupBackdrop.addEventListener('click', hideConfirm);
    confirmPopupConfirm.addEventListener('click', () => {
        const cb = confirmCallback;
        hideConfirm();
        if (cb) cb();
    });

    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');

    function showLoading(message = 'Carregando...', duration = 1000) {
        return new Promise((resolve) => {
            if (isTransitioning) { resolve(); return; }
            isTransitioning = true;
            loadingText.textContent = message;
            loadingOverlay.classList.add('active');
            loadingOverlay.classList.remove('fade-out');
            tabBtns.forEach(btn => btn.disabled = true);
            setTimeout(() => { hideLoading(); resolve(); }, duration);
        });
    }

    function hideLoading() {
        loadingOverlay.classList.add('fade-out');
        setTimeout(() => {
            loadingOverlay.classList.remove('active');
            loadingOverlay.classList.remove('fade-out');
            isTransitioning = false;
            tabBtns.forEach(btn => btn.disabled = false);
        }, 600);
    }

    // ===== HELPERS =====
    function isValidAwbCode(code) {
        if (typeof code !== 'string') return false;
        return /^TXA[A-Z]\d{9}tx$/i.test(code.trim());
    }
    function normalizeCode(code) { return code.trim().toUpperCase(); }

    function normalizeLoteValue(lote) {
        if (!lote) return lote;
        const trimmed = lote.trim();
        const upper = trimmed.toUpperCase();
        if (upper === 'DEV RECUSADA' || upper === 'DEVOLUÇÃO RECUSADA' || upper === 'DEVOLUCAO RECUSADA'
            || upper === 'RECUSADA' || upper === 'RECUSADO' || upper === 'DEV. RECUSADA'
            || upper === 'DEV.RECUSADA' || upper === 'DEV RECUSADO'
            || upper === 'DEVOLUÇÃO RECUSADO' || upper === 'DEVOLUCAO RECUSADO') {
            return LOTE_DEV_RECUSADA;
        }
        return trimmed;
    }

    function isLoteDevRecusada(lote) {
        if (!lote) return false;
        const norm = lote.trim().toUpperCase();
        return norm === LOTE_DEV_RECUSADA || norm === LOTE_DEVOLUCAO_RECUSADA
            || norm === LOTE_DEVOLUCAO_RECUSADA_ALT || norm === 'RECUSADA'
            || norm === 'RECUSADO' || norm === 'DEV RECUSADO'
            || norm === 'DEV. RECUSADA' || norm === 'DEV.RECUSADA';
    }

    function getLoteForCode(code) { return lotesMap[normalizeCode(code)] || ''; }

    function countLines(text) {
        if (!text) return 0;
        return text.split(/\r?\n/).length;
    }

    function renderLineNumbers(lineNumbersEl, text) {
        const total = countLines(text);
        if (total === 0) { lineNumbersEl.innerHTML = ''; return; }
        let html = '';
        for (let i = 1; i <= total; i++) html += `<div class="editor-line"><span class="line-num">${i}</span></div>`;
        lineNumbersEl.innerHTML = html;
        lineNumbersEl.scrollTop = 0;
    }

    function activateEditorMode(areaEl, lineNumbersEl, text) {
        if (!text || text.trim().length === 0) {
            areaEl.classList.remove('editor-active');
            lineNumbersEl.classList.add('hidden');
            lineNumbersEl.innerHTML = '';
            return;
        }
        areaEl.classList.add('editor-active');
        lineNumbersEl.classList.remove('hidden');
        renderLineNumbers(lineNumbersEl, text);
    }

    function setupLineNumbersEditor(textareaEl, areaEl, lineNumbersEl) {
        const update = () => {
            const text = textareaEl.value;
            if (text.trim().length === 0) {
                areaEl.classList.remove('editor-active');
                lineNumbersEl.classList.add('hidden');
                lineNumbersEl.innerHTML = '';
            } else {
                areaEl.classList.add('editor-active');
                lineNumbersEl.classList.remove('hidden');
                renderLineNumbers(lineNumbersEl, text);
                lineNumbersEl.scrollTop = textareaEl.scrollTop;
            }
        };
        textareaEl.addEventListener('input', update);
        textareaEl.addEventListener('paste', () => setTimeout(update, 0));
        textareaEl.addEventListener('scroll', () => { lineNumbersEl.scrollTop = textareaEl.scrollTop; });
        textareaEl.addEventListener('keyup', update);
    }

    function getStatusIcon(status) {
        if (status === 'APROVADO') return `<span class="status-icon approve"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>`;
        if (status === 'NÃO ENCONTRADO') return `<span class="status-icon notfound"><svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></span>`;
        if (status === STATUS_DEV_RECUSADA) return `<span class="status-icon dev-recusada"><svg viewBox="0 0 24 24">${DEV_RECUSADA_SVG_PATH}</svg></span>`;
        return `<span class="status-icon invalid"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg></span>`;
    }

    function getStatusBadge(status) {
        if (status === 'found') return `<span class="code-status found"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>Encontrado</span>`;
        if (status === 'not-found') return `<span class="code-status not-found"><svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>Não encontrado</span>`;
        if (status === 'invalid') return `<span class="code-status invalid"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>Inválido</span>`;
        if (status === 'dev-recusada') return `<span class="code-status dev-recusada"><svg viewBox="0 0 24 24">${DEV_RECUSADA_SVG_PATH}</svg>Dev Recusada</span>`;
        return `<span class="code-status pending"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>Pendente</span>`;
    }

    function updateStats() {
        const total = importedCodes.length;
        const found = importedCodes.filter(c => codeStatus[c] === 'found').length;
        const notFound = scanHistory.filter(item => item.status === 'NÃO ENCONTRADO').length;
        const invalid = scanHistory.filter(item => item.status === 'INVÁLIDO').length;
        const devRecusada = scanHistory.filter(item => item.status === STATUS_DEV_RECUSADA).length;
        const pending = total - found;

        codeCount.textContent = total;
        foundCount.textContent = found;
        notFoundCount.textContent = notFound;
        invalidCount.textContent = invalid;
        if (devRecusadaCount) devRecusadaCount.textContent = devRecusada;
        pendingCount.textContent = pending;

        scanCodeCount.textContent = total;
        scanFoundCount.textContent = found;
        scanNotFoundCount.textContent = notFound;
        scanInvalidCount.textContent = invalid;
        if (scanDevRecusadaCount) scanDevRecusadaCount.textContent = devRecusada;
        scanPendingCount.textContent = pending;

        exportCodeCount.textContent = total;
        exportFoundCount.textContent = found;
        exportNotFoundCount.textContent = notFound;
        exportInvalidCount.textContent = invalid;
        if (exportDevRecusadaCount) exportDevRecusadaCount.textContent = devRecusada;
        exportPendingCount.textContent = pending;
        approvedCount.textContent = found;
        notFoundExportCount.textContent = notFound;
        if (devRecusadaExportCount) devRecusadaExportCount.textContent = devRecusada;

        const approvedItems = scanHistory.filter(item => item.status === 'APROVADO');
        const notFoundItems = scanHistory.filter(item => item.status === 'NÃO ENCONTRADO');
        const devRecusadaItems = scanHistory.filter(item => item.status === STATUS_DEV_RECUSADA);

        approvedAllCount.textContent = approvedItems.length;
        notFoundAllCount.textContent = notFoundItems.length;
        if (devRecusadaAllCount) devRecusadaAllCount.textContent = devRecusadaItems.length;

        const approvedUnique = new Set(approvedItems.map(item => normalizeCode(item.code))).size;
        const notFoundUnique = new Set(notFoundItems.map(item => normalizeCode(item.code))).size;
        const devRecusadaUnique = new Set(devRecusadaItems.map(item => normalizeCode(item.code))).size;

        approvedUniqueCount.textContent = approvedUnique;
        notFoundUniqueCount.textContent = notFoundUnique;
        if (devRecusadaUniqueCount) devRecusadaUniqueCount.textContent = devRecusadaUnique;
    }

    function renderCodeList(container, isScanTab = false, searchTerm = '') {
        const containerEl = container;
        if (importedCodes.length === 0) {
            containerEl.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                    <div>Nenhum código importado</div>
                    <div style="font-size: 12px; margin-top: 4px;">${isScanTab ? 'Importe os códigos na aba anterior' : 'Importe os códigos para começar'}</div>
                </div>
            `;
            return;
        }
        let filteredCodes = importedCodes;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredCodes = importedCodes.filter(code => code.toLowerCase().includes(term));
        }
        if (filteredCodes.length === 0) {
            containerEl.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                    <div>Nenhum código encontrado</div>
                </div>
            `;
            return;
        }
        let html = '';
        filteredCodes.forEach((code) => {
            const status = codeStatus[code] || 'pending';
            const isChecked = selectedCodes.has(code) ? 'checked' : '';
            const lote = getLoteForCode(code);
            const isDev = isLoteDevRecusada(lote);
            let loteHtml = '';
            let visualStatus = status;
            if (isDev) {
                loteHtml = `<span class="code-lote-icon dev-recusada" title="DEV RECUSADA"><svg viewBox="0 0 24 24">${DEV_RECUSADA_SVG_PATH}</svg></span>`;
                if (status === 'found') visualStatus = 'found';
                else if (status === 'pending') visualStatus = 'pending';
                else if (status === 'invalid') visualStatus = 'invalid';
                else visualStatus = 'found';
            } else if (lote) {
                if (status === 'found') loteHtml = `<span class="code-lote">${lote}</span>`;
                else loteHtml = `<span class="code-lote not-found-yet">${lote}</span>`;
            } else {
                loteHtml = `<span class="code-lote empty">—</span>`;
            }
            html += `
                <div class="code-item">
                    <label class="custom-checkbox">
                        <input type="checkbox" class="code-checkbox" data-code="${code}" ${isChecked}>
                        <span class="checkmark"></span>
                    </label>
                    <span class="code-text">${code}</span>
                    ${loteHtml}
                    ${getStatusBadge(visualStatus)}
                </div>
            `;
        });
        containerEl.innerHTML = html;
        document.querySelectorAll('.code-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const code = this.dataset.code;
                if (this.checked) selectedCodes.add(code);
                else selectedCodes.delete(code);
                updateDeleteButtons();
            });
        });
    }

    function getDuplicateMark(item) {
        if (item.status === 'INVÁLIDO') return '';
        if (!item.isDuplicate) return '';
        return `<span class="duplicate-mark" title="Atenção: código já bipado ${item.scanCount}x">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        </span>`;
    }

    function renderScanHistory(container = scanHistoryContainer) {
        if (scanHistory.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    <div>Aguardando leituras</div>
                    <div style="font-size: 12px; margin-top: 4px;">Os resultados aparecerão aqui</div>
                </div>
            `;
            return;
        }
        let html = '';
        const reversed = [...scanHistory].reverse();
        for (const item of reversed) {
            let badgeClass;
            if (item.status === 'APROVADO') badgeClass = 'aprovado';
            else if (item.status === 'NÃO ENCONTRADO') badgeClass = 'nao-encontrado';
            else if (item.status === STATUS_DEV_RECUSADA) badgeClass = 'dev-recusada';
            else badgeClass = 'invalido';
            const duplicateMark = getDuplicateMark(item);
            let loteHtml = '';
            if (item.status === 'APROVADO') {
                const lote = getLoteForCode(item.code);
                if (lote) loteHtml = `<span class="history-lote">${lote}</span>`;
                else loteHtml = `<span class="history-lote empty">—</span>`;
            }
            html += `
                <div class="history-item">
                    ${getStatusIcon(item.status)}
                    <span class="history-code">${item.code}</span>
                    ${duplicateMark}
                    ${loteHtml}
                    <span class="badge ${badgeClass}">${item.status}</span>
                    <span class="history-time">${item.timestamp}</span>
                </div>
            `;
        }
        container.innerHTML = html;
        container.scrollTop = 0;
    }

    function renderExportGrids() {
        const approvedItems = scanHistory.filter(item => item.status === 'APROVADO');
        if (approvedItems.length === 0) {
            exportApprovedContainer.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg><div>Nenhum código aprovado</div></div>`;
        } else {
            let html = '';
            const reversed = [...approvedItems].reverse();
            for (const item of reversed) {
                const duplicateMark = getDuplicateMark(item);
                const lote = getLoteForCode(item.code);
                const loteHtml = lote ? `<span class="history-lote">${lote}</span>` : `<span class="history-lote empty">—</span>`;
                html += `<div class="history-item">${getStatusIcon(item.status)}<span class="history-code">${item.code}</span>${duplicateMark}${loteHtml}<span class="badge aprovado">${item.status}</span><span class="history-time">${item.timestamp}</span></div>`;
            }
            exportApprovedContainer.innerHTML = html;
            exportApprovedContainer.scrollTop = 0;
        }
        const notFoundItems = scanHistory.filter(item => item.status === 'NÃO ENCONTRADO');
        if (notFoundItems.length === 0) {
            exportNotFoundContainer.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg><div>Nenhum código não encontrado</div></div>`;
        } else {
            let html = '';
            const reversed = [...notFoundItems].reverse();
            for (const item of reversed) {
                const duplicateMark = getDuplicateMark(item);
                html += `<div class="history-item">${getStatusIcon(item.status)}<span class="history-code">${item.code}</span>${duplicateMark}<span class="badge nao-encontrado">${item.status}</span><span class="history-time">${item.timestamp}</span></div>`;
            }
            exportNotFoundContainer.innerHTML = html;
            exportNotFoundContainer.scrollTop = 0;
        }
        const devRecusadaItems = scanHistory.filter(item => item.status === STATUS_DEV_RECUSADA);
        if (devRecusadaItems.length === 0) {
            exportDevRecusadaContainer.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24">${DEV_RECUSADA_SVG_PATH}</svg><div>Nenhuma devolução recusada</div></div>`;
        } else {
            let html = '';
            const reversed = [...devRecusadaItems].reverse();
            for (const item of reversed) {
                const duplicateMark = getDuplicateMark(item);
                html += `<div class="history-item">${getStatusIcon(item.status)}<span class="history-code">${item.code}</span>${duplicateMark}<span class="badge dev-recusada">${item.status}</span><span class="history-time">${item.timestamp}</span></div>`;
            }
            exportDevRecusadaContainer.innerHTML = html;
            exportDevRecusadaContainer.scrollTop = 0;
        }
        approvedCount.textContent = approvedItems.length;
        notFoundExportCount.textContent = notFoundItems.length;
        if (devRecusadaExportCount) devRecusadaExportCount.textContent = devRecusadaItems.length;
    }

    function updateDeleteButtons() {
        const count = selectedCodes.size;
        deleteSelectedBtn.disabled = count === 0;
        scanDeleteSelectedBtn.disabled = count === 0;
        const title = count > 0 ? `Excluir ${count} código(s) selecionado(s)` : 'Nenhum código selecionado';
        deleteSelectedBtn.title = title;
        scanDeleteSelectedBtn.title = title;
    }

    function selectAllCodes() {
        if (importedCodes.length === 0) return;
        const allSelected = importedCodes.every(code => selectedCodes.has(code));
        if (allSelected) selectedCodes.clear();
        else importedCodes.forEach(code => { if (isValidAwbCode(code)) selectedCodes.add(code); });
        renderCodeList(codeListContainer, false, searchInput.value);
        renderCodeList(scanCodeListContainer, true, scanSearchInput.value);
        renderCodeList(exportCodeListContainer, false, exportSearchInput.value);
        updateDeleteButtons();
    }

    function deleteSelectedCodes() {
        if (selectedCodes.size === 0) return;
        const count = selectedCodes.size;
        showConfirm('Excluir Códigos', `Tem certeza que deseja excluir ${count} código(s) selecionado(s)? Esta ação não pode ser desfeita.`, () => {
            importedCodes = importedCodes.filter(code => !selectedCodes.has(code));
            selectedCodes.forEach(code => {
                delete codeStatus[code];
                delete lotesMap[normalizeCode(code)];
            });
            selectedCodes.clear();
            renderCodeList(codeListContainer, false, searchInput.value);
            renderCodeList(scanCodeListContainer, true, scanSearchInput.value);
            renderCodeList(exportCodeListContainer, false, exportSearchInput.value);
            renderExportGrids();
            updateStats();
            updateDeleteButtons();
            if (importedCodes.length === 0) {
                scanHistory = [];
                renderScanHistory(scanHistoryContainer);
                renderExportGrids();
            }
            showNotification(`${count} código(s) excluído(s)!`);
        }, { danger: true });
    }

    function validateScannedCode(rawCode) {
        const code = normalizeCode(rawCode);
        if (!code) return { status: 'INVÁLIDO', message: 'Código vazio' };
        if (!isValidAwbCode(code)) return { status: 'INVÁLIDO', message: 'Formato inválido' };
        const found = importedCodes.some(c => normalizeCode(c) === code);
        if (!found) return { status: 'NÃO ENCONTRADO', message: 'Não está na lista' };
        const lote = getLoteForCode(code);
        if (isLoteDevRecusada(lote)) return { status: STATUS_DEV_RECUSADA, message: 'Devolução recusada' };
        return { status: 'APROVADO', message: 'Código encontrado' };
    }

    function addScanToHistory(code, status) {
        const now = new Date();
        const timestamp = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const normalizedCode = normalizeCode(code);
        if (!scannedCodesMap[normalizedCode]) scannedCodesMap[normalizedCode] = 0;
        scannedCodesMap[normalizedCode]++;
        const isDuplicate = scannedCodesMap[normalizedCode] > 1;
        const scanCount = scannedCodesMap[normalizedCode];

        if (isDuplicate && status !== 'INVÁLIDO') playSound('DUPLICADO');
        else playSound(status);

        if (status === 'APROVADO' || status === STATUS_DEV_RECUSADA) {
            const foundCode = importedCodes.find(c => normalizeCode(c) === normalizedCode);
            if (foundCode) codeStatus[foundCode] = 'found';
        }
        scanHistory.push({ code, status, timestamp, isDuplicate: isDuplicate && status !== 'INVÁLIDO', scanCount });
        renderScanHistory(scanHistoryContainer);
        renderExportGrids();
        renderCodeList(codeListContainer, false, searchInput.value);
        renderCodeList(scanCodeListContainer, true, scanSearchInput.value);
        renderCodeList(exportCodeListContainer, false, exportSearchInput.value);
        updateStats();
    }

    function handleScan() {
        const raw = scanInput.value;
        if (!raw.trim()) { showAlert('Código Vazio', 'Digite ou bipe um código para validar.', { warning: true }); return; }
        hideAutocompleteHint();
        const code = normalizeCode(raw);
        const result = validateScannedCode(code);
        addScanToHistory(code, result.status);
        scanInput.value = '';
        scanInput.focus();
    }

    function showAutocompleteHint() { autocompleteHint.classList.add('visible'); }
    function hideAutocompleteHint() { autocompleteHint.classList.remove('visible'); }
    function applyAutocomplete() {
        isCompletingByHint = true;
        scanInput.value = 'TXAtx';
        scanInput.setSelectionRange(3, 3);
        scanInput.focus();
        hideAutocompleteHint();
        isCompletingByHint = false;
    }

    scanInput.addEventListener('input', () => {
        if (isCompletingByHint) return;
        const value = scanInput.value.toUpperCase();
        if (value === 'T') showAutocompleteHint();
        else if (value.length > 1 || value.length === 0) hideAutocompleteHint();
    });
    scanInput.addEventListener('keydown', (e) => {
        if (autocompleteHint.classList.contains('visible')) {
            if (e.key === 'Tab' || e.key === 'ArrowUp') { e.preventDefault(); applyAutocomplete(); return; }
            if (e.key === 'Escape') { hideAutocompleteHint(); return; }
        }
        if (e.key === 'Enter') { e.preventDefault(); handleScan(); }
    });
    scanInput.addEventListener('blur', () => { setTimeout(hideAutocompleteHint, 200); });
    autocompleteHint.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); applyAutocomplete(); });
    autocompleteHint.addEventListener('mousedown', (e) => { e.preventDefault(); });

    async function importFromTextarea() {
        const textAWB = importTextarea.value;
        const textLote = loteTextarea.value;
        activateEditorMode(awbImportArea, awbLineNumbers, textAWB);
        activateEditorMode(loteImportArea, loteLineNumbers, textLote);
        const awbLines = textAWB.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        const loteLines = textLote.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        if (awbLines.length === 0) { showAlert('Nenhum Código', 'Cole os códigos AWB no campo AWB para importar.', { warning: true }); return; }
        importBtn.disabled = true;
        await showLoading('Importando códigos...', 1500);
        importedCodes = awbLines.map(normalizeCode);
        codeStatus = {};
        selectedCodes.clear();
        scannedCodesMap = {};
        lotesMap = {};
        importedCodes.forEach((code, index) => {
            if (!isValidAwbCode(code)) codeStatus[code] = 'invalid';
            else codeStatus[code] = 'pending';
            if (index < loteLines.length && loteLines[index]) {
                lotesMap[normalizeCode(code)] = normalizeLoteValue(loteLines[index]);
            }
        });
        renderCodeList(codeListContainer, false, searchInput.value);
        renderCodeList(scanCodeListContainer, true, scanSearchInput.value);
        renderCodeList(exportCodeListContainer, false, exportSearchInput.value);
        renderScanHistory(scanHistoryContainer);
        renderExportGrids();
        updateStats();
        updateDeleteButtons();
        importBtn.disabled = false;
    }

    function clearImport() {
        if (importedCodes.length === 0 && !importTextarea.value.trim() && !loteTextarea.value.trim()) return;
        showConfirm('Limpar Importação', 'Tem certeza que deseja limpar todos os códigos importados e lotes?', () => {
            importedCodes = [];
            lotesMap = {};
            codeStatus = {};
            selectedCodes.clear();
            scanHistory = [];
            scannedCodesMap = {};
            importTextarea.value = '';
            loteTextarea.value = '';
            activateEditorMode(awbImportArea, awbLineNumbers, '');
            activateEditorMode(loteImportArea, loteLineNumbers, '');
            renderCodeList(codeListContainer, false, searchInput.value);
            renderCodeList(scanCodeListContainer, true, scanSearchInput.value);
            renderCodeList(exportCodeListContainer, false, exportSearchInput.value);
            renderScanHistory(scanHistoryContainer);
            renderExportGrids();
            updateStats();
            updateDeleteButtons();
            showNotification('Importação limpa!');
        }, { danger: true });
    }

    function clearScanHistory() {
        if (scanHistory.length === 0) return;
        showConfirm('Limpar Histórico', 'Tem certeza que deseja limpar todo o histórico de leituras?', () => {
            scanHistory = [];
            scannedCodesMap = {};
            importedCodes.forEach(code => {
                codeStatus[code] = isValidAwbCode(code) ? 'pending' : 'invalid';
            });
            renderScanHistory(scanHistoryContainer);
            renderExportGrids();
            renderCodeList(codeListContainer, false, searchInput.value);
            renderCodeList(scanCodeListContainer, true, scanSearchInput.value);
            renderCodeList(exportCodeListContainer, false, exportSearchInput.value);
            updateStats();
            showNotification('Histórico limpo!');
        }, { danger: true });
    }

    function setGridSize(size, container = scanHistoryContainer, btns = gridBtns) {
        container.classList.remove('small', 'medium', 'large');
        container.classList.add(size);
        btns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.size === size) btn.classList.add('active');
        });
    }

    function getUniqueCodesByStatus(status) {
        const items = scanHistory.filter(item => item.status === status);
        const seen = new Set();
        const unique = [];
        for (const item of items) {
            const n = normalizeCode(item.code);
            if (!seen.has(n)) { seen.add(n); unique.push(item.code); }
        }
        return unique;
    }

    function copyApprovedAll() {
        const items = scanHistory.filter(item => item.status === 'APROVADO');
        if (items.length === 0) { showAlert('Nada para Copiar', 'Não há códigos aprovados para copiar.', { warning: true }); return; }
        copyToClipboard(items.map(i => i.code).join('\n'), `${items.length} código(s) aprovado(s) copiado(s)! (com duplicados)`);
    }
    function copyApprovedUnique() {
        const items = scanHistory.filter(item => item.status === 'APROVADO');
        if (items.length === 0) { showAlert('Nada para Copiar', 'Não há códigos aprovados para copiar.', { warning: true }); return; }
        const unique = getUniqueCodesByStatus('APROVADO');
        copyToClipboard(unique.join('\n'), `${unique.length} código(s) único(s) copiado(s)!`);
    }
    function copyNotFoundAll() {
        const items = scanHistory.filter(item => item.status === 'NÃO ENCONTRADO');
        if (items.length === 0) { showAlert('Nada para Copiar', 'Não há códigos não encontrados para copiar.', { warning: true }); return; }
        copyToClipboard(items.map(i => i.code).join('\n'), `${items.length} código(s) não encontrado(s) copiado(s)! (com duplicados)`);
    }
    function copyNotFoundUnique() {
        const items = scanHistory.filter(item => item.status === 'NÃO ENCONTRADO');
        if (items.length === 0) { showAlert('Nada para Copiar', 'Não há códigos não encontrados para copiar.', { warning: true }); return; }
        const unique = getUniqueCodesByStatus('NÃO ENCONTRADO');
        copyToClipboard(unique.join('\n'), `${unique.length} código(s) único(s) copiado(s)!`);
    }
    function copyDevRecusadaAll() {
        const items = scanHistory.filter(item => item.status === STATUS_DEV_RECUSADA);
        if (items.length === 0) { showAlert('Nada para Copiar', 'Não há devoluções recusadas para copiar.', { warning: true }); return; }
        copyToClipboard(items.map(i => i.code).join('\n'), `${items.length} devolução(ões) recusada(s) copiada(s)! (com duplicados)`);
    }
    function copyDevRecusadaUnique() {
        const items = scanHistory.filter(item => item.status === STATUS_DEV_RECUSADA);
        if (items.length === 0) { showAlert('Nada para Copiar', 'Não há devoluções recusadas para copiar.', { warning: true }); return; }
        const unique = getUniqueCodesByStatus(STATUS_DEV_RECUSADA);
        copyToClipboard(unique.join('\n'), `${unique.length} devolução(ões) única(s) copiada(s)!`);
    }
    function copyToClipboard(text, successMessage) {
        navigator.clipboard.writeText(text).then(() => showNotification(successMessage)).catch(() => {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showNotification(successMessage);
        });
    }

    // ===== IMPRESSÃO =====
    function getApprovedItemsForPrint() {
        const items = scanHistory.filter(item => item.status === 'APROVADO');
        const seen = new Set();
        const unique = [];
        for (const item of items) {
            const n = normalizeCode(item.code);
            if (!seen.has(n)) { seen.add(n); unique.push(item); }
        }
        return unique;
    }
    function getPendingItemsForPrint() {
        const pending = [];
        for (const code of importedCodes) {
            const st = codeStatus[code];
            if (st === 'pending' && isValidAwbCode(code)) pending.push({ code: code, status: 'PENDENTE' });
        }
        return pending;
    }
    function getPrintLoteFromCode(code, statusOverride = null) {
        if (statusOverride === STATUS_DEV_RECUSADA) return 'DEV RECUSADA';
        const lote = getLoteForCode(code);
        return lote || '—';
    }
    function getPrintStatusLabel(status) {
        if (status === 'APROVADO' || status === 'ENCONTRADO') return 'Encontrado';
        if (status === 'NÃO ENCONTRADO') return 'Não Encontrado';
        if (status === STATUS_DEV_RECUSADA) return 'Dev Recusada';
        if (status === 'PENDENTE' || status === 'pending') return 'Pendente';
        return status;
    }
    function buildPrintHeader(pageNum, totalPages) {
        return `
            <div class="print-header">
                <div class="print-header-left">
                    <img src="${PRINT_LOGO_URL}" alt="M-Utility Logo" class="print-logo" crossorigin="anonymous">
                    <div>
                        <div class="print-brand">M-Utility <span class="print-brand-version">${APP_VERSION}</span></div>
                        <div class="print-brand-sub">Logistics Toolkit</div>
                    </div>
                </div>
                <div class="print-page-counter">Página ${pageNum} de ${totalPages}</div>
            </div>
        `;
    }
    function buildPrintFooter(totalItems) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('pt-BR');
        const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const user = getCurrentUser();
        const userName = user ? (user.displayName || user.username) : '—';
        return `
            <div class="print-footer">
                <div class="footer-conferente">Conferente: ${userName}</div>
                <div class="footer-bottom-row">
                    <span>Impresso em ${dateStr} às ${timeStr}</span>
                    <span class="footer-total">Total de itens: ${totalItems}</span>
                </div>
            </div>
        `;
    }
    function buildPrintTable(rows, titleText, titleClass, startIndex = 0) {
        const rowsHtml = rows.map((row, i) => {
            const seq = startIndex + i + 1;
            const code = row.code;
            const loteText = row.loteOverride !== undefined ? row.loteOverride : getPrintLoteFromCode(code, row.statusOverride);
            const statusLabel = getPrintStatusLabel(row.statusOverride || row.status);
            return `
                <div class="print-row">
                    <span class="col-num">${seq}</span>
                    <span class="col-code">${code}</span>
                    <span class="col-lote">${loteText}</span>
                    <span class="col-status">${statusLabel}</span>
                </div>
            `;
        }).join('');
        const emptyMsg = `<div class="print-row" style="border:none;justify-content:center;color:#999;font-style:italic;font-size:8pt;padding:10px 0;">Nenhum registro</div>`;
        return `
            <div class="print-table-wrap">
                <div class="print-table-title ${titleClass}">${titleText}</div>
                <div class="print-col-header">
                    <span>#</span><span>AWB</span><span>Lote</span><span>Status</span>
                </div>
                <div class="print-col-body">
                    ${rows.length > 0 ? rowsHtml : emptyMsg}
                </div>
            </div>
        `;
    }
    function buildPrintStatsPanel() {
        const total = importedCodes.length;
        const found = importedCodes.filter(c => codeStatus[c] === 'found').length;
        const notFound = scanHistory.filter(item => item.status === 'NÃO ENCONTRADO').length;
        const invalid = scanHistory.filter(item => item.status === 'INVÁLIDO').length;
        const devRecusada = scanHistory.filter(item => item.status === STATUS_DEV_RECUSADA).length;
        const pending = total - found;
        return `
            <div class="print-stats-panel">
                <div class="print-stats-title">Resumo</div>
                <div class="print-stat-item"><span class="print-stat-label">Total</span><span class="print-stat-value total">${total}</span></div>
                <div class="print-stat-item"><span class="print-stat-label">Encontrados</span><span class="print-stat-value found">${found}</span></div>
                <div class="print-stat-item"><span class="print-stat-label">Não Encontrado</span><span class="print-stat-value notfound">${notFound}</span></div>
                <div class="print-stat-item"><span class="print-stat-label">Inválido</span><span class="print-stat-value invalid">${invalid}</span></div>
                <div class="print-stat-item"><span class="print-stat-label">Dev Recusada</span><span class="print-stat-value devrecusada">${devRecusada}</span></div>
                <div class="print-stat-item"><span class="print-stat-label">Faltam</span><span class="print-stat-value pending">${pending}</span></div>
            </div>
        `;
    }
    function printGrid(title) {
        const approvedItems = getApprovedItemsForPrint();
        const pendingItems = getPendingItemsForPrint();
        if (approvedItems.length === 0 && pendingItems.length === 0) {
            showAlert('Nada para Imprimir', 'Não há dados para imprimir.', { warning: true });
            return;
        }
        const approvedRows = approvedItems.map(it => ({ code: it.code, statusOverride: 'ENCONTRADO' }));
        const pendingRows = pendingItems.map(it => ({ code: it.code, statusOverride: 'PENDENTE' }));
        const maxRows = Math.max(approvedRows.length, pendingRows.length);
        const rowsPerPage = PRINT_ITEMS_PER_COLUMN;
        const totalPages = Math.max(1, Math.ceil(maxRows / rowsPerPage));
        let pagesHtml = '';
        for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
            const start = pageIdx * rowsPerPage;
            const end = start + rowsPerPage;
            const pageApproved = approvedRows.slice(start, end);
            const pagePending = pendingRows.slice(start, end);
            pagesHtml += `
                <div class="print-page">
                    ${buildPrintHeader(pageIdx + 1, totalPages)}
                    <div class="print-title">${title}</div>
                    <div class="print-cols">
                        ${buildPrintTable(pageApproved, 'Aprovados / Encontrados', 'aprovados', 0)}
                        ${buildPrintTable(pagePending, 'Pendentes', 'pendentes', 0)}
                        ${buildPrintStatsPanel()}
                    </div>
                    ${buildPrintFooter(approvedRows.length + pendingRows.length)}
                </div>
            `;
        }
        printArea.innerHTML = pagesHtml;
        const images = printArea.querySelectorAll('img');
        const imagePromises = Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
                setTimeout(resolve, 800);
            });
        });
        Promise.all(imagePromises).then(() => {
            setTimeout(() => window.print(), 100);
        });
    }

    printApprovedBtn.addEventListener('click', () => printGrid('Aprovados'));
    printNotFoundBtn.addEventListener('click', () => printGrid('Não Encontrados'));
    printDevRecusadaBtn.addEventListener('click', () => printGrid('Devoluções Recusadas'));

    function showNotification(message, isWarning = false) {
        const notification = document.createElement('div');
        notification.className = 'copy-notification' + (isWarning ? ' warning' : '');
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    function downloadLogo() {
        const link = document.createElement('a');
        link.href = LOGO_ICO_URL;
        link.download = 'M-Utility-Logo.ico';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // ===== CONSOLE =====
    function consoleLog(message, type = 'output', withTyping = false) {
        return new Promise((resolve) => {
            const line = document.createElement('div');
            line.className = 'console-line';
            const promptSpan = document.createElement('span');
            promptSpan.className = 'prompt';
            promptSpan.textContent = '$ ';
            line.appendChild(promptSpan);
            const contentSpan = document.createElement('span');
            contentSpan.className = type;
            if (withTyping && typeof message === 'string') {
                let index = 0;
                contentSpan.textContent = '';
                line.appendChild(contentSpan);
                consoleOutput.appendChild(line);
                const typingInterval = setInterval(() => {
                    if (index < message.length) {
                        contentSpan.textContent += message[index];
                        index++;
                        consoleOutput.scrollTop = consoleOutput.scrollHeight;
                    } else {
                        clearInterval(typingInterval);
                        contentSpan.classList.remove('typing');
                        resolve();
                    }
                }, 15);
            } else {
                contentSpan.textContent = message;
                line.appendChild(contentSpan);
                consoleOutput.appendChild(line);
                consoleOutput.scrollTop = consoleOutput.scrollHeight;
                resolve();
            }
        });
    }

    async function executeConsoleCommand(input) {
        const trimmed = input.trim();
        if (!trimmed) return;
        await consoleLog(trimmed, 'command', true);

        if (trimmed === 'muh.help') {
            await consoleLog('Comandos disponíveis:', 'info');
            await consoleLog('  muh.help', 'info');
            await consoleLog('  muh.list', 'info');
            await consoleLog('  muh.stats', 'info');
            await consoleLog('  muh.add{CODIGO} [LOTE]', 'info');
            await consoleLog('  muh.delete{CODIGO}', 'info');
            await consoleLog('  muh.deleteall', 'info');
            await consoleLog('  muh.clear', 'info');
            await consoleLog('  muh.found', 'info');
            await consoleLog('  muh.pending', 'info');
            await consoleLog('  muh.notfound', 'info');
            await consoleLog('  muh.devrecusada', 'info');
            await consoleLog('  muh.logo', 'info');
            return;
        }
        if (trimmed === 'muh.logo') {
            await consoleLog('Baixando logo...', 'info');
            try { downloadLogo(); await consoleLog('Logo M-Utility baixada!', 'success'); }
            catch (e) { await consoleLog('Erro ao baixar a logo.', 'error'); }
            return;
        }
        if (trimmed === 'muh.clear') { consoleOutput.innerHTML = ''; await consoleLog('Console limpo', 'info'); return; }
        if (trimmed === 'muh.list') {
            if (importedCodes.length === 0) { await consoleLog('Nenhum código importado.', 'error'); }
            else {
                await consoleLog(`Total: ${importedCodes.length} códigos`, 'info');
                for (const code of importedCodes) {
                    const status = codeStatus[code] || 'pending';
                    const lote = getLoteForCode(code) || '—';
                    const isDev = isLoteDevRecusada(lote);
                    const emoji = isDev ? '🟣' : status === 'found' ? '✅' : status === 'not-found' ? '❌' : status === 'invalid' ? '⚠️' : '⏳';
                    const loteDisplay = isDev ? '[dev]' : lote;
                    await consoleLog(`  ${emoji} ${code} [${loteDisplay}] - ${isDev ? 'DEV RECUSADA' : status.toUpperCase()}`, 'output');
                }
            }
            return;
        }
        if (trimmed === 'muh.stats') {
            const total = importedCodes.length;
            const found = importedCodes.filter(c => codeStatus[c] === 'found').length;
            const notFound = scanHistory.filter(item => item.status === 'NÃO ENCONTRADO').length;
            const invalid = scanHistory.filter(item => item.status === 'INVÁLIDO').length;
            const devRecusada = scanHistory.filter(item => item.status === STATUS_DEV_RECUSADA).length;
            const duplicates = Object.keys(scannedCodesMap).filter(c => scannedCodesMap[c] > 1).length;
            const pending = total - found;
            await consoleLog('Estatísticas:', 'info');
            await consoleLog(`  Total: ${total}`, 'info');
            await consoleLog(`  Encontrados: ${found}`, 'success');
            await consoleLog(`  Não Encontrados: ${notFound}`, 'error');
            await consoleLog(`  Inválidos: ${invalid}`, 'error');
            await consoleLog(`  Dev Recusada: ${devRecusada}`, 'info');
            await consoleLog(`  Duplicados: ${duplicates}`, 'info');
            await consoleLog(`  Faltam: ${pending}`, 'info');
            return;
        }
        if (trimmed === 'muh.found') {
            const found = importedCodes.filter(c => codeStatus[c] === 'found');
            if (found.length === 0) await consoleLog('Nenhum código encontrado.', 'error');
            else {
                await consoleLog(`Códigos encontrados (${found.length}):`, 'success');
                for (const code of found) {
                    const lote = getLoteForCode(code) || '—';
                    const isDev = isLoteDevRecusada(lote);
                    await consoleLog(`  ${code} [${isDev ? '[dev]' : lote}]`, 'success');
                }
            }
            return;
        }
        if (trimmed === 'muh.pending') {
            const pending = importedCodes.filter(c => codeStatus[c] === 'pending' && isValidAwbCode(c));
            if (pending.length === 0) await consoleLog('Nenhum código pendente.', 'info');
            else {
                await consoleLog(`Códigos pendentes (${pending.length}):`, 'info');
                for (const code of pending) await consoleLog(`  ${code} [${getLoteForCode(code) || '—'}]`, 'info');
            }
            return;
        }
        if (trimmed === 'muh.notfound') {
            const notFoundItems = scanHistory.filter(item => item.status === 'NÃO ENCONTRADO');
            if (notFoundItems.length === 0) await consoleLog('Nenhum código não encontrado.', 'info');
            else {
                await consoleLog(`Não encontrados (${notFoundItems.length}):`, 'error');
                for (const item of notFoundItems) await consoleLog(`  ${item.code}`, 'error');
            }
            return;
        }
        if (trimmed === 'muh.devrecusada') {
            const devItems = scanHistory.filter(item => item.status === STATUS_DEV_RECUSADA);
            if (devItems.length === 0) await consoleLog('Nenhum DEV RECUSADA bipado.', 'info');
            else {
                await consoleLog(`DEV RECUSADA bipados (${devItems.length}):`, 'info');
                for (const item of devItems) await consoleLog(`  🟣 ${item.code}`, 'output');
            }
            return;
        }
        if (trimmed === 'muh.deleteall') {
            if (importedCodes.length === 0) { await consoleLog('Nenhum código para deletar.', 'error'); return; }
            showConfirm('Deletar Todos', 'Tem certeza que deseja deletar TODOS os códigos?', () => {
                importedCodes = [];
                lotesMap = {};
                codeStatus = {};
                selectedCodes.clear();
                scanHistory = [];
                scannedCodesMap = {};
                renderCodeList(codeListContainer, false, searchInput.value);
                renderCodeList(scanCodeListContainer, true, scanSearchInput.value);
                renderCodeList(exportCodeListContainer, false, exportSearchInput.value);
                renderScanHistory(scanHistoryContainer);
                renderExportGrids();
                updateStats();
                updateDeleteButtons();
                consoleLog('Todos os códigos foram deletados.', 'success');
            }, { danger: true });
            return;
        }
        const addMatch = trimmed.match(/^muh\.add\{([^}]+)\}(?:\s*\[([^\]]+)\])?$/i);
        if (addMatch) {
            const codeToAdd = normalizeCode(addMatch[1]);
            const loteToAdd = addMatch[2] ? normalizeLoteValue(addMatch[2]) : '';
            if (!isValidAwbCode(codeToAdd)) { await consoleLog(`Código ${codeToAdd} inválido.`, 'error'); return; }
            if (importedCodes.some(c => normalizeCode(c) === codeToAdd)) { await consoleLog(`Código ${codeToAdd} já existe.`, 'error'); return; }
            importedCodes.push(codeToAdd);
            codeStatus[codeToAdd] = 'pending';
            if (loteToAdd) lotesMap[codeToAdd] = loteToAdd;
            await consoleLog(`Código ${codeToAdd} adicionado.`, 'success');
            renderCodeList(codeListContainer, false, searchInput.value);
            renderCodeList(scanCodeListContainer, true, scanSearchInput.value);
            renderCodeList(exportCodeListContainer, false, exportSearchInput.value);
            updateStats();
            updateDeleteButtons();
            return;
        }
        const deleteMatch = trimmed.match(/^muh\.delete\{([^}]+)\}$/i);
        if (deleteMatch) {
            const codeToDelete = normalizeCode(deleteMatch[1]);
            const index = importedCodes.findIndex(c => normalizeCode(c) === codeToDelete);
            if (index === -1) { await consoleLog(`Código ${codeToDelete} não encontrado.`, 'error'); return; }
            importedCodes.splice(index, 1);
            delete codeStatus[codeToDelete];
            delete lotesMap[codeToDelete];
            selectedCodes.delete(codeToDelete);
            renderCodeList(codeListContainer, false, searchInput.value);
            renderCodeList(scanCodeListContainer, true, scanSearchInput.value);
            renderCodeList(exportCodeListContainer, false, exportSearchInput.value);
            renderExportGrids();
            updateStats();
            updateDeleteButtons();
            await consoleLog(`Código ${codeToDelete} deletado.`, 'success');
            return;
        }
        await consoleLog(`Comando não reconhecido: ${trimmed}`, 'error');
    }

    async function switchTab(tabId) {
        if (currentTab === tabId || isTransitioning) return;
        currentTab = tabId;
        await showLoading(`Acessando ${tabId.charAt(0).toUpperCase() + tabId.slice(1)}...`, 500);
        tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
        Object.keys(tabContents).forEach(key => tabContents[key].classList.toggle('active', key === tabId));
        if (tabId === 'scan') setTimeout(() => scanInput.focus(), 100);
        if (tabId === 'export') { renderExportGrids(); renderCodeList(exportCodeListContainer, false, exportSearchInput.value); }
        if (tabId === 'console') setTimeout(() => consoleInput.focus(), 100);
        hideLoading();
    }

    function handleSearch(e) { renderCodeList(codeListContainer, false, e.target.value); }
    function handleScanSearch(e) { renderCodeList(scanCodeListContainer, true, e.target.value); }
    function handleExportSearch(e) { renderCodeList(exportCodeListContainer, false, e.target.value); }

    function setupAudioControls() {
        volumeSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            audioVolume = value / 100;
            volumePercent.textContent = value + '%';
            volumeSlider.style.setProperty('--volume-percent', value + '%');
            Object.values(audioCache).forEach(audio => { audio.volume = audioVolume; });
            if (value === 0) { isMuted = true; audioToggle.classList.add('muted'); audioIcon.innerHTML = ICON_MUTED; audioStatus.classList.add('muted'); }
            else if (isMuted) { isMuted = false; audioToggle.classList.remove('muted'); audioIcon.innerHTML = ICON_VOLUME; audioStatus.classList.remove('muted'); }
        });
        audioToggle.addEventListener('click', () => {
            isMuted = !isMuted;
            if (isMuted) { audioToggle.classList.add('muted'); audioIcon.innerHTML = ICON_MUTED; audioStatus.classList.add('muted'); }
            else { audioToggle.classList.remove('muted'); audioIcon.innerHTML = ICON_VOLUME; audioStatus.classList.remove('muted'); }
        });
        volumeSlider.style.setProperty('--volume-percent', '100%');
        volumeSlider.value = 100;
        volumePercent.textContent = '100%';
    }

    importBtn.addEventListener('click', importFromTextarea);
    clearImportBtn.addEventListener('click', clearImport);
    deleteSelectedBtn.addEventListener('click', deleteSelectedCodes);
    selectAllBtn.addEventListener('click', selectAllCodes);
    searchInput.addEventListener('input', handleSearch);
    scanBtn.addEventListener('click', handleScan);
    clearScanHistoryBtn.addEventListener('click', clearScanHistory);
    scanSelectAllBtn.addEventListener('click', selectAllCodes);
    scanDeleteSelectedBtn.addEventListener('click', deleteSelectedCodes);
    scanSearchInput.addEventListener('input', handleScanSearch);
    exportSearchInput.addEventListener('input', handleExportSearch);
    copyApprovedAllBtn.addEventListener('click', copyApprovedAll);
    copyApprovedUniqueBtn.addEventListener('click', copyApprovedUnique);
    copyNotFoundAllBtn.addEventListener('click', copyNotFoundAll);
    copyNotFoundUniqueBtn.addEventListener('click', copyNotFoundUnique);
    copyDevRecusadaAllBtn.addEventListener('click', copyDevRecusadaAll);
    copyDevRecusadaUniqueBtn.addEventListener('click', copyDevRecusadaUnique);
    gridBtns.forEach(btn => btn.addEventListener('click', () => setGridSize(btn.dataset.size, scanHistoryContainer, gridBtns)));
    consoleExecuteBtn.addEventListener('click', async () => {
        const input = consoleInput.value;
        if (input) { await executeConsoleCommand(input); consoleInput.value = ''; }
    });
    consoleInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const input = consoleInput.value;
            if (input) { await executeConsoleCommand(input); consoleInput.value = ''; }
        }
    });
    consoleClearBtn.addEventListener('click', () => { consoleOutput.innerHTML = ''; consoleLog('Console limpo', 'info'); });
    tabBtns.forEach(btn => btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab) switchTab(tab);
    }));

    preloadAudio();
    setupAudioControls();
    setupLineNumbersEditor(importTextarea, awbImportArea, awbLineNumbers);
    setupLineNumbersEditor(loteTextarea, loteImportArea, loteLineNumbers);
    renderCodeList(codeListContainer, false, '');
    renderCodeList(scanCodeListContainer, true, '');
    renderCodeList(exportCodeListContainer, false, '');
    renderScanHistory(scanHistoryContainer);
    renderExportGrids();
    updateStats();
    updateDeleteButtons();
    setGridSize('medium', scanHistoryContainer, gridBtns);
    showHub();
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    showView('landing');
});