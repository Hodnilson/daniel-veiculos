/* ═══ COMPONENTS — Daniel Veículos ═══ */
'use strict';

const UI = {

  /* ─── KPI Card ─── */
  kpi(label, value, badge, icon, glow) {
    const bg   = glow ? 'bg-primary-container/10 border border-primary-container/30' : 'bg-surface-container border border-white/5';
    const ibg  = glow ? 'bg-primary-container/20' : 'bg-surface-container-high';
    const iclr = glow ? 'text-primary-container' : 'text-on-surface-variant';
    const bclr = glow ? 'text-primary-container' : 'text-on-surface-variant';
    return `<div class="glass-panel card-interactive rounded-xl p-lg flex flex-col justify-between gap-md ${bg}">
      <div class="flex justify-between items-start">
        <div class="p-sm ${ibg} rounded-lg"><span class="material-symbols-outlined ${iclr}" style="font-variation-settings:'FILL' 1">${icon}</span></div>
        <span class="${bclr} text-label-caps font-label-caps">${badge}</span>
      </div>
      <div><p class="text-on-surface-variant text-label-caps font-label-caps">${label}</p><h3 class="font-h2 text-h2 text-on-surface mt-xs">${value}</h3></div>
    </div>`;
  },

  /* ─── CRM Funnel Card (clickable) ─── */
  funnel(label, value, icon, pct, sub, hl, statusFilter) {
    const cls = hl
      ? 'glass-panel card-interactive p-lg rounded-xl bg-primary-container/5 border border-primary-container/30'
      : 'glass-panel card-interactive p-lg rounded-xl border border-white/5';
    const onclick = statusFilter ? `onclick="App.showCrmByStatus('${statusFilter}')"` : '';
    return `<div class="${cls}" ${onclick} title="Clique para ver detalhes">
      <div class="flex justify-between items-start mb-md">
        <div>
          <p class="text-label-caps font-label-caps ${hl ? 'text-primary-container' : 'text-on-surface-variant'}">${label}</p>
          <h3 class="font-h2 text-h2 text-primary-container">${value}</h3>
        </div>
        <span class="material-symbols-outlined text-primary-container${hl ? ' status-pulse' : ''}" style="font-variation-settings:'FILL' 1">${icon}</span>
      </div>
      <div class="w-full bg-white/5 h-1 rounded-full overflow-hidden">
        <div class="bg-primary-container h-full transition-all" style="width:${pct}%"></div>
      </div>
      <p class="text-xs ${hl ? 'text-primary-container' : 'text-on-surface-variant'} mt-sm">${sub}</p>
    </div>`;
  },

  /* ─── Transaction Row ─── */
  txRow(vehicle, client, status, value) {
    const sc = status === 'Concluído'
      ? 'bg-primary-container/20 text-primary-container border border-primary-container/30'
      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
    const vc = status === 'Concluído' ? 'text-primary-container' : '';
    return `<tr class="hover:bg-white/5 transition-colors">
      <td class="px-lg py-md"><div class="flex items-center gap-sm"><span class="material-symbols-outlined text-on-surface-variant text-[18px]" style="font-variation-settings:'FILL' 1">directions_car</span><span class="text-on-surface">${vehicle}</span></div></td>
      <td class="px-lg py-md text-on-surface-variant">${client}</td>
      <td class="px-lg py-md"><span class="${sc} px-sm py-1 rounded text-[10px] font-bold uppercase tracking-widest">${status}</span></td>
      <td class="px-lg py-md text-right font-data-mono font-bold ${vc}">${value}</td>
    </tr>`;
  },

  /* ─── CRM Client Row ─── */
  crmRow(c) {
    const map = {
      'negotiation': ['NEGOCIAÇÃO', 'bg-primary-container/10 text-primary-container border border-primary-container/30'],
      'test-drive':  ['TEST-DRIVE',  'bg-blue-500/10 text-blue-400 border border-blue-500/20'],
      'new-lead':    ['NOVO LEAD',   'bg-white/5 text-on-surface-variant border border-white/10'],
      'proposal':    ['PROPOSTA',    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'],
      'closed':      ['VENDIDO',     'bg-primary-container/20 text-primary-container border border-primary-container/50'],
    };
    const [lb, cls] = map[c.status] || ['—', 'bg-white/5 text-on-surface-variant'];
    const ini = Fmt.initials(c.name);
    return `<tr class="hover:bg-white/5 transition-colors border-b border-white/5">
      <td class="px-lg py-md">
        <div class="flex items-center gap-md">
          <div class="w-9 h-9 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container font-bold text-sm shrink-0">${ini}</div>
          <div><p class="font-bold text-on-surface text-sm">${c.name}</p><p class="text-xs text-on-surface-variant">${c.email}</p></div>
        </div>
      </td>
      <td class="px-lg py-md text-sm text-on-surface-variant">${c.city || '—'}</td>
      <td class="px-lg py-md"><div class="flex items-center gap-xs text-sm"><span class="material-symbols-outlined text-[16px] text-on-surface-variant">directions_car</span>${c.interest || '—'}</div></td>
      <td class="px-lg py-md"><span class="${cls} text-[10px] font-bold px-sm py-1 rounded uppercase tracking-wide">${lb}</span></td>
      <td class="px-lg py-md"><p class="text-sm font-data-mono">${c.lastContact || '—'}</p><p class="text-[11px] text-on-surface-variant">${c.via || ''}</p></td>
      <td class="px-lg py-md">
        <div class="flex gap-xs">
          <button class="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-green-400 hover:border-green-400/50 border border-white/5 transition-all" onclick="App.openWhatsApp('${c.id}')" title="WhatsApp Inteligente"><span class="material-symbols-outlined text-[16px]">chat</span></button>
          <button class="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary-container hover:border-primary-container/50 border border-white/5 transition-all" onclick="App.viewCustomer('${c.id}')" title="Ver"><span class="material-symbols-outlined text-[16px]">visibility</span></button>
          <button class="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary-container hover:border-primary-container/50 border border-white/5 transition-all" onclick="App.editCustomer('${c.id}')" title="Editar"><span class="material-symbols-outlined text-[16px]">edit</span></button>
          <button class="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-error hover:border-error/50 border border-white/5 transition-all" onclick="App.confirmDeleteCustomer('${c.id}')" title="Excluir"><span class="material-symbols-outlined text-[16px]">delete</span></button>
        </div>
      </td>
    </tr>`;
  },

  /* ─── Vehicle Card ─── */
  vehicleCard(v) {
    const stMap = { available:'Disponível', reserved:'Reservado', sold:'Vendido', proposal:'Proposta', vitrine:'Vitrine' };
    const stClr = {
      available: 'bg-primary-container text-surface-container-lowest',
      reserved:  'bg-yellow-400 text-black',
      sold:      'bg-blue-500 text-white',
      proposal:  'bg-orange-400 text-black',
      vitrine:   'bg-purple-500 text-white',
    };
    const bgStyle = v.photo ? `style="background:url(${v.photo}) center/cover"` : '';
    const iconOpacity = v.photo ? '0' : '.12';
    return `<div class="glass-panel card-interactive rounded-xl overflow-hidden group cursor-pointer border border-white/5 hover:border-primary-container/30 transition-all duration-300">
      <div class="h-44 bg-gradient-to-br from-surface-container to-surface-container-high flex items-center justify-center relative overflow-hidden" ${bgStyle}>
        <span class="material-symbols-outlined text-on-surface-variant transition-transform group-hover:scale-110 duration-500" style="font-size:72px;opacity:${iconOpacity};font-variation-settings:'FILL' 1">directions_car</span>
        <div class="absolute top-sm right-sm"><span class="${stClr[v.status] || 'bg-white/10 text-on-surface'} font-bold text-[10px] px-sm py-1 rounded-full uppercase tracking-wider">${stMap[v.status] || v.status}</span></div>
        ${v.destaque ? '<div class="absolute top-sm left-sm"><span class="bg-yellow-400 text-black font-bold text-[10px] px-sm py-1 rounded-full uppercase">★ Destaque</span></div>' : ''}
      </div>
      <div class="p-md space-y-sm">
        <div>
          <h3 class="font-bold text-on-surface text-[17px] leading-tight">${v.brand} ${v.model}</h3>
          <p class="text-on-surface-variant text-sm">${v.year} · ${v.color}</p>
        </div>
        <div class="grid grid-cols-3 gap-xs">
          <div class="bg-surface-container rounded px-xs py-1 text-center"><p class="text-[10px] text-on-surface-variant">Comb.</p><p class="text-xs font-bold">${v.fuel}</p></div>
          <div class="bg-surface-container rounded px-xs py-1 text-center"><p class="text-[10px] text-on-surface-variant">KM</p><p class="text-xs font-bold">${Fmt.km(v.km)}</p></div>
          <div class="bg-surface-container rounded px-xs py-1 text-center"><p class="text-[10px] text-on-surface-variant">Câmbio</p><p class="text-xs font-bold truncate">${v.trans}</p></div>
        </div>
        <div class="flex justify-between items-center pt-sm border-t border-white/5">
          <span class="font-bold text-primary-container text-[18px]">${Fmt.moneyShort(v.price)}</span>
          <div class="flex gap-xs">
            <button class="btn btn-ghost btn-sm" onclick="App.viewVehicle('${v.id}')"><span class="material-symbols-outlined text-[15px]">visibility</span></button>
            <button class="btn btn-ghost btn-sm" onclick="App.editVehicle('${v.id}')"><span class="material-symbols-outlined text-[15px]">edit</span></button>
            <button class="btn btn-danger btn-sm" onclick="App.confirmDeleteVehicle('${v.id}')"><span class="material-symbols-outlined text-[15px]">delete</span></button>
          </div>
        </div>
      </div>
    </div>`;
  },

  /* ─── Vehicle Form ─── */
  vehicleForm(v) {
    v = v || {};
    const opt = (arr, sel) => arr.map(x => `<option${sel===x?' selected':''}>${x}</option>`).join('');
    const ep = v.photo || '';
    const cl = DB.customers();
    const optCl = cl.map(c => `<option value="${c.id}" ${v.soldTo===c.id?'selected':''}>${c.name}</option>`).join('');
    return `<form id="v-form" onsubmit="App.saveVehicle(event)" autocomplete="off">
      <input type="hidden" name="id" value="${v.id || ''}">
      <input type="hidden" name="photo" id="v-photo-value" value="${ep}">
      <div style="margin-bottom:16px">
        <label class="form-label">Fotos do Veículo</label>
        <div id="v-photo-zone" onclick="document.getElementById('v-photo-input').click()"
          style="border:2px dashed rgba(57,255,20,.22);border-radius:12px;min-height:118px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:border-color .2s;overflow:hidden;background:rgba(57,255,20,.03)"
          onmouseenter="this.style.borderColor='rgba(57,255,20,.55)'" onmouseleave="this.style.borderColor='rgba(57,255,20,.22)'">
          ${ep ? `<img src="${ep}" style="width:100%;height:118px;object-fit:cover">` : `<div style="text-align:center;padding:18px"><span class="material-symbols-outlined" style="font-size:36px;color:rgba(57,255,20,.45);font-variation-settings:'FILL' 1">add_photo_alternate</span><p style="color:#baccb0;font-size:13px;font-weight:600;margin-top:6px">Clique para adicionar fotos</p><p style="color:#3c4b35;font-size:11px">JPG, PNG, WEBP · Suporta Alta Definição (HD)</p></div>`}
        </div>
        <input id="v-photo-input" type="file" accept="image/*" style="display:none" onchange="UI._previewVehiclePhoto(this)">
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Marca *</label><input name="brand" value="${v.brand||''}" required placeholder="Ex: BMW"></div>
        <div class="form-group"><label class="form-label">Modelo *</label><input name="model" value="${v.model||''}" required placeholder="Ex: M4 Competition"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Ano *</label><input name="year" type="number" min="1990" max="2030" value="${v.year||2025}" required></div>
        <div class="form-group"><label class="form-label">Preço (R$) *</label><input name="price" type="number" min="0" value="${v.price||''}" required placeholder="850000"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Quilometragem</label><input name="km" type="number" min="0" value="${v.km||0}"></div>
        <div class="form-group"><label class="form-label">Cor</label><input name="color" value="${v.color||''}" placeholder="Ex: Preto Safira"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Combustível</label><select name="fuel">${opt(['Gasolina','Diesel','Elétrico','Híbrido'], v.fuel)}</select></div>
        <div class="form-group"><label class="form-label">Transmissão</label><select name="trans">${opt(['Automático','Manual','PDK','CVT','F1 DCT'], v.trans)}</select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Placa</label><input name="plate" value="${v.plate||''}" placeholder="ABC-1D23"></div>
        <div class="form-group"><label class="form-label">Custos Extras (R$)</label><input name="costs" type="number" min="0" value="${v.costs||''}" placeholder="Manutenção, etc" ${App.session?.role!=='admin'?'disabled':''}></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Status</label><select name="status" onchange="document.getElementById('v-sold-to-group').style.display=this.value==='sold'?'block':'none'">${opt(['available','reserved','sold','vitrine','proposal'], v.status)}</select></div>
      </div>
      <div class="form-group" id="v-sold-to-group" style="display:${v.status==='sold'?'block':'none'};position:relative;">
        <label class="form-label">Vendido para *</label>
        <input type="hidden" name="soldTo" id="v-sold-to" value="${v.soldTo||''}">
        <input type="text" id="v-sold-to-search" placeholder="Buscar cliente por nome..." autocomplete="off"
          value="${v.soldTo ? (DB.customer(v.soldTo)?.name || '') : ''}"
          onfocus="document.getElementById('v-sold-list').style.display='block'" 
          onkeyup="UI.filterDropdown(this.value, 'v-client-item', 'v-client-empty')"
          style="width:100%;background:#292a2a;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:9px 13px;color:#e3e2e2;font-size:14px;outline:none;font-family:Inter">
        <div id="v-sold-list" style="display:none;position:absolute;top:100%;left:0;right:0;background:#1f2020;border:1px solid rgba(255,255,255,.2);border-radius:8px;max-height:180px;overflow-y:auto;z-index:9999;margin-top:4px;box-shadow:0 10px 25px rgba(0,0,0,0.5)">
          ${cl.map(c => `<div class="v-client-item hover:bg-white/5" style="padding:10px 14px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,.05);color:#e3e2e2;font-size:13px" onclick="document.getElementById('v-sold-to').value='${c.id}';document.getElementById('v-sold-to-search').value='${c.name}';this.parentNode.style.display='none'">${c.name}</div>`).join('')}
          <div class="v-client-empty" style="display:none;padding:10px 14px;color:#baccb0;font-size:13px;text-align:center">Nenhum cliente encontrado</div>
        </div>
        <p style="font-size:11px;color:#facc15;margin-top:6px">Se o cliente não estiver na lista, <a href="javascript:void(0)" onclick="App.closeModal();setTimeout(()=>App.addCustomer(), 300)" style="text-decoration:underline;color:#facc15">cadastre-o primeiro no CRM</a>.</p>
      </div>
    </form>
    <script>
      // Fecha a lista se clicar fora
      document.addEventListener('click', function(e) {
        if (!e.target.closest('#v-sold-to-group')) {
          const list = document.getElementById('v-sold-list');
          if (list) list.style.display = 'none';
        }
      });
    </script>`;
  },

  async _previewVehiclePhoto(input) {
    const file = input.files[0]; if (!file) return;
    const z = document.getElementById('v-photo-zone');
    const h = document.getElementById('v-photo-value');
    if (z) z.innerHTML = `<div style="text-align:center;padding:18px"><p style="color:#39FF14;font-size:13px;font-weight:600;">Otimizando HD...</p></div>`;
    
    this._compressImage(file, async (blob, dataUrl) => {
      if (z) z.innerHTML = `<div style="text-align:center;padding:18px"><p style="color:#39FF14;font-size:13px;font-weight:600;">Enviando para nuvem...</p></div>`;
      try {
        const url = await DB.uploadPhoto(blob);
        if (z) z.innerHTML = `<img src="${url}" style="width:100%;height:118px;object-fit:cover">`;
        if (h) h.value = url;
      } catch (err) {
        console.warn("Storage falhou, usando Base64", err);
        if (z) z.innerHTML = `<img src="${dataUrl}" style="width:100%;height:118px;object-fit:cover">`;
        if (h) h.value = dataUrl;
      }
    });
  },

  _compressImage(file, callback) {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width, height = img.height;
        const max = 1200;
        if (width > height && width > max) { height = Math.round(height * max / width); width = max; }
        else if (height > width && height > max) { width = Math.round(width * max / height); height = max; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        fetch(dataUrl).then(res => res.blob()).then(blob => {
          blob.name = file.name;
          callback(blob, dataUrl);
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },


  filterDropdown(q, itemClass, emptyClass) {
    const term = q.toLowerCase();
    let hasVis = false;
    document.querySelectorAll('.' + itemClass).forEach(el => {
      const match = el.textContent.toLowerCase().includes(term);
      el.style.display = match ? 'block' : 'none';
      if (match) hasVis = true;
    });
    const empty = document.querySelector('.' + emptyClass);
    if (empty) empty.style.display = hasVis ? 'none' : 'block';
  },

  /* ─── Customer Form ─── */
  customerForm(c) {
    c = c || {};
    const statuses = { 'new-lead':'Novo Lead','test-drive':'Test-Drive','negotiation':'Negociação','proposal':'Proposta','closed':'Vendido' };
    const vias = ['WhatsApp','Telefone','E-mail','Visita Presencial','Site Institucional'];
    const optSt = Object.entries(statuses).map(([v,l]) => `<option value="${v}"${c.status===v?' selected':''}>${l}</option>`).join('');
    const optVi = vias.map(v => `<option${c.via===v?' selected':''}>${v}</option>`).join('');
    const ini = Fmt.initials(c.name || '?');
    const ep  = c.photo || '';
    return `<form id="c-form" onsubmit="App.saveCustomer(event)" autocomplete="off">
      <input type="hidden" name="id" value="${c.id || ''}">
      <input type="hidden" name="photo" id="c-photo-value" value="${ep}">
      <div style="display:flex;align-items:center;gap:16px;padding:12px 14px;background:rgba(57,255,20,.03);border:1px dashed rgba(57,255,20,.2);border-radius:12px;margin-bottom:16px">
        <div id="c-avatar-preview" onclick="document.getElementById('c-photo-input').click()" title="Clique para trocar a foto"
          style="width:74px;height:74px;border-radius:50%;border:2px solid rgba(57,255,20,.35);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#39FF14;cursor:pointer;flex-shrink:0;transition:border-color .2s;overflow:hidden;background:${ep ? 'url('+ep+') center/cover' : 'rgba(57,255,20,.1)'}"
          onmouseenter="this.style.borderColor='#39FF14'" onmouseleave="this.style.borderColor='rgba(57,255,20,.35)'">${ep ? '' : ini}</div>
        <div><p style="font-weight:700;color:#e3e2e2;font-size:14px">Foto do Cliente</p><p style="color:#baccb0;font-size:12px;margin-top:3px">Clique no avatar para carregar</p><p style="color:#3c4b35;font-size:11px;margin-top:1px">JPG, PNG, WEBP · Alta Definição (HD)</p></div>
        <input id="c-photo-input" type="file" accept="image/*" style="display:none" onchange="UI._previewCustomerPhoto(this)">
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Nome Completo *</label><input name="name" value="${c.name||''}" required placeholder="João da Silva" oninput="UI._updateAvatarInitials(this)"></div>
        <div class="form-group"><label class="form-label">E-mail *</label><input name="email" type="email" value="${c.email||''}" required placeholder="joao@email.com"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Telefone *</label><input name="phone" value="${c.phone||''}" required placeholder="(11) 99999-9999"></div>
        <div class="form-group"><label class="form-label">CPF</label><input name="cpf" value="${c.cpf||''}" placeholder="000.000.000-00"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">CEP</label><input name="cep" id="c-cep" value="${c.cep||''}" placeholder="00000-000" onblur="if(window.App) App.fetchCep(this.value)"></div>
        <div class="form-group"><label class="form-label">Cidade / Estado</label><input name="city" id="c-city" value="${c.city||''}" placeholder="Ex: São Paulo - SP"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Veículo de Interesse</label><input name="interest" value="${c.interest||''}" placeholder="BMW M4"></div>
        <div class="form-group"><label class="form-label">Status CRM</label><select name="status">${optSt}</select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Canal de Contato</label><select name="via">${optVi}</select></div>
      </div>
    </form>`;
  },

  async _previewCustomerPhoto(input) {
    const file = input.files[0]; if (!file) return;
    const av  = document.getElementById('c-avatar-preview');
    const val = document.getElementById('c-photo-value');
    if (av) { av.textContent = '...'; }

    this._compressImage(file, async (blob, dataUrl) => {
      try {
        const url = await DB.uploadPhoto(blob);
        if (av)  { av.textContent = ''; av.style.background = `url(${url}) center/cover`; }
        if (val) val.value = url;
      } catch (err) {
        console.warn("Storage falhou, usando Base64", err);
        if (av)  { av.textContent = ''; av.style.background = `url(${dataUrl}) center/cover`; }
        if (val) val.value = dataUrl;
      }
    });
  },

  _updateAvatarInitials(input) {
    const av = document.getElementById('c-avatar-preview');
    if (!av || av.style.backgroundImage) return;
    av.textContent = Fmt.initials(input.value || '?');
  },

  transactionForm(t) {
    t = t || {};
    const statuses = {'proposal':'Em Proposta', 'completed':'Concluído'};
    const optSt = Object.entries(statuses).map(([v,l]) => `<option value="${v}"${t.status===v?' selected':''}>${l}</option>`).join('');
    const cl = DB.customers();
    return `<form id="t-form" onsubmit="App.saveTransaction(event)" autocomplete="off">
      <input type="hidden" name="id" value="${t.id || ''}">
      <div class="form-row">
        <div class="form-group" id="t-client-group" style="position:relative">
          <label class="form-label">Cliente *</label>
          <input type="text" name="client" id="t-client-search" placeholder="Buscar cliente..." value="${t.client||''}" required autocomplete="off" onfocus="document.getElementById('t-client-list').style.display='block'" onkeyup="UI.filterDropdown(this.value, 't-client-item', 't-client-empty')" style="width:100%;background:#292a2a;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:9px 13px;color:#e3e2e2;font-size:14px;outline:none;font-family:Inter">
          <div id="t-client-list" style="display:none;position:absolute;top:100%;left:0;right:0;background:#1f2020;border:1px solid rgba(255,255,255,.2);border-radius:8px;max-height:180px;overflow-y:auto;z-index:9999;margin-top:4px;box-shadow:0 10px 25px rgba(0,0,0,0.5)">
            ${cl.map(c => `<div class="t-client-item hover:bg-white/5" style="padding:10px 14px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,.05);color:#e3e2e2;font-size:13px" onclick="document.getElementById('t-client-search').value='${c.name}';this.parentNode.style.display='none'">${c.name}</div>`).join('')}
            <div class="t-client-empty" style="display:none;padding:10px 14px;color:#baccb0;font-size:13px;text-align:center">Nenhum cliente encontrado</div>
          </div>
        </div>
        <div class="form-group"><label class="form-label">Veículo / Descrição *</label><input name="vehicle" value="${t.vehicle||''}" required placeholder="Ex: BMW M4"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Valor (R$) *</label><input name="value" type="number" min="0" value="${t.value||''}" required placeholder="150000"></div>
        <div class="form-group"><label class="form-label">Vencimento</label><input name="due" type="date" value="${t.due||''}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Status</label><select name="status">${optSt}</select></div>
      </div>
    </form>
    <script>
      document.addEventListener('click', function(e) {
        if (!e.target.closest('#t-client-group')) {
          const list = document.getElementById('t-client-list');
          if (list) list.style.display = 'none';
        }
      });
    </script>`;
  },

  /* ─── Payable Form ─── */
  payableForm(p) {
    p = p || {};
    const statuses = {'Agendado':'Agendado', 'Pendente':'Pendente', 'Pago':'Pago'};
    const optSt = Object.entries(statuses).map(([v,l]) => `<option value="${v}"${p.status===v?' selected':''}>${l}</option>`).join('');
    return `<form id="p-form" onsubmit="App.savePayable(event)" autocomplete="off">
      <input type="hidden" name="id" value="${p.id || ''}">
      <div class="form-row">
        <div class="form-group"><label class="form-label">Fornecedor *</label><input name="sup" value="${p.sup||''}" required placeholder="Ex: Seguradora X"></div>
        <div class="form-group"><label class="form-label">Descrição *</label><input name="desc" value="${p.desc||''}" required placeholder="Ex: Seguro Mensal"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Valor (R$) *</label><input name="value" type="number" min="0" value="${p.value||''}" required placeholder="1500"></div>
        <div class="form-group"><label class="form-label">Vencimento</label><input name="due" type="date" value="${p.due||''}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Status</label><select name="status">${optSt}</select></div>
      </div>
    </form>`;
  },


  /* ─── Modal Template ─── */
  modal(t, b, f) {
    return `<div class="modal-head">
      <h2>${t}</h2>
      <button class="modal-close" onclick="App.closeModal()" aria-label="Fechar">✕</button>
    </div>
    <div class="modal-body">${b}</div>
    ${f ? `<div class="modal-foot">${f}</div>` : ''}`;
  },

  /* ─── Notification Item ─── */
  notifItem(n) {
    return `<div class="flex gap-md p-md hover:bg-white/5 transition-colors cursor-pointer rounded-lg">
      <div class="w-2 h-2 rounded-full ${n.read ? 'bg-surface-variant' : 'bg-primary-container status-pulse'} mt-1.5 shrink-0"></div>
      <div class="flex-1">
        <p class="text-sm font-bold text-on-surface">${n.title}</p>
        <p class="text-xs text-on-surface-variant">${n.desc}</p>
        <p class="text-[10px] text-on-surface-variant mt-xs">${n.time}</p>
      </div>
    </div>`;
  },

  /* ─── Finance KPI ─── */
  finKpi(label, value, icon, ic, extra) {
    return `<div class="glass-panel card-interactive p-md rounded-xl space-y-sm border border-white/5">
      <div class="flex justify-between items-start">
        <span class="text-on-surface-variant font-label-caps text-label-caps">${label}</span>
        <span class="material-symbols-outlined ${ic}" style="font-variation-settings:'FILL' 1">${icon}</span>
      </div>
      <div class="text-h2 font-h2 text-on-surface">${value}</div>
      ${extra || ''}
    </div>`;
  },

  /* ─── Vehicle Detail ─── */
  vehicleDetail(v) {
    const f = (l, val, green) => `<div class="bg-surface-container rounded-lg p-md border border-white/5">
      <p class="text-[10px] text-on-surface-variant uppercase font-label-caps mb-xs">${l}</p>
      <p class="font-bold ${green ? 'text-primary-container' : 'text-on-surface'}">${val}</p>
    </div>`;
    const stMap = { available:'Disponível', reserved:'Reservado', sold:'Vendido', proposal:'Proposta', vitrine:'Vitrine' };
    let soldToBlock = '';
    if (v.status === 'sold' && v.soldTo) {
      const c = DB.customer(v.soldTo);
      soldToBlock = c ? f('Vendido para', c.name, true) : f('Vendido para', 'Cliente Desconhecido');
    }
    let profitBlock = '';
    if (App.session?.role === 'admin' && v.costs) {
      const costs = Number(v.costs) || 0;
      const profit = Number(v.price) - costs;
      profitBlock = `
        <div class="col-span-2 bg-primary-container/5 rounded-lg p-md border border-primary-container/20 mt-2">
          <div class="flex justify-between items-center">
            <div><p class="text-[10px] text-on-surface-variant uppercase font-label-caps">Custos Extras</p><p class="text-sm text-error">${Fmt.money(costs)}</p></div>
            <div class="text-right"><p class="text-[10px] text-primary-container uppercase font-label-caps">Lucro Líquido Estimado</p><p class="text-lg font-bold text-primary-container">${Fmt.money(profit)}</p></div>
          </div>
        </div>`;
    }

    return `<div class="grid grid-cols-2 gap-md">
      ${f('Marca', v.brand)} ${f('Modelo', v.model)}
      ${f('Ano', v.year)} ${f('Preço', Fmt.money(v.price), true)}
      ${f('KM', Fmt.km(v.km))} ${f('Cor', v.color || '—')}
      ${f('Combustível', v.fuel || '—')} ${f('Transmissão', v.trans || '—')}
      ${f('Placa', v.plate || '—')} ${f('Status', stMap[v.status] || v.status)}
      ${soldToBlock}
      ${v.createdAt ? f('Cadastrado em', Fmt.date(v.createdAt)) : ''}
      ${profitBlock}
    </div>
    <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
      <button class="w-full btn btn-primary flex justify-center items-center gap-sm" onclick="App.printFichaVehicle(${v.id})" style="flex:1;min-width:140px">
        <span class="material-symbols-outlined text-[18px]">directions_car</span> Ficha do Veículo
      </button>
      <button class="w-full btn flex justify-center items-center gap-sm" onclick="App.printConsignacaoVehicle(${v.id})" style="flex:1;min-width:140px;background:#1b1c1c;color:#e3e2e2;border:1px solid rgba(255,255,255,.1)">
        <span class="material-symbols-outlined text-[18px]">contract</span> Consignação
      </button>
      ${v.status === 'sold' ? `
      <button class="w-full btn flex justify-center items-center gap-sm" onclick="App.printVendaVehicle(${v.id})" style="flex:1;min-width:140px;background:#292a2a;color:#e3e2e2;border:1px solid rgba(255,255,255,.1)">
        <span class="material-symbols-outlined text-[18px]">receipt_long</span> Recibo de Venda
      </button>
      ` : ''}
    </div>`;
  },

  /* ─── Customer Detail ─── */
  customerDetail(c) {
    const f = (l, val) => `<div class="bg-surface-container rounded-lg p-md border border-white/5">
      <p class="text-[10px] text-on-surface-variant uppercase font-label-caps mb-xs">${l}</p>
      <p class="font-bold text-on-surface">${val || '—'}</p>
    </div>`;
    const stLabels = {'new-lead':'Novo Lead','test-drive':'Test-Drive','negotiation':'Negociação','proposal':'Proposta','closed':'Vendido'};
    return `<div class="grid grid-cols-2 gap-md">
      ${f('Nome', c.name)} ${f('E-mail', c.email)}
      ${f('Telefone', c.phone)} ${f('CPF', c.cpf)}
      ${f('Cidade', c.city)} ${f('Interesse', c.interest)}
      ${f('Status', stLabels[c.status]||c.status)} ${f('Último Contato', c.lastContact)}
      ${f('Canal', c.via)} ${c.createdAt ? f('Cadastrado em', Fmt.date(c.createdAt)) : ''}
    </div>`;
  },

  /* ─── Recent Activity (Dashboard) ─── */
  recentActivity() {
    const notifs = DB.notifications().slice(0, 5);
    if (!notifs.length) return '<p class="text-on-surface-variant text-sm text-center py-lg">Nenhuma atividade recente</p>';
    return notifs.map(n => `<div class="flex items-start gap-md p-sm hover:bg-white/5 rounded-lg transition-colors">
      <div class="w-2 h-2 mt-2 rounded-full ${n.read ? 'bg-surface-variant' : 'bg-primary-container'} shrink-0"></div>
      <div class="flex-1">
        <p class="text-sm font-bold text-on-surface">${n.title}</p>
        <p class="text-xs text-on-surface-variant">${n.desc}</p>
        <p class="text-[10px] text-on-surface-variant mt-xs">${n.time}</p>
      </div>
    </div>`).join('');
  },

  /* ─── Inline Detail List (for CRM/Stock click-to-expand) ─── */
  detailList(title, items, renderFn, emptyMsg) {
    if (!items.length) return `<div class="glass-panel p-lg rounded-xl border border-white/5 text-center">
      <p class="text-on-surface-variant">${emptyMsg || 'Nenhum item encontrado.'}</p>
    </div>`;
    return `<div class="glass-panel rounded-xl border border-primary-container/20 overflow-hidden">
      <div class="px-lg py-md border-b border-white/5 flex justify-between items-center bg-primary-container/5">
        <h4 class="font-h3 text-primary-container">${title}</h4>
        <span class="text-xs text-on-surface-variant">${items.length} resultado(s)</span>
      </div>
      <div class="divide-y divide-white/5">${items.map(renderFn).join('')}</div>
    </div>`;
  },
};
