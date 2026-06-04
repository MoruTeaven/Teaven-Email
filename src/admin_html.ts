// Teaven Email - 全新橙色主题 超级管理员后台 HTML
// 设计风格：现代高端、橙色主题、超大字体层次、卡片式布局

export function getAdminHTML(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teaven Email - 超级管理员</title>
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

/* App Layout */
.app{display:flex;min-height:100vh}

/* Sidebar */
.sidebar{width:260px;background:var(--bg-elevated);border-right:1px solid var(--border);position:fixed;top:0;left:0;bottom:0;display:flex;flex-direction:column;z-index:100;transition:transform .3s,width .3s}
.sidebar.collapsed{width:72px}
.sidebar.collapsed .nav-text,.sidebar.collapsed .nav-arrow,.sidebar.collapsed .sidebar-section-title{display:none}
.sidebar.collapsed .nav-item{justify-content:center;padding:12px}
.sidebar.collapsed .sidebar-header{padding:20px 12px;text-align:center;justify-content:center}
.sidebar.collapsed .logo-text,.sidebar.collapsed .logo-sub{display:none}
.sidebar.collapsed .sidebar-footer .user-detail{display:none}
.sidebar.collapsed .sidebar-footer{justify-content:center}

.sidebar-header{padding:24px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.logo-wrap{display:flex;align-items:center;gap:10px}
.logo-icon{width:34px;height:34px;background:var(--primary);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1.05rem;flex-shrink:0}
.logo-text{font-size:1.2rem;font-weight:700;color:var(--text-primary)}
.logo-sub{font-size:.62rem;font-weight:600;color:var(--primary);letter-spacing:.1em;text-transform:uppercase}
.sidebar-collapse-btn{width:28px;height:28px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg-card);color:var(--text-muted);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0}
.sidebar-collapse-btn:hover{color:var(--primary);border-color:var(--primary)}
.sidebar-nav{flex:1;padding:12px 10px;display:flex;flex-direction:column;gap:2px;overflow-y:auto}
.sidebar-section-title{padding:14px 16px 6px;font-size:.6rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.1em}
.nav-item{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:var(--radius-md);color:var(--text-secondary);font-size:.85rem;font-weight:500;cursor:pointer;transition:all .15s;border:none;background:transparent;width:100%;text-align:left;position:relative}
.nav-icon{width:20px;height:20px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--text-muted)}
.nav-item:hover{background:var(--bg-card-hover);color:var(--text-primary)}
.nav-item:hover .nav-icon{color:var(--text-secondary)}
.nav-item.active{background:rgba(var(--primary-rgb),.1);color:var(--primary);font-weight:600}
.nav-item.active .nav-icon{color:var(--primary)}
.nav-item.active::before{content:'';position:absolute;left:0;top:8px;bottom:8px;width:3px;background:var(--primary);border-radius:0 3px 3px 0}
.nav-badge{font-size:.6rem;padding:2px 8px;border-radius:100px;background:var(--primary);color:#fff;font-weight:600;margin-left:auto}
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
.stat-icon-box.green{background:rgba(5,150,105,.12);color:var(--success)}
.stat-icon-box.blue{background:rgba(37,99,235,.12);color:var(--info)}
.stat-icon-box.amber{background:rgba(217,119,6,.12);color:var(--warning)}
.stat-icon-box.red{background:rgba(220,38,38,.12);color:var(--danger)}
.stat-icon-box svg{width:18px;height:18px}
.stat-change{font-size:.68rem;font-weight:600;padding:3px 8px;border-radius:100px;display:inline-flex;align-items:center;gap:3px}
.stat-change.up{background:rgba(5,150,105,.1);color:var(--success)}
.stat-change.down{background:rgba(220,38,38,.1);color:var(--danger)}
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

/* Toggle */
.toggle{position:relative;display:inline-block;width:40px;height:22px;cursor:pointer}
.toggle input{display:none}
.toggle-slider{position:absolute;inset:0;background:var(--border);border-radius:22px;transition:all .2s}
.toggle-slider::before{content:'';position:absolute;width:16px;height:16px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:all .2s}
.toggle input:checked+.toggle-slider{background:var(--primary)}
.toggle input:checked+.toggle-slider::before{transform:translateX(18px)}

/* Badges */
.badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:100px;font-size:.66rem;font-weight:600;white-space:nowrap}
.badge-success{background:rgba(5,150,105,.1);color:var(--success);border:1px solid rgba(5,150,105,.2)}
.badge-warning{background:rgba(217,119,6,.1);color:var(--warning);border:1px solid rgba(217,119,6,.2)}
.badge-danger{background:rgba(220,38,38,.1);color:var(--danger);border:1px solid rgba(220,38,38,.2)}
.badge-info{background:rgba(var(--primary-rgb),.1);color:var(--primary);border:1px solid rgba(var(--primary-rgb),.2)}
.badge-muted{background:var(--bg-card-hover);color:var(--text-muted);border:1px solid var(--border)}
.badge-primary{background:rgba(var(--primary-rgb),.1);color:var(--primary);border:1px solid rgba(var(--primary-rgb),.2)}
.badge-super{background:rgba(var(--primary-rgb),.15);color:var(--primary);font-size:.6rem;padding:2px 6px;margin-left:6px}

/* Table */
.table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
.table{width:100%;border-collapse:collapse;font-size:.8rem}
.table th{text-align:left;padding:10px 14px;font-weight:600;font-size:.68rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid var(--border);white-space:nowrap;cursor:pointer;user-select:none}
.table th:hover{color:var(--text-secondary)}
.table th .sort-icon{margin-left:4px;font-size:.6rem;opacity:.4}
.table th.sorted .sort-icon{opacity:1;color:var(--primary)}
.table td{padding:10px 14px;border-bottom:1px solid var(--border-light);color:var(--text-secondary);font-size:.8rem}
.table tr:hover td{background:var(--bg-card-hover)}
.table tr:last-child td{border-bottom:none}

/* Toolbar */
.toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:10px}
.toolbar-left{display:flex;align-items:center;gap:10px;flex:1}
.toolbar-right{display:flex;align-items:center;gap:8px}
.search-input{width:220px;padding:8px 12px 8px 34px;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);font-size:.8rem;outline:none;transition:all .15s;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.3-4.3'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:10px center}
.search-input:focus{border-color:var(--primary);width:280px}
.filter-select{padding:8px 32px 8px 12px;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);font-size:.8rem;outline:none;cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center}

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
.modal-lg{max-width:720px}
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
.empty-icon svg{width:24px;height:24px}
.empty-title{font-size:.95rem;font-weight:600;margin-bottom:6px;color:var(--text-primary)}
.empty-desc{font-size:.78rem;color:var(--text-muted);max-width:340px;margin:0 auto}

/* Code */
.code-block{background:var(--bg-base);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;font-family:var(--font-mono);font-size:.76rem;overflow-x:auto;white-space:pre-wrap;word-break:break-all;color:var(--text-secondary)}
.key-highlight{background:rgba(var(--primary-rgb),.15);color:var(--primary);padding:2px 8px;border-radius:3px;font-weight:600}

/* List */
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
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}

/* Timeline */
.timeline{position:relative;padding-left:22px}
.timeline::before{content:'';position:absolute;left:7px;top:0;bottom:0;width:1px;background:var(--border)}
.timeline-item{position:relative;padding-bottom:20px}
.timeline-item:last-child{padding-bottom:0}
.timeline-dot{position:absolute;left:-19px;top:4px;width:9px;height:9px;border-radius:50%;border:2px solid var(--primary);background:var(--bg-card)}
.timeline-dot.green{border-color:var(--success)}
.timeline-dot.red{border-color:var(--danger)}
.timeline-dot.amber{border-color:var(--warning)}
.timeline-time{font-size:.68rem;color:var(--text-muted);margin-bottom:2px}
.timeline-content{font-size:.8rem;color:var(--text-secondary)}
.timeline-title{font-weight:600;color:var(--text-primary);margin-bottom:2px;font-size:.82rem}

/* Charts */
.simple-chart{display:flex;align-items:flex-end;gap:6px;height:150px;padding-top:22px}
.chart-bar{flex:1;border-radius:3px 3px 0 0;transition:all .2s;position:relative;min-width:14px;cursor:pointer}
.chart-bar:hover{opacity:.8;filter:brightness(1.15)}
.chart-bar.orange{background:linear-gradient(to top,var(--primary),rgba(var(--primary-rgb),.3))}
.chart-bar.green{background:linear-gradient(to top,var(--success),rgba(5,150,105,.3))}
.chart-bar.blue{background:linear-gradient(to top,var(--info),rgba(37,99,235,.3))}
.chart-label{text-align:center;font-size:.62rem;color:var(--text-muted);margin-top:6px}
.chart-value{position:absolute;top:-20px;left:50%;transform:translateX(-50%);font-size:.62rem;font-weight:600;color:var(--text-secondary);white-space:nowrap}
.donut-wrap{display:flex;align-items:center;gap:28px;padding:14px}
.donut-svg{flex-shrink:0}
.donut-legend{display:flex;flex-direction:column;gap:10px}
.donut-legend-item{display:flex;align-items:center;gap:8px;font-size:.76rem;color:var(--text-secondary)}
.donut-legend-dot{width:10px;height:10px;border-radius:3px;flex-shrink:0}
.donut-legend-value{font-weight:700;color:var(--text-primary);margin-left:auto}

/* Animations */
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes toastIn{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}
.spinner{animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* Responsive */
@media(max-width:1200px){.stats-grid{grid-template-columns:repeat(2,1fr)}.grid-2,.grid-3{grid-template-columns:1fr}.form-row{grid-template-columns:1fr}}
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
  .imp-banner{left:0!important}
  .toolbar-left{flex-direction:column;align-items:stretch}
  .search-input{width:100%}
  .search-input:focus{width:100%}
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
            <div class="logo-sub">Admin Panel</div>
          </div>
        </div>
        <button class="sidebar-collapse-btn" onclick="toggleSidebar()" title="折叠侧边栏">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/></svg>
        </button>
      </div>
      <nav class="sidebar-nav">
        <div class="sidebar-section-title">概览</div>
        <button class="nav-item active" data-page="dashboard">
          <span class="nav-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></span>
          <span class="nav-text">仪表盘</span>
        </button>
        <div class="sidebar-section-title">管理</div>
        <button class="nav-item" data-page="users">
          <span class="nav-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
          <span class="nav-text">用户管理</span>
          <span class="nav-badge nav-text" id="userCountBadgeAdm">--</span>
        </button>
        <button class="nav-item" data-page="providers">
          <span class="nav-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.87 6.87a8 8 0 1 0 10.26 0"/><circle cx="12" cy="12" r="2"/></svg></span>
          <span class="nav-text">发送通道</span>
        </button>
        <button class="nav-item" data-page="accounts">
          <span class="nav-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></span>
          <span class="nav-text">发件账号</span>
        </button>
        <button class="nav-item" data-page="routes">
          <span class="nav-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h3l3-9 4 18 3-9h5"/></svg></span>
          <span class="nav-text">分类路由</span>
        </button>
        <div class="sidebar-section-title">监控</div>
        <button class="nav-item" data-page="logs">
          <span class="nav-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></span>
          <span class="nav-text">发送日志</span>
        </button>
        <button class="nav-item" data-page="analytics">
          <span class="nav-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg></span>
          <span class="nav-text">数据分析</span>
        </button>
        <div class="sidebar-section-title">系统</div>
        <button class="nav-item" data-page="settings">
          <span class="nav-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg></span>
          <span class="nav-text">系统设置</span>
        </button>
      </nav>
      <div class="sidebar-footer">
        <div class="user-avatar">A</div>
        <div class="user-detail">
          <div class="user-name">Admin</div>
          <div><span class="admin-badge">SUPER ADMIN</span></div>
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
            <span>管理后台</span>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-current" id="breadcrumbPageAdm">仪表盘</span>
          </div>
        </div>
        <div class="header-actions">
          <button class="header-btn" onclick="refreshCurrentPage()" title="刷新">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
          </button>
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

    // Theme
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
      var l = document.getElementById('themeIconLight');
      var d = document.getElementById('themeIconDark');
      if (l) l.style.display = isDark ? 'none' : '';
      if (d) d.style.display = isDark ? '' : 'none';
    }
    // Sidebar
    function toggleSidebar() {
      var sb = document.getElementById('sidebar');
      var m = document.getElementById('mainWrap');
      sb.classList.toggle('collapsed');
      m.classList.toggle('expanded');
      localStorage.setItem('teaven_sidebar_collapsed', sb.classList.contains('collapsed') ? '1' : '0');
    }
    function toggleMobileSidebar() {
      document.getElementById('sidebar').classList.toggle('mobile-open');
      document.getElementById('sidebarOverlay').classList.toggle('active');
    }
    function closeMobileSidebar() {
      document.getElementById('sidebar').classList.remove('mobile-open');
      document.getElementById('sidebarOverlay').classList.remove('active');
    }
    if (localStorage.getItem('teaven_sidebar_collapsed') === '1') {
      document.getElementById('sidebar').classList.add('collapsed');
      document.getElementById('mainWrap').classList.add('expanded');
    }
    function refreshCurrentPage() {
      var page = document.querySelector('.nav-item.active');
      if (page && page.dataset.page) renderPage(page.dataset.page);
    }

    var API_BASE = '/v1';
    var API_KEY = localStorage.getItem('teaven_admin_key') || '';
    var _accountsById = {};
    var _providersData = [];

    function esc(s) {
      if (!s) return '';
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    async function api(path, opts) {
      opts = opts || {};
      var res = await fetch(API_BASE + path, {
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
        success:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        warning:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
      };
      var el = document.createElement('div');
      el.className = 'toast toast-' + type;
      el.innerHTML = (icons[type] || icons.info) + msg;
      c.appendChild(el);
      setTimeout(function(){el.style.opacity='0';el.style.transform='translateX(100%)';el.style.transition='all .3s';setTimeout(function(){el.remove()},300)},3500);
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
      var bp = document.getElementById('breadcrumbPageAdm');
      var names = {dashboard:'仪表盘',users:'用户管理',providers:'发送通道',accounts:'发件账号',routes:'分类路由',logs:'发送日志',analytics:'数据分析',settings:'系统设置'};
      if (bp) bp.textContent = names[page] || page;
      var main = document.getElementById('main-content');
      switch(page) {
        case 'dashboard': renderOverview(main); break;
        case 'users': renderUsers(main); break;
        case 'providers': renderProviders(main); break;
        case 'accounts': renderAllAccounts(main); break;
        case 'routes': renderRoutes(main); break;
        case 'logs': renderLogs(main); break;
        case 'analytics': renderAnalytics(main); break;
        case 'settings': renderSettings(main); break;
      }
    }

    // Placeholder page renderers for new pages
    function renderLogs(main) {
      main.innerHTML = '<div class=\"page-header\"><h1 class=\"page-title\">发送日志</h1><p class=\"page-subtitle\">SEND LOGS</p></div><div class=\"card\"><div class=\"empty-state\"><div class=\"empty-icon\"><svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 20h9\"/><path d=\"M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z\"/></svg></div><div class=\"empty-title\">功能开发中</div><div class=\"empty-desc\">日志查看功能即将上线，敬请期待。</div></div></div>';
    }
    function renderAnalytics(main) {
      main.innerHTML = '<div class=\"page-header\"><h1 class=\"page-title\">数据分析</h1><p class=\"page-subtitle\">ANALYTICS</p></div><div class=\"card\"><div class=\"empty-state\"><div class=\"empty-icon\"><svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M3 3v18h18\"/><path d=\"m19 9-5 5-4-4-3 3\"/></svg></div><div class=\"empty-title\">功能开发中</div><div class=\"empty-desc\">数据分析功能即将上线，敬请期待。</div></div></div>';
    }
    function renderSettings(main) {
      main.innerHTML = '<div class=\"page-header\"><h1 class=\"page-title\">系统设置</h1><p class=\"page-subtitle\">SETTINGS</p></div><div class=\"card\"><div class=\"empty-state\"><div class=\"empty-icon\"><svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42\"/></svg></div><div class=\"empty-title\">功能开发中</div><div class=\"empty-desc\">系统设置功能即将上线，敬请期待。</div></div></div>';
    }

    // 全局总览
    async function renderOverview(main) {
      var resp = await api('/admin/stats');
      if (!resp.success) { main.innerHTML = setupPage(); return; }
      var d = resp.data;

      main.innerHTML = \`
        <div class="page-header">
          <h1 class="page-title">全局总览</h1>
          <p class="page-subtitle">PLATFORM OVERVIEW</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon orange"><span class="fas fa-users"></span></div>
            <div class="stat-label">用户数</div>
            <div class="stat-value orange">\${d.users}</div>
            <div class="stat-change">个活跃用户</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon blue"><span class="fas fa-plug"></span></div>
            <div class="stat-label">发送通道</div>
            <div class="stat-value blue">\${d.providers}</div>
            <div class="stat-change">个通道配置</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon purple"><span class="fas fa-envelope"></span></div>
            <div class="stat-label">发件账号</div>
            <div class="stat-value purple">\${d.accounts}</div>
            <div class="stat-change">个账号</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange"><span class="fas fa-file-lines"></span></div>
            <div class="stat-label">模板数</div>
            <div class="stat-value orange">\${d.templates}</div>
            <div class="stat-change">个邮件模板</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green"><span class="fas fa-paper-plane"></span></div>
            <div class="stat-label">总邮件数</div>
            <div class="stat-value green">\${d.total_mails}</div>
            <div class="stat-change">封已发送</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange"><span class="fas fa-clock"></span></div>
            <div class="stat-label">今日发送</div>
            <div class="stat-value orange">\${d.today_sent}</div>
            <div class="stat-change">封今日</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon red"><span class="fas fa-circle-xmark"></span></div>
            <div class="stat-label">今日失败</div>
            <div class="stat-value red">\${d.today_failed}</div>
            <div class="stat-change">封失败</div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">平台健康状态</div>
              <div class="card-subtitle">PLATFORM HEALTH STATUS</div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
            <div style="text-align: center; padding: 32px 24px; background: var(--bg-base); border-radius: var(--radius-md);">
              <div style="font-size: 3rem; font-weight: 800; color: var(--success); margin-bottom: 12px;">
                <span class="fas fa-circle-check" style="font-size: 3rem;"></span>
              </div>
              <div style="font-size: 1.1rem; font-weight: 600;">运行正常</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">All Systems Operational</div>
            </div>
            <div style="text-align: center; padding: 32px 24px; background: var(--bg-base); border-radius: var(--radius-md);">
              <div style="font-size: 2.5rem; font-weight: 800; color: var(--primary);">\${d.users}</div>
              <div style="font-size: 1.1rem; font-weight: 600; margin-top: 8px;">活跃用户</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Active Users</div>
            </div>
            <div style="text-align: center; padding: 32px 24px; background: var(--bg-base); border-radius: var(--radius-md);">
              <div style="font-size: 2.5rem; font-weight: 800; color: var(--success);">\${d.today_sent > 0 ? ((d.today_sent - d.today_failed) / d.today_sent * 100).toFixed(1) : 100}%</div>
              <div style="font-size: 1.1rem; font-weight: 600; margin-top: 8px;">送达率</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Delivery Rate</div>
            </div>
          </div>
        </div>
      \`;
    }

    // 用户管理
    async function renderUsers(main) {
      var resp = await api('/admin/tenants');
      var users = resp.data || [];

      main.innerHTML = \`
        <div class="page-header">
          <h1 class="page-title">用户管理</h1>
          <p class="page-subtitle">USER MANAGEMENT</p>
        </div>

        <div class="toolbar">
          <div class="toolbar-left"></div>
          <div class="toolbar-right">
            <button class="btn btn-primary" onclick="showCreateUserModal()">
              <span class="fas fa-plus"></span>
              新建用户
            </button>
          </div>
        </div>

        <div class="card">
          \${users.length === 0 ? \`
            <div style="text-align: center; padding: 64px 32px;">
              <div style="width: 80px; height: 80px; margin: 0 auto 24px; background: var(--bg-base); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span class="fas fa-users" style="font-size: 2rem; color: var(--text-muted);"></span>
              </div>
              <div style="font-size: 1.25rem; font-weight: 600; margin-bottom: 8px;">暂无用户</div>
              <div style="font-size: 0.9rem; color: var(--text-muted);">创建第一个用户开始使用平台</div>
            </div>
          \` : \`
            <div class="list-card">
              \${users.map(function(t) {
                return '<div class="list-item">' +
                  '<div class="list-item-info">' +
                    '<div class="list-item-title">' +
                      esc(t.name) +
                      (t.is_super_admin ? '<span class="badge-super">超管</span>' : '') +
                    '</div>' +
                    '<div class="list-item-subtitle">' + esc(t.email) + ' · API Keys: ' + t.api_key_count + ' · 模板: ' + t.template_count + ' · 邮件: ' + t.mail_count + '</div>' +
                  '</div>' +
                  '<div class="list-item-actions">' +
                    '<span class="badge ' + (t.status === 'active' ? 'badge-success' : 'badge-danger') + '">' + esc(t.status) + '</span>' +
                    '<button class="btn btn-sm btn-ghost" data-tid="' + esc(t.id) + '" data-tstatus="' + (t.status === 'active' ? 'disabled' : 'active') + '" onclick="toggleUser(this.dataset.tid, this.dataset.tstatus)">' + (t.status === 'active' ? '禁用' : '启用') + '</button>' +
                    '<button class="btn btn-sm btn-secondary" data-tid="' + esc(t.id) + '" onclick="impersonateUser(this.dataset.tid)">模拟登录</button>' +
                  '</div>' +
                '</div>';
              }).join('')}
            </div>
          \`}
        </div>
      \`;
    }

    async function toggleUser(id, status) {
      await api('/admin/tenants/' + id, { method: 'PUT', body: JSON.stringify({ status: status }) });
      renderPage('users');
      toast('用户状态已更新');
    }

    // 发送通道
    async function renderProviders(main) {
      var resp = await api('/admin/providers');
      var providers = resp.data || [];
      _providersData = providers;

      main.innerHTML = \`
        <div class="page-header">
          <h1 class="page-title">发送通道</h1>
          <p class="page-subtitle">MAIL DELIVERY PROVIDERS</p>
        </div>

        <div class="toolbar">
          <div class="toolbar-left"></div>
          <div class="toolbar-right">
            <button class="btn btn-primary" onclick="showAdminProviderModal()">
              <span class="fas fa-plus"></span>
              添加发送通道
            </button>
          </div>
        </div>

        <div class="card">
          \${providers.length === 0 ? \`
            <div style="text-align: center; padding: 64px 32px;">
              <div style="width: 80px; height: 80px; margin: 0 auto 24px; background: var(--bg-base); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span class="fas fa-plug" style="font-size: 2rem; color: var(--text-muted);"></span>
              </div>
              <div style="font-size: 1.25rem; font-weight: 600; margin-bottom: 8px;">暂无发送通道</div>
              <div style="font-size: 0.9rem; color: var(--text-muted);">添加发送通道以启用邮件投递</div>
            </div>
          \` : \`
            <div class="provider-grid">
              \${providers.map(function(p) {
                var config = typeof p.config === 'string' ? JSON.parse(p.config) : p.config;
                var configInfo = p.type === 'smtp' ? 'SMTP: ' + config.host + ':' + config.port : (p.type === 'api' ? 'API: ' + (config.provider_name || 'Generic') : 'Cloudflare: ' + (config.domain || ''));
                return '<div class="provider-card">' +
                  '<div class="provider-header">' +
                    '<div class="provider-name">' + esc(p.name) + '</div>' +
                    '<span class="badge ' + (p.enabled ? 'badge-success' : 'badge-muted') + '">' + (p.enabled ? '启用' : '禁用') + '</span>' +
                  '</div>' +
                  '<div class="provider-config">' + esc(configInfo) + '</div>' +
                  '<div style="display: flex; justify-content: space-between; align-items: center;">' +
                    '<span class="badge badge-info">' + esc(p.type) + '</span>' +
                    '<div style="display: flex; gap: 8px;">' +
                      '<button class="btn btn-sm btn-ghost" data-pid="' + esc(p.id) + '" data-penabled="' + (!p.enabled ? 1 : 0) + '" onclick="toggleProvider(this.dataset.pid, +this.dataset.penabled)">' + (p.enabled ? '禁用' : '启用') + '</button>' +
                      '<button class="btn btn-sm btn-ghost" data-pid="' + esc(p.id) + '" onclick="showAdminProviderEditModal(this.dataset.pid)">编辑</button>' +
                      '<button class="btn btn-sm btn-danger" data-pid="' + esc(p.id) + '" onclick="deleteAdminProvider(this.dataset.pid)">删除</button>' +
                    '</div>' +
                  '</div>' +
                '</div>';
              }).join('')}
            </div>
          \`}
        </div>
      \`;
    }

    function showAdminProviderModal() {
      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = '<div class="modal">' +
        '<div class="modal-title">添加发送通道</div>' +
        '<div class="form-group">' +
          '<label class="form-label">名称 *</label>' +
          '<input class="form-input" id="p-name" placeholder="如：SendGrid 生产环境">' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">类型 *</label>' +
          '<select class="form-select" id="p-type" onchange="toggleProviderConfig(this.closest(\\'.modal-overlay\\'))">' +
            '<option value="smtp">SMTP</option>' +
            '<option value="api">第三方 API</option>' +
            '<option value="cloudflare_email">Cloudflare Email</option>' +
          '</select>' +
        '</div>' +
        '<div id="p-config-area"></div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-ghost" onclick="this.closest(\\'.modal-overlay\\').remove()">取消</button>' +
          '<button class="btn btn-primary" id="p-save-btn">创建</button>' +
        '</div>' +
      '</div>';
      document.body.appendChild(overlay);
      toggleProviderConfig(overlay);

      overlay.querySelector('#p-save-btn').addEventListener('click', async function() {
        var name = overlay.querySelector('#p-name').value.trim();
        var type = overlay.querySelector('#p-type').value;
        if (!name) { toast('请输入名称', 'error'); return; }
        var config = getProviderConfig(overlay, type);
        if (!config) return;
        var resp = await api('/admin/providers', { method: 'POST', body: JSON.stringify({ name: name, type: type, config: config }) });
        if (resp.success) { overlay.remove(); renderPage('providers'); toast('发送通道创建成功'); }
        else toast(resp.error, 'error');
      });
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    }

    function showAdminProviderEditModal(id) {
      var p = _providersData.find(function(x) { return x.id === id; });
      if (!p) { toast('通道数据未找到', 'error'); return; }
      var config = typeof p.config === 'string' ? JSON.parse(p.config) : p.config;

      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.setAttribute('data-edit-id', id);
      overlay.setAttribute('data-edit-type', p.type);
      overlay.innerHTML = '<div class="modal">' +
        '<div class="modal-title">编辑发送通道</div>' +
        '<div class="form-group">' +
          '<label class="form-label">名称 *</label>' +
          '<input class="form-input" id="p-name" value="' + esc(p.name) + '" placeholder="如：SendGrid 生产环境">' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">类型 *</label>' +
          '<select class="form-select" id="p-type" onchange="toggleProviderConfig(this.closest(\\'.modal-overlay\\'))">' +
            '<option value="smtp"' + (p.type === 'smtp' ? ' selected' : '') + '>SMTP</option>' +
            '<option value="api"' + (p.type === 'api' ? ' selected' : '') + '>第三方 API</option>' +
            '<option value="cloudflare_email"' + (p.type === 'cloudflare_email' ? ' selected' : '') + '>Cloudflare Email</option>' +
          '</select>' +
        '</div>' +
        '<div id="p-config-area"></div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-ghost" onclick="this.closest(\\'.modal-overlay\\').remove()">取消</button>' +
          '<button class="btn btn-primary" id="p-save-btn">保存修改</button>' +
        '</div>' +
      '</div>';
      document.body.appendChild(overlay);

      // 填充配置字段
      var area = overlay.querySelector('#p-config-area');
      if (p.type === 'smtp') {
        area.innerHTML = '<div class="form-group"><label class="form-label">Host *</label><input class="form-input" id="pc-host" value="' + esc(config.host || '') + '" placeholder="smtp.example.com"></div>' +
          '<div class="form-group"><label class="form-label">Port *</label><input class="form-input" id="pc-port" value="' + (config.port || '') + '" placeholder="587" type="number"></div>' +
          '<div class="form-group"><label class="form-label">Username *</label><input class="form-input" id="pc-user" value="' + esc(config.username || '') + '" placeholder="user@example.com"></div>' +
          '<div class="form-group"><label class="form-label">Password</label><input class="form-input" id="pc-pass" type="password" placeholder="留空则不修改"><div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">已保存的密码出于安全原因不显示，留空则保持原密码不变</div></div>' +
          '<div class="form-group"><label class="form-label">加密</label><select class="form-select" id="pc-enc"><option value="tls"' + (config.encryption === 'tls' ? ' selected' : '') + '>TLS</option><option value="ssl"' + (config.encryption === 'ssl' ? ' selected' : '') + '>SSL</option><option value="none"' + (config.encryption === 'none' ? ' selected' : '') + '>None</option></select></div>';
      } else if (p.type === 'api') {
        area.innerHTML = '<div class="form-group"><label class="form-label">Provider 名称</label><select class="form-select" id="pc-pname" onchange="toggleApiProviderFields(this.closest(\\'.modal-overlay\\'))"><option value="sendgrid"' + (config.provider_name === 'sendgrid' ? ' selected' : '') + '>SendGrid</option><option value="mailgun"' + (config.provider_name === 'mailgun' ? ' selected' : '') + '>Mailgun</option><option value="resend"' + (config.provider_name === 'resend' ? ' selected' : '') + '>Resend</option><option value="ahasend"' + (config.provider_name === 'ahasend' ? ' selected' : '') + '>AhaSend</option><option value="generic"' + (config.provider_name === 'generic' || !config.provider_name ? ' selected' : '') + '>通用</option></select></div>' +
          '<div class="form-group" id="pc-url-group"><label class="form-label">API URL（可选）</label><input class="form-input" id="pc-url" value="' + esc(config.api_url || '') + '" placeholder="https://api.example.com/send"></div>' +
          '<div class="form-group" id="pc-accountid-group" style="display: ' + (config.provider_name === 'ahasend' ? 'block' : 'none') + ';"><label class="form-label">Account ID *</label><input class="form-input" id="pc-accountid" value="' + esc(config.account_id || '') + '" placeholder="AhaSend Account ID"></div>' +
          '<div class="form-group"><label class="form-label">API Key</label><input class="form-input" id="pc-apikey" type="password" placeholder="留空则不修改"><div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">已保存的 API Key 出于安全原因不显示，留空则保持原 Key 不变</div></div>';
      } else {
        area.innerHTML = '<div class="form-group"><label class="form-label">域名 *</label><input class="form-input" id="pc-domain" value="' + esc(config.domain || '') + '" placeholder="example.com"></div>' +
          '<div class="form-group"><label class="form-label">DKIM Selector</label><input class="form-input" id="pc-dkim" value="' + esc(config.dkim_selector || '') + '" placeholder="mailchannels"></div>';
      }

      // 如果类型是 api 且是 ahasend，调整 URL/AccountID 显示
      if (p.type === 'api') {
        toggleApiProviderFields(overlay);
      }

      overlay.querySelector('#p-save-btn').addEventListener('click', async function() {
        var name = overlay.querySelector('#p-name').value.trim();
        var type = overlay.querySelector('#p-type').value;
        if (!name) { toast('请输入名称', 'error'); return; }
        var newConfig = getProviderConfig(overlay, type);
        if (!newConfig) return;

        // 合并原始配置：如果敏感字段（密码/API Key）未填，保留原始值
        // 因为后端 updateProvider 会整体替换 config JSON 列
        var mergedConfig = {};
        var origConfig = typeof p.config === 'string' ? JSON.parse(p.config) : p.config;
        if (type === p.type) {
          // 同类型编辑，合并所有原始字段，然后用新值覆盖
          Object.keys(origConfig).forEach(function(k) { mergedConfig[k] = origConfig[k]; });
          Object.keys(newConfig).forEach(function(k) {
            var val = newConfig[k];
            // 敏感字段为空字符串时保留原值
            if ((k === 'password' || k === 'api_key') && val === '') return;
            if (val !== undefined) mergedConfig[k] = val;
          });
        } else {
          // 类型变更，直接用新配置（过滤空敏感字段）
          Object.keys(newConfig).forEach(function(k) {
            if (newConfig[k] !== undefined) mergedConfig[k] = newConfig[k];
          });
        }

        var body = { name: name, type: type, config: mergedConfig };
        var resp = await api('/admin/providers/' + id, { method: 'PUT', body: JSON.stringify(body) });
        if (resp.success) { overlay.remove(); renderPage('providers'); toast('发送通道已更新'); }
        else toast(resp.error, 'error');
      });
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    }

    function toggleProviderConfig(overlay) {
      var type = overlay.querySelector('#p-type').value;
      var area = overlay.querySelector('#p-config-area');
      if (type === 'smtp') {
        area.innerHTML = '<div class="form-group"><label class="form-label">Host *</label><input class="form-input" id="pc-host" placeholder="smtp.example.com"></div>' +
          '<div class="form-group"><label class="form-label">Port *</label><input class="form-input" id="pc-port" placeholder="587" type="number"></div>' +
          '<div class="form-group"><label class="form-label">Username *</label><input class="form-input" id="pc-user" placeholder="user@example.com"></div>' +
          '<div class="form-group"><label class="form-label">Password *</label><input class="form-input" id="pc-pass" type="password" placeholder="••••"></div>' +
          '<div class="form-group"><label class="form-label">加密</label><select class="form-select" id="pc-enc"><option value="tls">TLS</option><option value="ssl">SSL</option><option value="none">None</option></select></div>';
      } else if (type === 'api') {
        area.innerHTML = '<div class="form-group"><label class="form-label">Provider 名称</label><select class="form-select" id="pc-pname" onchange="toggleApiProviderFields(this.closest(\\'.modal-overlay\\'))"><option value="sendgrid">SendGrid</option><option value="mailgun">Mailgun</option><option value="resend">Resend</option><option value="ahasend">AhaSend</option><option value="generic">通用</option></select></div>' +
          '<div class="form-group" id="pc-url-group"><label class="form-label">API URL（可选）</label><input class="form-input" id="pc-url" placeholder="https://api.example.com/send"></div>' +
          '<div class="form-group" id="pc-accountid-group" style="display: none;"><label class="form-label">Account ID *</label><input class="form-input" id="pc-accountid" placeholder="AhaSend Account ID"></div>' +
          '<div class="form-group"><label class="form-label">API Key *</label><input class="form-input" id="pc-apikey" type="password" placeholder="••••"></div>';
      } else {
        area.innerHTML = '<div class="form-group"><label class="form-label">域名 *</label><input class="form-input" id="pc-domain" placeholder="example.com"></div>' +
          '<div class="form-group"><label class="form-label">DKIM Selector</label><input class="form-input" id="pc-dkim" placeholder="mailchannels"></div>';
      }
    }

    function toggleApiProviderFields(overlay) {
      var pname = overlay.querySelector('#pc-pname') ? overlay.querySelector('#pc-pname').value : '';
      var urlGroup = overlay.querySelector('#pc-url-group');
      var accountIdGroup = overlay.querySelector('#pc-accountid-group');
      if (pname === 'ahasend') {
        if (urlGroup) urlGroup.style.display = 'none';
        if (accountIdGroup) accountIdGroup.style.display = 'block';
      } else {
        if (urlGroup) urlGroup.style.display = 'block';
        if (accountIdGroup) accountIdGroup.style.display = 'none';
      }
    }

    function getProviderConfig(overlay, type) {
      if (type === 'smtp') {
        var host = overlay.querySelector('#pc-host') ? overlay.querySelector('#pc-host').value.trim() : '';
        var port = parseInt(overlay.querySelector('#pc-port') ? overlay.querySelector('#pc-port').value : '0');
        var username = overlay.querySelector('#pc-user') ? overlay.querySelector('#pc-user').value.trim() : '';
        var password = overlay.querySelector('#pc-pass') ? overlay.querySelector('#pc-pass').value.trim() : '';
        var encryption = overlay.querySelector('#pc-enc') ? overlay.querySelector('#pc-enc').value : 'tls';
        if (!host || !port || !username || !password) { toast('请填写所有 SMTP 配置', 'error'); return null; }
        return { host: host, port: port, username: username, password: password, encryption: encryption };
      } else if (type === 'api') {
        var api_key = overlay.querySelector('#pc-apikey') ? overlay.querySelector('#pc-apikey').value.trim() : '';
        var provider_name = overlay.querySelector('#pc-pname') ? overlay.querySelector('#pc-pname').value : 'generic';
        var api_url = overlay.querySelector('#pc-url') ? overlay.querySelector('#pc-url').value.trim() : '';
        var account_id = overlay.querySelector('#pc-accountid') ? overlay.querySelector('#pc-accountid').value.trim() : '';
        if (!api_key) { toast('请填写 API Key', 'error'); return null; }
        if (provider_name === 'ahasend' && !account_id) { toast('请填写 AhaSend Account ID', 'error'); return null; }
        var cfg = { api_key: api_key, provider_name: provider_name, api_url: api_url };
        if (account_id) cfg.account_id = account_id;
        return cfg;
      } else {
        var domain = overlay.querySelector('#pc-domain') ? overlay.querySelector('#pc-domain').value.trim() : '';
        var dkim_selector = overlay.querySelector('#pc-dkim') ? overlay.querySelector('#pc-dkim').value.trim() : 'mailchannels';
        if (!domain) { toast('请填写域名', 'error'); return null; }
        return { domain: domain, dkim_selector: dkim_selector };
      }
    }

    async function toggleProvider(id, enabled) {
      await api('/admin/providers/' + id, { method: 'PUT', body: JSON.stringify({ enabled: enabled ? 1 : 0 }) });
      renderPage('providers');
      toast('发送通道状态已更新');
    }

    async function deleteAdminProvider(id) {
      if (!confirm('确定删除此发送通道？此操作不可撤销。')) return;
      await api('/admin/providers/' + id, { method: 'DELETE' });
      renderPage('providers');
      toast('发送通道已删除');
    }

    // 发件账号
    async function renderAllAccounts(main) {
      var accountsResp = await api('/admin/accounts');
      var accounts = accountsResp.data || [];

      // 缓存账号数据供编辑/测试使用
      _accountsById = {};
      accounts.forEach(function(a) { _accountsById[a.id] = a; });

      main.innerHTML = \`
        <div class="page-header">
          <h1 class="page-title">发件账号</h1>
          <p class="page-subtitle">SENDER ACCOUNTS MANAGEMENT</p>
        </div>

        <div class="toolbar">
          <div class="toolbar-left"></div>
          <div class="toolbar-right">
            <button class="btn btn-primary" onclick="showAddAccountModal()">
              <span class="fas fa-plus"></span>
              添加发件账号
            </button>
          </div>
        </div>

        <div class="card">
          \${accounts.length === 0 ? \`
            <div style="text-align: center; padding: 64px 32px;">
              <div style="width: 80px; height: 80px; margin: 0 auto 24px; background: var(--bg-base); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span class="fas fa-envelope" style="font-size: 2rem; color: var(--text-muted);"></span>
              </div>
              <div style="font-size: 1.25rem; font-weight: 600; margin-bottom: 8px;">暂无发件账号</div>
              <div style="font-size: 0.9rem; color: var(--text-muted);">添加发件账号以发送邮件</div>
            </div>
          \` : \`
            <div class="list-card">
              \${accounts.map(function(a) {
                return '<div class="list-item">' +
                  '<div class="list-item-info">' +
                    '<div class="list-item-title">' + esc(a.name) + '</div>' +
                    '<div class="list-item-subtitle">' + esc(a.email) + ' · ' + esc(a.provider_name || '-') + ' · 今日: ' + (a.sent_today || 0) + '/' + (a.daily_limit || 1000) + '</div>' +
                  '</div>' +
                  '<div class="list-item-actions">' +
                    '<span class="badge ' + (a.enabled ? 'badge-success' : 'badge-muted') + '">' + (a.enabled ? '启用' : '禁用') + '</span>' +
                    '<button class="btn btn-sm btn-ghost" data-acctid="' + esc(a.id) + '" onclick="showEditAccountModal(this.dataset.acctid)"><span class="fas fa-edit"></span> 编辑</button>' +
                    '<button class="btn btn-sm btn-ghost" data-acctid="' + esc(a.id) + '" onclick="showTestAccountModal(this.dataset.acctid)"><span class="fas fa-paper-plane"></span> 测试</button>' +
                    '<button class="btn btn-sm btn-ghost" data-acctid="' + esc(a.id) + '" data-acctenabled="' + (!a.enabled ? 1 : 0) + '" onclick="toggleAccount(this.dataset.acctid, +this.dataset.acctenabled)">' + (a.enabled ? '禁用' : '启用') + '</button>' +
                    '<button class="btn btn-sm btn-danger" data-acctid="' + esc(a.id) + '" onclick="deleteAdminAccount(this.dataset.acctid)">删除</button>' +
                  '</div>' +
                '</div>';
              }).join('')}
            </div>
          \`}
        </div>
      \`;
    }

    function showAddAccountModal() {
      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';

      api('/admin/providers').then(function(resp) {
        var providers = resp.data || [];
        overlay.innerHTML = '<div class="modal">' +
          '<div class="modal-title">添加全局发件账号</div>' +
          '<div class="form-group">' +
            '<label class="form-label">发送通道</label>' +
            '<select class="form-select" id="ac-provider">' +
              providers.map(function(p) { return '<option value="' + esc(p.id) + '">' + esc(p.name) + ' (' + esc(p.type) + ')</option>'; }).join('') +
            '</select>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">账号名称</label>' +
            '<input class="form-input" id="ac-name" placeholder="如：通知邮箱">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">邮箱地址</label>' +
            '<input class="form-input" id="ac-email" placeholder="noreply@example.com">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">显示名称</label>' +
            '<input class="form-input" id="ac-display" placeholder="Teaven 通知">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">每日限额</label>' +
            '<input class="form-input" id="ac-limit" type="number" value="1000">' +
          '</div>' +
          '<div class="modal-footer">' +
            '<button class="btn btn-ghost" onclick="this.closest(\\'.modal-overlay\\').remove()">取消</button>' +
            '<button class="btn btn-primary" id="ac-save-btn">创建</button>' +
          '</div>' +
        '</div>';
        document.body.appendChild(overlay);

        overlay.querySelector('#ac-save-btn').addEventListener('click', async function() {
          var body = {
            provider_id: overlay.querySelector('#ac-provider').value,
            name: overlay.querySelector('#ac-name').value.trim(),
            email: overlay.querySelector('#ac-email').value.trim(),
            display_name: overlay.querySelector('#ac-display').value.trim(),
            daily_limit: parseInt(overlay.querySelector('#ac-limit').value || '1000')
          };
          if (!body.name || !body.email) { toast('请填写账号名称和邮箱', 'error'); return; }
          var resp = await api('/admin/accounts', { method: 'POST', body: JSON.stringify(body) });
          if (resp.success) { overlay.remove(); renderPage('accounts'); toast('账号创建成功'); }
          else toast(resp.error, 'error');
        });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
      });
    }

    async function toggleAccount(id, enabled) {
      await api('/admin/accounts/' + id, { method: 'PUT', body: JSON.stringify({ enabled: enabled ? 1 : 0 }) });
      renderPage('accounts');
      toast('账号状态已更新');
    }

    async function deleteAdminAccount(id) {
      if (!confirm('确定删除此发件账号？')) return;
      await api('/admin/accounts/' + id, { method: 'DELETE' });
      renderPage('accounts');
      toast('账号已删除');
    }

    // ==================== 编辑发件账号 ====================
    function showEditAccountModal(acctId) {
      var account = _accountsById[acctId];
      if (!account) { toast('账号数据未找到，请刷新页面', 'error'); return; }

      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';

      api('/admin/providers').then(function(resp) {
        var providers = resp.data || [];
        overlay.innerHTML = '<div class="modal" style="max-width: 500px;">' +
          '<div class="modal-title">编辑发件账号</div>' +
          '<div class="form-group">' +
            '<label class="form-label">发送通道</label>' +
            '<select class="form-select" id="ae-provider">' +
              providers.map(function(p) {
                return '<option value="' + esc(p.id) + '"' + (p.id === account.provider_id ? ' selected' : '') + '>' + esc(p.name) + ' (' + esc(p.type) + ')</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">账号名称</label>' +
            '<input class="form-input" id="ae-name" value="' + esc(account.name) + '" placeholder="如：通知邮箱">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">邮箱地址</label>' +
            '<input class="form-input" id="ae-email" value="' + esc(account.email) + '" placeholder="noreply@example.com">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">显示名称</label>' +
            '<input class="form-input" id="ae-display" value="' + esc(account.display_name || '') + '" placeholder="Teaven 通知">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">每日限额</label>' +
            '<input class="form-input" id="ae-limit" type="number" value="' + (account.daily_limit || 1000) + '">' +
          '</div>' +
          '<div class="modal-footer">' +
            '<button class="btn btn-ghost" onclick="this.closest(\\'.modal-overlay\\').remove()">取消</button>' +
            '<button class="btn btn-primary" id="ae-save-btn">保存修改</button>' +
          '</div>' +
        '</div>';
        document.body.appendChild(overlay);

        overlay.querySelector('#ae-save-btn').addEventListener('click', async function() {
          var body = {
            provider_id: overlay.querySelector('#ae-provider').value,
            name: overlay.querySelector('#ae-name').value.trim(),
            email: overlay.querySelector('#ae-email').value.trim(),
            display_name: overlay.querySelector('#ae-display').value.trim(),
            daily_limit: parseInt(overlay.querySelector('#ae-limit').value || '1000')
          };
          if (!body.name || !body.email) { toast('请填写账号名称和邮箱', 'error'); return; }
          var resp = await api('/admin/accounts/' + acctId, { method: 'PUT', body: JSON.stringify(body) });
          if (resp.success) { overlay.remove(); renderPage('accounts'); toast('账号已更新'); }
          else toast(resp.error, 'error');
        });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
      });
    }

    // ==================== 测试发件账号 ====================
    function showTestAccountModal(acctId) {
      var account = _accountsById[acctId];
      if (!account) { toast('账号数据未找到，请刷新页面', 'error'); return; }

      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = '<div class="modal" style="max-width: 460px;">' +
        '<div class="modal-title">发送测试邮件</div>' +
        '<div style="margin-bottom: 16px; padding: 12px 16px; background: var(--bg-base); border-radius: var(--radius-sm); font-size: 0.85rem; color: var(--text-secondary);">' +
          '<div><strong style="color: var(--text-primary);">账号：</strong>' + esc(account.name) + '</div>' +
          '<div><strong style="color: var(--text-primary);">邮箱：</strong>' + esc(account.email) + '</div>' +
          '<div><strong style="color: var(--text-primary);">通道：</strong>' + esc(account.provider_name || '-') + '</div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">收件邮箱</label>' +
          '<input class="form-input" id="at-to" type="email" value="' + esc(account.email) + '" placeholder="输入收件人邮箱">' +
          '<div style="margin-top: 6px; font-size: 0.78rem; color: var(--text-muted);">默认发给自己，可修改为其他邮箱</div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-ghost" onclick="this.closest(\\'.modal-overlay\\').remove()">取消</button>' +
          '<button class="btn btn-primary" id="at-send-btn"><span class="fas fa-paper-plane"></span> 发送测试</button>' +
        '</div>' +
      '</div>';
      document.body.appendChild(overlay);

      overlay.querySelector('#at-send-btn').addEventListener('click', async function() {
        var btn = this;
        var toEmail = overlay.querySelector('#at-to').value.trim();
        if (!toEmail) { toast('请输入收件邮箱', 'error'); return; }

        btn.disabled = true;
        btn.innerHTML = '<span class="fas fa-spinner fa-spin"></span> 发送中...';

        try {
          var resp = await api('/admin/accounts/' + acctId + '/test', { method: 'POST', body: JSON.stringify({ to: toEmail }) });
          if (resp.success) {
            overlay.remove();
            toast('测试邮件发送成功！请查收 ' + toEmail, 'success');
          } else {
            btn.disabled = false;
            btn.innerHTML = '<span class="fas fa-paper-plane"></span> 发送测试';
            toast('发送失败：' + (resp.error || '未知错误'), 'error');
            if (resp.detail) {
              var detail = document.createElement('div');
              detail.style.cssText = 'margin-top: 12px; padding: 10px 12px; background: var(--bg-base); border-radius: var(--radius-sm); font-size: 0.8rem; color: var(--danger); max-height: 200px; overflow-y: auto; white-space: pre-wrap;';
              detail.textContent = '详细信息：' + resp.detail;
              overlay.querySelector('.modal').appendChild(detail);
            }
          }
        } catch (e) {
          btn.disabled = false;
          btn.innerHTML = '<span class="fas fa-paper-plane"></span> 发送测试';
          toast('请求异常：' + e.message, 'error');
        }
      });
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    }

    // ========== 分类路由管理（超管统一配置） ==========

    var _routesData = [];

    async function renderRoutes(main) {
      var resp = await api('/admin/routes');
      _routesData = resp.data || [];

      // 同时拉取用户和账号列表用于表单选择
      var usersResp = await api('/admin/tenants');
      var users = usersResp.data || [];
      var accountsResp = await api('/admin/accounts');
      var accounts = accountsResp.data || [];

      main.innerHTML = \`
        <div class="page-header">
          <h1 class="page-title">分类路由</h1>
          <p class="page-subtitle">CATEGORY ROUTING MANAGEMENT</p>
        </div>

        <div class="toolbar">
          <div class="toolbar-left"></div>
          <div class="toolbar-right">
            <button class="btn btn-primary" onclick="showAddRouteModal()">
              <span class="fas fa-plus"></span>
              添加路由规则
            </button>
          </div>
        </div>

        <div class="card">
          \${_routesData.length === 0 ? \`
            <div style="text-align: center; padding: 64px 32px;">
              <div style="width: 80px; height: 80px; margin: 0 auto 24px; background: var(--bg-base); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span class="fas fa-code-branch" style="font-size: 2rem; color: var(--text-muted);"></span>
              </div>
              <div style="font-size: 1.25rem; font-weight: 600; margin-bottom: 8px;">暂无分类路由</div>
              <div style="font-size: 0.9rem; color: var(--text-muted);">为用户配置不同邮件分类使用的发送通道和账号</div>
            </div>
          \` : \`
            <div class="list-card">
              \${_routesData.map(function(r) {
                return '<div class="list-item">' +
                  '<div class="list-item-info">' +
                    '<div class="list-item-title">' +
                      '<span class="badge badge-info">' + esc(r.category) + '</span>' +
                      '<span style="margin-left: 8px; font-size: 0.85rem; color: var(--text-secondary);">' + esc(r.user_name) + ' (' + esc(r.user_email) + ')</span>' +
                    '</div>' +
                    '<div class="list-item-subtitle">通道: ' + esc(r.provider_name || r.provider_id) +
                      ' · 账号: ' + (r.account_email || '自动选择') +
                      ' · 优先级: ' + r.priority + '</div>' +
                  '</div>' +
                  '<div class="list-item-actions">' +
                    '<span class="badge ' + (r.enabled ? 'badge-success' : 'badge-muted') + '">' + (r.enabled ? '启用' : '禁用') + '</span>' +
                    '<button class="btn btn-sm btn-danger" data-rid="' + esc(r.id) + '" onclick="deleteAdminRoute(this.dataset.rid)">删除</button>' +
                  '</div>' +
                '</div>';
              }).join('')}
            </div>
          \`}
        </div>
      \`;
    }

    function showAddRouteModal() {
      // 并行获取数据
      Promise.all([
        api('/admin/tenants'),
        api('/admin/providers'),
        api('/admin/accounts')
      ]).then(function(results) {
        var users = results[0].data || [];
        var providers = results[1].data || [];
        var accounts = results[2].data || [];

        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = '<div class="modal">' +
          '<div class="modal-title">添加分类路由</div>' +
          '<div class="form-group">' +
            '<label class="form-label">用户 *</label>' +
            '<select class="form-select" id="ar-tenant">' +
              '<option value="">-- 选择用户 --</option>' +
              users.filter(function(t) { return t.status === 'active'; }).map(function(t) {
                return '<option value="' + esc(t.id) + '">' + esc(t.name) + ' (' + esc(t.email) + ')</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">分类 *</label>' +
            '<select class="form-select" id="ar-category">' +
              '<option value="VERIFY">VERIFY - 验证邮件</option>' +
              '<option value="NOTIFY">NOTIFY - 通知邮件</option>' +
              '<option value="MARKETING">MARKETING - 营销邮件</option>' +
              '<option value="SYSTEM">SYSTEM - 系统邮件</option>' +
            '</select>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">发送通道 *</label>' +
            '<select class="form-select" id="ar-provider" onchange="onRouteProviderChange(this.closest(\\\\'.modal-overlay\\\\'))">' +
              '<option value="">-- 选择通道 --</option>' +
              providers.filter(function(p) { return p.enabled; }).map(function(p) {
                return '<option value="' + esc(p.id) + '">' + esc(p.name) + ' (' + esc(p.type) + ')</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">发件账号（可选）</label>' +
            '<select class="form-select" id="ar-account">' +
              '<option value="">-- 自动选择 --</option>' +
            '</select>' +
            '<div class="form-hint">留空则由系统自动负载均衡选择，指定后该分类的邮件固定通过此账号发送</div>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">优先级</label>' +
            '<input class="form-input" id="ar-priority" type="number" value="0" min="0">' +
            '<div class="form-hint">数值越大优先级越高，同一用户同分类多条规则时取优先级最高的</div>' +
          '</div>' +
          '<div class="modal-footer">' +
            '<button class="btn btn-ghost" onclick="this.closest(\\\\'.modal-overlay\\\\').remove()">取消</button>' +
            '<button class="btn btn-primary" id="ar-save-btn">创建</button>' +
          '</div>' +
        '</div>';
        document.body.appendChild(overlay);

        // 缓存 accounts 数据用于通道切换时过滤账号
        overlay._accountsData = accounts;
        overlay._providersData = providers;

        overlay.querySelector('#ar-save-btn').addEventListener('click', async function() {
          var user_id = overlay.querySelector('#ar-tenant').value;
          var category = overlay.querySelector('#ar-category').value;
          var provider_id = overlay.querySelector('#ar-provider').value;
          var account_id = overlay.querySelector('#ar-account').value || null;
          var priority = parseInt(overlay.querySelector('#ar-priority').value || '0');

          if (!user_id || !category || !provider_id) { toast('请填写所有必填字段', 'error'); return; }

          var body = { user_id: user_id, category: category, provider_id: provider_id, priority: priority };
          if (account_id) body.account_id = account_id;

          var resp = await api('/admin/routes', { method: 'POST', body: JSON.stringify(body) });
          if (resp.success) { overlay.remove(); renderPage('routes'); toast('路由创建成功'); }
          else toast(resp.error, 'error');
        });

        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
      });
    }

    // 通道切换时过滤可选账号
    function onRouteProviderChange(overlay) {
      var providerId = overlay.querySelector('#ar-provider').value;
      var accounts = overlay._accountsData || [];
      var acctSelect = overlay.querySelector('#ar-account');
      acctSelect.innerHTML = '<option value="">-- 自动选择 --</option>';

      if (providerId) {
        var filtered = accounts.filter(function(a) { return a.provider_id === providerId && a.enabled; });
        filtered.forEach(function(a) {
          var opt = document.createElement('option');
          opt.value = a.id;
          opt.textContent = a.name + ' (' + a.email + ')';
          acctSelect.appendChild(opt);
        });
      }
    }

    async function deleteAdminRoute(id) {
      if (!confirm('确定删除此路由规则？此操作不可撤销。')) return;
      var resp = await api('/admin/routes/' + id, { method: 'DELETE' });
      if (resp.success) { renderPage('routes'); toast('路由已删除'); }
      else toast(resp.error, 'error');
    }

    // 创建用户
    function showCreateUserModal() {
      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = '<div class="modal">' +
        '<div class="modal-title">新建用户</div>' +
        '<div class="form-group">' +
          '<label class="form-label">姓名</label>' +
          '<input class="form-input" id="ct-name" placeholder="如：张三">' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">邮箱</label>' +
          '<input class="form-input" id="ct-email" type="email" placeholder="user@example.com">' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">密码（至少6位）</label>' +
          '<input class="form-input" id="ct-password" type="password" placeholder="至少6位密码">' +
        '</div>' +
        '<div class="form-group">' +
          '<label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">' +
            '<input type="checkbox" id="ct-super" style="accent-color: var(--primary);">' +
            '<span style="font-size: 0.9rem;">设为超级管理员</span>' +
          '</label>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-ghost" onclick="this.closest(\\'.modal-overlay\\').remove()">取消</button>' +
          '<button class="btn btn-primary" id="ct-save-btn">创建</button>' +
        '</div>' +
      '</div>';
      document.body.appendChild(overlay);

      overlay.querySelector('#ct-save-btn').addEventListener('click', async function() {
        var name = overlay.querySelector('#ct-name').value.trim();
        var email = overlay.querySelector('#ct-email').value.trim();
        var password = overlay.querySelector('#ct-password').value;
        var isSuper = overlay.querySelector('#ct-super').checked ? 1 : 0;
        if (!name || !email || !password) { toast('请填写所有字段', 'error'); return; }
        if (password.length < 6) { toast('密码至少需要6位', 'error'); return; }

        var resp = await api('/admin/tenants', { method: 'POST', body: JSON.stringify({ name: name, email: email, password: password, is_super_admin: isSuper }) });
        if (resp.success) {
          overlay.innerHTML = '<div class="modal" style="border-color: var(--success);">' +
            '<div style="text-align: center; margin-bottom: 24px;">' +
              '<div style="font-size: 3rem; margin-bottom: 16px;"><span class="fas fa-circle-check" style="color: var(--success);"></span></div>' +
              '<div class="modal-title" style="text-align: center;">用户创建成功！</div>' +
            '</div>' +
            '<p style="color: var(--text-muted); margin-bottom: 8px;">用户: <strong>' + esc(resp.data.user.name) + '</strong> (' + esc(resp.data.user.email) + ')</p>' +
            '<p style="color: var(--text-muted); margin-bottom: 12px;">API Key（仅显示一次）：</p>' +
            '<div class="code-block" style="margin-bottom: 24px;">' + esc(resp.data.api_key.key) + '</div>' +
            '<button class="btn btn-primary" onclick="this.closest(\\'.modal-overlay\\').remove(); renderPage(\\'tenants\\');" style="width: 100%;">关闭</button>' +
          '</div>';
          toast('用户创建成功');
        } else {
          toast(resp.error, 'error');
        }
      });
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    }

    // 模拟登录（使用签名临时令牌，24h有效，不创建永久API Key）
    async function impersonateUser(tid) {
      var resp = await api('/admin/tenants/' + tid + '/impersonate', { method: 'POST' });
      if (!resp.success) { toast(resp.error, 'error'); return; }

      var origKey = localStorage.getItem('teaven_admin_key') || '';

      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = '<div class="modal" style="border-color: var(--primary);">' +
        '<div style="text-align: center; margin-bottom: 24px;">' +
          '<div style="font-size: 3rem; margin-bottom: 16px;"><span class="fas fa-user-secret" style="color: var(--primary);"></span></div>' +
          '<div class="modal-title" style="text-align: center;">模拟登录</div>' +
        '</div>' +
        '<p style="color: var(--text-muted); margin-bottom: 8px;">用户: <strong>' + esc(resp.data.user.name) + '</strong> (' + esc(resp.data.user.email) + ')</p>' +
        '<p style="color: var(--text-muted); margin-bottom: 12px;">临时令牌（24小时有效，无需管理）：</p>' +
        '<div class="code-block" style="margin-bottom: 12px; font-size: 0.78rem;">' + esc(resp.data.impersonation_token) + '</div>' +
        '<p style="color: var(--warning); font-size: 0.78rem; margin-bottom: 16px;"><span class="fas fa-info-circle"></span> 令牌24小时后自动过期，无需手动清理。到期后需重新模拟登录。</p>' +
        '<div style="display: flex; gap: 12px; justify-content: flex-end;">' +
          '<button class="btn btn-ghost" onclick="this.closest(\\'.modal-overlay\\').remove()">取消</button>' +
          '<button class="btn btn-primary" id="impersonate-switch-btn">以此身份登录</button>' +
        '</div>' +
      '</div>';
      document.body.appendChild(overlay);

      overlay.querySelector('#impersonate-switch-btn').addEventListener('click', function() {
        localStorage.setItem('teaven_super_admin_key_backup', origKey);
        window.open('/dashboard?imp_token=' + encodeURIComponent(resp.data.impersonation_token), '_blank');
        overlay.remove();
      });
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
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
          '<div style="font-size: 1.5rem; font-weight: 600; margin-bottom: 8px;">超级管理员登录</div>' +
          '<div style="color: var(--text-muted); font-size: 0.9rem;">使用超级管理员账号登录</div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="form-group">' +
            '<label class="form-label">邮箱</label>' +
            '<input class="form-input" id="login-email" type="email" placeholder="admin@example.com" value="' + esc(localStorage.getItem('teaven_admin_email') || '') + '">' +
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
          '<div style="font-size: 3rem; margin-bottom: 16px;"><span class="fas fa-key" style="color: var(--primary);"></span></div>' +
          '<div style="font-size: 1.5rem; font-weight: 600; margin-bottom: 8px;">API Key 登录</div>' +
          '<div style="color: var(--text-muted); font-size: 0.9rem;">输入超级管理员的 API Key</div>' +
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

      localStorage.setItem('teaven_admin_email', email);

      fetch(API_BASE + '/setup/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      }).then(function(r) { return r.json(); }).then(function(resp) {
        if (resp.success) {
          var keys = resp.data.api_keys;
          var activeKey = keys.filter(function(k) { return k.enabled; })[0];
          if (activeKey) {
            fetch(API_BASE + '/setup/key-from-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: email, password: password, name: 'Admin Login' })
            }).then(function(r2) { return r2.json(); }).then(function(resp2) {
              if (resp2.success) {
                localStorage.setItem('teaven_admin_key', resp2.data.api_key.key);
                location.reload();
              } else {
                toast('请使用 API Key 登录', 'error');
                document.getElementById('main-content').innerHTML = apiKeyFallbackPage();
              }
            });
          } else {
            toast('没有可用的 API Key', 'error');
            btn.disabled = false;
            btn.textContent = '登 录';
          }
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

    function saveApiKey() {
      var key = document.getElementById('setup-key').value.trim();
      if (!key) { toast('请输入 API Key', 'error'); return; }
      localStorage.setItem('teaven_admin_key', key);
      location.reload();
    }

    function initPage() {
      return '<div style="max-width: 480px; margin: 100px auto;">' +
        '<div style="text-align: center; margin-bottom: 48px;">' +
          '<div style="font-size: 4rem; font-weight: 800; background: linear-gradient(135deg, var(--orange-400), var(--orange-600)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 16px;">Teaven</div>' +
          '<div style="font-size: 1.5rem; font-weight: 600; margin-bottom: 8px;">初始化超级管理员</div>' +
          '<div style="color: var(--text-muted); font-size: 0.9rem;">首次使用，请创建超级管理员账户</div>' +
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
          localStorage.setItem('teaven_admin_email', email);
          localStorage.setItem('teaven_admin_key', resp.data.api_key.key);
          var main = document.getElementById('main-content');
          main.innerHTML = '<div class="card" style="max-width: 560px; margin: 80px auto; border-color: var(--success);">' +
            '<div style="text-align: center; margin-bottom: 32px;">' +
              '<div style="font-size: 3rem; margin-bottom: 16px;"><span class="fas fa-circle-check" style="color: var(--success);"></span></div>' +
              '<div style="font-size: 1.5rem; font-weight: 600;">初始化成功！</div>' +
            '</div>' +
            '<p style="color: var(--text-muted); margin-bottom: 8px;">账户: <strong>' + esc(resp.data.user.email) + '</strong></p>' +
            '<p style="color: var(--text-muted); margin-bottom: 12px;">你的 API Key（<strong style="color: var(--danger);">已自动保存</strong>）：</p>' +
            '<div class="code-block" style="margin-bottom: 24px;">' + esc(resp.data.api_key.key) + '</div>' +
            '<button class="btn btn-primary btn-lg" onclick="location.reload()" style="width: 100%;">进入后台</button>' +
          '</div>';
        } else {
          toast(resp.error, 'error');
        }
      }).catch(function() { toast('网络错误，请重试', 'error'); });
    }

    // 初始化
    if (API_KEY) { renderPage('dashboard'); }
    else { document.getElementById('main-content').innerHTML = setupPage(); }
  </script>
</body>
</html>`;
}
