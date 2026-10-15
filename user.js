/* ============================================================
   M-Utility v5.0 — Gerenciamento de Usuários
   ============================================================ */

// Base de usuários hardcoded
const usersDB = [
    {
        username: 'Muh.png',
        password: '010918',
        displayName: 'Murilo N.B',
        role: 'Administrador',
        department: 'Logística',
        email: 'murilo@m-utility.local',
        canUseConsole: true
    },
    {
        username: 'Jessica',
        password: '1234',
        displayName: 'Jessica',
        role: 'Líder',
        department: 'Logística',
        email: 'jessica@m-utility.local',
        canUseConsole: true
    }
];

// Usuários registrados durante a sessão
const registeredUsers = [];

// Usuário logado atualmente
let currentUser = null;

// ============================================================
// BUSCA E VALIDAÇÃO
// ============================================================
function findUser(usernameOrEmail, password) {
    const all = [...usersDB, ...registeredUsers];
    const u = usernameOrEmail.trim().toLowerCase();
    return all.find(user =>
        (user.username.toLowerCase() === u || (user.email && user.email.toLowerCase() === u))
        && user.password === password
    );
}

function userExists(username, email) {
    const all = [...usersDB, ...registeredUsers];
    const uname = username.trim().toLowerCase();
    const mail = email.trim().toLowerCase();
    return all.some(user =>
        user.username.toLowerCase() === uname ||
        (user.email && user.email.toLowerCase() === mail)
    );
}

function registerUser({ username, password, email }) {
    registeredUsers.push({
        username: username,
        password: password,
        displayName: username,
        role: 'Operador',
        department: 'Logística',
        email: email,
        canUseConsole: false
    });
}

function getCurrentUser() {
    return currentUser;
}

function setCurrentUser(user) {
    currentUser = user;
}

function clearCurrentUser() {
    currentUser = null;
}