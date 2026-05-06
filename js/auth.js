/* ═══ AUTH MODULE — Daniel Veículos ═══
 * Camada de autenticação com persistência via localStorage
 * Hash de senha via SHA-256 (SubtleCrypto API)
 * Sessões via token gerado aleatoriamente
 */
'use strict';

const Auth = (() => {
  const KEYS = {
    users:   'dv_users',
    session: 'dv_session',
  };

  /* ── Utilitários ── */
  async function hashPassword(pass) {
    const buf = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(pass + 'dv_salt_2024')
    );
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  function genToken() {
    return crypto.randomUUID ? crypto.randomUUID()
      : [...Array(32)].map(()=>Math.random().toString(36)[2]).join('');
  }

  function loadUsers() {
    try { return JSON.parse(localStorage.getItem(KEYS.users)) || []; }
    catch { return []; }
  }

  function saveUsers(users) {
    localStorage.setItem(KEYS.users, JSON.stringify(users));
  }

  /* ── Seed: conta padrão ── */
  async function seedDefault() {
    const users = loadUsers();
    if (!users.find(u => u.email === 'daniel@danielveiculos.com.br')) {
      const hash = await hashPassword('admin');
      users.push({
        id:        genToken(),
        name:      'Gestor Daniel',
        email:     'daniel@danielveiculos.com.br',
        role:      'admin',
        avatar:    'DV',
        createdAt: new Date().toISOString(),
        hash,
      });
      saveUsers(users);
    }
  }

  /* ── API Pública ── */
  return {
    async init() { await seedDefault(); },

    async register({ name, email, password, role = 'viewer', photo = '' }) {
      if (!name || !email || !password) throw new Error('Preencha todos os campos.');
      if (password.length < 6) throw new Error('Senha deve ter no mínimo 6 caracteres.');

      const users = loadUsers();
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
        throw new Error('E-mail já cadastrado.');

      const initials = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
      const user = {
        id:        genToken(),
        name:      name.trim(),
        email:     email.toLowerCase().trim(),
        role,
        avatar:    initials,
        photo:     photo || '',
        createdAt: new Date().toISOString(),
        hash:      await hashPassword(password),
      };
      users.push(user);
      saveUsers(users);
      return { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, photo: user.photo };
    },

    async login(email, password) {
      const users = loadUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
      if (!user) throw new Error('E-mail não encontrado.');

      const hash = await hashPassword(password);
      if (hash !== user.hash) throw new Error('Senha incorreta.');

      const token = genToken();
      const session = {
        token,
        userId:    user.id,
        name:      user.name,
        email:     user.email,
        role:      user.role,
        avatar:    user.avatar,
        photo:     user.photo || '',
        expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8h
      };
      sessionStorage.setItem(KEYS.session, JSON.stringify(session));
      return session;
    },

    logout() {
      sessionStorage.removeItem(KEYS.session);
    },

    getSession() {
      try {
        const s = JSON.parse(sessionStorage.getItem(KEYS.session));
        if (!s) return null;
        if (Date.now() > s.expiresAt) { this.logout(); return null; }
        return s;
      } catch { return null; }
    },

    isLoggedIn() { return !!this.getSession(); },

    listUsers() {
      return loadUsers().map(({ hash, ...rest }) => rest); // nunca expõe o hash
    },

    deleteUser(id) {
      const users = loadUsers().filter(u => u.id !== id);
      saveUsers(users);
    },
  };
})();
