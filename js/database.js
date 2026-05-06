/* ═══ DATABASE — Daniel Veículos (Firebase Edition) ═══
 * Persistência real via Firebase Realtime Database
 * Sincronização automática entre dispositivos
 */
'use strict';

const DB = (() => {
  // CONFIGURAÇÃO DO FIREBASE
  const firebaseConfig = {
    apiKey: "AIzaSyDz6B2De-7CiQWQyPMyC4_niW6Wm1qc-XA",
    authDomain: "meusistemacadastro-d7d10.firebaseapp.com",
    databaseURL: "https://meusistemacadastro-d7d10-default-rtdb.firebaseio.com",
    projectId: "meusistemacadastro-d7d10",
    storageBucket: "meusistemacadastro-d7d10.firebasestorage.app",
    messagingSenderId: "1034148971946",
    appId: "1:1034148971946:web:01dd348cfac2bcc9a4d7d3"
  };

  // Inicializa Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const rdb = firebase.database();

  const KEYS = {
    vehicles:  'dv_vehicles',
    customers: 'dv_customers',
    finance:   'dv_finance',
    notifs:    'dv_notifs',
  };

  /* ── Storage Helpers ── */
  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }

  function save(key, data) {
    try {
      // Salva local para resposta rápida
      localStorage.setItem(key, JSON.stringify(data));
      
      // Salva no Firebase
      const path = key.replace('dv_', '');
      rdb.ref(path).set(data);
    } catch(e) { console.error('Storage error:', e); }
  }

  /* ── Sincronização em Tempo Real ── */
  function setupSync() {
    // Escuta veículos
    rdb.ref('vehicles').on('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        localStorage.setItem(KEYS.vehicles, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent('db-updated'));
      }
    });

    // Escuta clientes
    rdb.ref('customers').on('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        localStorage.setItem(KEYS.customers, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent('db-updated'));
      }
    });

    // Escuta notificações
    rdb.ref('notifs').on('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        localStorage.setItem(KEYS.notifs, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent('db-updated'));
      }
    });
  }

  /* ── ID Generator ── */
  function nextId(arr) {
    return arr.length > 0 ? Math.max(...arr.map(i => i.id)) + 1 : 1;
  }

  /* ── Finance (calculado com base nos veículos) ── */
  function calcFinance() {
    const vehicles = load(KEYS.vehicles, []);
    const sold = vehicles.filter(v => v.status === 'sold');
    const revenue = sold.reduce((s, v) => s + (v.price || 0), 0);
    return {
      cashFlow:      revenue + 1240500,
      monthlyRevenue: revenue > 0 ? revenue : 450200,
      revenueTarget: 530000,
      totalExpenses: 180450,
      expensePct:    40,
      netMargin:     28.4,
      taxes: [
        {n:'IRPJ (Trimestral)', v:42100},
        {n:'CSLL',              v:18250},
        {n:'PIS/COFINS',        v:12400},
      ],
      taxProv: 72750,
      receivables: [
        {client:'Ricardo Mendes', desc:'BMW 320i M-Sport 2023', due:'15 Out 2023', value:285000, status:'Aguardando'},
        {client:'Sofia Almeida',  desc:'Porsche Macan S 2022',  due:'12 Out 2023', value:512400, status:'Compensando'},
      ],
      payables: [
        {sup:'Tech Insurance S/A', desc:'Seguro Frota Mensal', due:'22 Out 2023', value:8450,  status:'Pendente'},
        {sup:'Energia Solar SP',   desc:'Manutenção Mensal',   due:'25 Out 2023', value:1200,  status:'Agendado'},
      ],
      bars:[{m:'AGO',p:65},{m:'SET',p:78},{m:'OUT',p:92,cur:true},{m:'NOV',p:45,proj:true},{m:'DEZ',p:30,proj:true}],
    };
  }

  /* ── Public API ── */
  return {
    init() { 
      setupSync(); 
    },

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
      arr.unshift(v);
      save(KEYS.vehicles, arr);
      this.addNotif(`Veículo cadastrado: ${v.brand} ${v.model}`, 'Estoque atualizado');
      return v;
    },
    updateVehicle(id, d) {
      const arr = load(KEYS.vehicles, []);
      const i = arr.findIndex(v => String(v.id) === String(id));
      if (i < 0) return null;
      arr[i] = { ...arr[i], ...d, updatedAt: new Date().toISOString() };
      save(KEYS.vehicles, arr);
      return arr[i];
    },
    deleteVehicle(id) {
      const arr = load(KEYS.vehicles,[]).filter(v => String(v.id) !== String(id));
      save(KEYS.vehicles, arr);
    },

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
      arr.unshift(c);
      save(KEYS.customers, arr);
      this.addNotif(`Novo cliente: ${c.name}`, 'CRM atualizado');
      return c;
    },
    updateCustomer(id, d) {
      const arr = load(KEYS.customers, []);
      const i = arr.findIndex(c => String(c.id) === String(id));
      if (i < 0) return null;
      arr[i] = { ...arr[i], ...d, lastContact: 'Agora', updatedAt: new Date().toISOString() };
      save(KEYS.customers, arr);
      return arr[i];
    },
    deleteCustomer(id) {
      const arr = load(KEYS.customers,[]).filter(c => String(c.id) !== String(id));
      save(KEYS.customers, arr);
    },

    // ─ Notifications ─
    notifications()   { return load(KEYS.notifs, []); },
    unreadCount()     { return load(KEYS.notifs,[]).filter(n => !n.read).length; },
    addNotif(title, desc) {
      const arr = load(KEYS.notifs, []);
      arr.unshift({ id: Date.now(), title, desc, time: 'Agora', read: false });
      if (arr.length > 50) arr.pop();
      save(KEYS.notifs, arr);
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
        stockTurnover: '22 dias',
        lotVehicles:   s.total,
        newLeads:      cl.filter(c => c.status === 'new-lead').length,
        testDrives:    cl.filter(c => c.status === 'test-drive').length,
        negotiations:  cl.filter(c => c.status === 'negotiation').length,
        monthlyClosed: cl.filter(c => c.status === 'closed').length,
      };
    },
    weekly() {
      return [{d:'SEG',t:60,a:40},{d:'TER',t:80,a:70},{d:'QUA',t:45,a:25},
              {d:'QUI',t:95,a:85},{d:'SEX',t:75,a:55},{d:'SAB',t:100,a:90},{d:'DOM',t:30,a:15}];
    },
    aiInsights() {
      return [
        {cat:'ESTOQUE', text:'Alta demanda por SUVs híbridos detectada. Considere aumentar estoque de modelos Volvo ou Toyota.'},
        {cat:'CRM',     text:'3 leads de alto valor estão sem contato há mais de 48h. Priorize o follow-up da BMW M3.'},
        {cat:'FINANCEIRO', text:'Projeção de caixa aponta possibilidade de reinvestimento em vitrine digital no próximo trimestre.'},
      ];
    },
    transactions() {
      const sold = load(KEYS.vehicles,[]).filter(v => v.status === 'sold').slice(0,5);
      return sold.map(v => ({
        vehicle: `${v.brand} ${v.model}`,
        client:  '—',
        status:  'completed',
        value:   v.price,
      }));
    },
  };
})();

/* ── Formatter global ── */
const Fmt = {
  money:      v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
  moneyShort: v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
  km:         v => Number(v).toLocaleString('pt-BR') + ' km',
  initials:   n => (n || '??').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(),
  date:       d => new Date(d).toLocaleDateString('pt-BR'),
};
