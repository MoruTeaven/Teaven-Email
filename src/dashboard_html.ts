// Teaven Email - 全新橙色主题 Dashboard HTML
// 设计风格：现代高端、橙色主题、超大字体层次、卡片式布局

export function getDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teaven Email - 多用户邮件平台</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%23f97316'/><text x='16' y='23' text-anchor='middle' font-size='20' font-weight='bold' fill='white'>T</text></svg>">
  <style>
    :root {
      --orange-50:#fff7ed; --orange-100:#ffedd5; --orange-200:#fed7aa; --orange-300:#fdba74;
      --orange-400:#fb923c; --orange-500:#f97316; --orange-600:#ea580c; --orange-700:#c2410c;
      --primary:#f97316; --primary-hover:#ea580c; --primary-rgb:249,115,22;
      --radius-sm:6px; --radius-md:10px; --radius-lg:16px; --radius-xl:24px;
      --ease:cubic-bezier(0.25,1,0.5,1);
      --font-sans:"PingFang SC","Microsoft YaHei",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      --font-mono:"JetBrains Mono","Fira Code","Cascadia Code",Consolas,monospace;
    }
    [data-theme="light"] {
      --bg-base:#fafafa; --bg-elevated:#ffffff; --bg-card:#ffffff; --bg-card-hover:#f8f9fa;
      --bg-input:#f3f4f6; --border:#e5e7eb; --border-light:#f3f4f6;
      --text-primary:#111827; --text-secondary:#4b5563; --text-muted:#9ca3af;
      --success:#059669; --warning:#d97706; --danger:#dc2626; --info:#2563eb;
      --shadow-sm:0 1px 2px rgba(0,0,0,.05); --shadow-md:0 4px 12px rgba(0,0,0,.08);
      --overlay:rgba(0,0,0,.4); --bg-tooltip:#1f2937;
    }
    [data-theme="dark"] {
      --bg-base:#0c0c0d; --bg-elevated:#141415; --bg-card:#1a1a1c; --bg-card-hover:#222225;
      --bg-input:#1a1a1c; --border:#2a2a2e; --border-light:#222225;
      --text-primary:#f9fafb; --text-secondary:#9ca3af; --text-muted:#6b7280;
      --success:#34d399; --warning:#fbbf24; --danger:#f87171; --info:#60a5fa;
      --shadow-sm:0 1px 2px rgba(0,0,0,.3); --shadow-md:0 4px 12px rgba(0,0,0,.5);
      --overlay:rgba(0,0,0,.65); --bg-tooltip:#374151;
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{font-size:16px;scroll-behavior:smooth}
    body{font-family:var(--font-sans);background:var(--bg-base);color:var(--text-primary);min-height:100vh;line-height:1.6;-webkit-font-smoothing:antialiased;transition:background .3s,color .3s}
    .app{display:flex;min-height:100vh}

    /* Sidebar */
    .sidebar{width:260px;background:var(--bg-elevated);border-right:1px solid var(--border);position:fixed;top:0;left:0;bottom:0;display:flex;flex-direction:column;z-index:100;transition:transform .3s,width .3s}
    .sidebar.collapsed{width:72px}
    .sidebar.collapsed .nav-text{display:none}
    .sidebar.collapsed .nav-item{justify-content:center;padding:12px}
    .sidebar.collapsed .sidebar-header{padding:20px 12px;text-align:center}
    .sidebar.collapsed .logo-text,.sidebar.collapsed .logo-sub{display:none}
    .sidebar.collapsed .user-detail{display:none}
    .sidebar-header{padding:24px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
    .logo-wrap{display:flex;align-items:center;gap:10px}
    .logo-icon{width:34px;height:34px;background:var(--primary);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1.05rem;flex-shrink:0}
    .logo-text{font-size:1.2rem;font-weight:700;color:var(--text-primary)}
    .logo-sub{font-size:.62rem;font-weight:600;color:var(--primary);letter-spacing:.1em;text-transform:uppercase}
    .sidebar-collapse-btn{width:28px;height:28px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg-card);color:var(--text-muted);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0}
    .sidebar-collapse-btn:hover{color:var(--primary);border-color:var(--primary)}
    .sidebar-nav{flex:1;padding:12px 10px;display:flex;flex-direction:column;gap:2px;overflow-y:auto}
    .nav-item{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:var(--radius-md);color:var(--text-secondary);font-size:.85rem;font-weight:500;cursor:pointer;transition:all .15s;border:none;background:transparent;width:100%;text-align:left;position:relative}
    .nav-icon{width:20px;height:20px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--text-muted)}
    .nav-item:hover{background:var(--bg-card-hover);color:var(--text-primary)}
    .nav-item:hover .nav-icon{color:var(--text-secondary)}
    .nav-item.active{background:rgba(var(--primary-rgb),.1);color:var(--primary);font-weight:600}
    .nav-item.active .nav-icon{color:var(--primary)}
    .nav-item.active::before{content:'';position:absolute;left:0;top:8px;bottom:8px;width:3px;background:var(--primary);border-radius:0 3px 3px 0}
    .sidebar-footer{padding:14px 18px;border-top:1px solid var(--border);display:flex;align-items:center;gap:10px}
    .user-avatar{width:34px;height:34px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem;color:#fff;flex-shrink:0}
    .user-name{font-size:.82rem;font-weight:600;color:var(--text-primary)}
    .user-email{font-size:.68rem;color:var(--text-muted)}
    .admin-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;background:rgba(var(--primary-rgb),.12);border:1px solid rgba(var(--primary-rgb),.25);border-radius:100px;font-size:.6rem;font-weight:600;color:var(--primary);text-transform:uppercase}

    /* Top Header */
    .top-header{position:sticky;top:0;z-index:50;background:var(--bg-elevated);border-bottom:1px solid var(--border);padding:0 28px;height:52px;display:flex;align-items:center;justify-content:space-between;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
    .breadcrumb{display:flex;align-items:center;gap:8px;font-size:.78rem;color:var(--text-muted)}
    .breadcrumb-sep{color:var(--text-muted)}
    .breadcrumb-current{color:var(--text-primary);font-weight:500}
    .header-actions{display:flex;align-items:center;gap:10px}
    .header-btn{width:34px;height:34px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg-card);color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
    .header-btn:hover{color:var(--primary);border-color:var(--primary)}
    .header-btn svg{width:17px;height:17px}
    .mobile-toggle{display:none;width:34px;height:34px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg-card);color:var(--text-secondary);cursor:pointer;align-items:center;justify-content:center;flex-shrink:0}

    /* Main */
    .main{flex:1;margin-left:260px;transition:margin-left .3s}
    .main.expanded{margin-left:72px}
    .main-inner{padding:28px;max-width:1400px}
    .page-header{margin-bottom:28px}
    .page-title{font-size:1.6rem;font-weight:700;color:var(--text-primary)}
    .page-subtitle{font-size:.72rem;color:var(--text-muted);margin-top:2px;font-family:var(--font-mono);letter-spacing:.04em}

    /* Stats */
    .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-bottom:28px}
    .stat-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:22px;position:relative;overflow:hidden;transition:all .2s}
    .stat-card:hover{box-shadow:var(--shadow-md);transform:translateY(-2px)}
    .stat-card::after{content:'';position:absolute;top:0;left:0;right:0;height:3px}
    .stat-card.purple::after{background:linear-gradient(90deg,var(--primary),transparent)}
    .stat-card.green::after{background:linear-gradient(90deg,var(--success),transparent)}
    .stat-card.blue::after{background:linear-gradient(90deg,var(--info),transparent)}
    .stat-card.amber::after{background:linear-gradient(90deg,var(--warning),transparent)}
    .stat-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}
    .stat-icon-box{width:38px;height:38px;border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center}
    .stat-icon-box.orange{background:rgba(var(--primary-rgb),.12);color:var(--primary)}
    .stat-icon-box svg{width:18px;height:18px}
    .stat-value{font-size:1.8rem;font-weight:800;color:var(--text-primary);line-height:1;margin-bottom:2px}
    .stat-label{font-size:.68rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em}

    /* Cards */
    .card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);transition:all .2s;overflow:hidden}
    .card-padded{padding:22px}
    .card-header{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;border-bottom:1px solid var(--border-light)}
    .card-title{font-size:.9rem;font-weight:600;color:var(--text-primary)}
    .card-body{padding:22px}
    .card-footer{padding:14px 22px;border-top:1px solid var(--border-light);display:flex;justify-content:flex-end;gap:8px}

    /* Buttons */
    .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 16px;border-radius:var(--radius-sm);font-size:.8rem;font-weight:600;cursor:pointer;border:none;transition:all .15s;white-space:nowrap;font-family:var(--font-sans)}
    .btn svg{width:15px;height:15px}
    .btn-primary{background:var(--primary);color:#fff;box-shadow:0 2px 8px rgba(var(--primary-rgb),.25)}
    .btn-primary:hover{background:var(--primary-hover);transform:translateY(-1px)}
    .btn-secondary{background:var(--bg-card);color:var(--text-primary);border:1px solid var(--border)}
    .btn-secondary:hover{background:var(--bg-card-hover);border-color:var(--text-muted)}
    .btn-danger{background:transparent;color:var(--danger);border:1px solid var(--danger)}
    .btn-danger:hover{background:var(--danger);color:#fff}
    .btn-ghost{background:transparent;color:var(--text-secondary);border:1px solid transparent}
    .btn-ghost:hover{background:var(--bg-card-hover);color:var(--text-primary)}
    .btn-sm{padding:4px 10px;font-size:.7rem}
    .btn-sm svg{width:13px;height:13px}
    .btn-lg{padding:12px 28px;font-size:.9rem}
    .btn-group{display:flex;gap:6px}

    /* Form */
    .form-group{margin-bottom:16px}
    .form-label{display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:6px}
    .form-label .required{color:var(--danger);margin-left:2px}
    .form-input,.form-select,.form-textarea{width:100%;padding:10px 14px;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);font-size:.85rem;outline:none;transition:all .15s;font-family:var(--font-sans)}
    .form-input:focus,.form-select:focus,.form-textarea:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(var(--primary-rgb),.12)}
    .form-input::placeholder{color:var(--text-muted)}
    .form-textarea{min-height:160px;resize:vertical;font-family:var(--font-mono);font-size:.78rem}
    .form-select{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:36px}
    .form-hint{font-size:.7rem;color:var(--text-muted);margin-top:4px}
    .form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}

    /* Badges */
    .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:100px;font-size:.66rem;font-weight:600;white-space:nowrap}
    .badge-success{background:rgba(5,150,105,.1);color:var(--success);border:1px solid rgba(5,150,105,.2)}
    .badge-warning{background:rgba(217,119,6,.1);color:var(--warning);border:1px solid rgba(217,119,6,.2)}
    .badge-danger{background:rgba(220,38,38,.1);color:var(--danger);border:1px solid rgba(220,38,38,.2)}
    .badge-info{background:rgba(var(--primary-rgb),.1);color:var(--primary);border:1px solid rgba(var(--primary-rgb),.2)}
    .badge-muted{background:var(--bg-card-hover);color:var(--text-muted);border:1px solid var(--border)}
    .badge-super{background:rgba(var(--primary-rgb),.15);color:var(--primary);font-size:.6rem;padding:2px 6px;margin-left:6px}

    /* Table */
    .table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
    .table{width:100%;border-collapse:collapse;font-size:.8rem}
    .table th{text-align:left;padding:10px 14px;font-weight:600;font-size:.68rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid var(--border);white-space:nowrap;cursor:pointer;user-select:none}
    .table th:hover{color:var(--text-secondary)}
    .table td{padding:10px 14px;border-bottom:1px solid var(--border-light);color:var(--text-secondary);font-size:.8rem}
    .table tr:hover td{background:var(--bg-card-hover)}
    .table tr:last-child td{border-bottom:none}

    /* Toolbar */
    .toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:10px}
    .toolbar-left{display:flex;align-items:center;gap:10px;flex:1}
    .toolbar-right{display:flex;align-items:center;gap:8px}
    .search-input{width:220px;padding:8px 12px 8px 34px;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);font-size:.8rem;outline:none;transition:all .15s;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.3-4.3'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:10px center}
    .search-input:focus{border-color:var(--primary);width:280px}

    /* Pagination */
    .pagination{display:flex;align-items:center;justify-content:space-between;padding:14px 0;font-size:.78rem;color:var(--text-muted)}
    .pagination-pages{display:flex;gap:3px}
    .pagination-btn{width:30px;height:30px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg-card);color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.75rem;transition:all .15s}
    .pagination-btn:hover:not(:disabled){border-color:var(--primary);color:var(--primary)}
    .pagination-btn.active{background:var(--primary);border-color:var(--primary);color:#fff}
    .pagination-btn:disabled{opacity:.3;cursor:not-allowed}

    /* Tabs */
    .tabs{display:flex;border-bottom:1px solid var(--border);margin-bottom:22px}
    .tab{padding:10px 18px;border:none;background:transparent;color:var(--text-muted);cursor:pointer;font-size:.82rem;font-weight:500;border-bottom:2px solid transparent;transition:all .15s;margin-bottom:-1px;font-family:var(--font-sans)}
    .tab:hover{color:var(--text-primary)}
    .tab.active{color:var(--primary);border-bottom-color:var(--primary)}

    /* Modal */
    .modal-overlay{position:fixed;inset:0;background:var(--overlay);display:flex;align-items:center;justify-content:center;z-index:1000;padding:24px;animation:fadeIn .2s}
    .modal{background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-lg);width:100%;max-width:560px;max-height:85vh;overflow-y:auto;animation:slideUp .25s}
    .modal-header{padding:18px 22px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
    .modal-title{font-size:1rem;font-weight:600}
    .modal-close{width:26px;height:26px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg-card);color:var(--text-muted);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
    .modal-close:hover{color:var(--danger);border-color:var(--danger)}
    .modal-body{padding:22px}
    .modal-footer{padding:14px 22px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px}

    /* Toast */
    .toast-container{position:fixed;top:20px;right:20px;z-index:2000;display:flex;flex-direction:column;gap:8px}
    .toast{padding:12px 20px;border-radius:var(--radius-md);color:#fff;font-size:.8rem;font-weight:500;box-shadow:var(--shadow-md);animation:toastIn .35s;display:flex;align-items:center;gap:8px;min-width:260px}
    .toast-success{background:#059669}
    .toast-error{background:#dc2626}
    .toast-warning{background:#d97706}
    .toast-info{background:#2563eb}
    .toast svg{width:16px;height:16px;flex-shrink:0}

    /* Empty State */
    .empty-state{text-align:center;padding:48px 24px}
    .empty-icon{width:56px;height:56px;margin:0 auto 16px;background:var(--bg-card-hover);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--text-muted)}
    .empty-title{font-size:.95rem;font-weight:600;margin-bottom:6px;color:var(--text-primary)}
    .empty-desc{font-size:.78rem;color:var(--text-muted);max-width:340px;margin:0 auto}

    /* Code */
    .code-block{background:var(--bg-base);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;font-family:var(--font-mono);font-size:.76rem;overflow-x:auto;white-space:pre-wrap;word-break:break-all;color:var(--text-secondary)}
    .key-highlight{background:rgba(var(--primary-rgb),.15);color:var(--primary);padding:2px 8px;border-radius:3px;font-weight:600}

    /* List card */
    .list-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden}
    .list-item{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border-light);transition:all .15s}
    .list-item:last-child{border-bottom:none}
    .list-item:hover{background:var(--bg-card-hover)}
    .list-item-info{flex:1}
    .list-item-title{font-size:.92rem;font-weight:600;color:var(--text-primary);margin-bottom:2px}
    .list-item-subtitle{font-size:.76rem;color:var(--text-muted)}
    .list-item-actions{display:flex;gap:6px;align-items:center}

    /* Impersonation */
    .imp-banner{position:fixed;top:0;left:260px;right:0;z-index:60;background:rgba(var(--primary-rgb),.1);border-bottom:1px solid rgba(var(--primary-rgb),.2);padding:8px 20px;display:flex;align-items:center;justify-content:space-between;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);font-size:.76rem;color:var(--primary);transition:left .3s}
    .imp-banner.hidden{display:none}
    .main.expanded .imp-banner{left:72px}
    .imp-banner-btn{padding:4px 10px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);cursor:pointer;font-size:.7rem;font-weight:500;transition:all .15s;text-decoration:none}
    .imp-banner-btn:hover{border-color:var(--primary)}

    /* Sidebar overlay */
    .sidebar-overlay{display:none;position:fixed;inset:0;background:var(--overlay);z-index:99;opacity:0;transition:opacity .3s;pointer-events:none}
    .sidebar-overlay.active{opacity:1;pointer-events:auto}

    /* Grid */
    .grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}

    /* Toggle */
    .toggle{position:relative;display:inline-block;width:40px;height:22px;cursor:pointer}
    .toggle input{display:none}
    .toggle-slider{position:absolute;inset:0;background:var(--border);border-radius:22px;transition:all .2s}
    .toggle-slider::before{content:'';position:absolute;width:16px;height:16px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:all .2s}
    .toggle input:checked+.toggle-slider{background:var(--primary)}
    .toggle input:checked+.toggle-slider::before{transform:translateX(18px)}

    /* Animations */
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes slideUp{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes toastIn{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}
    .spinner{animation:spin 1s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}

    /* Responsive */
    @media(max-width:1200px){.stats-grid{grid-template-columns:repeat(2,1fr)}.grid-2{grid-template-columns:1fr}.form-row{grid-template-columns:1fr}}
    @media(max-width:768px){
      .sidebar{transform:translateX(-100%);width:260px}
      .sidebar.mobile-open{transform:translateX(0)}
      .sidebar-overlay{display:block}
      .main{margin-left:0!important}
      .main-inner{padding:16px 12px}
      .top-header{padding:0 14px}
      .mobile-toggle{display:flex}
      .stats-grid{grid-template-columns:1fr}
      .page-title{font-size:1.3rem}
    }
  </style>
</head>
<body>
  <div class="app" id="app">
    <div class="sidebar-overlay" id="sidebarOverlay" onclick="closeMobileSidebar()"></div>

    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <div class="logo-wrap">
          <div class="logo-icon">T</div>
          <div>
            <div class="logo-text">Teaven</div>
            <div class="logo-sub">Mail Platform</div>
          </div>
        </div>
        <button class="sidebar-collapse-btn" onclick="toggleSidebar()" title="折叠">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/></svg>
        </button>
      </div>
      <nav class="sidebar-nav">
        <button class="nav-item active" data-page="dashboard">
          <span class="nav-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></span>
          <span class="nav-text">仪表盘</span>
        </button>
        <button class="nav-item" data-page="api-keys">
          <span class="nav-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg></span>
          <span class="nav-text">API Keys</span>
        </button>
        <button class="nav-item" data-page="templates">
          <span class="nav-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg></span>
          <span class="nav-text">模板管理</span>
        </button>
        <button class="nav-item" data-page="providers">
          <span class="nav-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.87 6.87a8 8 0 1 0 10.26 0"/><circle cx="12" cy="12" r="2"/></svg></span>
          <span class="nav-text">发送通道</span>
        </button>
        <button class="nav-item" data-page="logs">
          <span class="nav-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></span>
          <span class="nav-text">发送日志</span>
        </button>
      </nav>
      <div class="sidebar-footer">
        <div class="user-avatar">A</div>
        <div class="user-detail">
          <div class="user-name">Dashboard</div>
          <div class="user-email">teaven@mail.com</div>
        </div>
      </div>
    </aside>

    <div class="main" id="mainWrap">
      <div class="imp-banner hidden" id="impersonation-banner">
        <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:middle;margin-right:6px"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>正在以管理员身份模拟登录此用户 · 令牌24小时后自动过期</span>
        <button class="imp-banner-btn" onclick="exitImpersonation()">← 返回管理员后台</button>
      </div>

      <header class="top-header">
        <div style="display:flex;align-items:center;gap:10px">
          <button class="mobile-toggle" onclick="toggleMobileSidebar()" title="菜单">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
          </button>
          <div class="breadcrumb">
            <span>Dashboard</span>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-current" id="breadcrumbPage">仪表盘</span>
          </div>
        </div>
        <div class="header-actions">
          <button class="header-btn" id="themeToggle" onclick="toggleTheme()" title="切换主题">
            <svg id="themeIconLight" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            <svg id="themeIconDark" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </button>
          <div class="user-avatar" style="width:28px;height:28px;font-size:.7rem">A</div>
        </div>
      </header>

      <div class="main-inner" id="main-content"></div>
    </div>
  </div>
  <div class="toast-container" id="toast-container"></div>

  <script>
    // Theme init
    (function initTheme() {
      var saved = localStorage.getItem('teaven_theme');
      if (saved) { document.documentElement.setAttribute('data-theme', saved); }
      else if (window.matchMedia('(prefers-color-scheme: dark)').matches) { document.documentElement.setAttribute('data-theme', 'dark'); }
      else { document.documentElement.setAttribute('data-theme', 'light'); }
      updateThemeIcon();
    })();

    function toggleTheme() {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('teaven_theme', next);
      updateThemeIcon();
    }

    function updateThemeIcon() {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      var lightEl = document.getElementById('themeIconLight');
      var darkEl = document.getElementById('themeIconDark');
      if (lightEl) lightEl.style.display = isDark ? 'none' : '';
      if (darkEl) darkEl.style.display = isDark ? '' : 'none';
    }

    // Sidebar
    function toggleSidebar() {
      var sb = document.getElementById('sidebar');
      var main = document.getElementById('mainWrap');
      sb.classList.toggle('collapsed');
      main.classList.toggle('expanded');
      localStorage.setItem('teaven_sidebar_collapsed', sb.classList.contains('collapsed') ? '1' : '0');
    }

    function toggleMobileSidebar() {
      var sb = document.getElementById('sidebar');
      var overlay = document.getElementById('sidebarOverlay');
      sb.classList.toggle('mobile-open');
      overlay.classList.toggle('active');
    }

    function closeMobileSidebar() {
      document.getElementById('sidebar').classList.remove('mobile-open');
      document.getElementById('sidebarOverlay').classList.remove('active');
    }

    // Init sidebar state
    if (localStorage.getItem('teaven_sidebar_collapsed') === '1') {
      document.getElementById('sidebar').classList.add('collapsed');
      document.getElementById('mainWrap').classList.add('expanded');
    }

    const API_BASE = '/v1';
    // 支持通过 URL 参数传递模拟登录令牌（新窗口打开方式）
    (function() {
      var params = new URLSearchParams(window.location.search);
      var impToken = params.get('imp_token');
      if (impToken) {
        localStorage.setItem('teaven_api_key', impToken);
        window.history.replaceState({}, '', '/dashboard');
      }
    })();
    const API_KEY = localStorage.getItem('teaven_api_key') || '';

    // 检测模拟登录并显示提示条
    var isImpersonated = API_KEY.startsWith('imp_');
    if (isImpersonated) {
      document.getElementById('impersonation-banner').classList.remove('hidden');
      document.querySelector('.main').style.paddingTop = '56px';
    }

    function exitImpersonation() {
      var adminKey = localStorage.getItem('teaven_super_admin_key_backup');
      if (adminKey) {
        localStorage.setItem('teaven_admin_key', adminKey);
        localStorage.removeItem('teaven_super_admin_key_backup');
      }
      localStorage.removeItem('teaven_api_key');
      window.location.href = '/admin';
    }

    function esc(s) {
      if (!s) return '';
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    async function api(path, opts = {}) {
      const res = await fetch(API_BASE + path, {
        headers: {
          'Authorization': 'Bearer ' + API_KEY,
          'Content-Type': 'application/json',
          ...opts.headers
        },
        ...opts
      });
      return res.json();
    }

    function toast(msg, type) {
      type = type || 'success';
      var c = document.getElementById('toast-container');
      var icons = {
        success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
      };
      var el = document.createElement('div');
      el.className = 'toast toast-' + type;
      el.innerHTML = (icons[type] || '') + msg;
      c.appendChild(el);
      setTimeout(function() { el.style.opacity='0';el.style.transform='translateX(100%)';el.style.transition='all .3s';setTimeout(function(){el.remove()},300); }, 3500);
    }

    // 导航
    document.querySelectorAll('.nav-item').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        renderPage(btn.dataset.page);
      });
    });

    function renderPage(page) {
      var breadcrumbPage = document.getElementById('breadcrumbPage');
      var names = {dashboard:'仪表盘','api-keys':'API Keys',templates:'模板管理',providers:'发送通道',logs:'发送日志'};
      if (breadcrumbPage) breadcrumbPage.textContent = names[page] || page;
      var main = document.getElementById('main-content');
      switch (page) {
        case 'dashboard': renderDashboard(main); break;
        case 'api-keys': renderApiKeys(main); break;
        case 'templates': renderTemplates(main); break;
        case 'providers': renderProviders(main); break;
        case 'logs': renderLogs(main); break;
      }
    }

    // 仪表盘
    async function renderDashboard(main) {
      if (!API_KEY) { main.innerHTML = setupPage(); return; }
      var resp = await api('/dashboard/overview');
      if (!resp.success) { main.innerHTML = setupPage(); return; }
      var d = resp.data;

      main.innerHTML = \`
        <div class="page-header">
          <h1 class="page-title">仪表盘</h1>
          <p class="page-subtitle">MAIL PLATFORM DASHBOARD</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon orange"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></div>
            <div class="stat-label">今日发送</div>
            <div class="stat-value orange">\${d.today.sent}</div>
            <div class="stat-change">封邮件已投递</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
            <div class="stat-label">送达数量</div>
            <div class="stat-value green">\${d.today.delivered}</div>
            <div class="stat-change">封成功送达</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon red"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg></div>
            <div class="stat-label">发送失败</div>
            <div class="stat-value red">\${d.today.failed}</div>
            <div class="stat-change">封投递失败</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon yellow"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
            <div class="stat-label">退信数量</div>
            <div class="stat-value yellow">\${d.today.bounced}</div>
            <div class="stat-change">封被退回</div>
          </div>
        </div>

        <div class="card" style="margin-bottom: 32px;">
          <div class="card-header">
            <div>
              <div class="card-title">平台概览</div>
              <div class="card-subtitle">RESOURCE STATISTICS</div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;">
            <div style="text-align: center; padding: 24px; background: var(--bg-base); border-radius: var(--radius-md);">
              <div style="font-size: 2rem; font-weight: 800; color: var(--primary);">\${d.templates_count}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 8px;">模板数量</div>
            </div>
            <div style="text-align: center; padding: 24px; background: var(--bg-base); border-radius: var(--radius-md);">
              <div style="font-size: 2rem; font-weight: 800; color: var(--info);">\${d.providers_count}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 8px;">发送通道</div>
            </div>
            <div style="text-align: center; padding: 24px; background: var(--bg-base); border-radius: var(--radius-md);">
              <div style="font-size: 2rem; font-weight: 800; color: var(--success);">\${d.accounts_count}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 8px;">发件账号</div>
            </div>
            <div style="text-align: center; padding: 24px; background: var(--bg-base); border-radius: var(--radius-md);">
              <div style="font-size: 2rem; font-weight: 800; color: var(--warning);">\${d.api_keys_count}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 8px;">API Keys</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">近 7 天发送趋势</div>
              <div class="card-subtitle">SEND TREND / LAST 7 DAYS</div>
            </div>
          </div>
          <div class="list-card">
            \${(d.recent_7_days || []).map(function(s) {
              return '<div class="list-item">' +
                '<div class="list-item-info">' +
                  '<div class="list-item-title">' + esc(s.date) + '</div>' +
                  '<div class="list-item-subtitle">发送: ' + (s.total_sent || 0) + ' / 送达: ' + (s.total_delivered || 0) + ' / 失败: ' + (s.total_failed || 0) + ' / 退信: ' + (s.total_bounced || 0) + '</div>' +
                '</div>' +
                '<div class="list-item-actions">' +
                  '<span class="badge ' + (s.total_failed > 0 ? 'badge-danger' : 'badge-success') + '">' + (s.total_failed > 0 ? '有失败' : '正常') + '</span>' +
                '</div>' +
              '</div>';
            }).join('') || '<div class="empty-state"><div class="empty-title">暂无数据</div></div>'}
          </div>
        </div>
      \`;
    }

    // API Keys
    async function renderApiKeys(main) {
      if (!API_KEY) { main.innerHTML = setupPage(); return; }
      var resp = await api('/api-keys');
      var keys = resp.data || [];

      main.innerHTML = \`
        <div class="page-header">
          <h1 class="page-title">API Keys</h1>
          <p class="page-subtitle">MANAGE YOUR API ACCESS KEYS</p>
        </div>

        <div class="toolbar">
          <div class="toolbar-left"></div>
          <div class="toolbar-right">
            <button class="btn btn-primary" onclick="showCreateApiKeyModal()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              创建 API Key
            </button>
          </div>
        </div>

        <div class="card">
          \${keys.length === 0 ? \`
            <div class="empty-state">
              <div class="empty-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg></div>
              <div class="empty-title">暂无 API Key</div>
              <div class="empty-desc">创建你的第一个 API Key 来开始使用邮件服务</div>
            </div>
          \` : \`
            <div class="list-card">
              \${keys.map(function(k) {
                return '<div class="list-item">' +
                  '<div class="list-item-info">' +
                    '<div class="list-item-title">' + esc(k.name) + '</div>' +
                    '<div class="list-item-subtitle">前缀: ' + esc(k.prefix) + '*** · 最后使用: ' + (k.last_used_at ? new Date(k.last_used_at).toLocaleString('zh-CN') : '从未使用') + '</div>' +
                  '</div>' +
                  '<div class="list-item-actions">' +
                    '<span class="badge ' + (k.enabled ? 'badge-success' : 'badge-muted') + '">' + (k.enabled ? '启用' : '禁用') + '</span>' +
                    '<button class="btn btn-sm btn-ghost" data-keyid="' + esc(k.id) + '" data-keyenabled="' + (!k.enabled ? 1 : 0) + '" onclick="toggleApiKey(this.dataset.keyid, +this.dataset.keyenabled)">' + (k.enabled ? '禁用' : '启用') + '</button>' +
                    '<button class="btn btn-sm btn-danger" data-keyid="' + esc(k.id) + '" onclick="deleteApiKey(this.dataset.keyid)">删除</button>' +
                  '</div>' +
                '</div>';
              }).join('')}
            </div>
          \`}
        </div>
      \`;
    }

    function showCreateApiKeyModal() {
      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = '<div class="modal">' +
        '<div class="modal-title">创建 API Key</div>' +
        '<div class="form-group">' +
          '<label class="form-label">名称</label>' +
          '<input class="form-input" id="ak-name" placeholder="如：官网生产环境">' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">权限</label>' +
          '<div style="display: flex; flex-wrap: wrap; gap: 12px;">' +
            ['SEND_MAIL', 'MANAGE_TEMPLATE', 'READ_LOG', 'MANAGE_PROVIDER'].map(function(p) {
              return '<label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 10px 16px; background: var(--bg-base); border-radius: var(--radius-md);">' +
                '<input type="checkbox" value="' + p + '" ' + (p === 'SEND_MAIL' ? 'checked' : '') + ' class="ak-perm" style="accent-color: var(--primary);">' +
                '<span style="font-size: 0.85rem;">' + p + '</span>' +
              '</label>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-ghost" onclick="this.closest(\\'.modal-overlay\\').remove()">取消</button>' +
          '<button class="btn btn-primary" id="ak-create-btn">创建</button>' +
        '</div>' +
      '</div>';
      document.body.appendChild(overlay);

      overlay.querySelector('#ak-create-btn').addEventListener('click', async function() {
        var name = overlay.querySelector('#ak-name').value.trim();
        if (!name) { toast('请输入名称', 'error'); return; }
        var perms = [...overlay.querySelectorAll('.ak-perm:checked')].map(function(cb) { return cb.value; });
        var resp = await api('/api-keys', { method: 'POST', body: JSON.stringify({ name: name, permissions: perms }) });
        if (resp.success) {
          overlay.remove();
          var main = document.getElementById('main-content');
          main.insertAdjacentHTML('afterbegin', '<div class="card" style="border-color: var(--success); margin-bottom: 24px;" id="key-reveal">' +
            '<div class="card-header">' +
              '<div class="card-title">API Key 创建成功</div>' +
              '<button class="btn btn-sm btn-ghost" onclick="document.getElementById(\\'key-reveal\\').remove()">关闭</button>' +
            '</div>' +
            '<p style="color: var(--text-muted); margin-bottom: 12px;">请立即复制并安全保存此 Key，关闭后将无法再次查看。</p>' +
            '<div class="code-block"><span class="key-highlight">' + esc(resp.data.api_key) + '</span></div>' +
          '</div>');
          renderApiKeys(main);
          toast('API Key 创建成功');
        } else {
          toast(resp.error, 'error');
        }
      });
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    }

    async function toggleApiKey(id, enabled) {
      await api('/api-keys/' + id + '/toggle', { method: 'PUT', body: JSON.stringify({ enabled: enabled }) });
      renderPage('api-keys');
    }

    async function deleteApiKey(id) {
      if (!confirm('确定删除此 API Key？此操作不可撤销。')) return;
      await api('/api-keys/' + id, { method: 'DELETE' });
      renderPage('api-keys');
      toast('API Key 已删除');
    }

    // 模板管理
    async function renderTemplates(main) {
      if (!API_KEY) { main.innerHTML = setupPage(); return; }
      var resp = await api('/templates');
      var templates = resp.data || [];

      main.innerHTML = \`
        <div class="page-header">
          <h1 class="page-title">模板管理</h1>
          <p class="page-subtitle">EMAIL TEMPLATE LIBRARY</p>
        </div>

        <div class="toolbar">
          <div class="toolbar-left"></div>
          <div class="toolbar-right">
            <button class="btn btn-primary" onclick="showTemplateModal()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              创建模板
            </button>
          </div>
        </div>

        <div class="card">
          \${templates.length === 0 ? \`
            <div class="empty-state">
              <div class="empty-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg></div>
              <div class="empty-title">暂无模板</div>
              <div class="empty-desc">创建邮件模板后，通过 API 调用模板编号即可发送邮件</div>
            </div>
          \` : \`
            <div class="list-card">
              \${templates.map(function(t) {
                var vars = typeof t.variables === 'string' ? JSON.parse(t.variables) : (t.variables || []);
                return '<div class="list-item">' +
                  '<div class="list-item-info">' +
                    '<div class="list-item-title"><code style="background: var(--bg-base); padding: 4px 8px; border-radius: 4px; margin-right: 8px;">' + esc(t.template_code) + '</code>' + esc(t.name) + '</div>' +
                    '<div class="list-item-subtitle">分类: <span class="badge badge-info">' + esc(t.category) + '</span> · 版本: v' + t.version + ' · 变量: ' + vars.length + '个</div>' +
                  '</div>' +
                  '<div class="list-item-actions">' +
                    '<button class="btn btn-sm btn-ghost" data-tcode="' + esc(t.template_code) + '" onclick="previewTemplate(this.dataset.tcode)">预览</button>' +
                    '<button class="btn btn-sm btn-ghost" data-tcode="' + esc(t.template_code) + '" onclick="editTemplate(this.dataset.tcode)">编辑</button>' +
                    '<button class="btn btn-sm btn-danger" data-tcode="' + esc(t.template_code) + '" onclick="deleteTemplate(this.dataset.tcode)">删除</button>' +
                  '</div>' +
                '</div>';
              }).join('')}
            </div>
          \`}
        </div>
      \`;
    }

    function showTemplateModal(code) {
      var isEdit = !!code;
      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = '<div class="modal" style="max-width: 720px;">' +
        '<div class="modal-title">' + (isEdit ? '编辑模板' : '创建模板') + '</div>' +
        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">' +
          '<div class="form-group">' +
            '<label class="form-label">模板编号 *</label>' +
            '<input class="form-input" id="tmpl-code" placeholder="如：VERIFY_CODE" ' + (isEdit ? 'disabled' : '') + '>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">模板名称 *</label>' +
            '<input class="form-input" id="tmpl-name" placeholder="如：验证码邮件">' +
          '</div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">分类</label>' +
          '<select class="form-select" id="tmpl-category">' +
            '<option value="VERIFY">VERIFY - 验证</option>' +
            '<option value="NOTIFY">NOTIFY - 通知</option>' +
            '<option value="MARKETING">MARKETING - 营销</option>' +
            '<option value="SYSTEM">SYSTEM - 系统</option>' +
          '</select>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">邮件主题 *</label>' +
          '<input class="form-input" id="tmpl-subject" placeholder="如：您的验证码是 {{code}}">' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">HTML 内容 *</label>' +
          '<textarea class="form-textarea" id="tmpl-html" placeholder="<h1>您的验证码：{{code}}</h1>"></textarea>' +
          '<div class="form-hint">支持 Handlebars 模板语法，变量使用 {{变量名}}</div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">纯文本内容（可选）</label>' +
          '<textarea class="form-input" id="tmpl-text" style="min-height: 80px;" placeholder="自动从 HTML 生成，也可手动输入"></textarea>' +
        '</div>' +
        (isEdit ? '<div class="form-group"><label class="form-label">更新说明</label><input class="form-input" id="tmpl-changelog" placeholder="如：修改了按钮颜色"></div>' : '') +
        '<div class="modal-footer">' +
          '<button class="btn btn-ghost" onclick="this.closest(\\'.modal-overlay\\').remove()">取消</button>' +
          '<button class="btn btn-primary" id="tmpl-save-btn">' + (isEdit ? '更新' : '创建') + '</button>' +
        '</div>' +
      '</div>';
      document.body.appendChild(overlay);

      if (isEdit) {
        api('/templates/' + code).then(function(resp) {
          if (resp.data) {
            overlay.querySelector('#tmpl-code').value = resp.data.template_code;
            overlay.querySelector('#tmpl-name').value = resp.data.name;
            overlay.querySelector('#tmpl-category').value = resp.data.category;
            overlay.querySelector('#tmpl-subject').value = resp.data.subject;
            overlay.querySelector('#tmpl-html').value = resp.data.html;
            overlay.querySelector('#tmpl-text').value = resp.data.text_content || '';
          }
        });
      }

      overlay.querySelector('#tmpl-save-btn').addEventListener('click', async function() {
        var codeVal = overlay.querySelector('#tmpl-code').value.trim();
        var name = overlay.querySelector('#tmpl-name').value.trim();
        var category = overlay.querySelector('#tmpl-category').value;
        var subject = overlay.querySelector('#tmpl-subject').value.trim();
        var html = overlay.querySelector('#tmpl-html').value.trim();
        var textContent = overlay.querySelector('#tmpl-text').value.trim();
        var changelog = overlay.querySelector('#tmpl-changelog') ? overlay.querySelector('#tmpl-changelog').value.trim() : null;

        if (!codeVal || !name || !subject || !html) { toast('请填写所有必填字段', 'error'); return; }

        var method = isEdit ? 'PUT' : 'POST';
        var url = isEdit ? '/templates/' + code : '/templates';
        var body = { template_code: codeVal, name: name, category: category, subject: subject, html: html, text_content: textContent || null };
        if (isEdit && changelog) body.changelog = changelog;

        var resp = await api(url, { method: method, body: JSON.stringify(body) });
        if (resp.success) { overlay.remove(); renderPage('templates'); toast(isEdit ? '模板已更新' : '模板创建成功'); }
        else toast(resp.error, 'error');
      });
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    }

    function editTemplate(code) { showTemplateModal(code); }

    async function deleteTemplate(code) {
      if (!confirm('确定删除模板 "' + code + '"？')) return;
      await api('/templates/' + code, { method: 'DELETE' });
      renderPage('templates');
      toast('模板已删除');
    }

    async function previewTemplate(code) {
      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = '<div class="modal" style="max-width: 800px;">' +
        '<div class="modal-title">预览模板: ' + esc(code) + '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">测试变量 (JSON)</label>' +
          '<input class="form-input" id="pv-vars" placeholder=\\'{"code":"123456"}\\' value="{}">' +
        '</div>' +
        '<div id="pv-result" style="margin: 20px 0;"></div>' +
        '<div style="display: flex; gap: 12px; justify-content: flex-end;">' +
          '<button class="btn btn-ghost" onclick="this.closest(\\'.modal-overlay\\').remove()">关闭</button>' +
          '<button class="btn btn-primary" id="pv-refresh">刷新预览</button>' +
        '</div>' +
      '</div>';
      document.body.appendChild(overlay);

      async function refresh() {
        var vars = {};
        try { vars = JSON.parse(overlay.querySelector('#pv-vars').value); } catch (e) {}
        var resp = await api('/templates/' + code + '/preview', { method: 'POST', body: JSON.stringify({ variables: vars }) });
        var data = resp.data || {};
        overlay.querySelector('#pv-result').innerHTML =
          '<div class="card" style="margin-bottom: 16px;"><div class="form-label">主题</div><div>' + esc(data.subject || '') + '</div></div>' +
          '<div class="card"><div class="form-label">HTML 预览</div><div style="border: 1px solid var(--border); border-radius: var(--radius-md); padding: 24px; background: #fff; color: #000;">' + (data.html || '<em style="color: #999;">无内容</em>') + '</div></div>' +
          (data.render_errors && data.render_errors.length ? '<div style="color: var(--danger); margin-top: 12px;">警告: ' + data.render_errors.join(', ') + '</div>' : '');
      }
      refresh();
      overlay.querySelector('#pv-refresh').addEventListener('click', refresh);
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    }

    // 发送通道（只读）
    async function renderProviders(main) {
      if (!API_KEY) { main.innerHTML = setupPage(); return; }
      var pResp = await api('/providers');
      var providers = pResp.data || [];

      main.innerHTML = \`
        <div class="page-header">
          <h1 class="page-title">发送通道</h1>
          <p class="page-subtitle">MAIL DELIVERY PROVIDERS CONFIGURATION</p>
        </div>

        <div class="card">
          \${providers.length === 0 ? \`
            <div class="empty-state">
              <div class="empty-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22v-5"/><path d="M9 8V2h6v6"/><path d="M15 8H9"/><path d="M3 17v-3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3"/></svg></div>
              <div class="empty-title">暂无发送通道</div>
              <div class="empty-desc">请联系管理员在后台添加全局发送通道配置</div>
            </div>
          \` : \`
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
              \${providers.map(function(p) {
                var config = typeof p.config === 'string' ? JSON.parse(p.config) : p.config;
                var configInfo = p.type === 'smtp' ? 'SMTP: ' + config.host + ':' + config.port : (p.type === 'api' ? 'API: ' + (config.provider_name || 'Generic') : 'Cloudflare: ' + (config.domain || ''));
                return '<div style="background: var(--bg-base); border-radius: var(--radius-md); padding: 20px;">' +
                  '<div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">' +
                    '<div style="font-weight: 600; font-size: 1.05rem;">' + esc(p.name) + '</div>' +
                    '<span class="badge ' + (p.enabled ? 'badge-success' : 'badge-muted') + '">' + (p.enabled ? '启用' : '禁用') + '</span>' +
                  '</div>' +
                  '<div style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 12px;">' + esc(configInfo) + '</div>' +
                  '<span class="badge badge-info">' + esc(p.type) + '</span>' +
                '</div>';
              }).join('')}
            </div>
          \`}
        </div>
      \`;
    }

    // 发送日志
    async function renderLogs(main) {
      if (!API_KEY) { main.innerHTML = setupPage(); return; }
      var resp = await api('/mail/logs?limit=100');
      var logs = resp.data || [];

      main.innerHTML = \`
        <div class="page-header">
          <h1 class="page-title">发送日志</h1>
          <p class="page-subtitle">MAIL DELIVERY LOGS</p>
        </div>

        <div class="card">
          \${logs.length === 0 ? \`
            <div class="empty-state">
              <div class="empty-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
              <div class="empty-title">暂无日志</div>
              <div class="empty-desc">发送邮件后可以在此查看投递状态</div>
            </div>
          \` : \`
            <div class="list-card">
              \${logs.map(function(l) {
                var badgeClass = l.status === 'sent' ? 'badge-success' : l.status === 'failed' ? 'badge-danger' : l.status === 'pending' ? 'badge-warning' : 'badge-muted';
                return '<div class="list-item">' +
                  '<div class="list-item-info">' +
                    '<div class="list-item-title">' + esc(l.to_email) + '</div>' +
                    '<div class="list-item-subtitle">' + new Date(l.created_at).toLocaleString('zh-CN') + ' · ' + esc(l.subject) + '</div>' +
                  '</div>' +
                  '<div class="list-item-actions">' +
                    '<span class="badge badge-info">' + esc(l.category || '-') + '</span>' +
                    '<span class="badge ' + badgeClass + '">' + esc(l.status) + '</span>' +
                    '<span style="color: var(--text-muted); font-size: 0.8rem;">重试: ' + l.retry_count + '</span>' +
                  '</div>' +
                '</div>';
              }).join('')}
            </div>
          \`}
        </div>
      \`;
    }

    // 登录页面
    function setupPage() {
      fetch(API_BASE + '/setup/status').then(function(r) { return r.json(); }).then(function(resp) {
        var needsSetup = resp.data && resp.data.needs_setup;
        var main = document.getElementById('main-content');
        if (needsSetup) {
          main.innerHTML = initPage();
        } else {
          main.innerHTML = loginPage();
        }
      }).catch(function() {
        document.getElementById('main-content').innerHTML = initPage();
      });
      return '<div style="text-align: center; padding: 120px; color: var(--text-muted);">加载中...</div>';
    }

    function loginPage() {
      return '<div style="max-width: 480px; margin: 100px auto;">' +
        '<div style="text-align: center; margin-bottom: 48px;">' +
          '<div style="font-size: 4rem; font-weight: 800; background: linear-gradient(135deg, var(--orange-400), var(--orange-600)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 16px;">Teaven</div>' +
          '<div style="font-size: 1.5rem; font-weight: 600; margin-bottom: 8px;">欢迎回来</div>' +
          '<div style="color: var(--text-muted); font-size: 0.9rem;">登录到邮件管理平台</div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="form-group">' +
            '<label class="form-label">邮箱</label>' +
            '<input class="form-input" id="login-email" type="email" placeholder="admin@example.com" value="' + esc(localStorage.getItem('teaven_email') || '') + '">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">密码</label>' +
            '<input class="form-input" id="login-password" type="password" placeholder="输入密码">' +
          '</div>' +
          '<button class="btn btn-primary btn-lg" onclick="doLogin()" style="width: 100%;">登 录</button>' +
          '<div style="text-align: center; margin-top: 24px; color: var(--text-muted);">' +
            '或 <a href="#" onclick="document.getElementById(\\'main-content\\').innerHTML=apiKeyFallbackPage(); return false;" style="color: var(--primary); text-decoration: none;">使用 API Key 登录</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    }

    function apiKeyFallbackPage() {
      return '<div style="max-width: 480px; margin: 100px auto;">' +
        '<div style="text-align: center; margin-bottom: 48px;">' +
          '<div style="font-size: 3rem; margin-bottom: 16px;"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--primary)"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg></div>' +
          '<div style="font-size: 1.5rem; font-weight: 600; margin-bottom: 8px;">API Key 登录</div>' +
          '<div style="color: var(--text-muted); font-size: 0.9rem;">使用 API Key 直接访问</div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="form-group">' +
            '<label class="form-label">API Key</label>' +
            '<input class="form-input" id="setup-key" type="password" placeholder="sk_...">' +
          '</div>' +
          '<button class="btn btn-primary btn-lg" onclick="saveApiKey()" style="width: 100%;">进 入</button>' +
          '<div style="text-align: center; margin-top: 24px; color: var(--text-muted);">' +
            '<a href="#" onclick="document.getElementById(\\'main-content\\').innerHTML=loginPage(); return false;" style="color: var(--primary); text-decoration: none;">返回账号登录</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    }

    function doLogin() {
      var email = document.getElementById('login-email').value.trim();
      var password = document.getElementById('login-password').value;
      if (!email || !password) { toast('请输入邮箱和密码', 'error'); return; }

      var btn = document.querySelector('.btn-primary');
      btn.disabled = true;
      btn.textContent = '登录中...';

      localStorage.setItem('teaven_email', email);

      fetch(API_BASE + '/setup/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      }).then(function(r) { return r.json(); }).then(function(resp) {
        if (resp.success) {
          // 登录成功后，始终调用 key-from-password 获取/创建 API Key
          fetch(API_BASE + '/setup/key-from-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password, name: 'Dashboard Login' })
          }).then(function(r2) { return r2.json(); }).then(function(resp2) {
            if (resp2.success) {
              localStorage.setItem('teaven_api_key', resp2.data.api_key.key);
              location.reload();
            } else {
              toast('获取 API Key 失败: ' + (resp2.error || '未知错误'), 'error');
              btn.disabled = false;
              btn.textContent = '登 录';
            }
          });
        } else {
          toast(resp.error, 'error');
          btn.disabled = false;
          btn.textContent = '登 录';
        }
      }).catch(function() {
        toast('网络错误', 'error');
        btn.disabled = false;
        btn.textContent = '登 录';
      });
    }

    function initPage() {
      return '<div style="max-width: 480px; margin: 100px auto;">' +
        '<div style="text-align: center; margin-bottom: 48px;">' +
          '<div style="font-size: 4rem; font-weight: 800; background: linear-gradient(135deg, var(--orange-400), var(--orange-600)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 16px;">Teaven</div>' +
          '<div style="font-size: 1.5rem; font-weight: 600; margin-bottom: 8px;">欢迎使用</div>' +
          '<div style="color: var(--text-muted); font-size: 0.9rem;">首次使用，请创建管理员账户</div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="form-group">' +
            '<label class="form-label">姓名</label>' +
            '<input class="form-input" id="init-name" placeholder="如：张三">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">邮箱</label>' +
            '<input class="form-input" id="init-email" placeholder="admin@example.com">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">密码（至少6位）</label>' +
            '<input class="form-input" id="init-password" type="password" placeholder="至少6位密码">' +
          '</div>' +
          '<button class="btn btn-primary btn-lg" onclick="doInit()" style="width: 100%;">创建账户</button>' +
        '</div>' +
      '</div>';
    }

    function doInit() {
      var name = document.getElementById('init-name').value.trim();
      var email = document.getElementById('init-email').value.trim();
      var password = document.getElementById('init-password').value;
      if (!name || !email || !password) { toast('请填写所有字段', 'error'); return; }
      if (password.length < 6) { toast('密码至少需要6位', 'error'); return; }

      fetch(API_BASE + '/setup/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, password: password })
      }).then(function(r) { return r.json(); }).then(function(resp) {
        if (resp.success) {
          localStorage.setItem('teaven_email', email);
          localStorage.setItem('teaven_api_key', resp.data.api_key.key);
          var main = document.getElementById('main-content');
          main.innerHTML = '<div class="card" style="max-width: 560px; margin: 80px auto; border-color: var(--success);">' +
            '<div style="text-align: center; margin-bottom: 32px;">' +
              '<div style="font-size: 3rem; margin-bottom: 16px;"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--success)"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>' +
              '<div style="font-size: 1.5rem; font-weight: 600;">初始化成功！</div>' +
            '</div>' +
            '<p style="color: var(--text-muted); margin-bottom: 8px;">账户: <strong>' + esc(resp.data.user.email) + '</strong></p>' +
            '<p style="color: var(--text-muted); margin-bottom: 12px;">你的 API Key（<strong style="color: var(--danger);">已自动保存</strong>）：</p>' +
            '<div class="code-block" style="margin-bottom: 24px;"><span class="key-highlight">' + esc(resp.data.api_key.key) + '</span></div>' +
            '<button class="btn btn-primary btn-lg" onclick="location.reload()" style="width: 100%;">进入后台</button>' +
          '</div>';
        } else {
          toast(resp.error, 'error');
        }
      }).catch(function() { toast('网络错误，请重试', 'error'); });
    }

    function saveApiKey() {
      var key = document.getElementById('setup-key').value.trim();
      if (!key) { toast('请输入 API Key', 'error'); return; }
      localStorage.setItem('teaven_api_key', key);
      location.reload();
    }

    // 初始化
    if (API_KEY) { renderPage('dashboard'); }
    else { document.getElementById('main-content').innerHTML = setupPage(); }
  </script>
</body>
</html>`;
}
