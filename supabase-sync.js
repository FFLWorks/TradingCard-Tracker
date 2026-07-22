(() => {
  const CONFIG_KEY = 'tc_dashboard_supabase_config_v1';
  const BUCKET = 'tc-backups';
  const FILE_NAME = 'latest.json';
  const DEFAULT_URL = 'https://xvecmqbsiljlyjtastwh.supabase.co';
  const DEFAULT_KEY = 'sb_publishable_mMTAuijlD8OsFl-ZrwRaDA_8CW6UguT';
  let client = null;

  const $ = id => document.getElementById(id);
  const els = {
    cloudBtn:$('cloudBtn'), dialog:$('cloudDialog'), close:$('closeCloudDialog'),
    url:$('supabaseUrl'), key:$('supabaseKey'), save:$('saveCloudConfig'),
    email:$('cloudEmail'), password:$('cloudPassword'), signIn:$('cloudSignIn'),
    signUp:$('cloudSignUp'), signOut:$('cloudSignOut'), upload:$('cloudUpload'),
    download:$('cloudDownload'), status:$('cloudStatus')
  };

  function setStatus(message, kind='') {
    els.status.textContent = message;
    els.status.className = `cloud-status ${kind}`.trim();
  }

  function loadConfig() {
    try {
      const config = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
      els.url.value = config.url || DEFAULT_URL;
      els.key.value = config.key || DEFAULT_KEY;
      return config;
    } catch { return {}; }
  }

  function createClientFromForm() {
    const url = els.url.value.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
    const key = els.key.value.trim();
    if (!url || !key) throw new Error('Project URLとPublishable keyを入力してください');
    if (!window.supabase?.createClient) throw new Error('Supabaseライブラリを読み込めませんでした');
    client = window.supabase.createClient(url, key, {
      auth: { persistSession:true, autoRefreshToken:true, detectSessionInUrl:true }
    });
    return client;
  }

  async function saveConfig() {
    try {
      createClientFromForm();
      const normalizedUrl = els.url.value.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
      els.url.value = normalizedUrl;
      localStorage.setItem(CONFIG_KEY, JSON.stringify({url:normalizedUrl, key:els.key.value.trim()}));
      setStatus('接続情報を保存しました', 'success');
      await refreshSession();
    } catch (error) { setStatus(error.message, 'error'); }
  }

  async function ensureClient() {
    if (client) return client;
    loadConfig();
    return createClientFromForm();
  }

  async function currentUser() {
    const supa = await ensureClient();
    const { data, error } = await supa.auth.getUser();
    if (error) throw error;
    if (!data.user) throw new Error('ログインしてください');
    return data.user;
  }

  async function refreshSession() {
    try {
      const supa = await ensureClient();
      const { data } = await supa.auth.getSession();
      const user = data.session?.user;
      setStatus(user ? `ログイン中：${user.email}` : '接続済み・未ログイン', user ? 'success' : '');
    } catch (error) { setStatus(error.message, 'error'); }
  }

  async function signIn() {
    try {
      const supa = await ensureClient();
      const { error } = await supa.auth.signInWithPassword({email:els.email.value.trim(), password:els.password.value});
      if (error) throw error;
      await refreshSession();
      await autoDownloadOnStart(true);
    } catch (error) { setStatus(`ログイン失敗：${error.message}`, 'error'); }
  }

  async function signUp() {
    try {
      const supa = await ensureClient();
      const { data, error } = await supa.auth.signUp({email:els.email.value.trim(), password:els.password.value});
      if (error) throw error;
      setStatus(data.session ? '登録してログインしました' : '確認メールを送信しました。メール認証後にログインしてください', 'success');
    } catch (error) { setStatus(`登録失敗：${error.message}`, 'error'); }
  }

  async function signOut() {
    try {
      const supa = await ensureClient();
      const { error } = await supa.auth.signOut();
      if (error) throw error;
      setStatus('ログアウトしました');
    } catch (error) { setStatus(error.message, 'error'); }
  }

  async function upload() {
    try {
      const user = await currentUser();
      const data = window.tcDashboard?.getState();
      if (!data) throw new Error('先にJSONを読み込んでください');
      setStatus('アップロード中…');
      const blob = new Blob([JSON.stringify({...data, cloudUpdatedAt:new Date().toISOString()})], {type:'application/json'});
      const path = `${user.id}/${FILE_NAME}`;
      const supa = await ensureClient();
      const { error } = await supa.storage.from(BUCKET).upload(path, blob, {contentType:'application/json', upsert:true});
      if (error) throw error;
      setStatus(`アップロード完了（${(blob.size/1024/1024).toFixed(1)} MB）`, 'success');
    } catch (error) { setStatus(`アップロード失敗：${error.message}`, 'error'); }
  }

  async function download() {
    try {
      const user = await currentUser();
      setStatus('ダウンロード中…');
      const supa = await ensureClient();
      const { data, error } = await supa.storage.from(BUCKET).download(`${user.id}/${FILE_NAME}`);
      if (error) throw error;
      const parsed = JSON.parse(await data.text());
      await window.tcDashboard.ready;
      await window.tcDashboard.setState(parsed);
      setStatus('最新データを読み込みました', 'success');
      els.dialog.close();
    } catch (error) { setStatus(`ダウンロード失敗：${error.message}`, 'error'); }
  }

  let lastAutoSyncAt=0;
  let syncing=false;
  async function autoDownloadOnStart(force=false){
    if(syncing)return;
    if(!force && Date.now()-lastAutoSyncAt<60000)return;
    syncing=true;
    try{
      await window.tcDashboard.ready;
      const supa=await ensureClient();
      const {data}=await supa.auth.getSession();
      const user=data.session?.user;
      if(!user)return;
      setStatus(`ログイン中：${user.email}・最新データ確認中…`);
      const {data:file,error}=await supa.storage.from(BUCKET).download(`${user.id}/${FILE_NAME}`);
      if(error){
        console.warn('自動同期をスキップしました',error.message);
        setStatus(`ログイン中：${user.email}`, 'success');
        return;
      }
      const parsed=JSON.parse(await file.text());
      const local=window.tcDashboard.getState?.()||{};
      const cloudTime=new Date(parsed.cloudUpdatedAt||parsed.exportedAt||0).getTime();
      const localTime=new Date(local.cloudUpdatedAt||local.exportedAt||0).getTime();
      if(force || !local.products?.length || cloudTime>=localTime){
        await window.tcDashboard.setState(parsed);
        setStatus(`ログイン中：${user.email}・最新データ同期済み`, 'success');
      }else{
        setStatus(`ログイン中：${user.email}・端末データが最新です`, 'success');
      }
      lastAutoSyncAt=Date.now();
    }catch(error){
      console.warn('自動同期エラー',error);
      setStatus(`自動同期失敗：${error.message}`, 'error');
    }finally{syncing=false}
  }


  els.cloudBtn.addEventListener('click', async () => { loadConfig(); els.dialog.showModal(); await refreshSession(); });
  els.close.addEventListener('click', () => els.dialog.close());
  els.dialog.addEventListener('click', e => { if (e.target === els.dialog) els.dialog.close(); });
  els.save.addEventListener('click', saveConfig);
  els.signIn.addEventListener('click', signIn);
  els.signUp.addEventListener('click', signUp);
  els.signOut.addEventListener('click', signOut);
  els.upload.addEventListener('click', upload);
  els.download.addEventListener('click', download);

  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')autoDownloadOnStart();});
  window.addEventListener('online',()=>autoDownloadOnStart(true));
  loadConfig();
  autoDownloadOnStart();
})();
