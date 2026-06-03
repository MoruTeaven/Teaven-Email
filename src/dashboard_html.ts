// Teaven Email - Dashboard HTML 内联版本
// 部署时可将 public/index.html 上传到 R2 bucket 的 dashboard/ 路径

export function getDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teaven Email - 多租户邮件平台</title>
  <style>
    :root {
      --bg: #0a0a0f;
      --bg-card: #14141f;
      --bg-card-hover: #1a1a2e;
      --bg-input: #1c1c2e;
      --border: #2a2a3e;
      --text: #e0e0e8;
      --text-muted: #8888a0;
      --primary: #6366f1;
      --primary-hover: #818cf8;
      --success: #22c55e;
      --warning: #f59e0b;
      --danger: #ef4444;
      --info: #3b82f6;
      --radius: 8px;
      --radius-lg: 12px;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      line-height: 1.6;
    }

    .app { display: flex; min-height: 100vh; }
    .sidebar {
      width: 260px;
      background: var(--bg-card);
      border-right: 1px solid var(--border);
      padding: 24px 0;
      position: fixed;
      top: 0; left: 0; bottom: 0;
      overflow-y: auto;
      z-index: 100;
    }
    .sidebar-logo {
      padding: 0 20px 24px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 16px;
    }
    .sidebar-logo h1 { font-size: 1.25rem; font-weight: 700; background: linear-gradient(135deg, var(--primary), #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .sidebar-logo span { font-size: 0.75rem; color: var(--text-muted); }
    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 20px; margin: 2px 8px; border-radius: var(--radius);
      color: var(--text-muted); text-decoration: none; font-size: 0.9rem;
      cursor: pointer; transition: all 0.15s; border: none; background: none; width: calc(100% - 16px);
    }
    .nav-item:hover { background: var(--bg-card-hover); color: var(--text); }
    .nav-item.active { background: var(--primary); color: #fff; }
    .nav-icon { font-size: 1.1rem; width: 20px; text-align: center; }

    .main {
      margin-left: 260px;
      flex: 1;
      padding: 32px;
      max-width: 1200px;
    }

    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 24px;
      margin-bottom: 20px;
    }
    .card-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 20px;
    }
    .card-title { font-size: 1.1rem; font-weight: 600; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 20px;
    }
    .stat-label { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-value { font-size: 2rem; font-weight: 700; }

    .form-group { margin-bottom: 16px; }
    .form-label { display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 6px; }
    .form-input, .form-select, .form-textarea {
      width: 100%; padding: 10px 14px;
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--text);
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--primary); }
    .form-textarea { min-height: 200px; font-family: 'Fira Code', 'Consolas', monospace; resize: vertical; }
    .form-hint { font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; }

    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 10px 20px; border-radius: var(--radius);
      font-size: 0.9rem; font-weight: 500; cursor: pointer;
      border: none; transition: all 0.15s;
    }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-danger { background: transparent; color: var(--danger); border: 1px solid var(--danger); }
    .btn-danger:hover { background: var(--danger); color: #fff; }
    .btn-ghost { background: transparent; color: var(--text-muted); border: 1px solid var(--border); }
    .btn-ghost:hover { border-color: var(--primary); color: var(--primary); }
    .btn-sm { padding: 6px 12px; font-size: 0.8rem; }

    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 12px 16px; border-bottom: 1px solid var(--border); }
    th { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
    td { font-size: 0.9rem; }
    tr:hover td { background: var(--bg-card-hover); }

    .badge {
      display: inline-block; padding: 3px 10px; border-radius: 100px;
      font-size: 0.75rem; font-weight: 500;
    }
    .badge-success { background: rgba(34,197,94,0.15); color: var(--success); }
    .badge-warning { background: rgba(245,158,11,0.15); color: var(--warning); }
    .badge-danger { background: rgba(239,68,68,0.15); color: var(--danger); }
    .badge-info { background: rgba(99,102,241,0.15); color: var(--primary); }
    .badge-muted { background: rgba(136,136,160,0.15); color: var(--text-muted); }

    .tabs { display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 0; }
    .tab {
      padding: 10px 20px; border: none; background: none; color: var(--text-muted);
      cursor: pointer; font-size: 0.9rem; border-bottom: 2px solid transparent;
      transition: all 0.15s;
    }
    .tab:hover { color: var(--text); }
    .tab.active { color: var(--primary); border-bottom-color: var(--primary); }

    .toast {
      position: fixed; top: 20px; right: 20px;
      padding: 14px 24px; border-radius: var(--radius);
      color: #fff; font-size: 0.9rem; z-index: 1000;
      animation: slideIn 0.3s ease;
    }
    .toast-success { background: var(--success); }
    .toast-error { background: var(--danger); }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.6);
      display: flex; align-items: center; justify-content: center;
      z-index: 200;
    }
    .modal {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 32px;
      width: 90%; max-width: 560px;
      max-height: 80vh; overflow-y: auto;
    }
    .modal-title { font-size: 1.2rem; font-weight: 600; margin-bottom: 20px; }

    .code-block {
      background: #0d0d1a; border: 1px solid var(--border);
      border-radius: var(--radius); padding: 16px;
      font-family: 'Fira Code', 'Consolas', monospace;
      font-size: 0.85rem; overflow-x: auto;
      white-space: pre-wrap; word-break: break-all;
    }
    .key-highlight {
      color: var(--success); font-weight: 600;
      background: rgba(34,197,94,0.1); padding: 2px 6px; border-radius: 4px;
    }

    .empty-state { text-align: center; padding: 48px 20px; color: var(--text-muted); }
    .empty-icon { font-size: 3rem; margin-bottom: 12px; }
    .empty-title { font-size: 1.1rem; margin-bottom: 8px; }
    .empty-desc { font-size: 0.85rem; }

    @media (max-width: 768px) {
      .sidebar { display: none; }
      .main { margin-left: 0; padding: 16px; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>
<body>
  <div class="app">
    <nav class="sidebar">
      <div class="sidebar-logo">
        <h1>Teaven Email</h1>
        <span>多租户邮件平台 v1.0</span>
      </div>
      <button class="nav-item active" data-page="dashboard">📊 仪表盘</button>
      <button class="nav-item" data-page="api-keys">🔑 API Keys</button>
      <button class="nav-item" data-page="templates">📝 模板管理</button>
      <button class="nav-item" data-page="providers">📡 Provider 配置</button>
      <button class="nav-item" data-page="logs">📋 发送日志</button>
    </nav>
    <main class="main" id="main-content"></main>
  </div>
  <div id="toast-container"></div>
  <script>
    const API_BASE='/v1';
    const API_KEY=localStorage.getItem('teaven_api_key')||'';
    function esc(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

    async function api(path,opts={}){
      const res=await fetch(API_BASE+path,{
        headers:{'Authorization':'Bearer '+API_KEY,'Content-Type':'application/json',...opts.headers},
        ...opts
      });
      return res.json();
    }

    function toast(msg,type='success'){
      const c=document.getElementById('toast-container');
      const el=document.createElement('div');
      el.className='toast toast-'+type;
      el.textContent=msg;
      c.appendChild(el);
      setTimeout(function(){el.remove()},3000);
    }

    document.querySelectorAll('.nav-item').forEach(function(btn){
      btn.addEventListener('click',function(){
        document.querySelectorAll('.nav-item').forEach(function(b){b.classList.remove('active')});
        btn.classList.add('active');
        renderPage(btn.dataset.page);
      });
    });

    function renderPage(page){
      var main=document.getElementById('main-content');
      switch(page){
        case'dashboard':renderDashboard(main);break;
        case'api-keys':renderApiKeys(main);break;
        case'templates':renderTemplates(main);break;
        case'providers':renderProviders(main);break;
        case'logs':renderLogs(main);break;
      }
    }

    async function renderDashboard(main){
      if(!API_KEY){main.innerHTML=setupPage();return}
      var resp=await api('/dashboard/overview');
      if(!resp.success){main.innerHTML=setupPage();return}
      var d=resp.data;
      main.innerHTML='<h2 style="margin-bottom:24px;">仪表盘</h2>'+
        '<div class="stats-grid">'+
          '<div class="stat-card"><div class="stat-label">模板数量</div><div class="stat-value" style="color:var(--primary)">'+d.templates_count+'</div></div>'+
          '<div class="stat-card"><div class="stat-label">Provider 数量</div><div class="stat-value" style="color:var(--info)">'+d.providers_count+'</div></div>'+
          '<div class="stat-card"><div class="stat-label">发件账号</div><div class="stat-value" style="color:#a855f7">'+d.accounts_count+'</div></div>'+
          '<div class="stat-card"><div class="stat-label">API Keys</div><div class="stat-value" style="color:var(--warning)">'+d.api_keys_count+'</div></div>'+
        '</div>'+
        '<div class="stats-grid">'+
          '<div class="stat-card"><div class="stat-label">今日发送</div><div class="stat-value" style="color:var(--info)">'+d.today.sent+'</div></div>'+
          '<div class="stat-card"><div class="stat-label">今日送达</div><div class="stat-value" style="color:var(--success)">'+d.today.delivered+'</div></div>'+
          '<div class="stat-card"><div class="stat-label">今日失败</div><div class="stat-value" style="color:var(--danger)">'+d.today.failed+'</div></div>'+
          '<div class="stat-card"><div class="stat-label">今日退信</div><div class="stat-value" style="color:var(--warning)">'+d.today.bounced+'</div></div>'+
        '</div>'+
        '<div class="card"><div class="card-header"><div class="card-title">近 7 天发送趋势</div></div>'+
          '<div class="table-wrap"><table><thead><tr><th>日期</th><th>发送</th><th>送达</th><th>失败</th><th>退信</th><th>垃圾</th></tr></thead><tbody>'+
          ((d.recent_7_days||[]).map(function(s){
            return'<tr><td>'+esc(s.date)+'</td><td>'+(s.total_sent||0)+'</td><td>'+(s.total_delivered||0)+'</td><td style="color:var(--danger)">'+(s.total_failed||0)+'</td><td style="color:var(--warning)">'+(s.total_bounced||0)+'</td><td>'+(s.total_spam||0)+'</td></tr>';
          }).join('')||'<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">暂无数据</td></tr>')+
          '</tbody></table></div></div>';
    }

    async function renderApiKeys(main){
      if(!API_KEY){main.innerHTML=setupPage();return}
      var resp=await api('/api-keys');
      var keys=resp.data||[];
      main.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;"><h2>API Keys</h2><button class="btn btn-primary" onclick="showCreateApiKeyModal()">+ 创建 API Key</button></div>'+
        '<div class="card"><div class="table-wrap"><table><thead><tr><th>名称</th><th>前缀</th><th>权限</th><th>状态</th><th>最后使用</th><th>操作</th></tr></thead><tbody>'+
        keys.map(function(k){
          return'<tr><td><strong>'+esc(k.name)+'</strong></td><td><code>'+esc(k.prefix)+'***</code></td><td>'+(k.permissions||[]).map(function(p){return'<span class="badge badge-info">'+esc(p)+'</span>'}).join(' ')+'</td><td><span class="badge '+(k.enabled?'badge-success':'badge-muted')+'">'+(k.enabled?'启用':'禁用')+'</span></td><td>'+(k.last_used_at?new Date(k.last_used_at).toLocaleString('zh-CN'):'从未使用')+'</td><td><button class="btn btn-sm btn-ghost" onclick="toggleApiKey(\\''+esc(k.id)+'\\','+(!k.enabled)+')">'+(k.enabled?'禁用':'启用')+'</button> <button class="btn btn-sm btn-danger" onclick="deleteApiKey(\\''+esc(k.id)+'\\')">删除</button></td></tr>';
        }).join('')+
        '</tbody></table></div></div>';
    }

    function showCreateApiKeyModal(){
      var overlay=document.createElement('div');
      overlay.className='modal-overlay';
      overlay.innerHTML='<div class="modal"><div class="modal-title">创建 API Key</div>'+
        '<div class="form-group"><label class="form-label">名称</label><input class="form-input" id="ak-name" placeholder="如：官网生产环境"></div>'+
        '<div class="form-group"><label class="form-label">权限</label><div style="display:flex;flex-wrap:wrap;gap:8px;">'+
        ['SEND_MAIL','MANAGE_TEMPLATE','READ_LOG','MANAGE_PROVIDER'].map(function(p){return'<label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;cursor:pointer;"><input type="checkbox" value="'+p+'" '+(p==='SEND_MAIL'?'checked':'')+' class="ak-perm"> '+p+'</label>'}).join('')+
        '</div></div>'+
        '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;"><button class="btn btn-ghost" onclick="this.closest(\\'.modal-overlay\\').remove()">取消</button><button class="btn btn-primary" id="ak-create-btn">创建</button></div></div>';
      document.body.appendChild(overlay);
      overlay.querySelector('#ak-create-btn').addEventListener('click',async function(){
        var name=overlay.querySelector('#ak-name').value.trim();
        if(!name){toast('请输入名称','error');return}
        var perms=[...overlay.querySelectorAll('.ak-perm:checked')].map(function(cb){return cb.value});
        var resp=await api('/api-keys',{method:'POST',body:JSON.stringify({name:name,permissions:perms})});
        if(resp.success){
          overlay.remove();
          var main=document.getElementById('main-content');
          main.insertAdjacentHTML('afterbegin','<div class="card" style="border-color:var(--success);margin-bottom:20px;" id="key-reveal"><div class="card-header"><div class="card-title">API Key 创建成功</div><button class="btn btn-sm btn-ghost" onclick="document.getElementById(\\'key-reveal\\').remove()">关闭</button></div><p style="color:var(--text-muted);margin-bottom:12px;">请立即复制并安全保存此 Key，关闭后将无法再次查看。</p><div class="code-block"><span class="key-highlight">'+esc(resp.data.api_key)+'</span></div><p class="form-hint" style="margin-top:8px;">使用方式：<code>Authorization: Bearer &lt;your-api-key&gt;</code></p></div>');
          renderApiKeys(main);
          toast('API Key 创建成功');
        }else{toast(resp.error,'error')}
      });
      overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove()});
    }

    async function toggleApiKey(id,enabled){
      await api('/api-keys/'+id+'/toggle',{method:'PUT',body:JSON.stringify({enabled:enabled})});
      renderPage('api-keys');
    }

    async function deleteApiKey(id){
      if(!confirm('确定删除此 API Key？此操作不可撤销。'))return;
      await api('/api-keys/'+id,{method:'DELETE'});
      renderPage('api-keys');
      toast('API Key 已删除');
    }

    async function renderTemplates(main){
      if(!API_KEY){main.innerHTML=setupPage();return}
      var resp=await api('/templates');
      var templates=resp.data||[];
      main.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;"><h2>模板管理</h2><button class="btn btn-primary" onclick="showTemplateModal()">+ 创建模板</button></div>'+
        '<div class="card">'+
        (templates.length===0?
          '<div class="empty-state"><div class="empty-icon">📝</div><div class="empty-title">暂无模板</div><div class="empty-desc">创建邮件模板后，通过 API 调用模板编号即可发送邮件</div></div>'
        :
          '<div class="table-wrap"><table><thead><tr><th>模板编号</th><th>名称</th><th>分类</th><th>版本</th><th>变量</th><th>操作</th></tr></thead><tbody>'+
          templates.map(function(t){
            var vars=typeof t.variables==='string'?JSON.parse(t.variables):(t.variables||[]);
            return'<tr><td><code>'+esc(t.template_code)+'</code></td><td>'+esc(t.name)+'</td><td><span class="badge badge-info">'+esc(t.category)+'</span></td><td>v'+t.version+'</td><td>'+vars.map(function(v){return'<span class="badge badge-muted">{{'+esc(v)+'}}</span>'}).join(' ')+'</td><td><button class="btn btn-sm btn-ghost" onclick="previewTemplate(\\''+esc(t.template_code)+'\\')">预览</button> <button class="btn btn-sm btn-ghost" onclick="editTemplate(\\''+esc(t.template_code)+'\\')">编辑</button> <button class="btn btn-sm btn-danger" onclick="deleteTemplate(\\''+esc(t.template_code)+'\\')">删除</button></td></tr>';
          }).join('')+'</tbody></table></div>'
        )+
        '</div>';
    }

    function showTemplateModal(code){
      var isEdit=!!code;
      var overlay=document.createElement('div');
      overlay.className='modal-overlay';
      overlay.innerHTML='<div class="modal" style="max-width:700px;"><div class="modal-title">'+(isEdit?'编辑模板':'创建模板')+'</div>'+
        '<div class="form-group"><label class="form-label">模板编号 *</label><input class="form-input" id="tmpl-code" placeholder="如：VERIFY_CODE" '+(isEdit?'disabled':'')+'></div>'+
        '<div class="form-group"><label class="form-label">模板名称 *</label><input class="form-input" id="tmpl-name" placeholder="如：验证码邮件"></div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;"><div class="form-group"><label class="form-label">分类</label><select class="form-select" id="tmpl-category"><option value="VERIFY">VERIFY - 验证</option><option value="NOTIFY">NOTIFY - 通知</option><option value="MARKETING">MARKETING - 营销</option><option value="SYSTEM">SYSTEM - 系统</option></select></div></div>'+
        '<div class="form-group"><label class="form-label">邮件主题 *</label><input class="form-input" id="tmpl-subject" placeholder="如：您的验证码是 {{code}}"></div>'+
        '<div class="form-group"><label class="form-label">HTML 内容 *</label><textarea class="form-textarea" id="tmpl-html" placeholder="<h1>您的验证码：{{code}}</h1>"></textarea><div class="form-hint">支持 Handlebars 模板语法，变量使用 {{变量名}}</div></div>'+
        '<div class="form-group"><label class="form-label">纯文本内容（可选）</label><textarea class="form-textarea" id="tmpl-text" style="min-height:80px;" placeholder="自动从 HTML 生成，也可手动输入"></textarea></div>'+
        (isEdit?'<div class="form-group"><label class="form-label">更新说明</label><input class="form-input" id="tmpl-changelog" placeholder="如：修改了按钮颜色"></div>':'')+
        '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;"><button class="btn btn-ghost" onclick="this.closest(\\'.modal-overlay\\').remove()">取消</button><button class="btn btn-primary" id="tmpl-save-btn">'+(isEdit?'更新':'创建')+'</button></div></div>';
      document.body.appendChild(overlay);

      if(isEdit){
        api('/templates/'+code).then(function(resp){
          if(resp.data){
            overlay.querySelector('#tmpl-code').value=resp.data.template_code;
            overlay.querySelector('#tmpl-name').value=resp.data.name;
            overlay.querySelector('#tmpl-category').value=resp.data.category;
            overlay.querySelector('#tmpl-subject').value=resp.data.subject;
            overlay.querySelector('#tmpl-html').value=resp.data.html;
            overlay.querySelector('#tmpl-text').value=resp.data.text_content||'';
          }
        });
      }

      overlay.querySelector('#tmpl-save-btn').addEventListener('click',async function(){
        var code=overlay.querySelector('#tmpl-code').value.trim();
        var name=overlay.querySelector('#tmpl-name').value.trim();
        var category=overlay.querySelector('#tmpl-category').value;
        var subject=overlay.querySelector('#tmpl-subject').value.trim();
        var html=overlay.querySelector('#tmpl-html').value.trim();
        var textContent=overlay.querySelector('#tmpl-text').value.trim();
        var changelog=overlay.querySelector('#tmpl-changelog')?overlay.querySelector('#tmpl-changelog').value.trim():null;

        if(!code||!name||!subject||!html){toast('请填写所有必填字段','error');return}

        var method=isEdit?'PUT':'POST';
        var url=isEdit?'/templates/'+code:'/templates';
        var body={template_code:code,name:name,category:category,subject:subject,html:html,text_content:textContent||null};
        if(isEdit&&changelog)body.changelog=changelog;

        var resp=await api(url,{method:method,body:JSON.stringify(body)});
        if(resp.success){overlay.remove();renderPage('templates');toast(isEdit?'模板已更新':'模板创建成功')}
        else toast(resp.error,'error');
      });

      overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove()});
    }

    function editTemplate(code){showTemplateModal(code)}

    async function deleteTemplate(code){
      if(!confirm('确定删除模板 "'+code+'"？'))return;
      await api('/templates/'+code,{method:'DELETE'});
      renderPage('templates');
      toast('模板已删除');
    }

    async function previewTemplate(code){
      var overlay=document.createElement('div');
      overlay.className='modal-overlay';
      overlay.innerHTML='<div class="modal" style="max-width:800px;"><div class="modal-title">预览模板: '+esc(code)+'</div>'+
        '<div class="form-group"><label class="form-label">测试变量 (JSON)</label><input class="form-input" id="pv-vars" placeholder=\\'{"code":"123456"}\\' value="{}"></div>'+
        '<div id="pv-result" style="margin:16px 0;"></div>'+
        '<div style="display:flex;gap:10px;justify-content:flex-end;"><button class="btn btn-ghost" onclick="this.closest(\\'.modal-overlay\\').remove()">关闭</button><button class="btn btn-primary" id="pv-refresh">刷新预览</button></div></div>';
      document.body.appendChild(overlay);

      async function refresh(){
        var vars={};
        try{vars=JSON.parse(overlay.querySelector('#pv-vars').value)}catch(e){}
        var resp=await api('/templates/'+code+'/preview',{method:'POST',body:JSON.stringify({variables:vars})});
        var d=resp.data||{};
        overlay.querySelector('#pv-result').innerHTML='<div class="card"><div class="form-label">主题</div><div>'+esc(d.subject||'')+'</div></div>'+
          '<div class="card"><div class="form-label">HTML</div><div style="border:1px solid var(--border);border-radius:var(--radius);padding:20px;background:#fff;color:#000;">'+(d.html||'<em style="color:#999">无内容</em>')+'</div></div>'+
          (d.render_errors&&d.render_errors.length?'<div style="color:var(--danger);margin-top:8px;">⚠ '+d.render_errors.join(', ')+'</div>':'');
      }

      refresh();
      overlay.querySelector('#pv-refresh').addEventListener('click',refresh);
      overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove()});
    }

    async function renderProviders(main){
      if(!API_KEY){main.innerHTML=setupPage();return}
      var pResp=await api('/providers');
      var aResp=await api('/providers/accounts');
      var rResp=await api('/providers/routes');
      var providers=pResp.data||[];
      var accounts=aResp.data||[];
      var routes=rResp.data||[];

      main.innerHTML='<h2 style="margin-bottom:24px;">Provider 配置</h2>'+
        '<div class="tabs"><button class="tab active" onclick="switchProviderTab(\\'providers\\')">Provider 列表</button><button class="tab" onclick="switchProviderTab(\\'accounts\\')">发件账号</button><button class="tab" onclick="switchProviderTab(\\'routes\\')">分类路由</button></div>'+
        '<div id="provider-tab-providers">'+
          '<div style="display:flex;justify-content:flex-end;margin-bottom:16px;"><button class="btn btn-primary" onclick="showProviderModal()">+ 添加 Provider</button></div>'+
          '<div class="card">'+
          (providers.length===0?
            '<div class="empty-state"><div class="empty-icon">📡</div><div class="empty-title">暂无 Provider</div><div class="empty-desc">添加 SMTP、第三方 API 或 Cloudflare Email Provider</div></div>'
          :
            providers.map(function(p){
              var config=typeof p.config==='string'?JSON.parse(p.config):p.config;
              var configInfo=p.type==='smtp'?'SMTP: '+config.host+':'+config.port:(p.type==='api'?'API: '+(config.provider_name||'Generic'):'Cloudflare: '+(config.domain||''));
              return'<div class="card" style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;align-items:start;"><div><strong>'+esc(p.name)+'</strong><span class="badge badge-info" style="margin-left:8px;">'+esc(p.type)+'</span><span class="badge '+(p.enabled?'badge-success':'badge-muted')+'">'+(p.enabled?'启用':'禁用')+'</span><div style="color:var(--text-muted);font-size:0.8rem;margin-top:4px;">'+esc(configInfo)+'</div></div><button class="btn btn-sm btn-danger" onclick="deleteProvider(\\''+esc(p.id)+'\\')">删除</button></div></div>';
            }).join('')
          )+
          '</div></div>'+

        '<div id="provider-tab-accounts" style="display:none;">'+
          '<div style="display:flex;justify-content:flex-end;margin-bottom:16px;"><button class="btn btn-primary" onclick="showAccountModal()">+ 添加发件账号</button></div>'+
          '<div class="card">'+
          (accounts.length===0?
            '<div class="empty-state"><div class="empty-icon">📧</div><div class="empty-title">暂无发件账号</div></div>'
          :
            '<div class="table-wrap"><table><thead><tr><th>名称</th><th>邮箱</th><th>显示名</th><th>Provider</th><th>今日/限额</th><th>操作</th></tr></thead><tbody>'+
            accounts.map(function(a){
              return'<tr><td>'+esc(a.name)+'</td><td>'+esc(a.email)+'</td><td>'+esc(a.display_name||'-')+'</td><td><span class="badge badge-muted">'+esc(a.provider_id)+'</span></td><td>'+a.sent_today+' / '+a.daily_limit+'</td><td><button class="btn btn-sm btn-danger" onclick="deleteAccount(\\''+esc(a.id)+'\\')">删除</button></td></tr>';
            }).join('')+'</tbody></table></div>'
          )+
          '</div></div>'+

        '<div id="provider-tab-routes" style="display:none;">'+
          '<div style="display:flex;justify-content:flex-end;margin-bottom:16px;"><button class="btn btn-primary" onclick="showRouteModal()">+ 添加路由规则</button></div>'+
          '<div class="card">'+
          (routes.length===0?
            '<div class="empty-state"><div class="empty-icon">🔀</div><div class="empty-title">暂无路由规则</div><div class="empty-desc">配置不同邮件分类使用不同的 Provider 发送</div></div>'
          :
            '<div class="table-wrap"><table><thead><tr><th>分类</th><th>Provider</th><th>账号</th><th>优先级</th><th>操作</th></tr></thead><tbody>'+
            routes.map(function(r){
              return'<tr><td><span class="badge badge-info">'+esc(r.category)+'</span></td><td>'+esc(r.provider_id)+'</td><td>'+(r.account_id?esc(r.account_id):'自动选择')+'</td><td>'+r.priority+'</td><td><button class="btn btn-sm btn-danger" onclick="deleteRoute(\\''+esc(r.id)+'\\')">删除</button></td></tr>';
            }).join('')+'</tbody></table></div>'
          )+
          '</div></div>';
    }

    function switchProviderTab(tab){
      ['providers','accounts','routes'].forEach(function(t){
        document.getElementById('provider-tab-'+t).style.display=t===tab?'block':'none';
      });
      document.querySelectorAll('.tab').forEach(function(b,i){
        b.classList.toggle('active',['providers','accounts','routes'][i]===tab);
      });
    }

    function showProviderModal(){
      var overlay=document.createElement('div');
      overlay.className='modal-overlay';
      overlay.innerHTML='<div class="modal"><div class="modal-title">添加 Provider</div>'+
        '<div class="form-group"><label class="form-label">名称 *</label><input class="form-input" id="p-name" placeholder="如：SendGrid 生产"></div>'+
        '<div class="form-group"><label class="form-label">类型 *</label><select class="form-select" id="p-type" onchange="toggleProviderConfigInModal(this.closest(\\'.modal-overlay\\'))"><option value="smtp">SMTP</option><option value="api">第三方 API</option><option value="cloudflare_email">Cloudflare Email</option></select></div>'+
        '<div id="p-config-area"></div>'+
        '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;"><button class="btn btn-ghost" onclick="this.closest(\\'.modal-overlay\\').remove()">取消</button><button class="btn btn-primary" id="p-save-btn">创建</button></div></div>';
      document.body.appendChild(overlay);
      toggleProviderConfigInModal(overlay);

      overlay.querySelector('#p-save-btn').addEventListener('click',async function(){
        var name=overlay.querySelector('#p-name').value.trim();
        var type=overlay.querySelector('#p-type').value;
        if(!name){toast('请输入名称','error');return}
        var config=getProviderConfigValues(overlay,type);
        if(!config)return;
        var resp=await api('/providers',{method:'POST',body:JSON.stringify({name:name,type:type,config:config})});
        if(resp.success){overlay.remove();renderPage('providers');toast('Provider 创建成功')}
        else toast(resp.error,'error');
      });
      overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove()});
    }

    function toggleProviderConfigInModal(overlay){
      var type=overlay.querySelector('#p-type').value;
      var area=overlay.querySelector('#p-config-area');
      if(type==='smtp'){
        area.innerHTML='<div class="form-group"><label class="form-label">Host *</label><input class="form-input" id="pc-host" placeholder="smtp.example.com"></div>'+
          '<div class="form-group"><label class="form-label">Port *</label><input class="form-input" id="pc-port" placeholder="587" type="number"></div>'+
          '<div class="form-group"><label class="form-label">Username *</label><input class="form-input" id="pc-user" placeholder="user@example.com"></div>'+
          '<div class="form-group"><label class="form-label">Password *</label><input class="form-input" id="pc-pass" type="password" placeholder="••••"></div>'+
          '<div class="form-group"><label class="form-label">加密</label><select class="form-select" id="pc-enc"><option value="tls">TLS</option><option value="ssl">SSL</option><option value="none">None</option></select></div>';
      }else if(type==='api'){
        area.innerHTML='<div class="form-group"><label class="form-label">Provider 名称</label><select class="form-select" id="pc-pname"><option value="sendgrid">SendGrid</option><option value="mailgun">Mailgun</option><option value="resend">Resend</option><option value="generic">通用</option></select></div>'+
          '<div class="form-group"><label class="form-label">API URL（可选）</label><input class="form-input" id="pc-url" placeholder="https://api.example.com/send"></div>'+
          '<div class="form-group"><label class="form-label">API Key *</label><input class="form-input" id="pc-apikey" type="password" placeholder="••••"></div>';
      }else{
        area.innerHTML='<div class="form-group"><label class="form-label">域名 *</label><input class="form-input" id="pc-domain" placeholder="example.com"></div>'+
          '<div class="form-group"><label class="form-label">DKIM Selector</label><input class="form-input" id="pc-dkim" placeholder="mailchannels"></div>';
      }
    }

    function getProviderConfigValues(overlay,type){
      if(type==='smtp'){
        var host=overlay.querySelector('#pc-host')?overlay.querySelector('#pc-host').value.trim():'';
        var port=parseInt(overlay.querySelector('#pc-port')?overlay.querySelector('#pc-port').value:'0');
        var username=overlay.querySelector('#pc-user')?overlay.querySelector('#pc-user').value.trim():'';
        var password=overlay.querySelector('#pc-pass')?overlay.querySelector('#pc-pass').value.trim():'';
        var encryption=overlay.querySelector('#pc-enc')?overlay.querySelector('#pc-enc').value:'tls';
        if(!host||!port||!username||!password){toast('请填写所有 SMTP 配置','error');return null}
        return{host:host,port:port,username:username,password:password,encryption:encryption};
      }else if(type==='api'){
        var api_key=overlay.querySelector('#pc-apikey')?overlay.querySelector('#pc-apikey').value.trim():'';
        var provider_name=overlay.querySelector('#pc-pname')?overlay.querySelector('#pc-pname').value:'generic';
        var api_url=overlay.querySelector('#pc-url')?overlay.querySelector('#pc-url').value.trim():'';
        if(!api_key){toast('请填写 API Key','error');return null}
        return{api_key:api_key,provider_name:provider_name,api_url:api_url};
      }else{
        var domain=overlay.querySelector('#pc-domain')?overlay.querySelector('#pc-domain').value.trim():'';
        var dkim_selector=overlay.querySelector('#pc-dkim')?overlay.querySelector('#pc-dkim').value.trim():'mailchannels';
        if(!domain){toast('请填写域名','error');return null}
        return{domain:domain,dkim_selector:dkim_selector};
      }
    }

    async function deleteProvider(id){
      if(!confirm('确定删除此 Provider？'))return;
      await api('/providers/'+id,{method:'DELETE'});
      renderPage('providers');
      toast('Provider 已删除');
    }

    function showAccountModal(){
      var overlay=document.createElement('div');
      overlay.className='modal-overlay';
      overlay.innerHTML='<div class="modal"><div class="modal-title">添加发件账号</div>'+
        '<div class="form-group"><label class="form-label">Provider ID *</label><input class="form-input" id="ac-provider" placeholder="Provider ID"></div>'+
        '<div class="form-group"><label class="form-label">账号名称 *</label><input class="form-input" id="ac-name" placeholder="如：通知邮箱"></div>'+
        '<div class="form-group"><label class="form-label">邮箱地址 *</label><input class="form-input" id="ac-email" placeholder="noreply@example.com"></div>'+
        '<div class="form-group"><label class="form-label">显示名称</label><input class="form-input" id="ac-display" placeholder="如：Teaven 通知"></div>'+
        '<div class="form-group"><label class="form-label">每日限额</label><input class="form-input" id="ac-limit" type="number" value="1000"></div>'+
        '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;"><button class="btn btn-ghost" onclick="this.closest(\\'.modal-overlay\\').remove()">取消</button><button class="btn btn-primary" id="ac-save-btn">创建</button></div></div>';
      document.body.appendChild(overlay);
      overlay.querySelector('#ac-save-btn').addEventListener('click',async function(){
        var provider_id=overlay.querySelector('#ac-provider').value.trim();
        var name=overlay.querySelector('#ac-name').value.trim();
        var email=overlay.querySelector('#ac-email').value.trim();
        var display_name=overlay.querySelector('#ac-display').value.trim();
        var daily_limit=parseInt(overlay.querySelector('#ac-limit').value||'1000');
        if(!provider_id||!name||!email){toast('请填写所有必填字段','error');return}
        var resp=await api('/providers/accounts',{method:'POST',body:JSON.stringify({provider_id:provider_id,name:name,email:email,display_name:display_name||null,daily_limit:daily_limit})});
        if(resp.success){overlay.remove();renderPage('providers');toast('账号创建成功')}
        else toast(resp.error,'error');
      });
      overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove()});
    }

    async function deleteAccount(id){
      if(!confirm('确定删除此发件账号？'))return;
      await api('/providers/accounts/'+id,{method:'DELETE'});
      renderPage('providers');
      toast('账号已删除');
    }

    function showRouteModal(){
      var overlay=document.createElement('div');
      overlay.className='modal-overlay';
      overlay.innerHTML='<div class="modal"><div class="modal-title">添加分类路由</div>'+
        '<div class="form-group"><label class="form-label">分类 *</label><select class="form-select" id="rt-category"><option value="VERIFY">VERIFY</option><option value="NOTIFY">NOTIFY</option><option value="MARKETING">MARKETING</option><option value="SYSTEM">SYSTEM</option></select></div>'+
        '<div class="form-group"><label class="form-label">Provider ID *</label><input class="form-input" id="rt-provider" placeholder="Provider ID"></div>'+
        '<div class="form-group"><label class="form-label">账号 ID（可选）</label><input class="form-input" id="rt-account" placeholder="留空则自动选择"></div>'+
        '<div class="form-group"><label class="form-label">优先级</label><input class="form-input" id="rt-priority" type="number" value="0"></div>'+
        '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;"><button class="btn btn-ghost" onclick="this.closest(\\'.modal-overlay\\').remove()">取消</button><button class="btn btn-primary" id="rt-save-btn">创建</button></div></div>';
      document.body.appendChild(overlay);
      overlay.querySelector('#rt-save-btn').addEventListener('click',async function(){
        var category=overlay.querySelector('#rt-category').value;
        var provider_id=overlay.querySelector('#rt-provider').value.trim();
        var account_id=overlay.querySelector('#rt-account').value.trim()||null;
        var priority=parseInt(overlay.querySelector('#rt-priority').value||'0');
        if(!category||!provider_id){toast('请填写必填字段','error');return}
        var resp=await api('/providers/routes',{method:'POST',body:JSON.stringify({category:category,provider_id:provider_id,account_id:account_id,priority:priority})});
        if(resp.success){overlay.remove();renderPage('providers');toast('路由创建成功')}
        else toast(resp.error,'error');
      });
      overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove()});
    }

    async function deleteRoute(id){
      if(!confirm('确定删除此路由规则？'))return;
      await api('/providers/routes/'+id,{method:'DELETE'});
      renderPage('providers');
      toast('路由已删除');
    }

    async function renderLogs(main){
      if(!API_KEY){main.innerHTML=setupPage();return}
      var resp=await api('/mail/logs?limit=100');
      var logs=resp.data||[];
      main.innerHTML='<h2 style="margin-bottom:24px;">发送日志</h2>'+
        '<div class="card"><div class="table-wrap"><table><thead><tr><th>时间</th><th>收件人</th><th>主题</th><th>分类</th><th>状态</th><th>重试</th></tr></thead><tbody>'+
        logs.map(function(l){
          var badgeClass=l.status==='sent'?'badge-success':l.status==='failed'?'badge-danger':l.status==='pending'?'badge-warning':'badge-muted';
          return'<tr><td style="white-space:nowrap;">'+new Date(l.created_at).toLocaleString('zh-CN')+'</td><td>'+esc(l.to_email)+'</td><td>'+esc(l.subject)+'</td><td><span class="badge badge-info">'+esc(l.category||'-')+'</span></td><td><span class="badge '+badgeClass+'">'+esc(l.status)+'</span></td><td>'+l.retry_count+'</td></tr>';
        }).join('')||'<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">暂无日志</td></tr>'+
        '</tbody></table></div></div>';
    }

    function setupPage(){
      // 先检查是否需要初始化
      fetch(API_BASE+'/setup/status').then(function(r){return r.json()}).then(function(resp){
        var needsSetup=resp.data&&resp.data.needs_setup;
        var main=document.getElementById('main-content');
        if(needsSetup){
          main.innerHTML=initPage();
        }else{
          main.innerHTML='<div class="card" style="max-width:500px;margin:80px auto;"><div class="card-title" style="margin-bottom:16px;">🔑 配置 API Key</div><p style="color:var(--text-muted);margin-bottom:20px;font-size:0.9rem;">请输入你的 Teaven Email API Key 以访问管理后台。</p><div class="form-group"><label class="form-label">API Key</label><input class="form-input" id="setup-key" type="password" placeholder="sk_..." value="'+esc(API_KEY)+'"></div><button class="btn btn-primary" onclick="saveApiKey()" style="width:100%;">保存并进入</button><p class="form-hint" style="margin-top:12px;">API Key 仅存储在浏览器本地，不会上传到任何服务器。</p></div>';
        }
      }).catch(function(){
        document.getElementById('main-content').innerHTML='<div class="card" style="max-width:500px;margin:80px auto;"><div class="card-title" style="margin-bottom:16px;">🔑 配置 API Key</div><p style="color:var(--text-muted);margin-bottom:20px;font-size:0.9rem;">请输入你的 Teaven Email API Key 以访问管理后台。</p><div class="form-group"><label class="form-label">API Key</label><input class="form-input" id="setup-key" type="password" placeholder="sk_..." value="'+esc(API_KEY)+'"></div><button class="btn btn-primary" onclick="saveApiKey()" style="width:100%;">保存并进入</button></div>';
      });
      return'<div style="text-align:center;padding:80px;color:var(--text-muted);">加载中...</div>';
    }

    function initPage(){
      return'<div class="card" style="max-width:500px;margin:60px auto;"><div style="text-align:center;margin-bottom:24px;"><div style="font-size:3rem;margin-bottom:8px;">🚀</div><div class="card-title">欢迎使用 Teaven Email</div><p style="color:var(--text-muted);font-size:0.85rem;margin-top:8px;">首次使用，请创建管理员账户</p></div><div class="form-group"><label class="form-label">姓名</label><input class="form-input" id="init-name" placeholder="如：张三"></div><div class="form-group"><label class="form-label">邮箱</label><input class="form-input" id="init-email" placeholder="admin@example.com"></div><div class="form-group"><label class="form-label">密码（至少6位）</label><input class="form-input" id="init-password" type="password" placeholder="至少6位密码"></div><button class="btn btn-primary" onclick="doInit()" style="width:100%;">创建账户并获取 API Key</button><p class="form-hint" style="margin-top:12px;">创建后请立即复制保存 API Key，它只会显示一次。</p></div>';
    }

    function doInit(){
      var name=document.getElementById('init-name').value.trim();
      var email=document.getElementById('init-email').value.trim();
      var password=document.getElementById('init-password').value;
      if(!name||!email||!password){toast('请填写所有字段','error');return}
      if(password.length<6){toast('密码至少需要6位','error');return}

      fetch(API_BASE+'/setup/init',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({name:name,email:email,password:password})
      }).then(function(r){return r.json()}).then(function(resp){
        if(resp.success){
          var main=document.getElementById('main-content');
          main.innerHTML='<div class="card" style="max-width:600px;margin:60px auto;border-color:var(--success);"><div class="card-title" style="margin-bottom:16px;">🎉 初始化成功！</div><p style="color:var(--text-muted);margin-bottom:8px;">管理员账户: <strong>'+esc(resp.data.user.email)+'</strong></p><p style="color:var(--text-muted);margin-bottom:16px;">以下是你的 API Key，<strong style="color:var(--danger);">请立即复制保存，关闭后将无法再次查看！</strong></p><div class="code-block" style="margin-bottom:16px;"><span class="key-highlight">'+esc(resp.data.api_key.key)+'</span></div><p class="form-hint" style="margin-bottom:20px;">使用方式：<code>Authorization: Bearer '+esc(resp.data.api_key.key)+'</code></p><button class="btn btn-primary" onclick="saveInitKey(\\''+esc(resp.data.api_key.key)+'\\')" style="width:100%;">我已保存，进入后台</button></div>';
        }else{
          toast(resp.error,'error');
        }
      }).catch(function(){toast('网络错误，请重试','error')});
    }

    function saveInitKey(key){
      localStorage.setItem('teaven_api_key',key);
      location.reload();
    }

    function saveApiKey(){
      var key=document.getElementById('setup-key').value.trim();
      if(!key){toast('请输入 API Key','error');return}
      localStorage.setItem('teaven_api_key',key);
      location.reload();
    }

    if(API_KEY){renderPage('dashboard')}
    else{document.getElementById('main-content').innerHTML=setupPage()}
  </script>
</body>
</html>`;
}
