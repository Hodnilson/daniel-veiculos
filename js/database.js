/* ═══ DATABASE — Daniel Veículos ═══
 * Persistência real via localStorage com fallback para dados de demonstração
 * Todas operações CRUD são persistidas imediatamente
 */
'use strict';

const DB = (() => {
  const KEYS = {
    vehicles:  'dv_vehicles',
    customers: 'dv_customers',
    finance:   'dv_finance',
    notifs:    'dv_notifs',
  };

  /* ── Seed Data ── */
  const SEED = {
    vehicles: [
      {id:1,brand:'Porsche',model:'911 Carrera',year:2024,price:840000,km:12000,status:'available',color:'Branco Carrara',fuel:'Gasolina',trans:'PDK',plate:'ABC-1D23'},
      {id:2,brand:'BMW',model:'M4 Competition',year:2025,price:650000,km:5200,status:'available',color:'Azul San Marino',fuel:'Gasolina',trans:'Automático',plate:'DEF-4G56'},
      {id:3,brand:'Mercedes-Benz',model:'G63 AMG',year:2025,price:1350000,km:800,status:'reserved',color:'Preto Obsidian',fuel:'Gasolina',trans:'Automático',plate:'GHI-7J89'},
      {id:4,brand:'Audi',model:'RS6 Avant',year:2024,price:610000,km:8600,status:'sold',color:'Cinza Nardo',fuel:'Gasolina',trans:'Automático',plate:'JKL-0M12'},
      {id:5,brand:'Range Rover',model:'Sport HSE',year:2024,price:425000,km:15000,status:'proposal',color:'Verde British',fuel:'Diesel',trans:'Automático',plate:'MNO-3P45'},
      {id:6,brand:'BMW',model:'X5 M50i',year:2025,price:760000,km:3200,status:'available',color:'Preto Safira',fuel:'Gasolina',trans:'Automático',plate:'PQR-6S78'},
      {id:7,brand:'Ferrari',model:'F8 Tributo',year:2022,price:2850000,km:2500,status:'vitrine',color:'Vermelho Corsa',fuel:'Gasolina',trans:'F1 DCT',plate:'STU-9V01',destaque:true},
      {id:8,brand:'Volvo',model:'XC90 T8',year:2024,price:520000,km:18500,status:'available',color:'Prata Cristal',fuel:'Híbrido',trans:'Automático',plate:'VWX-2Y34'},
      {id:9,brand:'Porsche',model:'911 GT3 RS',year:2025,price:1950000,km:1200,status:'reserved',color:'Branco',fuel:'Gasolina',trans:'PDK',plate:'YZA-5B67'},
      {id:10,brand:'BMW',model:'M5 Individual',year:2025,price:980000,km:4800,status:'available',color:'Preto Safira',fuel:'Gasolina',trans:'Automático',plate:'BCD-8E90'},
      {id:11,brand:'Porsche',model:'Macan S',year:2022,price:512400,km:9700,status:'sold',color:'Cinza Vulcano',fuel:'Gasolina',trans:'PDK',plate:'EFG-1H23'},
      {id:12,brand:'BMW',model:'320i M-Sport',year:2023,price:285000,km:22000,status:'sold',color:'Azul Mineral',fuel:'Gasolina',trans:'Automático',plate:'HIJ-4K56'},
    ],
    customers: [
      {id:1,name:'Ricardo Mendonça',email:'ricardo@email.com',phone:'(11) 99999-1111',cpf:'123.456.789-00',city:'São Paulo, SP',interest:'Porsche 911 GT3 RS',status:'negotiation',lastContact:'Hoje, 10:45',via:'WhatsApp'},
      {id:2,name:'Ana Silva',email:'ana.silva@email.com',phone:'(41) 98888-2222',cpf:'987.654.321-11',city:'Curitiba, PR',interest:'Mercedes-AMG G 63',status:'test-drive',lastContact:'Ontem, 16:20',via:'Visita Presencial'},
      {id:3,name:'Lucas Costa',email:'lucas.c@email.com',phone:'(21) 97777-3333',cpf:'456.789.123-22',city:'Rio de Janeiro, RJ',interest:'BMW M5 Individual',status:'new-lead',lastContact:'2 dias atrás',via:'Site Institucional'},
      {id:4,name:'Roberto Silva',email:'roberto@email.com',phone:'(31) 96666-4444',cpf:'321.654.987-33',city:'Belo Horizonte, MG',interest:'Porsche 911 Carrera',status:'closed',lastContact:'3 dias atrás',via:'Telefone'},
      {id:5,name:'Ana Paula M.',email:'anapaula@email.com',phone:'(19) 95555-5555',cpf:'654.321.987-44',city:'Campinas, SP',interest:'Range Rover Sport',status:'proposal',lastContact:'Ontem, 14:00',via:'E-mail'},
      {id:6,name:'Marcos G. Torres',email:'marcos.t@email.com',phone:'(61) 94444-6666',cpf:'789.123.456-55',city:'Brasília, DF',interest:'Audi RS6 Avant',status:'closed',lastContact:'Semana passada',via:'WhatsApp'},
    ],
    notifs: [
      {id:1,title:'Nova reserva registrada',desc:'Porsche 911 GT3 RS — Ricardo Mendonça',time:'2h atrás',read:false},
      {id:2,title:'Test-drive agendado',desc:'Mercedes-AMG G 63 — Ana Silva',time:'5h atrás',read:false},
      {id:3,title:'Novo lead capturado',desc:'BMW M5 Individual — Lucas Costa',time:'1d atrás',read:false},
    ],
  };

  /* ── Storage Helpers ── */
  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }

  function save(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); }
    catch(e) { console.error('Storage error:', e); }
  }

  /* ── Initialize seed if first run ── */
  function initSeed() {
    if (!localStorage.getItem(KEYS.vehicles)) save(KEYS.vehicles, SEED.vehicles);
    if (!localStorage.getItem(KEYS.customers)) save(KEYS.customers, SEED.customers);
    if (!localStorage.getItem(KEYS.notifs))   save(KEYS.notifs, SEED.notifs);
  }

  /* ── ID Generator ── */
  function nextId(arr) {
    return arr.length > 0 ? Math.max(...arr.map(i => i.id)) + 1 : 1;
  }

  /* ── Finance (static + calculated) ── */
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
        {client:'Auto Prime Peças',desc:'Reembolso Garantia',   due:'10 Out 2023', value:15200,  status:'Recebido'},
      ],
      payables: [
        {sup:'Tech Insurance S/A', desc:'Seguro Frota Mensal', due:'22 Out 2023', value:8450,  status:'Pendente'},
        {sup:'Energia Solar SP',   desc:'Manutenção Mensal',   due:'25 Out 2023', value:1200,  status:'Agendado'},
        {sup:'Marketing High-End', desc:'Ads Outubro',         due:'28 Out 2023', value:15000, status:'Agendado'},
      ],
      bars:[{m:'AGO',p:65},{m:'SET',p:78},{m:'OUT',p:92,cur:true},{m:'NOV',p:45,proj:true},{m:'DEZ',p:30,proj:true}],
    };
  }

  /* ── Public API ── */
  return {
    init() { initSeed(); },

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
      const v = { id: nextId(arr), ...d, createdAt: new Date().toISOString() };
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
      save(KEYS.vehicles, load(KEYS.vehicles,[]).filter(v => String(v.id) !== String(id)));
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
      const c = { id: nextId(arr), ...d, lastContact: 'Agora', createdAt: new Date().toISOString() };
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
      save(KEYS.customers, load(KEYS.customers,[]).filter(c => String(c.id) !== String(id)));
    },

    // ─ Notifications ─
    notifications()   { return load(KEYS.notifs, []); },
    unreadCount()     { return load(KEYS.notifs,[]).filter(n => !n.read).length; },
    addNotif(title, desc) {
      const arr = load(KEYS.notifs, []);
      arr.unshift({ id: Date.now(), title, desc, time: 'Agora', read: false });
      if (arr.length > 50) arr.pop(); // máx 50
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

    // ─ Reset para seed (dev) ─
    resetToSeed() {
      Object.values(KEYS).forEach(k => localStorage.removeItem(k));
      initSeed();
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
