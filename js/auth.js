/* ═══ AUTH MODULE — Daniel Veículos (Firebase) ═══ */
'use strict';

const Auth = (() => {
  let currentUser = null;

  return {
    async init() {
      // Monitora o estado de autenticação real no Firebase
      return new Promise(resolve => {
        firebase.auth().onAuthStateChanged(user => {
          currentUser = user;
          resolve(user);
        });
      });
    },

    async register({ name, email, password, photo = '' }) {
      if (!name || !email || !password) throw new Error('Preencha todos os campos.');
      if (password.length < 6) throw new Error('Senha deve ter no mínimo 6 caracteres.');

      // Registra o usuário no Firebase Auth
      const cred = await firebase.auth().createUserWithEmailAndPassword(email, password);
      
      // Atualiza o perfil com o nome e a foto (se houver)
      await cred.user.updateProfile({
        displayName: name,
        photoURL: photo || ''
      });

      // Cadastra o usuário também no Realtime Database para listagem
      firebase.database().ref('dv_users/' + cred.user.uid).set({
        name,
        email,
        role: 'admin', // Definimos todos como admin inicialmente
        photo: photo || '',
        createdAt: new Date().toISOString()
      });

      return cred.user;
    },

    async login(email, password) {
      if (!email || !password) throw new Error('Informe e-mail e senha.');
      const cred = await firebase.auth().signInWithEmailAndPassword(email, password);
      currentUser = cred.user;
      return this.getSession();
    },

    logout() {
      return firebase.auth().signOut();
    },

    getSession() {
      if (!currentUser) return null;
      return {
        id: currentUser.uid,
        name: currentUser.displayName || 'Gestor',
        email: currentUser.email,
        photo: currentUser.photoURL || '',
        avatar: (currentUser.displayName || 'User').substring(0, 2).toUpperCase(),
        role: 'admin' // Para o frontend atual, assumimos admin
      };
    },

    isLoggedIn() { return !!currentUser; },

    // Lista de usuários busca direto do Realtime Database (Firebase Auth não permite listar via client-side)
    listUsers() {
      // Vamos tentar buscar do localStorage que o database sincroniza, ou vazio se não tiver
      try {
        const raw = localStorage.getItem('dv_users');
        if (raw) {
          const obj = JSON.parse(raw);
          return Object.values(obj);
        }
      } catch (e) {}
      return [];
    },

    deleteUser(id) {
      // Nota: Excluir usuário do Auth requer Firebase Admin (servidor).
      // Por segurança, via client-side não podemos deletar outros usuários.
      alert("Para excluir usuários reais, utilize o painel do Firebase Authentication.");
    },
  };
})();
