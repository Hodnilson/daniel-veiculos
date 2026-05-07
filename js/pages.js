'use strict';
const Pages = {
  dashboard() {
    const k=DB.kpi(), wp=DB.weekly(), txs=DB.transactions();
    const bars=wp.map(d=>`<div class="flex flex-col items-center gap-xs flex-1"><div class="w-full bg-primary-container/20 rounded-t relative" style="height:${d.t}px"><div class="absolute bottom-0 w-full bg-primary-container rounded-t" style="height:${d.a}px"></div></div><span class="text-label-caps text-on-surface-variant font-label-caps text-[10px]">${d.d}</span></div>`).join('');
    const txRows=txs.length ? txs.map(t=>`<tr class="hover:bg-white/5 transition-colors cursor-pointer" onclick="App.editTransaction(${t.id})"><td class="px-lg py-md text-sm">${t.vehicle}</td><td class="px-lg py-md text-sm hidden md:table-cell">${t.client}</td><td class="px-lg py-md text-sm">${t.status==='completed'?'Concluído':'Proposta'}</td><td class="px-lg py-md text-sm text-right font-data-mono font-bold text-primary-container">${Fmt.moneyShort(t.value)}</td></tr>`).join('') : `<tr><td colspan="4" class="px-lg py-xl text-center text-on-surface-variant text-sm">Nenhuma transação registrada</td></tr>`;
    return `<div class="grid grid-cols-2 lg:grid-cols-4 gap-md">
      ${UI.kpi('Receita Mensal',k.monthlySales,'Total Atual','payments',true)}
      ${UI.kpi('Clientes Ativos',k.activeClients,'Total','group',false)}
      ${UI.kpi('Giro de Estoque',k.stockTurnover,'Média','sync',false)}
      ${UI.kpi('Veículos em Pátio',k.lotVehicles,'Unidades','inventory_2',false)}
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-md">
      <div class="glass-panel p-lg rounded-xl border border-white/5 flex flex-col">
        <div class="flex justify-between items-center mb-lg">
          <div><h4 class="font-h3 text-h3 text-on-surface">Lucro Real & Faturamento</h4><p class="text-on-surface-variant text-sm">Desempenho financeiro (Últimos meses)</p></div>
        </div>
        <div style="flex:1;position:relative;min-height:180px">
          <canvas id="financeChart"></canvas>
        </div>
      </div>
      <div class="glass-panel rounded-xl border border-white/5 flex flex-col">
        <div class="p-lg border-b border-white/5"><h4 class="font-h3 text-on-surface">Funil CRM Hoje</h4></div>
        <div class="p-lg grid grid-cols-2 gap-md flex-1">
          ${UI.kpi('Novos Leads',k.newLeads,'Hoje','person_add',false)}
          ${UI.kpi('Test-Drives',k.testDrives,'Agendados','electric_car',false)}
          ${UI.kpi('Negociações',k.negotiations,'Ativas','handshake',false)}
          ${UI.kpi('Vendas Mês',k.monthlyClosed,'Fechadas','trophy',true)}
        </div>
        <div class="px-lg pb-lg"><button class="w-full py-sm border border-primary-container text-primary-container font-bold rounded-lg hover:bg-primary-container/10 transition-all" onclick="location.hash='#/crm'">Acessar CRM Completo →</button></div>
      </div>
    </div>
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-md pb-xl">
      <div class="glass-panel rounded-xl overflow-hidden border border-white/5 flex flex-col">
        <div class="px-lg py-md border-b border-white/10 flex justify-between items-center">
          <h4 class="font-h3 text-on-surface">Transações Recentes</h4>
          <div class="flex gap-sm">
            <button class="btn btn-primary btn-sm" onclick="App.addTransaction()"><span class="material-symbols-outlined text-[16px]">add</span>Nova</button>
            <button class="btn btn-ghost btn-sm" onclick="location.hash='#/financeiro'">Ver Tudo</button>
          </div>
        </div>
        <div class="overflow-x-auto"><table class="w-full min-w-[400px]"><thead class="bg-surface-container-high/50 text-label-caps text-on-surface-variant font-label-caps"><tr><th class="px-lg py-md text-left">Veículo</th><th class="px-lg py-md text-left hidden md:table-cell">Cliente</th><th class="px-lg py-md text-left">Status</th><th class="px-lg py-md text-right">Valor</th></tr></thead><tbody class="divide-y divide-white/5">${txRows}</tbody></table></div>
      </div>
      <div class="glass-panel rounded-xl border border-white/5 p-lg">
        <h4 class="font-h3 text-on-surface mb-md">Atividade Recente</h4>
        <div id="dash-activity" class="space-y-sm">${UI.recentActivity()}</div>
      </div>
    </div>`;
  },

  estoque() {
    const br=DB.brands(), v=DB.vehicles(), s=DB.stats();
    return `<div class="grid grid-cols-4 gap-md mb-md">
      <div class="glass-panel card-interactive p-md rounded-lg border border-white/5 text-center" onclick="App.showVehiclesByStatus('')"><p class="text-label-caps text-on-surface-variant font-label-caps">Total</p><p class="text-h3 font-h3 text-on-surface">${s.total}</p></div>
      <div class="glass-panel card-interactive p-md rounded-lg border border-primary-container/20 text-center" onclick="App.showVehiclesByStatus('available')"><p class="text-label-caps text-primary-container font-label-caps">Disponíveis</p><p class="text-h3 font-h3 text-primary-container">${s.available}</p></div>
      <div class="glass-panel card-interactive p-md rounded-lg border border-yellow-500/20 text-center" onclick="App.showVehiclesByStatus('reserved')"><p class="text-label-caps text-yellow-400 font-label-caps">Reservados</p><p class="text-h3 font-h3 text-yellow-400">${s.reserved}</p></div>
      <div class="glass-panel card-interactive p-md rounded-lg border border-blue-500/20 text-center" onclick="App.showVehiclesByStatus('sold')"><p class="text-label-caps text-blue-400 font-label-caps">Vendidos</p><p class="text-h3 font-h3 text-blue-400">${s.sold}</p></div>
    </div>
    <div class="glass-panel p-md rounded-xl border border-white/5 flex flex-wrap gap-md items-center mb-md">
      <div class="flex items-center bg-surface-container px-md py-xs rounded-full border border-white/5 flex-1 min-w-[180px]">
        <span class="material-symbols-outlined text-on-surface-variant mr-sm text-[18px]">search</span>
        <input id="f-search" class="bg-transparent border-none focus:ring-0 text-sm w-full text-on-surface outline-none placeholder:text-on-surface-variant" placeholder="Buscar marca, modelo, placa..." oninput="App.filterVehicles()">
      </div>
      <select id="f-brand" class="bg-surface-container border border-white/10 rounded-lg text-sm text-on-surface px-md py-xs outline-none" onchange="App.filterVehicles()">
        <option value="">Todas Marcas</option>${br.map(b=>`<option>${b}</option>`).join('')}
      </select>
      <select id="f-status" class="bg-surface-container border border-white/10 rounded-lg text-sm text-on-surface px-md py-xs outline-none" onchange="App.filterVehicles()">
        <option value="">Todos Status</option>
        <option value="available">Disponível</option><option value="reserved">Reservado</option>
        <option value="sold">Vendido</option><option value="vitrine">Vitrine</option><option value="proposal">Proposta</option>
      </select>
      <button class="btn btn-primary btn-sm" onclick="App.addVehicle()"><span class="material-symbols-outlined text-[16px]">add</span>Novo Veículo</button>
    </div>
    <div id="v-grid" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">${v.map(x=>UI.vehicleCard(x)).join('')}</div>`;
  },

  crm() {
    const k=DB.kpi(), cl=DB.customers();
    return `<div class="grid grid-cols-2 md:grid-cols-4 gap-md">
      ${UI.funnel('NOVOS LEADS',k.newLeads,'person_add',Math.min(k.newLeads*3,100),'Leads esta semana',false,'new-lead')}
      ${UI.funnel('TEST-DRIVES',k.testDrives,'electric_car',Math.min(k.testDrives*5,100),'Agendados',false,'test-drive')}
      ${UI.funnel('NEGOCIAÇÃO',k.negotiations,'handshake',Math.min(k.negotiations*8,100),'Em andamento',false,'negotiation')}
      ${UI.funnel('FECHADOS MÊS',k.monthlyClosed,'trophy',Math.min(k.monthlyClosed*4,100),'Meta: 40 unidades',true,'closed')}
    </div>
    <div class="glass-panel p-md rounded-xl border border-white/5 flex flex-wrap gap-md items-center">
      <div class="flex items-center bg-surface-container px-md py-xs rounded-full border border-white/5 flex-1 min-w-[180px]">
        <span class="material-symbols-outlined text-on-surface-variant mr-sm text-[18px]">search</span>
        <input id="c-search" class="bg-transparent border-none focus:ring-0 text-sm w-full text-on-surface outline-none placeholder:text-on-surface-variant" placeholder="Buscar cliente..." oninput="App.filterCustomers()">
      </div>
      <select id="c-status" class="bg-surface-container border border-white/10 rounded-lg text-sm text-on-surface px-md py-xs outline-none" onchange="App.filterCustomers()">
        <option value="">Todos Status</option>
        <option value="new-lead">Novo Lead</option><option value="test-drive">Test-Drive</option>
        <option value="negotiation">Negociação</option><option value="proposal">Proposta</option><option value="closed">Vendido</option>
      </select>
      <button class="btn btn-primary btn-sm" onclick="App.addCustomer()"><span class="material-symbols-outlined text-[16px]">person_add</span>Novo Cliente</button>
    </div>
    <div id="crm-detail-panel"></div>
    <div class="glass-panel rounded-xl overflow-hidden border border-white/5">
      <table class="w-full text-left">
        <thead class="bg-white/5 text-label-caps text-on-surface-variant font-label-caps">
          <tr><th class="px-lg py-md">Cliente</th><th class="px-lg py-md hidden lg:table-cell">Cidade</th><th class="px-lg py-md hidden md:table-cell">Interesse</th><th class="px-lg py-md">Status</th><th class="px-lg py-md hidden md:table-cell">Contato</th><th class="px-lg py-md">Ações</th></tr>
        </thead>
        <tbody id="crm-body">${cl.map(c=>UI.crmRow(c)).join('')}</tbody>
      </table>
      <div class="px-lg py-md border-t border-white/5 flex justify-between items-center bg-surface-container-lowest">
        <p class="text-xs text-on-surface-variant" id="crm-count">${cl.length} clientes</p>
      </div>
    </div>`;
  },

  financeiro() {
    const f=DB.finance();
    const recRows=f.receivables.length ? f.receivables.map(r=>{
      const sc=r.status==='Recebido'?'bg-primary-container/20 text-primary-container':r.status==='Aguardando'?'bg-yellow-500/10 text-yellow-400 status-pulse':'bg-surface-variant text-on-surface-variant';
      return `<tr class="hover:bg-white/5 transition-colors border-b border-white/5 cursor-pointer" onclick="App.editTransaction(${r.id})"><td class="px-lg py-md"><div class="font-bold text-sm text-on-surface">${r.client}</div><div class="text-xs text-on-surface-variant">${r.vehicle || r.desc}</div></td><td class="px-lg py-md text-sm font-data-mono">${r.due || '-'}</td><td class="px-lg py-md text-right font-data-mono font-bold text-primary-container">${Fmt.money(r.value)}</td><td class="px-lg py-md"><span class="${sc} px-sm py-1 rounded-full text-[10px] font-bold uppercase">${r.status}</span></td></tr>`;
    }).join('') : `<tr><td colspan="4" class="px-lg py-md text-center text-on-surface-variant text-sm">Nenhuma transação a receber.</td></tr>`;
    const payRows=f.payables.length ? f.payables.map(p=>{
      const sc=p.status==='Pendente'?'bg-error/10 text-error':'bg-surface-variant text-on-surface-variant';
      const dc=p.status==='Pendente'?'text-error':'text-on-surface';
      return `<tr class="hover:bg-white/5 transition-colors border-b border-white/5 cursor-pointer" onclick="App.editPayable(${p.id})"><td class="px-lg py-md"><div class="font-bold text-sm text-on-surface">${p.sup}</div><div class="text-xs text-on-surface-variant">${p.desc}</div></td><td class="px-lg py-md text-sm font-data-mono ${dc}">${p.due || '-'}</td><td class="px-lg py-md text-right font-data-mono font-bold">${Fmt.money(p.value)}</td><td class="px-lg py-md"><span class="${sc} px-sm py-1 rounded-full text-[10px] font-bold uppercase">${p.status}</span></td></tr>`;
    }).join('') : `<tr><td colspan="4" class="px-lg py-md text-center text-on-surface-variant text-sm">Nenhuma conta a pagar.</td></tr>`;
    const compBars=f.bars.map(c=>`<div class="flex-1 flex flex-col items-center gap-xs"><div class="w-full rounded-t relative" style="height:80px;background:rgba(255,255,255,.05)"><div class="absolute bottom-0 w-full rounded-t ${c.cur?'bg-primary-container':c.proj?'bg-white/10 border-t-2 border-dashed border-primary-container/40':'bg-primary-container/40'} transition-all" style="height:${c.p}%"></div></div><span class="text-[10px] font-label-caps ${c.cur?'text-primary-container font-bold':'text-on-surface-variant'}">${c.m}</span></div>`).join('');
    return `<div id="finance-report-area"><div class="grid grid-cols-2 lg:grid-cols-4 gap-md mb-md">
      ${UI.finKpi('Fluxo de Caixa',Fmt.money(f.cashFlow),'account_balance_wallet','text-primary-container',`<div class="flex items-center gap-xs text-primary-container text-sm"><span class="material-symbols-outlined text-[14px]">trending_up</span>Atual</div>`)}
      ${UI.finKpi('Receita Mensal',Fmt.money(f.monthlyRevenue),'payments','text-primary-container',`<div class="w-full bg-white/5 h-1 rounded-full"><div class="bg-primary-container h-full" style="width:100%"></div></div><p class="text-xs text-on-surface-variant">Total faturado</p>`)}
      ${UI.finKpi('Despesas',Fmt.money(f.totalExpenses),'receipt_long','text-error',`<div class="w-full bg-white/5 h-1 rounded-full"><div class="bg-error h-full" style="width:100%"></div></div><p class="text-xs text-on-surface-variant">Total de custos</p>`)}
      ${UI.finKpi('Margem Líquida',f.netMargin+'%','monitoring','text-primary-container','<span class="text-xs text-on-surface-variant">Rentabilidade</span>')}
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-md mb-md">
      <div class="glass-panel p-lg rounded-xl border border-white/5 flex flex-col">
        <h3 class="font-h3 text-on-surface mb-lg">Dados de Venda</h3>
        <div class="space-y-md flex-1">${f.salesData.map(t=>`<div class="flex justify-between p-md bg-white/5 rounded-lg"><span class="text-sm text-on-surface-variant">${t.n}</span><span class="font-data-mono font-bold">${Fmt.money(t.v)}</span></div>`).join('')}</div>
        <button class="mt-md w-full border border-primary-container text-primary-container py-sm rounded-lg hover:bg-primary-container/10 transition-all font-bold text-sm" onclick="App.generatePdfReport()">Gerar Relatório em PDF</button>
      </div>
      <div class="lg:col-span-2 glass-panel rounded-xl border border-white/5 overflow-hidden flex flex-col">
        <div class="p-lg border-b border-white/5 flex justify-between items-center"><h3 class="font-h3 text-on-surface">Transações a Receber</h3><button class="btn btn-primary btn-sm" onclick="App.addTransaction()"><span class="material-symbols-outlined text-[16px]">add</span>Nova</button></div>
        <div class="overflow-x-auto"><table class="w-full min-w-[500px]"><thead class="bg-white/5 text-on-surface-variant text-[11px] font-label-caps"><tr><th class="px-lg py-md text-left">Cliente</th><th class="px-lg py-md text-left hidden md:table-cell">Vencimento</th><th class="px-lg py-md text-right">Valor</th><th class="px-lg py-md">Status</th></tr></thead><tbody>${recRows}</tbody></table></div>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-md pb-xl">
      <div class="lg:col-span-2 glass-panel rounded-xl border border-white/5 overflow-hidden flex flex-col">
        <div class="p-lg border-b border-white/5 flex justify-between items-center"><h3 class="font-h3 text-on-surface">Contas a Pagar</h3><button class="btn btn-primary btn-sm" onclick="App.addPayable()"><span class="material-symbols-outlined text-[16px]">add</span>Nova</button></div>
        <div class="overflow-x-auto"><table class="w-full min-w-[500px]"><thead class="bg-white/5 text-on-surface-variant text-[11px] font-label-caps"><tr><th class="px-lg py-md text-left">Fornecedor</th><th class="px-lg py-md text-left hidden md:table-cell">Vencimento</th><th class="px-lg py-md text-right">Valor</th><th class="px-lg py-md">Status</th></tr></thead><tbody>${payRows}</tbody></table></div>
      </div>
      <div class="glass-panel p-lg rounded-xl border border-white/5 flex flex-col justify-between">
        <h3 class="font-h3 text-on-surface mb-md">Análise Comparativa</h3>
        <div class="flex items-end gap-sm flex-1">${compBars}</div>
      </div>
    </div></div>`;
  },

  relatorios() {
    const brands=DB.brands(), vTotal=DB.vehicles().length, s=DB.stats(), k=DB.kpi();
    const totalValue = DB.vehicles().reduce((sum,v) => sum + (v.price||0), 0);
    const avgPrice = vTotal > 0 ? Math.round(totalValue / vTotal) : 0;
    const avgKm = vTotal > 0 ? Math.round(DB.vehicles().reduce((sum,v) => sum + (v.km||0), 0) / vTotal) : 0;
    return `<div class="grid grid-cols-1 md:grid-cols-3 gap-md mb-md">
      ${UI.kpi('Valor Total Estoque',Fmt.moneyShort(totalValue),'Patrimônio','account_balance',true)}
      ${UI.kpi('Preço Médio Veículo',Fmt.moneyShort(avgPrice),'Por unidade','price_check',false)}
      ${UI.kpi('KM Médio Estoque',Fmt.km(avgKm),'Quilometragem','speed',false)}
    </div>
    <div class="glass-panel p-lg rounded-xl border border-white/5 mb-md">
      <h4 class="font-h3 text-on-surface mb-lg">Performance por Marca</h4>
      <div class="space-y-md">${brands.map(b=>{const c=DB.vehicles({brand:b}).length,p=Math.round(c/vTotal*100);return `<div class="flex items-center gap-md"><span class="text-sm font-bold w-36 text-on-surface">${b}</span><div class="flex-1 bg-white/5 h-2 rounded-full overflow-hidden"><div class="bg-primary-container h-full" style="width:${p}%"></div></div><span class="text-primary-container font-data-mono text-sm w-8 text-right">${c}</span></div>`;}).join('')}</div>
    </div>
    <div class="glass-panel p-lg rounded-xl border border-white/5 mb-md">
      <h4 class="font-h3 text-on-surface mb-lg">Status do Estoque</h4>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-md">${[['Total','','#e3e2e2'],['Disponíveis','available','#39ff14'],['Reservados','reserved','#facc15'],['Vendidos','sold','#60a5fa'],['Vitrine','vitrine','#a855f7']].map(([l,st,c])=>{const n=st?DB.vehicles({status:st}).length:vTotal;return `<div class="bg-white/5 p-lg rounded-xl text-center border border-white/5 card-interactive" onclick="App.showStockByStatus('${st}')"><div class="text-h2 font-h2" style="color:${c}">${n}</div><p class="text-on-surface-variant text-sm mt-xs">${l}</p></div>`;}).join('')}</div>
    </div>
    <div id="stock-detail-panel"></div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-md mb-md">
      ${UI.kpi('Clientes Ativos',k.activeClients,'Total CRM','group',false)}
      ${UI.kpi('Em Negociação',k.negotiations,'Ativas','handshake',false)}
      ${UI.kpi('Vendas do Mês',k.monthlyClosed,'Fechadas','emoji_events',true)}
      ${UI.kpi('Test-Drives',k.testDrives,'Agendados','electric_car',false)}
    </div>`;
  },

  vitrine() {
    const cars=DB.vitrineVehicles();
    return `
    <div style="position:fixed;top:20px;right:20px;z-index:9999" class="vitrine-only">
      <button onclick="location.hash='#/dashboard'" class="btn" style="background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);color:#fff;border:1px solid rgba(255,255,255,0.2)">
        <span class="material-symbols-outlined text-[18px]">close</span> Sair da Vitrine
      </button>
    </div>
    <div class="glass-panel p-lg rounded-xl mb-md border border-primary-container/20 bg-primary-container/5 flex flex-wrap justify-between items-center gap-md">
      <div class="text-center w-full"><h3 class="font-h3 text-primary-container" style="font-size:28px">Daniel Veículos — Acervo Premium</h3><p class="text-on-surface-variant text-sm mt-xs">Escolha o seu próximo sonho</p></div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md pb-xl">${cars.length ? cars.map(v=>UI.vehicleCard(v)).join('') : '<div class="col-span-full text-center py-xl text-on-surface-variant">Nenhum veículo em destaque. Adicione veículos com preço acima de R$1M ou status "vitrine".</div>'}</div>`;
  },

  performance() {
    return `<div class="glass-panel p-lg rounded-xl border border-white/5 mb-md">
      <div class="flex justify-between items-center mb-lg">
        <div><h3 class="font-h3 text-on-surface">Desempenho da Equipe</h3><p class="text-sm text-on-surface-variant">Acompanhamento de metas de vendas (Mês Atual)</p></div>
        <button class="btn btn-ghost btn-sm"><span class="material-symbols-outlined text-[16px]">tune</span> Configurar Metas</button>
      </div>
      <div class="space-y-lg">
        ${['João Silva', 'Maria Fernandes', 'Carlos Eduardo'].map((n, i) => {
          const meta = 500000;
          const current = 150000 * (3 - i) + 50000;
          const pct = Math.min(Math.round((current/meta)*100), 100);
          const c = pct >= 100 ? 'bg-primary-container' : pct > 50 ? 'bg-yellow-400' : 'bg-error';
          const ct = pct >= 100 ? 'text-primary-container' : pct > 50 ? 'text-yellow-400' : 'text-error';
          return `<div class="bg-white/5 p-md rounded-lg">
            <div class="flex justify-between mb-xs">
              <span class="font-bold text-sm text-on-surface">${n}</span>
              <span class="text-sm font-data-mono ${ct}">${Fmt.money(current)} <span class="text-on-surface-variant">/ ${Fmt.moneyShort(meta)}</span></span>
            </div>
            <div class="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
              <div class="${c} h-full transition-all" style="width:${pct}%"></div>
            </div>
            <div class="flex justify-between mt-xs">
              <span class="text-[10px] text-on-surface-variant uppercase tracking-widest">Comissão Estimada: <span class="text-on-surface">${Fmt.money(current * 0.015)}</span></span>
              <span class="text-[10px] ${ct} font-bold">${pct}% da Meta</span>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  },

  ged() {
    return `<div class="grid grid-cols-1 md:grid-cols-3 gap-md mb-md">
      <div class="glass-panel p-lg rounded-xl border border-white/5 flex flex-col items-center text-center hover:border-primary-container/30 transition-colors cursor-pointer" onclick="App.toast('Selecione um veículo no Estoque para gerar')">
        <span class="material-symbols-outlined text-[40px] text-primary-container mb-md">assignment</span>
        <h4 class="font-bold text-on-surface mb-xs">Contrato de Consignação</h4>
        <p class="text-xs text-on-surface-variant mb-md">Gera contrato padrão para entrada de veículos de terceiros.</p>
        <button class="btn btn-ghost btn-sm w-full mt-auto">Acessar Modelos</button>
      </div>
      <div class="glass-panel p-lg rounded-xl border border-white/5 flex flex-col items-center text-center hover:border-blue-400/30 transition-colors cursor-pointer" onclick="App.toast('Selecione um cliente no CRM para gerar')">
        <span class="material-symbols-outlined text-[40px] text-blue-400 mb-md">drive_eta</span>
        <h4 class="font-bold text-on-surface mb-xs">Termo de Test-Drive</h4>
        <p class="text-xs text-on-surface-variant mb-md">Termo de responsabilidade civil e multas para test-drives.</p>
        <button class="btn btn-ghost btn-sm w-full mt-auto">Acessar Modelos</button>
      </div>
      <div class="glass-panel p-lg rounded-xl border border-white/5 flex flex-col items-center text-center hover:border-yellow-400/30 transition-colors cursor-pointer" onclick="App.toast('Selecione um veículo vendido para gerar')">
        <span class="material-symbols-outlined text-[40px] text-yellow-400 mb-md">receipt_long</span>
        <h4 class="font-bold text-on-surface mb-xs">Recibo de Compra e Venda</h4>
        <p class="text-xs text-on-surface-variant mb-md">Documento oficial de transferência de responsabilidade.</p>
        <button class="btn btn-ghost btn-sm w-full mt-auto">Acessar Modelos</button>
      </div>
    </div>
    <div class="glass-panel p-lg rounded-xl border border-white/5">
      <h3 class="font-h3 text-on-surface mb-md">Documentos Recentes</h3>
      <div class="text-center py-xl text-on-surface-variant text-sm">Nenhum documento gerado recentemente.</div>
    </div>`;
  },

  marketing() {
    const leads = DB.kpi().newLeads || 45;
    const invest = 2500;
    const cpl = invest / leads;
    return `<div class="grid grid-cols-1 md:grid-cols-3 gap-md mb-md">
      ${UI.kpi('Investimento (Mês)', Fmt.money(invest), 'Ads + Portais', 'payments', false)}
      ${UI.kpi('Leads Gerados', leads, 'Total CRM', 'group_add', false)}
      ${UI.kpi('Custo Por Lead (CPL)', Fmt.money(cpl), 'Eficiência', 'troubleshoot', true)}
    </div>
    <div class="glass-panel p-lg rounded-xl border border-white/5 flex flex-col lg:flex-row gap-lg">
      <div class="flex-1">
        <h3 class="font-h3 text-on-surface mb-md">Lançar Despesa de Marketing</h3>
        <form class="space-y-md" onsubmit="event.preventDefault();App.toast('Despesa registrada com sucesso!');this.reset()">
          <div class="form-group mb-0"><label class="form-label">Canal (Ex: Webmotors, Instagram)</label><input class="neon-input" type="text" required></div>
          <div class="form-group mb-0"><label class="form-label">Valor Investido (R$)</label><input class="neon-input" type="number" step="0.01" required></div>
          <button type="submit" class="btn btn-primary w-full">Registrar Investimento</button>
        </form>
      </div>
      <div class="flex-1 bg-white/5 p-lg rounded-lg border border-white/5">
        <h3 class="font-h3 text-on-surface mb-md">Retorno Sobre Investimento (ROI)</h3>
        <div class="space-y-sm">
          <div class="flex justify-between items-center border-b border-white/5 py-sm"><span class="text-on-surface-variant text-sm">Receita Atribuída ao Marketing</span><span class="font-data-mono font-bold text-primary-container">${Fmt.money(180000)}</span></div>
          <div class="flex justify-between items-center border-b border-white/5 py-sm"><span class="text-on-surface-variant text-sm">Custo por Aquisição (CPA)</span><span class="font-data-mono font-bold">${Fmt.money(invest/3)}</span></div>
          <div class="flex justify-between items-center py-sm"><span class="text-on-surface-variant text-sm">ROI Geral</span><span class="font-data-mono font-bold text-primary-container">7,200%</span></div>
        </div>
      </div>
    </div>`;
  },

  agenda() {
    return `<div class="glass-panel p-lg rounded-xl border border-white/5">
      <div class="flex justify-between items-center mb-lg">
        <h3 class="font-h3 text-on-surface">Agenda Estratégica da Semana</h3>
        <button class="btn btn-primary btn-sm"><span class="material-symbols-outlined text-[16px]">add</span>Novo Compromisso</button>
      </div>
      <div class="space-y-md">
        <div class="flex gap-md p-md bg-primary-container/10 border border-primary-container/30 rounded-lg items-center">
          <div class="bg-primary-container text-on-primary rounded p-sm text-center min-w-[60px]">
            <p class="text-[10px] font-bold uppercase">Hoje</p><p class="text-xl font-bold">14</p>
          </div>
          <div class="flex-1">
            <h4 class="font-bold text-primary-container text-sm">Entrega de Veículo: Porsche 911</h4>
            <p class="text-xs text-on-surface-variant">Cliente: Roberto Almeida — Preparação de laço e champagne.</p>
          </div>
          <button class="btn btn-ghost btn-sm">Detalhes</button>
        </div>
        <div class="flex gap-md p-md bg-white/5 border border-white/5 rounded-lg items-center">
          <div class="bg-surface-container-highest text-on-surface rounded p-sm text-center min-w-[60px]">
            <p class="text-[10px] font-bold uppercase">Amanhã</p><p class="text-xl font-bold">15</p>
          </div>
          <div class="flex-1">
            <h4 class="font-bold text-on-surface text-sm">Test-Drive: BMW X6</h4>
            <p class="text-xs text-on-surface-variant">Cliente: Juliana Costa — Veículo precisa estar lavado e abastecido.</p>
          </div>
          <button class="btn btn-ghost btn-sm">Detalhes</button>
        </div>
        <div class="flex gap-md p-md bg-white/5 border border-white/5 rounded-lg items-center">
          <div class="bg-surface-container-highest text-on-surface rounded p-sm text-center min-w-[60px]">
            <p class="text-[10px] font-bold uppercase">Sex</p><p class="text-xl font-bold">17</p>
          </div>
          <div class="flex-1">
            <h4 class="font-bold text-on-surface text-sm">Reunião de Alinhamento de Vendas</h4>
            <p class="text-xs text-on-surface-variant">Toda a equipe — Revisão das metas da segunda quinzena.</p>
          </div>
          <button class="btn btn-ghost btn-sm">Detalhes</button>
        </div>
      </div>
    </div>`;
  },

  financiamento() {
    return `<div class="grid grid-cols-1 lg:grid-cols-2 gap-md mb-md">
      <!-- Simulador de Financiamento -->
      <div class="glass-panel p-lg rounded-xl border border-white/5 flex flex-col">
        <div class="flex justify-between items-center mb-md">
          <h3 class="font-h3 text-on-surface">Simulador de Parcelas</h3>
          <span class="material-symbols-outlined text-primary-container">calculate</span>
        </div>
        <p class="text-sm text-on-surface-variant mb-lg">Calcule rapidamente as parcelas na mesa de negociação para aumentar a conversão.</p>
        <div class="space-y-md flex-1">
          <div class="form-group mb-0"><label class="form-label">Valor do Veículo (R$)</label><input class="neon-input" type="number" id="sim-valor" value="150000"></div>
          <div class="form-group mb-0"><label class="form-label">Valor da Entrada (R$)</label><input class="neon-input" type="number" id="sim-entrada" value="50000"></div>
          <div class="grid grid-cols-2 gap-md">
            <div class="form-group mb-0"><label class="form-label">Taxa Mensal (%)</label><input class="neon-input" type="number" step="0.01" id="sim-taxa" value="1.59"></div>
            <div class="form-group mb-0"><label class="form-label">Prazo (Meses)</label>
              <select class="neon-input" id="sim-prazo">
                <option value="12">12x</option><option value="24">24x</option><option value="36">36x</option><option value="48" selected>48x</option><option value="60">60x</option>
              </select>
            </div>
          </div>
          <button class="btn btn-primary w-full mt-md" onclick="
            const v = document.getElementById('sim-valor').value;
            const e = document.getElementById('sim-entrada').value;
            const t = document.getElementById('sim-taxa').value / 100;
            const p = document.getElementById('sim-prazo').value;
            const saldo = v - e;
            const parcela = (saldo * t) / (1 - Math.pow(1 + t, -p));
            document.getElementById('sim-resultado').innerHTML = '<div class=&quot;text-on-surface-variant text-sm mb-xs&quot;>Valor da Parcela Estimada:</div><div class=&quot;text-h2 font-h2 text-primary-container&quot;>' + Fmt.money(parcela) + '</div>';
          ">Simular Parcelas</button>
        </div>
        <div id="sim-resultado" class="mt-lg p-md bg-white/5 rounded-lg border border-white/5 text-center min-h-[90px] flex flex-col justify-center">
          <span class="text-on-surface-variant text-sm">Insira os dados e simule</span>
        </div>
      </div>

      <!-- Calculadora de Margem / Troca -->
      <div class="glass-panel p-lg rounded-xl border border-white/5 flex flex-col">
        <div class="flex justify-between items-center mb-md">
          <h3 class="font-h3 text-on-surface">Análise de Troca (Carro na Negociação)</h3>
          <span class="material-symbols-outlined text-yellow-400">swap_horiz</span>
        </div>
        <p class="text-sm text-on-surface-variant mb-lg">Avalie na hora se pegar o carro do cliente na troca trará lucro real para a loja.</p>
        <div class="space-y-md flex-1">
          <div class="form-group mb-0"><label class="form-label">Valor FIPE do Usado (R$)</label><input class="neon-input" type="number" id="troca-fipe" value="80000"></div>
          <div class="form-group mb-0"><label class="form-label">Valor de Avaliação/Compra (R$)</label><input class="neon-input" type="number" id="troca-compra" value="65000"></div>
          <div class="form-group mb-0"><label class="form-label">Custo Estimado de Reparo/Preparação (R$)</label><input class="neon-input" type="number" id="troca-reparo" value="2500"></div>
          <button class="btn btn-ghost w-full border border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10 mt-md" onclick="
            const f = document.getElementById('troca-fipe').value;
            const c = document.getElementById('troca-compra').value;
            const r = document.getElementById('troca-reparo').value;
            const lucroEstimado = f - c - r;
            const margem = (lucroEstimado / f) * 100;
            const cor = lucroEstimado > 0 ? 'text-primary-container' : 'text-error';
            document.getElementById('troca-resultado').innerHTML = '<div class=&quot;flex justify-between&quot;><span class=&quot;text-on-surface-variant&quot;>Lucro Estimado na Revenda:</span><span class=&quot;font-data-mono font-bold ' + cor + '&quot;>' + Fmt.money(lucroEstimado) + '</span></div><div class=&quot;flex justify-between mt-xs&quot;><span class=&quot;text-on-surface-variant&quot;>Margem (% da FIPE):</span><span class=&quot;font-data-mono font-bold ' + cor + '&quot;>' + margem.toFixed(1) + '%</span></div>';
          ">Analisar Viabilidade</button>
        </div>
        <div id="troca-resultado" class="mt-lg p-md bg-white/5 rounded-lg border border-white/5 min-h-[90px] flex flex-col justify-center">
           <span class="text-on-surface-variant text-sm text-center">Calcule a margem do veículo de entrada</span>
        </div>
      </div>
    </div>
    
    <!-- Esteira de Aprovação de Crédito -->
    <div class="glass-panel p-lg rounded-xl border border-white/5">
      <div class="flex justify-between items-center mb-lg">
        <div><h3 class="font-h3 text-on-surface">Esteira de Crédito (Bancos)</h3><p class="text-sm text-on-surface-variant">Acompanhe o status do financiamento dos clientes</p></div>
        <button class="btn btn-primary btn-sm"><span class="material-symbols-outlined text-[16px]">add</span>Nova Ficha</button>
      </div>
      <div class="overflow-x-auto pb-sm custom-scroll">
        <div class="flex gap-md min-w-[800px]">
          <!-- Coluna 1: Análise -->
          <div class="flex-1 bg-surface-container-low rounded-lg p-md border border-white/5">
            <h4 class="font-bold text-on-surface-variant text-sm mb-md flex justify-between">EM ANÁLISE <span class="bg-white/10 px-2 rounded-full text-xs">2</span></h4>
            <div class="space-y-sm">
              <div class="bg-surface-container-high p-sm rounded border border-white/5 card-interactive relative group">
                <div class="flex justify-between items-start">
                  <p class="font-bold text-sm text-on-surface">Marcos Silva</p>
                  <button class="text-on-surface-variant hover:text-primary-container opacity-0 group-hover:opacity-100 transition-opacity" onclick="App.toast('Abrir edição/exclusão de crédito')" title="Editar Ficha"><span class="material-symbols-outlined text-[16px]">edit</span></button>
                </div>
                <p class="text-xs text-on-surface-variant mb-sm">BMW 320i — R$ 250.000</p>
                <div class="flex gap-xs"><span class="bg-yellow-500/20 text-yellow-400 text-[9px] px-2 py-0.5 rounded uppercase font-bold">Santander</span><span class="bg-yellow-500/20 text-yellow-400 text-[9px] px-2 py-0.5 rounded uppercase font-bold">Itaú</span></div>
              </div>
              <div class="bg-surface-container-high p-sm rounded border border-white/5 card-interactive relative group">
                <div class="flex justify-between items-start">
                  <p class="font-bold text-sm text-on-surface">Ana Paula</p>
                  <button class="text-on-surface-variant hover:text-primary-container opacity-0 group-hover:opacity-100 transition-opacity" onclick="App.toast('Abrir edição/exclusão de crédito')" title="Editar Ficha"><span class="material-symbols-outlined text-[16px]">edit</span></button>
                </div>
                <p class="text-xs text-on-surface-variant mb-sm">Jeep Compass — R$ 140.000</p>
                <div class="flex gap-xs"><span class="bg-yellow-500/20 text-yellow-400 text-[9px] px-2 py-0.5 rounded uppercase font-bold">BV Financeira</span></div>
              </div>
            </div>
          </div>
          <!-- Coluna 2: Aprovado -->
          <div class="flex-1 bg-primary-container/5 rounded-lg p-md border border-primary-container/20">
            <h4 class="font-bold text-primary-container text-sm mb-md flex justify-between">APROVADOS <span class="bg-primary-container/20 px-2 rounded-full text-xs">1</span></h4>
            <div class="space-y-sm">
              <div class="bg-surface-container-high p-sm rounded border border-primary-container/30 card-interactive relative group">
                <div class="flex justify-between items-start">
                  <p class="font-bold text-sm text-on-surface">Roberto Costa</p>
                  <button class="text-on-surface-variant hover:text-primary-container opacity-0 group-hover:opacity-100 transition-opacity" onclick="App.toast('Abrir edição/exclusão de crédito')" title="Editar Ficha"><span class="material-symbols-outlined text-[16px]">edit</span></button>
                </div>
                <p class="text-xs text-on-surface-variant mb-sm">Audi Q3 — R$ 190.000</p>
                <p class="text-[10px] text-on-surface-variant mb-xs">Taxa aprovada: 1.49%</p>
                <div class="flex gap-xs"><span class="bg-primary-container/20 text-primary-container text-[9px] px-2 py-0.5 rounded uppercase font-bold">Safra</span></div>
              </div>
            </div>
          </div>
          <!-- Coluna 3: Recusado -->
          <div class="flex-1 bg-error/5 rounded-lg p-md border border-error/20">
            <h4 class="font-bold text-error text-sm mb-md flex justify-between">RECUSADOS / PENDÊNCIAS <span class="bg-error/20 px-2 rounded-full text-xs">1</span></h4>
            <div class="space-y-sm">
              <div class="bg-surface-container-high p-sm rounded border border-error/30 card-interactive relative group">
                <div class="flex justify-between items-start">
                  <p class="font-bold text-sm text-on-surface">Carlos Eduardo</p>
                  <button class="text-on-surface-variant hover:text-primary-container opacity-0 group-hover:opacity-100 transition-opacity" onclick="App.toast('Abrir edição/exclusão de crédito')" title="Editar Ficha"><span class="material-symbols-outlined text-[16px]">edit</span></button>
                </div>
                <p class="text-xs text-on-surface-variant mb-sm">Honda Civic — R$ 120.000</p>
                <p class="text-[10px] text-error mb-xs">Motivo: Score Baixo</p>
                <div class="flex gap-xs"><span class="bg-error/20 text-error text-[9px] px-2 py-0.5 rounded uppercase font-bold">Itaú</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }
};
