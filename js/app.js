'use strict';
const App = {
  page: null,
  session: null,
  navItems: [
    {id:'dashboard',icon:'dashboard',label:'Dashboard'},
    {id:'estoque',icon:'directions_car',label:'Estoque'},
    {id:'financeiro',icon:'payments',label:'Financeiro'},
    {id:'crm',icon:'group',label:'CRM'},
    {id:'relatorios',icon:'analytics',label:'Relatórios'},
    {id:'vitrine',icon:'auto_awesome',label:'Vitrine'},
  ],
  titles: {dashboard:'Visão Geral',estoque:'Estoque Premium',financeiro:'Gestão Financeira',crm:'CRM Premium',relatorios:'Relatórios Analíticos',vitrine:'Vitrine de Luxo'},
  fabCfg: {estoque:{icon:'add',label:'Novo Veículo'},crm:{icon:'person_add',label:'Novo Cliente'}},

  async init() {
    await Auth.init();
    DB.init();

    // Loading screen
    const loader = document.getElementById('loading-screen');
    setTimeout(() => { loader.style.opacity='0'; setTimeout(() => loader.remove(), 500); }, 1800);

    // Password toggle on login
    document.getElementById('toggle-pass').addEventListener('click', () => {
      const inp = document.getElementById('login-pass');
      const ic  = document.getElementById('toggle-pass');
      inp.type = inp.type === 'password' ? 'text' : 'password';
      ic.textContent = inp.type === 'password' ? 'visibility' : 'visibility_off';
    });

    // Login form
    document.getElementById('login-form').addEventListener('submit', async e => {
      e.preventDefault();
      await this._doLogin(
        document.getElementById('login-email').value,
        document.getElementById('login-pass').value
      );
    });

    // Register toggle
    document.getElementById('show-register').addEventListener('click', () => this._showPanel('register'));
    document.getElementById('show-login').addEventListener('click',    () => this._showPanel('login'));

    // Register form
    document.getElementById('register-form').addEventListener('submit', async e => {
      e.preventDefault();
      await this._doRegister();
    });

    // Check existing session
    this.session = Auth.getSession();
    if (this.session) this._enterApp();
  },

  /* ── Auth Panels ── */
  _showPanel(which) {
    document.getElementById('panel-login').classList.toggle('hidden', which !== 'login');
    document.getElementById('panel-register').classList.toggle('hidden', which !== 'register');
  },

  async _doLogin(email, pass) {
    const btn = document.getElementById('btn-login');
    btn.disabled = true; btn.textContent = 'Entrando...';
    try {
      this.session = await Auth.login(email, pass);
      this._enterApp();
    } catch(err) {
      this.toast(err.message, 'err');
    } finally {
      btn.disabled = false; btn.textContent = 'Entrar no Sistema';
    }
  },

  async _doRegister() {
    const btn   = document.getElementById('btn-register');
    const name  = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass  = document.getElementById('reg-pass').value;
    const pass2 = document.getElementById('reg-pass2').value;
    const photo = document.getElementById('reg-photo-value')?.value || '';
    if (pass !== pass2) { this.toast('As senhas não coincidem.', 'err'); return; }
    btn.disabled = true; btn.textContent = 'Criando conta...';
    try {
      await Auth.register({ name, email, password: pass, photo });
      this.toast('Conta criada! Faça o login.');
      this._showPanel('login');
      document.getElementById('login-email').value = email;
    } catch(err) {
      this.toast(err.message, 'err');
    } finally {
      btn.disabled = false; btn.textContent = 'Criar Conta';
    }
  },

  /* ── App Shell ── */
  _enterApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-shell').style.display    = 'flex';
    document.getElementById('bottom-nav').style.display   = '';

    // Fill user info
    const s = this.session;
    document.getElementById('user-name').textContent   = s.name;
    // Avatar: foto ou iniciais
    const avatarEl = document.getElementById('user-avatar');
    if (s.photo) {
      avatarEl.textContent = '';
      avatarEl.style.backgroundImage   = `url(${s.photo})`;
      avatarEl.style.backgroundSize    = 'cover';
      avatarEl.style.backgroundPosition = 'center';
    } else {
      avatarEl.textContent = s.avatar;
    }


    // Build nav menus
    this._buildNav();

    // Sidebar toggle
    const sb = document.getElementById('sidebar');
    const bd = document.getElementById('sidebar-backdrop');
    document.getElementById('sidebar-toggle').addEventListener('click', () => {
      sb.classList.toggle('-translate-x-full'); bd.hidden = sb.classList.contains('-translate-x-full');
    });
    bd.addEventListener('click', () => { sb.classList.add('-translate-x-full'); bd.hidden = true; });

    // Header buttons
    document.getElementById('btn-notif').addEventListener('click',  () => this._showNotifs());
    document.getElementById('btn-users').addEventListener('click',  () => this._showUsers());
    document.getElementById('btn-logout').addEventListener('click', () => { Auth.logout(); location.reload(); });
    document.getElementById('btn-novo').addEventListener('click', () => {
      if (this.page === 'crm') this.addCustomer(); else this.addVehicle();
    });

    // FAB
    document.getElementById('fab-btn').addEventListener('click', () => {
      if (this.page === 'crm') this.addCustomer(); else this.addVehicle();
    });

    // Search
    document.getElementById('global-search').addEventListener('input', e => this._globalSearch(e.target.value));

    // Keyboard
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey||e.metaKey) && e.key==='k') { e.preventDefault(); document.getElementById('global-search').focus(); }
      if (e.key === 'Escape') this.closeModal();
    });

    // Notification badge
    this._updateNotifBadge();

    // Initialize site sync watcher
    SiteSync.init();

    // Router
    window.addEventListener('hashchange', () => this.route());
    window.addEventListener('db-updated', () => {
      // Refresh current page without full reload if on a data-heavy page
      if (['dashboard', 'estoque', 'crm', 'financeiro', 'relatorios'].includes(this.page)) {
        const el = document.getElementById('page-content');
        const fn = Pages[this.page];
        if (fn) el.innerHTML = fn();
        this._updateNotifBadge();
      }
    });

    if (!location.hash || location.hash === '#/') location.hash = '#/dashboard';
    else this.route();
  },

  _buildNav() {
    document.getElementById('nav-menu').innerHTML = this.navItems.map(n =>
      `<a class="nav-link flex items-center gap-md px-lg py-sm rounded-lg transition-all cursor-pointer text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high" data-page="${n.id}" href="#/${n.id}">
        <span class="material-symbols-outlined">${n.icon}</span>
        <span class="text-sm font-bold">${n.label}</span>
      </a>`
    ).join('');
    document.getElementById('bottom-nav').innerHTML = this.navItems.slice(0,5).map(n =>
      `<a class="bnav flex flex-col items-center gap-xs py-xs text-on-surface-variant" data-page="${n.id}" href="#/${n.id}">
        <span class="material-symbols-outlined text-[22px]">${n.icon}</span>
        <span class="text-[9px] font-bold">${n.label}</span>
      </a>`
    ).join('');
  },

  route() {
    const hash = location.hash.replace('#/','') || 'dashboard';
    if (hash === this.page) return;
    this.page = hash;
    document.getElementById('page-title').textContent = this.titles[hash] || hash;

    // Nav highlight
    document.querySelectorAll('.nav-link').forEach(n => {
      const a = n.dataset.page === hash;
      n.className = `nav-link flex items-center gap-md px-lg py-sm rounded-lg transition-all cursor-pointer ${a ? 'text-primary-container bg-primary-container/10 border-l-4 border-primary-container font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`;
      const ic = n.querySelector('.material-symbols-outlined');
      if (ic) ic.style.fontVariationSettings = a ? "'FILL' 1" : "'FILL' 0";
    });
    document.querySelectorAll('.bnav').forEach(n => {
      const a = n.dataset.page === hash;
      n.className = `bnav flex flex-col items-center gap-xs py-xs ${a ? 'text-primary-container' : 'text-on-surface-variant'}`;
      const ic = n.querySelector('.material-symbols-outlined');
      if (ic) ic.style.fontVariationSettings = a ? "'FILL' 1" : "'FILL' 0";
    });

    // Close sidebar on mobile
    document.getElementById('sidebar').classList.add('-translate-x-full');
    document.getElementById('sidebar-backdrop').hidden = true;

    // FAB
    const fab = document.getElementById('fab-btn');
    const cfg = this.fabCfg[hash];
    if (cfg) {
      fab.style.display = 'flex';
      document.getElementById('fab-icon').textContent  = cfg.icon;
      document.getElementById('fab-label').textContent = cfg.label;
    } else {
      fab.style.display = 'none';
    }

    // Render page
    const el = document.getElementById('page-content');
    const fn = Pages[hash];
    el.style.opacity = '0';
    requestAnimationFrame(() => {
      el.innerHTML = fn ? fn() : '<div class="flex h-full items-center justify-center"><p class="text-on-surface-variant text-h3">Página não encontrada</p></div>';
      el.scrollTop = 0;
      el.style.transition = 'opacity .2s';
      el.style.opacity = '1';
    });
  },

  /* ── Notifications ── */
  _updateNotifBadge() {
    const dot  = document.getElementById('notif-dot');
    const count = DB.unreadCount();
    dot.style.display = count > 0 ? '' : 'none';
  },
  _showNotifs() {
    const n = DB.notifications();
    this.openModal('Notificações',
      n.length ? n.map(x => UI.notifItem(x)).join('') : '<p class="text-center py-lg text-on-surface-variant">Sem notificações</p>',
      `<button class="btn btn-ghost" onclick="App.closeModal()">Fechar</button>
       <button class="btn btn-primary" onclick="DB.markAllRead();DB.clearNotifs();App._updateNotifBadge();App.closeModal();App.toast('Notificações limpas')">Limpar Tudo</button>`
    );
  },

  /* ── Users Panel ── */
  _showUsers() {
    const users = Auth.listUsers();
    const rows = users.map(u => `<div class="flex items-center gap-md p-md hover:bg-white/5 rounded-lg">
      <div class="w-9 h-9 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container font-bold text-sm">${u.avatar}</div>
      <div class="flex-1"><p class="font-bold text-on-surface text-sm">${u.name}</p><p class="text-xs text-on-surface-variant">${u.email}</p></div>
      <span class="text-[10px] font-label-caps ${u.role==='admin'?'text-primary-container':'text-on-surface-variant'}">${u.role.toUpperCase()}</span>
      ${u.email !== this.session?.email ? `<button class="btn btn-danger btn-sm" onclick="if(confirm('Excluir usuário?')){Auth.deleteUser('${u.id}');App._showUsers();}">✕</button>` : ''}
    </div>`).join('');
    this.openModal('Usuários do Sistema',
      `<div class="space-y-xs">${rows}</div>`,
      `<button class="btn btn-ghost" onclick="App.closeModal()">Fechar</button>
       <button class="btn btn-primary" onclick="App.closeModal();App._showPanel&&null;document.getElementById('login-screen').style.display='flex';document.getElementById('panel-register').classList.remove('hidden');document.getElementById('panel-login').classList.add('hidden');document.getElementById('app-shell').style.display='none'">Novo Usuário</button>`
    );
  },

  /* ── Global Search ── */
  _globalSearch(q) {
    if (!q) return;
    if (this.page === 'estoque') {
      document.getElementById('f-search').value = q; this.filterVehicles();
    } else if (this.page === 'crm') {
      document.getElementById('c-search').value = q; this.filterCustomers();
    } else {
      location.hash = '#/estoque';
      setTimeout(() => { const el = document.getElementById('f-search'); if(el){el.value=q;this.filterVehicles();} }, 300);
    }
  },

  /* ── Vehicle CRUD ── */
  filterVehicles() {
    const f = {
      search: document.getElementById('f-search')?.value || '',
      brand:  document.getElementById('f-brand')?.value  || '',
      status: document.getElementById('f-status')?.value || '',
    };
    const v = DB.vehicles(f);
    document.getElementById('v-grid').innerHTML = v.length
      ? v.map(x => UI.vehicleCard(x)).join('')
      : '<div class="col-span-full text-center py-xl text-on-surface-variant">Nenhum veículo encontrado com estes filtros.</div>';
  },

  addVehicle() {
    this.openModal('Novo Veículo', UI.vehicleForm(),
      `<button class="btn btn-ghost" onclick="App.closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="document.getElementById('v-form').requestSubmit()"><span class="material-symbols-outlined text-[16px]">save</span>Cadastrar</button>`);
  },

  editVehicle(id) {
    const v = DB.vehicle(id); if (!v) return;
    this.openModal('Editar Veículo', UI.vehicleForm(v),
      `<button class="btn btn-ghost" onclick="App.closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="document.getElementById('v-form').requestSubmit()"><span class="material-symbols-outlined text-[16px]">save</span>Salvar</button>`);
  },

  viewVehicle(id) {
    const v = DB.vehicle(id); if (!v) return;
    this.openModal(`${v.brand} ${v.model}`, UI.vehicleDetail(v),
      `<button class="btn btn-ghost" onclick="App.closeModal()">Fechar</button>
       <button class="btn btn-primary" onclick="App.closeModal();setTimeout(()=>App.editVehicle('${id}'),200)">Editar</button>`);
  },

  printFichaVehicle(id) {
    const v = DB.vehicle(id); if (!v) return;
    this.toast('Gerando Ficha...', '');
    const div = document.createElement('div');
    div.style.padding = '40px';
    div.style.background = '#0a0a0a';
    div.style.color = '#fff';
    div.style.fontFamily = 'Manrope, sans-serif';
    div.innerHTML = `
      <h1 style="font-size:32px;color:#39FF14;text-align:center;margin-bottom:10px;font-weight:800">DANIEL VEÍCULOS</h1>
      <p style="text-align:center;color:#baccb0;margin-bottom:30px;letter-spacing:2px">FICHA TÉCNICA OFICIAL</p>
      ${v.photo ? `<img src="${v.photo}" style="width:100%;height:350px;object-fit:cover;border-radius:16px;margin-bottom:30px">` : ''}
      <h2 style="font-size:42px;text-align:center;margin-bottom:10px">${v.brand} ${v.model}</h2>
      <p style="text-align:center;color:#baccb0;font-size:20px;margin-bottom:30px">${v.year} · ${v.color}</p>
      <div style="background:rgba(255,255,255,0.05);padding:24px;border-radius:16px;margin-bottom:30px">
        <h3 style="color:#39FF14;font-size:36px;text-align:center;margin:0">${Fmt.money(v.price)}</h3>
      </div>
      <table style="width:100%;text-align:left;font-size:18px;border-collapse:collapse">
        <tr style="border-bottom:1px solid rgba(255,255,255,0.1)"><td style="padding:15px;color:#baccb0">Quilometragem</td><td style="padding:15px;font-weight:bold">${Fmt.km(v.km)}</td></tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.1)"><td style="padding:15px;color:#baccb0">Combustível</td><td style="padding:15px;font-weight:bold">${v.fuel||'-'}</td></tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.1)"><td style="padding:15px;color:#baccb0">Transmissão</td><td style="padding:15px;font-weight:bold">${v.trans||'-'}</td></tr>
        <tr><td style="padding:15px;color:#baccb0">Placa</td><td style="padding:15px;font-weight:bold">${v.plate||'-'}</td></tr>
      </table>
      <div style="margin-top:50px;text-align:center;padding-top:20px;border-top:1px solid rgba(255,255,255,0.1)">
        <p style="font-size:14px;color:#baccb0">DANIEL VEÍCULOS - GESTÃO PREMIUM</p>
      </div>
    `;
    const opt = {
      margin:       0,
      filename:     `Ficha_${v.model.replace(/\s/g,'_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(div).save().then(() => {
      this.toast('Ficha gerada com sucesso!');
    });
  },

  saveVehicle(e) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    d.year = +d.year; d.price = +d.price; d.km = +d.km;
    if (d.id) { DB.updateVehicle(d.id, d); this.toast('Veículo atualizado!'); }
    else { delete d.id; DB.addVehicle(d); this.toast('Veículo cadastrado!'); }
    this.closeModal();
    this._updateNotifBadge();
    this.page = null; this.route();
  },

  confirmDeleteVehicle(id) {
    const v = DB.vehicle(id); if (!v) return;
    this.openModal('Excluir Veículo',
      `<p class="text-on-surface">Confirma exclusão de <strong>${v.brand} ${v.model}</strong>?<br><span class="text-on-surface-variant text-sm">Esta ação não pode ser desfeita.</span></p>`,
      `<button class="btn btn-ghost" onclick="App.closeModal()">Cancelar</button>
       <button class="btn btn-danger" onclick="DB.deleteVehicle(${id});App.closeModal();App.page=null;App.route();App.toast('Veículo excluído')">Excluir</button>`);
  },

  /* ── Customer CRUD ── */
  async fetchCep(cep) {
    cep = cep.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          const cityEl = document.getElementById('c-city');
          if (cityEl) cityEl.value = `${data.localidade} - ${data.uf}`;
          this.toast('Endereço encontrado!');
        }
      } catch (e) { console.error('ViaCEP erro:', e); }
    }
  },

  filterCustomers() {
    const f = {
      search: document.getElementById('c-search')?.value || '',
      status: document.getElementById('c-status')?.value || '',
    };
    const cl = DB.customers(f);
    const tbody = document.getElementById('crm-body');
    if (tbody) tbody.innerHTML = cl.length
      ? cl.map(c => UI.crmRow(c)).join('')
      : '<tr><td colspan="6" class="text-center py-xl text-on-surface-variant">Nenhum cliente encontrado.</td></tr>';
    const cnt = document.getElementById('crm-count');
    if (cnt) cnt.textContent = `${cl.length} cliente(s)`;
  },

  addCustomer() {
    this.openModal('Novo Cliente', UI.customerForm(),
      `<button class="btn btn-ghost" onclick="App.closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="document.getElementById('c-form').requestSubmit()"><span class="material-symbols-outlined text-[16px]">save</span>Cadastrar</button>`);
  },

  editCustomer(id) {
    const c = DB.customer(id); if (!c) return;
    this.openModal('Editar Cliente', UI.customerForm(c),
      `<button class="btn btn-ghost" onclick="App.closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="document.getElementById('c-form').requestSubmit()"><span class="material-symbols-outlined text-[16px]">save</span>Salvar</button>`);
  },

  viewCustomer(id) {
    const c = DB.customer(id); if (!c) return;
    this.openModal(c.name, UI.customerDetail(c),
      `<button class="btn btn-ghost" onclick="App.closeModal()">Fechar</button>
       <button class="btn btn-primary" onclick="App.closeModal();setTimeout(()=>App.editCustomer('${id}'),200)">Editar</button>`);
  },

  saveCustomer(e) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    if (d.id) { DB.updateCustomer(d.id, d); this.toast('Cliente atualizado!'); }
    else { delete d.id; DB.addCustomer(d); this.toast('Cliente cadastrado!'); }
    this.closeModal();
    this._updateNotifBadge();
    this.page = null; this.route();
  },

  confirmDeleteCustomer(id) {
    const c = DB.customer(id); if (!c) return;
    this.openModal('Excluir Cliente',
      `<p class="text-on-surface">Confirma exclusão de <strong>${c.name}</strong>?<br><span class="text-on-surface-variant text-sm">Esta ação não pode ser desfeita.</span></p>`,
      `<button class="btn btn-ghost" onclick="App.closeModal()">Cancelar</button>
       <button class="btn btn-danger" onclick="DB.deleteCustomer(${id});App.closeModal();App.page=null;App.route();App.toast('Cliente excluído')">Excluir</button>`);
  },

  /* ── Transactions CRUD ── */
  addTransaction() {
    this.openModal('Nova Transação', UI.transactionForm(),
      `<button class="btn btn-ghost" onclick="App.closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="document.getElementById('t-form').requestSubmit()"><span class="material-symbols-outlined text-[16px]">save</span>Salvar</button>`);
  },
  editTransaction(id) {
    const t = DB.transaction(id); if (!t) return;
    this.openModal('Editar Transação', UI.transactionForm(t),
      `<div class="flex-1"><button class="btn btn-danger" onclick="App.deleteTransaction(${id})"><span class="material-symbols-outlined text-[16px]">delete</span>Excluir</button></div>
       <button class="btn btn-ghost" onclick="App.closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="document.getElementById('t-form').requestSubmit()"><span class="material-symbols-outlined text-[16px]">save</span>Salvar</button>`);
  },
  saveTransaction(e) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    d.value = +d.value;
    if (d.id) { DB.updateTransaction(d.id, d); this.toast('Transação atualizada!'); }
    else { delete d.id; DB.addTransaction(d); this.toast('Transação salva!'); }
    this.closeModal(); this.page = null; this.route();
  },
  deleteTransaction(id) {
    if (confirm('Excluir esta transação?')) {
      DB.deleteTransaction(id); this.closeModal(); this.page = null; this.route(); this.toast('Excluída');
    }
  },

  /* ── Payables CRUD ── */
  addPayable() {
    this.openModal('Nova Conta a Pagar', UI.payableForm(),
      `<button class="btn btn-ghost" onclick="App.closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="document.getElementById('p-form').requestSubmit()"><span class="material-symbols-outlined text-[16px]">save</span>Salvar</button>`);
  },
  editPayable(id) {
    const p = DB.payable(id); if (!p) return;
    this.openModal('Editar Conta', UI.payableForm(p),
      `<div class="flex-1"><button class="btn btn-danger" onclick="App.deletePayable(${id})"><span class="material-symbols-outlined text-[16px]">delete</span>Excluir</button></div>
       <button class="btn btn-ghost" onclick="App.closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="document.getElementById('p-form').requestSubmit()"><span class="material-symbols-outlined text-[16px]">save</span>Salvar</button>`);
  },
  savePayable(e) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    d.value = +d.value;
    if (d.id) { DB.updatePayable(d.id, d); this.toast('Conta atualizada!'); }
    else { delete d.id; DB.addPayable(d); this.toast('Conta salva!'); }
    this.closeModal(); this.page = null; this.route();
  },
  deletePayable(id) {
    if (confirm('Excluir esta conta?')) {
      DB.deletePayable(id); this.closeModal(); this.page = null; this.route(); this.toast('Excluída');
    }
  },

  /* ── PDF Report ── */
  generatePdfReport() {
    this.toast('Gerando PDF...', '');
    const element = document.getElementById('finance-report-area');
    const opt = {
      margin:       10,
      filename:     'relatorio_financeiro.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save().then(() => {
      this.toast('PDF baixado com sucesso!');
    });
  },

  /* ── CRM Funnel Click — show customers by status ── */
  showCrmByStatus(status) {
    const stLabels = {'new-lead':'Novos Leads','test-drive':'Test-Drives','negotiation':'Em Negociação','proposal':'Propostas','closed':'Fechados do Mês'};
    const customers = DB.customers({status});
    const panel = document.getElementById('crm-detail-panel');
    if (!panel) return;
    const title = stLabels[status] || status;
    panel.innerHTML = UI.detailList(title, customers, c => {
      const ini = Fmt.initials(c.name);
      return `<div class="flex items-center gap-md px-lg py-md hover:bg-white/5 transition-colors cursor-pointer" onclick="App.viewCustomer(${c.id})">
        <div class="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container font-bold text-sm shrink-0">${ini}</div>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-on-surface text-sm truncate">${c.name}</p>
          <p class="text-xs text-on-surface-variant">${c.interest || '—'} · ${c.city || '—'}</p>
        </div>
        <div class="text-right shrink-0">
          <p class="text-xs font-data-mono text-on-surface-variant">${c.lastContact || '—'}</p>
          <p class="text-[10px] text-on-surface-variant">${c.via || ''}</p>
        </div>
        <span class="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
      </div>`;
    }, 'Nenhum cliente neste status.');
    panel.scrollIntoView({behavior:'smooth', block:'start'});

    // Also filter the main table
    const sel = document.getElementById('c-status');
    if (sel) { sel.value = status; this.filterCustomers(); }
  },

  /* ── Stock Status Click — show vehicles by status (Reports page) ── */
  showStockByStatus(status) {
    const stLabels = {'available':'Disponíveis','reserved':'Reservados','sold':'Vendidos','vitrine':'Vitrine','':'Todos os Veículos'};
    const filter = status ? {status} : {};
    const vehicles = DB.vehicles(filter);
    const panel = document.getElementById('stock-detail-panel');
    if (!panel) return;
    const title = stLabels[status] || 'Veículos';
    panel.innerHTML = UI.detailList(title, vehicles, v => {
      const stMap = {available:'Disponível',reserved:'Reservado',sold:'Vendido',proposal:'Proposta',vitrine:'Vitrine'};
      return `<div class="flex items-center gap-md px-lg py-md hover:bg-white/5 transition-colors cursor-pointer" onclick="App.viewVehicle(${v.id})">
        <div class="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-on-surface-variant text-[20px]" style="font-variation-settings:'FILL' 1">directions_car</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-on-surface text-sm truncate">${v.brand} ${v.model}</p>
          <p class="text-xs text-on-surface-variant">${v.year} · ${v.color} · ${Fmt.km(v.km)}</p>
        </div>
        <div class="text-right shrink-0">
          <p class="font-bold text-primary-container text-sm">${Fmt.moneyShort(v.price)}</p>
          <p class="text-[10px] text-on-surface-variant">${stMap[v.status] || v.status}</p>
        </div>
        <span class="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
      </div>`;
    }, 'Nenhum veículo encontrado.');
    panel.scrollIntoView({behavior:'smooth', block:'start'});
  },

  /* ── Estoque Status Click — filter vehicles in estoque page ── */
  showVehiclesByStatus(status) {
    const sel = document.getElementById('f-status');
    if (sel) { sel.value = status; this.filterVehicles(); }
  },

  /* ── Modal ── */
  openModal(t, b, f) {
    const ov = document.getElementById('modal-overlay');
    document.getElementById('modal-container').innerHTML = UI.modal(t, b, f);
    ov.hidden = false;
    requestAnimationFrame(() => ov.classList.add('show'));
    ov.onclick = e => { if (e.target === ov) this.closeModal(); };
  },
  closeModal() {
    const ov = document.getElementById('modal-overlay');
    ov.classList.remove('show');
    setTimeout(() => { ov.hidden = true; }, 200);
  },

  /* ── Toast ── */
  toast(msg, type = '') {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast' + (type === 'err' ? ' err' : '');
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 3200);
  },
};

/* ═══ SITE SYNC MODULE ═══
 * Monitora veículos recém-adicionados e removidos para sincronizar com o site público.
 * O site público ainda não foi criado, mas este módulo prepara o caminho:
 * - Mantém um log de alterações (changelog) no localStorage
 * - Dispara eventos customizados que o site pode escutar
 * - Fornece API para o site consultar novidades
 */
const SiteSync = {
  CHANGELOG_KEY: 'dv_site_changelog',
  MAX_ENTRIES: 100,

  init() {
    // Intercepta operações do DB para registrar mudanças
    const origAdd = DB.addVehicle.bind(DB);
    const origDel = DB.deleteVehicle.bind(DB);
    const origUpd = DB.updateVehicle.bind(DB);

    DB.addVehicle = (d) => {
      const v = origAdd(d);
      this.logChange('added', v);
      return v;
    };

    DB.deleteVehicle = (id) => {
      const v = DB.vehicle(id);
      origDel(id);
      if (v) this.logChange('removed', v);
    };

    DB.updateVehicle = (id, d) => {
      const v = origUpd(id, d);
      if (v) this.logChange('updated', v);
      return v;
    };
  },

  logChange(action, vehicle) {
    const log = this.getChangelog();
    log.unshift({
      action,
      vehicleId: vehicle.id,
      brand: vehicle.brand,
      model: vehicle.model,
      price: vehicle.price,
      status: vehicle.status,
      timestamp: new Date().toISOString(),
    });
    if (log.length > this.MAX_ENTRIES) log.length = this.MAX_ENTRIES;
    localStorage.setItem(this.CHANGELOG_KEY, JSON.stringify(log));

    // Dispara evento customizado para possível integração com site
    window.dispatchEvent(new CustomEvent('dv-vehicle-change', {
      detail: { action, vehicle }
    }));
  },

  getChangelog() {
    try { return JSON.parse(localStorage.getItem(this.CHANGELOG_KEY)) || []; }
    catch { return []; }
  },

  // API para o site público consumir
  getRecentlyAdded(limit = 10) {
    return this.getChangelog().filter(e => e.action === 'added').slice(0, limit);
  },

  getRecentlyRemoved(limit = 10) {
    return this.getChangelog().filter(e => e.action === 'removed').slice(0, limit);
  },

  getPendingUpdates(since) {
    const sinceDate = new Date(since);
    return this.getChangelog().filter(e => new Date(e.timestamp) > sinceDate);
  },

  clearChangelog() {
    localStorage.removeItem(this.CHANGELOG_KEY);
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
