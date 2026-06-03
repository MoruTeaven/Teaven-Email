// Teaven Email - 超级管理员后台 HTML
export function getAdminHTML(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teaven Email - 超级管理员</title>
  <style>
    :root {
      --bg: #0a0a0f; --bg-card: #14141f; --bg-card-hover: #1a1a2e; --bg-input: #1c1c2e;
      --border: #2a2a3e; --text: #e0e0e8; --text-muted: #8888a0;
      --primary: #6366f1; --primary-hover: #818cf8; --success: #22c55e;
      --warning: #f59e0b; --danger: #ef4444; --info: #3b82f6;
      --radius: 8px; --radius-lg: 12px;
    }
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;line-height:1.6}
    .app{display:flex;min-height:100vh}
    .sidebar{width:260px;background:var(--bg-card);border-right:1px solid var(--border);padding:24px 0;position:fixed;top:0;left:0;bottom:0;overflow-y:auto;z-index:100}
    .sidebar-logo{padding:0 20px 24px;border-bottom:1px solid var(--border);margin-bottom:16px}
    .sidebar-logo h1{font-size:1.25rem;font-weight:700;background:linear-gradient(135deg,var(--primary),#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .sidebar-logo span{font-size:0.75rem;color:var(--text-muted)}
    .nav-item{display:flex;align-items:center;gap:10px;padding:10px 20px;margin:2px 8px;border-radius:var(--radius);color:var(--text-muted);font-size:0.9rem;cursor:pointer;transition:all 0.15s;border:none;background:none;width:calc(100% - 16px)}
    .nav-item:hover{background:var(--bg-card-hover);color:var(--text)}
    .nav-item.active{background:var(--primary);color:#fff}
    .main{margin-left:260px;flex:1;padding:32px;max-width:1400px}
    .card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:24px;margin-bottom:20px}
    .card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
    .card-title{font-size:1.1rem;font-weight:600}
    .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:24px}
    .stat-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px}
    .stat-label{font-size:0.8rem;color:var(--text-muted);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px}
    .stat-value{font-size:2rem;font-weight:700}
    .form-group{margin-bottom:16px}
    .form-label{display:block;font-size:0.85rem;color:var(--text-muted);margin-bottom:6px}
    .form-input,.form-select{width:100%;padding:10px 14px;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius);color:var(--text);font-size:0.9rem;outline:none}
    .form-input:focus,.form-select:focus{border-color:var(--primary)}
    .btn{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:var(--radius);font-size:0.9rem;font-weight:500;cursor:pointer;border:none;transition:all 0.15s}
    .btn-primary{background:var(--primary);color:#fff}.btn-primary:hover{background:var(--primary-hover)}
    .btn-danger{background:transparent;color:var(--danger);border:1px solid var(--danger)}.btn-danger:hover{background:var(--danger);color:#fff}
    .btn-ghost{background:transparent;color:var(--text-muted);border:1px solid var(--border)}.btn-ghost:hover{border-color:var(--primary);color:var(--primary)}
    .btn-sm{padding:6px 12px;font-size:0.8rem}
    .table-wrap{overflow-x:auto}
    table{width:100%;border-collapse:collapse}
    th,td{text-align:left;padding:12px 16px;border-bottom:1px solid var(--border)}
    th{font-size:0.8rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;font-weight:600}
    td{font-size:0.9rem}tr:hover td{background:var(--bg-card-hover)}
    .badge{display:inline-block;padding:3px 10px;border-radius:100px;font-size:0.75rem;font-weight:500}
    .badge-success{background:rgba(34,197,94,0.15);color:var(--success)}
    .badge-danger{background:rgba(239,68,68,0.15);color:var(--danger)}
    .badge-info{background:rgba(99,102,241,0.15);color:var(--primary)}
    .badge-warning{background:rgba(245,158,11,0.15);color:var(--warning)}
    .badge-muted{background:rgba(136,136,160,0.15);color:var(--text-muted)}
    .tab{display:flex;gap:4px;margin-bottom:20px;border-bottom:1px solid var(--border)}
    .tab button{padding:10px 20px;border:none;background:none;color:var(--text-muted);cursor:pointer;font-size:0.9rem;border-bottom:2px solid transparent;transition:all 0.15s}
    .tab button:hover{color:var(--text)}
    .tab button.active{color:var(--primary);border-bottom-color:var(--primary)}
    .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:200}
    .modal{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:32px;width:90%;max-width:560px;max-height:80vh;overflow-y:auto}
    .modal-title{font-size:1.2rem;font-weight:600;margin-bottom:20px}
    .toast{position:fixed;top:20px;right:20px;padding:14px 24px;border-radius:var(--radius);color:#fff;font-size:0.9rem;z-index:1000;animation:slideIn 0.3s ease}
    .toast-success{background:var(--success)}.toast-error{background:var(--danger)}
    @keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
    .tag-super{background:rgba(245,158,11,0.2);color:#f59e0b;font-size:0.7rem;padding:2px 6px;border-radius:4px;margin-left:6px}
    @media(max-width:768px){.sidebar{display:none}.main{margin-left:0;padding:16px}}
  </style>
</head>
<body>
<div class="app">
  <nav class="sidebar">
    <div class="sidebar-logo">
      <h1>Teaven Admin</h1>
      <span>超级管理员面板</span>
    </div>
    <button class="nav-item active" data-page="overview">📊 总览</button>
    <button class="nav-item" data-page="tenants">🏢 租户管理</button>
    <button class="nav-item" data-page="providers">📡 Provider 管理</button>
    <button class="nav-item" data-page="accounts">📧 发件账号</button>
  </nav>
  <main class="main" id="main-content"></main>
</div>
<div id="toast-container"></div>
<script>
var API_BASE='/v1';
var API_KEY=localStorage.getItem('teaven_admin_key')||'';
function esc(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

async function api(path,opts){
  opts=opts||{};
  var res=await fetch(API_BASE+path,{headers:{'Authorization':'Bearer '+API_KEY,'Content-Type':'application/json',...opts.headers},...opts});
  return res.json();
}
function toast(msg,type){
  type=type||'success';
  var c=document.getElementById('toast-container');
  var el=document.createElement('div');
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
    case'overview':renderOverview(main);break;
    case'tenants':renderTenants(main);break;
    case'providers':renderProviders(main);break;
    case'accounts':renderAllAccounts(main);break;
  }
}

async function renderOverview(main){
  var resp=await api('/admin/stats');
  if(!resp.success){main.innerHTML=setupPage();return}
  var d=resp.data;
  main.innerHTML='<h2 style="margin-bottom:24px;">全局总览</h2>'+
    '<div class="stats-grid">'+
      '<div class="stat-card"><div class="stat-label">租户数</div><div class="stat-value" style="color:var(--primary)">'+d.tenants+'</div></div>'+
      '<div class="stat-card"><div class="stat-label">Provider</div><div class="stat-value" style="color:var(--info)">'+d.providers+'</div></div>'+
      '<div class="stat-card"><div class="stat-label">发件账号</div><div class="stat-value" style="color:#a855f7">'+d.accounts+'</div></div>'+
      '<div class="stat-card"><div class="stat-label">模板数</div><div class="stat-value" style="color:var(--warning)">'+d.templates+'</div></div>'+
      '<div class="stat-card"><div class="stat-label">总邮件数</div><div class="stat-value" style="color:var(--success)">'+d.total_mails+'</div></div>'+
      '<div class="stat-card"><div class="stat-label">今日发送</div><div class="stat-value" style="color:var(--info)">'+d.today_sent+'</div></div>'+
      '<div class="stat-card"><div class="stat-label">今日失败</div><div class="stat-value" style="color:var(--danger)">'+d.today_failed+'</div></div>'+
    '</div>';
}

async function renderTenants(main){
  var resp=await api('/admin/tenants');
  var tenants=resp.data||[];
  main.innerHTML='<h2 style="margin-bottom:24px;">租户管理</h2>'+
    '<div style="display:flex;justify-content:flex-end;margin-bottom:16px;"><button class="btn btn-primary" onclick="showCreateTenantModal()">+ 新建租户</button></div>'+
    '<div class="card"><div class="table-wrap"><table><thead><tr><th>名称</th><th>邮箱</th><th>状态</th><th>角色</th><th>API Keys</th><th>模板</th><th>邮件</th><th>操作</th></tr></thead><tbody>'+
    tenants.map(function(t){
      return'<tr><td><strong>'+esc(t.name)+'</strong>'+((t.is_super_admin)?'<span class="tag-super">超管</span>':'')+'</td><td>'+esc(t.email)+'</td><td><span class="badge '+(t.status==='active'?'badge-success':'badge-danger')+'">'+esc(t.status)+'</span></td><td>'+((t.is_super_admin)?'超级管理员':'用户')+'</td><td>'+t.api_key_count+'</td><td>'+t.template_count+'</td><td>'+t.mail_count+'</td><td style="white-space:nowrap;"><button class="btn btn-sm btn-ghost" data-tid="'+esc(t.id)+'" data-tstatus="'+(t.status==='active'?'disabled':'active')+'" onclick="toggleTenant(this.dataset.tid,this.dataset.tstatus)">'+(t.status==='active'?'禁用':'启用')+'</button> <button class="btn btn-sm" style="background:var(--primary);color:#fff;padding:6px 12px;font-size:0.8rem;border:none;border-radius:var(--radius);cursor:pointer;" data-tid="'+esc(t.id)+'" onclick="impersonateTenant(this.dataset.tid)">模拟登录</button></td></tr>';
    }).join('')+'</tbody></table></div></div>';
}

async function toggleTenant(id,status){
  await api('/admin/tenants/'+id,{method:'PUT',body:JSON.stringify({status:status})});
  renderPage('tenants');
  toast('租户状态已更新');
}

async function renderProviders(main){
  var resp=await api('/admin/providers');
  var providers=resp.data||[];

  main.innerHTML='<h2 style="margin-bottom:24px;">Provider 管理</h2>'+
    '<div style="display:flex;justify-content:flex-end;margin-bottom:16px;"><button class="btn btn-primary" onclick="showAdminProviderModal()">+ 添加 Provider</button></div>'+
    '<div class="card"><div class="table-wrap"><table><thead><tr><th>名称</th><th>类型</th><th>优先级</th><th>状态</th><th>操作</th></tr></thead><tbody>'+
    providers.map(function(p){
      var config=typeof p.config==='string'?JSON.parse(p.config):p.config;
      var configInfo=p.type==='smtp'?'SMTP: '+config.host+':'+config.port:(p.type==='api'?'API: '+(config.provider_name||'Generic'):'Cloudflare: '+(config.domain||''));
      return'<tr><td><strong>'+esc(p.name)+'</strong><div style="color:var(--text-muted);font-size:0.8rem;">'+esc(configInfo)+'</div></td><td><span class="badge badge-info">'+esc(p.type)+'</span></td><td>'+p.priority+'</td><td><span class="badge '+(p.enabled?'badge-success':'badge-muted')+'">'+(p.enabled?'启用':'禁用')+'</span></td><td><button class="btn btn-sm btn-ghost" data-pid="'+esc(p.id)+'" data-penabled="'+(!p.enabled?1:0)+'" onclick="toggleProvider(this.dataset.pid,+this.dataset.penabled)">'+(p.enabled?'禁用':'启用')+'</button> <button class="btn btn-sm btn-danger" data-pid="'+esc(p.id)+'" onclick="deleteAdminProvider(this.dataset.pid)">删除</button></td></tr>';
    }).join('')||'<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">暂无 Provider</td></tr>'+
    '</tbody></table></div></div>';
}

function showAdminProviderModal(){
  var overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML='<div class="modal"><div class="modal-title">添加 Provider</div>'+
    '<div class="form-group"><label class="form-label">名称 *</label><input class="form-input" id="p-name" placeholder="如：SendGrid 生产"></div>'+
    '<div class="form-group"><label class="form-label">类型 *</label><select class="form-select" id="p-type" onchange="toggleProviderConfig(this.closest(\\'.modal-overlay\\'))"><option value="smtp">SMTP</option><option value="api">第三方 API</option><option value="cloudflare_email">Cloudflare Email</option></select></div>'+
    '<div id="p-config-area"></div>'+
    '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;"><button class="btn btn-ghost" onclick="this.closest(\\'.modal-overlay\\').remove()">取消</button><button class="btn btn-primary" id="p-save-btn">创建</button></div></div>';
  document.body.appendChild(overlay);
  toggleProviderConfig(overlay);

  overlay.querySelector('#p-save-btn').addEventListener('click',async function(){
    var name=overlay.querySelector('#p-name').value.trim();
    var type=overlay.querySelector('#p-type').value;
    if(!name){toast('请输入名称','error');return}
    var config=getProviderConfig(overlay,type);
    if(!config)return;
    var resp=await api('/admin/providers',{method:'POST',body:JSON.stringify({name:name,type:type,config:config})});
    if(resp.success){overlay.remove();renderPage('providers');toast('Provider 创建成功')}
    else toast(resp.error,'error');
  });
  overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove()});
}

function toggleProviderConfig(overlay){
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

function getProviderConfig(overlay,type){
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

async function toggleProvider(id,enabled){
  await api('/admin/providers/'+id,{method:'PUT',body:JSON.stringify({enabled:enabled?1:0})});
  renderPage('providers');
  toast('Provider 状态已更新');
}

async function deleteAdminProvider(id){
  if(!confirm('确定删除此 Provider？此操作不可撤销。'))return;
  await api('/admin/providers/'+id,{method:'DELETE'});
  renderPage('providers');
  toast('Provider 已删除');
}

async function renderAllAccounts(main){
  var accountsResp=await api('/admin/accounts');
  var accounts=accountsResp.data||[];

    main.innerHTML='<h2 style="margin-bottom:24px;">发件账号管理</h2>'+
    '<div style="display:flex;justify-content:flex-end;margin-bottom:16px;"><button class="btn btn-primary" onclick="showAddAccountModal()">+ 添加发件账号</button></div>'+
    '<div class="card"><div class="table-wrap"><table><thead><tr><th>账号名</th><th>邮箱</th><th>Provider</th><th>类型</th><th>今日/限额</th><th>状态</th><th>操作</th></tr></thead><tbody>'+
    accounts.map(function(a){
      return'<tr><td>'+esc(a.name)+'</td><td>'+esc(a.email)+'</td><td>'+esc(a.provider_id||'-')+'</td><td><span class="badge badge-info">'+esc(a.provider_name||'-')+'</span></td><td>'+(a.sent_today||0)+' / '+(a.daily_limit||1000)+'</td><td><span class="badge '+(a.enabled?'badge-success':'badge-muted')+'">'+(a.enabled?'启用':'禁用')+'</span></td><td><button class="btn btn-sm btn-ghost" data-acctid="'+esc(a.id)+'" data-acctenabled="'+(!a.enabled?1:0)+'" onclick="toggleAccount(this.dataset.acctid,+this.dataset.acctenabled)">'+(a.enabled?'禁用':'启用')+'</button> <button class="btn btn-sm btn-danger" data-acctid="'+esc(a.id)+'" onclick="deleteAdminAccount(this.dataset.acctid)">删除</button></td></tr>';
    }).join('')||'<tr><td colspan="7" style="text-align:center;color:var(--text-muted);">暂无非发件账号</td></tr>'+
    '</tbody></table></div></div>';
}

function showAddAccountModal(){
  var overlay=document.createElement('div');
  overlay.className='modal-overlay';

  api('/admin/providers').then(function(resp){
    var providers=resp.data||[];
    overlay.innerHTML='<div class="modal"><div class="modal-title">添加全局发件账号</div>'+
      '<div class="form-group"><label class="form-label">Provider</label><select class="form-select" id="ac-provider">'+providers.map(function(p){return'<option value="'+esc(p.id)+'">'+esc(p.name)+' ('+esc(p.type)+')</option>'}).join('')+'</select></div>'+
      '<div class="form-group"><label class="form-label">账号名称</label><input class="form-input" id="ac-name" placeholder="如：通知邮箱"></div>'+
      '<div class="form-group"><label class="form-label">邮箱地址</label><input class="form-input" id="ac-email" placeholder="noreply@example.com"></div>'+
      '<div class="form-group"><label class="form-label">显示名称</label><input class="form-input" id="ac-display" placeholder="Teaven 通知"></div>'+
      '<div class="form-group"><label class="form-label">每日限额</label><input class="form-input" id="ac-limit" type="number" value="1000"></div>'+
      '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;"><button class="btn btn-ghost" onclick="this.closest(\\'.modal-overlay\\').remove()">取消</button><button class="btn btn-primary" id="ac-save-btn">创建</button></div></div>';
    document.body.appendChild(overlay);

    overlay.querySelector('#ac-save-btn').addEventListener('click',async function(){
      var body={
        provider_id:overlay.querySelector('#ac-provider').value,
        name:overlay.querySelector('#ac-name').value.trim(),
        email:overlay.querySelector('#ac-email').value.trim(),
        display_name:overlay.querySelector('#ac-display').value.trim(),
        daily_limit:parseInt(overlay.querySelector('#ac-limit').value||'1000')
      };
      if(!body.name||!body.email){toast('请填写账号名称和邮箱','error');return}
      var resp=await api('/admin/accounts',{method:'POST',body:JSON.stringify(body)});
      if(resp.success){overlay.remove();renderPage('accounts');toast('账号创建成功')}
      else toast(resp.error,'error');
    });
    overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove()});
  });
}

async function toggleAccount(id,enabled){
  await api('/admin/accounts/'+id,{method:'PUT',body:JSON.stringify({enabled:enabled?1:0})});
  renderPage('accounts');
  toast('账号状态已更新');
}

async function deleteAdminAccount(id){
  if(!confirm('确定删除此发件账号？'))return;
  await api('/admin/accounts/'+id,{method:'DELETE'});
  renderPage('accounts');
  toast('账号已删除');
}

function showCreateTenantModal(){
  var overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML='<div class="modal"><div class="modal-title">新建租户</div>'+
    '<div class="form-group"><label class="form-label">姓名</label><input class="form-input" id="ct-name" placeholder="如：张三"></div>'+
    '<div class="form-group"><label class="form-label">邮箱</label><input class="form-input" id="ct-email" type="email" placeholder="user@example.com"></div>'+
    '<div class="form-group"><label class="form-label">密码（至少6位）</label><input class="form-input" id="ct-password" type="password" placeholder="至少6位密码"></div>'+
    '<div class="form-group"><label class="form-label" style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" id="ct-super" style="accent-color:var(--primary);"> 设为超级管理员</label></div>'+
    '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;"><button class="btn btn-ghost" onclick="this.closest(\\'.modal-overlay\\').remove()">取消</button><button class="btn btn-primary" id="ct-save-btn">创建</button></div></div>';
  document.body.appendChild(overlay);

  overlay.querySelector('#ct-save-btn').addEventListener('click',async function(){
    var name=overlay.querySelector('#ct-name').value.trim();
    var email=overlay.querySelector('#ct-email').value.trim();
    var password=overlay.querySelector('#ct-password').value;
    var isSuper=overlay.querySelector('#ct-super').checked?1:0;
    if(!name||!email||!password){toast('请填写所有字段','error');return}
    if(password.length<6){toast('密码至少需要6位','error');return}

    var resp=await api('/admin/tenants',{method:'POST',body:JSON.stringify({name:name,email:email,password:password,is_super_admin:isSuper})});
    if(resp.success){
      overlay.innerHTML='<div class="modal" style="border-color:var(--success);"><div style="text-align:center;margin-bottom:16px;"><div style="font-size:2.5rem;">'+'\\u2705'+'</div><div class="modal-title">租户创建成功！</div></div>'+
        '<p style="color:var(--text-muted);margin-bottom:8px;">租户: <strong>'+esc(resp.data.user.name)+'</strong> ('+esc(resp.data.user.email)+')</p>'+
        '<p style="color:var(--text-muted);margin-bottom:12px;">API Key（仅显示一次）：</p>'+
        '<div style="background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius);padding:12px;margin-bottom:16px;word-break:break-all;font-family:monospace;font-size:0.85rem;color:var(--warning);">'+esc(resp.data.api_key.key)+'</div>'+
        '<button class="btn btn-primary" onclick="this.closest(\\'.modal-overlay\\').remove();renderPage(\\'tenants\\')" style="width:100%;">关闭</button></div>';
      toast('租户创建成功');
    }else{
      toast(resp.error,'error');
    }
  });
  overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove()});
}

async function impersonateTenant(tid){
  var resp=await api('/admin/tenants/'+tid+'/impersonate',{method:'POST'});
  if(!resp.success){toast(resp.error,'error');return}

  var origKey=localStorage.getItem('teaven_admin_key')||'';

  var overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML='<div class="modal" style="border-color:var(--primary);"><div style="text-align:center;margin-bottom:16px;"><div style="font-size:2.5rem;">'+'\\uD83D\\uDD10'+'</div><div class="modal-title">模拟登录</div></div>'+
    '<p style="color:var(--text-muted);margin-bottom:8px;">租户: <strong>'+esc(resp.data.user.name)+'</strong> ('+esc(resp.data.user.email)+')</p>'+
    '<p style="color:var(--text-muted);margin-bottom:12px;">生成的 API Key（仅显示一次）：</p>'+
    '<div style="background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius);padding:12px;margin-bottom:16px;word-break:break-all;font-family:monospace;font-size:0.85rem;color:var(--warning);">'+esc(resp.data.api_key.key)+'</div>'+
    '<p style="color:var(--text-muted);font-size:0.8rem;margin-bottom:16px;">切换后将进入该租户的管理后台，原始超管 Key 已暂存</p>'+
    '<div style="display:flex;gap:10px;justify-content:flex-end;"><button class="btn btn-ghost" onclick="this.closest(\\'.modal-overlay\\').remove()">取消</button><button class="btn btn-primary" id="impersonate-switch-btn">以此身份登录</button></div></div>';
  document.body.appendChild(overlay);

  overlay.querySelector('#impersonate-switch-btn').addEventListener('click',function(){
    localStorage.setItem('teaven_super_admin_key_backup',origKey);
    localStorage.setItem('teaven_api_key',resp.data.api_key.key);
    localStorage.setItem('teaven_email',resp.data.user.email);
    window.location.href='/dashboard';
  });
  overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove()});
}

function setupPage(){
  fetch(API_BASE+'/setup/status').then(function(r){return r.json()}).then(function(resp){
    var needsSetup=resp.data&&resp.data.needs_setup;
    var main=document.getElementById('main-content');
    if(needsSetup){
      main.innerHTML=initPage();
    }else{
      main.innerHTML=loginPage();
    }
  }).catch(function(){
    document.getElementById('main-content').innerHTML=initPage();
  });
  return'<div style="text-align:center;padding:80px;color:var(--text-muted);">加载中...</div>';
}

function loginPage(){
  return'<div class="card" style="max-width:440px;margin:80px auto;"><div style="text-align:center;margin-bottom:24px;"><div style="font-size:2.5rem;margin-bottom:8px;">🛡</div><div class="card-title">超级管理员登录</div><p style="color:var(--text-muted);font-size:0.85rem;margin-top:6px;">使用超级管理员账号登录</p></div><div class="form-group"><label class="form-label">邮箱</label><input class="form-input" id="login-email" type="email" placeholder="admin@example.com" value="'+esc(localStorage.getItem('teaven_admin_email')||'')+'"></div><div class="form-group"><label class="form-label">密码</label><input class="form-input" id="login-password" type="password" placeholder="输入密码"></div><button class="btn btn-primary" onclick="doLogin()" style="width:100%;">登 录</button><p class="form-hint" style="margin-top:16px;text-align:center;">或 <a href="#" onclick="document.getElementById(\\'main-content\\').innerHTML=apiKeyFallbackPage()" style="color:var(--primary);text-decoration:none;">使用 API Key 登录</a></p></div>';
}

function apiKeyFallbackPage(){
  return'<div class="card" style="max-width:440px;margin:80px auto;"><div style="text-align:center;margin-bottom:24px;"><div style="font-size:2.5rem;margin-bottom:8px;">🔑</div><div class="card-title">API Key 登录</div><p style="color:var(--text-muted);font-size:0.85rem;margin-top:6px;">输入超级管理员的 API Key</p></div><div class="form-group"><label class="form-label">API Key</label><input class="form-input" id="setup-key" type="password" placeholder="sk_..."></div><button class="btn btn-primary" onclick="saveApiKey()" style="width:100%;">进 入</button><p class="form-hint" style="margin-top:16px;text-align:center;"><a href="#" onclick="document.getElementById(\\'main-content\\').innerHTML=loginPage()" style="color:var(--primary);text-decoration:none;">返回账号登录</a></p></div>';
}

function doLogin(){
  var email=document.getElementById('login-email').value.trim();
  var password=document.getElementById('login-password').value;
  if(!email||!password){toast('请输入邮箱和密码','error');return}

  var btn=document.querySelector('#login-email').closest('.card').querySelector('button');
  btn.disabled=true; btn.textContent='登录中...';

  localStorage.setItem('teaven_admin_email',email);

  fetch(API_BASE+'/setup/login',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({email:email,password:password})
  }).then(function(r){return r.json()}).then(function(resp){
    if(resp.success){
      var keys=resp.data.api_keys;
      var activeKey=keys.filter(function(k){return k.enabled})[0];
      if(activeKey){
        fetch(API_BASE+'/setup/key-from-password',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({email:email,password:password,name:'Admin Login'})
        }).then(function(r2){return r2.json()}).then(function(resp2){
          if(resp2.success){
            localStorage.setItem('teaven_admin_key',resp2.data.api_key.key);
            location.reload();
          }else{
            toast('请使用 API Key 登录','error');
            document.getElementById('main-content').innerHTML=apiKeyFallbackPage();
          }
        });
      }else{
        toast('没有可用的 API Key','error');
      }
    }else{
      toast(resp.error,'error');
      btn.disabled=false; btn.textContent='登 录';
    }
  }).catch(function(){
    toast('网络错误','error');
    btn.disabled=false; btn.textContent='登 录';
  });
}

function saveApiKey(){
  var key=document.getElementById('setup-key').value.trim();
  if(!key){toast('请输入 API Key','error');return}
  localStorage.setItem('teaven_admin_key',key);
  location.reload();
}

function initPage(){
  return'<div class="card" style="max-width:440px;margin:60px auto;"><div style="text-align:center;margin-bottom:24px;"><div style="font-size:3rem;margin-bottom:8px;">🚀</div><div class="card-title">初始化超级管理员</div><p style="color:var(--text-muted);font-size:0.85rem;margin-top:8px;">首次使用，请创建超级管理员账户</p></div><div class="form-group"><label class="form-label">姓名</label><input class="form-input" id="init-name" placeholder="如：张三"></div><div class="form-group"><label class="form-label">邮箱</label><input class="form-input" id="init-email" placeholder="admin@example.com"></div><div class="form-group"><label class="form-label">密码（至少6位）</label><input class="form-input" id="init-password" type="password" placeholder="至少6位密码"></div><button class="btn btn-primary" onclick="doInit()" style="width:100%;">创建账户</button></div>';
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
      localStorage.setItem('teaven_admin_email',email);
      localStorage.setItem('teaven_admin_key',resp.data.api_key.key);
      var main=document.getElementById('main-content');
      main.innerHTML='<div class="card" style="max-width:600px;margin:60px auto;border-color:var(--success);"><div style="text-align:center;margin-bottom:16px;"><div style="font-size:3rem;">🎉</div><div class="card-title">初始化成功！</div></div><p style="color:var(--text-muted);margin-bottom:8px;">账户: <strong>'+esc(resp.data.user.email)+'</strong></p><p style="color:var(--text-muted);margin-bottom:12px;">你的 API Key（<strong style="color:var(--danger);">已自动保存</strong>）：</p><div class="code-block" style="margin-bottom:16px;"><span class="key-highlight">'+esc(resp.data.api_key.key)+'</span></div><button class="btn btn-primary" onclick="location.reload()" style="width:100%;">进入后台</button></div>';
    }else{
      toast(resp.error,'error');
    }
  }).catch(function(){toast('网络错误，请重试','error')});
}

if(API_KEY){renderPage('overview')}
else{document.getElementById('main-content').innerHTML=setupPage()}
</script>
</body></html>`;
}
