(() => {
  const CONFIG_KEY = 'tc_dashboard_supabase_config_v1';
  const BUCKET = 'tc-backups';
  const FILE_NAME = 'latest.json';
  const DEFAULT_URL = 'https://xvecmqbsiljlyjtastwh.supabase.co';
  const DEFAULT_KEY = 'sb_publishable_mMTAuijlD8OsFl-ZrwRaDA_8CW6UguT';
  let client = null;
  let syncing = false;
  let lastAutoSyncAt = 0;

  const $ = id => document.getElementById(id);
  const els = {
    cloudBtn:$('cloudBtn'), dialog:$('cloudDialog'), close:$('closeCloudDialog'),
    url:$('supabaseUrl'), key:$('supabaseKey'), save:$('saveCloudConfig'),
    email:$('cloudEmail'), password:$('cloudPassword'), signIn:$('cloudSignIn'),
    signUp:$('cloudSignUp'), signOut:$('cloudSignOut'),
    download:$('cloudDownload'), status:$('cloudStatus'), meta:$('cloudMeta')
  };

  function setStatus(message, kind='') { els.status.textContent=message; els.status.className=`cloud-status ${kind}`.trim(); }
  function setMeta(data){
    if(!els.meta)return;
    const updated=data?.cloudUpdatedAt ? new Date(data.cloudUpdatedAt).toLocaleString('ja-JP') : '不明';
    const histories=Number.isFinite(Number(data?.historyCount))?Number(data.historyCount):(Array.isArray(data?.history)?data.history.length:0);
    const products=Number.isFinite(Number(data?.productCount))?Number(data.productCount):(Array.isArray(data?.products)?data.products.length:0);
    els.meta.textContent=`クラウド更新：${updated}｜商品 ${products}件｜価格履歴 ${histories}件`;
  }
  function loadConfig(){try{const c=JSON.parse(localStorage.getItem(CONFIG_KEY)||'{}');els.url.value=c.url||DEFAULT_URL;els.key.value=c.key||DEFAULT_KEY;els.email.value=c.email||els.email.value||'';return c}catch{return {}}}
  function createClientFromForm(){const url=els.url.value.trim().replace(/\/rest\/v1\/?$/,'').replace(/\/$/,'');const key=els.key.value.trim();if(!url||!key)throw new Error('Project URLとPublishable keyを入力してください');if(!window.supabase?.createClient)throw new Error('Supabaseライブラリを読み込めませんでした');client=window.supabase.createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client}
  async function saveConfig(){try{createClientFromForm();const url=els.url.value.trim().replace(/\/rest\/v1\/?$/,'').replace(/\/$/,'');els.url.value=url;localStorage.setItem(CONFIG_KEY,JSON.stringify({url,key:els.key.value.trim(),email:els.email.value.trim()}));setStatus('接続情報を保存しました','success');await refreshSession()}catch(e){setStatus(e.message,'error')}}
  async function ensureClient(){if(client)return client;loadConfig();return createClientFromForm()}
  async function getSession(){const supa=await ensureClient();const {data,error}=await supa.auth.getSession();if(error)throw error;if(!data.session)throw new Error('ログインしてください');return data.session}
  async function refreshSession(){try{const session=await getSession();setStatus(`ログイン中：${session.user.email}`,'success')}catch(e){setStatus(e.message==='ログインしてください'?'接続済み・未ログイン':e.message,e.message==='ログインしてください'?'':'error')}}
  async function signIn(){try{const supa=await ensureClient();const email=els.email.value.trim();const {error}=await supa.auth.signInWithPassword({email,password:els.password.value});if(error)throw error;localStorage.setItem(CONFIG_KEY,JSON.stringify({url:els.url.value.trim(),key:els.key.value.trim(),email}));els.password.value='';await refreshSession();await downloadLatest(true)}catch(e){setStatus(`ログイン失敗：${e.message}`,'error')}}
  async function signUp(){try{const supa=await ensureClient();const {data,error}=await supa.auth.signUp({email:els.email.value.trim(),password:els.password.value});if(error)throw error;setStatus(data.session?'登録してログインしました':'確認メールを送信しました','success')}catch(e){setStatus(`登録失敗：${e.message}`,'error')}}
  async function signOut(){try{const supa=await ensureClient();const {error}=await supa.auth.signOut();if(error)throw error;setStatus('ログアウトしました')}catch(e){setStatus(e.message,'error')}}
  async function fetchCloudJson(){
    const session=await getSession();
    const url=els.url.value.trim().replace(/\/$/,'');
    const path=`${session.user.id}/${FILE_NAME}`;
    const endpoint=`${url}/storage/v1/object/authenticated/${BUCKET}/${path}?cacheBust=${Date.now()}`;
    const response=await fetch(endpoint,{method:'GET',cache:'no-store',headers:{apikey:els.key.value.trim(),Authorization:`Bearer ${session.access_token}`,'Cache-Control':'no-cache, no-store, max-age=0',Pragma:'no-cache'}});
    if(!response.ok)throw new Error((await response.text())||`取得失敗 (${response.status})`);
    return response.json();
  }
  async function downloadLatest(closeDialog=false){
    if(syncing)return;
    syncing=true;
    try{
      await window.tcDashboard.ready;
      setStatus('PCの最新データを取得中…');
      const parsed=await fetchCloudJson();
      if(parsed.syncSource && parsed.syncSource!=='pc')throw new Error('PC版から作成されたバックアップではありません');
      await window.tcDashboard.setState(parsed);
      setMeta(parsed);
      lastAutoSyncAt=Date.now();
      setStatus(`同期完了：価格履歴 ${Array.isArray(parsed.history)?parsed.history.length:0}件`,'success');
      if(closeDialog)setTimeout(()=>els.dialog.close(),500);
    }catch(e){setStatus(`ダウンロード失敗：${e.message}`,'error')}
    finally{syncing=false}
  }
  async function autoDownloadOnStart(force=false){if(syncing)return;if(!force&&Date.now()-lastAutoSyncAt<60000)return;try{await getSession();await downloadLatest(false)}catch(e){if(e.message!=='ログインしてください')setStatus(`自動同期失敗：${e.message}`,'error')}}

  els.cloudBtn.addEventListener('click',async()=>{loadConfig();els.dialog.showModal();await refreshSession()});
  els.close.addEventListener('click',()=>els.dialog.close());
  els.dialog.addEventListener('click',e=>{if(e.target===els.dialog)els.dialog.close()});
  els.save.addEventListener('click',saveConfig);els.signIn.addEventListener('click',signIn);els.signUp.addEventListener('click',signUp);els.signOut.addEventListener('click',signOut);els.download.addEventListener('click',()=>downloadLatest(false));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')autoDownloadOnStart()});
  window.addEventListener('online',()=>autoDownloadOnStart(true));
  loadConfig();autoDownloadOnStart(true);
})();
