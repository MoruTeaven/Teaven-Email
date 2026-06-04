// Teaven Email - 全新橙色主题 超级管理员后台 HTML
// 设计风格：现代高端、橙色主题、超大字体层次、卡片式布局

export function getAdminHTML(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teaven Email - 超级管理员</title>
  <!-- Font Awesome Icons - 国内CDN -->
  <link rel="stylesheet" href="https://lib.baomitu.com/font-awesome/6.1.2/css/all.css">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%23f97316'/><text x='16' y='23' text-anchor='middle' font-size='20' font-weight='bold' fill='white'>T</text></svg>">
  <style>
    :root {
      /* 橙色主题色彩系统 - OKLCH */
      --orange-50: oklch(97% 0.02 50);
      --orange-100: oklch(93% 0.04 50);
      --orange-200: oklch(86% 0.08 50);
      --orange-300: oklch(78% 0.12 48);
      --orange-400: oklch(70% 0.16 45);
      --orange-500: oklch(65% 0.18 42);
      --orange-600: oklch(55% 0.16 38);
      --orange-700: oklch(48% 0.14 35);
      --orange-800: oklch(40% 0.10 32);

      /* 主色 */
      --primary: var(--orange-500);
      --primary-hover: var(--orange-600);
      --primary-glow: oklch(65% 0.25 42 / 0.3);

      /* 深色背景 - 暖色调灰 */
      --bg-base: oklch(14% 0.015 45);
      --bg-elevated: oklch(18% 0.018 45);
      --bg-card: oklch(22% 0.02 45);
      --bg-card-hover: oklch(26% 0.022 45);
      --bg-input: oklch(16% 0.015 45);

      /* 边框 */
      --border: oklch(30% 0.015 45);
      --border-focus: var(--primary);

      /* 文字 */
      --text-primary: oklch(98% 0.01 50);
      --text-secondary: oklch(70% 0.02 50);
      --text-muted: oklch(50% 0.015 45);

      /* 语义色 */
      --success: oklch(70% 0.15 145);
      --warning: oklch(80% 0.15 85);
      --danger: oklch(65% 0.2 25);
      --info: oklch(75% 0.12 220);

      /* 圆角 */
      --radius-sm: 6px;
      --radius-md: 12px;
      --radius-lg: 20px;
      --radius-xl: 28px;

      /* 阴影 - 橙色光晕 */
      --shadow-sm: 0 2px 8px oklch(0% 0 0 / 0.3);
      --shadow-md: 0 8px 24px oklch(0% 0 0 / 0.4);
      --shadow-lg: 0 16px 48px oklch(0% 0 0 / 0.5);
      --shadow-glow: 0 0 40px var(--primary-glow);

      /* 过渡 */
      --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
      --transition-fast: 150ms var(--ease-out-quart);
      --transition-normal: 300ms var(--ease-out-quart);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html {
      font-size: 16px;
      scroll-behavior: smooth;
    }

    body {
      font-family: "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg-base);
      color: var(--text-primary);
      min-height: 100vh;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    /* ========== 布局 ========== */
    .app {
      display: flex;
      min-height: 100vh;
    }

    /* 侧边栏 */
    .sidebar {
      width: 280px;
      background: var(--bg-elevated);
      border-right: 1px solid var(--border);
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      z-index: 100;
    }

    .sidebar-header {
      padding: 32px 28px;
      border-bottom: 1px solid var(--border);
    }

    .logo {
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, var(--orange-400), var(--orange-600));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .logo-sub {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--primary);
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin-top: 4px;
    }

    .sidebar-nav {
      flex: 1;
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 18px;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
      text-decoration: none;
    }

    .nav-item .icon {
      font-size: 1.25rem;
      width: 24px;
      text-align: center;
      flex-shrink: 0;
    }

    .nav-item:hover {
      background: var(--bg-card);
      color: var(--text-primary);
    }

    .nav-item.active {
      background: linear-gradient(135deg, oklch(55% 0.18 42 / 0.2), oklch(55% 0.18 42 / 0.05));
      color: var(--primary);
      border: 1px solid oklch(55% 0.18 42 / 0.3);
    }

    .nav-item.active .icon {
      color: var(--primary);
    }

    .sidebar-footer {
      padding: 24px 28px;
      border-top: 1px solid var(--border);
    }

    .admin-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: oklch(55% 0.18 42 / 0.15);
      border: 1px solid oklch(55% 0.18 42 / 0.3);
      border-radius: 100px;
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* 主内容区 */
    .main {
      flex: 1;
      margin-left: 280px;
      padding: 48px 56px;
      max-width: 1400px;
    }

    /* 页面标题 */
    .page-header {
      margin-bottom: 48px;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      line-height: 1.2;
    }

    .page-subtitle {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-top: 8px;
      letter-spacing: 0.05em;
    }

    /* ========== 卡片系统 ========== */
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 28px;
      transition: all var(--transition-normal);
    }

    .card:hover {
      border-color: oklch(40% 0.12 42 / 0.3);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .card-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .card-subtitle {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 4px;
    }

    /* ========== 统计卡片 ========== */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 28px;
      position: relative;
      overflow: hidden;
      transition: all var(--transition-normal);
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--primary), transparent);
      opacity: 0.6;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin-bottom: 20px;
    }

    .stat-icon.orange {
      background: oklch(55% 0.18 42 / 0.15);
      color: var(--primary);
    }

    .stat-icon.green {
      background: oklch(70% 0.15 145 / 0.15);
      color: var(--success);
    }

    .stat-icon.red {
      background: oklch(65% 0.2 25 / 0.15);
      color: var(--danger);
    }

    .stat-icon.blue {
      background: oklch(75% 0.12 220 / 0.15);
      color: var(--info);
    }

    .stat-icon.purple {
      background: oklch(70% 0.18 300 / 0.15);
      color: oklch(70% 0.18 300);
    }

    .stat-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 2.75rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      line-height: 1;
    }

    .stat-value.orange { color: var(--primary); }
    .stat-value.green { color: var(--success); }
    .stat-value.red { color: var(--danger); }
    .stat-value.blue { color: var(--info); }
    .stat-value.purple { color: oklch(70% 0.18 300); }

    .stat-change {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* ========== 按钮 ========== */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: var(--radius-md);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all var(--transition-fast);
      text-decoration: none;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--orange-500), var(--orange-600));
      color: white;
      box-shadow: 0 4px 16px oklch(55% 0.18 42 / 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px oklch(55% 0.18 42 / 0.4);
    }

    .btn-secondary {
      background: var(--bg-card);
      color: var(--text-primary);
      border: 1px solid var(--border);
    }

    .btn-secondary:hover {
      background: var(--bg-card-hover);
      border-color: var(--primary);
    }

    .btn-danger {
      background: transparent;
      color: var(--danger);
      border: 1px solid var(--danger);
    }

    .btn-danger:hover {
      background: var(--danger);
      color: white;
    }

    .btn-ghost {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border);
    }

    .btn-ghost:hover {
      background: var(--bg-card);
      color: var(--text-primary);
    }

    .btn-sm {
      padding: 8px 16px;
      font-size: 0.8rem;
    }

    .btn-lg {
      padding: 16px 32px;
      font-size: 1rem;
    }

    /* ========== 表单 ========== */
    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    .form-input,
    .form-select,
    .form-textarea {
      width: 100%;
      padding: 14px 18px;
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: 0.95rem;
      outline: none;
      transition: all var(--transition-fast);
    }

    .form-input:focus,
    .form-select:focus,
    .form-textarea:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px oklch(55% 0.18 42 / 0.15);
    }

    .form-input::placeholder {
      color: var(--text-muted);
    }

    .form-textarea {
      min-height: 200px;
      resize: vertical;
      font-family: "JetBrains Mono", "Fira Code", monospace;
    }

    .form-hint {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 6px;
    }

    /* ========== 徽章 ========== */
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge-success {
      background: oklch(70% 0.15 145 / 0.15);
      color: var(--success);
    }

    .badge-warning {
      background: oklch(80% 0.15 85 / 0.15);
      color: var(--warning);
    }

    .badge-danger {
      background: oklch(65% 0.2 25 / 0.15);
      color: var(--danger);
    }

    .badge-info {
      background: oklch(55% 0.18 42 / 0.15);
      color: var(--primary);
    }

    .badge-muted {
      background: oklch(50% 0.015 45 / 0.5);
      color: var(--text-muted);
    }

    .badge-super {
      background: oklch(55% 0.18 42 / 0.25);
      color: var(--primary);
      font-size: 0.65rem;
      padding: 2px 8px;
      margin-left: 8px;
    }

    /* ========== 模态框 ========== */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: oklch(0% 0 0 / 0.7);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 24px;
    }

    .modal {
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 36px;
      width: 100%;
      max-width: 640px;
      max-height: 90vh;
      overflow-y: auto;
      animation: modalIn 0.3s var(--ease-out-quart);
    }

    @keyframes modalIn {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 24px;
    }

    .modal-footer {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
    }

    /* ========== Toast ========== */
    .toast {
      position: fixed;
      top: 32px;
      right: 32px;
      padding: 16px 28px;
      border-radius: var(--radius-md);
      color: white;
      font-size: 0.9rem;
      font-weight: 500;
      z-index: 2000;
      animation: toastIn 0.4s var(--ease-out-quart);
      box-shadow: var(--shadow-lg);
    }

    .toast-success {
      background: var(--success);
    }

    .toast-error {
      background: var(--danger);
    }

    @keyframes toastIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    /* ========== 列表卡片 ========== */
    .list-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .list-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      transition: all var(--transition-fast);
    }

    .list-item:last-child {
      border-bottom: none;
    }

    .list-item:hover {
      background: var(--bg-card-hover);
    }

    .list-item-info {
      flex: 1;
    }

    .list-item-title {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
    }

    .list-item-subtitle {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .list-item-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    /* ========== 工具栏 ========== */
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* ========== 代码块 ========== */
    .code-block {
      background: var(--bg-base);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 20px;
      font-family: "JetBrains Mono", "Fira Code", monospace;
      font-size: 0.85rem;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
      color: var(--warning);
    }

    .key-highlight {
      background: oklch(55% 0.18 42 / 0.2);
      color: var(--primary);
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
    }

    /* ========== 提供商卡片 ========== */
    .provider-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .provider-card {
      background: var(--bg-base);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 20px;
      transition: all var(--transition-fast);
    }

    .provider-card:hover {
      border-color: oklch(40% 0.12 42 / 0.3);
    }

    .provider-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .provider-name {
      font-weight: 600;
      font-size: 1.05rem;
    }

    .provider-config {
      color: var(--text-muted);
      font-size: 0.8rem;
      margin-bottom: 12px;
    }

    /* ========== 响应式 ========== */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform var(--transition-normal);
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .main {
        margin-left: 0;
        padding: 24px;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .page-title {
        font-size: 1.75rem;
      }

      .toolbar {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .provider-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="app">
    <nav class="sidebar">
      <div class="sidebar-header">
        <div class="logo">Teaven</div>
        <div class="logo-sub">Admin Panel</div>
      </div>
      <div class="sidebar-nav">
        <button class="nav-item active" data-page="overview">
          <span class="icon fas fa-gauge-high"></span>
          全局总览
        </button>
        <button class="nav-item" data-page="tenants">
          <span class="icon fas fa-users"></span>
          租户管理
        </button>
        <button class="nav-item" data-page="providers">
          <span class="icon fas fa-plug"></span>
          发送通道
        </button>
        <button class="nav-item" data-page="accounts">
          <span class="icon fas fa-envelope"></span>
          发件账号
        </button>
      </div>
      <div class="sidebar-footer">
        <div class="admin-badge">
          <span class="fas fa-crown"></span>
          超级管理员
        </div>
      </div>
    </nav>
    <main class="main" id="main-content"></main>
  </div>
  <div id="toast-container"></div>

  <script>
    var API_BASE = '/v1';
    var API_KEY = localStorage.getItem('teaven_admin_key') || '';
    var _accountsById = {};

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
      var el = document.createElement('div');
      el.className = 'toast toast-' + type;
      el.textContent = msg;
      c.appendChild(el);
      setTimeout(function() { el.remove(); }, 3000);
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
      var main = document.getElementById('main-content');
      switch (page) {
        case 'overview': renderOverview(main); break;
        case 'tenants': renderTenants(main); break;
        case 'providers': renderProviders(main); break;
        case 'accounts': renderAllAccounts(main); break;
      }
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
            <div class="stat-label">租户数</div>
            <div class="stat-value orange">\${d.tenants}</div>
            <div class="stat-change">个活跃租户</div>
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
              <div style="font-size: 2.5rem; font-weight: 800; color: var(--primary);">\${d.tenants}</div>
              <div style="font-size: 1.1rem; font-weight: 600; margin-top: 8px;">活跃租户</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Active Tenants</div>
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

    // 租户管理
    async function renderTenants(main) {
      var resp = await api('/admin/tenants');
      var tenants = resp.data || [];

      main.innerHTML = \`
        <div class="page-header">
          <h1 class="page-title">租户管理</h1>
          <p class="page-subtitle">TENANT MANAGEMENT</p>
        </div>

        <div class="toolbar">
          <div class="toolbar-left"></div>
          <div class="toolbar-right">
            <button class="btn btn-primary" onclick="showCreateTenantModal()">
              <span class="fas fa-plus"></span>
              新建租户
            </button>
          </div>
        </div>

        <div class="card">
          \${tenants.length === 0 ? \`
            <div style="text-align: center; padding: 64px 32px;">
              <div style="width: 80px; height: 80px; margin: 0 auto 24px; background: var(--bg-base); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span class="fas fa-users" style="font-size: 2rem; color: var(--text-muted);"></span>
              </div>
              <div style="font-size: 1.25rem; font-weight: 600; margin-bottom: 8px;">暂无租户</div>
              <div style="font-size: 0.9rem; color: var(--text-muted);">创建第一个租户开始使用平台</div>
            </div>
          \` : \`
            <div class="list-card">
              \${tenants.map(function(t) {
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
                    '<button class="btn btn-sm btn-ghost" data-tid="' + esc(t.id) + '" data-tstatus="' + (t.status === 'active' ? 'disabled' : 'active') + '" onclick="toggleTenant(this.dataset.tid, this.dataset.tstatus)">' + (t.status === 'active' ? '禁用' : '启用') + '</button>' +
                    '<button class="btn btn-sm btn-secondary" data-tid="' + esc(t.id) + '" onclick="impersonateTenant(this.dataset.tid)">模拟登录</button>' +
                  '</div>' +
                '</div>';
              }).join('')}
            </div>
          \`}
        </div>
      \`;
    }

    async function toggleTenant(id, status) {
      await api('/admin/tenants/' + id, { method: 'PUT', body: JSON.stringify({ status: status }) });
      renderPage('tenants');
      toast('租户状态已更新');
    }

    // 发送通道
    async function renderProviders(main) {
      var resp = await api('/admin/providers');
      var providers = resp.data || [];

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
          '<select class="form-select" id="p-type" onchange="toggleProviderConfig(this.closest(\'.modal-overlay\'))">' +
            '<option value="smtp">SMTP</option>' +
            '<option value="api">第三方 API</option>' +
            '<option value="cloudflare_email">Cloudflare Email</option>' +
          '</select>' +
        '</div>' +
        '<div id="p-config-area"></div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-ghost" onclick="this.closest(\'.modal-overlay\').remove()">取消</button>' +
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
        area.innerHTML = '<div class="form-group"><label class="form-label">Provider 名称</label><select class="form-select" id="pc-pname" onchange="toggleApiProviderFields(this.closest(\'.modal-overlay\'))"><option value="sendgrid">SendGrid</option><option value="mailgun">Mailgun</option><option value="resend">Resend</option><option value="ahasend">AhaSend</option><option value="generic">通用</option></select></div>' +
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
            '<button class="btn btn-ghost" onclick="this.closest(\'.modal-overlay\').remove()">取消</button>' +
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
            '<button class="btn btn-ghost" onclick="this.closest(\'.modal-overlay\').remove()">取消</button>' +
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
          '<button class="btn btn-ghost" onclick="this.closest(\'.modal-overlay\').remove()">取消</button>' +
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

    // 创建租户
    function showCreateTenantModal() {
      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = '<div class="modal">' +
        '<div class="modal-title">新建租户</div>' +
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
          '<button class="btn btn-ghost" onclick="this.closest(\'.modal-overlay\').remove()">取消</button>' +
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
              '<div class="modal-title" style="text-align: center;">租户创建成功！</div>' +
            '</div>' +
            '<p style="color: var(--text-muted); margin-bottom: 8px;">租户: <strong>' + esc(resp.data.user.name) + '</strong> (' + esc(resp.data.user.email) + ')</p>' +
            '<p style="color: var(--text-muted); margin-bottom: 12px;">API Key（仅显示一次）：</p>' +
            '<div class="code-block" style="margin-bottom: 24px;">' + esc(resp.data.api_key.key) + '</div>' +
            '<button class="btn btn-primary" onclick="this.closest(\'.modal-overlay\').remove(); renderPage(\'tenants\');" style="width: 100%;">关闭</button>' +
          '</div>';
          toast('租户创建成功');
        } else {
          toast(resp.error, 'error');
        }
      });
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    }

    // 模拟登录
    async function impersonateTenant(tid) {
      var resp = await api('/admin/tenants/' + tid + '/impersonate', { method: 'POST' });
      if (!resp.success) { toast(resp.error, 'error'); return; }

      var origKey = localStorage.getItem('teaven_admin_key') || '';

      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = '<div class="modal" style="border-color: var(--primary);">' +
        '<div style="text-align: center; margin-bottom: 24px;">' +
          '<div style="font-size: 3rem; margin-bottom: 16px;"><span class="fas fa-user" style="color: var(--primary);"></span></div>' +
          '<div class="modal-title" style="text-align: center;">模拟登录</div>' +
        '</div>' +
        '<p style="color: var(--text-muted); margin-bottom: 8px;">租户: <strong>' + esc(resp.data.user.name) + '</strong> (' + esc(resp.data.user.email) + ')</p>' +
        '<p style="color: var(--text-muted); margin-bottom: 12px;">生成的 API Key（仅显示一次）：</p>' +
        '<div class="code-block" style="margin-bottom: 16px;">' + esc(resp.data.api_key.key) + '</div>' +
        '<p style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 16px;">切换后将进入该租户的管理后台，原始超管 Key 已暂存</p>' +
        '<div style="display: flex; gap: 12px; justify-content: flex-end;">' +
          '<button class="btn btn-ghost" onclick="this.closest(\'.modal-overlay\').remove()">取消</button>' +
          '<button class="btn btn-primary" id="impersonate-switch-btn">以此身份登录</button>' +
        '</div>' +
      '</div>';
      document.body.appendChild(overlay);

      overlay.querySelector('#impersonate-switch-btn').addEventListener('click', function() {
        localStorage.setItem('teaven_super_admin_key_backup', origKey);
        localStorage.setItem('teaven_api_key', resp.data.api_key.key);
        localStorage.setItem('teaven_email', resp.data.user.email);
        window.location.href = '/dashboard';
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
    if (API_KEY) { renderPage('overview'); }
    else { document.getElementById('main-content').innerHTML = setupPage(); }
  </script>
</body>
</html>`;
}
