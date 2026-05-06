/* ═══ DATABASE — Daniel Veículos (Firebase Edition) ═══ */
'use strict';

const DB = (() => {
  const firebaseConfig = {
    apiKey: "AIzaSyDz6B2De-7CiQWQyPMyC4_niW6Wm1qc-XA",
    authDomain: "meusistemacadastro-d7d10.firebaseapp.com",
    databaseURL: "https://meusistemacadastro-d7d10-default-rtdb.firebaseio.com",
    projectId: "meusistemacadastro-d7d10",
    storageBucket: "meusistemacadastro-d7d10.firebasestorage.app",
    messagingSenderId: "1034148971946",
    appId: "1:1034148971946:web:01dd348cfac2bcc9a4d7d3"
  };

  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  const rdb = firebase.database();

  const KEYS = {
    vehicles:     'dv_vehicles',
    customers:    'dv_customers',
    transactions: 'dv_transactions',
    payables:     'dv_payables',
    notifs:       'dv_notifs',
  };

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }

  function save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      const path = key.replace('dv_', '');
      rdb.ref(path).set(data);
    } catch(e) { console.error('Storage error:', e); }
  }

  function setupSync() {
    ['vehicles', 'customers', 'transactions', 'payables', 'notifs', 'users'].forEach(k => {
      rdb.ref(k).on('value', snapshot => {
        const data = snapshot.val();
        if (data) {
          localStorage.setItem(KEYS[k] || k, JSON.stringify(data));
          window.dispatchEvent(new CustomEvent('db-updated'));
        }
      });
    });
  }

  async function uploadPhoto(file) {
    if (!firebase.storage) throw new Error('Storage indisponível');
    return new Promise((resolve, reject) => {
      const storageRef = firebase.storage().ref(`photos/${Date.now()}_${file.name||'foto.jpg'}`);
      const uploadTask = storageRef.put(file);
      
      const timeout = setTimeout(() => {
        uploadTask.cancel();
        reject(new Error('Timeout: O servidor demorou muito para responder.'));
      }, 6000);

      uploadTask.on('state_changed', 
        null, 
        err => { clearTimeout(timeout); reject(err); }, 
        async () => {
          clearTimeout(timeout);
          try {
            const url = await uploadTask.snapshot.ref.getDownloadURL();
            resolve(url);
          } catch(e) { reject(e); }
        }
      );
    });
  }

  function calcFinance() {
    const txs = load(KEYS.transactions, []);
    const pays = load(KEYS.payables, []);
    
    // Calcula totais reais
    const revenue = txs.filter(t => t.status === 'completed').reduce((s, t) => s + (t.value || 0), 0);
    const expenses = pays.filter(p => p.status === 'Pago').reduce((s, p) => s + (p.value || 0), 0);
    const profit = revenue - expenses;
    const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

    return {
      cashFlow:      profit,
      monthlyRevenue: revenue,
      totalExpenses: expenses,
      netMargin:     margin,
      salesData: [
        {n:'Lucro Líquido', v:profit},
        {n:'Total Receitas', v:revenue},
        {n:'Total Despesas', v:expenses},
      ],
      receivables: txs.filter(t => t.status === 'proposal'),
      payables: pays,
      bars:[{m:'1',p:20},{m:'2',p:40},{m:'3',p:60,cur:true},{m:'4',p:80,proj:true},{m:'5',p:100,proj:true}], // Barras visuais simples
    };
  }

  return {
    init() { setupSync(); },

    // ─ Vehicles ─
    vehicles(f = {}) {
      let r = load(KEYS.vehicles, []);
      if (f.search) {
        const s = f.search.toLowerCase();
        r = r.filter(v => `${v.brand} ${v.model} ${v.color} ${v.plate}`.toLowerCase().includes(s));
      }
      if (f.brand)  r = r.filter(v => v.brand === f.brand);
      if (f.status) r = r.filter(v => v.status === f.status);
      return r;
    },
    vehicle(id)   { return load(KEYS.vehicles,[]).find(v => String(v.id) === String(id)); },
    addVehicle(d) {
      const arr = load(KEYS.vehicles, []);
      const v = { id: Date.now(), ...d, createdAt: new Date().toISOString() };
      arr.unshift(v); save(KEYS.vehicles, arr);
      this.addNotif(`Veículo cadastrado: ${v.brand} ${v.model}`, 'Estoque atualizado');
      return v;
    },
    updateVehicle(id, d) {
      const arr = load(KEYS.vehicles, []);
      const i = arr.findIndex(v => String(v.id) === String(id));
      if (i < 0) return null;
      arr[i] = { ...arr[i], ...d, updatedAt: new Date().toISOString() };
      save(KEYS.vehicles, arr); return arr[i];
    },
    deleteVehicle(id) { save(KEYS.vehicles, load(KEYS.vehicles,[]).filter(v => String(v.id) !== String(id))); },

    // ─ Customers ─
    customers(f = {}) {
      let r = load(KEYS.customers, []);
      if (f.search) {
        const s = f.search.toLowerCase();
        r = r.filter(c => `${c.name} ${c.email} ${c.cpf}`.toLowerCase().includes(s));
      }
      if (f.status) r = r.filter(c => c.status === f.status);
      return r;
    },
    customer(id)   { return load(KEYS.customers,[]).find(c => String(c.id) === String(id)); },
    addCustomer(d) {
      const arr = load(KEYS.customers, []);
      const c = { id: Date.now(), ...d, lastContact: 'Agora', createdAt: new Date().toISOString() };
      arr.unshift(c); save(KEYS.customers, arr);
      this.addNotif(`Novo cliente: ${c.name}`, 'CRM atualizado');
      return c;
    },
    updateCustomer(id, d) {
      const arr = load(KEYS.customers, []);
      const i = arr.findIndex(c => String(c.id) === String(id));
      if (i < 0) return null;
      arr[i] = { ...arr[i], ...d, lastContact: 'Agora', updatedAt: new Date().toISOString() };
      save(KEYS.customers, arr); return arr[i];
    },
    deleteCustomer(id) { save(KEYS.customers, load(KEYS.customers,[]).filter(c => String(c.id) !== String(id))); },

    // ─ Transactions ─
    transactions() { return load(KEYS.transactions, []); },
    transaction(id) { return load(KEYS.transactions,[]).find(t => String(t.id) === String(id)); },
    addTransaction(d) {
      const arr = load(KEYS.transactions, []);
      const t = { id: Date.now(), ...d, createdAt: new Date().toISOString() };
      arr.unshift(t); save(KEYS.transactions, arr);
      this.addNotif(`Transação registrada`, Fmt.moneyShort(t.value));
      return t;
    },
    updateTransaction(id, d) {
      const arr = load(KEYS.transactions, []);
      const i = arr.findIndex(t => String(t.id) === String(id));
      if (i < 0) return null;
      arr[i] = { ...arr[i], ...d, updatedAt: new Date().toISOString() };
      save(KEYS.transactions, arr); return arr[i];
    },
    deleteTransaction(id) { save(KEYS.transactions, load(KEYS.transactions,[]).filter(t => String(t.id) !== String(id))); },

    // ─ Payables ─
    payables() { return load(KEYS.payables, []); },
    payable(id) { return load(KEYS.payables,[]).find(p => String(p.id) === String(id)); },
    addPayable(d) {
      const arr = load(KEYS.payables, []);
      const p = { id: Date.now(), ...d, createdAt: new Date().toISOString() };
      arr.unshift(p); save(KEYS.payables, arr);
      return p;
    },
    updatePayable(id, d) {
      const arr = load(KEYS.payables, []);
      const i = arr.findIndex(p => String(p.id) === String(id));
      if (i < 0) return null;
      arr[i] = { ...arr[i], ...d, updatedAt: new Date().toISOString() };
      save(KEYS.payables, arr); return arr[i];
    },
    deletePayable(id) { save(KEYS.payables, load(KEYS.payables,[]).filter(p => String(p.id) !== String(id))); },

    // ─ Notifications ─
    notifications()   { return load(KEYS.notifs, []); },
    unreadCount()     { return load(KEYS.notifs,[]).filter(n => !n.read).length; },
    addNotif(title, desc) {
      const arr = load(KEYS.notifs, []);
      arr.unshift({ id: Date.now(), title, desc, time: 'Agora', read: false });
      if (arr.length > 50) arr.pop(); save(KEYS.notifs, arr);
    },
    markAllRead() {
      const arr = load(KEYS.notifs,[]).map(n => ({ ...n, read: true }));
      save(KEYS.notifs, arr);
    },
    clearNotifs()     { save(KEYS.notifs, []); },

    // ─ Derived ─
    finance()   { return calcFinance(); },
    brands()    { return [...new Set(load(KEYS.vehicles,[]).map(v => v.brand))].sort(); },
    vitrineVehicles() { return load(KEYS.vehicles,[]).filter(v => v.destaque || v.status === 'vitrine' || v.price >= 1000000); },
    stats() {
      const v = load(KEYS.vehicles, []);
      return {
        total:     v.length,
        available: v.filter(x => x.status === 'available').length,
        reserved:  v.filter(x => x.status === 'reserved').length,
        sold:      v.filter(x => x.status === 'sold').length,
        vitrine:   v.filter(x => x.status === 'vitrine').length,
      };
    },
    kpi() {
      const cl = load(KEYS.customers, []);
      const s = this.stats();
      const fin = calcFinance();
      return {
        monthlySales:  Fmt.moneyShort(fin.monthlyRevenue),
        activeClients: cl.length,
        stockTurnover: '0 dias',
        lotVehicles:   s.total,
        newLeads:      cl.filter(c => c.status === 'new-lead').length,
        testDrives:    cl.filter(c => c.status === 'test-drive').length,
        negotiations:  cl.filter(c => c.status === 'negotiation').length,
        monthlyClosed: cl.filter(c => c.status === 'closed').length,
      };
    },
    weekly() {
      return [{d:'SEG',t:0,a:0},{d:'TER',t:0,a:0},{d:'QUA',t:0,a:0},{d:'QUI',t:0,a:0},{d:'SEX',t:0,a:0},{d:'SAB',t:0,a:0},{d:'DOM',t:0,a:0}];
    },
    aiInsights() {
      return [
        {cat:'SISTEMA', text:'Sistema inicializado e pronto para operação. Cadastre veículos e clientes para ver os insights.'},
      ];
    },
    uploadPhoto,
  };
})();

const Fmt = {
  money:      v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
  moneyShort: v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
  km:         v => Number(v).toLocaleString('pt-BR') + ' km',
  initials:   n => (n || '??').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(),
  date:       d => new Date(d).toLocaleDateString('pt-BR'),
};
