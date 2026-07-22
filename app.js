const STORAGE_KEY = 'tc_dashboard_mobile_data_v1'; // 旧localStorageからの移行専用
const DB_NAME = 'trading_card_dashboard';
const DB_VERSION = 1;
const STORE_NAME = 'dashboard';
const STATE_ID = 'current';

function openDashboardDB(){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,DB_VERSION);
    request.onupgradeneeded=()=>{
      const db=request.result;
      if(!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error || new Error('IndexedDBを開けませんでした'));
  });
}

async function idbGet(key){
  const db=await openDashboardDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE_NAME,'readonly');
    const request=tx.objectStore(STORE_NAME).get(key);
    request.onsuccess=()=>resolve(request.result ?? null);
    request.onerror=()=>reject(request.error || new Error('保存データを読み込めませんでした'));
    tx.oncomplete=()=>db.close();
  });
}

async function idbSet(key,value){
  const db=await openDashboardDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE_NAME,'readwrite');
    tx.objectStore(STORE_NAME).put(value,key);
    tx.oncomplete=()=>{ db.close(); resolve(); };
    tx.onerror=()=>{ db.close(); reject(tx.error || new Error('データを保存できませんでした')); };
    tx.onabort=()=>{ db.close(); reject(tx.error || new Error('データ保存が中断されました')); };
  });
}


const els = {
  importBtn: document.getElementById('importBtn'),
  emptyImportBtn: document.getElementById('emptyImportBtn'),
  fileInput: document.getElementById('fileInput'),
  emptyState: document.getElementById('emptyState'),
  app: document.getElementById('app'),
  totalAsset: document.getElementById('totalAsset'),
  lastUpdated: document.getElementById('lastUpdated'),
  goalPercent: document.getElementById('goalPercent'),
  goalBar: document.getElementById('goalBar'),
  goalText: document.getElementById('goalText'),
  profitValue: document.getElementById('profitValue'),
  profitRate: document.getElementById('profitRate'),
  totalQty: document.getElementById('totalQty'),
  favoriteCount: document.getElementById('favoriteCount'),
  dailyChange: document.getElementById('dailyChange'),
  dailyChangeRate: document.getElementById('dailyChangeRate'),
  largestHolding: document.getElementById('largestHolding'),
  largestHoldingValue: document.getElementById('largestHoldingValue'),
  assetRanking: document.getElementById('assetRanking'),
  moversList: document.getElementById('moversList'),
  allocationList: document.getElementById('allocationList'),
  portfolioChart: document.getElementById('portfolioChart'),
  portfolioPeriod: document.getElementById('portfolioPeriod'),
  portfolioSummary: document.getElementById('portfolioSummary'),
  profitRanking: document.getElementById('profitRanking'),
  lossRanking: document.getElementById('lossRanking'),
  decisionSummary: document.getElementById('decisionSummary'),
  sellCandidates: document.getElementById('sellCandidates'),
  analysisMemo: document.getElementById('analysisMemo'),
  searchInput: document.getElementById('searchInput'),
  typeFilter: document.getElementById('typeFilter'),
  sortSelect: document.getElementById('sortSelect'),
  favoriteOnly: document.getElementById('favoriteOnly'),
  resultCount: document.getElementById('resultCount'),
  productList: document.getElementById('productList'),
  dialog: document.getElementById('detailDialog'),
  closeDialog: document.getElementById('closeDialog'),
  detailImage: document.getElementById('detailImage'),
  detailName: document.getElementById('detailName'),
  detailMeta: document.getElementById('detailMeta'),
  detailStats: document.getElementById('detailStats'),
  historySection: document.getElementById('historySection'),
  priceChart: document.getElementById('priceChart'),
  historySummary: document.getElementById('historySummary'),
  detailMemo: document.getElementById('detailMemo'),
  detailLink: document.getElementById('detailLink')
};

let state = null;

let resolveReady;
const ready = new Promise(resolve => { resolveReady = resolve; });

window.tcDashboard = {
  getState: () => state,
  setState: async (nextState) => {
    const normalized = normalize(nextState);
    await idbSet(STATE_ID, normalized);
    state = normalized;
    render();
    return state;
  },
  clearState: async () => {
    await idbSet(STATE_ID, null);
    state = null;
    render();
  },
  ready,
  render: () => render()
};

const yen = n => new Intl.NumberFormat('ja-JP', {
  style:'currency', currency:'JPY', maximumFractionDigits:0
}).format(Number(n) || 0);

const pct = n => `${(Number(n) || 0).toFixed(1)}%`;

function normalize(raw){
  const source = raw && raw.state ? raw.state : raw;
  if(!source || !Array.isArray(source.products)){
    throw new Error('products配列が見つかりません');
  }
  return {
    settings: source.settings || {},
    products: source.products || [],
    history: source.history || [],
    sales: source.sales || [],
    portfolioSnapshots: source.portfolioSnapshots || [],
    images: source.images || {},
    exportedAt: source.exportedAt || null,
    importedAt: new Date().toISOString()
  };
}

function productValues(p){
  const qty = Number(p.qty) || 0;
  const current = Number(p.currentPrice) || 0;
  const purchase = Number(
    p.cost ?? p.purchasePrice ?? p.buyPrice ?? p.costPrice ?? p.unitCost ?? 0
  ) || 0;
  const asset = current * qty;
  const cost = purchase * qty;
  const profit = asset - cost;
  const rate = cost ? profit / cost * 100 : 0;
  return {qty,current,purchase,asset,cost,profit,rate};
}

function getLatestDate(){
  const dates = [];
  for(const h of state.history || []){
    const d = h.at || h.date || h.createdAt || h.timestamp;
    if(d) dates.push(new Date(d));
  }
  if(state.exportedAt) dates.push(new Date(state.exportedAt));
  dates.push(new Date(state.importedAt));
  const latest = dates.filter(d=>!isNaN(d)).sort((a,b)=>b-a)[0];
  return latest ? latest.toLocaleString('ja-JP') : '—';
}

function render(){
  if(!state){
    els.emptyState.hidden = false;
    els.app.hidden = true;
    return;
  }
  els.emptyState.hidden = true;
  els.app.hidden = false;

  const totals = state.products.reduce((a,p)=>{
    const v = productValues(p);
    a.asset += v.asset;
    a.cost += v.cost;
    a.qty += v.qty;
    if(p.favorite) a.favorites++;
    return a;
  }, {asset:0,cost:0,qty:0,favorites:0});

  const profit = totals.asset - totals.cost;
  const rate = totals.cost ? profit / totals.cost * 100 : 0;
  const goal = Number(state.settings.goalAmount) || 0;
  const goalRate = goal ? totals.asset / goal * 100 : 0;

  els.totalAsset.textContent = yen(totals.asset);
  els.lastUpdated.textContent = `最終読込 ${getLatestDate()}`;
  els.profitValue.textContent = yen(profit);
  els.profitRate.textContent = pct(rate);
  els.totalQty.textContent = totals.qty.toLocaleString('ja-JP');
  els.favoriteCount.textContent = totals.favorites.toLocaleString('ja-JP');

  setSignClass(els.profitValue, profit);
  setSignClass(els.profitRate, rate);

  els.goalPercent.textContent = pct(Math.min(goalRate,999));
  els.goalBar.style.width = `${Math.min(goalRate,100)}%`;
  els.goalText.textContent = goal ? `目標 ${yen(goal)}` : '目標未設定';

  renderInsights(totals);
  renderPortfolioChart(totals);
  renderAdvancedAnalysis(totals);
  populateTypes();
  renderProducts();
}

function renderInsights(totals){
  const snapshots = [...(state.portfolioSnapshots || [])]
    .filter(s => Number.isFinite(Number(s.gross)) && (s.at || s.date))
    .sort((a,b)=>new Date(a.at || a.date)-new Date(b.at || b.date));
  if(snapshots.length >= 2){
    const latest=snapshots[snapshots.length-1];
    let previous=snapshots[snapshots.length-2];
    for(let i=snapshots.length-2;i>=0;i--){
      if(String(snapshots[i].date) !== String(latest.date)){ previous=snapshots[i]; break; }
    }
    const change=Number(latest.gross)-Number(previous.gross);
    const rate=Number(previous.gross) ? change/Number(previous.gross)*100 : 0;
    els.dailyChange.textContent=(change>=0?'+':'')+yen(change);
    els.dailyChangeRate.textContent=`${previous.date} 比 ${(rate>=0?'+':'')}${pct(rate)}`;
    setSignClass(els.dailyChange,change);
    setSignClass(els.dailyChangeRate,rate);
  }else{
    els.dailyChange.textContent='—';
    els.dailyChangeRate.textContent='比較データなし';
  }

  const ranked=state.products.map(p=>({p,v:productValues(p)})).sort((a,b)=>b.v.asset-a.v.asset);
  const largest=ranked[0];
  els.largestHolding.textContent=largest?.p?.name || '—';
  els.largestHoldingValue.textContent=largest ? `${yen(largest.v.asset)}・構成比 ${totals.asset ? (largest.v.asset/totals.asset*100).toFixed(1):0}%` : '—';

  els.assetRanking.innerHTML=ranked.slice(0,5).map((x,i)=>rankingRow(x.p,i+1,yen(x.v.asset),`在庫 ${x.v.qty}`)).join('') || '<p class="empty-mini">データがありません</p>';

  const movers=state.products.map(p=>{
    const hs=(state.history||[]).filter(h=>String(h.productId)===String(p.id) && Number.isFinite(Number(h.price)))
      .map(h=>({price:Number(h.price),date:new Date(h.at||h.date||h.createdAt||h.timestamp)}))
      .filter(x=>!isNaN(x.date)).sort((a,b)=>a.date-b.date);
    if(hs.length<2) return null;
    const latest=hs[hs.length-1], prev=hs[hs.length-2];
    const diff=latest.price-prev.price;
    const rate=prev.price ? diff/prev.price*100 : 0;
    return {p,diff,rate,latest:latest.price};
  }).filter(Boolean).sort((a,b)=>Math.abs(b.rate)-Math.abs(a.rate)).slice(0,5);
  els.moversList.innerHTML=movers.map((x,i)=>rankingRow(x.p,i+1,`${x.diff>=0?'+':''}${yen(x.diff)}`,`${x.rate>=0?'+':''}${pct(x.rate)}`,x.diff)).join('') || '<p class="empty-mini">価格履歴が2件以上ある商品がありません</p>';

  const groups={};
  for(const p of state.products){
    const key=p.cardType || '未分類';
    groups[key]=(groups[key]||0)+productValues(p).asset;
  }
  const alloc=Object.entries(groups).sort((a,b)=>b[1]-a[1]);
  els.allocationList.innerHTML=alloc.map(([name,value])=>{
    const share=totals.asset ? value/totals.asset*100 : 0;
    return `<div><div class="allocation-head"><strong>${escapeHtml(name)}</strong><span>${yen(value)}・${share.toFixed(1)}%</span></div><div class="allocation-bar"><div class="allocation-fill" style="width:${Math.min(share,100)}%"></div></div></div>`;
  }).join('') || '<p class="empty-mini">データがありません</p>';
}

function snapshotPoints(){
  const points = (state.portfolioSnapshots || [])
    .map(s=>({
      date:new Date(s.at || s.date),
      value:Number(s.gross ?? s.asset ?? s.totalAsset ?? s.value)
    }))
    .filter(x=>!isNaN(x.date) && Number.isFinite(x.value))
    .sort((a,b)=>a.date-b.date);

  const byDay=new Map();
  for(const p of points){
    byDay.set(p.date.toISOString().slice(0,10),p);
  }
  return [...byDay.values()].sort((a,b)=>a.date-b.date);
}

function renderPortfolioChart(totals){
  let points=snapshotPoints();
  if(!points.length){
    const historyDates=(state.history||[]).map(h=>new Date(h.at||h.date||h.createdAt||h.timestamp)).filter(d=>!isNaN(d));
    const date=historyDates.sort((a,b)=>a-b).at(-1) || new Date();
    points=[{date,value:totals.asset}];
  }

  const canvas=els.portfolioChart;
  const dpr=Math.max(1,window.devicePixelRatio||1);
  const cssWidth=Math.max(280,canvas.parentElement.clientWidth-36||320);
  const cssHeight=240;
  canvas.style.width=`${cssWidth}px`; canvas.style.height=`${cssHeight}px`;
  canvas.width=Math.round(cssWidth*dpr); canvas.height=Math.round(cssHeight*dpr);
  const ctx=canvas.getContext('2d');
  ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,cssWidth,cssHeight);

  const pad={l:62,r:16,t:18,b:34}, w=cssWidth-pad.l-pad.r, h=cssHeight-pad.t-pad.b;
  const vals=points.map(x=>x.value); let min=Math.min(...vals), max=Math.max(...vals);
  if(min===max){min*=.95;max*=1.05;if(min===max){min=0;max=1}}
  const range=max-min; min-=range*.08; max+=range*.08;
  const x=i=>pad.l+(points.length===1?w/2:i/(points.length-1)*w);
  const y=v=>pad.t+(max-v)/(max-min)*h;

  ctx.strokeStyle='#e5e7eb';ctx.fillStyle='#6b7280';ctx.font='11px sans-serif';ctx.lineWidth=1;
  for(let i=0;i<4;i++){const yy=pad.t+i/3*h;const val=max-i/3*(max-min);ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(cssWidth-pad.r,yy);ctx.stroke();ctx.fillText(`${Math.round(val/10000)}万`,5,yy+4)}
  ctx.strokeStyle='#111827';ctx.lineWidth=2.5;ctx.beginPath();
  points.forEach((p,i)=>{const xx=x(i),yy=y(p.value);i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)});ctx.stroke();
  ctx.fillStyle='#111827';points.forEach((p,i)=>{ctx.beginPath();ctx.arc(x(i),y(p.value),3,0,Math.PI*2);ctx.fill()});
  if(points.length>1){ctx.fillStyle='#6b7280';ctx.fillText(points[0].date.toLocaleDateString('ja-JP'),pad.l,cssHeight-10);const t=points.at(-1).date.toLocaleDateString('ja-JP');ctx.fillText(t,cssWidth-pad.r-ctx.measureText(t).width,cssHeight-10)}

  const first=points[0],last=points.at(-1),diff=last.value-first.value,rate=first.value?diff/first.value*100:0;
  els.portfolioPeriod.textContent=points.length>1?`${points.length}日分`:'現在値';
  els.portfolioSummary.textContent=points.length>1?`${first.date.toLocaleDateString('ja-JP')} ${yen(first.value)} → ${last.date.toLocaleDateString('ja-JP')} ${yen(last.value)}（${diff>=0?'+':''}${yen(diff)} / ${rate>=0?'+':''}${pct(rate)}）`:'資産スナップショットが増えると推移を表示します。';
  setSignClass(els.portfolioSummary,diff);
}

function renderAdvancedAnalysis(totals){
  const rows=state.products.map(p=>({p,v:productValues(p)}));
  const profits=[...rows].filter(x=>x.v.profit>0).sort((a,b)=>b.v.profit-a.v.profit).slice(0,5);
  const losses=[...rows].filter(x=>x.v.profit<0).sort((a,b)=>a.v.profit-b.v.profit).slice(0,5);
  els.profitRanking.innerHTML=profits.map((x,i)=>rankingRow(x.p,i+1,`+${yen(x.v.profit)}`,`利益率 +${pct(x.v.rate)}`,x.v.profit)).join('')||'<p class="empty-mini">利益商品はありません</p>';
  els.lossRanking.innerHTML=losses.map((x,i)=>rankingRow(x.p,i+1,yen(x.v.profit),`利益率 ${pct(x.v.rate)}`,x.v.profit)).join('')||'<p class="empty-mini">含み損商品はありません</p>';

  const candidates=rows.filter(x=>x.v.qty>=2 && x.v.rate>=100).sort((a,b)=>b.v.rate-a.v.rate).slice(0,8);
  const watch=rows.filter(x=>x.v.profit<0).length;
  const strong=rows.filter(x=>x.v.rate>=200).length;
  els.decisionSummary.innerHTML=`<div><strong>${candidates.length}</strong><span>売却候補</span></div><div><strong>${strong}</strong><span>利益率200%以上</span></div><div><strong>${watch}</strong><span>含み損商品</span></div>`;
  els.sellCandidates.innerHTML=candidates.length?candidates.map(x=>`<button class="candidate" data-rank-id="${escapeAttr(String(x.p.id))}"><span class="candidate-badge">候補</span><div><strong>${escapeHtml(x.p.name||'名称未設定')}</strong><span>在庫 ${x.v.qty}・利益率 +${pct(x.v.rate)}</span></div><b>+${yen(x.v.profit)}</b></button>`).join(''):'<p class="empty-mini">現在の基準（在庫2点以上・利益率100%以上）に該当する商品はありません。</p>';

  const top=rows.sort((a,b)=>b.v.asset-a.v.asset)[0];
  const concentration=top&&totals.asset?top.v.asset/totals.asset*100:0;
  const avgRate=rows.length?rows.reduce((a,x)=>a+x.v.rate,0)/rows.length:0;
  const movers=rows.map(x=>{const hs=(state.history||[]).filter(h=>String(h.productId)===String(x.p.id)&&Number.isFinite(Number(h.price))).sort((a,b)=>new Date(a.at||a.date)-new Date(b.at||b.date));if(hs.length<2)return null;const a=Number(hs.at(-2).price),b=Number(hs.at(-1).price);return {...x,change:a?(b-a)/a*100:0}}).filter(Boolean).sort((a,b)=>b.change-a.change);
  const notes=[];
  notes.push(`総資産は ${yen(totals.asset)}、評価損益は ${yen(totals.asset-totals.cost)} です。`);
  if(top) notes.push(`最大保有は「${top.p.name}」で、総資産の ${concentration.toFixed(1)}% を占めます。${concentration>=30?'集中度が高めです。':''}`);
  notes.push(`商品別の平均利益率は ${pct(avgRate)}、含み損の商品は ${watch}件です。`);
  if(movers[0]) notes.push(`直近で最も上昇率が高いのは「${movers[0].p.name}」の ${movers[0].change>=0?'+':''}${pct(movers[0].change)} です。`);
  if(candidates[0]) notes.push(`売却候補の最上位は「${candidates[0].p.name}」です。在庫 ${candidates[0].v.qty}、利益率 +${pct(candidates[0].v.rate)} です。`);
  els.analysisMemo.innerHTML=notes.map(n=>`<p>${escapeHtml(n)}</p>`).join('');
}

function rankingRow(p,rank,value,sub,signValue=null){
  const image=imageFor(p);
  const signClass=signValue===null?'':signValue>0?'positive':signValue<0?'negative':'';
  return `<div class="rank-row" role="button" tabindex="0" data-rank-id="${escapeAttr(String(p.id))}">
    <span class="rank-num">${rank}</span>
    ${image?`<img class="rank-thumb" src="${escapeAttr(image)}" alt="">`:`<div class="rank-thumb placeholder">🃏</div>`}
    <div class="rank-main"><strong>${escapeHtml(p.name||'名称未設定')}</strong><span>${escapeHtml(p.category||'未分類')}</span></div>
    <div class="rank-value ${signClass}">${value}<span>${sub}</span></div>
  </div>`;
}

function setSignClass(el, value){
  el.classList.remove('positive','negative');
  if(value > 0) el.classList.add('positive');
  if(value < 0) el.classList.add('negative');
}

function populateTypes(){
  const current = els.typeFilter.value;
  const types = [...new Set(state.products.map(p=>p.cardType).filter(Boolean))].sort();
  els.typeFilter.innerHTML = '<option value="">すべてのカード</option>' +
    types.map(t=>`<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
  els.typeFilter.value = types.includes(current) ? current : '';
}

function imageFor(p){
  return p.image || p.imageData || p.thumbnail || state?.images?.[p.id] || '';
}

function renderProducts(){
  const q = els.searchInput.value.trim().toLowerCase();
  const type = els.typeFilter.value;
  const favoriteOnly = els.favoriteOnly.checked;
  const sort = els.sortSelect.value;

  let items = state.products.filter(p=>{
    const name = String(p.name || '').toLowerCase();
    return (!q || name.includes(q)) &&
      (!type || p.cardType === type) &&
      (!favoriteOnly || !!p.favorite);
  });

  items.sort((a,b)=>{
    const av = productValues(a), bv = productValues(b);
    if(sort === 'asset-desc') return bv.asset - av.asset;
    if(sort === 'profit-desc') return bv.profit - av.profit;
    if(sort === 'rate-desc') return bv.rate - av.rate;
    return String(a.name || '').localeCompare(String(b.name || ''),'ja');
  });

  els.resultCount.textContent = `${items.length}件`;
  els.productList.innerHTML = items.length ? items.map((p)=>{
    const v = productValues(p);
    const image = imageFor(p);
    return `<button class="product" data-id="${escapeAttr(String(p.id ?? state.products.indexOf(p)))}">
      ${image
        ? `<img class="thumb" src="${escapeAttr(image)}" alt="">`
        : `<div class="thumb placeholder">🃏</div>`}
      <div>
        <h3>${p.favorite ? '★ ' : ''}${escapeHtml(p.name || '名称未設定')}</h3>
        <div class="meta">${escapeHtml(p.cardType || '未分類')} / ${escapeHtml(p.category || '未分類')}・在庫 ${v.qty}</div>
      </div>
      <div class="price">
        <strong>${yen(v.asset)}</strong>
        <span class="${v.profit>0?'positive':v.profit<0?'negative':''}">${yen(v.profit)}</span>
      </div>
    </button>`;
  }).join('') : '<div class="card" style="padding:20px;text-align:center;color:#6b7280">該当商品はありません</div>';

  document.querySelectorAll('.product').forEach(btn=>{
    btn.addEventListener('click',()=>openDetail(btn.dataset.id));
  });
}

function openDetail(id){
  const p = state.products.find((x,i)=>String(x.id ?? i) === String(id));
  if(!p) return;
  const v = productValues(p);
  const image = imageFor(p);
  els.detailImage.hidden = !image;
  if(image) els.detailImage.src = image;
  els.detailName.textContent = `${p.favorite ? '★ ' : ''}${p.name || '名称未設定'}`;
  els.detailMeta.textContent = `${p.cardType || '未分類'} / ${p.category || '未分類'}・在庫 ${v.qty}`;
  els.detailStats.innerHTML = [
    ['購入単価',yen(v.purchase)],
    ['現在単価',yen(v.current)],
    ['資産額',yen(v.asset)],
    ['評価損益',yen(v.profit)],
    ['利益率',pct(v.rate)],
    ['目標価格',yen(p.targetPrice || 0)]
  ].map(([k,val])=>`<div class="detail-item"><span>${k}</span><strong>${val}</strong></div>`).join('');
  els.detailMemo.textContent = p.investmentMemo || p.note || p.memo || '';
  renderPriceChart(p.id);
  els.detailLink.hidden = !p.url;
  if(p.url) els.detailLink.href = p.url;
  els.dialog.showModal();
}

function renderPriceChart(productId){
  const points = (state.history || [])
    .filter(h => String(h.productId) === String(productId) && Number.isFinite(Number(h.price)))
    .map(h => ({date:new Date(h.at || h.date || h.createdAt || h.timestamp), price:Number(h.price)}))
    .filter(x => !isNaN(x.date))
    .sort((a,b)=>a.date-b.date);

  els.historySection.hidden = points.length === 0;
  if(!points.length) return;

  const canvas = els.priceChart;
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const cssWidth = Math.max(280, canvas.parentElement.clientWidth || 320);
  const cssHeight = 220;
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,cssWidth,cssHeight);

  const pad={l:54,r:14,t:18,b:30};
  const w=cssWidth-pad.l-pad.r, h=cssHeight-pad.t-pad.b;
  const prices=points.map(x=>x.price);
  let min=Math.min(...prices), max=Math.max(...prices);
  if(min===max){ min*=0.95; max*=1.05; if(min===max){min=0;max=1;} }
  const range=max-min;
  min-=range*0.08; max+=range*0.08;
  const x=i=>pad.l+(points.length===1?w/2:(i/(points.length-1))*w);
  const y=v=>pad.t+((max-v)/(max-min))*h;

  ctx.strokeStyle='#e5e7eb'; ctx.lineWidth=1; ctx.fillStyle='#6b7280'; ctx.font='11px sans-serif';
  for(let i=0;i<4;i++){
    const yy=pad.t+(i/3)*h;
    const val=max-(i/3)*(max-min);
    ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(cssWidth-pad.r,yy);ctx.stroke();
    ctx.fillText(Math.round(val/1000)+'k',6,yy+4);
  }
  ctx.strokeStyle='#111827'; ctx.lineWidth=2.5; ctx.beginPath();
  points.forEach((p,i)=>{ const xx=x(i), yy=y(p.price); i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy); });
  ctx.stroke();
  ctx.fillStyle='#111827';
  points.forEach((p,i)=>{ctx.beginPath();ctx.arc(x(i),y(p.price),3,0,Math.PI*2);ctx.fill();});

  const first=points[0], last=points[points.length-1];
  const diff=last.price-first.price;
  els.historySummary.textContent = `${first.date.toLocaleDateString('ja-JP')} ${yen(first.price)} → ${last.date.toLocaleDateString('ja-JP')} ${yen(last.price)}（${diff>=0?'+':''}${yen(diff)}）`;
}

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g, c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}
function escapeAttr(value){ return escapeHtml(value); }

async function importFile(file){
  try{
    const text = await file.text();
    await window.tcDashboard.setState(JSON.parse(text));
  }catch(err){
    alert(`読み込みに失敗しました。\n${err.message}`);
  }
}

function chooseFile(){ els.fileInput.click(); }

els.importBtn.addEventListener('click',chooseFile);
els.emptyImportBtn.addEventListener('click',chooseFile);
els.fileInput.addEventListener('change',e=>{
  const file = e.target.files?.[0];
  if(file) importFile(file);
  e.target.value = '';
});
[els.searchInput,els.typeFilter,els.sortSelect,els.favoriteOnly].forEach(el=>{
  el.addEventListener(el.type === 'search' ? 'input' : 'change',renderProducts);
});
document.addEventListener('click',e=>{ const row=e.target.closest('[data-rank-id]'); if(row) openDetail(row.dataset.rankId); });
els.closeDialog.addEventListener('click',()=>els.dialog.close());
els.dialog.addEventListener('click',e=>{
  if(e.target === els.dialog) els.dialog.close();
});

async function initializeDashboard(){
  try{
    const saved = await idbGet(STATE_ID);
    if(saved) {
      state = normalize(saved);
    } else {
      // v2以前の小さな保存データがある場合だけIndexedDBへ移行します。
      const legacy = localStorage.getItem(STORAGE_KEY);
      if(legacy){
        state = normalize(JSON.parse(legacy));
        await idbSet(STATE_ID,state);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }catch(error){
    console.error('初期データ読込エラー',error);
  }finally{
    render();
    resolveReady();
    window.dispatchEvent(new CustomEvent('tc-dashboard-ready'));
  }
}

initializeDashboard();

if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  navigator.serviceWorker.register('service-worker.js').catch(()=>{});
}
