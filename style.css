:root{
  color-scheme:light;
  --bg:#f4f6f8;
  --card:#fff;
  --text:#111827;
  --muted:#6b7280;
  --line:#e5e7eb;
  --good:#15803d;
  --bad:#b91c1c;
  --accent:#111827;
}
*{box-sizing:border-box}
body{
  margin:0;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans JP",sans-serif;
  background:var(--bg);
  color:var(--text);
}
button,input,select{font:inherit}
.topbar{
  position:sticky;top:0;z-index:10;
  display:flex;align-items:center;justify-content:space-between;gap:16px;
  padding:calc(14px + env(safe-area-inset-top)) 16px 14px;
  background:rgba(244,246,248,.92);
  backdrop-filter:blur(12px);
  border-bottom:1px solid var(--line);
}
h1,h2,p{margin:0}
h1{font-size:24px}
.eyebrow{font-size:10px;letter-spacing:.14em;color:var(--muted);margin-bottom:4px}
main{max-width:780px;margin:0 auto;padding:16px 16px calc(40px + env(safe-area-inset-bottom))}
.primary{
  border:0;border-radius:12px;background:var(--accent);color:#fff;
  padding:11px 14px;font-weight:700;cursor:pointer
}
.primary.large{padding:14px 20px}
.card{background:var(--card);border:1px solid var(--line);border-radius:18px;box-shadow:0 5px 20px rgba(0,0,0,.04)}
.empty{text-align:center;padding:70px 18px}
.empty-icon{font-size:52px;margin-bottom:14px}
.empty h2{margin-bottom:8px}
.empty p{color:var(--muted);margin-bottom:20px;line-height:1.7}
.hero{padding:22px;display:grid;gap:24px}
.label,.muted{color:var(--muted)}
.hero-value{font-size:40px;font-weight:800;letter-spacing:-.04em;margin:4px 0}
.goal-head{display:flex;justify-content:space-between;margin-bottom:8px}
.progress{height:10px;border-radius:999px;background:#e5e7eb;overflow:hidden}
.progress div{height:100%;width:0;background:var(--accent);transition:width .3s}
.goal-wrap .muted{margin-top:8px;font-size:13px}
.stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0}
.stat{padding:16px}
.stat span{display:block;color:var(--muted);font-size:13px;margin-bottom:6px}
.stat strong{font-size:21px}
.positive{color:var(--good)!important}
.negative{color:var(--bad)!important}
.controls{padding:14px;display:grid;gap:10px;margin-bottom:24px}
.controls input,.controls select{
  width:100%;border:1px solid var(--line);background:#fff;border-radius:12px;padding:12px
}
.check{display:flex;gap:8px;align-items:center;color:var(--muted);font-size:14px}
.section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.product-list{display:grid;gap:10px}
.product{
  width:100%;border:1px solid var(--line);border-radius:16px;background:#fff;
  padding:12px;text-align:left;display:grid;grid-template-columns:64px 1fr auto;gap:12px;
  align-items:center;cursor:pointer
}
.thumb{width:64px;height:64px;border-radius:12px;object-fit:cover;background:#eef0f2}
.thumb.placeholder{display:grid;place-items:center;font-size:26px}
.product h3{font-size:15px;margin:0 0 5px;line-height:1.35}
.product .meta{font-size:12px;color:var(--muted)}
.product .price{text-align:right}
.product .price strong{display:block;font-size:16px}
.product .price span{font-size:12px}
dialog{border:0;padding:0;border-radius:22px;width:min(92vw,520px);max-height:88vh}
dialog::backdrop{background:rgba(0,0,0,.45)}
.dialog-inner{padding:22px;position:relative;overflow:auto}
.close{position:absolute;right:14px;top:12px;border:0;background:#eef0f2;width:36px;height:36px;border-radius:50%;font-size:24px}
#detailImage{width:100%;max-height:280px;object-fit:contain;border-radius:14px;background:#f5f5f5;margin-bottom:14px}
#detailName{padding-right:44px;margin-bottom:5px}
.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:18px 0}
.detail-item{border:1px solid var(--line);border-radius:12px;padding:12px}
.detail-item span{display:block;font-size:12px;color:var(--muted);margin-bottom:4px}
.memo{white-space:pre-wrap;line-height:1.7;margin-bottom:15px}
.link-btn{display:block;text-align:center;text-decoration:none}
@media(min-width:640px){
  .hero{grid-template-columns:1.2fr 1fr;align-items:center}
  .stats-grid{grid-template-columns:repeat(4,1fr)}
  .controls{grid-template-columns:2fr 1fr 1fr auto;align-items:center}
}

.history-section{margin:20px 0 18px}
.history-section h3{font-size:16px;margin:0 0 10px}
#priceChart{display:block;max-width:100%;border:1px solid var(--line);border-radius:14px;background:#fff}
.history-summary{font-size:12px;margin-top:8px;line-height:1.5}

.insights-grid,.dashboard-grid{display:grid;grid-template-columns:1fr;gap:12px;margin:12px 0}
.insight-card,.panel{padding:18px}
.insight-value{display:block;font-size:28px;margin:8px 0 4px}
.insight-name{display:block;font-size:18px;line-height:1.4;margin:8px 0 4px}
.ranking-list{display:grid;gap:10px}
.rank-row{display:grid;grid-template-columns:30px 44px 1fr auto;gap:10px;align-items:center}
.rank-num{font-weight:800;color:var(--muted);text-align:center}
.rank-thumb{width:44px;height:44px;border-radius:10px;object-fit:cover;background:#eef0f2}
.rank-thumb.placeholder{display:grid;place-items:center}
.rank-main{min-width:0}
.rank-main strong{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rank-main span,.rank-value span{display:block;font-size:11px;color:var(--muted);margin-top:3px}
.rank-value{text-align:right;font-size:13px;font-weight:700}
.allocation-panel{margin:12px 0 24px}
.allocation-list{display:grid;gap:13px}
.allocation-head{display:flex;justify-content:space-between;gap:12px;font-size:13px;margin-bottom:6px}
.allocation-bar{height:9px;background:#e5e7eb;border-radius:999px;overflow:hidden}
.allocation-fill{height:100%;background:var(--accent);border-radius:999px}
.empty-mini{color:var(--muted);font-size:13px;padding:8px 0}
@media(min-width:640px){.insights-grid,.dashboard-grid{grid-template-columns:1fr 1fr}}
.portfolio-chart-panel{margin:12px 0}
#portfolioChart{display:block;max-width:100%;border:1px solid var(--line);border-radius:14px;background:#fff}
.analysis-grid{margin-top:12px}
.decision-panel,.ai-panel{margin:12px 0}
.decision-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:4px 0 16px}
.decision-summary div{border:1px solid var(--line);border-radius:14px;padding:13px;text-align:center;background:#fafafa}
.decision-summary strong{display:block;font-size:22px}
.decision-summary span{display:block;color:var(--muted);font-size:11px;margin-top:4px}
.candidate-list{display:grid;gap:9px}
.candidate{width:100%;border:1px solid var(--line);border-radius:14px;background:#fff;padding:12px;display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;text-align:left;cursor:pointer}
.candidate-badge{background:#111827;color:#fff;border-radius:999px;padding:5px 8px;font-size:10px;font-weight:800}
.candidate div{min-width:0}
.candidate strong{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.candidate div span{display:block;color:var(--muted);font-size:11px;margin-top:4px}
.candidate b{font-size:13px;color:var(--good)}
.analysis-memo{display:grid;gap:10px}
.analysis-memo p{line-height:1.7;padding-left:15px;position:relative}
.analysis-memo p::before{content:'•';position:absolute;left:0;color:var(--muted)}
@media(max-width:480px){.decision-summary{grid-template-columns:1fr 1fr}.decision-summary div:last-child{grid-column:1/-1}.candidate{grid-template-columns:auto 1fr}.candidate b{grid-column:2}}


.top-actions{display:flex;gap:10px;align-items:center}.secondary,.ghost{border:1px solid #d1d5db;background:#fff;color:#111827;border-radius:12px;padding:11px 14px;font-weight:700;cursor:pointer}.ghost{background:transparent}.full{width:100%}.cloud-dialog-inner{max-width:560px}.cloud-form{display:grid;gap:12px;margin:18px 0}.cloud-form label{display:grid;gap:6px;font-size:13px;font-weight:700;color:#374151}.cloud-form input{width:100%;box-sizing:border-box;border:1px solid #d1d5db;border-radius:12px;padding:12px;font:inherit}.cloud-actions{display:flex;gap:10px;flex-wrap:wrap}.cloud-status{padding:12px 14px;border-radius:12px;background:#f3f4f6;font-size:14px;margin:14px 0}.cloud-status.success{background:#ecfdf5;color:#065f46}.cloud-status.error{background:#fef2f2;color:#991b1b}.sync-actions button{flex:1;min-width:190px}.cloud-note{font-size:12px;line-height:1.6;color:#6b7280;margin-top:16px}@media(max-width:640px){.topbar{align-items:flex-start}.top-actions{flex-direction:column;align-items:stretch}.top-actions button{width:100%;padding:9px 11px}.cloud-actions{display:grid;grid-template-columns:1fr 1fr}.cloud-actions .ghost{grid-column:1/-1}.sync-actions{grid-template-columns:1fr}.sync-actions button{min-width:0}}
